import type { IAuthenticatedUser } from '@app/auth';
import {
  IFarmOwnerCreatePromise,
  IFarmOwnerGetOnePromise,
  IFarmOwnerGetRelationsPromise,
  IFarmOwnerSearchPromise,
  IFarmOwnerUpdatePromise,
} from '@app/farm';
import { Test, TestingModule } from '@nestjs/testing';
import {
  IFarmIdDto,
  IFarmOwnerBulkCreateDTO,
  IFarmOwnerDTO,
  IFarmOwnerSearchDTO,
  IFarmOwnerUpdateDTO,
} from '../farm.dto';
import { FarmOwnerController } from './farm_owner.controller';
import { FarmOwnerControllerService } from './farm_owner.service';

describe('FarmOwnerController', () => {
  let controller: FarmOwnerController;
  let controllerService: jest.Mocked<FarmOwnerControllerService>;

  const uuid = '00000000-0000-0000-0000-000000000001';

  const user: IAuthenticatedUser = {
    username: 'admin',
    loginId: uuid,
  };
  const ip = '127.0.0.1';
  const param: IFarmIdDto = { id: uuid };

  const ownerData: IFarmOwnerDTO = {
    doc: '12345678909',
    fullname: 'john doe',
    city: 'sao paulo',
    state: 'sp',
    country: 'brazil',
  };

  beforeEach(async () => {
    const serviceMock: jest.Mocked<FarmOwnerControllerService> = {
      createMany: jest.fn(),
      getOneById: jest.fn(),
      getRelationsById: jest.fn(),
      updateOneById: jest.fn(),
      softDeleteById: jest.fn(),
      search: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FarmOwnerController],
      providers: [
        { provide: FarmOwnerControllerService, useValue: serviceMock },
      ],
    }).compile();

    controller = module.get<FarmOwnerController>(FarmOwnerController);
    controllerService = module.get<jest.Mocked<FarmOwnerControllerService>>(
      FarmOwnerControllerService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createMany', () => {
    const body: IFarmOwnerBulkCreateDTO = { data: [ownerData] };

    it('should delegate to controllerService.createMany and return its result', async () => {
      const expected: IFarmOwnerCreatePromise[] = [
        { id: uuid, fullname: 'john doe' },
      ];
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
      const expected = { id: uuid } as IFarmOwnerGetOnePromise;
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
      const expected: IFarmOwnerGetRelationsPromise = {
        properties: 3,
        harvests: 7,
        crops: 12,
      };
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
    const body: IFarmOwnerUpdateDTO = { fullname: 'jane doe' };

    it('should delegate to controllerService.updateOneById and return its result', async () => {
      const expected: IFarmOwnerUpdatePromise = { id: uuid };
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

  describe('search', () => {
    const query: IFarmOwnerSearchDTO = {
      fullname: 'john',
      city: 'sao paulo',
      state: 'sp',
    };

    it('should delegate to controllerService.search and return its result', async () => {
      const expected: IFarmOwnerSearchPromise[] = [
        {
          id: uuid,
          fullname: 'john doe',
          doc: '12345678909',
          city: 'sao paulo',
          state: 'sp',
          country: 'brazil',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      controllerService.search.mockResolvedValue(expected);

      const result = await controller.search(query);

      expect(controllerService.search).toHaveBeenCalledTimes(1);
      expect(controllerService.search).toHaveBeenCalledWith({ query });
      expect(result).toBe(expected);
    });

    it('should propagate errors thrown by controllerService.search', async () => {
      const error = new Error('search failed');
      controllerService.search.mockRejectedValue(error);

      await expect(controller.search(query)).rejects.toBe(error);
    });
  });
});
