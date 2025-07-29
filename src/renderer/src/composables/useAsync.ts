import { ref, computed, watch, type Ref, type ComputedRef } from 'vue'

/**
 * 异步操作管理组合式函数的返回类型
 */
interface AsyncOperationReturn<T> {
  isLoading: Ref<boolean>
  error: Ref<Error | null>
  data: Ref<T | null>
  hasError: ComputedRef<boolean>
  hasData: ComputedRef<boolean>
  isIdle: ComputedRef<boolean>
  execute: (asyncFn: () => Promise<T>) => Promise<T | null>
  reset: () => void
}

/**
 * 异步操作管理组合式函数
 * 统一管理异步操作的加载状态、错误处理
 */
export function useAsyncOperation<T = unknown>(): AsyncOperationReturn<T> {
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const data = ref<T | null>(null)

  // 计算属性
  const hasError = computed(() => error.value !== null)
  const hasData = computed(() => data.value !== null)
  const isIdle = computed(() => !isLoading.value && !hasError.value)

  // 执行异步操作
  const execute = async (asyncFn: () => Promise<T>): Promise<T | null> => {
    try {
      isLoading.value = true
      error.value = null

      const result = await asyncFn()
      data.value = result
      return result
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error')
      data.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 重置状态
  const reset = (): void => {
    isLoading.value = false
    error.value = null
    data.value = null
  }

  // 监听错误变化，自动记录到控制台
  watch(error, (newError) => {
    if (newError) {
      console.error('AsyncOperation Error:', newError)
    }
  })

  return {
    // 状态
    isLoading,
    error,
    data: data as Ref<T | null>,
    // 计算属性
    hasError,
    hasData,
    isIdle,
    // 方法
    execute,
    reset
  }
}

/**
 * IPC 调用组合式函数的返回类型
 */
interface IpcCallReturn<T> {
  isLoading: Ref<boolean>
  error: Ref<Error | null>
  data: Ref<T | null>
  hasError: ComputedRef<boolean>
  hasData: ComputedRef<boolean>
  isIdle: ComputedRef<boolean>
  invoke: <K extends keyof typeof window.api.registry>(
    channel: K,
    ...args: Parameters<(typeof window.api.registry)[K]>
  ) => Promise<T | null>
  reset: () => void
}

/**
 * IPC 调用组合式函数
 * 专门用于处理 IPC 通信的异步操作
 */
export function useIpcCall<T = unknown>(): IpcCallReturn<T> {
  const { isLoading, error, data, hasError, hasData, isIdle, execute, reset } =
    useAsyncOperation<T>()

  // IPC 专用的执行方法
  const invoke = async <K extends keyof typeof window.api.registry>(
    channel: K,
    ...args: Parameters<(typeof window.api.registry)[K]>
  ): Promise<T | null> => {
    return execute(async () => {
      const method = window.api.registry[channel] as (...args: unknown[]) => Promise<T>
      return method(...args)
    })
  }

  return {
    isLoading,
    error,
    data,
    hasError,
    hasData,
    isIdle,
    invoke,
    reset
  }
}
