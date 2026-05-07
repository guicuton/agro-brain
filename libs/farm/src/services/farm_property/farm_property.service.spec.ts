import { CacheModuleServices } from '@app/cache';
import { FarmPropertyRepository } from '@app/database';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DEFAULT_TTL } from '../../../../../utils/constants';
import { FarmPropertyService } from './farm_property.service';

describe('FarmPropertyService', () => {
  let service: FarmPropertyService;
  let cache: jest.Mocked<CacheModuleServices>;
  let repository: jest.Mocked<FarmPropertyRepository>;

  const uuid = '00000000-0000-0000-0000-000000000001';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FarmPropertyService,
        {
          provide: CacheModuleServices,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            delete: jest.fn(),
            deleteCollection: jest.fn(),
          },
        },
        {
          provide: FarmPropertyRepository,
          useValue: {
            getOneById: jest.fn(),
            getRelationsById: jest.fn(),
            softDeleteById: jest.fn(),
            updateOneById: jest.fn(),
            createMany: jest.fn(),
            findManyDynamic: jest.fn(),
            getStats: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(FarmPropertyService);
    cache = module.get(CacheModuleServices);
    repository = module.get(FarmPropertyRepository);
  });

  describe('getOneById', () => {
    it('should return cached value when present without hitting the repository', async () => {
      const cached = { id: uuid };
      cache.get.mockResolvedValue(cached);

      const result = await service.getOneById({ id: uuid });

      expect(cache.get).toHaveBeenCalledWith({
        key: uuid,
        item: 'farmProperty',
      });
      expect(repository.getOneById).not.toHaveBeenCalled();
      expect(result).toBe(cached);
    });

    it('should query repository, set cache and return result on cache miss', async () => {
      cache.get.mockResolvedValue(undefined);
      const repoResult = { id: uuid } as any;
      repository.getOneById.mockResolvedValue(repoResult);

      const result = await service.getOneById({ id: uuid });

      expect(repository.getOneById).toHaveBeenCalledWith({ id: uuid });
      expect(cache.set).toHaveBeenCalledWith({
        key: uuid,
        item: 'farmProperty',
        data: repoResult,
        ttl: DEFAULT_TTL.five,
      });
      expect(result).toBe(repoResult);
    });

    it('should throw NotFoundException on full miss', async () => {
      cache.get.mockResolvedValue(undefined);
      repository.getOneById.mockResolvedValue(undefined);

      await expect(service.getOneById({ id: uuid })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('getRelationsById', () => {
    it('should return cached value when present', async () => {
      const cached = { harvests: 1, crops: 2 };
      cache.get.mockResolvedValue(cached);

      const result = await service.getRelationsById({ id: uuid });

      expect(cache.get).toHaveBeenCalledWith({
        key: uuid,
        item: 'farmPropertyRelations',
      });
      expect(repository.getRelationsById).not.toHaveBeenCalled();
      expect(result).toBe(cached);
    });

    it('should set cache with the relations item on miss', async () => {
      cache.get.mockResolvedValue(undefined);
      const repoResult = { harvests: 1, crops: 2 };
      repository.getRelationsById.mockResolvedValue(repoResult);

      const result = await service.getRelationsById({ id: uuid });

      expect(cache.set).toHaveBeenCalledWith({
        key: uuid,
        item: 'farmPropertyRelations',
        data: repoResult,
        ttl: DEFAULT_TTL.five,
      });
      expect(result).toBe(repoResult);
    });

    it('should throw NotFoundException on full miss', async () => {
      cache.get.mockResolvedValue(undefined);
      repository.getRelationsById.mockResolvedValue(undefined);

      await expect(
        service.getRelationsById({ id: uuid }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('softDeleteById', () => {
    it('should soft delete and clear the cache for the deleted id and stats', async () => {
      const repoResult = { id: uuid };
      repository.softDeleteById.mockResolvedValue(repoResult);

      const result = await service.softDeleteById({ id: uuid });

      expect(cache.deleteCollection).toHaveBeenCalledWith(`${uuid}:*`);
      expect(cache.delete).toHaveBeenCalledWith(['all:farmPropertyStats']);
      expect(result).toBe(repoResult);
    });

    it('should throw NotFoundException when repository returns nothing', async () => {
      repository.softDeleteById.mockResolvedValue(undefined);

      await expect(service.softDeleteById({ id: uuid })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('updateOneById', () => {
    it('should merge data with id and clear the property and stats caches', async () => {
      const data = { alias: 'fazenda nova' };
      const repoResult = { id: uuid };
      repository.updateOneById.mockResolvedValue(repoResult);

      const result = await service.updateOneById({ id: uuid, data });

      expect(repository.updateOneById).toHaveBeenCalledWith({
        ...data,
        id: uuid,
      });
      expect(cache.deleteCollection).toHaveBeenCalledWith(`${uuid}:*`);
      expect(cache.delete).toHaveBeenCalledWith(['all:farmPropertyStats']);
      expect(result).toBe(repoResult);
    });

    it('should throw NotFoundException when repository returns nothing', async () => {
      repository.updateOneById.mockResolvedValue(undefined);

      await expect(
        service.updateOneById({ id: uuid, data: {} }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('createMany', () => {
    it('should add created_at to each item, persist via repository and clear cache for each unique owner and stats', async () => {
      const data = [
        { owner_id: uuid, alias: 'a' },
        { owner_id: uuid, alias: 'b' },
      ] as any;
      const expected = [{ id: uuid, alias: 'a' }];
      repository.createMany.mockResolvedValue(expected);

      const result = await service.createMany({ data });

      expect(repository.createMany).toHaveBeenCalledWith([
        { ...data[0], created_at: expect.any(Date) },
        { ...data[1], created_at: expect.any(Date) },
      ]);
      expect(cache.deleteCollection).toHaveBeenCalledTimes(1);
      expect(cache.deleteCollection).toHaveBeenCalledWith(`${uuid}:*`);
      expect(cache.delete).toHaveBeenCalledWith(['all:farmPropertyStats']);
      expect(result).toBe(expected);
    });
  });

  describe('search', () => {
    it('should delegate to repository.findManyDynamic and return its result', async () => {
      const params = { alias: 'fazenda', city: 'sao paulo' };
      const date = new Date();
      const expected = [
        {
          id: uuid,
          owner: {
            id: uuid,
            fullname: 'john doe',
          },
          alias: 'fazenda do doe',
          area_total: 200,
          area_arable: 80,
          area_vegetation: 120,
          area_type: 'HECTAR',
          city: 'sao paulo',
          state: 'sp',
          country: 'brasil',
          metadata: {},
          created_at: date,
          updated_at: date,
        },
      ];
      repository.findManyDynamic.mockResolvedValue(expected);

      const result = await service.search(params);

      expect(repository.findManyDynamic).toHaveBeenCalledTimes(1);
      expect(repository.findManyDynamic).toHaveBeenCalledWith(params);
      expect(result).toBe(expected);
    });

    it('should propagate errors thrown by repository.search', async () => {
      const error = new Error('boom');
      repository.findManyDynamic.mockRejectedValue(error);

      await expect(service.search({ alias: 'john' })).rejects.toBe(error);
    });
  });

  describe('getStats', () => {
    const expected = {
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
    };

    it('should return cached stats without hitting the repository', async () => {
      cache.get.mockResolvedValue(expected);

      const result = await service.getStats();

      expect(cache.get).toHaveBeenCalledWith({
        key: 'all',
        item: 'farmPropertyStats',
      });
      expect(repository.getStats).not.toHaveBeenCalled();
      expect(result).toBe(expected);
    });

    it('should query repository and set cache on miss', async () => {
      cache.get.mockResolvedValue(undefined);
      repository.getStats.mockResolvedValue(expected);

      const result = await service.getStats();

      expect(repository.getStats).toHaveBeenCalledTimes(1);
      expect(cache.set).toHaveBeenCalledWith({
        key: 'all',
        item: 'farmPropertyStats',
        data: expected,
        ttl: DEFAULT_TTL.five,
      });
      expect(result).toBe(expected);
    });
  });
});
