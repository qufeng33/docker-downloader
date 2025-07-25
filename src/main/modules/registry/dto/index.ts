/**
 * 仓库管理相关的数据传输对象（DTO）
 */

/**
 * 服务状态响应 DTO
 */
export interface ServiceStatusDto {
  status: string
  message: string
  timestamp: string
}

/**
 * 测试请求 DTO
 */
export interface TestRequestDto {
  message?: string
  data?: unknown
  timestamp?: string
}

/**
 * 测试响应 DTO
 */
export interface TestResponseDto {
  success: boolean
  data: {
    original: unknown
    processed: string
  }
  processedAt: string
}

/**
 * Ping 响应 DTO
 */
export interface PingResponseDto {
  message: string
  timestamp: string
  serverTime: number
}

/**
 * 通用错误响应 DTO
 */
export interface ErrorResponseDto {
  success: false
  error: {
    code: string
    message: string
    timestamp: string
  }
}

/**
 * IPC 通道名称常量
 */
export const IPC_CHANNELS = {
  REGISTRY: {
    STATUS: 'registry/status',
    TEST: 'registry/test',
    PING: 'registry/ping'
  }
} as const

/**
 * IPC 通道类型映射
 * 用于类型安全的 IPC 通信
 */
export interface IpcChannelMap {
  'registry/status': () => Promise<ServiceStatusDto>
  'registry/test': (data: TestRequestDto) => Promise<TestResponseDto>
  'registry/ping': () => Promise<PingResponseDto>
}
