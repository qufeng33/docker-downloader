/**
 * 全局错误处理器
 * 统一处理应用程序中的错误
 */

import type { App } from 'vue'

// Vue 实例类型定义
interface VueInstance {
  $options?: { name?: string }
  $?: { type?: { name?: string } }
  $props?: Record<string, unknown>
}

export interface ErrorLogEntry {
  level: 'error' | 'warn' | 'info'
  message: string
  stack?: string
  timestamp: string
  source: 'vue' | 'promise' | 'network' | 'ipc' | 'unknown'
  additional?: Record<string, unknown>
}

class ErrorHandler {
  private errorQueue: ErrorLogEntry[] = []
  private maxQueueSize = 100

  /**
   * 初始化全局错误处理
   */
  public init(app: App): void {
    // Vue 错误处理
    app.config.errorHandler = this.handleVueError.bind(this)

    // 全局未捕获的 Promise 拒绝
    window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this))

    // 全局 JavaScript 错误
    window.addEventListener('error', this.handleGlobalError.bind(this))

    // 资源加载错误
    window.addEventListener('error', this.handleResourceError.bind(this), true)

    console.log('Global error handler initialized')
  }

  /**
   * 处理 Vue 组件错误
   */
  private handleVueError(error: unknown, instance: unknown, info: string): void {
    const errorLog: ErrorLogEntry = {
      level: 'error',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      source: 'vue',
      additional: {
        info,
        componentName:
          (instance as VueInstance)?.$options?.name ||
          (instance as VueInstance)?.$?.type?.name ||
          'Unknown',
        props: (instance as VueInstance)?.$props
      }
    }

    this.logError(errorLog)
    this.reportError(errorLog)
  }

  /**
   * 处理未捕获的 Promise 拒绝
   */
  private handlePromiseRejection(event: PromiseRejectionEvent): void {
    const error = event.reason

    const errorLog: ErrorLogEntry = {
      level: 'error',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      source: 'promise',
      additional: {
        reason: event.reason,
        promise: event.promise
      }
    }

    this.logError(errorLog)
    this.reportError(errorLog)

    // 阻止默认的控制台错误输出
    event.preventDefault()
  }

  /**
   * 处理全局 JavaScript 错误
   */
  private handleGlobalError(event: ErrorEvent): void {
    const errorLog: ErrorLogEntry = {
      level: 'error',
      message: event.message,
      stack: event.error?.stack,
      timestamp: new Date().toISOString(),
      source: 'unknown',
      additional: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      }
    }

    this.logError(errorLog)
    this.reportError(errorLog)
  }

  /**
   * 处理资源加载错误
   */
  private handleResourceError(event: Event): void {
    const target = event.target as HTMLElement

    // 只处理资源加载错误
    if (
      target &&
      target !== (window as unknown) &&
      (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK')
    ) {
      const errorLog: ErrorLogEntry = {
        level: 'error',
        message: `Failed to load resource: ${target.tagName}`,
        timestamp: new Date().toISOString(),
        source: 'network',
        additional: {
          tagName: target.tagName,
          src:
            (target as HTMLImageElement | HTMLScriptElement).src ||
            (target as HTMLLinkElement).href,
          outerHTML: target.outerHTML
        }
      }

      this.logError(errorLog)
      this.reportError(errorLog)
    }
  }

  /**
   * 记录错误到控制台和文件
   */
  private logError(errorLog: ErrorLogEntry): void {
    // 添加到错误队列
    this.errorQueue.push(errorLog)

    // 限制队列大小
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift()
    }

    // 控制台输出
    console.group(`🚨 Error [${errorLog.source}] - ${errorLog.timestamp}`)
    console.error('Message:', errorLog.message)
    if (errorLog.stack) {
      console.error('Stack:', errorLog.stack)
    }
    if (errorLog.additional) {
      console.error('Additional Info:', errorLog.additional)
    }
    console.groupEnd()

    // TODO: 通过 IPC 发送到主进程记录到文件
    // if (window.api?.log) {
    //   window.api.log.error('ErrorHandler', errorLog)
    // }
  }

  /**
   * 上报错误到错误收集系统
   */
  private reportError(errorLog: ErrorLogEntry): void {
    // 在生产环境中，这里可以集成错误报告服务
    // 如 Sentry, Bugsnag, 或自建的错误收集系统

    if (import.meta.env.PROD) {
      // 示例：发送到错误收集服务
      // this.sendToErrorService(errorLog)
    }

    // 开发环境下显示友好的错误提示
    if (import.meta.env.DEV) {
      this.showDevelopmentError(errorLog)
    }
  }

  /**
   * 开发环境下显示错误通知
   */
  private showDevelopmentError(errorLog: ErrorLogEntry): void {
    // 可以集成 ElMessage 或其他通知组件
    console.warn('Development Error Notification:', errorLog.message)
  }

  /**
   * 手动记录错误
   */
  public logManualError(
    error: Error | string,
    source: ErrorLogEntry['source'] = 'unknown',
    additional?: Record<string, unknown>
  ): void {
    const errorLog: ErrorLogEntry = {
      level: 'error',
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      source,
      additional
    }

    this.logError(errorLog)
    this.reportError(errorLog)
  }

  /**
   * 记录警告
   */
  public logWarning(
    message: string,
    source: ErrorLogEntry['source'] = 'unknown',
    additional?: Record<string, unknown>
  ): void {
    const warningLog: ErrorLogEntry = {
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      source,
      additional
    }

    console.warn(`⚠️ Warning [${warningLog.source}]:`, message, additional)

    // TODO: 通过 IPC 发送到主进程记录到文件
    // if (window.api?.log) {
    //   window.api.log.warn('ErrorHandler', warningLog)
    // }
  }

  /**
   * 获取错误队列
   */
  public getErrorQueue(): ErrorLogEntry[] {
    return [...this.errorQueue]
  }

  /**
   * 清空错误队列
   */
  public clearErrorQueue(): void {
    this.errorQueue = []
  }

  /**
   * 导出错误日志
   */
  public exportErrorLogs(): string {
    return JSON.stringify(this.errorQueue, null, 2)
  }
}

// 创建全局实例
export const errorHandler = new ErrorHandler()

// 默认导出用于插件形式使用
export default {
  install(app: App) {
    errorHandler.init(app)

    // 将错误处理器挂载到全局属性
    app.config.globalProperties.$errorHandler = errorHandler

    // 提供 provide/inject 支持
    app.provide('errorHandler', errorHandler)
  }
}
