import {
  FarmPropertyService,
  IFarmPropertyCreatePromise,
  IFarmPropertyGetOnePromise,
  IFarmPropertyGetRelationsPromise,
  IFarmPropertySoftDeletePromise,
  IFarmPropertyUpdatePromise,
} from '@app/farm';
import { LoggerService } from '@app/logger';
import { Test, TestingModule } from '@nestjs/testing';
import { IAuthenticatedUser } from '../../../../libs/auth/src';
import { AREA_TYPE } from '../../../../libs/database/prisma/generated/enums';
import {
  IFarmIdDto,
  IFarmPropertyBulkCreateDTO,
  IFarmPropertyDTO,
  IFarmPropertyUpdateDTO,
} from '../farm.dto';
import { FarmPropertyControllerService } from './farm_property.service';

describe('FarmPropertyControllerService', () => {
  let controllerService: FarmPropertyControllerService;
  let logger: jest.Mocked<LoggerService>;
  let farmPropertyService: jest.Mocked<FarmPropertyService>;

  const uuid = '00000000-0000-0000-0000-000000000001';

  const user: IAuthenticatedUser = {
    username: 'admin',
    loginId: uuid,
  };
  const ip = '127.0.0.1';
  const param: IFarmIdDto = { id: uuid };

  const propertyData: IFarmPropertyDTO = {
    owner_id: uuid,
    alias: 'fazenda boa vista',
    area_total: 1000,
    area_arable: 700,
    area_vegetation: 300,
    area_type: AREA_TYPE.HECTAR,
    city: 'sao paulo',
    state: 'sp',
    country: 'brazil',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FarmPropertyControllerService,
        {
          provide: LoggerService,
          useValue: { log: jest.fn() },
        },
        {
          provide: FarmPropertyService,
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

    controllerService = module.get<FarmPropertyControllerService>(
      FarmPropertyControllerService,
    );
    logger = module.get(LoggerService);
    farmPropertyService = module.get(FarmPropertyService);
  });

  it('should be defined', () => {
    expect(controllerService).toBeDefined();
  });

  describe('getOneById', () => {
    it('should call farmPropertyService.getOneById with the param id and return its result', async () => {
      const expected = { id: uuid } as IFarmPropertyGetOnePromise;
      farmPropertyService.getOneById.mockResolvedValue(expected);

      const result = await controllerService.getOneById({ param });

      expect(farmPropertyService.getOneById).toHaveBeenCalledTimes(1);
      expect(farmPropertyService.getOneById).toHaveBeenCalledWith({ id: uuid });
      expect(result).toBe(expected);
    });

    it('should propagate errors thrown by farmPropertyService.getOneById', async () => {
      const error = new Error('not found');
      farmPropertyService.getOneById.mockRejectedValue(error);

      await expect(controllerService.getOneById({ param })).rejects.toBe(error);
    });
  });

  describe('getRelationsById', () => {
    it('should call farmPropertyService.getRelationsById with the param id and return its result', async () => {
      const expected: IFarmPropertyGetRelationsPromise = {
        harvests: 5,
        crops: 9,
      };
      farmPropertyService.getRelationsById.mockResolvedValue(expected);

      const result = await controllerService.getRelationsById({ param });

      expect(farmPropertyService.getRelationsById).toHaveBeenCalledTimes(1);
      expect(farmPropertyService.getRelationsById).toHaveBeenCalledWith({
        id: uuid,
      });
      expect(result).toBe(expected);
    });

    it('should propagate errors thrown by farmPropertyService.getRelationsById', async () => {
      const error = new Error('not found');
      farmPropertyService.getRelationsById.mockRejectedValue(error);

      await expect(controllerService.getRelationsById({ param })).rejects.toBe(
        error,
      );
    });
  });

  describe('softDeleteById', () => {
    it('should call farmPropertyService.softDeleteById, log the operation and resolve to undefined', async () => {
      const expected: IFarmPropertySoftDeletePromise = { id: uuid };
      farmPropertyService.softDeleteById.mockResolvedValue(expected);

      const result = await controllerService.softDeleteById({
        user,
        ip,
        param,
      });

      expect(farmPropertyService.softDeleteById).toHaveBeenCalledTimes(1);
      expect(farmPropertyService.softDeleteById).toHaveBeenCalledWith({
        id: uuid,
      });
      expect(logger.log).toHaveBeenCalledWith(
        `[softDeleteById] - LOGINID:${user.loginId} | FARM_PROPERTY_ID:${expected.id} | IP:${ip}`,
        FarmPropertyControllerService.name,
      );
      expect(result).toBeUndefined();
    });

    it('should propagate errors thrown by farmPropertyService.softDeleteById and not log success', async () => {
      const error = new Error('delete failed');
      farmPropertyService.softDeleteById.mockRejectedValue(error);

      await expect(
        controllerService.softDeleteById({ user, ip, param }),
      ).rejects.toBe(error);
      expect(logger.log).not.toHaveBeenCalled();
    });
  });

  describe('updateOneById', () => {
    const body: IFarmPropertyUpdateDTO = { alias: 'fazenda nova' };

    it('should call farmPropertyService.updateOneById with body+id, log and return its result', async () => {
      const expected: IFarmPropertyUpdatePromise = { id: uuid };
      farmPropertyService.updateOneById.mockResolvedValue(expected);

      const result = await controllerService.updateOneById({
        user,
        ip,
        param,
        body,
      });

      expect(farmPropertyService.updateOneById).toHaveBeenCalledTimes(1);
      expect(farmPropertyService.updateOneById).toHaveBeenCalledWith({
        data: body,
        id: uuid,
      });
      expect(logger.log).toHaveBeenCalledWith(
        `[updateOneById] - LOGINID:${user.loginId} | FARM_PROPERTY_ID:${expected.id} | IP:${ip}`,
        FarmPropertyControllerService.name,
      );
      expect(result).toBe(expected);
    });

    it('should propagate errors thrown by farmPropertyService.updateOneById and not log success', async () => {
      const error = new Error('update failed');
      farmPropertyService.updateOneById.mockRejectedValue(error);

      await expect(
        controllerService.updateOneById({ user, ip, param, body }),
      ).rejects.toBe(error);
      expect(logger.log).not.toHaveBeenCalled();
    });
  });

  describe('createMany', () => {
    const body: IFarmPropertyBulkCreateDTO = {
      data: [propertyData, { ...propertyData, alias: 'fazenda dois' }],
    };

    it('should call farmPropertyService.createMany with body.data, log once per result and return its result', async () => {
      const expected: IFarmPropertyCreatePromise[] = [
        { id: uuid, alias: 'fazenda boa vista' },
        { id: uuid, alias: 'fazenda dois' },
      ];
      farmPropertyService.createMany.mockResolvedValue(expected);

      const result = await controllerService.createMany({ user, ip, body });

      expect(farmPropertyService.createMany).toHaveBeenCalledTimes(1);
      expect(farmPropertyService.createMany).toHaveBeenCalledWith({
        data: body.data,
      });

      expect(logger.log).toHaveBeenCalledTimes(expected.length);
      expect(logger.log).toHaveBeenNthCalledWith(
        1,
        `[createMany] - LOGINID:${user.loginId} | FARM_PROPERTY_ID:${expected[0].id} | IP:${ip}`,
        FarmPropertyControllerService.name,
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        2,
        `[createMany] - LOGINID:${user.loginId} | FARM_PROPERTY_ID:${expected[1].id} | IP:${ip}`,
        FarmPropertyControllerService.name,
      );

      expect(result).toBe(expected);
    });

    it('should propagate errors thrown by farmPropertyService.createMany and not log success', async () => {
      const error = new Error('create failed');
      farmPropertyService.createMany.mockRejectedValue(error);

      await expect(
        controllerService.createMany({ user, ip, body }),
      ).rejects.toBe(error);
      expect(logger.log).not.toHaveBeenCalled();
    });
  });
});
