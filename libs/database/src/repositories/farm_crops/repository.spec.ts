import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '../../../prisma/generated/client';
import { DatabaseService } from '../../database.service';
import { FarmCropsRepository } from './repository.service';

describe('FarmCropsRepository', () => {
  let repository: FarmCropsRepository;
  let database: any;
  let txFarmCrops: { upsert: jest.Mock };

  const uuid = '00000000-0000-0000-0000-000000000001';

  beforeEach(async () => {
    txFarmCrops = { upsert: jest.fn() };

    database = {
      farm_crops: {
        findFirst: jest.fn(),
        update: jest.fn(),
        groupBy: jest.fn(),
      },
      errorHandler: jest.fn(),
      $transaction: jest.fn((cb: any) => cb({ farm_crops: txFarmCrops })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FarmCropsRepository,
        { provide: DatabaseService, useValue: database },
      ],
    }).compile();

    repository = module.get(FarmCropsRepository);
  });

  describe('getOneById', () => {
    it('should query non-deleted crops by id', async () => {
      const expected = { id: uuid } as any;
      database.farm_crops.findFirst.mockResolvedValue(expected);

      const result = await repository.getOneById({ id: uuid });

      const args = database.farm_crops.findFirst.mock.calls[0][0];
      expect(args.where).toEqual({ id: uuid, deleted: false });
      expect(result).toBe(expected);
    });
  });

  describe('softDeleteById', () => {
    it('should mark deleted=true and return id+owner_id+property_id+harvest_id', async () => {
      const expected = {
        id: uuid,
        owner_id: uuid,
        property_id: uuid,
        harvest_id: uuid,
      };
      database.farm_crops.update.mockResolvedValue(expected);

      const result = await repository.softDeleteById({ id: uuid });

      expect(database.farm_crops.update).toHaveBeenCalledWith({
        data: { deleted: true },
        where: { id: uuid },
        select: {
          id: true,
          owner_id: true,
          property_id: true,
          harvest_id: true,
        },
      });
      expect(result).toBe(expected);
    });
  });

  describe('updateOneById', () => {
    it('should normalize null metadata to Prisma.DbNull', async () => {
      database.farm_crops.update.mockResolvedValue({
        id: uuid,
        owner_id: uuid,
        property_id: uuid,
        harvest_id: uuid,
      });

      await repository.updateOneById({
        id: uuid,
        alias: 'milho',
        metadata: null,
      });

      expect(database.farm_crops.update).toHaveBeenCalledWith({
        data: { alias: 'milho', metadata: Prisma.DbNull },
        where: { id: uuid, deleted: false },
        select: {
          id: true,
          owner_id: true,
          property_id: true,
          harvest_id: true,
        },
      });
    });
  });

  describe('getStats', () => {
    it('should aggregate count and area_arable grouped by alias', async () => {
      database.farm_crops.groupBy.mockResolvedValue([
        { alias: 'pepino', _count: { _all: 1 }, _sum: { area_arable: 50 } },
        { alias: 'batata', _count: { _all: 1 }, _sum: { area_arable: 50 } },
      ]);

      const result = await repository.getStats();

      expect(database.farm_crops.groupBy).toHaveBeenCalledWith({
        by: ['alias'],
        where: { deleted: false },
        _count: { _all: true },
        _sum: { area_arable: true },
      });
      expect(result).toEqual({
        total_crops: 2,
        total_area_arable: 100,
        crops: [
          { alias: 'pepino', area_arable: 50 },
          { alias: 'batata', area_arable: 50 },
        ],
      });
    });

    it('should default sums to 0 when prisma returns null aggregates', async () => {
      database.farm_crops.groupBy.mockResolvedValue([
        { alias: 'pepino', _count: { _all: 0 }, _sum: { area_arable: null } },
      ]);

      const result = await repository.getStats();

      expect(result).toEqual({
        total_crops: 0,
        total_area_arable: 0,
        crops: [{ alias: 'pepino', area_arable: 0 }],
      });
    });

    it('should return zeroed totals and empty array when prisma throws', async () => {
      const error = new Error('boom');
      database.farm_crops.groupBy.mockRejectedValue(error);

      const result = await repository.getStats();

      expect(database.errorHandler).toHaveBeenCalledWith(error);
      expect(result).toEqual({
        total_crops: 0,
        total_area_arable: 0,
        crops: [],
      });
    });
  });

  describe('createMany', () => {
    it('should upsert each item by (harvest_id, alias) inside a transaction', async () => {
      const items = [
        {
          owner_id: uuid,
          property_id: uuid,
          harvest_id: uuid,
          alias: 'soja',
          area_arable: 250,
          created_at: new Date(),
        },
      ];
      txFarmCrops.upsert.mockResolvedValueOnce({ id: uuid, alias: 'soja' });

      const result = await repository.createMany(items);

      expect(database.$transaction).toHaveBeenCalledTimes(1);
      const callArgs = txFarmCrops.upsert.mock.calls[0][0];
      expect(callArgs.where).toEqual({
        harvest_id_alias: { harvest_id: uuid, alias: 'soja' },
      });
      expect(result).toEqual([{ id: uuid, alias: 'soja' }]);
    });
  });
});
