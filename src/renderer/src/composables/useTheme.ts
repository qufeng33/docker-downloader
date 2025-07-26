import { computed, watch, onMounted, type ComputedRef } from 'vue'
import { useAppStore } from '@/stores'

/**
 * 主题管理组合式函数
 * 提供主题相关的响应式状态和操作方法
 */
export function useTheme(): {
  isDarkMode: ComputedRef<boolean>
  currentTheme: ComputedRef<'light' | 'dark' | 'auto'>
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark' | 'auto') => void
  applyThemeToDOM: (darkMode: boolean) => void
} {
  const appStore = useAppStore()

  // 响应式计算属性
  const isDarkMode = computed(() => appStore.isDarkMode)
  const currentTheme = computed(() => appStore.theme)

  // 主题切换方法
  const toggleTheme = (): void => {
    appStore.toggleTheme()
  }

  const setTheme = (theme: 'light' | 'dark' | 'auto'): void => {
    appStore.setTheme(theme)
  }

  // 应用主题到 DOM
  const applyThemeToDOM = (darkMode: boolean): void => {
    const html = document.documentElement
    if (darkMode) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  // 监听主题变化并应用到 DOM
  watch(isDarkMode, applyThemeToDOM, { immediate: true })

  // 监听系统主题变化（仅在自动模式下）
  onMounted(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = () => {
      if (currentTheme.value === 'auto') {
        applyThemeToDOM(mediaQuery.matches)
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)

    // 返回清理函数
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  })

  return {
    isDarkMode,
    currentTheme,
    toggleTheme,
    setTheme,
    applyThemeToDOM
  }
}
