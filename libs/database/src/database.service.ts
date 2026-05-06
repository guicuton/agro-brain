import { LoggerService } from '@app/logger';
import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '../prisma/generated/client';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  private logContext = DatabaseService.name;

  constructor(
    @Inject(ConfigService) cs: ConfigService,
    private readonly logger: LoggerService,
  ) {
    const adapter = new PrismaPg({
      connectionString: cs.get<string>('DATABASE.URL'),
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  errorHandler(err: Error, data?: any): void {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2025') return;
      if (err.code === 'P2002') throw new ConflictException('duplicated_data');
      this.logger.error(`[PRISMA ERROR] - CODE:${err.code}`, this.logContext, {
        err,
        data,
      });
      return;
    } else {
      this.logger.error('[PRISMA UNKNOWN ERROR]', this.logContext, err?.stack);
      throw new InternalServerErrorException('CONTACT ADMIN SERVER');
    }
  }
}
