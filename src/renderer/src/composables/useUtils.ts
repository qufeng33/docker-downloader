import { ref, computed, onMounted, onUnmounted, type Ref, type ComputedRef } from 'vue'

/**
 * 热键管理组合式函数
 * 提供键盘快捷键绑定功能
 */
export function useHotkeys(): {
  pressedKeys: Ref<Set<string>>
  isHotkeyPressed: (hotkey: string[]) => boolean
  registerHotkey: (keys: string[], callback: () => void) => () => void
} {
  const pressedKeys = ref<Set<string>>(new Set())

  // 键盘事件处理
  const handleKeyDown = (event: KeyboardEvent): void => {
    pressedKeys.value.add(event.key.toLowerCase())
  }

  const handleKeyUp = (event: KeyboardEvent): void => {
    pressedKeys.value.delete(event.key.toLowerCase())
  }

  // 检查组合键是否被按下
  const isHotkeyPressed = (hotkey: string[]): boolean => {
    return hotkey.every((key) => pressedKeys.value.has(key.toLowerCase()))
  }

  // 注册热键
  const registerHotkey = (keys: string[], callback: () => void): (() => void) => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      const currentKeys: string[] = []
      if (event.ctrlKey) currentKeys.push('ctrl')
      if (event.shiftKey) currentKeys.push('shift')
      if (event.altKey) currentKeys.push('alt')
      if (event.metaKey) currentKeys.push('meta')
      currentKeys.push(event.key.toLowerCase())

      if (keys.every((key) => currentKeys.includes(key.toLowerCase()))) {
        event.preventDefault()
        callback()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return (): void => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
    document.removeEventListener('keyup', handleKeyUp)
  })

  return {
    pressedKeys,
    isHotkeyPressed,
    registerHotkey
  }
}

/**
 * 窗口大小管理组合式函数
 * 响应式窗口尺寸和断点检测
 */
export function useWindowSize(): {
  width: Ref<number>
  height: Ref<number>
  isMobile: ComputedRef<boolean>
  isTablet: ComputedRef<boolean>
  isDesktop: ComputedRef<boolean>
} {
  const width = ref(window.innerWidth)
  const height = ref(window.innerHeight)

  // 响应式断点
  const isMobile = computed(() => width.value < 768)
  const isTablet = computed(() => width.value >= 768 && width.value < 1024)
  const isDesktop = computed(() => width.value >= 1024)

  const handleResize = (): void => {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop
  }
}
