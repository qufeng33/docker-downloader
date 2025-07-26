/**
 * ====================================
 * 应用级配置和工具类型
 * ====================================
 */

/**
 * 应用程序主题类型
 */
export type AppTheme = 'light' | 'dark' | 'auto'

/**
 * 应用程序语言类型
 */
export type AppLanguage = 'zh-CN' | 'en-US'

/**
 * 应用程序配置类型
 */
export interface AppConfig {
  theme: AppTheme
  language: AppLanguage
  autoUpdate: boolean
  enableNotifications: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
}

/**
 * ====================================
 * 错误处理类型
 * ====================================
 */

/**
 * 应用程序错误代码枚举
 */
export enum AppErrorCode {
  // 网络错误
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',

  // IPC 通信错误
  IPC_CALL_FAILED = 'IPC_CALL_FAILED',
  IPC_CHANNEL_NOT_FOUND = 'IPC_CHANNEL_NOT_FOUND',

  // 业务逻辑错误
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  BUSINESS_LOGIC_ERROR = 'BUSINESS_LOGIC_ERROR',

  // 系统错误
  FILE_SYSTEM_ERROR = 'FILE_SYSTEM_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED'
}

/**
 * 标准化的应用程序错误类型
 */
export interface AppError {
  code: AppErrorCode
  message: string
  details?: unknown
  timestamp: string
  stack?: string
}

/**
 * ====================================
 * 工具类型
 * ====================================
 */

/**
 * 使类型的所有属性都变为可选
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 提取对象类型的值类型
 */
export type ValueOf<T> = T[keyof T]

/**
 * 创建严格的字符串字面量类型
 */
export type StrictString<T extends string> = T

/**
 * 异步函数的返回类型
 */
export type AsyncReturnType<T extends (...args: unknown[]) => Promise<unknown>> = T extends (
  ...args: unknown[]
) => Promise<infer R>
  ? R
  : never
