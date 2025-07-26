import { Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common'
import {
  ValidationException,
  BusinessException,
  RegistryException,
  TimeoutException
} from '../exceptions'
import type { ErrorResponseDto } from '../../modules/registry/registry.dto'

/**
 * 全局异常过滤器
 * 统一处理所有异常并返回标准格式的错误响应
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('GlobalExceptionFilter')

  catch(exception: unknown): ErrorResponseDto {
    const timestamp = new Date().toISOString()

    // 记录异常信息
    this.logger.error('IPC 异常捕获:', {
      exception: exception instanceof Error ? exception.message : String(exception),
      stack: exception instanceof Error ? exception.stack : undefined,
      timestamp
    })

    // 根据异常类型生成不同的错误响应
    if (exception instanceof ValidationException) {
      return {
        success: false,
        error: {
          code: exception.code,
          message: exception.message,
          details: exception.errors,
          timestamp
        }
      }
    }

    if (exception instanceof BusinessException) {
      return {
        success: false,
        error: {
          code: exception.code,
          message: exception.message,
          details: exception.details,
          timestamp
        }
      }
    }

    if (exception instanceof RegistryException) {
      return {
        success: false,
        error: {
          code: exception.code,
          message: exception.message,
          details: { registryUrl: exception.registryUrl },
          timestamp
        }
      }
    }

    if (exception instanceof TimeoutException) {
      return {
        success: false,
        error: {
          code: exception.code,
          message: exception.message,
          details: { timeout: exception.timeout },
          timestamp
        }
      }
    }

    if (exception instanceof HttpException) {
      return {
        success: false,
        error: {
          code: 'HTTP_ERROR',
          message: exception.message,
          details: { status: exception.getStatus() },
          timestamp
        }
      }
    }

    // 未知异常处理
    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: exception instanceof Error ? exception.message : '未知错误',
        details:
          process.env.NODE_ENV === 'development'
            ? {
                stack: exception instanceof Error ? exception.stack : undefined
              }
            : undefined,
        timestamp
      }
    }
  }
}
