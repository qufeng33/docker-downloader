/**
 * 共享的 API 类型定义
 * 用于在渲染进程中导入和使用
 *
 * 注意：这些类型从 Preload 脚本重新导出，确保类型一致性
 */

// 重新导出 Preload API 类型
export type {
  ExposedApi,
  RegistryApi,
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
} from '../../preload/index'

/**
 * API 调用状态枚举
 */
export enum ApiCallStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

/**
 * 通用 API 响应包装器
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  timestamp: string
}

/**
 * 异步操作状态
 */
export interface AsyncOperationState<T = unknown> {
  status: ApiCallStatus
  data?: T
  error?: string
  loading: boolean
}

/**
 * API 错误类型
 */
export interface ApiError {
  code: string
  message: string
  details?: unknown
  timestamp: string
}

/**
 * 工具类型：提取 Promise 的返回值类型
 */
export type PromiseReturnType<T> = T extends Promise<infer U> ? U : never

/**
 * 工具类型：提取函数的参数类型
 */
export type FunctionParams<T> = T extends (...args: infer P) => unknown ? P : never
