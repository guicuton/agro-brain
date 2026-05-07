import type { IAuthenticatedUser } from '@app/auth';
import {
  IFarmCropsCreatePromise,
  IFarmCropsGetOnePromise,
  IFarmCropsUpdatePromise,
} from '@app/farm';
import { Test, TestingModule } from '@nestjs/testing';
import {
  IFarmCropsBulkCreateDTO,
  IFarmCropsDTO,
  IFarmCropsUpdateDTO,
  IFarmIdDto,
} from '../farm.dto';
import { FarmCropsController } from './farm_crops.controller';
import { FarmCropsControllerService } from './farm_crops.service';

describe('FarmCropsController', () => {
  let controller: FarmCropsController;
  let controllerService: jest.Mocked<FarmCropsControllerService>;

  const uuid = '00000000-0000-0000-0000-000000000001';

  const user: IAuthenticatedUser = {
    username: 'admin',
    loginId: uuid,
  };
  const ip = '127.0.0.1';
  const param: IFarmIdDto = { id: uuid };

  const cropData: IFarmCropsDTO = {
    owner_id: uuid,
    property_id: uuid,
    harvest_id: uuid,
    alias: 'soja',
    area_arable: 250,
  };

  beforeEach(async () => {
    const serviceMock: jest.Mocked<FarmCropsControllerService> = {
      createMany: jest.fn(),
      getOneById: jest.fn(),
      updateOneById: jest.fn(),
      softDeleteById: jest.fn(),
      getStats: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FarmCropsController],
      providers: [
        { provide: FarmCropsControllerService, useValue: serviceMock },
      ],
    }).compile();

    controller = module.get<FarmCropsController>(FarmCropsController);
    controllerService = module.get<jest.Mocked<FarmCropsControllerService>>(
      FarmCropsControllerService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createMany', () => {
    const body: IFarmCropsBulkCreateDTO = { data: [cropData] };

    it('should delegate to controllerService.createMany and return its result', async () => {
      const expected: IFarmCropsCreatePromise[] = [{ id: uuid, alias: 'soja' }];
      controllerService.createMany.mockResolvedValue(expected);

      const result = await controller.createMany(user, ip, body);

      expect(controllerService.createMany).toHaveBeenCalledTimes(1);
      expect(controllerService.createMany).toHaveBeenCalledWith({
        user,
        body,
        ip,
      });
      expect(result).toBe(expected);
    });

    it('should propagate errors thrown by controllerService.createMany', async () => {
      const error = new Error('createMany failed');
      controllerService.createMany.mockRejectedValue(error);

      await expect(controller.createMany(user, ip, body)).rejects.toBe(error);
    });
  });

  describe('getOne', () => {
    it('should delegate to controllerService.getOneById and return its result', async () => {
      const expected = { id: uuid } as IFarmCropsGetOnePromise;
      controllerService.getOneById.mockResolvedValue(expected);

      const result = await controller.getOne(param);

      expect(controllerService.getOneById).toHaveBeenCalledTimes(1);
      expect(controllerService.getOneById).toHaveBeenCalledWith({ param });
      expect(result).toBe(expected);
    });

    it('should propagate errors thrown by controllerService.getOneById', async () => {
      const error = new Error('not found');
      controllerService.getOneById.mockRejectedValue(error);

      await expect(controller.getOne(param)).rejects.toBe(error);
    });
  });

  describe('updateOne', () => {
    const body: IFarmCropsUpdateDTO = { alias: 'milho' };

    it('should delegate to controllerService.updateOneById and return its result', async () => {
      const expected: IFarmCropsUpdatePromise = { id: uuid };
      controllerService.updateOneById.mockResolvedValue(expected);

      const result = await controller.updateOne(user, ip, param, body);

      expect(controllerService.updateOneById).toHaveBeenCalledTimes(1);
      expect(controllerService.updateOneById).toHaveBeenCalledWith({
        user,
        body,
        param,
        ip,
      });
      expect(result).toBe(expected);
    });

    it('should propagate errors thrown by controllerService.updateOneById', async () => {
      const error = new Error('update failed');
      controllerService.updateOneById.mockRejectedValue(error);

      await expect(controller.updateOne(user, ip, param, body)).rejects.toBe(
        error,
      );
    });
  });

  describe('softDelete', () => {
    it('should delegate to controllerService.softDeleteById and resolve to undefined', async () => {
      controllerService.softDeleteById.mockResolvedValue(undefined);

      const result = await controller.softDelete(user, ip, param);

      expect(controllerService.softDeleteById).toHaveBeenCalledTimes(1);
      expect(controllerService.softDeleteById).toHaveBeenCalledWith({
        user,
        param,
        ip,
      });
      expect(result).toBeUndefined();
    });

    it('should propagate errors thrown by controllerService.softDeleteById', async () => {
      const error = new Error('delete failed');
      controllerService.softDeleteById.mockRejectedValue(error);

      await expect(controller.softDelete(user, ip, param)).rejects.toBe(error);
    });
  });

  describe('getStats', () => {
    it('should delegate to controllerService.getStats and return its result', async () => {
      const expected = {
        total_crops: 2,
        total_area_arable: 100,
        crops: [
          { alias: 'pepino', area_arable: 50 },
          { alias: 'batata', area_arable: 50 },
        ],
      };
      controllerService.getStats.mockResolvedValue(expected);

      const result = await controller.getStats();

      expect(controllerService.getStats).toHaveBeenCalledTimes(1);
      expect(result).toBe(expected);
    });

    it('should propagate errors thrown by controllerService.getStats', async () => {
      const error = new Error('stats failed');
      controllerService.getStats.mockRejectedValue(error);

      await expect(controller.getStats()).rejects.toBe(error);
    });
  });
});
