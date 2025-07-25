import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions } from '@nestjs/microservices'
import { ElectronIpcTransport } from '@doubleshot/nest-electron'
import { app } from 'electron'
import { AppModule } from './app.module'
import { ElectronLoggerService } from './common/logger/electron-logger.service'
import type { INestMicroservice } from '@nestjs/common'

/**
 * 启动 NestJS 微服务应用
 */
export async function bootstrap(): Promise<INestMicroservice> {
  // 创建启动阶段的日志器
  const bootstrapLogger = new ElectronLoggerService()

  try {
    // 等待 Electron 应用准备就绪
    await app.whenReady()

    bootstrapLogger.log('开始启动 NestJS 微服务应用...', 'Bootstrap')

    // 创建 NestJS 微服务应用，使用自定义日志器
    const nestApp = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      strategy: new ElectronIpcTransport(),
      logger: bootstrapLogger, // 使用统一的日志器
      bufferLogs: true // 缓冲日志直到应用完全启动
    })

    // 启动微服务
    await nestApp.listen()

    bootstrapLogger.log('NestJS 微服务应用启动成功', 'Bootstrap')

    return nestApp
  } catch (error) {
    bootstrapLogger.error(
      'NestJS 微服务应用启动失败',
      error instanceof Error ? error.stack : String(error),
      'Bootstrap'
    )
    throw error
  }
}
