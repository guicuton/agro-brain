import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../../database.service';
import { FarmOwnerRepository } from './repository.service';

describe('FarmOwnerRepository', () => {
  let repository: FarmOwnerRepository;
  let database: any;
  let txFarmOwner: { upsert: jest.Mock };

  const uuid = '00000000-0000-0000-0000-000000000001';

  beforeEach(async () => {
    txFarmOwner = { upsert: jest.fn() };

    database = {
      farm_owner: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      errorHandler: jest.fn(),
      $transaction: jest.fn((cb: any) => cb({ farm_owner: txFarmOwner })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FarmOwnerRepository,
        { provide: DatabaseService, useValue: database },
      ],
    }).compile();

    repository = module.get(FarmOwnerRepository);
  });

  describe('getOneById', () => {
    it('should query non-deleted owners by id and return the row', async () => {
      const expected = { id: uuid } as any;
      database.farm_owner.findFirst.mockResolvedValue(expected);

      const result = await repository.getOneById({ id: uuid });

      expect(database.farm_owner.findFirst).toHaveBeenCalledTimes(1);
      const args = database.farm_owner.findFirst.mock.calls[0][0];
      expect(args.where).toEqual({ id: uuid, deleted: false });
      expect(result).toBe(expected);
    });

    it('should call errorHandler when prisma throws', async () => {
      const error = new Error('boom');
      database.farm_owner.findFirst.mockRejectedValue(error);

      const result = await repository.getOneById({ id: uuid });

      expect(database.errorHandler).toHaveBeenCalledWith(error);
      expect(result).toBeUndefined();
    });
  });

  describe('getRelationsById', () => {
    it('should return promise._count when prisma resolves', async () => {
      database.farm_owner.findFirst.mockResolvedValue({
        _count: { properties: 1, harvests: 2, crops: 3 },
      });

      const result = await repository.getRelationsById({ id: uuid });

      expect(result).toEqual({ properties: 1, harvests: 2, crops: 3 });
    });
  });

  describe('softDeleteById', () => {
    it('should update deleted=true filtered by params and return the id', async () => {
      const expected = { id: uuid };
      database.farm_owner.update.mockResolvedValue(expected);

      const result = await repository.softDeleteById({ id: uuid });

      expect(database.farm_owner.update).toHaveBeenCalledWith({
        data: { deleted: true },
        where: { id: uuid },
        select: { id: true },
      });
      expect(result).toBe(expected);
    });
  });

  describe('updateOneById', () => {
    it('should split id from data and call update with where:{id, deleted:false}', async () => {
      const expected = { id: uuid };
      database.farm_owner.update.mockResolvedValue(expected);

      const result = await repository.updateOneById({
        id: uuid,
        fullname: 'jane',
      });

      expect(database.farm_owner.update).toHaveBeenCalledWith({
        data: { fullname: 'jane' },
        where: { id: uuid, deleted: false },
        select: { id: true },
      });
      expect(result).toBe(expected);
    });
  });

  describe('createMany', () => {
    it('should upsert each item by doc inside a transaction and collect created rows', async () => {
      const items = [
        {
          doc: '11111111111',
          fullname: 'a',
          city: 'c',
          state: 's',
          country: 'br',
          created_at: new Date(),
        },
        {
          doc: '22222222222',
          fullname: 'b',
          city: 'c',
          state: 's',
          country: 'br',
          created_at: new Date(),
        },
      ];
      txFarmOwner.upsert
        .mockResolvedValueOnce({ id: uuid, fullname: 'a' })
        .mockResolvedValueOnce({ id: uuid, fullname: 'b' });

      const result = await repository.createMany(items);

      expect(database.$transaction).toHaveBeenCalledTimes(1);
      expect(txFarmOwner.upsert).toHaveBeenCalledTimes(2);
      expect(txFarmOwner.upsert).toHaveBeenNthCalledWith(1, {
        create: items[0],
        update: { ...items[0], deleted: false },
        where: { doc: items[0].doc },
        select: { id: true, fullname: true },
      });
      expect(result).toEqual([
        { id: uuid, fullname: 'a' },
        { id: uuid, fullname: 'b' },
      ]);
    });

    it('should skip items whose upsert fails (error swallowed by errorHandler)', async () => {
      const items = [
        {
          doc: '11111111111',
          fullname: 'a',
          city: 'c',
          state: 's',
          country: 'br',
          created_at: new Date(),
        },
      ];
      const error = new Error('boom');
      txFarmOwner.upsert.mockRejectedValue(error);

      const result = await repository.createMany(items);

      expect(database.errorHandler).toHaveBeenCalledWith(error);
      expect(result).toEqual([]);
    });
  });
});
