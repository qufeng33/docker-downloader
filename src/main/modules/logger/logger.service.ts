import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common'
import log from 'electron-log/main'

@Injectable()
export class LoggerService implements NestLoggerService {
  log(message: unknown, context?: string): void {
    const scope = context || 'Application'
    log.scope(scope).info(this.formatMessage(message))
  }

  error(message: unknown, trace?: string, context?: string): void {
    const scope = context || 'Application'
    if (message instanceof Error) {
      log.scope(scope).error(message)
    } else {
      log.scope(scope).error(this.formatMessage(message), trace)
    }
  }

  warn(message: unknown, context?: string): void {
    const scope = context || 'Application'
    log.scope(scope).warn(this.formatMessage(message))
  }

  debug(message: unknown, context?: string): void {
    const scope = context || 'Application'
    log.scope(scope).debug(this.formatMessage(message))
  }

  verbose(message: unknown, context?: string): void {
    const scope = context || 'Application'
    log.scope(scope).verbose(this.formatMessage(message))
  }

  private formatMessage(message: unknown): unknown {
    // electron-log can handle objects, so just pass them through for structured logging.
    if (typeof message === 'object') {
      return message
    }
    return String(message)
  }
}
