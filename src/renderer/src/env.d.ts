/// <reference types="vite/client" />

/**
 * ====================================
 * 渲染进程类型声明
 * ====================================
 *
 * 使用共享类型确保类型一致性
 */

// 导入共享类型和 Window 扩展
import '@shared/types/api'

// Vite 环境变量类型扩展
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // 可以添加更多环境变量类型
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
