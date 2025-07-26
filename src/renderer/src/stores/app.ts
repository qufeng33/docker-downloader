import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { AppTheme, AppLanguage } from '../../../shared/types/app'

// 应用全局状态管理 - Vue 3 Composition API 风格
export const useAppStore = defineStore('app', () => {
  // === 状态定义 ===
  const theme = ref<AppTheme>('auto')
  const language = ref<AppLanguage>('zh-CN')
  const isLoading = ref<boolean>(false)
  const title = ref<string>('Docker Downloader')

  // === 计算属性 ===
  const isDarkMode = computed(() => {
    if (theme.value === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return theme.value === 'dark'
  })

  const currentLanguage = computed(() => language.value)

  // === 监听器 - 自动持久化到 localStorage ===
  watch(
    theme,
    (newTheme) => {
      localStorage.setItem('app-theme', newTheme)
    },
    { immediate: false }
  )

  watch(
    language,
    (newLanguage) => {
      localStorage.setItem('app-language', newLanguage)
    },
    { immediate: false }
  )

  // === 操作方法 ===
  const setTheme = (newTheme: AppTheme): void => {
    theme.value = newTheme
  }

  const setLanguage = (newLanguage: AppLanguage): void => {
    language.value = newLanguage
  }

  const setLoading = (loading: boolean): void => {
    isLoading.value = loading
  }

  const setTitle = (newTitle: string): void => {
    title.value = newTitle
    // 同步更新 document title
    document.title = newTitle
  }

  // === 初始化方法 ===
  const initializeFromStorage = (): void => {
    // 从 localStorage 恢复设置
    const savedTheme = localStorage.getItem('app-theme') as AppTheme
    const savedLanguage = localStorage.getItem('app-language') as AppLanguage

    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      theme.value = savedTheme
    }

    if (savedLanguage && ['zh-CN', 'en-US'].includes(savedLanguage)) {
      language.value = savedLanguage
    }
  }

  // === 重置方法 ===
  const reset = (): void => {
    theme.value = 'auto'
    language.value = 'zh-CN'
    isLoading.value = false
    title.value = 'Docker Downloader'

    // 清除本地存储
    localStorage.removeItem('app-theme')
    localStorage.removeItem('app-language')
  }

  // === 工具方法 ===
  const toggleTheme = (): void => {
    switch (theme.value) {
      case 'light':
        setTheme('dark')
        break
      case 'dark':
        setTheme('auto')
        break
      case 'auto':
        setTheme('light')
        break
    }
  }

  // 初始化
  initializeFromStorage()

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
    setTitle,
    toggleTheme,
    reset,
    initializeFromStorage
  }
})
