<template>
  <div class="test-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>IPC 通信测试</h2>
          <el-button text @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回首页
          </el-button>
        </div>
      </template>

      <div class="test-content">
        <IpcTestSuite />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import IpcTestSuite from '@/components/IpcTestSuite.vue'
import { ElCard, ElButton, ElIcon } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()

const goBack = (): void => {
  router.push('/')
}
</script>

<style scoped>
.test-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
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

.test-content {
  padding: 20px 0;
}
</style>
