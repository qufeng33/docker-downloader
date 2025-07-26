import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

/**
 * ============================================
 * 独立的 IPC 类型定义系统
 * 不依赖主进程的装饰器类和依赖
 * ============================================
 */

/**
 * 服务状态响应类型
 */
interface ServiceStatusDto {
  status: string
  message: string
  timestamp: string
}

/**
 * 测试请求类型
 */
interface TestRequestDto {
  message?: string
  data?: unknown
  timestamp?: string
}

/**
 * 用户信息类型
 */
interface UserInfoDto {
  name: string
  email: string
  age: number
  hobbies?: string[]
}

/**
 * 镜像搜索请求类型
 */
interface ImageSearchDto {
  keyword: string
  registry?: string
  limit?: number
  offset?: number
}

/**
 * 复杂数据类型
 */
interface ComplexDataDto {
  title: string
  count: number
  enabled: boolean
  metadata: Record<string, unknown>
  tags: string[]
}

/**
 * 测试响应类型
 */
interface TestResponseDto {
  success: boolean
  data: unknown
  processedAt: string
}

/**
 * 验证结果类型
 */
interface ValidationResultDto {
  valid: boolean
  errors: string[]
  data?: unknown
}

/**
 * Ping 响应类型
 */
interface PingResponseDto {
  message: string
  timestamp: string
  serverTime: number
}

/**
 * 异步操作响应类型
 */
interface AsyncOperationDto {
  success: boolean
  data: {
    delay: number
    startTime: string
    endTime: string
    duration: number
  }
  processedAt: string
}

/**
 * 镜像搜索响应类型
 */
interface ImageSearchResponseDto {
  success: boolean
  data: {
    keyword: string
    registry?: string
    results: Array<{
      name: string
      description?: string
      stars?: number
      pulls?: number
    }>
    total: number
  }
  processedAt: string
}

/**
 * IPC 通道映射定义
 * 定义每个通道的参数和返回类型
 */
interface IpcChannelMap {
  'registry/status': () => Promise<ServiceStatusDto>
  'registry/test': (data: TestRequestDto | Record<string, unknown>) => Promise<TestResponseDto>
  'registry/ping': () => Promise<PingResponseDto>
  'registry/validate-user': (userData: UserInfoDto) => Promise<ValidationResultDto>
  'registry/search-images': (searchData: ImageSearchDto) => Promise<ImageSearchResponseDto>
  'registry/complex-data': (complexData: ComplexDataDto) => Promise<TestResponseDto>
  'registry/throw-error': (errorType: string) => Promise<never>
  'registry/async-operation': (delay: number) => Promise<AsyncOperationDto>
}

/**
 * IPC 通道名称类型
 */
type IpcChannelNames = keyof IpcChannelMap

/**
 * ============================================
 * IPC 调用函数创建器
 * ============================================
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

// 导出所有类型供其他模块使用
export type {
  ServiceStatusDto,
  TestRequestDto,
  UserInfoDto,
  ImageSearchDto,
  ComplexDataDto,
  TestResponseDto,
  ValidationResultDto,
  PingResponseDto,
  AsyncOperationDto,
  ImageSearchResponseDto,
  IpcChannelMap,
  IpcChannelNames
}
