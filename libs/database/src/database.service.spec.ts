import { LoggerService } from '@app/logger';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '../prisma/generated/client';
import { DatabaseService } from './database.service';

describe('DatabaseService.errorHandler', () => {
  let service: DatabaseService;
  let logger: jest.Mocked<LoggerService>;

  beforeEach(() => {
    logger = {
      error: jest.fn(),
      warn: jest.fn(),
      log: jest.fn(),
    } as any;

    service = Object.create(DatabaseService.prototype);
    (service as any).logger = logger;
    (service as any).logContext = DatabaseService.name;
  });

  const buildKnownError = (
    code: string,
  ): Prisma.PrismaClientKnownRequestError => {
    const err = Object.create(
      Prisma.PrismaClientKnownRequestError.prototype,
    ) as Prisma.PrismaClientKnownRequestError;
    Object.assign(err, {
      code,
      message: `prisma error ${code}`,
      clientVersion: 'test',
    });
    return err;
  };

  it('should silently swallow Prisma error P2025 (record not found)', () => {
    const err = buildKnownError('P2025');

    expect(() => service.errorHandler(err)).not.toThrow();
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('should throw ConflictException with "duplicated_data" on Prisma error P2002', () => {
    const err = buildKnownError('P2002');

    expect(() => service.errorHandler(err)).toThrow(ConflictException);
    expect(() => service.errorHandler(err)).toThrow('duplicated_data');
  });

  it('should log other known Prisma errors with code and context (no rethrow)', () => {
    const err = buildKnownError('P2003');
    const data = { foo: 'bar' };

    expect(() => service.errorHandler(err, data)).not.toThrow();
    expect(logger.error).toHaveBeenCalledWith(
      `[PRISMA ERROR] - CODE:${err.code}`,
      DatabaseService.name,
      { err, data },
    );
  });

  it('should log unknown errors and throw InternalServerErrorException', () => {
    const err = new Error('unexpected');

    expect(() => service.errorHandler(err)).toThrow(
      InternalServerErrorException,
    );
    expect(logger.error).toHaveBeenCalledWith(
      '[PRISMA UNKNOWN ERROR]',
      DatabaseService.name,
      err.stack,
    );
  });
});
