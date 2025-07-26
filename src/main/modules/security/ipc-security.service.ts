import { Injectable, Logger } from '@nestjs/common'

/**
 * IPC 安全验证服务
 * 提供 IPC 通信的安全验证和监控
 */
@Injectable()
export class IpcSecurityService {
  private readonly logger = new Logger(IpcSecurityService.name)

  // IPC 调用频率限制（防止 DDoS 攻击）
  private readonly callCounts = new Map<string, { count: number; resetTime: number }>()
  private readonly MAX_CALLS_PER_MINUTE = 60
  private readonly MINUTE_MS = 60 * 1000

  /**
   * 验证 IPC 通道是否允许
   */
  isChannelAllowed(channel: string): boolean {
    const allowedChannels = [
      'registry/ping',
      'registry/status',
      'registry/test',
      'registry/validate-user',
      'registry/search-images',
      'registry/complex-data',
      'registry/async-operation',
      'registry/throw-error'
    ]

    return allowedChannels.includes(channel)
  }

  /**
   * 检查 IPC 调用频率限制
   */
  checkRateLimit(channel: string, senderId?: number): boolean {
    const key = `${channel}_${senderId || 'unknown'}`
    const now = Date.now()

    const current = this.callCounts.get(key)

    if (!current || now > current.resetTime) {
      // 重置或初始化计数器
      this.callCounts.set(key, {
        count: 1,
        resetTime: now + this.MINUTE_MS
      })
      return true
    }

    if (current.count >= this.MAX_CALLS_PER_MINUTE) {
      this.logger.warn('IPC 调用频率超限', {
        channel,
        senderId,
        count: current.count,
        limit: this.MAX_CALLS_PER_MINUTE
      })
      return false
    }

    current.count++
    return true
  }

  /**
   * 验证和清理 IPC 数据
   */
  sanitizeData(data: unknown): unknown {
    if (data === null || data === undefined) {
      return data
    }

    if (typeof data === 'string') {
      // 防止 XSS 和代码注入
      return data
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/data:text\/html/gi, '')
        .trim()
        .substring(0, 10000) // 限制字符串长度
    }

    if (typeof data === 'number') {
      // 防止数值溢出
      if (!isFinite(data) || data > Number.MAX_SAFE_INTEGER || data < Number.MIN_SAFE_INTEGER) {
        throw new Error('无效的数值')
      }
      return data
    }

    if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data)) {
        // 限制数组长度
        if (data.length > 1000) {
          throw new Error('数组长度超出限制')
        }
        return data.map((item) => this.sanitizeData(item))
      }

      // 限制对象深度和属性数量
      const sanitized: Record<string, unknown> = {}
      let propCount = 0

      for (const [key, value] of Object.entries(data)) {
        if (propCount >= 100) {
          this.logger.warn('对象属性数量超出限制')
          break
        }

        // 验证键名
        if (typeof key === 'string' && /^[a-zA-Z0-9_-]{1,50}$/.test(key)) {
          sanitized[key] = this.sanitizeData(value)
          propCount++
        } else {
          this.logger.warn('无效的对象键名:', key)
        }
      }

      return sanitized
    }

    if (typeof data === 'boolean') {
      return data
    }

    // 其他类型一律拒绝
    this.logger.warn('不支持的数据类型:', typeof data)
    return null
  }

  /**
   * 记录安全事件
   */
  logSecurityEvent(event: string, details: Record<string, unknown>): void {
    this.logger.warn(`安全事件: ${event}`, details)

    // 这里可以集成到安全监控系统
    // 例如发送到 SIEM 或安全日志服务
  }

  /**
   * 清理过期的频率限制记录
   */
  cleanupRateLimits(): void {
    const now = Date.now()

    for (const [key, data] of this.callCounts.entries()) {
      if (now > data.resetTime) {
        this.callCounts.delete(key)
      }
    }
  }
}
