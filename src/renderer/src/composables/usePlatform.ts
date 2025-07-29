import { ref, onMounted, computed, type Ref, type ComputedRef } from 'vue'

/**
 * 平台检测组合式函数
 */
export function usePlatform(): {
  isMacOS: Ref<boolean>
  isWindows: Ref<boolean>
  isLinux: Ref<boolean>
  titleBarHeight: ComputedRef<number>
  showCustomControls: ComputedRef<boolean>
} {
  const isMacOS = ref(false)
  const isWindows = ref(false)
  const isLinux = ref(false)

  // 将其转换为 computed 属性，确保响应性
  const titleBarHeight = computed(() => (isMacOS.value ? 60 : 40))
  const showCustomControls = computed(() => isWindows.value)

  onMounted(() => {
    const platform = navigator.platform.toLowerCase()
    const userAgent = navigator.userAgent.toLowerCase()

    // 检测 macOS
    isMacOS.value = platform.includes('mac') || userAgent.includes('mac')

    // 检测 Windows
    isWindows.value = platform.includes('win') || userAgent.includes('win')

    // 检测 Linux
    isLinux.value = platform.includes('linux') || userAgent.includes('linux')
  })

  return {
    isMacOS,
    isWindows,
    isLinux,
    titleBarHeight,
    showCustomControls
  }
}
