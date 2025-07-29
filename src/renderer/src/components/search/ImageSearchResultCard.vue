<template>
  <div class="image-result-card" :class="{ expanded: isExpanded }" @click="toggleExpand">
    <!-- 基础信息 -->
    <div class="card-header">
      <div class="image-basic-info">
        <div class="image-icon">🐳</div>
        <div class="image-details">
          <h3 class="image-name">{{ image.name }}</h3>
          <p class="image-description">{{ image.description }}</p>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="card-stats">
      <div class="stat-item">
        <span class="stat-label">下载量</span>
        <span class="stat-value">{{ formatNumber(image.pulls) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">星标</span>
        <span class="stat-value">{{ image.stars }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">更新</span>
        <span class="stat-value">{{ formatDate(image.updatedAt) }}</span>
      </div>
    </div>

    <!-- 展开内容 -->
    <div v-if="isExpanded" class="card-expanded-content">
      <div class="expanded-section">
        <h4>镜像标签</h4>
        <div class="image-tags">
          <el-tag v-for="tag in displayTags" :key="tag" size="small">
            {{ tag }}
          </el-tag>
          <el-button
            v-if="(image.tags || []).length > 5"
            type="text"
            size="small"
            class="show-more-tags-btn"
            @click.stop="toggleTagsDisplay"
          >
            {{ showAllTags ? '收起' : `显示更多 (+${(image.tags || []).length - 5})` }}
          </el-button>
        </div>
      </div>
      <div class="expanded-section">
        <h4>支持架构</h4>
        <div class="architectures">
          <span
            v-for="arch in image.architectures || ['amd64', 'arm64']"
            :key="arch"
            class="arch-badge"
          >
            {{ arch }}
          </span>
        </div>
      </div>
      <div class="expanded-actions">
        <el-button @click.stop="emit('view-details', image)">查看详情</el-button>
        <el-button @click.stop="emit('add-to-download', image)">添加到下载列表</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElTag, ElButton } from 'element-plus'
import type { DockerImage } from '@/types'
import { formatNumber, formatDate } from '@/utils/formatters'

const props = defineProps<{ image: DockerImage }>()
const emit = defineEmits(['view-details', 'add-to-download'])

const isExpanded = ref(false)
const showAllTags = ref(false)

const toggleExpand = (): void => {
  isExpanded.value = !isExpanded.value
}

const toggleTagsDisplay = (): void => {
  showAllTags.value = !showAllTags.value
}

const displayTags = computed(() => {
  const allTags = props.image.tags || [
    'latest',
    'alpine',
    'stable',
    'v1.0',
    'dev',
    'test',
    'prod',
    'beta'
  ]
  return showAllTags.value ? allTags : allTags.slice(0, 5)
})
</script>

<style scoped>
/* 镜像结果卡片 - 独立卡片样式 */
.image-result-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.05),
    0 1px 3px rgba(0, 0, 0, 0.1);
}

.image-result-card:hover {
  border-color: #3b82f6;
  box-shadow:
    0 8px 24px rgba(59, 130, 246, 0.12),
    0 4px 12px rgba(59, 130, 246, 0.08);
  transform: translateY(-2px);
}

.image-result-card.expanded {
  border-color: #3b82f6;
  box-shadow:
    0 12px 32px rgba(59, 130, 246, 0.15),
    0 8px 16px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.image-basic-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.image-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  flex-shrink: 0;
}

.image-details {
  flex: 1;
  min-width: 0;
}

.image-name {
  margin: 0 0 2px 0;
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.2;
}

.image-description {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 统计信息 */
.card-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
  padding: 12px 0;
  border-top: 1px solid #f3f4f6;
  border-bottom: 1px solid #f3f4f6;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 14px;
  color: #374151;
  font-weight: 600;
  line-height: 1;
}

/* 展开内容 */
.card-expanded-content {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  animation: expandIn 0.3s ease;
}

@keyframes expandIn {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 200px;
  }
}

.expanded-section {
  margin-bottom: 16px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.expanded-section h4 {
  margin: 0 0 8px 0;
  color: #374151;
  font-size: 13px;
  font-weight: 600;
}

.image-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.image-tags .el-tag {
  border-radius: 4px;
  font-weight: 500;
  padding: 2px 8px;
  background: #dbeafe;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  font-size: 12px;
  height: auto;
  line-height: 1.2;
}

.show-more-tags-btn {
  padding: 2px 8px !important;
  height: auto !important;
  line-height: 1.2 !important;
  font-size: 12px !important;
  color: #6b7280 !important;
  margin-left: 4px;
  border-radius: 4px;
}

.show-more-tags-btn:hover {
  color: #3b82f6 !important;
  background: #f3f4f6 !important;
}

.architectures {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.arch-badge {
  background: #ecfdf5;
  color: #059669;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid #d1fae5;
}

.expanded-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 12px;
}

.expanded-actions .el-button {
  border-radius: 6px;
  font-weight: 500;
  padding: 6px 12px;
  font-size: 12px;
  height: auto;
  line-height: 1.2;
}
</style>
