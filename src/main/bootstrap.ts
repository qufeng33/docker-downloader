import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions } from '@nestjs/microservices'
import { ElectronIpcTransport } from '@doubleshot/nest-electron'
import { app } from 'electron'
import { AppModule } from './app.module'
import { initializeLogging, bootstrapLogger } from './modules/logger/logger.config'
import { LoggerService } from './modules/logger/logger.service'
import type { INestMicroservice } from '@nestjs/common'

/**
 * 启动 NestJS 微服务应用
 */
export async function bootstrap(): Promise<INestMicroservice> {
  // 1. 在所有操作之前，先初始化底层日志系统
  initializeLogging()

  try {
    // 等待 Electron 应用准备就绪
    await app.whenReady()

    bootstrapLogger.info('开始启动 NestJS 微服务应用...')

    // 创建 NestJS 微服务应用，使用临时的引导日志器
    const nestApp = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      strategy: new ElectronIpcTransport(),
      logger: bootstrapLogger,
      bufferLogs: true
    })

    // 用 DI 容器中的 LoggerService 实例替换掉临时日志器
    nestApp.useLogger(nestApp.get(LoggerService))

    // 启动微服务
    await nestApp.listen()

    bootstrapLogger.info('NestJS 微服务应用启动成功')

    return nestApp
  } catch (error) {
    bootstrapLogger.error('NestJS 微服务应用启动失败', error)
    throw error
  }
}
