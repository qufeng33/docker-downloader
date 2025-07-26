/**
 * ============================================
 * 预加载脚本类型定义
 * ============================================
 *
 * 包含预加载脚本特定的类型扩展和环境声明
 * 业务类型已迁移到 src/shared/types/ 目录
 */

/// <reference types="electron" />

import type { ExposedApi } from './index'

/**
 * ============================================
 * 全局环境扩展
 * ============================================
 */

declare global {
  /**
   * Window 接口扩展 - 为渲染进程提供类型安全的 API 访问
   */
  interface Window {
    /**
     * Electron 标准 API（简化版本）
     */
    electron: {
      ipcRenderer: {
        send: (channel: string, ...args: unknown[]) => void
        invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
        on: (channel: string, listener: (...args: unknown[]) => void) => () => void
        once: (channel: string, listener: (...args: unknown[]) => void) => () => void
        removeAllListeners: (channel: string) => void
      }
      process: {
        platform: NodeJS.Platform
        versions: NodeJS.ProcessVersions
      }
    }

    /**
     * 应用程序业务 API
     * 类型安全的 IPC 通信接口
     */
    api: ExposedApi
  }

  /**
   * Node.js 环境变量扩展（仅主进程可用）
   */
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test'
      ELECTRON_RENDERER_URL?: string
      ELECTRON_MAIN_URL?: string
    }
  }
}

/**
 * ============================================
 * 第三方库类型增强
 * ============================================
 */

declare module '@electron-toolkit/preload' {
  export interface ElectronAPI {
    readonly platform: string
    readonly ipcRenderer: Electron.IpcRenderer
    readonly process: {
      readonly platform: NodeJS.Platform
      readonly versions: NodeJS.ProcessVersions
    }
  }
}
