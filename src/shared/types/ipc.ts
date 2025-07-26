import type {
  ServiceStatus,
  TestRequest,
  TestResponse,
  UserInfo,
  ValidationResult,
  ImageSearchRequest,
  ImageSearchResponse,
  ComplexData,
  PingResponse,
  AsyncOperation
} from './base'

/**
 * ====================================
 * IPC 通信相关类型定义
 * ====================================
 */

/**
 * IPC 通道名称常量
 */
export const IPC_CHANNELS = {
  REGISTRY: {
    STATUS: 'registry/status',
    TEST: 'registry/test',
    PING: 'registry/ping',
    VALIDATE_USER: 'registry/validate-user',
    SEARCH_IMAGES: 'registry/search-images',
    COMPLEX_DATA: 'registry/complex-data',
    THROW_ERROR: 'registry/throw-error',
    ASYNC_OPERATION: 'registry/async-operation'
  }
} as const

/**
 * IPC 通道类型映射
 * 定义每个通道的参数和返回类型
 */
export interface IpcChannelMap {
  'registry/status': () => Promise<ServiceStatus>
  'registry/test': (data: TestRequest | Record<string, unknown>) => Promise<TestResponse>
  'registry/ping': () => Promise<PingResponse>
  'registry/validate-user': (userData: UserInfo) => Promise<ValidationResult>
  'registry/search-images': (searchData: ImageSearchRequest) => Promise<ImageSearchResponse>
  'registry/complex-data': (complexData: ComplexData) => Promise<TestResponse>
  'registry/throw-error': (errorType: string) => Promise<never>
  'registry/async-operation': (delay: number) => Promise<AsyncOperation>
}

/**
 * IPC 通道名称的字面量类型
 */
export type IpcChannelNames = keyof IpcChannelMap

/**
 * 提取 IPC 通道的参数类型
 */
export type IpcChannelParams<T extends IpcChannelNames> = IpcChannelMap[T] extends (
  arg: infer P
) => unknown
  ? P
  : never

/**
 * 提取 IPC 通道的返回值类型
 */
export type IpcChannelReturn<T extends IpcChannelNames> = IpcChannelMap[T] extends (
  ...args: unknown[]
) => infer R
  ? R
  : never

/**
 * IPC 调用函数类型
 */
export type IpcInvoker<T extends IpcChannelNames> = IpcChannelMap[T]

/**
 * 通用工具类型
 */
export type PromiseReturnType<T> = T extends Promise<infer U> ? U : never
export type FunctionParams<T> = T extends (...args: infer P) => unknown ? P : never
