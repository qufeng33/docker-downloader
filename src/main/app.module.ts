import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ElectronModule } from '@doubleshot/nest-electron'
import { WindowModule } from './modules/window/window.module'
import { RegistryModule } from './modules/registry/registry.module'
import { SecurityModule } from './modules/security/security.module'
import { WindowService } from './modules/window/window.service'
import { LoggerModule } from './modules/logger/logger.module'

/**
 * 应用根模块
 */
@Module({
  imports: [
    // 日志模块
    LoggerModule,

    // 安全模块
    SecurityModule,

    // 窗口管理模块
    WindowModule,

    // 仓库管理模块
    RegistryModule,

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
export class AppModule {}
