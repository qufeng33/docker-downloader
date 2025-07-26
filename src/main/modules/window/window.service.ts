import { Injectable, Logger } from '@nestjs/common'
import { BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

/**
 * 窗口管理服务
 * 负责创建和管理应用窗口
 */
@Injectable()
export class WindowService {
  private readonly logger = new Logger(WindowService.name)
  private mainWindow: BrowserWindow | null = null

  /**
   * 创建主窗口
   */
  createMainWindow(): BrowserWindow {
    this.logger.log('创建主窗口...')

    // 窗口配置
    const windowConfig = {
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      show: false,
      autoHideMenuBar: true,
      titleBarStyle: 'default' as const,
      icon: join(__dirname, '../../../../resources/icon.png'),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        contextIsolation: true,
        nodeIntegration: false,
        webSecurity: true,
        allowRunningInsecureContent: false,
        experimentalFeatures: false,
        enableRemoteModule: false,
        // 开发环境允许开发者工具
        devTools: is.dev
      }
    }

    this.mainWindow = new BrowserWindow(windowConfig)

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
      this.logger.log('主窗口准备就绪，显示窗口')
      this.mainWindow?.show()
    })

    this.mainWindow.on('closed', () => {
      this.logger.log('主窗口已关闭')
      this.mainWindow = null
    })

    this.mainWindow.webContents.setWindowOpenHandler((details) => {
      this.logger.log('拦截外部链接:', details.url)
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

    // 根据环境加载不同内容
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.logger.log('开发环境：加载开发服务器 -', process.env['ELECTRON_RENDERER_URL'])
      this.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])

      // 开发环境下打开开发者工具
      if (is.dev) {
        this.mainWindow.webContents.openDevTools()
      }
    } else {
      this.logger.log('生产环境：加载本地文件')
      const indexPath = join(__dirname, '../renderer/index.html')
      this.mainWindow.loadFile(indexPath).catch((err) => {
        this.logger.error('加载本地文件失败:', err)
      })
    }
  }
}
