import {
  FarmOwnerService,
  IFarmOwnerCreatePromise,
  IFarmOwnerGetOnePromise,
  IFarmOwnerGetRelationsPromise,
  IFarmOwnerSearchPromise,
  IFarmOwnerSoftDeletePromise,
  IFarmOwnerUpdatePromise,
} from '@app/farm';
import { LoggerService } from '@app/logger';
import { Test, TestingModule } from '@nestjs/testing';
import { IAuthenticatedUser } from '../../../../libs/auth/src';
import {
  IFarmIdDto,
  IFarmOwnerBulkCreateDTO,
  IFarmOwnerDTO,
  IFarmOwnerSearchDTO,
  IFarmOwnerUpdateDTO,
} from '../farm.dto';
import { FarmOwnerControllerService } from './farm_owner.service';

describe('FarmOwnerControllerService', () => {
  let controllerService: FarmOwnerControllerService;
  let logger: jest.Mocked<LoggerService>;
  let farmOwnerService: jest.Mocked<FarmOwnerService>;

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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FarmOwnerControllerService,
        {
          provide: LoggerService,
          useValue: { log: jest.fn() },
        },
        {
          provide: FarmOwnerService,
          useValue: {
            getOneById: jest.fn(),
            getRelationsById: jest.fn(),
            softDeleteById: jest.fn(),
            updateOneById: jest.fn(),
            createMany: jest.fn(),
            search: jest.fn(),
          },
        },
      ],
    }).compile();

    controllerService = module.get<FarmOwnerControllerService>(
      FarmOwnerControllerService,
    );
    logger = module.get(LoggerService);
    farmOwnerService = module.get(FarmOwnerService);
  });

  it('should be defined', () => {
    expect(controllerService).toBeDefined();
  });

  describe('getOneById', () => {
    it('should call farmOwnerService.getOneById with the param id and return its result', async () => {
      const expected = { id: uuid } as IFarmOwnerGetOnePromise;
      farmOwnerService.getOneById.mockResolvedValue(expected);

      const result = await controllerService.getOneById({ param });

      expect(farmOwnerService.getOneById).toHaveBeenCalledTimes(1);
      expect(farmOwnerService.getOneById).toHaveBeenCalledWith({ id: uuid });
      expect(result).toBe(expected);
    });

    it('should propagate errors thrown by farmOwnerService.getOneById', async () => {
      const error = new Error('not found');
      farmOwnerService.getOneById.mockRejectedValue(error);

      await expect(controllerService.getOneById({ param })).rejects.toBe(error);
    });
  });

  describe('getRelationsById', () => {
    it('should call farmOwnerService.getRelationsById with the param id and return its result', async () => {
      const expected: IFarmOwnerGetRelationsPromise = {
        properties: 3,
        harvests: 7,
        crops: 12,
      };
      farmOwnerService.getRelationsById.mockResolvedValue(expected);

      const result = await controllerService.getRelationsById({ param });

      expect(farmOwnerService.getRelationsById).toHaveBeenCalledTimes(1);
      expect(farmOwnerService.getRelationsById).toHaveBeenCalledWith({
        id: uuid,
      });
      expect(result).toBe(expected);
    });

    it('should propagate errors thrown by farmOwnerService.getRelationsById', async () => {
      const error = new Error('not found');
      farmOwnerService.getRelationsById.mockRejectedValue(error);

      await expect(controllerService.getRelationsById({ param })).rejects.toBe(
        error,
      );
    });
  });

  describe('softDeleteById', () => {
    it('should call farmOwnerService.softDeleteById, log the operation and resolve to undefined', async () => {
      const expected: IFarmOwnerSoftDeletePromise = { id: uuid };
      farmOwnerService.softDeleteById.mockResolvedValue(expected);

      const result = await controllerService.softDeleteById({
        user,
        ip,
        param,
      });

      expect(farmOwnerService.softDeleteById).toHaveBeenCalledTimes(1);
      expect(farmOwnerService.softDeleteById).toHaveBeenCalledWith({
        id: uuid,
      });
      expect(logger.log).toHaveBeenCalledWith(
        `[softDeleteById] - LOGINID:${user.loginId} | FARM_OWNER_ID:${expected.id} | IP:${ip}`,
        FarmOwnerControllerService.name,
      );
      expect(result).toBeUndefined();
    });

    it('should propagate errors thrown by farmOwnerService.softDeleteById and not log success', async () => {
      const error = new Error('delete failed');
      farmOwnerService.softDeleteById.mockRejectedValue(error);

      await expect(
        controllerService.softDeleteById({ user, ip, param }),
      ).rejects.toBe(error);
      expect(logger.log).not.toHaveBeenCalled();
    });
  });

  describe('updateOneById', () => {
    const body: IFarmOwnerUpdateDTO = { fullname: 'jane doe' };

    it('should call farmOwnerService.updateOneById with body+id, log and return its result', async () => {
      const expected: IFarmOwnerUpdatePromise = { id: uuid };
      farmOwnerService.updateOneById.mockResolvedValue(expected);

      const result = await controllerService.updateOneById({
        user,
        ip,
        param,
        body,
      });

      expect(farmOwnerService.updateOneById).toHaveBeenCalledTimes(1);
      expect(farmOwnerService.updateOneById).toHaveBeenCalledWith({
        data: body,
        id: uuid,
      });
      expect(logger.log).toHaveBeenCalledWith(
        `[updateOneById] - LOGINID:${user.loginId} | FARM_OWNER_ID:${expected.id} | IP:${ip}`,
        FarmOwnerControllerService.name,
      );
      expect(result).toBe(expected);
    });

    it('should propagate errors thrown by farmOwnerService.updateOneById and not log success', async () => {
      const error = new Error('update failed');
      farmOwnerService.updateOneById.mockRejectedValue(error);

      await expect(
        controllerService.updateOneById({ user, ip, param, body }),
      ).rejects.toBe(error);
      expect(logger.log).not.toHaveBeenCalled();
    });
  });

  describe('createMany', () => {
    const body: IFarmOwnerBulkCreateDTO = {
      data: [ownerData, { ...ownerData, fullname: 'jane doe' }],
    };

    it('should call farmOwnerService.createMany with body.data, log once per result and return its result', async () => {
      const expected: IFarmOwnerCreatePromise[] = [
        { id: uuid, fullname: 'john doe' },
        { id: uuid, fullname: 'jane doe' },
      ];
      farmOwnerService.createMany.mockResolvedValue(expected);

      const result = await controllerService.createMany({ user, ip, body });

      expect(farmOwnerService.createMany).toHaveBeenCalledTimes(1);
      expect(farmOwnerService.createMany).toHaveBeenCalledWith({
        data: body.data,
      });

      expect(logger.log).toHaveBeenCalledTimes(expected.length);
      expect(logger.log).toHaveBeenNthCalledWith(
        1,
        `[createMany] - LOGINID:${user.loginId} | FARM_OWNER_ID:${expected[0].id} | IP:${ip}`,
        FarmOwnerControllerService.name,
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        2,
        `[createMany] - LOGINID:${user.loginId} | FARM_OWNER_ID:${expected[1].id} | IP:${ip}`,
        FarmOwnerControllerService.name,
      );

      expect(result).toBe(expected);
    });

    it('should propagate errors thrown by farmOwnerService.createMany and not log success', async () => {
      const error = new Error('create failed');
      farmOwnerService.createMany.mockRejectedValue(error);

      await expect(
        controllerService.createMany({ user, ip, body }),
      ).rejects.toBe(error);
      expect(logger.log).not.toHaveBeenCalled();
    });
  });

  describe('search', () => {
    const query: IFarmOwnerSearchDTO = {
      fullname: 'john',
      city: 'sao paulo',
      state: 'sp',
    };

    it('should call farmOwnerService.search with the query and return its result', async () => {
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
      farmOwnerService.search.mockResolvedValue(expected);

      const result = await controllerService.search({ query });

      expect(farmOwnerService.search).toHaveBeenCalledTimes(1);
      expect(farmOwnerService.search).toHaveBeenCalledWith(query);
      expect(result).toBe(expected);
    });

    it('should propagate errors thrown by farmOwnerService.search', async () => {
      const error = new Error('search failed');
      farmOwnerService.search.mockRejectedValue(error);

      await expect(controllerService.search({ query })).rejects.toBe(error);
    });
  });
});
