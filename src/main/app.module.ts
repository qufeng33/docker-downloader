import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ElectronModule } from '@doubleshot/nest-electron'
import { BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { LoggerModule } from './common/logger/logger.module'
import { ElectronLoggerService } from './common/logger/electron-logger.service'

/**
 * 创建主窗口的工厂函数
 */
function createMainWindow(): BrowserWindow {
  // 创建作用域日志器用于窗口管理
  const windowLogger = new ElectronLoggerService().createScopedLogger('Window')

  windowLogger.info('创建主窗口...')

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    windowLogger.info('主窗口准备就绪，显示窗口')
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    windowLogger.info('主窗口已关闭')
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    windowLogger.info('拦截外部链接:', details.url)
    import('electron').then(({ shell }) => {
      shell.openExternal(details.url)
    })
    return { action: 'deny' }
  })

  // 开发环境加载开发服务器，生产环境加载本地文件
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    windowLogger.info('开发环境：加载开发服务器')
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    windowLogger.info('生产环境：加载本地文件')
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

/**
 * 应用根模块
 */
@Module({
  imports: [
    // 全局日志模块
    LoggerModule,

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
      useFactory: () => createMainWindow(),
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
