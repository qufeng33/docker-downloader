<script setup lang="ts">
import { ref } from 'vue'
import Versions from './components/Versions.vue'

// 响应数据
const pingResult = ref<string>('')
const loading = ref<boolean>(false)

// Ping 功能
const handlePing = async (): Promise<void> => {
  loading.value = true
  pingResult.value = ''

  try {
    const result = await window.api.registry.ping()
    pingResult.value = `Pong! ${result.message} at ${result.timestamp}`
    console.log('Ping 成功:', result)
  } catch (error) {
    pingResult.value = `错误: ${error}`
    console.error('Ping 失败:', error)
  } finally {
    loading.value = false
  }
}

// 旧的 IPC 处理函数（保留作为对比）
const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
</script>

<template>
  <img alt="logo" class="logo" src="./assets/electron.svg" />
  <div class="creator">Docker Downloader - NestJS + Electron</div>
  <div class="text">
    Build an Electron app with
    <span class="vue">Vue 3</span>
    +
    <span class="ts">NestJS</span>
    +
    <span class="ts">TypeScript</span>
  </div>
  <p class="tip">测试 IPC 通信功能</p>

  <!-- IPC 测试区域 -->
  <div class="ipc-test-area">
    <div class="action">
      <button class="ping-button" :disabled="loading" @click="handlePing">
        {{ loading ? '发送中...' : 'Ping NestJS' }}
      </button>
    </div>

    <div v-if="pingResult" class="ping-result"><strong>响应:</strong> {{ pingResult }}</div>
  </div>

  <div class="actions">
    <div class="action">
      <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">Documentation</a>
    </div>
    <div class="action">
      <a target="_blank" rel="noreferrer" @click="ipcHandle">Old Send IPC</a>
    </div>
  </div>
  <Versions />
</template>

<style>
.ipc-test-area {
  margin: 20px 0;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.ping-button {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.ping-button:hover:not(:disabled) {
  background-color: #369870;
}

.ping-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.ping-result {
  margin-top: 10px;
  padding: 8px;
  background-color: #e8f5e8;
  border: 1px solid #4caf50;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  word-break: break-all;
}
</style>
