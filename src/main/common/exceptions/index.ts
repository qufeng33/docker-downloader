/**
 * 自定义异常类
 */

/**
 * 验证错误异常
 */
export class ValidationException extends Error {
  constructor(
    message: string,
    public readonly errors: string[],
    public readonly code: string = 'VALIDATION_ERROR'
  ) {
    super(message)
    this.name = 'ValidationException'
  }
}

/**
 * 业务逻辑错误异常
 */
export class BusinessException extends Error {
  constructor(
    message: string,
    public readonly code: string = 'BUSINESS_ERROR',
    public readonly details?: unknown
  ) {
    super(message)
    this.name = 'BusinessException'
  }
}

/**
 * 仓库连接错误异常
 */
export class RegistryException extends Error {
  constructor(
    message: string,
    public readonly registryUrl?: string,
    public readonly code: string = 'REGISTRY_ERROR'
  ) {
    super(message)
    this.name = 'RegistryException'
  }
}

/**
 * 超时错误异常
 */
export class TimeoutException extends Error {
  constructor(
    message: string,
    public readonly timeout: number,
    public readonly code: string = 'TIMEOUT_ERROR'
  ) {
    super(message)
    this.name = 'TimeoutException'
  }
}
