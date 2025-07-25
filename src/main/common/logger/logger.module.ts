import { Global, Module } from '@nestjs/common'
import { ElectronLoggerService } from './electron-logger.service'

/**
 * 全局日志模块
 * 提供统一的日志服务，可在整个应用中使用
 */
@Global()
@Module({
  providers: [ElectronLoggerService],
  exports: [ElectronLoggerService]
})
export class LoggerModule {}
