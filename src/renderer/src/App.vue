<template>
  <!-- 纯粹的路由容器，不设置任何背景样式 -->
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup lang="ts">
// App组件简化为纯路由容器，所有样式控制由子组件负责
</script>

<style scoped>
/* 完全透明的容器，让子组件完全控制显示 */
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
