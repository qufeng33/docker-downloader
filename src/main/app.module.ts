import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ElectronModule } from '@doubleshot/nest-electron'
import { LoggerModule } from './common/logger/logger.module'
import { WindowModule } from './modules/window/window.module'
import { WindowService } from './services/window.service'
import { ElectronLoggerService } from './common/logger/electron-logger.service'

/**
 * 应用根模块
 */
@Module({
  imports: [
    // 全局日志模块
    LoggerModule,

    // 窗口管理模块
    WindowModule,

    // 全局配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env']
    }),

    // 事件发射器模块
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false
    }),

    // Electron 模块配置
    ElectronModule.registerAsync({
      useFactory: (windowService: WindowService) => {
        return windowService.createMainWindow()
      },
      inject: [WindowService],
      isGlobal: true
    })
  ],
  controllers: [],
  providers: []
})
export class AppModule {
  private readonly logger = new ElectronLoggerService().createScopedLogger('AppModule')

  constructor() {
    this.logger.info('AppModule 初始化完成')
  }
}
