import { LoggerService } from '@app/logger';
import { UserService } from '@app/user';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { IAuthenticatedUser } from '../../../libs/auth/src';
import { ILoginUpdatePasswordPromise } from '../../../libs/database/src';
import {
  IUserCreateParams,
  IUserCreatePromise,
} from '../../../libs/user/src/user.interface';
import { IAuthPutPasswordDTO } from './auth.dto';
import { AuthenticationControllerService } from './auth.service';

describe('AuthenticationControllerService', () => {
  let controllerService: AuthenticationControllerService;

  let logger: jest.Mocked<LoggerService>;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;

  const uuid = '00000000-0000-0000-0000-000000000001';

  const user: IAuthenticatedUser = {
    username: 'admin',
    loginId: uuid,
  };

  const ip = '127.0.0.1';

  const userCreateBody: IUserCreateParams = {
    username: 'admin',
    email: 'johndoe@test.com',
    password: 'test123',
  };

  const userUpdateBody: IAuthPutPasswordDTO = {
    currentPassword: 'old_pass',
    newPassword: 'new_pass',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationControllerService,
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            createOne: jest.fn(),
            updatePassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    controllerService = module.get<AuthenticationControllerService>(
      AuthenticationControllerService,
    );

    logger = module.get(LoggerService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(controllerService).toBeDefined();
  });

  describe('login', () => {
    it('should login and return the JWT in access_token', async () => {
      jwtService.signAsync.mockResolvedValue('jwt-token');

      const result = await controllerService.login({
        user,
        ip,
      });

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        username: user.username,
        sub: user.loginId,
      });

      expect(logger.log).toHaveBeenCalled();

      expect(result).toEqual({
        access_token: 'jwt-token',
      });
    });
  });

  describe('register', () => {
    it('should create a new user and return the uuid', async () => {
      const expected: IUserCreatePromise = { id: uuid };
      userService.createOne.mockResolvedValue(expected);

      const result = await controllerService.createOne({
        user,
        ip,
        body: userCreateBody,
      });

      expect(userService.createOne).toHaveBeenCalledTimes(1);
      expect(userService.createOne).toHaveBeenCalledWith(userCreateBody);

      expect(logger.log).toHaveBeenCalledWith(
        `[update] - ADMINID:${user.loginId} | CREATED_LOGINID:${expected.id} | IP:${ip} - USER CREATED`,
        AuthenticationControllerService.name,
      );

      expect(result).toEqual(expected);
    });

    it('should propagate errors thrown by userService.createOne and not log success', async () => {
      const error = new Error('username already taken');
      userService.createOne.mockRejectedValue(error);

      await expect(
        controllerService.createOne({ user, ip, body: userCreateBody }),
      ).rejects.toBe(error);

      expect(userService.createOne).toHaveBeenCalledWith(userCreateBody);
      expect(logger.log).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update user password', async () => {
      const expected: ILoginUpdatePasswordPromise = {
        id: uuid,
      };

      userService.updatePassword.mockResolvedValue(expected);

      const result = await controllerService.update({
        user,
        ip,
        body: userUpdateBody,
      });

      expect(userService.updatePassword).toHaveBeenCalledTimes(1);
      expect(userService.updatePassword).toHaveBeenCalledWith({
        loginId: user.loginId,
        currentPassword: userUpdateBody.currentPassword,
        newPassword: userUpdateBody.newPassword,
      });

      expect(logger.log).toHaveBeenCalledWith(
        `[update] - LOGINID:${expected.id} | IP:${ip} - PASSWORD UPDATE`,
        AuthenticationControllerService.name,
      );

      expect(result).toBeUndefined();
    });

    it('should propagate errors thrown by userService.updatePassword and not log success', async () => {
      const error = new Error('invalid password');
      userService.updatePassword.mockRejectedValue(error);

      await expect(
        controllerService.update({ user, ip, body: userUpdateBody }),
      ).rejects.toBe(error);

      expect(userService.updatePassword).toHaveBeenCalledWith({
        loginId: user.loginId,
        ...userUpdateBody,
      });
      expect(logger.log).not.toHaveBeenCalled();
    });
  });
});
