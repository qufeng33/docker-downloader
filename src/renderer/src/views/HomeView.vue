<template>
  <div class="home-view">
    <el-card class="welcome-card">
      <template #header>
        <div class="card-header">
          <h2>{{ appStore.title }}</h2>
          <el-tag type="success">{{ appStore.currentLanguage }}</el-tag>
        </div>
      </template>

      <div class="welcome-content">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="feature-section">
              <h3>🐳 Docker 镜像管理</h3>
              <p>专业的 Docker 镜像离线下载工具</p>
              <ul class="feature-list">
                <li>支持多架构镜像下载</li>
                <li>私有仓库管理</li>
                <li>可视化下载进度</li>
                <li>离线环境支持</li>
              </ul>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="feature-section">
              <h3>⚡ 技术特色</h3>
              <p>基于现代化技术栈构建</p>
              <ul class="feature-list">
                <li>Electron + Vue 3 + TypeScript</li>
                <li>NestJS 企业级架构</li>
                <li>Element Plus UI 组件</li>
                <li>类型安全的 IPC 通信</li>
              </ul>
            </div>
          </el-col>
        </el-row>

        <el-divider />

        <div class="action-section">
          <el-space wrap size="large">
            <el-button type="primary" size="large" @click="goToTest">
              <el-icon><Tools /></el-icon>
              IPC 通信测试
            </el-button>
            <el-button size="large" @click="goToSettings">
              <el-icon><Setting /></el-icon>
              应用设置
            </el-button>
          </el-space>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores'
import { ElCard, ElTag, ElRow, ElCol, ElDivider, ElSpace, ElButton, ElIcon } from 'element-plus'
import { Tools, Setting } from '@element-plus/icons-vue'

const router = useRouter()
const appStore = useAppStore()

const goToTest = (): void => {
  router.push('/test')
}

const goToSettings = (): void => {
  router.push('/settings')
}
</script>

<style scoped>
.home-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  color: var(--el-text-color-primary);
}

.welcome-content {
  padding: 20px 0;
}

.feature-section {
  padding: 20px;
  border-radius: 8px;
  background: var(--el-bg-color-page);
  height: 100%;
}

.feature-section h3 {
  margin: 0 0 10px 0;
  color: var(--el-color-primary);
}

.feature-section p {
  margin: 0 0 15px 0;
  color: var(--el-text-color-regular);
}

.feature-list {
  margin: 0;
  padding-left: 20px;
}

.feature-list li {
  margin-bottom: 8px;
  color: var(--el-text-color-regular);
}

.action-section {
  text-align: center;
  padding: 20px 0;
}
</style>
