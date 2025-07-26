import { ElectronAPI } from '@electron-toolkit/preload'
import type { ExposedApi } from './index'

/**
 * 全局 Window 接口扩展
 * 为渲染进程提供类型安全的 API 访问
 */
declare global {
  interface Window {
    /**
     * Electron 标准 API
     * 来自 @electron-toolkit/preload
     */
    electron: ElectronAPI

    /**
     * 应用程序业务 API
     * 类型安全的 IPC 通信接口
     */
    api: ExposedApi
  }
}
