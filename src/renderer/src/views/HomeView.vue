<template>
  <div class="home-view" :class="{ 'is-macos': isMacOS, 'is-windows': isWindows }">
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

    <!-- 主要内容卡片 -->
    <div class="main-content-card">
      <!-- 顶部导航栏 - 参考加密货币设计 -->
      <div class="top-navbar">
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

      <!-- 内容区域 -->
      <div class="content-area">
        <!-- 镜像查询页面 -->
        <div v-if="activeTab === 'search'" class="search-page">
          <!-- 主搜索区域 -->
          <div
            class="hero-search-section"
            :class="{ 'search-active': isSearching || searchResults.length > 0 }"
          >
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
                  @input="onSearchInput"
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
            <div v-if="!searchQuery && !searchResults.length" class="popular-tags">
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

          <!-- 搜索结果区域 -->
          <div v-if="searchResults.length || showSkeleton" class="results-section">
            <!-- 搜索加载状态 -->
            <div v-if="isSearching && showSkeleton" class="search-loading">
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
                <div
                  v-for="image in searchResults"
                  :key="image.name"
                  class="image-result-card"
                  :class="{ expanded: expandedCard === image.name }"
                  @click="toggleCard(image.name)"
                >
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
                  <div v-if="expandedCard === image.name" class="card-expanded-content">
                    <div class="expanded-section">
                      <h4>镜像标签</h4>
                      <div class="image-tags">
                        <el-tag v-for="tag in getDisplayTags(image)" :key="tag" size="small">
                          {{ tag }}
                        </el-tag>
                        <el-button
                          v-if="(image.tags || []).length > 5"
                          type="text"
                          size="small"
                          class="show-more-tags-btn"
                          @click.stop="toggleTagsDisplay(image.name)"
                        >
                          {{
                            showAllTags[image.name]
                              ? '收起'
                              : `显示更多 (+${(image.tags || []).length - 5})`
                          }}
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
                      <el-button @click.stop="viewImageDetails(image)">查看详情</el-button>
                      <el-button @click.stop="addToDownloadList(image)">添加到下载列表</el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 无结果 -->
            <div v-else class="no-results">
              <div class="no-results-icon">🔍</div>
              <h3>未找到相关镜像</h3>
              <p>请尝试其他关键词或检查拼写</p>
            </div>
          </div>
        </div>

        <!-- 其他页面占位 -->
        <div v-else class="placeholder-page">
          <div class="placeholder-content">
            <div class="placeholder-icon">🚧</div>
            <h2>{{ getTabTitle(activeTab) }}</h2>
            <p>该功能正在开发中，敬请期待...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTheme, usePlatform } from '@/composables'
import { ElInput, ElButton, ElIcon, ElTag, ElSkeleton } from 'element-plus'
import { Search, Box, Setting, Download } from '@element-plus/icons-vue'
// 动态导入主题图标
import { Moon, Sunny } from '@element-plus/icons-vue'
// 导入统一主题配置
import { THEME_COLORS, PLATFORM_CONFIG } from '@shared/config/theme'

const { isDarkMode, toggleTheme } = useTheme()
const { isMacOS, isWindows } = usePlatform()

// 当前活动标签
const activeTab = ref('search')

// 窗口控制状态
const isMaximized = ref(false)

// 搜索相关状态
const searchQuery = ref('')
const isSearching = ref(false)
const showSkeleton = ref(false) // 控制骨架图显示的独立状态
const searchResults = ref<DockerImage[]>([])
const expandedCard = ref<string | null>(null)
const showAllTags = ref<Record<string, boolean>>({})

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

// 镜像数据类型
interface DockerImage {
  name: string
  description: string
  pulls: number
  stars: number
  isOfficial: boolean
  isVerified: boolean
  updatedAt: string
  tags?: string[]
  architectures?: string[]
}

// 初始化窗口状态
const initWindowState = async (): Promise<void> => {
  if (isWindows.value && window.api) {
    isMaximized.value = await window.api.window.isMaximized()
  }
}

// 窗口控制方法
const minimizeWindow = (): void => {
  if (window.api) {
    window.api.window.minimize()
  }
}

const toggleMaximizeWindow = async (): Promise<void> => {
  if (window.api) {
    await window.api.window.toggleMaximize()
    isMaximized.value = await window.api.window.isMaximized()
  }
}

const closeWindow = (): void => {
  if (window.api) {
    window.api.window.close()
  }
}

// 标签页管理
const setActiveTab = (tab: string): void => {
  activeTab.value = tab
}

const getTabTitle = (tab: string): string => {
  const titles: Record<string, string> = {
    search: '镜像查询',
    registry: '仓库管理',
    download: '下载管理',
    settings: '配置设置'
  }
  return titles[tab] || '未知页面'
}

// 卡片展开管理
const toggleCard = (imageName: string): void => {
  if (expandedCard.value === imageName) {
    expandedCard.value = null
  } else {
    expandedCard.value = imageName
    // 重置该卡片的标签显示状态
    showAllTags.value[imageName] = false
  }
}

// 切换标签显示数量
const toggleTagsDisplay = (imageName: string): void => {
  showAllTags.value[imageName] = !showAllTags.value[imageName]
}

// 获取显示的标签
const getDisplayTags = (image: DockerImage): string[] => {
  const allTags = image.tags || [
    'latest',
    'alpine',
    'stable',
    'v1.0',
    'dev',
    'test',
    'prod',
    'beta'
  ]
  const showAll = showAllTags.value[image.name]
  return showAll ? allTags : allTags.slice(0, 5)
}

// 清空搜索
const clearSearch = (): void => {
  searchQuery.value = ''
  searchResults.value = []
  expandedCard.value = null
  showAllTags.value = {}
  isSearching.value = false
  showSkeleton.value = false
}

// 搜索功能
const onSearchInput = (): void => {
  // 可以在这里添加实时搜索建议逻辑
}

const performSearch = async (): Promise<void> => {
  if (!searchQuery.value.trim()) return

  isSearching.value = true
  showSkeleton.value = false // 先不显示骨架图
  expandedCard.value = null // 重置展开状态

  // 延迟显示骨架图，给搜索框位移动画时间
  setTimeout(() => {
    if (isSearching.value) {
      showSkeleton.value = true
    }
  }, 800) // 与搜索框动画时间匹配

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
  } finally {
    isSearching.value = false
    showSkeleton.value = false
  }
}

// 格式化数字
const formatNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B'
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// 格式化日期
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) return '1天前'
  if (diffDays < 7) return `${diffDays}天前`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)}周前`
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)}个月前`

  return `${Math.ceil(diffDays / 365)}年前`
}

// 镜像操作
const viewImageDetails = (image: DockerImage): void => {
  console.log('查看镜像详情:', image.name)
  // 这里会打开详情页面
}

const addToDownloadList = (image: DockerImage): void => {
  console.log('添加到下载列表:', image.name)
  // 这里会添加到下载队列
}

// 组件挂载时初始化
onMounted(() => {
  initWindowState()
  initScrollbarBehavior()
})

// 初始化滚动条行为
const initScrollbarBehavior = (): void => {
  let scrollTimeout: number

  const handleScroll = (element: HTMLElement): void => {
    element.classList.add('scrolling')

    clearTimeout(scrollTimeout)
    scrollTimeout = window.setTimeout(() => {
      element.classList.remove('scrolling')
    }, 1000) // 滚动停止1秒后隐藏滚动条
  }

  // 为主容器和内容区域添加滚动监听
  const homeView = document.querySelector('.home-view') as HTMLElement
  const contentArea = document.querySelector('.content-area') as HTMLElement

  if (homeView) {
    homeView.addEventListener('scroll', () => handleScroll(homeView))
  }

  if (contentArea) {
    contentArea.addEventListener('scroll', () => handleScroll(contentArea))
  }
}
</script>

<style scoped>
/* ===========================================
   新布局样式 - 参考加密货币设计
   =========================================== */

/* 主容器 - 全屏白色背景 */
.home-view {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: v-bind('THEME_COLORS.CONTENT_BACKGROUND');
  overflow-y: auto;
  z-index: 0;
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
}

/* macOS 平台特定样式 */
.macos-drag-area {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: v-bind('PLATFORM_CONFIG.MACOS.DRAG_AREA_HEIGHT + "px"');
  z-index: 1000;
  -webkit-app-region: drag;
  background-color: v-bind('THEME_COLORS.DRAG_AREA_BACKGROUND');
}

/* Windows 平台特定样式 */
.windows-drag-area {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: v-bind('PLATFORM_CONFIG.WINDOWS.DRAG_AREA_HEIGHT + "px"');
  background-color: v-bind('THEME_COLORS.DRAG_AREA_BACKGROUND');
  z-index: 1000;
  -webkit-app-region: drag;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 8px;
}

/* 主要内容卡片 */
.main-content-card {
  background: v-bind('THEME_COLORS.CONTENT_BACKGROUND');
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 - 参考加密货币设计 */
.top-navbar {
  display: flex;
  align-items: center;
  padding: 20px 32px;
  background: v-bind('THEME_COLORS.CONTENT_BACKGROUND');
  border-bottom: 1px solid rgba(233, 236, 239, 0.3);
  backdrop-filter: blur(20px);
  -webkit-app-region: no-drag;
  position: relative;
  z-index: 100;
  min-height: 80px;
}

/* 三列布局：左侧品牌，中间导航（居中），右侧操作 */
.navbar-brand {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 中间导航 - 绝对居中 */
.navbar-nav {
  display: flex;
  gap: 8px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

/* 右侧操作区 */
.navbar-actions {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

/* 平台特定的导航栏边距 */
.home-view.is-macos .top-navbar {
  margin-top: v-bind('PLATFORM_CONFIG.MACOS.DRAG_AREA_HEIGHT + "px"');
}

.home-view.is-windows .top-navbar {
  margin-top: v-bind('PLATFORM_CONFIG.WINDOWS.DRAG_AREA_HEIGHT + "px"');
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
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: logoFloat 6s ease-in-out infinite;
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
.navbar-nav {
  display: flex;
  gap: 8px;
}

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
.navbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

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

.theme-toggle.action-item:hover .action-icon {
  color: #f59e0b;
}

.settings-btn.action-item:hover .action-icon {
  color: #10b981;
}

/* 内容区域 */
.content-area {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

/* 搜索页面 */
.search-page {
  max-width: 1200px;
  margin: 0 auto;
}

/* 主搜索区域 */
.hero-search-section {
  background: transparent;
  border-radius: 0;
  padding: 0;
  margin-bottom: 32px;
  text-align: center;
  position: relative;
  z-index: 1;
  transition: all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1);

  /* 默认居中布局 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

/* 搜索激活状态 - 移动到顶部 */
.hero-search-section.search-active {
  min-height: auto;
  justify-content: flex-start;
  padding-top: 20px;
  margin-bottom: 20px;
}

/* 大搜索框 */
.hero-search-box {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 80%; /* 占据页面宽度的80% */
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

/* 参考 Netsearch 的搜索框设计 */
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
  height: 56px; /* 确保与输入框高度一致 */
  line-height: 1;
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
  position: relative;
  z-index: 1;
  margin-top: 32px;
  opacity: 1;
  transition: all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1);
}

/* 搜索激活时隐藏热门标签 */
.hero-search-section.search-active .popular-tags {
  opacity: 0;
  margin-top: 0;
  max-height: 0;
  overflow: hidden;
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

.popular-tag::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  transition: left 0.5s;
}

.popular-tag:hover::before {
  left: 100%;
}

.popular-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
  border-color: #4f46e5;
  color: #4f46e5;
  background: #faf9ff;
}

.popular-tag:active {
  transform: translateY(0);
}

/* 导航项动画增强 */
.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.nav-item:hover::before {
  opacity: 1;
}

.nav-item:hover {
  color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15);
}

.nav-item.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

.nav-item.active::before {
  opacity: 0;
}

/* 品牌logo动画 */
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
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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

.brand-logo::after {
  content: '';
  position: absolute;
  inset: 2px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%);
  pointer-events: none;
}

.brand-logo:hover {
  transform: translateY(-4px) rotate(5deg);
  box-shadow:
    0 16px 40px rgba(59, 130, 246, 0.35),
    0 8px 20px rgba(59, 130, 246, 0.25);
}

.docker-icon {
  font-size: 26px;
  color: white;
  transition: transform 0.3s ease;
}

.brand-logo:hover .docker-icon {
  transform: scale(1.1);
}

/* 加载动画增强 */
.search-loading {
  padding: 48px 0;
}

.loading-skeleton {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.skeleton-card {
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(255, 255, 255, 0.9) 100%);
  border-radius: 20px;
  padding: 28px;
  border: 1px solid rgba(226, 232, 240, 0.5);
  position: relative;
  overflow: hidden;
}

.skeleton-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* 主题切换增强动画 */
.theme-toggle {
  padding: 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.6);
  backdrop-filter: blur(8px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

/* 页面入场动画 */
.search-page {
  animation: pageSlideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes pageSlideIn {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 结果列表入场动画 */
.results-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.image-result-card:nth-child(1) {
  animation: cardSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both;
}
.image-result-card:nth-child(2) {
  animation: cardSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
}
.image-result-card:nth-child(3) {
  animation: cardSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both;
}
.image-result-card:nth-child(n + 4) {
  animation: cardSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both;
}

@keyframes cardSlideIn {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 搜索框聚焦时的脉冲动画 */
.search-input-wrapper:focus-within {
  animation: focusPulse 2s ease-in-out infinite;
}

@keyframes focusPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.01);
  }
}

/* 搜索结果区域 */
.results-section {
  background: transparent;
  padding: 0;
  box-shadow: none;
  max-width: 80%; /* 与搜索框宽度保持一致 */
  margin: 0 auto;
}

/* 结果网格 - 瀑布流布局 */
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 100%; /* 确保不超过容器宽度 */
}

/* 窄屏幕适配 */
@media (max-width: 1200px) {
  .results-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .results-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .hero-search-box {
    max-width: 95%;
  }

  .results-section {
    max-width: 95%; /* 移动端适配 */
  }
}

/* 加载状态 */
.search-loading {
  padding: 24px 0;
  width: 100%;
}

.loading-skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 100%; /* 确保不超过容器宽度 */
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
  backdrop-filter: blur(8px);
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

/* 卡片头部 - 紧凑布局 */
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

/* 统计信息 - 水平紧凑布局 */
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

/* 展开内容 - 精简版 */
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

/* 占位页面 */
.placeholder-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 500px;
}

.placeholder-content {
  text-align: center;
  color: #6c757d;
}

.placeholder-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.placeholder-content h2 {
  margin: 0 0 12px 0;
  font-size: 1.5rem;
}

.placeholder-content p {
  margin: 0;
  font-size: 1rem;
}

/* 窗口控制按钮 */
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

/* 响应式设计 */
@media (max-width: 768px) {
  .content-area {
    padding: 16px;
  }

  .hero-search-section {
    padding: 32px 24px;
  }

  .hero-title {
    font-size: 2rem;
  }

  .search-input-wrapper {
    flex-direction: column;
  }

  .card-stats {
    flex-wrap: wrap;
    gap: 16px;
  }

  .expanded-actions {
    flex-direction: column;
  }
}

/* ==========================================
   自定义滚动条样式 - 现代化设计
   ========================================== */

/* 主滚动条容器样式 */
.home-view::-webkit-scrollbar,
.content-area::-webkit-scrollbar {
  width: 8px;
  background: transparent;
}

/* 滚动条轨道 */
.home-view::-webkit-scrollbar-track,
.content-area::-webkit-scrollbar-track {
  background: rgba(248, 250, 252, 0.8);
  border-radius: 12px;
  margin: 8px 0;
}

/* 滚动条滑块 */
.home-view::-webkit-scrollbar-thumb,
.content-area::-webkit-scrollbar-thumb {
  background: linear-gradient(
    180deg,
    rgba(59, 130, 246, 0.6) 0%,
    rgba(29, 78, 216, 0.8) 50%,
    rgba(124, 58, 237, 0.6) 100%
  );
  border-radius: 12px;
  border: 2px solid rgba(248, 250, 252, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

/* 滚动条滑块悬停效果 */
.home-view::-webkit-scrollbar-thumb:hover,
.content-area::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(
    180deg,
    rgba(59, 130, 246, 0.8) 0%,
    rgba(29, 78, 216, 1) 50%,
    rgba(124, 58, 237, 0.8) 100%
  );
  border-color: rgba(255, 255, 255, 0.9);
  box-shadow:
    0 4px 16px rgba(59, 130, 246, 0.3),
    0 2px 8px rgba(59, 130, 246, 0.2);
  transform: scaleX(1.2);
}

/* 滚动条滑块激活状态 */
.home-view::-webkit-scrollbar-thumb:active,
.content-area::-webkit-scrollbar-thumb:active {
  background: linear-gradient(180deg, rgba(29, 78, 216, 1) 0%, rgba(124, 58, 237, 1) 100%);
  box-shadow:
    0 6px 20px rgba(59, 130, 246, 0.4),
    inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 滚动条拐角 */
.home-view::-webkit-scrollbar-corner,
.content-area::-webkit-scrollbar-corner {
  background: rgba(248, 250, 252, 0.8);
  border-radius: 12px;
}

/* 深色模式下的滚动条适配 */
@media (prefers-color-scheme: dark) {
  .home-view::-webkit-scrollbar-track,
  .content-area::-webkit-scrollbar-track {
    background: rgba(31, 41, 55, 0.8);
  }

  .home-view::-webkit-scrollbar-thumb,
  .content-area::-webkit-scrollbar-thumb {
    border-color: rgba(31, 41, 55, 0.8);
  }

  .home-view::-webkit-scrollbar-thumb:hover,
  .content-area::-webkit-scrollbar-thumb:hover {
    border-color: rgba(55, 65, 81, 0.9);
  }

  .home-view::-webkit-scrollbar-corner,
  .content-area::-webkit-scrollbar-corner {
    background: rgba(31, 41, 55, 0.8);
  }
}

/* 细节优化 - Firefox 滚动条样式 */
.home-view {
  scrollbar-width: thin;
  scrollbar-color: rgba(59, 130, 246, 0.6) rgba(248, 250, 252, 0.8);
}

.content-area {
  scrollbar-width: thin;
  scrollbar-color: rgba(59, 130, 246, 0.6) rgba(248, 250, 252, 0.8);
}

/* 滚动条只在滚动或悬停时显示 - 增强用户体验 */
.home-view::-webkit-scrollbar,
.content-area::-webkit-scrollbar {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.home-view:hover::-webkit-scrollbar,
.content-area:hover::-webkit-scrollbar,
.home-view::-webkit-scrollbar:hover,
.content-area::-webkit-scrollbar:hover {
  opacity: 1;
}

/* 滚动时显示滚动条 */
.home-view.scrolling::-webkit-scrollbar,
.content-area.scrolling::-webkit-scrollbar {
  opacity: 1;
}
</style>
