import { CacheModuleServices } from '@app/cache';
import { FarmOwnerRepository } from '@app/database';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DEFAULT_TTL } from '../../../../../utils/constants';
import { FarmOwnerService } from './farm_owner.service';

describe('FarmOwnerService', () => {
  let service: FarmOwnerService;
  let cache: jest.Mocked<CacheModuleServices>;
  let repository: jest.Mocked<FarmOwnerRepository>;

  const uuid = '00000000-0000-0000-0000-000000000001';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FarmOwnerService,
        {
          provide: CacheModuleServices,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            deleteCollection: jest.fn(),
          },
        },
        {
          provide: FarmOwnerRepository,
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

    service = module.get(FarmOwnerService);
    cache = module.get(CacheModuleServices);
    repository = module.get(FarmOwnerRepository);
  });

  describe('getOneById', () => {
    it('should return cached value when present without hitting the repository', async () => {
      const cached = { id: uuid };
      cache.get.mockResolvedValue(cached);

      const result = await service.getOneById({ id: uuid });

      expect(cache.get).toHaveBeenCalledWith({ key: uuid, item: 'farmOwner' });
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
        item: 'farmOwner',
        data: repoResult,
        ttl: DEFAULT_TTL.five,
      });
      expect(result).toBe(repoResult);
    });

    it('should throw NotFoundException when neither cache nor repository finds the row', async () => {
      cache.get.mockResolvedValue(undefined);
      repository.getOneById.mockResolvedValue(undefined);

      await expect(service.getOneById({ id: uuid })).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(cache.set).not.toHaveBeenCalled();
    });
  });

  describe('getRelationsById', () => {
    it('should return cached value when present', async () => {
      const cached = { properties: 1, harvests: 2, crops: 3 };
      cache.get.mockResolvedValue(cached);

      const result = await service.getRelationsById({ id: uuid });

      expect(cache.get).toHaveBeenCalledWith({
        key: uuid,
        item: 'farmOwnerRelations',
      });
      expect(repository.getRelationsById).not.toHaveBeenCalled();
      expect(result).toBe(cached);
    });

    it('should set cache with the relations item on cache miss', async () => {
      cache.get.mockResolvedValue(undefined);
      const repoResult = { properties: 1, harvests: 2, crops: 3 };
      repository.getRelationsById.mockResolvedValue(repoResult);

      const result = await service.getRelationsById({ id: uuid });

      expect(cache.set).toHaveBeenCalledWith({
        key: uuid,
        item: 'farmOwnerRelations',
        data: repoResult,
        ttl: DEFAULT_TTL.five,
      });
      expect(result).toBe(repoResult);
    });

    it('should throw NotFoundException on repository miss', async () => {
      cache.get.mockResolvedValue(undefined);
      repository.getRelationsById.mockResolvedValue(undefined);

      await expect(
        service.getRelationsById({ id: uuid }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('softDeleteById', () => {
    it('should soft delete via repository, clear the cache collection of the deleted id and return the row', async () => {
      const repoResult = { id: uuid };
      repository.softDeleteById.mockResolvedValue(repoResult);

      const result = await service.softDeleteById({ id: uuid });

      expect(repository.softDeleteById).toHaveBeenCalledWith({ id: uuid });
      expect(cache.deleteCollection).toHaveBeenCalledWith(`${uuid}:*`);
      expect(result).toBe(repoResult);
    });

    it('should throw NotFoundException when repository returns nothing', async () => {
      repository.softDeleteById.mockResolvedValue(undefined);

      await expect(service.softDeleteById({ id: uuid })).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(cache.deleteCollection).not.toHaveBeenCalled();
    });
  });

  describe('updateOneById', () => {
    it('should call repository.updateOneById with merged data and clear the cache', async () => {
      const data = { fullname: 'jane' };
      const repoResult = { id: uuid };
      repository.updateOneById.mockResolvedValue(repoResult);

      const result = await service.updateOneById({ id: uuid, data });

      expect(repository.updateOneById).toHaveBeenCalledWith({
        ...data,
        id: uuid,
      });
      expect(cache.deleteCollection).toHaveBeenCalledWith(`${uuid}:*`);
      expect(result).toBe(repoResult);
    });

    it('should throw NotFoundException when repository returns nothing', async () => {
      repository.updateOneById.mockResolvedValue(undefined);

      await expect(
        service.updateOneById({ id: uuid, data: {} }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(cache.deleteCollection).not.toHaveBeenCalled();
    });
  });

  describe('createMany', () => {
    it('should add created_at to each item and call repository.createMany', async () => {
      const data = [
        {
          doc: '11111111111',
          fullname: 'a',
          city: 'c',
          state: 's',
          country: 'br',
        },
      ];
      const expected = [{ id: uuid, fullname: 'a' }];
      repository.createMany.mockResolvedValue(expected);

      const result = await service.createMany({ data });

      expect(repository.createMany).toHaveBeenCalledWith([
        { ...data[0], created_at: expect.any(Date) },
      ]);
      expect(result).toBe(expected);
    });
  });
});
