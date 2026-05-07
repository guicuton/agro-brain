import { CacheModuleServices } from '@app/cache';
import { FarmCropsRepository, FarmPropertyRepository } from '@app/database';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DEFAULT_TTL } from '../../../../../utils/constants';
import { FarmCropsService } from './farm_crops.service';

describe('FarmCropsService', () => {
  let service: FarmCropsService;
  let cache: jest.Mocked<CacheModuleServices>;
  let cropsRepository: jest.Mocked<FarmCropsRepository>;
  let propertyRepository: jest.Mocked<FarmPropertyRepository>;

  const uuid = '00000000-0000-0000-0000-000000000001';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FarmCropsService,
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
          provide: FarmCropsRepository,
          useValue: {
            getOneById: jest.fn(),
            softDeleteById: jest.fn(),
            updateOneById: jest.fn(),
            createMany: jest.fn(),
            getStats: jest.fn(),
          },
        },
        {
          provide: FarmPropertyRepository,
          useValue: {
            getAreasById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(FarmCropsService);
    cache = module.get(CacheModuleServices);
    cropsRepository = module.get(FarmCropsRepository);
    propertyRepository = module.get(FarmPropertyRepository);
  });

  describe('getOneById', () => {
    it('should return cached value when present', async () => {
      const cached = { id: uuid } as any;
      cache.get.mockResolvedValue(cached);

      const result = await service.getOneById({ id: uuid });

      expect(cache.get).toHaveBeenCalledWith({ key: uuid, item: 'farmCrops' });
      expect(cropsRepository.getOneById).not.toHaveBeenCalled();
      expect(result).toBe(cached);
    });

    it('should query repository and set cache on miss', async () => {
      cache.get.mockResolvedValue(undefined);
      const repoResult = { id: uuid } as any;
      cropsRepository.getOneById.mockResolvedValue(repoResult);

      const result = await service.getOneById({ id: uuid });

      expect(cache.set).toHaveBeenCalledWith({
        key: uuid,
        item: 'farmCrops',
        data: repoResult,
        ttl: DEFAULT_TTL.five,
      });
      expect(result).toBe(repoResult);
    });

    it('should throw NotFoundException on full miss', async () => {
      cache.get.mockResolvedValue(undefined);
      cropsRepository.getOneById.mockResolvedValue(undefined);

      await expect(service.getOneById({ id: uuid })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('softDeleteById', () => {
    it('should soft delete, clear 4 caches plus stats and return only the id', async () => {
      const repoResult = {
        id: uuid,
        owner_id: uuid,
        property_id: uuid,
        harvest_id: uuid,
      };
      cropsRepository.softDeleteById.mockResolvedValue(repoResult);

      const result = await service.softDeleteById({ id: uuid });

      expect(cache.deleteCollection).toHaveBeenCalledTimes(4);
      expect(cache.deleteCollection).toHaveBeenCalledWith(`${uuid}:*`);
      expect(cache.delete).toHaveBeenCalledWith(['all:farmCropsStats']);
      expect(result).toEqual({ id: uuid });
    });

    it('should throw NotFoundException when repository returns nothing', async () => {
      cropsRepository.softDeleteById.mockResolvedValue(undefined);

      await expect(service.softDeleteById({ id: uuid })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('updateOneById', () => {
    it('should merge data with id and clear 4 caches plus stats', async () => {
      const data = { alias: 'milho' } as any;
      const repoResult = {
        id: uuid,
        owner_id: uuid,
        property_id: uuid,
        harvest_id: uuid,
      };
      cropsRepository.updateOneById.mockResolvedValue(repoResult);

      const result = await service.updateOneById({ id: uuid, data });

      expect(cropsRepository.updateOneById).toHaveBeenCalledWith({
        ...data,
        id: uuid,
      });
      expect(cache.deleteCollection).toHaveBeenCalledTimes(4);
      expect(cache.delete).toHaveBeenCalledWith(['all:farmCropsStats']);
      expect(result).toBe(repoResult);
    });

    it('should throw NotFoundException when repository returns nothing', async () => {
      cropsRepository.updateOneById.mockResolvedValue(undefined);

      await expect(
        service.updateOneById({ id: uuid, data: {} as any }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('createMany', () => {
    const data = [
      {
        owner_id: uuid,
        property_id: uuid,
        harvest_id: uuid,
        alias: 'soja',
        area_arable: 100,
      },
    ] as any;

    it('should clear caches, validate area, persist and return repository result', async () => {
      propertyRepository.getAreasById.mockResolvedValue({
        area_total: 1000,
        area_arable: 700,
        area_vegetation: 300,
        area_type: 'HECTAR',
        crops: [{ area_arable: 200 }],
      });
      const expected = [{ id: uuid, alias: 'soja' }];
      cropsRepository.createMany.mockResolvedValue(expected);

      const result = await service.createMany({ data });

      expect(propertyRepository.getAreasById).toHaveBeenCalledWith({
        id: uuid,
      });
      expect(cropsRepository.createMany).toHaveBeenCalledWith([
        { ...data[0], created_at: expect.any(Date) },
      ]);
      expect(cache.deleteCollection).toHaveBeenCalled();
      expect(cache.delete).toHaveBeenCalledWith(['all:farmCropsStats']);
      expect(result).toBe(expected);
    });

    it('should throw BadRequestException when the new area_arable would exceed property limits', async () => {
      propertyRepository.getAreasById.mockResolvedValue({
        area_total: 1000,
        area_arable: 250,
        area_vegetation: 750,
        area_type: 'HECTAR',
        crops: [{ area_arable: 200 }],
      });

      await expect(service.createMany({ data })).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(cropsRepository.createMany).not.toHaveBeenCalled();
    });

    it('should skip area validation gracefully when the property is not found', async () => {
      propertyRepository.getAreasById.mockResolvedValue(undefined);
      const expected = [{ id: uuid, alias: 'soja' }];
      cropsRepository.createMany.mockResolvedValue(expected);

      const result = await service.createMany({ data });

      expect(cropsRepository.createMany).toHaveBeenCalled();
      expect(result).toBe(expected);
    });
  });

  describe('getStats', () => {
    const expected = {
      total_crops: 2,
      total_area_arable: 100,
      crops: [
        { alias: 'pepino', area_arable: 50 },
        { alias: 'batata', area_arable: 50 },
      ],
    };

    it('should return cached stats without hitting the repository', async () => {
      cache.get.mockResolvedValue(expected);

      const result = await service.getStats();

      expect(cache.get).toHaveBeenCalledWith({
        key: 'all',
        item: 'farmCropsStats',
      });
      expect(cropsRepository.getStats).not.toHaveBeenCalled();
      expect(result).toBe(expected);
    });

    it('should query repository and set cache on miss', async () => {
      cache.get.mockResolvedValue(undefined);
      cropsRepository.getStats.mockResolvedValue(expected);

      const result = await service.getStats();

      expect(cropsRepository.getStats).toHaveBeenCalledTimes(1);
      expect(cache.set).toHaveBeenCalledWith({
        key: 'all',
        item: 'farmCropsStats',
        data: expected,
        ttl: DEFAULT_TTL.five,
      });
      expect(result).toBe(expected);
    });
  });
});
