/**
 * ====================================
 * 基础接口类型定义
 * ====================================
 *
 * 这些是纯 TypeScript 接口，不包含验证装饰器
 * 可以在所有进程中安全使用
 */

/**
 * 服务状态响应接口
 */
export interface ServiceStatus {
  status: string
  message: string
  timestamp: string
}

/**
 * 基础测试请求接口
 */
export interface TestRequest {
  message?: string
  data?: unknown
  timestamp?: string
}

/**
 * 用户信息接口
 */
export interface UserInfo {
  name: string
  email: string
  age: number
  hobbies?: string[]
}

/**
 * 镜像搜索请求接口
 */
export interface ImageSearchRequest {
  keyword: string
  registry?: string
  limit?: number
  offset?: number
}

/**
 * 复杂数据结构接口
 */
export interface ComplexData {
  title: string
  count: number
  enabled: boolean
  metadata: Record<string, unknown>
  tags: string[]
}

/**
 * 测试响应接口
 */
export interface TestResponse {
  success: boolean
  data: unknown
  processedAt: string
}

/**
 * 验证结果接口
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
  data?: unknown
}

/**
 * Ping 响应接口
 */
export interface PingResponse {
  message: string
  timestamp: string
  serverTime: number
}

/**
 * 异步操作响应接口
 */
export interface AsyncOperation {
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
 * 镜像搜索响应接口
 */
export interface ImageSearchResponse {
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
 * 通用错误响应接口
 */
export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
    timestamp: string
  }
}

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
