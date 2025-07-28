/**
 * ============================================
 * 统一主题配置
 * ============================================
 *
 * 确保窗口和内容使用完全一致的颜色系统
 */

/**
 * 主题颜色定义
 */
export const THEME_COLORS = {
  // 窗口背景色 - 这是最重要的，确保窗口和内容完全一致
  WINDOW_BACKGROUND: '#ffffff',

  // 内容背景色（与窗口背景色相同）
  CONTENT_BACKGROUND: '#ffffff',

  // 拖动区域背景色（与窗口背景色相同）
  DRAG_AREA_BACKGROUND: '#ffffff',

  // 工具栏背景色
  TOOLBAR_BACKGROUND: 'rgba(255, 255, 255, 0.95)',

  // 边框颜色
  BORDER_COLOR: 'rgba(0, 0, 0, 0.1)',

  // 主色调
  PRIMARY_COLOR: '#2196f3',

  // 文本颜色
  TEXT_PRIMARY: '#2c3e50',
  TEXT_SECONDARY: '#6c757d'
} as const

/**
 * 平台特定配置
 */
export const PLATFORM_CONFIG = {
  MACOS: {
    DRAG_AREA_HEIGHT: 80,
    TOOLBAR_MARGIN_TOP: 60,
    TRAFFIC_LIGHT_POSITION: { x: 20, y: 20 }
  },
  WINDOWS: {
    DRAG_AREA_HEIGHT: 40,
    TOOLBAR_MARGIN_TOP: 50,
    WINDOW_CONTROLS_WIDTH: 120
  }
} as const

/**
 * 窗口配置
 */
export const WINDOW_CONFIG = {
  // 统一背景色 - 这是关键
  BACKGROUND_COLOR: THEME_COLORS.WINDOW_BACKGROUND,

  // 默认尺寸
  DEFAULT_SIZE: {
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 650
  }
} as const

/**
 * 获取平台特定配置
 */
export function getPlatformConfig(): {
  isMacOS: boolean
  isWindows: boolean
  config: typeof PLATFORM_CONFIG.MACOS | typeof PLATFORM_CONFIG.WINDOWS
} {
  const isMacOS = process.platform === 'darwin'
  const isWindows = process.platform === 'win32'

  return {
    isMacOS,
    isWindows,
    config: isMacOS ? PLATFORM_CONFIG.MACOS : PLATFORM_CONFIG.WINDOWS
  }
}
