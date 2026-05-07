import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '../../../prisma/generated/client';
import { DatabaseService } from '../../database.service';
import { FarmHarvestRepository } from './repository.service';

describe('FarmHarvestRepository', () => {
  let repository: FarmHarvestRepository;
  let database: any;
  let txFarmHarvest: { upsert: jest.Mock };

  const uuid = '00000000-0000-0000-0000-000000000001';

  beforeEach(async () => {
    txFarmHarvest = { upsert: jest.fn() };

    database = {
      farm_harvest: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      errorHandler: jest.fn(),
      $transaction: jest.fn((cb: any) => cb({ farm_harvest: txFarmHarvest })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FarmHarvestRepository,
        { provide: DatabaseService, useValue: database },
      ],
    }).compile();

    repository = module.get(FarmHarvestRepository);
  });

  describe('getOneById', () => {
    it('should query non-deleted harvests by id', async () => {
      const expected = { id: uuid } as any;
      database.farm_harvest.findFirst.mockResolvedValue(expected);

      const result = await repository.getOneById({ id: uuid });

      const args = database.farm_harvest.findFirst.mock.calls[0][0];
      expect(args.where).toEqual({ id: uuid, deleted: false });
      expect(result).toBe(expected);
    });
  });

  describe('getRelationsById', () => {
    it('should return the _count object', async () => {
      database.farm_harvest.findFirst.mockResolvedValue({
        _count: { crops: 4 },
      });

      const result = await repository.getRelationsById({ id: uuid });

      expect(result).toEqual({ crops: 4 });
    });
  });

  describe('softDeleteById', () => {
    it('should mark deleted=true and return id, owner_id and property_id', async () => {
      const expected = { id: uuid, owner_id: uuid, property_id: uuid };
      database.farm_harvest.update.mockResolvedValue(expected);

      const result = await repository.softDeleteById({ id: uuid });

      expect(database.farm_harvest.update).toHaveBeenCalledWith({
        data: { deleted: true },
        where: { id: uuid },
        select: { id: true, owner_id: true, property_id: true },
      });
      expect(result).toBe(expected);
    });
  });

  describe('updateOneById', () => {
    it('should normalize null metadata to Prisma.DbNull', async () => {
      database.farm_harvest.update.mockResolvedValue({
        id: uuid,
        owner_id: uuid,
        property_id: uuid,
      });

      await repository.updateOneById({
        id: uuid,
        crop: 2026,
        metadata: null,
      });

      expect(database.farm_harvest.update).toHaveBeenCalledWith({
        data: { crop: 2026, metadata: Prisma.DbNull },
        where: { id: uuid, deleted: false },
        select: { id: true, owner_id: true, property_id: true },
      });
    });
  });

  describe('createMany', () => {
    it('should upsert each item by (property_id, crop) inside a transaction', async () => {
      const items = [
        {
          owner_id: uuid,
          property_id: uuid,
          crop: 2025,
          created_at: new Date(),
        },
      ];
      txFarmHarvest.upsert.mockResolvedValueOnce({ id: uuid, crop: 2025 });

      const result = await repository.createMany(items);

      expect(database.$transaction).toHaveBeenCalledTimes(1);
      const callArgs = txFarmHarvest.upsert.mock.calls[0][0];
      expect(callArgs.where).toEqual({
        property_id_crop: { property_id: uuid, crop: 2025 },
      });
      expect(result).toEqual([{ id: uuid, crop: 2025 }]);
    });
  });
});
