import log from 'electron-log/main'
import { app } from 'electron'
import path from 'path'

/**
 * **关键变更**: 这是整个日志系统的核心初始化入口。
 * 它必须在 NestJS 应用创建之前执行。
 */
export function initializeLogging(): void {
  // 1. 为渲染器进程设置 IPC 桥梁
  // 这是 electron-log v5+ 的标准做法
  log.initialize()

  // 2. 捕获全局未处理的异常和 Promise rejections
  // 这是保证应用健壮性的关键
  log.errorHandler.startCatching({
    showDialog: process.env.NODE_ENV !== 'production', // 只在开发环境弹窗
    onError({ error }) {
      // 这里可以添加自定义错误处理逻辑，例如上报到 Sentry
      console.error('Unhandled error caught by electron-log:', error)
    }
  })

  // 3. 配置日志格式和传输
  const logFormat = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] [{scope}] {text}'
  log.transports.file.format = logFormat
  log.transports.console.format = logFormat
  log.transports.file.resolvePathFn = () => path.join(app.getPath('logs'), 'main.log')
  log.transports.file.maxSize = 10 * 1024 * 1024 // 10MB
}

/**
 * 创建一个在 NestJS DI 容器完全启动前可用的引导日志器
 */
export const bootstrapLogger = log.scope('Bootstrap')
