import { contextBridge, ipcRenderer } from 'electron'
import type { IpcChannelMap, IpcChannelNames } from '@shared/types/ipc'

/**
 * ============================================
 * 安全的预加载脚本
 * ============================================
 *
 * 在沙盒模式下运行，严格限制暴露的 API
 */

// 允许的 IPC 通道白名单
const ALLOWED_CHANNELS: readonly string[] = [
  'registry/ping',
  'registry/status',
  'registry/test',
  'registry/validate-user',
  'registry/search-images',
  'registry/complex-data',
  'registry/async-operation',
  'registry/throw-error',
  // 窗口控制通道
  'window/minimize',
  'window/toggle-maximize',
  'window/close',
  'window/is-maximized'
] as const

/**
 * 验证 IPC 通道是否在白名单中
 */
function isChannelAllowed(channel: string): boolean {
  return ALLOWED_CHANNELS.includes(channel)
}

/**
 * 安全的输入验证和清理
 */
function sanitizeInput(input: unknown): unknown {
  if (input === null || input === undefined) {
    return input
  }

  if (typeof input === 'string') {
    // 防止 XSS 和脚本注入
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim()
  }

  if (typeof input === 'object' && input !== null) {
    if (Array.isArray(input)) {
      return input.map(sanitizeInput)
    }

    const sanitized: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(input)) {
      // 只允许字母数字和下划线的键名
      if (/^[a-zA-Z0-9_]+$/.test(key)) {
        sanitized[key] = sanitizeInput(value)
      }
    }
    return sanitized
  }

  return input
}

// 安全的 electronAPI，增加了验证和日志记录
const electronAPI = {
  ipcRenderer: {
    send: (channel: string, ...args: unknown[]): void => {
      if (!isChannelAllowed(channel)) {
        console.error('安全错误：不允许的 IPC 通道:', channel)
        throw new Error(`不允许的 IPC 通道: ${channel}`)
      }

      const sanitizedArgs = args.map(sanitizeInput)
      console.debug('IPC发送:', { channel, args: sanitizedArgs })
      ipcRenderer.send(channel, ...sanitizedArgs)
    },

    invoke: async (channel: string, ...args: unknown[]): Promise<unknown> => {
      if (!isChannelAllowed(channel)) {
        console.error('安全错误：不允许的 IPC 通道:', channel)
        throw new Error(`不允许的 IPC 通道: ${channel}`)
      }

      const sanitizedArgs = args.map(sanitizeInput)
      console.debug('IPC调用:', { channel, args: sanitizedArgs })

      try {
        const result = await ipcRenderer.invoke(channel, ...sanitizedArgs)
        console.debug('IPC响应:', { channel, result })
        return result
      } catch (error) {
        console.error('IPC调用失败:', { channel, error })
        throw error
      }
    },

    on: (channel: string, listener: (...args: unknown[]) => void): (() => void) => {
      if (!isChannelAllowed(channel)) {
        console.error('安全错误：不允许的 IPC 通道:', channel)
        throw new Error(`不允许的 IPC 通道: ${channel}`)
      }

      const wrappedListener = (_event: unknown, ...args: unknown[]): void => {
        const sanitizedArgs = args.map(sanitizeInput)
        listener(...sanitizedArgs)
      }

      ipcRenderer.on(channel, wrappedListener)
      return (): void => {
        ipcRenderer.removeListener(channel, wrappedListener)
      }
    },

    once: (channel: string, listener: (...args: unknown[]) => void): (() => void) => {
      if (!isChannelAllowed(channel)) {
        console.error('安全错误：不允许的 IPC 通道:', channel)
        throw new Error(`不允许的 IPC 通道: ${channel}`)
      }

      const wrappedListener = (_event: unknown, ...args: unknown[]): void => {
        const sanitizedArgs = args.map(sanitizeInput)
        listener(...sanitizedArgs)
      }

      ipcRenderer.once(channel, wrappedListener)
      return (): void => {
        ipcRenderer.removeListener(channel, wrappedListener)
      }
    },

    removeAllListeners: (channel: string): void => {
      if (!isChannelAllowed(channel)) {
        console.error('安全错误：不允许的 IPC 通道:', channel)
        throw new Error(`不允许的 IPC 通道: ${channel}`)
      }

      ipcRenderer.removeAllListeners(channel)
    }
  },

  // 只暴露必要的进程信息，隐藏敏感信息
  process: {
    platform: process.platform,
    versions: {
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node
    }
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
 * Window 窗口控制 API
 */
const windowApi = {
  minimize: (): Promise<void> => ipcRenderer.invoke('window/minimize'),
  toggleMaximize: (): Promise<void> => ipcRenderer.invoke('window/toggle-maximize'),
  close: (): Promise<void> => ipcRenderer.invoke('window/close'),
  isMaximized: (): Promise<boolean> => ipcRenderer.invoke('window/is-maximized')
} as const

/**
 * 完整的 API 接口
 */
const api = {
  registry: registryApi,
  window: windowApi
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
export type WindowApi = typeof windowApi
