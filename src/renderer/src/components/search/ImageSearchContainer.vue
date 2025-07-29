<template>
  <div class="search-page">
    <!-- 主搜索区域 -->
    <div class="hero-search-section" :class="{ 'search-active': searchInitiated }">
      <div class="search-content-wrapper">
        <!-- 大搜索框 -->
        <div class="hero-search-box">
          <div class="search-input-wrapper">
            <el-input
              v-model="searchQuery"
              placeholder="搜索镜像名称，如: nginx, mysql, node..."
              class="hero-search-input"
              size="large"
              clearable
              @keyup.enter="performSearch"
              @clear="clearSearch"
            >
              <template #prefix>
                <el-icon class="search-prefix-icon"><Search /></el-icon>
              </template>
            </el-input>
            <el-button
              type="primary"
              size="large"
              :loading="isSearching"
              class="search-action-btn"
              @click="performSearch"
            >
              {{ isSearching ? '搜索中...' : '搜索' }}
            </el-button>
          </div>
        </div>

        <!-- 热门标签 -->
        <div v-if="!searchInitiated" class="popular-tags">
          <span class="tags-label">热门镜像：</span>
          <el-tag
            v-for="tag in popularImages.slice(0, 8)"
            :key="tag"
            class="popular-tag"
            effect="plain"
            @click="
              () => {
                searchQuery = tag
                performSearch()
              }
            "
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
    </div>

    <!-- 搜索结果区域 -->
    <div v-if="searchInitiated" class="results-section">
      <!-- 搜索加载状态 -->
      <div v-if="isSearching" class="search-loading">
        <div class="loading-skeleton">
          <div v-for="i in 3" :key="i" class="skeleton-card">
            <el-skeleton :rows="3" animated />
          </div>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div v-else-if="searchResults.length" class="search-results">
        <!-- 结果列表 - 瀑布流布局 -->
        <div class="results-grid">
          <ImageSearchResultCard
            v-for="image in searchResults"
            :key="image.name"
            :image="image"
            @view-details="viewImageDetails"
            @add-to-download="addToDownloadList"
          />
        </div>
      </div>

      <!-- 无结果 -->
      <div v-else-if="!isSearching && searchResults.length === 0" class="no-results">
        <div class="no-results-icon">🤷</div>
        <h3>什么都没找到</h3>
        <p>
          我们尽力了，但没有找到与 "<strong>{{ searchQuery }}</strong
          >" 相关的镜像。
        </p>
        <p>请尝试更换关键词或检查拼写。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElInput, ElButton, ElIcon, ElTag, ElSkeleton } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import ImageSearchResultCard from './ImageSearchResultCard.vue'
import type { DockerImage } from '@/types'

// 搜索相关状态
const searchQuery = ref('')
const isSearching = ref(false)
const searchResults = ref<DockerImage[]>([])
const searchInitiated = ref(false) // 核心状态：是否已发起过搜索

// 热门镜像建议
const popularImages = [
  'nginx',
  'mysql',
  'redis',
  'node',
  'python',
  'ubuntu',
  'alpine',
  'postgres',
  'mongo',
  'elasticsearch',
  'jenkins',
  'tomcat',
  'openjdk',
  'httpd'
]

// 清空搜索
const clearSearch = (): void => {
  searchQuery.value = ''
  searchResults.value = []
  isSearching.value = false
  searchInitiated.value = false // 恢复到初始居中状态
}

const performSearch = async (): Promise<void> => {
  if (!searchQuery.value.trim()) return

  searchInitiated.value = true // 标记搜索已开始，触发位移动画
  isSearching.value = true
  searchResults.value = [] // 清空旧结果

  try {
    // 模拟搜索API调用
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // 模拟搜索结果
    const mockResults: DockerImage[] = [
      {
        name: searchQuery.value,
        description: `Official ${searchQuery.value} image for containerized applications`,
        pulls: Math.floor(Math.random() * 1000000000),
        stars: Math.floor(Math.random() * 10000),
        isOfficial: Math.random() > 0.5,
        isVerified: Math.random() > 0.3,
        updatedAt: new Date().toISOString(),
        tags: ['latest', 'alpine', 'stable', 'lts'],
        architectures: ['amd64', 'arm64', 'arm/v7']
      },
      {
        name: `${searchQuery.value}-alpine`,
        description: `Lightweight ${searchQuery.value} image based on Alpine Linux`,
        pulls: Math.floor(Math.random() * 100000000),
        stars: Math.floor(Math.random() * 5000),
        isOfficial: Math.random() > 0.7,
        isVerified: Math.random() > 0.5,
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        tags: ['alpine', 'latest', '3.18'],
        architectures: ['amd64', 'arm64']
      },
      {
        name: `bitnami/${searchQuery.value}`,
        description: `Bitnami ${searchQuery.value} image with security updates`,
        pulls: Math.floor(Math.random() * 50000000),
        stars: Math.floor(Math.random() * 3000),
        isOfficial: false,
        isVerified: true,
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
        tags: ['latest', 'debian-11', 'ubuntu-20.04'],
        architectures: ['amd64', 'arm64']
      }
    ]
    searchResults.value = mockResults
  } catch (error) {
    console.error('搜索失败:', error)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

// 镜像操作
const viewImageDetails = (image: DockerImage): void => {
  console.log('查看镜像详情:', image.name)
}

const addToDownloadList = (image: DockerImage): void => {
  console.log('添加到下载列表:', image.name)
}
</script>

<style scoped>
/* 搜索页面 */
.search-page {
  max-width: 1200px;
  margin: 0 auto;
}

/* 主搜索区域 - 作为定位和动画容器 */
.hero-search-section {
  position: relative;
  min-height: 70vh; /* 使用 min-height 保证初始容器高度，同时允许弹性增长 */
  margin-bottom: 32px;
  /* 核心：让容器高度也参与动画 */
  transition: min-height 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 搜索激活时，收缩容器高度 */
.hero-search-section.search-active {
  min-height: 140px; /* 收缩到足以容纳顶部搜索框的高度 */
}

/* 搜索内容的包装器 - 这才是我们移动的主体 */
.search-content-wrapper {
  position: absolute;
  width: 100%;
  left: 50%;
  /* 初始状态：垂直居中 */
  top: 50%;
  transform: translate(-50%, -50%);
  /* 核心动画属性 - ease-out-back 效果 */
  transition: all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 搜索激活状态 - 移动到顶部 */
.hero-search-section.search-active .search-content-wrapper {
  top: 60px; /* 移动到距离容器顶部60px的位置 */
  transform: translate(-50%, 0);
}

/* 大搜索框 */
.hero-search-box {
  width: 100%;
  max-width: 80%;
  margin: 0 auto;
}

.search-input-wrapper {
  display: flex;
  gap: 0;
  width: 100%;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-input-wrapper:hover {
  border-color: #3b82f6;
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.1);
}

.search-input-wrapper:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
}

.hero-search-input {
  flex: 1;
  --el-input-height: 56px;
  --el-input-font-size: 16px;
}

.hero-search-input :deep(.el-input__wrapper) {
  border-radius: 0;
  border: none;
  box-shadow: none;
  transition: none;
  padding: 0 20px;
  background: white;
  backdrop-filter: none;
}

.hero-search-input :deep(.el-input__wrapper:hover),
.hero-search-input :deep(.el-input__wrapper.is-focus) {
  border: none;
  box-shadow: none;
  transform: none;
}

.search-action-btn {
  border-radius: 0;
  padding: 0 24px;
  font-weight: 600;
  font-size: 16px;
  background: #4f46e5;
  border: none;
  box-shadow: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 56px;
  line-height: 1;
  min-width: 140px; /* 确保按钮宽度在不同状态下保持一致 */
}

.search-action-btn:hover {
  background: #4338ca;
  border-color: #4338ca;
  box-shadow: 0 6px 20px rgba(67, 56, 202, 0.35);
}

.search-prefix-icon {
  color: #9ca3af;
  font-size: 18px;
}

/* 热门标签 */
.popular-tags {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 32px;
  /* 动画 */
  opacity: 1;
  transition: opacity 0.3s ease;
}

/* 搜索激活时隐藏热门标签 */
.hero-search-section.search-active .popular-tags {
  opacity: 0;
  pointer-events: none;
}

.tags-label {
  color: #64748b;
  font-weight: 600;
  font-size: 15px;
}

.popular-tag {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
  padding: 6px 12px;
  font-weight: 500;
  background: white;
  border: 1px solid #e2e8f0;
  color: #64748b;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.popular-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
  border-color: #4f46e5;
  color: #4f46e5;
  background: #faf9ff;
}

/* 搜索结果区域 */
.results-section {
  background: transparent;
  padding: 0;
  box-shadow: none;
  max-width: 80%;
  margin: 0 auto;
  /* 结果区域的入场动画 */
  animation: fadeInAfterDelay 0.5s 0.5s both;
}

@keyframes fadeInAfterDelay {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 结果网格 */
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  width: 100%;
}

/* 加载状态 */
.loading-skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  width: 100%;
}

.skeleton-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.05),
    0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 无结果状态 */
.no-results {
  text-align: center;
  padding: 80px 20px;
}

.no-results-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.no-results h3 {
  color: #6c757d;
  margin: 0 0 8px 0;
}

.no-results p {
  color: #adb5bd;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .results-grid,
  .loading-skeleton {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .results-grid,
  .loading-skeleton {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .hero-search-box {
    max-width: 95%;
  }

  .results-section {
    max-width: 95%;
  }
}
</style>
