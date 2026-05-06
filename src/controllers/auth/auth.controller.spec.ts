import type { IAuthenticatedUser } from '@app/auth';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from './auth.controller';
import { IAuthCreateDTO, IAuthPutPasswordDTO } from './auth.dto';
import { IAuthLoginCreatePromise, IAuthLoginPromise } from './auth.interface';
import { AuthenticationControllerService } from './auth.service';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;
  let controllerService: jest.Mocked<AuthenticationControllerService>;

  const user: IAuthenticatedUser = {
    username: 'admin',
    loginId: '00000000-0000-0000-0000-000000000001',
  };
  const ip = '127.0.0.1';

  beforeEach(async () => {
    const serviceMock: jest.Mocked<AuthenticationControllerService> = {
      login: jest.fn(),
      createOne: jest.fn(),
      update: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        {
          provide: AuthenticationControllerService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
    controllerService = module.get<
      jest.Mocked<AuthenticationControllerService>
    >(AuthenticationControllerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should successfully login by controllerService.login and return the jwt token', async () => {
      const expected: IAuthLoginPromise = { access_token: 'jwt-token' };
      controllerService.login.mockResolvedValue(expected);

      const result = await controller.login(user, ip);

      expect(controllerService.login).toHaveBeenCalledTimes(1);
      expect(controllerService.login).toHaveBeenCalledWith({ user, ip });

      expect(result).toEqual(expected);
    });

    it('should propagate errors thrown by controllerService.login', async () => {
      const error = new Error('login failed');
      controllerService.login.mockRejectedValue(error);

      await expect(controller.login(user, ip)).rejects.toBe(error);
      expect(controllerService.login).toHaveBeenCalledWith({ user, ip });
    });
  });

  describe('register', () => {
    const body: IAuthCreateDTO = {
      username: 'johndoe',
      password: 'NewPass_1',
      email: 'john@doe.com',
    };

    it('should return the uuid of new registered user by controllerService.createOne', async () => {
      const expected: IAuthLoginCreatePromise = {
        id: '00000000-0000-0000-0000-000000000099',
      };
      controllerService.createOne.mockResolvedValue(expected);

      const result = await controller.register(user, ip, body);

      expect(controllerService.createOne).toHaveBeenCalledTimes(1);
      expect(controllerService.createOne).toHaveBeenCalledWith({
        body,
        ip,
        user,
      });
      expect(result).toBe(expected);
    });

    it('should propagate errors thrown by controllerService.createOne', async () => {
      const error = new Error('create failed');
      controllerService.createOne.mockRejectedValue(error);

      await expect(controller.register(user, ip, body)).rejects.toBe(error);
      expect(controllerService.createOne).toHaveBeenCalledWith({
        body,
        ip,
        user,
      });
    });
  });

  describe('update', () => {
    const body: IAuthPutPasswordDTO = {
      currentPassword: 'OldPass_1',
      newPassword: 'NewPass_1',
    };

    it('should return http 200 when successfully update user pass by controllerService.update', async () => {
      controllerService.update.mockResolvedValue(undefined);

      const result = await controller.update(user, ip, body);

      expect(controllerService.update).toHaveBeenCalledTimes(1);
      expect(controllerService.update).toHaveBeenCalledWith({
        body,
        ip,
        user,
      });
      expect(result).toBeUndefined();
    });

    it('should propagate errors thrown by controllerService.update', async () => {
      const error = new Error('update failed');
      controllerService.update.mockRejectedValue(error);

      await expect(controller.update(user, ip, body)).rejects.toBe(error);
      expect(controllerService.update).toHaveBeenCalledWith({
        body,
        ip,
        user,
      });
    });
  });
});
