import {
  FarmHarvestService,
  IFarmHarvestCreatePromise,
  IFarmHarvestGetOnePromise,
  IFarmHarvestGetRelationsPromise,
  IFarmHarvestSoftDeletePromise,
  IFarmHarvestUpdatePromise,
} from '@app/farm';
import { LoggerService } from '@app/logger';
import { Test, TestingModule } from '@nestjs/testing';
import { IAuthenticatedUser } from '../../../../libs/auth/src';
import {
  IFarmHarvestBulkCreateDTO,
  IFarmHarvestDTO,
  IFarmHarvestUpdateDTO,
  IFarmIdDto,
} from '../farm.dto';
import { FarmHarvestControllerService } from './farm_harvest.service';

describe('FarmHarvestControllerService', () => {
  let controllerService: FarmHarvestControllerService;
  let logger: jest.Mocked<LoggerService>;
  let farmHarvestService: jest.Mocked<FarmHarvestService>;

  const uuid = '00000000-0000-0000-0000-000000000001';

  const user: IAuthenticatedUser = {
    username: 'admin',
    loginId: uuid,
  };
  const ip = '127.0.0.1';
  const param: IFarmIdDto = { id: uuid };

  const harvestData: IFarmHarvestDTO = {
    owner_id: uuid,
    property_id: uuid,
    crop: 2025,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FarmHarvestControllerService,
        {
          provide: LoggerService,
          useValue: { log: jest.fn() },
        },
        {
          provide: FarmHarvestService,
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

    controllerService = module.get<FarmHarvestControllerService>(
      FarmHarvestControllerService,
    );
    logger = module.get(LoggerService);
    farmHarvestService = module.get(FarmHarvestService);
  });

  it('should be defined', () => {
    expect(controllerService).toBeDefined();
  });

  describe('getOneById', () => {
    it('should call farmHarvestService.getOneById with the param id and return its result', async () => {
      const expected = { id: uuid } as IFarmHarvestGetOnePromise;
      farmHarvestService.getOneById.mockResolvedValue(expected);

      const result = await controllerService.getOneById({ param });

      expect(farmHarvestService.getOneById).toHaveBeenCalledTimes(1);
      expect(farmHarvestService.getOneById).toHaveBeenCalledWith({ id: uuid });
      expect(result).toBe(expected);
    });

    it('should propagate errors thrown by farmHarvestService.getOneById', async () => {
      const error = new Error('not found');
      farmHarvestService.getOneById.mockRejectedValue(error);

      await expect(controllerService.getOneById({ param })).rejects.toBe(error);
    });
  });

  describe('getRelationsById', () => {
    it('should call farmHarvestService.getRelationsById with the param id and return its result', async () => {
      const expected: IFarmHarvestGetRelationsPromise = { crops: 4 };
      farmHarvestService.getRelationsById.mockResolvedValue(expected);

      const result = await controllerService.getRelationsById({ param });

      expect(farmHarvestService.getRelationsById).toHaveBeenCalledTimes(1);
      expect(farmHarvestService.getRelationsById).toHaveBeenCalledWith({
        id: uuid,
      });
      expect(result).toBe(expected);
    });

    it('should propagate errors thrown by farmHarvestService.getRelationsById', async () => {
      const error = new Error('not found');
      farmHarvestService.getRelationsById.mockRejectedValue(error);

      await expect(controllerService.getRelationsById({ param })).rejects.toBe(
        error,
      );
    });
  });

  describe('softDeleteById', () => {
    it('should call farmHarvestService.softDeleteById, log the operation and resolve to undefined', async () => {
      const expected: IFarmHarvestSoftDeletePromise = { id: uuid };
      farmHarvestService.softDeleteById.mockResolvedValue(expected);

      const result = await controllerService.softDeleteById({
        user,
        ip,
        param,
      });

      expect(farmHarvestService.softDeleteById).toHaveBeenCalledTimes(1);
      expect(farmHarvestService.softDeleteById).toHaveBeenCalledWith({
        id: uuid,
      });
      expect(logger.log).toHaveBeenCalledWith(
        `[softDeleteById] - LOGINID:${user.loginId} | FARM_HARVEST_ID:${expected.id} | IP:${ip}`,
        FarmHarvestControllerService.name,
      );
      expect(result).toBeUndefined();
    });

    it('should propagate errors thrown by farmHarvestService.softDeleteById and not log success', async () => {
      const error = new Error('delete failed');
      farmHarvestService.softDeleteById.mockRejectedValue(error);

      await expect(
        controllerService.softDeleteById({ user, ip, param }),
      ).rejects.toBe(error);
      expect(logger.log).not.toHaveBeenCalled();
    });
  });

  describe('updateOneById', () => {
    const body: IFarmHarvestUpdateDTO = { crop: 2026 };

    it('should call farmHarvestService.updateOneById with body+id, log and return its result', async () => {
      const expected: IFarmHarvestUpdatePromise = { id: uuid };
      farmHarvestService.updateOneById.mockResolvedValue(expected);

      const result = await controllerService.updateOneById({
        user,
        ip,
        param,
        body,
      });

      expect(farmHarvestService.updateOneById).toHaveBeenCalledTimes(1);
      expect(farmHarvestService.updateOneById).toHaveBeenCalledWith({
        data: body,
        id: uuid,
      });
      expect(logger.log).toHaveBeenCalledWith(
        `[updateOneById] - LOGINID:${user.loginId} | FARM_HARVEST_ID:${expected.id} | IP:${ip}`,
        FarmHarvestControllerService.name,
      );
      expect(result).toBe(expected);
    });

    it('should propagate errors thrown by farmHarvestService.updateOneById and not log success', async () => {
      const error = new Error('update failed');
      farmHarvestService.updateOneById.mockRejectedValue(error);

      await expect(
        controllerService.updateOneById({ user, ip, param, body }),
      ).rejects.toBe(error);
      expect(logger.log).not.toHaveBeenCalled();
    });
  });

  describe('createMany', () => {
    const body: IFarmHarvestBulkCreateDTO = {
      data: [harvestData, { ...harvestData, crop: 2026 }],
    };

    it('should call farmHarvestService.createMany with body.data, log once per result and return its result', async () => {
      const expected: IFarmHarvestCreatePromise[] = [
        { id: uuid, crop: 2025 },
        { id: uuid, crop: 2026 },
      ];
      farmHarvestService.createMany.mockResolvedValue(expected);

      const result = await controllerService.createMany({ user, ip, body });

      expect(farmHarvestService.createMany).toHaveBeenCalledTimes(1);
      expect(farmHarvestService.createMany).toHaveBeenCalledWith({
        data: body.data,
      });

      expect(logger.log).toHaveBeenCalledTimes(expected.length);
      expect(logger.log).toHaveBeenNthCalledWith(
        1,
        `[createMany] - LOGINID:${user.loginId} | FARM_HARVEST_ID:${expected[0].id} | IP:${ip}`,
        FarmHarvestControllerService.name,
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        2,
        `[createMany] - LOGINID:${user.loginId} | FARM_HARVEST_ID:${expected[1].id} | IP:${ip}`,
        FarmHarvestControllerService.name,
      );

      expect(result).toBe(expected);
    });

    it('should propagate errors thrown by farmHarvestService.createMany and not log success', async () => {
      const error = new Error('create failed');
      farmHarvestService.createMany.mockRejectedValue(error);

      await expect(
        controllerService.createMany({ user, ip, body }),
      ).rejects.toBe(error);
      expect(logger.log).not.toHaveBeenCalled();
    });
  });
});
