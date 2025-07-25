import { Injectable } from '@nestjs/common'
import { BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { ElectronLoggerService } from '../common/logger/electron-logger.service'

/**
 * 窗口管理服务
 * 负责创建和管理应用窗口
 */
@Injectable()
export class WindowService {
  private readonly logger = new ElectronLoggerService().createScopedLogger('WindowService')
  private mainWindow: BrowserWindow | null = null

  /**
   * 创建主窗口的静态工厂方法
   * 用于 ElectronModule 配置
   */
  static createMainWindowFactory(): BrowserWindow {
    const windowService = new WindowService()
    return windowService.createMainWindow()
  }

  /**
   * 创建主窗口
   */
  createMainWindow(): BrowserWindow {
    this.logger.info('创建主窗口...')

    this.mainWindow = new BrowserWindow({
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

    this.setupWindowEvents()
    this.loadWindowContent()

    return this.mainWindow
  }

  /**
   * 获取主窗口实例
   */
  getMainWindow(): BrowserWindow | null {
    return this.mainWindow
  }

  /**
   * 设置窗口事件监听
   */
  private setupWindowEvents(): void {
    if (!this.mainWindow) return

    this.mainWindow.on('ready-to-show', () => {
      this.logger.info('主窗口准备就绪，显示窗口')
      this.mainWindow?.show()
    })

    this.mainWindow.on('closed', () => {
      this.logger.info('主窗口已关闭')
      this.mainWindow = null
    })

    this.mainWindow.webContents.setWindowOpenHandler((details) => {
      this.logger.info('拦截外部链接:', details.url)
      import('electron').then(({ shell }) => {
        shell.openExternal(details.url)
      })
      return { action: 'deny' }
    })
  }

  /**
   * 加载窗口内容
   */
  private loadWindowContent(): void {
    if (!this.mainWindow) return

    // 开发环境加载开发服务器，生产环境加载本地文件
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.logger.info('开发环境：加载开发服务器')
      this.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      this.logger.info('生产环境：加载本地文件')
      this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
  }
}
