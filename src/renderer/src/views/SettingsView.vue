<template>
  <div class="settings-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>应用设置</h2>
          <el-button text @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回首页
          </el-button>
        </div>
      </template>

      <div class="settings-content">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card shadow="never">
              <template #header>
                <h3>外观设置</h3>
              </template>

              <el-form label-width="120px">
                <el-form-item label="主题模式">
                  <el-radio-group v-model="appStore.theme" @change="handleThemeChange">
                    <el-radio value="light">浅色</el-radio>
                    <el-radio value="dark">深色</el-radio>
                    <el-radio value="auto">跟随系统</el-radio>
                  </el-radio-group>
                </el-form-item>

                <el-form-item label="语言设置">
                  <el-select v-model="appStore.language" @change="handleLanguageChange">
                    <el-option label="简体中文" value="zh-CN" />
                    <el-option label="English" value="en-US" />
                  </el-select>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>

          <el-col :span="12">
            <el-card shadow="never">
              <template #header>
                <h3>状态信息</h3>
              </template>

              <el-descriptions :column="1" border>
                <el-descriptions-item label="当前主题">
                  <el-tag :type="appStore.isDarkMode ? 'info' : 'success'">
                    {{ appStore.isDarkMode ? '深色模式' : '浅色模式' }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="当前语言">
                  <el-tag type="primary">
                    {{ appStore.currentLanguage === 'zh-CN' ? '简体中文' : 'English' }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="应用标题">
                  {{ appStore.title }}
                </el-descriptions-item>
                <el-descriptions-item label="加载状态">
                  <el-tag :type="appStore.isLoading ? 'warning' : 'success'">
                    {{ appStore.isLoading ? '加载中' : '就绪' }}
                  </el-tag>
                </el-descriptions-item>
              </el-descriptions>
            </el-card>
          </el-col>
        </el-row>

        <el-divider />

        <div class="action-section">
          <el-space>
            <el-button type="primary" @click="testStore">测试 Store 状态</el-button>
            <el-button @click="resetSettings">重置设置</el-button>
          </el-space>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores'
import { ElMessage } from 'element-plus'
import {
  ElCard,
  ElButton,
  ElIcon,
  ElRow,
  ElCol,
  ElForm,
  ElFormItem,
  ElRadioGroup,
  ElRadio,
  ElSelect,
  ElOption,
  ElDescriptions,
  ElDescriptionsItem,
  ElTag,
  ElDivider,
  ElSpace
} from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const appStore = useAppStore()

const goBack = (): void => {
  router.push('/')
}

const handleThemeChange = (value: string | number | boolean | undefined): void => {
  ElMessage.success(`主题已切换到: ${String(value)}`)
}

const handleLanguageChange = (value: string | number | boolean | undefined): void => {
  const langValue = String(value)
  ElMessage.success(`语言已切换到: ${langValue === 'zh-CN' ? '简体中文' : 'English'}`)
}

const testStore = (): void => {
  appStore.setLoading(true)
  appStore.setTitle('测试状态中...')

  setTimeout(() => {
    appStore.setLoading(false)
    appStore.setTitle('Docker Downloader')
    ElMessage.success('Store 状态测试完成！')
  }, 2000)
}

const resetSettings = (): void => {
  appStore.setTheme('auto')
  appStore.setLanguage('zh-CN')
  appStore.setTitle('Docker Downloader')
  ElMessage.success('设置已重置')
}
</script>

<style scoped>
.settings-view {
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

.settings-content {
  padding: 20px 0;
}

.action-section {
  text-align: center;
  padding: 20px 0;
}
</style>
