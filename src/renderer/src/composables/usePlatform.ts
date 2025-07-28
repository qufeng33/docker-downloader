import { ref, onMounted } from 'vue'

/**
 * 平台检测组合式函数
 */
export function usePlatform(): {
  isMacOS: typeof isMacOS
  isWindows: typeof isWindows
  isLinux: typeof isLinux
  titleBarHeight: number
  showCustomControls: boolean
} {
  const isMacOS = ref(false)
  const isWindows = ref(false)
  const isLinux = ref(false)

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
    // 便捷的计算属性
    titleBarHeight: isMacOS.value ? 60 : 40,
    showCustomControls: isWindows.value
  }
}
