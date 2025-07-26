<script setup lang="ts">
import { ref } from 'vue'
import Versions from './components/Versions.vue'

// 响应数据
const testResult = ref<string>('')
const loading = ref<boolean>(false)
const activeTest = ref<string>('')

// 工具函数：格式化结果显示
const formatResult = (result: unknown, testName: string): string => {
  return `[${testName}] ${JSON.stringify(result, null, 2)}`
}

// 工具函数：格式化错误显示
const formatError = (error: unknown, testName: string): string => {
  return `[${testName} 错误] ${error instanceof Error ? error.message : String(error)}`
}

// 通用测试函数
const runTest = async (testName: string, testFn: () => Promise<unknown>): Promise<void> => {
  if (loading.value) return

  loading.value = true
  activeTest.value = testName
  testResult.value = ''

  try {
    const result = await testFn()
    testResult.value = formatResult(result, testName)
    console.log(`${testName} 成功:`, result)
  } catch (error) {
    testResult.value = formatError(error, testName)
    console.error(`${testName} 失败:`, error)
  } finally {
    loading.value = false
    activeTest.value = ''
  }
}

// 测试方法
const handlePing = (): Promise<void> => runTest('Ping', window.api.registry.ping)

const handleStatus = (): Promise<void> => runTest('状态查询', window.api.registry.status)

const handleBasicTest = (): Promise<void> =>
  runTest('基础测试', () =>
    window.api.registry.test({ message: '测试消息', timestamp: new Date().toISOString() })
  )

const handleUserValidation = (): Promise<void> =>
  runTest('用户验证', () =>
    window.api.registry.validateUser({
      name: '张三',
      email: 'zhangsan@example.com',
      age: 25,
      hobbies: ['编程', '阅读']
    })
  )

const handleInvalidUser = (): Promise<void> =>
  runTest('无效用户验证', () =>
    window.api.registry.validateUser({
      name: 'A', // 太短
      email: 'invalid-email', // 无效邮箱
      age: 15 // 年龄不够
    })
  )

const handleImageSearch = (): Promise<void> =>
  runTest('镜像搜索', () =>
    window.api.registry.searchImages({
      keyword: 'nginx',
      registry: 'docker.io',
      limit: 5
    })
  )

const handleComplexData = (): Promise<void> =>
  runTest('复杂数据处理', () =>
    window.api.registry.complexData({
      title: '测试标题',
      count: 42,
      enabled: true,
      metadata: { version: '1.0', author: 'test' },
      tags: ['tag1', 'tag2', 'tag3']
    })
  )

const handleValidationError = (): Promise<void> =>
  runTest('验证错误测试', () => window.api.registry.throwError('validation'))

const handleBusinessError = (): Promise<void> =>
  runTest('业务错误测试', () => window.api.registry.throwError('business'))

const handleAsyncOperation = (): Promise<void> =>
  runTest('异步操作测试', () => window.api.registry.asyncOperation(1000))

// 旧的 IPC 处理函数（保留作为对比）
const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
</script>

<template>
  <img alt="logo" class="logo" src="./assets/electron.svg" />
  <div class="creator">Docker Downloader - IPC 通信测试</div>
  <div class="text">
    <span class="vue">NestJS</span> + <span class="ts">TypeScript</span> +
    <span class="vue">验证管道</span>
  </div>
  <p class="tip">完整的 IPC 通信功能测试套件</p>

  <!-- IPC 测试区域 -->
  <div class="ipc-test-area">
    <h3>基础通信测试</h3>
    <div class="test-group">
      <button class="test-button" :disabled="loading" @click="handlePing">Ping 测试</button>
      <button class="test-button" :disabled="loading" @click="handleStatus">状态查询</button>
      <button class="test-button" :disabled="loading" @click="handleBasicTest">基础数据测试</button>
    </div>

    <h3>参数验证测试</h3>
    <div class="test-group">
      <button class="test-button success" :disabled="loading" @click="handleUserValidation">
        有效用户验证
      </button>
      <button class="test-button warning" :disabled="loading" @click="handleInvalidUser">
        无效用户验证
      </button>
      <button class="test-button" :disabled="loading" @click="handleImageSearch">镜像搜索</button>
    </div>

    <h3>复杂数据与异步测试</h3>
    <div class="test-group">
      <button class="test-button" :disabled="loading" @click="handleComplexData">
        复杂数据处理
      </button>
      <button class="test-button" :disabled="loading" @click="handleAsyncOperation">
        异步操作 (1秒)
      </button>
    </div>

    <h3>错误处理测试</h3>
    <div class="test-group">
      <button class="test-button error" :disabled="loading" @click="handleValidationError">
        验证错误
      </button>
      <button class="test-button error" :disabled="loading" @click="handleBusinessError">
        业务错误
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-status">正在执行: {{ activeTest }}...</div>

    <!-- 结果显示 -->
    <div v-if="testResult" class="test-result">
      <strong>测试结果:</strong>
      <pre>{{ testResult }}</pre>
    </div>
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
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
  max-width: 800px;
  margin: 20px auto;
}

.ipc-test-area h3 {
  margin: 15px 0 10px 0;
  color: #333;
  font-size: 16px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 5px;
}

.test-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.test-button {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
  min-width: 120px;
}

.test-button:hover:not(:disabled) {
  background-color: #369870;
  transform: translateY(-1px);
}

.test-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  transform: none;
}

.test-button.success {
  background-color: #4caf50;
}

.test-button.success:hover:not(:disabled) {
  background-color: #45a049;
}

.test-button.warning {
  background-color: #ff9800;
}

.test-button.warning:hover:not(:disabled) {
  background-color: #e68900;
}

.test-button.error {
  background-color: #f44336;
}

.test-button.error:hover:not(:disabled) {
  background-color: #da190b;
}

.loading-status {
  text-align: center;
  padding: 10px;
  background-color: #e3f2fd;
  border: 1px solid #2196f3;
  border-radius: 4px;
  margin: 10px 0;
  font-weight: bold;
  color: #1976d2;
}

.test-result {
  margin-top: 15px;
  padding: 10px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.test-result pre {
  margin: 5px 0 0 0;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  white-space: pre-wrap;
  word-break: break-word;
  color: #333;
}
</style>
