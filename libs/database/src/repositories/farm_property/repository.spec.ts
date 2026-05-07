import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '../../../prisma/generated/client';
import { AREA_TYPE } from '../../../prisma/generated/enums';
import { DatabaseService } from '../../database.service';
import { FarmPropertyRepository } from './repository.service';

describe('FarmPropertyRepository', () => {
  let repository: FarmPropertyRepository;
  let database: any;
  let txFarmProperty: { upsert: jest.Mock };

  const uuid = '00000000-0000-0000-0000-000000000001';

  beforeEach(async () => {
    txFarmProperty = { upsert: jest.fn() };

    database = {
      farm_property: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        groupBy: jest.fn(),
      },
      errorHandler: jest.fn(),
      $transaction: jest.fn((cb: any) => cb({ farm_property: txFarmProperty })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FarmPropertyRepository,
        { provide: DatabaseService, useValue: database },
      ],
    }).compile();

    repository = module.get(FarmPropertyRepository);
  });

  describe('getAreasById', () => {
    it('should query the property areas and return the row', async () => {
      const expected = {
        area_total: 1000,
        area_arable: 700,
        area_vegetation: 300,
        area_type: AREA_TYPE.HECTAR,
        crops: [{ area_arable: 100 }],
      };
      database.farm_property.findFirst.mockResolvedValue(expected);

      const result = await repository.getAreasById({ id: uuid });

      const args = database.farm_property.findFirst.mock.calls[0][0];
      expect(args.where).toEqual({ id: uuid, deleted: false });
      expect(result).toBe(expected);
    });
  });

  describe('getOneById', () => {
    it('should query non-deleted properties by id', async () => {
      const expected = { id: uuid } as any;
      database.farm_property.findFirst.mockResolvedValue(expected);

      const result = await repository.getOneById({ id: uuid });

      const args = database.farm_property.findFirst.mock.calls[0][0];
      expect(args.where).toEqual({ id: uuid, deleted: false });
      expect(result).toBe(expected);
    });
  });

  describe('getRelationsById', () => {
    it('should return the _count object', async () => {
      database.farm_property.findFirst.mockResolvedValue({
        _count: { harvests: 5, crops: 9 },
      });

      const result = await repository.getRelationsById({ id: uuid });

      expect(result).toEqual({ harvests: 5, crops: 9 });
    });
  });

  describe('softDeleteById', () => {
    it('should mark deleted=true and return the id', async () => {
      const expected = { id: uuid };
      database.farm_property.update.mockResolvedValue(expected);

      const result = await repository.softDeleteById({ id: uuid });

      expect(database.farm_property.update).toHaveBeenCalledWith({
        data: { deleted: true },
        where: { id: uuid },
        select: { id: true },
      });
      expect(result).toBe(expected);
    });
  });

  describe('updateOneById', () => {
    it('should normalize null metadata to Prisma.DbNull', async () => {
      const expected = { id: uuid };
      database.farm_property.update.mockResolvedValue(expected);

      await repository.updateOneById({
        id: uuid,
        alias: 'fazenda',
        metadata: null,
      });

      expect(database.farm_property.update).toHaveBeenCalledWith({
        data: { alias: 'fazenda', metadata: Prisma.DbNull },
        where: { id: uuid, deleted: false },
        select: { id: true },
      });
    });

    it('should keep metadata as-is when not null', async () => {
      const meta = { soil: 'clay' };
      database.farm_property.update.mockResolvedValue({ id: uuid });

      await repository.updateOneById({ id: uuid, metadata: meta });

      expect(database.farm_property.update).toHaveBeenCalledWith({
        data: { metadata: meta },
        where: { id: uuid, deleted: false },
        select: { id: true },
      });
    });
  });

  describe('createMany', () => {
    it('should upsert each item by (owner_id, alias) inside a transaction', async () => {
      const items = [
        {
          owner_id: uuid,
          alias: 'a',
          area_total: 100,
          area_arable: 60,
          area_vegetation: 40,
          area_type: AREA_TYPE.HECTAR,
          city: 'c',
          state: 's',
          country: 'br',
          created_at: new Date(),
        },
      ];
      txFarmProperty.upsert.mockResolvedValueOnce({ id: uuid, alias: 'a' });

      const result = await repository.createMany(items);

      expect(database.$transaction).toHaveBeenCalledTimes(1);
      expect(txFarmProperty.upsert).toHaveBeenCalledTimes(1);
      const callArgs = txFarmProperty.upsert.mock.calls[0][0];
      expect(callArgs.where).toEqual({
        owner_id_alias: { owner_id: uuid, alias: 'a' },
      });
      expect(result).toEqual([{ id: uuid, alias: 'a' }]);
    });
  });

  describe('search', () => {
    const expectedSelect = {
      id: true,
      owner: {
        select: {
          id: true,
          fullname: true,
        },
      },
      alias: true,
      area_total: true,
      area_arable: true,
      area_vegetation: true,
      area_type: true,
      city: true,
      state: true,
      country: true,
      metadata: true,
      created_at: true,
      updated_at: true,
    };

    it('should add a contains+insensitive filter for each provided field', async () => {
      const rows = [{ id: uuid }] as any;
      database.farm_property.findMany.mockResolvedValue(rows);

      const result = await repository.findManyDynamic({
        alias: 'fazenda boa vista',
        owner_id: uuid,
        city: 'sao',
        state: 'sp',
      });

      expect(database.farm_property.findMany).toHaveBeenCalledTimes(1);
      expect(database.farm_property.findMany).toHaveBeenCalledWith({
        where: {
          deleted: false,
          alias: { contains: 'fazenda boa vista', mode: 'insensitive' },
          owner_id: uuid,
          city: { contains: 'sao', mode: 'insensitive' },
          state: { contains: 'sp', mode: 'insensitive' },
        },
        select: expectedSelect,
      });
      expect(result).toBe(rows);
    });

    it('should omit absent fields from the where clause', async () => {
      database.farm_property.findMany.mockResolvedValue([]);

      await repository.findManyDynamic({ alias: 'fazenda do joao' });

      expect(database.farm_property.findMany).toHaveBeenCalledWith({
        where: {
          deleted: false,
          alias: { contains: 'fazenda do joao', mode: 'insensitive' },
        },
        select: expectedSelect,
      });
    });

    it('should query only by deleted:false when no fields are provided', async () => {
      database.farm_property.findMany.mockResolvedValue([]);

      await repository.findManyDynamic({});

      expect(database.farm_property.findMany).toHaveBeenCalledWith({
        where: { deleted: false },
        select: expectedSelect,
      });
    });

    it('should return an empty array and call errorHandler when prisma throws', async () => {
      const error = new Error('boom');
      database.farm_property.findMany.mockRejectedValue(error);

      const result = await repository.findManyDynamic({
        alias: 'fazenda do joaoo',
      });

      expect(database.errorHandler).toHaveBeenCalledWith(error);
      expect(result).toEqual([]);
    });
  });

  describe('getStats', () => {
    it('should aggregate count and area_total grouped by state', async () => {
      database.farm_property.groupBy.mockResolvedValue([
        { state: 'sp', _count: { _all: 20 }, _sum: { area_total: 1500 } },
        { state: 'mg', _count: { _all: 80 }, _sum: { area_total: 3500 } },
      ]);

      const result = await repository.getStats();

      expect(database.farm_property.groupBy).toHaveBeenCalledWith({
        by: ['state'],
        where: { deleted: false },
        _count: { _all: true },
        _sum: { area_total: true },
      });
      expect(result).toEqual({
        properties: {
          total: 100,
          states: [
            { state: 'sp', value: 20 },
            { state: 'mg', value: 80 },
          ],
        },
        properties_areas: {
          total: 5000,
          states: [
            { state: 'sp', value: 1500 },
            { state: 'mg', value: 3500 },
          ],
        },
      });
    });

    it('should default sums to 0 when prisma returns null aggregates', async () => {
      database.farm_property.groupBy.mockResolvedValue([
        { state: 'sp', _count: { _all: 0 }, _sum: { area_total: null } },
      ]);

      const result = await repository.getStats();

      expect(result).toEqual({
        properties: { total: 0, states: [{ state: 'sp', value: 0 }] },
        properties_areas: { total: 0, states: [{ state: 'sp', value: 0 }] },
      });
    });

    it('should return zeroed totals and empty arrays when prisma throws', async () => {
      const error = new Error('boom');
      database.farm_property.groupBy.mockRejectedValue(error);

      const result = await repository.getStats();

      expect(database.errorHandler).toHaveBeenCalledWith(error);
      expect(result).toEqual({
        properties: { total: 0, states: [] },
        properties_areas: { total: 0, states: [] },
      });
    });
  });
});
