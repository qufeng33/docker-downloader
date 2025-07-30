<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-content">
      <div class="error-icon">⚠️</div>
      <h2 class="error-title">出现了意外错误</h2>
      <p class="error-message">{{ errorMessage }}</p>

      <!-- 开发模式下显示详细错误信息 -->
      <details v-if="isDevelopment && errorDetails" class="error-details">
        <summary>错误详情</summary>
        <pre class="error-stack">{{ errorDetails }}</pre>
      </details>

      <div class="error-actions">
        <el-button type="primary" @click="handleRetry"> 重试 </el-button>
        <el-button type="default" @click="handleReload"> 刷新页面 </el-button>
        <el-button type="text" @click="handleReport"> 报告问题 </el-button>
      </div>
    </div>
  </div>

  <!-- 正常渲染子组件 -->
  <div v-else>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, computed } from 'vue'
import { ElButton } from 'element-plus'

interface Props {
  // 是否在错误发生时自动重试
  autoRetry?: boolean
  // 自动重试的次数限制
  maxRetries?: number
  // 是否显示详细错误信息
  showDetails?: boolean
  // 自定义错误消息
  fallbackMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  autoRetry: false,
  maxRetries: 3,
  showDetails: true,
  fallbackMessage: '应用程序遇到了一个错误，请稍后重试'
})

const emit = defineEmits<{
  error: [error: Error, instance: unknown, info: string]
  retry: []
  reload: []
}>()

// 错误状态
const hasError = ref(false)
const errorMessage = ref('')
const errorDetails = ref('')
const retryCount = ref(0)

// 环境检测
const isDevelopment = computed(() => {
  return import.meta.env.MODE === 'development'
})

// 捕获子组件错误
onErrorCaptured((error: Error, instance, info: string) => {
  console.error('ErrorBoundary captured error:', error)
  console.error('Error info:', info)
  console.error('Component instance:', instance)

  // 设置错误状态
  hasError.value = true
  errorMessage.value = error.message || props.fallbackMessage
  errorDetails.value = error.stack || ''

  // 发送错误事件
  emit('error', error, instance, info)

  // 记录错误到日志系统
  logError(error, info)

  // 自动重试逻辑
  if (props.autoRetry && retryCount.value < props.maxRetries) {
    setTimeout(
      () => {
        handleRetry()
      },
      1000 * (retryCount.value + 1)
    ) // 递增延迟重试
  }

  // 阻止错误向上传播
  return false
})

// 错误处理方法
const handleRetry = (): void => {
  retryCount.value++
  hasError.value = false
  errorMessage.value = ''
  errorDetails.value = ''
  emit('retry')
}

const handleReload = (): void => {
  window.location.reload()
  emit('reload')
}

const handleReport = (): void => {
  // 可以集成错误报告服务，如 Sentry
  const errorReport = {
    message: errorMessage.value,
    stack: errorDetails.value,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    url: window.location.href
  }

  console.log('Error report:', errorReport)

  // 这里可以发送到错误收集服务
  // errorReportingService.send(errorReport)

  alert('错误报告已生成，请联系技术支持')
}

// 错误日志记录
const logError = (error: Error, info: string): void => {
  // 可以集成到 electron-log 或其他日志系统
  const logEntry = {
    level: 'error',
    message: error.message,
    stack: error.stack,
    info,
    timestamp: new Date().toISOString(),
    component: 'ErrorBoundary'
  }

  // TODO: 在 Electron 环境中，可以通过 IPC 发送到主进程记录
  // if (window.api?.log) {
  //   window.api.log.error('ErrorBoundary', logEntry)
  // } else {
  console.error('Error logged:', logEntry)
  // }
}

// 重置错误状态的方法（暴露给父组件）
const resetError = (): void => {
  hasError.value = false
  errorMessage.value = ''
  errorDetails.value = ''
  retryCount.value = 0
}

// 暴露方法给父组件
defineExpose({
  resetError,
  hasError: hasError.value
})
</script>

<style scoped>
.error-boundary {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, #fef2f2 0%, #fef7f7 100%);
  border: 1px solid #fecaca;
  border-radius: var(--radius-xl);
  margin: var(--spacing-lg);
}

.error-content {
  text-align: center;
  max-width: 500px;
}

.error-icon {
  font-size: var(--font-size-5xl);
  margin-bottom: var(--spacing-lg);
  opacity: 0.8;
}

.error-title {
  font-size: var(--font-size-xl);
  color: #dc2626;
  margin: 0 0 var(--spacing-md) 0;
  font-weight: 600;
}

.error-message {
  font-size: var(--font-size-base);
  color: #7f1d1d;
  margin: 0 0 var(--spacing-lg) 0;
  line-height: 1.6;
}

.error-details {
  margin: var(--spacing-lg) 0;
  text-align: left;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
}

.error-details summary {
  cursor: pointer;
  font-weight: 600;
  color: #dc2626;
  margin-bottom: var(--spacing-sm);
}

.error-stack {
  font-family: 'Courier New', monospace;
  font-size: var(--font-size-sm);
  color: #7f1d1d;
  background: #fef7f7;
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  margin: var(--spacing-sm) 0 0 0;
}

.error-actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: center;
  flex-wrap: wrap;
}

.error-actions .el-button {
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all var(--duration-normal) var(--ease-out);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .error-boundary {
    margin: var(--spacing-md);
    padding: var(--spacing-lg);
  }

  .error-content {
    max-width: 100%;
  }

  .error-actions {
    flex-direction: column;
    align-items: center;
  }

  .error-actions .el-button {
    width: 100%;
    max-width: 200px;
  }
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .error-boundary {
    background: linear-gradient(135deg, #1f1f1f 0%, #2a2a2a 100%);
    border-color: #ef4444;
  }

  .error-title {
    color: #ef4444;
  }

  .error-message {
    color: #fca5a5;
  }

  .error-details {
    background: #1f1f1f;
    border-color: #ef4444;
  }

  .error-details summary {
    color: #ef4444;
  }

  .error-stack {
    background: #2a2a2a;
    color: #fca5a5;
  }
}
</style>
