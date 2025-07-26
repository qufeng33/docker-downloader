<script setup lang="ts">
import Versions from './components/Versions.vue'
import IpcTestSuite from './components/IpcTestSuite.vue'
</script>

<template>
  <img alt="logo" class="logo" src="./assets/electron.svg" />
  <div class="creator">Docker Downloader - IPC 通信测试</div>
  <div class="text">
    <span class="vue">NestJS</span> + <span class="ts">TypeScript</span> +
    <span class="vue">验证管道</span>
  </div>
  <p class="tip">完整的 IPC 通信功能测试套件</p>

  <!-- 系统性测试套件 -->
  <IpcTestSuite />

  <div class="actions">
    <div class="action">
      <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">Documentation</a>
    </div>
  </div>
  <Versions />
</template>
