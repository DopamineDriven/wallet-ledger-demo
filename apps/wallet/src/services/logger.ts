import type { Logger as PinoLogger, LoggerOptions } from "pino";
import pino, { stdTimeFunctions } from "pino";

export interface LogContext {
  userId?: string | undefined;
  action?: string | undefined;
  duration?: number | string | undefined;
  error?: unknown;
  [key: string]: unknown;
}

export interface LoggerConfig {
  serviceName: string;
  isProd: boolean;
  logLevel?: string | undefined;
}

/**
 * LoggerService - Pino-based structured logging
 *
 * Singleton logger with pretty printing in development.
 */
export class LoggerService {
  private static instance: LoggerService | null = null;
  private readonly logger: PinoLogger;
  private readonly config: LoggerConfig;

  private constructor(config: LoggerConfig) {
    this.config = config;
    this.logger = this.createLogger();
  }

  public static getInstance(config?: LoggerConfig): LoggerService {
    if (!LoggerService.instance) {
      if (!config) {
        throw new Error("LoggerService requires config on first initialization");
      }
      LoggerService.instance = new LoggerService(config);
    }
    return LoggerService.instance;
  }

  private createLogger(): PinoLogger {
    const baseOptions: LoggerOptions = {
      name: this.config.serviceName,
      level: this.config.logLevel ?? (this.config.isProd ? "info" : "debug"),
      timestamp: stdTimeFunctions.isoTime,
      formatters: {
        level: (label) => ({ level: label })
      },
      base: {
        service: this.config.serviceName,
        pid: process.pid
      }
    };

    if (this.config.isProd) {
      return pino(baseOptions);
    }

    // Development: pretty transport
    return pino({
      ...baseOptions,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          levelFirst: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname"
        }
      }
    });
  }

  public info(message: string, context?: LogContext): void {
    this.logger.info(context ?? {}, message);
  }

  public debug(message: string, context?: LogContext): void {
    this.logger.debug(context ?? {}, message);
  }

  public warn(message: string, context?: LogContext): void {
    this.logger.warn(context ?? {}, message);
  }

  public error(message: string, context?: LogContext): void {
    const errorContext = this.formatError(context);
    this.logger.error(errorContext, message);
  }

  public fatal(message: string, context?: LogContext): void {
    const errorContext = this.formatError(context);
    this.logger.fatal(errorContext, message);
  }

  public startTimer(): () => number {
    const start = process.hrtime.bigint();
    return () => Number(process.hrtime.bigint() - start) / 1e6;
  }

  private formatError(context?: LogContext): LogContext {
    if (!context?.error) return context ?? {};

    const { error, ...rest } = context;
    if (error instanceof Error) {
      return {
        ...rest,
        error: {
          message: error.message,
          name: error.name,
          stack: this.config.isProd ? undefined : error.stack,
          cause: error.cause
        }
      };
    }

    return { error, ...rest };
  }

  public getPino(): PinoLogger {
    return this.logger;
  }
}
