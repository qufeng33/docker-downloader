import { Injectable, LoggerService, LogLevel } from '@nestjs/common'
import * as electronLog from 'electron-log'

/**
 * 基于 electron-log 的 NestJS Logger 服务
 * 提供统一的日志接口，支持跨进程日志记录
 */
@Injectable()
export class ElectronLoggerService implements LoggerService {
  private readonly logger = electronLog.scope('NestJS')

  constructor() {
    this.configureLogger()
  }

  /**
   * 配置日志系统
   */
  private configureLogger(): void {
    // 设置日志级别
    const isDevelopment = process.env.NODE_ENV === 'development'
    electronLog.transports.console.level = isDevelopment ? 'debug' : 'info'
    electronLog.transports.file.level = 'info'

    // 设置统一的日志格式
    const logFormat = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] [{scope}] {text}'
    electronLog.transports.console.format = logFormat
    electronLog.transports.file.format = logFormat

    // 配置文件日志
    electronLog.transports.file.maxSize = 10 * 1024 * 1024 // 10MB
    electronLog.transports.file.archiveLogFn = (oldLogFile) => {
      this.logger.info(`归档旧日志文件: ${oldLogFile.path}`)
    }

    // 配置控制台日志颜色
    if (isDevelopment) {
      electronLog.transports.console.useStyles = true
    }

    this.logger.info('ElectronLoggerService 初始化完成')
  }

  /**
   * 记录普通日志
   */
  log(message: string | object | Error, context?: string): void {
    const formattedMessage = this.formatMessage(message, context)
    this.logger.info(formattedMessage)
  }

  /**
   * 记录错误日志
   */
  error(message: string | object | Error, trace?: string, context?: string): void {
    const formattedMessage = this.formatMessage(message, context)
    if (trace) {
      this.logger.error(formattedMessage, '\n', trace)
    } else {
      this.logger.error(formattedMessage)
    }
  }

  /**
   * 记录警告日志
   */
  warn(message: string | object | Error, context?: string): void {
    const formattedMessage = this.formatMessage(message, context)
    this.logger.warn(formattedMessage)
  }

  /**
   * 记录调试日志
   */
  debug(message: string | object | Error, context?: string): void {
    const formattedMessage = this.formatMessage(message, context)
    this.logger.debug(formattedMessage)
  }

  /**
   * 记录详细日志
   */
  verbose(message: string | object | Error, context?: string): void {
    const formattedMessage = this.formatMessage(message, context)
    this.logger.verbose(formattedMessage)
  }

  /**
   * 设置日志级别
   */
  setLogLevels(levels: LogLevel[]): void {
    // NestJS LogLevel 到 electron-log level 的映射
    const electronLogLevel = this.mapNestLogLevelToElectronLog(levels)
    electronLog.transports.console.level = electronLogLevel
    electronLog.transports.file.level = electronLogLevel
  }

  /**
   * 格式化日志消息
   */
  private formatMessage(message: string | object | Error, context?: string): string {
    const contextStr = context ? `[${context}] ` : ''

    if (message instanceof Error) {
      return `${contextStr}${message.message}`
    }

    if (typeof message === 'object') {
      return `${contextStr}${JSON.stringify(message, null, 2)}`
    }

    return `${contextStr}${String(message)}`
  }

  /**
   * 映射 NestJS LogLevel 到 electron-log level
   */
  private mapNestLogLevelToElectronLog(levels: LogLevel[]): electronLog.LogLevel {
    if (levels.includes('verbose')) return 'verbose'
    if (levels.includes('debug')) return 'debug'
    if (levels.includes('log')) return 'info'
    if (levels.includes('warn')) return 'warn'
    if (levels.includes('error')) return 'error'
    return 'info'
  }

  /**
   * 创建带作用域的日志器
   */
  createScopedLogger(scope: string): electronLog.LogFunctions {
    return electronLog.scope(scope)
  }

  /**
   * 获取原始的 electron-log 实例（用于特殊场景）
   */
  getRawLogger(): typeof electronLog {
    return electronLog
  }
}
