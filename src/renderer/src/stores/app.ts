import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 应用全局状态管理
export const useAppStore = defineStore('app', () => {
  // 状态
  const theme = ref<'light' | 'dark' | 'auto'>('auto')
  const language = ref<'zh-CN' | 'en-US'>('zh-CN')
  const isLoading = ref<boolean>(false)
  const title = ref<string>('Docker Downloader')

  // 计算属性
  const isDarkMode = computed(() => {
    if (theme.value === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return theme.value === 'dark'
  })

  const currentLanguage = computed(() => language.value)

  // 操作方法
  const setTheme = (newTheme: typeof theme.value): void => {
    theme.value = newTheme
  }

  const setLanguage = (newLanguage: typeof language.value): void => {
    language.value = newLanguage
  }

  const setLoading = (loading: boolean): void => {
    isLoading.value = loading
  }

  const setTitle = (newTitle: string): void => {
    title.value = newTitle
    document.title = newTitle
  }

  return {
    // 状态
    theme,
    language,
    isLoading,
    title,
    // 计算属性
    isDarkMode,
    currentLanguage,
    // 操作方法
    setTheme,
    setLanguage,
    setLoading,
    setTitle
  }
})
