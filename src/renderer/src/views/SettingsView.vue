<template>
  <div class="settings-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>应用设置</h2>
          <div class="header-actions">
            <el-button text @click="goBack">
              <el-icon><ArrowLeft /></el-icon>
              返回首页
            </el-button>
          </div>
        </div>
      </template>

      <div class="settings-content">
        <el-empty description="页面内容正在开发中" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElCard, ElButton, ElIcon, ElEmpty } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()

const goBack = (): void => {
  router.push('/')
}
</script>

<style scoped>
.settings-view {
  height: 100vh;
  width: 100vw;
  padding: 20px;
  box-sizing: border-box;
  background: linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 50%, #e8f5e8 100%);
}

.settings-view :deep(.el-card) {
  height: 100%;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.settings-content {
  height: calc(100% - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
