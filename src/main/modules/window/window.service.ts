import { Injectable, Logger } from '@nestjs/common'
import { BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import {
  THEME_COLORS,
  WINDOW_CONFIG,
  PLATFORM_CONFIG,
  getPlatformConfig
} from '@shared/config/theme'

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

    // 获取平台配置
    const { isMacOS, isWindows, config } = getPlatformConfig()

    const windowConfig = {
      ...WINDOW_CONFIG.DEFAULT_SIZE,
      show: false,
      autoHideMenuBar: true,

      // 统一的窗口配置 - 使用主题系统
      frame: !isWindows, // Windows无边框，macOS保持边框
      titleBarStyle: isMacOS ? ('hidden' as const) : ('default' as const),
      titleBarOverlay: isWindows
        ? {
            color: THEME_COLORS.WINDOW_BACKGROUND, // 使用统一背景色
            symbolColor: '#000000',
            height: config.DRAG_AREA_HEIGHT
          }
        : undefined,
      trafficLightPosition: isMacOS
        ? (PLATFORM_CONFIG.MACOS.TRAFFIC_LIGHT_POSITION as { x: number; y: number })
        : undefined,
      vibrancy: undefined, // 禁用毛玻璃效果避免颜色干扰
      transparent: false,
      backgroundColor: WINDOW_CONFIG.BACKGROUND_COLOR, // 关键：使用统一背景色
      icon: join(__dirname, '../../../../resources/icon.png'),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: true,
        contextIsolation: true,
        nodeIntegration: false,
        nodeIntegrationInSubFrames: false,
        nodeIntegrationInWorker: false,
        webSecurity: true,
        allowRunningInsecureContent: false,
        experimentalFeatures: false,
        enableRemoteModule: false,
        enableBlinkFeatures: '',
        disableBlinkFeatures: 'Auxclick',
        spellcheck: true,
        plugins: false,
        javascript: true, // 我们需要 JavaScript，但在受控环境中
        images: true,
        java: false,
        webgl: false,
        devTools: is.dev,
        enableAccessibilityEvents: false,
        backgroundThrottling: true
      }
    }

    this.mainWindow = new BrowserWindow(windowConfig)

    this.setupSecurityEvents()
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
   * 最小化窗口
   */
  minimizeWindow(): void {
    this.mainWindow?.minimize()
  }

  /**
   * 最大化/恢复窗口
   */
  toggleMaximizeWindow(): void {
    if (this.mainWindow?.isMaximized()) {
      this.mainWindow.unmaximize()
    } else {
      this.mainWindow?.maximize()
    }
  }

  /**
   * 关闭窗口
   */
  closeWindow(): void {
    this.mainWindow?.close()
  }

  /**
   * 检查窗口是否最大化
   */
  isMaximized(): boolean {
    return this.mainWindow?.isMaximized() ?? false
  }

  /**
   * 设置安全事件监听
   */
  private setupSecurityEvents(): void {
    if (!this.mainWindow) return

    // 拦截新窗口创建
    this.mainWindow.webContents.setWindowOpenHandler((details) => {
      this.logger.warn('安全警告：拦截新窗口创建请求', { url: details.url })

      // 只允许 HTTPS 链接在外部浏览器中打开
      if (details.url.startsWith('https://')) {
        import('electron').then(({ shell }) => {
          shell.openExternal(details.url).catch((err) => {
            this.logger.error('打开外部链接失败:', err)
          })
        })
      } else {
        this.logger.warn('安全警告：拒绝打开非 HTTPS 链接', { url: details.url })
      }

      return { action: 'deny' }
    })

    // 拦截导航请求
    this.mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
      const parsedUrl = new URL(navigationUrl)

      // 只允许导航到本地开发服务器或本地文件
      if (is.dev && parsedUrl.origin === process.env['ELECTRON_RENDERER_URL']) {
        this.logger.debug('允许导航到开发服务器:', navigationUrl)
        return
      }

      if (parsedUrl.protocol === 'file:') {
        this.logger.debug('允许导航到本地文件:', navigationUrl)
        return
      }

      // 拒绝其他所有导航
      this.logger.warn('安全警告：拦截导航请求', { url: navigationUrl })
      event.preventDefault()
    })

    // 拦截子框架导航
    this.mainWindow.webContents.on(
      'did-frame-navigate',
      (_event, url, httpResponseCode, _httpStatusText, isMainFrame, frameProcessId) => {
        if (!isMainFrame) {
          this.logger.warn('安全警告：检测到子框架导航', {
            url,
            httpResponseCode,
            frameProcessId
          })
        }
      }
    )

    // 监控权限请求
    this.mainWindow.webContents.session.setPermissionRequestHandler(
      (_webContents, permission, callback, details) => {
        this.logger.warn('安全警告：权限请求', { permission, details })

        // 拒绝所有权限请求（根据需要可以选择性允许）
        const allowedPermissions: string[] = []

        if (allowedPermissions.includes(permission)) {
          this.logger.log('允许权限:', permission)
          callback(true)
        } else {
          this.logger.warn('拒绝权限:', permission)
          callback(false)
        }
      }
    )

    // 监控证书错误
    this.mainWindow.webContents.session.setCertificateVerifyProc((request, callback) => {
      // 在开发环境中，我们可能需要接受自签名证书
      if (is.dev && request.hostname === 'localhost') {
        this.logger.debug('开发环境：接受 localhost 证书')
        callback(0) // 0 表示信任
        return
      }

      // 生产环境中严格验证证书
      callback(-2) // -2 表示使用系统验证
    })

    // 监控控制台消息（用于检测潜在的安全问题）
    this.mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
      if (level >= 2) {
        // 警告和错误级别
        this.logger.warn('渲染进程控制台消息:', { level, message, line, sourceId })
      }
    })
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
