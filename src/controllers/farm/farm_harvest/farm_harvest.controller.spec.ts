import type { IAuthenticatedUser } from '@app/auth';
import {
  IFarmHarvestCreatePromise,
  IFarmHarvestGetOnePromise,
  IFarmHarvestGetRelationsPromise,
  IFarmHarvestUpdatePromise,
} from '@app/farm';
import { Test, TestingModule } from '@nestjs/testing';
import {
  IFarmHarvestBulkCreateDTO,
  IFarmHarvestDTO,
  IFarmHarvestUpdateDTO,
  IFarmIdDto,
} from '../farm.dto';
import { FarmHarvestController } from './farm_harvest.controller';
import { FarmHarvestControllerService } from './farm_harvest.service';

describe('FarmHarvestController', () => {
  let controller: FarmHarvestController;
  let controllerService: jest.Mocked<FarmHarvestControllerService>;

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
    const serviceMock: jest.Mocked<FarmHarvestControllerService> = {
      createMany: jest.fn(),
      getOneById: jest.fn(),
      getRelationsById: jest.fn(),
      updateOneById: jest.fn(),
      softDeleteById: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FarmHarvestController],
      providers: [
        { provide: FarmHarvestControllerService, useValue: serviceMock },
      ],
    }).compile();

    controller = module.get<FarmHarvestController>(FarmHarvestController);
    controllerService = module.get<jest.Mocked<FarmHarvestControllerService>>(
      FarmHarvestControllerService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createMany', () => {
    const body: IFarmHarvestBulkCreateDTO = { data: [harvestData] };

    it('should delegate to controllerService.createMany and return its result', async () => {
      const expected: IFarmHarvestCreatePromise[] = [{ id: uuid, crop: 2025 }];
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
      const expected = { id: uuid } as IFarmHarvestGetOnePromise;
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

  describe('getRelations', () => {
    it('should delegate to controllerService.getRelationsById and return its result', async () => {
      const expected: IFarmHarvestGetRelationsPromise = { crops: 4 };
      controllerService.getRelationsById.mockResolvedValue(expected);

      const result = await controller.getRelations(param);

      expect(controllerService.getRelationsById).toHaveBeenCalledTimes(1);
      expect(controllerService.getRelationsById).toHaveBeenCalledWith({
        param,
      });
      expect(result).toBe(expected);
    });

    it('should propagate errors thrown by controllerService.getRelationsById', async () => {
      const error = new Error('not found');
      controllerService.getRelationsById.mockRejectedValue(error);

      await expect(controller.getRelations(param)).rejects.toBe(error);
    });
  });

  describe('updateOne', () => {
    const body: IFarmHarvestUpdateDTO = { crop: 2026 };

    it('should delegate to controllerService.updateOneById and return its result', async () => {
      const expected: IFarmHarvestUpdatePromise = { id: uuid };
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
});
