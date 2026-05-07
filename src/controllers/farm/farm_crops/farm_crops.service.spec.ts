import {
  FarmCropsService,
  IFarmCropsCreatePromise,
  IFarmCropsGetOnePromise,
  IFarmCropsSoftDeletePromise,
  IFarmCropsUpdatePromise,
} from '@app/farm';
import { LoggerService } from '@app/logger';
import { Test, TestingModule } from '@nestjs/testing';
import { IAuthenticatedUser } from '../../../../libs/auth/src';
import {
  IFarmCropsBulkCreateDTO,
  IFarmCropsDTO,
  IFarmCropsUpdateDTO,
  IFarmIdDto,
} from '../farm.dto';
import { FarmCropsControllerService } from './farm_crops.service';

describe('FarmCropsControllerService', () => {
  let controllerService: FarmCropsControllerService;
  let logger: jest.Mocked<LoggerService>;
  let farmCropsService: jest.Mocked<FarmCropsService>;

  const uuid = '00000000-0000-0000-0000-000000000001';
  const otherUuid = '00000000-0000-0000-0000-000000000002';
  const ownerUuid = '00000000-0000-0000-0000-000000000010';
  const propertyUuid = '00000000-0000-0000-0000-000000000020';
  const harvestUuid = '00000000-0000-0000-0000-000000000030';

  const user: IAuthenticatedUser = {
    username: 'admin',
    loginId: uuid,
  };
  const ip = '127.0.0.1';
  const param: IFarmIdDto = { id: uuid };

  const cropData: IFarmCropsDTO = {
    owner_id: ownerUuid,
    property_id: propertyUuid,
    harvest_id: harvestUuid,
    alias: 'soja',
    area_arable: 250,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FarmCropsControllerService,
        {
          provide: LoggerService,
          useValue: { log: jest.fn() },
        },
        {
          provide: FarmCropsService,
          useValue: {
            getOneById: jest.fn(),
            softDeleteById: jest.fn(),
            updateOneById: jest.fn(),
            createMany: jest.fn(),
            getStats: jest.fn(),
          },
        },
      ],
    }).compile();

    controllerService = module.get<FarmCropsControllerService>(
      FarmCropsControllerService,
    );
    logger = module.get(LoggerService);
    farmCropsService = module.get(FarmCropsService);
  });

  it('should be defined', () => {
    expect(controllerService).toBeDefined();
  });

  describe('getOneById', () => {
    it('should call farmCropsService.getOneById with the param id and return its result', async () => {
      const expected = { id: uuid } as IFarmCropsGetOnePromise;
      farmCropsService.getOneById.mockResolvedValue(expected);

      const result = await controllerService.getOneById({ param });

      expect(farmCropsService.getOneById).toHaveBeenCalledTimes(1);
      expect(farmCropsService.getOneById).toHaveBeenCalledWith({ id: uuid });
      expect(result).toBe(expected);
    });

    it('should propagate errors thrown by farmCropsService.getOneById', async () => {
      const error = new Error('not found');
      farmCropsService.getOneById.mockRejectedValue(error);

      await expect(controllerService.getOneById({ param })).rejects.toBe(error);
    });
  });

  describe('softDeleteById', () => {
    it('should call farmCropsService.softDeleteById, log the operation and resolve to undefined', async () => {
      const expected: IFarmCropsSoftDeletePromise = { id: otherUuid };
      farmCropsService.softDeleteById.mockResolvedValue(expected);

      const result = await controllerService.softDeleteById({
        user,
        ip,
        param,
      });

      expect(farmCropsService.softDeleteById).toHaveBeenCalledTimes(1);
      expect(farmCropsService.softDeleteById).toHaveBeenCalledWith({
        id: uuid,
      });
      expect(logger.log).toHaveBeenCalledWith(
        `[softDeleteById] - LOGINID:${user.loginId} | FARM_CROPS_ID:${expected.id} | IP:${ip}`,
        FarmCropsControllerService.name,
      );
      expect(result).toBeUndefined();
    });

    it('should propagate errors thrown by farmCropsService.softDeleteById and not log success', async () => {
      const error = new Error('delete failed');
      farmCropsService.softDeleteById.mockRejectedValue(error);

      await expect(
        controllerService.softDeleteById({ user, ip, param }),
      ).rejects.toBe(error);
      expect(logger.log).not.toHaveBeenCalled();
    });
  });

  describe('updateOneById', () => {
    const body: IFarmCropsUpdateDTO = { alias: 'milho' };

    it('should call farmCropsService.updateOneById with body+id, log and return its result', async () => {
      const expected: IFarmCropsUpdatePromise = { id: otherUuid };
      farmCropsService.updateOneById.mockResolvedValue(expected);

      const result = await controllerService.updateOneById({
        user,
        ip,
        param,
        body,
      });

      expect(farmCropsService.updateOneById).toHaveBeenCalledTimes(1);
      expect(farmCropsService.updateOneById).toHaveBeenCalledWith({
        data: body,
        id: uuid,
      });
      expect(logger.log).toHaveBeenCalledWith(
        `[updateOneById] - LOGINID:${user.loginId} | FARM_CROPS_ID:${expected.id} | IP:${ip}`,
        FarmCropsControllerService.name,
      );
      expect(result).toBe(expected);
    });

    it('should propagate errors thrown by farmCropsService.updateOneById and not log success', async () => {
      const error = new Error('update failed');
      farmCropsService.updateOneById.mockRejectedValue(error);

      await expect(
        controllerService.updateOneById({ user, ip, param, body }),
      ).rejects.toBe(error);
      expect(logger.log).not.toHaveBeenCalled();
    });
  });

  describe('createMany', () => {
    const body: IFarmCropsBulkCreateDTO = {
      data: [cropData, { ...cropData, alias: 'milho' }],
    };

    it('should call farmCropsService.createMany with body.data, log once per result and return its result', async () => {
      const expected: IFarmCropsCreatePromise[] = [
        { id: uuid, alias: 'soja' },
        { id: otherUuid, alias: 'milho' },
      ];
      farmCropsService.createMany.mockResolvedValue(expected);

      const result = await controllerService.createMany({ user, ip, body });

      expect(farmCropsService.createMany).toHaveBeenCalledTimes(1);
      expect(farmCropsService.createMany).toHaveBeenCalledWith({
        data: body.data,
      });

      expect(logger.log).toHaveBeenCalledTimes(expected.length);
      expect(logger.log).toHaveBeenNthCalledWith(
        1,
        `[createMany] - LOGINID:${user.loginId} | FARM_CROPS_ID:${expected[0].id} | IP:${ip}`,
        FarmCropsControllerService.name,
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        2,
        `[createMany] - LOGINID:${user.loginId} | FARM_CROPS_ID:${expected[1].id} | IP:${ip}`,
        FarmCropsControllerService.name,
      );

      expect(result).toBe(expected);
    });

    it('should propagate errors thrown by farmCropsService.createMany and not log success', async () => {
      const error = new Error('create failed');
      farmCropsService.createMany.mockRejectedValue(error);

      await expect(
        controllerService.createMany({ user, ip, body }),
      ).rejects.toBe(error);
      expect(logger.log).not.toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should delegate to farmCropsService.getStats and return its result', async () => {
      const expected = {
        total_crops: 2,
        total_area_arable: 100,
        crops: [
          { alias: 'pepino', area_arable: 50 },
          { alias: 'batata', area_arable: 50 },
        ],
      };
      farmCropsService.getStats.mockResolvedValue(expected);

      const result = await controllerService.getStats();

      expect(farmCropsService.getStats).toHaveBeenCalledTimes(1);
      expect(result).toBe(expected);
    });

    it('should propagate errors thrown by farmCropsService.getStats', async () => {
      const error = new Error('stats failed');
      farmCropsService.getStats.mockRejectedValue(error);

      await expect(controllerService.getStats()).rejects.toBe(error);
    });
  });
});
