<template>
  <div class="header-container">
    <!-- macOS 顶部拖动区域 -->
    <div v-if="isMacOS" class="macos-drag-area"></div>

    <!-- Windows 顶部拖动区域 -->
    <div v-if="isWindows" class="windows-drag-area">
      <div class="window-controls">
        <button class="window-control-btn minimize" @click="minimizeWindow">─</button>
        <button class="window-control-btn maximize" @click="toggleMaximizeWindow">
          {{ isMaximized ? '🗗' : '🗖' }}
        </button>
        <button class="window-control-btn close" @click="closeWindow">✕</button>
      </div>
    </div>

    <!-- 顶部导航栏 -->
    <div class="top-navbar" :class="{ 'is-macos': isMacOS, 'is-windows': isWindows }">
      <!-- 左侧：Logo和项目名 -->
      <div class="navbar-brand">
        <div class="brand-logo">
          <div class="docker-icon">🐳</div>
        </div>
        <div class="brand-text">
          <span class="brand-name">Docker Downloader</span>
          <span class="brand-subtitle">企业级镜像下载工具</span>
        </div>
      </div>

      <!-- 中间：功能导航 -->
      <div class="navbar-nav">
        <div
          class="nav-item"
          :class="{ active: activeTab === 'search' }"
          @click="setActiveTab('search')"
        >
          <el-icon><Search /></el-icon>
          <span>镜像查询</span>
        </div>
        <div
          class="nav-item"
          :class="{ active: activeTab === 'registry' }"
          @click="setActiveTab('registry')"
        >
          <el-icon><Box /></el-icon>
          <span>仓库管理</span>
        </div>
        <div
          class="nav-item"
          :class="{ active: activeTab === 'download' }"
          @click="setActiveTab('download')"
        >
          <el-icon><Download /></el-icon>
          <span>下载管理</span>
        </div>
      </div>

      <!-- 右侧：主题切换和设置 -->
      <div class="navbar-actions">
        <div class="action-item theme-toggle" @click="toggleTheme">
          <el-icon class="action-icon">
            <Moon v-if="isDarkMode" />
            <Sunny v-else />
          </el-icon>
        </div>
        <div class="action-item settings-btn" @click="setActiveTab('settings')">
          <el-icon class="action-icon">
            <Setting />
          </el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTheme, usePlatform } from '@/composables'
import { ElIcon } from 'element-plus'
import { Search, Box, Setting, Download, Moon, Sunny } from '@element-plus/icons-vue'
import { PLATFORM_CONFIG, THEME_COLORS } from '@shared/config/theme'

const { isDarkMode, toggleTheme } = useTheme()
const { isMacOS, isWindows } = usePlatform()

defineProps({
  activeTab: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:activeTab'])

const setActiveTab = (tab: string): void => {
  emit('update:activeTab', tab)
}

const isMaximized = ref(false)

const initWindowState = async (): Promise<void> => {
  if (isWindows.value && window.api) {
    isMaximized.value = await window.api.window.isMaximized()
  }
}

const minimizeWindow = (): void => {
  if (window.api) window.api.window.minimize()
}

const toggleMaximizeWindow = async (): Promise<void> => {
  if (window.api) {
    await window.api.window.toggleMaximize()
    isMaximized.value = await window.api.window.isMaximized()
  }
}

const closeWindow = (): void => {
  if (window.api) window.api.window.close()
}

onMounted(() => {
  initWindowState()
})
</script>

<style scoped>
.header-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

/* macOS 平台特定样式 */
.macos-drag-area {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: v-bind('PLATFORM_CONFIG.MACOS.DRAG_AREA_HEIGHT + "px"');
  -webkit-app-region: drag;
}

/* Windows 平台特定样式 */
.windows-drag-area {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: v-bind('PLATFORM_CONFIG.WINDOWS.DRAG_AREA_HEIGHT + "px"');
  -webkit-app-region: drag;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 8px;
}

.window-controls {
  display: flex;
  -webkit-app-region: no-drag;
}

.window-control-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  margin: 0 1px;
}

.window-control-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.window-control-btn.close:hover {
  background: #e74c3c;
  color: white;
}

/* 顶部导航栏 */
.top-navbar {
  padding: 20px 32px;
  background: v-bind('THEME_COLORS.CONTENT_BACKGROUND');
  border-bottom: 1px solid rgba(233, 236, 239, 0.3);
  backdrop-filter: blur(20px);
  -webkit-app-region: no-drag;
  display: flex;
  align-items: center;
  min-height: 80px;
  position: relative;
}

.top-navbar.is-macos {
  margin-top: v-bind('PLATFORM_CONFIG.MACOS.DRAG_AREA_HEIGHT + "px"');
}

.top-navbar.is-windows {
  margin-top: v-bind('PLATFORM_CONFIG.WINDOWS.DRAG_AREA_HEIGHT + "px"');
}

/* 导航栏三列布局 */
.navbar-brand {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.navbar-nav {
  display: flex;
  gap: 8px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.navbar-actions {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

/* 品牌区域 */
.brand-logo {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #7c3aed 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 8px 24px rgba(59, 130, 246, 0.25),
    0 4px 12px rgba(59, 130, 246, 0.15);
  animation: logoFloat 6s ease-in-out infinite;
}

@keyframes logoFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}

.docker-icon {
  font-size: 24px;
  color: white;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1.2;
}

.brand-subtitle {
  font-size: 12px;
  color: #6c757d;
  line-height: 1.2;
}

/* 中间导航 */
.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6c757d;
  font-size: 14px;
  font-weight: 500;
}

.nav-item:hover {
  background: rgba(33, 150, 243, 0.1);
  color: #2196f3;
}

.nav-item.active {
  background: #2196f3;
  color: white;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
}

/* 右侧操作区 */
.action-item {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.6);
  backdrop-filter: blur(8px);
}

.action-item:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

.action-icon {
  font-size: 18px;
  color: #64748b;
  transition: color 0.3s ease;
}

.action-item:hover .action-icon {
  color: #3b82f6;
}
</style>
