import { CacheModuleServices } from '@app/cache';
import { FarmHarvestRepository } from '@app/database';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DEFAULT_TTL } from '../../../../../utils/constants';
import { FarmHarvestService } from './farm_harvest.service';

describe('FarmHarvestService', () => {
  let service: FarmHarvestService;
  let cache: jest.Mocked<CacheModuleServices>;
  let repository: jest.Mocked<FarmHarvestRepository>;

  const uuid = '00000000-0000-0000-0000-000000000001';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FarmHarvestService,
        {
          provide: CacheModuleServices,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            deleteCollection: jest.fn(),
          },
        },
        {
          provide: FarmHarvestRepository,
          useValue: {
            getOneById: jest.fn(),
            getRelationsById: jest.fn(),
            softDeleteById: jest.fn(),
            updateOneById: jest.fn(),
            createMany: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(FarmHarvestService);
    cache = module.get(CacheModuleServices);
    repository = module.get(FarmHarvestRepository);
  });

  describe('getOneById', () => {
    it('should return cached value when present', async () => {
      const cached = { id: uuid } as any;
      cache.get.mockResolvedValue(cached);

      const result = await service.getOneById({ id: uuid });

      expect(cache.get).toHaveBeenCalledWith({
        key: uuid,
        item: 'farmHarvest',
      });
      expect(repository.getOneById).not.toHaveBeenCalled();
      expect(result).toBe(cached);
    });

    it('should query repository and set cache on miss', async () => {
      cache.get.mockResolvedValue(undefined);
      const repoResult = { id: uuid } as any;
      repository.getOneById.mockResolvedValue(repoResult);

      const result = await service.getOneById({ id: uuid });

      expect(repository.getOneById).toHaveBeenCalledWith({ id: uuid });
      expect(cache.set).toHaveBeenCalledWith({
        key: uuid,
        item: 'farmHarvest',
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
      const cached = { crops: 4 };
      cache.get.mockResolvedValue(cached);

      const result = await service.getRelationsById({ id: uuid });

      expect(cache.get).toHaveBeenCalledWith({
        key: uuid,
        item: 'farmHarvestRelations',
      });
      expect(result).toBe(cached);
    });

    it('should query repository and set cache on miss', async () => {
      cache.get.mockResolvedValue(undefined);
      const repoResult = { crops: 4 };
      repository.getRelationsById.mockResolvedValue(repoResult);

      const result = await service.getRelationsById({ id: uuid });

      expect(cache.set).toHaveBeenCalledWith({
        key: uuid,
        item: 'farmHarvestRelations',
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
    it('should soft delete and clear cache for id, property_id and owner_id', async () => {
      const repoResult = { id: uuid, owner_id: uuid, property_id: uuid };
      repository.softDeleteById.mockResolvedValue(repoResult);

      const result = await service.softDeleteById({ id: uuid });

      expect(cache.deleteCollection).toHaveBeenCalledTimes(3);
      expect(cache.deleteCollection).toHaveBeenCalledWith(`${uuid}:*`);
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
    it('should merge data with id and clear cache for id, property_id and owner_id', async () => {
      const data = { crop: 2026 };
      const repoResult = { id: uuid, owner_id: uuid, property_id: uuid };
      repository.updateOneById.mockResolvedValue(repoResult);

      const result = await service.updateOneById({ id: uuid, data });

      expect(repository.updateOneById).toHaveBeenCalledWith({
        ...data,
        id: uuid,
      });
      expect(cache.deleteCollection).toHaveBeenCalledTimes(3);
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
    it('should add created_at, persist via repository and clear cache for each unique owner+property', async () => {
      const data = [{ owner_id: uuid, property_id: uuid, crop: 2025 }];
      const expected = [{ id: uuid, crop: 2025 }];
      repository.createMany.mockResolvedValue(expected);

      const result = await service.createMany({ data });

      expect(repository.createMany).toHaveBeenCalledWith([
        { ...data[0], created_at: expect.any(Date) },
      ]);
      expect(cache.deleteCollection).toHaveBeenCalledTimes(2);
      expect(cache.deleteCollection).toHaveBeenCalledWith(`${uuid}:*`);
      expect(result).toBe(expected);
    });
  });
});
