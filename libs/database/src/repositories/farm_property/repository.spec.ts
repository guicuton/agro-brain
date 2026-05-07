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
        update: jest.fn(),
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
});
