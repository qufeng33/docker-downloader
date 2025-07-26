<template>
  <div class="app-container">
    <el-container>
      <!-- 头部导航 -->
      <el-header class="app-header">
        <div class="header-content">
          <div class="logo-section">
            <img alt="logo" class="logo" src="./assets/electron.svg" />
            <h1 class="app-title">{{ appStore.title }}</h1>
          </div>

          <el-menu :default-active="$route.path" mode="horizontal" router class="nav-menu">
            <el-menu-item index="/">
              <el-icon><House /></el-icon>
              <span>首页</span>
            </el-menu-item>
            <el-menu-item index="/test">
              <el-icon><Tools /></el-icon>
              <span>IPC 测试</span>
            </el-menu-item>
            <el-menu-item index="/settings">
              <el-icon><Setting /></el-icon>
              <span>设置</span>
            </el-menu-item>
          </el-menu>

          <div class="header-actions">
            <el-switch
              v-model="isDarkMode"
              :active-icon="Moon"
              :inactive-icon="Sunny"
              @change="toggleTheme"
            />
          </div>
        </div>
      </el-header>

      <!-- 主要内容区域 -->
      <el-main class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>

      <!-- 底部信息 -->
      <el-footer class="app-footer">
        <Versions />
      </el-footer>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores'
import { useTheme } from '@/composables'
import Versions from '@/components/Versions.vue'
import {
  ElContainer,
  ElHeader,
  ElMain,
  ElFooter,
  ElMenu,
  ElMenuItem,
  ElIcon,
  ElSwitch
} from 'element-plus'
import { House, Tools, Setting, Moon, Sunny } from '@element-plus/icons-vue'

const appStore = useAppStore()
const { isDarkMode, toggleTheme } = useTheme()
</script>

<style scoped>
.app-container {
  height: 100vh;
  overflow: hidden;
}

.app-header {
  border-bottom: 1px solid var(--el-border-color);
  padding: 0;
  height: 60px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  height: 32px;
  width: 32px;
}

.app-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.nav-menu {
  flex: 1;
  max-width: 400px;
  margin: 0 40px;
  border-bottom: none;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-main {
  padding: 0;
  overflow-y: auto;
  height: calc(100vh - 120px);
}

.app-footer {
  border-top: 1px solid var(--el-border-color);
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-bg-color-page);
}

/* 路由切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
