import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import pino, { Logger } from 'pino';
import pinoPretty from 'pino-pretty';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: Logger;

  constructor() {
    const streams = this.buildStreams();

    this.logger = pino(
      {
        level: 'info',
        base: null,
      },
      pino.multistream(streams),
    );
  }

  private buildStreams() {
    const streams: pino.StreamEntry[] = [];
    const pretty = pinoPretty({
      colorize: true,
      translateTime: 'SYS:dd/mm/yyyy - HH:MM:ss',
      ignore: 'pid,hostname',
    });
    streams.push({ stream: pretty });
    return streams;
  }

  private formatMessage(message: any, context?: string): string {
    const msg = typeof message === 'string' ? message : JSON.stringify(message);
    return context ? `[${context}] - ${msg}` : msg;
  }

  log(message: any, context?: string) {
    this.logger.info(this.formatMessage(message, context));
  }

  error(msg: unknown, context?: string, trace?: unknown) {
    this.logger.error({ msg, trace, context });
  }

  warn(msg: any, context?: string) {
    this.logger.warn(this.formatMessage(msg, context));
  }

  debug(msg: any, context?: string) {
    this.logger.debug(this.formatMessage(msg, context));
  }

  verbose(msg: any, context?: string) {
    this.logger.trace?.(this.formatMessage(msg, context));
  }
}
