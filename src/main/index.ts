/// <reference types="electron-vite/node" />

import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import 'reflect-metadata'
import { bootstrap } from './bootstrap'
import { Logger } from '@nestjs/common'
import type { INestMicroservice } from '@nestjs/common'

// 应用生命周期管理
let nestApp: INestMicroservice | null = null
const appLogger = new Logger('App')

/**
 * 应用启动入口
 */
async function startApplication(): Promise<void> {
  try {
    // 设置应用用户模型 ID
    electronApp.setAppUserModelId('com.docker-downloader')

    // 启动 NestJS 微服务
    nestApp = await bootstrap()

    // 配置开发工具快捷键
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    // macOS 激活处理
    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) {
        appLogger.log('macOS 激活：重新创建窗口')
      }
    })

    appLogger.log('应用启动完成')
  } catch (error) {
    appLogger.error('应用启动失败:', error instanceof Error ? error.stack : String(error))
    app.quit()
  }
}

// 当 Electron 完成初始化并准备创建浏览器窗口时调用
app.whenReady().then(startApplication)

// 当所有窗口关闭时退出应用（macOS 除外）
app.on('window-all-closed', () => {
  appLogger.log('所有窗口已关闭')
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 应用即将退出时的清理工作
app.on('before-quit', async () => {
  appLogger.log('应用即将退出，执行清理工作...')
  if (nestApp) {
    try {
      await nestApp.close()
      appLogger.log('NestJS 微服务已关闭')
    } catch (error) {
      appLogger.error(
        '关闭 NestJS 微服务时出错:',
        error instanceof Error ? error.stack : String(error)
      )
    }
  }
})
