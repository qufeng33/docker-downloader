/**
 * ====================================
 * API 相关类型和工具
 * ====================================
 *
 * 这里包含渲染进程使用的 API 类型和工具函数
 */

// 重新导出所有基础类型
export * from './base'
export * from './ipc'

/**
 * Window API 接口定义
 * 定义在 window 对象上暴露的 API 结构
 */
export interface WindowElectronAPI {
  ipcRenderer: {
    send: (channel: string, ...args: unknown[]) => void
    invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
    on: (channel: string, func: (...args: unknown[]) => void) => void
    once: (channel: string, func: (...args: unknown[]) => void) => void
    removeAllListeners: (channel: string) => void
  }
  process: {
    platform: NodeJS.Platform
    versions: {
      chrome: string
      node: string
      electron: string
      [key: string]: string
    }
  }
}

/**
 * Registry API 接口
 */
export interface RegistryAPI {
  ping: () => Promise<import('./base').PingResponse>
  status: () => Promise<import('./base').ServiceStatus>
  test: (
    data: import('./base').TestRequest | Record<string, unknown>
  ) => Promise<import('./base').TestResponse>
  validateUser: (userData: import('./base').UserInfo) => Promise<import('./base').ValidationResult>
  searchImages: (
    searchData: import('./base').ImageSearchRequest
  ) => Promise<import('./base').ImageSearchResponse>
  complexData: (complexData: import('./base').ComplexData) => Promise<import('./base').TestResponse>
  throwError: (errorType: string) => Promise<never>
  asyncOperation: (delay: number) => Promise<import('./base').AsyncOperation>
}

/**
 * 完整的应用 API 接口
 */
export interface AppAPI {
  registry: RegistryAPI
}

/**
 * Window 全局类型扩展
 */
declare global {
  interface Window {
    electron: WindowElectronAPI
    api: AppAPI
  }
}
