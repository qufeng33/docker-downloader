import { contextBridge, ipcRenderer } from 'electron'
import type { IpcChannelMap, IpcChannelNames } from '@shared/types/ipc'

// 简化的 electronAPI，只包含我们需要的功能
const electronAPI = {
  ipcRenderer: {
    send: (channel: string, ...args: unknown[]): void => ipcRenderer.send(channel, ...args),
    invoke: (channel: string, ...args: unknown[]): Promise<unknown> =>
      ipcRenderer.invoke(channel, ...args),
    on: (channel: string, listener: (...args: unknown[]) => void): (() => void) => {
      const wrappedListener = (_event: unknown, ...args: unknown[]): void => listener(...args)
      ipcRenderer.on(channel, wrappedListener)
      return (): void => {
        ipcRenderer.removeListener(channel, wrappedListener)
      }
    },
    once: (channel: string, listener: (...args: unknown[]) => void): (() => void) => {
      const wrappedListener = (_event: unknown, ...args: unknown[]): void => listener(...args)
      ipcRenderer.once(channel, wrappedListener)
      return (): void => {
        ipcRenderer.removeListener(channel, wrappedListener)
      }
    },
    removeAllListeners: (channel: string): void => {
      ipcRenderer.removeAllListeners(channel)
    }
  },
  process: {
    platform: process.platform,
    versions: process.versions
  }
} as const

/**
 * ============================================
 * 类型安全的 IPC 调用系统
 * ============================================
 *
 * 使用共享类型确保类型一致性
 */

/**
 * 创建类型安全的 IPC 调用函数
 * @param channel IPC 通道名称
 * @returns 类型安全的调用函数
 */
function createIpcInvoker<T extends IpcChannelNames>(channel: T): IpcChannelMap[T] {
  return ((...args: unknown[]) => {
    try {
      return ipcRenderer.invoke(channel, ...args)
    } catch (error) {
      console.error(`IPC调用失败 [${channel}]:`, error)
      throw new Error(`IPC通信错误: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }) as IpcChannelMap[T]
}

/**
 * ============================================
 * API 接口定义
 * ============================================
 */

/**
 * Registry 模块 API
 */
const registryApi = {
  // 基础通信测试
  status: createIpcInvoker('registry/status'),
  ping: createIpcInvoker('registry/ping'),
  test: createIpcInvoker('registry/test'),

  // 业务功能接口
  validateUser: createIpcInvoker('registry/validate-user'),
  searchImages: createIpcInvoker('registry/search-images'),
  complexData: createIpcInvoker('registry/complex-data'),

  // 异步操作和错误测试
  asyncOperation: createIpcInvoker('registry/async-operation'),
  throwError: createIpcInvoker('registry/throw-error')
} as const

/**
 * 完整的 API 接口
 */
const api = {
  registry: registryApi
} as const

/**
 * ============================================
 * 安全 API 暴露
 * ============================================
 */

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    console.log('API 已安全暴露到渲染进程')
  } catch (error) {
    console.error('contextBridge API 暴露失败:', error)
    throw new Error('预加载脚本初始化失败')
  }
} else {
  console.warn('运行在非隔离模式下，安全性降低')
  // @ts-ignore (非隔离模式下的全局变量定义)
  window.electron = electronAPI
  // @ts-ignore (非隔离模式下的全局变量定义)
  window.api = api
}

/**
 * ============================================
 * 类型导出
 * ============================================
 */

export type ExposedApi = typeof api
export type RegistryApi = typeof registryApi
