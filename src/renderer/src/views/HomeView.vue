<template>
  <div class="home-view" :class="{ 'is-macos': isMacOS, 'is-windows': isWindows }">
    <TheHeader v-model:active-tab="activeTab" />

    <div class="content-area">
      <ImageSearchContainer v-if="activeTab === 'search'" />

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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePlatform } from '@/composables'
import TheHeader from '@/components/layout/TheHeader.vue'
import ImageSearchContainer from '@/components/search/ImageSearchContainer.vue'
import { THEME_COLORS } from '@shared/config/theme'

const { isMacOS, isWindows } = usePlatform()

// 当前活动标签
const activeTab = ref('search')

// 标签页管理
const getTabTitle = (tab: string): string => {
  const titles: Record<string, string> = {
    search: '镜像查询',
    registry: '仓库管理',
    download: '下载管理',
    settings: '配置设置'
  }
  return titles[tab] || '未知页面'
}

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

// 组件挂载时初始化
onMounted(() => {
  initScrollbarBehavior()
})
</script>

<style scoped>
/* 主容器 - 全屏白色背景 */
.home-view {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: v-bind('THEME_COLORS.CONTENT_BACKGROUND');
  display: flex;
  flex-direction: column;
}

/* 内容区域 */
.content-area {
  flex: 1; /* 占据所有剩余空间 */
  padding: 32px;
  padding-top: 140px; /* 留出足够空间给 position:fixed 的 TheHeader */
  overflow-y: auto; /* 只在内容溢出时显示滚动条 */
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
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

/* 响应式设计 */
@media (max-width: 768px) {
  .content-area {
    padding: 16px;
  }
}

/* 自定义滚动条样式 */
.home-view::-webkit-scrollbar,
.content-area::-webkit-scrollbar {
  width: 8px;
  background: transparent;
}

.home-view::-webkit-scrollbar-track,
.content-area::-webkit-scrollbar-track {
  background: rgba(248, 250, 252, 0.8);
  border-radius: 12px;
  margin: 8px 0;
}

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

.home-view::-webkit-scrollbar-thumb:active,
.content-area::-webkit-scrollbar-thumb:active {
  background: linear-gradient(180deg, rgba(29, 78, 216, 1) 0%, rgba(124, 58, 237, 1) 100%);
  box-shadow:
    0 6px 20px rgba(59, 130, 246, 0.4),
    inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.home-view::-webkit-scrollbar-corner,
.content-area::-webkit-scrollbar-corner {
  background: rgba(248, 250, 252, 0.8);
  border-radius: 12px;
}

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

.home-view {
  scrollbar-width: thin;
  scrollbar-color: rgba(59, 130, 246, 0.6) rgba(248, 250, 252, 0.8);
}

.content-area {
  scrollbar-width: thin;
  scrollbar-color: rgba(59, 130, 246, 0.6) rgba(248, 250, 252, 0.8);
}

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

.home-view.scrolling::-webkit-scrollbar,
.content-area.scrolling::-webkit-scrollbar {
  opacity: 1;
}
</style>
