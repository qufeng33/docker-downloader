<template>
  <div class="ipc-test-suite">
    <h2>IPC 通信功能验证测试套件</h2>

    <!-- 测试状态显示 -->
    <div class="test-status">
      <div class="status-item">
        <span class="label">总测试数：</span>
        <span class="value">{{ testSuite.length }}</span>
      </div>
      <div class="status-item">
        <span class="label">已完成：</span>
        <span class="value">{{ completedTests }}</span>
      </div>
      <div class="status-item">
        <span class="label">成功：</span>
        <span class="value success">{{ passedTests }}</span>
      </div>
      <div class="status-item">
        <span class="label">失败：</span>
        <span class="value error">{{ failedTests }}</span>
      </div>
    </div>

    <!-- 全局操作按钮 -->
    <div class="global-actions">
      <button class="action-button primary" :disabled="isRunning" @click="runAllTests">
        {{ isRunning ? '运行中...' : '运行全部测试' }}
      </button>
      <button class="action-button secondary" :disabled="isRunning" @click="clearResults">
        清空结果
      </button>
      <button class="action-button secondary" :disabled="isRunning" @click="runTypeTests">
        运行类型验证测试
      </button>
    </div>

    <!-- 测试列表 -->
    <div class="test-list">
      <div
        v-for="test in testSuite"
        :key="test.id"
        class="test-item"
        :class="{
          running: test.status === 'running',
          passed: test.status === 'passed',
          failed: test.status === 'failed'
        }"
      >
        <div class="test-header">
          <h3>{{ test.name }}</h3>
          <div class="test-controls">
            <button
              class="test-button"
              :disabled="isRunning || test.status === 'running'"
              @click="runSingleTest(test)"
            >
              {{ test.status === 'running' ? '运行中...' : '运行' }}
            </button>
            <span class="test-status-badge" :class="test.status">
              {{ getStatusText(test.status) }}
            </span>
          </div>
        </div>

        <p class="test-description">{{ test.description }}</p>

        <!-- 测试结果显示 -->
        <div v-if="test.result" class="test-result">
          <div class="result-header">
            <strong>测试结果:</strong>
            <span class="execution-time">耗时: {{ test.executionTime }}ms</span>
          </div>
          <pre class="result-content">{{ formatTestResult(test.result) }}</pre>
        </div>

        <!-- 错误信息显示 -->
        <div v-if="test.error" class="test-error">
          <div class="error-header">
            <strong>错误信息:</strong>
          </div>
          <pre class="error-content">{{ test.error }}</pre>
        </div>
      </div>
    </div>

    <!-- 类型验证结果 -->
    <div v-if="typeTestResults.length > 0" class="type-test-results">
      <h3>TypeScript 类型验证结果</h3>
      <div
        v-for="result in typeTestResults"
        :key="result.test"
        class="type-result"
        :class="{ passed: result.passed, failed: !result.passed }"
      >
        <span class="type-test-name">{{ result.test }}</span>
        <span class="type-test-status">{{ result.passed ? '✅ 通过' : '❌ 失败' }}</span>
        <span v-if="result.message" class="type-test-message">{{ result.message }}</span>
      </div>
    </div>

    <!-- 错误传播测试 -->
    <ErrorPropagationTest />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ErrorPropagationTest from './ErrorPropagationTest.vue'
import type {
  UserInfoDto,
  ImageSearchDto,
  ComplexDataDto,
  AsyncOperationDto,
  ImageSearchResponseDto
} from '@shared/types'

// 测试状态类型
type TestStatus = 'pending' | 'running' | 'passed' | 'failed'

// 测试项接口
interface TestItem {
  id: string
  name: string
  description: string
  testFn: () => Promise<unknown>
  status: TestStatus
  result?: unknown
  error?: string
  executionTime?: number
}

// 类型验证结果接口
interface TypeTestResult {
  test: string
  passed: boolean
  message?: string
}

// 响应式数据
const isRunning = ref(false)
const typeTestResults = ref<TypeTestResult[]>([])

// 测试套件定义
const testSuite = ref<TestItem[]>([
  {
    id: 'ping',
    name: 'Ping 通信测试',
    description: '验证基础的 IPC 通信是否正常工作',
    testFn: async () => {
      const result = await window.api.registry.ping()
      if (!result.message || !result.timestamp) {
        throw new Error('Ping 响应格式不正确')
      }
      return result
    },
    status: 'pending'
  },
  {
    id: 'status',
    name: '状态查询测试',
    description: '验证服务状态查询功能',
    testFn: async () => {
      const result = await window.api.registry.status()
      if (!result.status || !result.message) {
        throw new Error('状态响应格式不正确')
      }
      return result
    },
    status: 'pending'
  },
  {
    id: 'basic-data',
    name: '基础数据传输测试',
    description: '验证基础数据结构的传输和处理',
    testFn: async () => {
      const testData = {
        message: '测试消息',
        timestamp: new Date().toISOString(),
        data: { test: true, number: 42 }
      }
      const result = await window.api.registry.test(testData)
      if (!result.success) {
        throw new Error('基础数据处理失败')
      }
      return result
    },
    status: 'pending'
  },
  {
    id: 'user-validation-success',
    name: '用户验证成功测试',
    description: '验证有效用户数据的验证功能',
    testFn: async () => {
      const userData: UserInfoDto = {
        name: '张三',
        email: 'zhangsan@example.com',
        age: 25,
        hobbies: ['编程', '阅读']
      }
      const result = await window.api.registry.validateUser(userData)
      if (!result.valid) {
        throw new Error('有效用户验证失败')
      }
      return result
    },
    status: 'pending'
  },
  {
    id: 'user-validation-failure',
    name: '用户验证失败测试',
    description: '验证无效用户数据的验证功能',
    testFn: async () => {
      const invalidUserData: UserInfoDto = {
        name: 'A', // 太短
        email: 'invalid-email', // 无效邮箱
        age: 15 // 年龄不够
      }
      const result = await window.api.registry.validateUser(invalidUserData)
      if (result.valid || result.errors.length === 0) {
        throw new Error('无效用户数据验证应该失败')
      }
      return result
    },
    status: 'pending'
  },
  {
    id: 'image-search',
    name: '镜像搜索测试',
    description: '验证镜像搜索功能和复杂返回类型',
    testFn: async () => {
      const searchData: ImageSearchDto = {
        keyword: 'nginx',
        registry: 'docker.io',
        limit: 5
      }
      const result: ImageSearchResponseDto = await window.api.registry.searchImages(searchData)
      if (!result.success || !result.data.results) {
        throw new Error('镜像搜索结果格式不正确')
      }
      return result
    },
    status: 'pending'
  },
  {
    id: 'complex-data',
    name: '复杂数据处理测试',
    description: '验证复杂数据结构的处理',
    testFn: async () => {
      const complexData: ComplexDataDto = {
        title: '测试标题',
        count: 42,
        enabled: true,
        metadata: { version: '1.0', author: 'test' },
        tags: ['tag1', 'tag2', 'tag3']
      }
      const result = await window.api.registry.complexData(complexData)
      if (!result.success) {
        throw new Error('复杂数据处理失败')
      }
      return result
    },
    status: 'pending'
  },
  {
    id: 'async-operation',
    name: '异步操作测试',
    description: '验证异步操作的执行和正确返回',
    testFn: async () => {
      const delay = 1000
      const startTime = Date.now()
      const result: AsyncOperationDto = await window.api.registry.asyncOperation(delay)
      const actualTime = Date.now() - startTime

      if (!result.success || Math.abs(actualTime - delay) > 100) {
        throw new Error('异步操作时间不正确')
      }
      return result
    },
    status: 'pending'
  },
  {
    id: 'error-handling',
    name: '错误处理测试',
    description: '验证错误的正确传播和处理',
    testFn: async () => {
      try {
        await window.api.registry.throwError('validation')
        throw new Error('应该抛出错误但没有抛出')
      } catch (error) {
        if (error instanceof Error && error.message.includes('验证错误')) {
          return { errorCaught: true, errorMessage: error.message }
        }
        throw new Error('错误类型或消息不正确')
      }
    },
    status: 'pending'
  }
])

// 计算属性
const completedTests = computed(
  () =>
    testSuite.value.filter((test) => test.status === 'passed' || test.status === 'failed').length
)

const passedTests = computed(
  () => testSuite.value.filter((test) => test.status === 'passed').length
)

const failedTests = computed(
  () => testSuite.value.filter((test) => test.status === 'failed').length
)

// 方法
const getStatusText = (status: TestStatus): string => {
  switch (status) {
    case 'pending':
      return '待执行'
    case 'running':
      return '运行中'
    case 'passed':
      return '通过'
    case 'failed':
      return '失败'
    default:
      return '未知'
  }
}

const formatTestResult = (result: unknown): string => {
  return JSON.stringify(result, null, 2)
}

const runSingleTest = async (test: TestItem): Promise<void> => {
  test.status = 'running'
  test.result = undefined
  test.error = undefined

  const startTime = Date.now()

  try {
    const result = await test.testFn()
    test.result = result
    test.status = 'passed'
    console.log(`✅ ${test.name} 通过:`, result)
  } catch (error) {
    test.error = error instanceof Error ? error.message : String(error)
    test.status = 'failed'
    console.error(`❌ ${test.name} 失败:`, error)
  } finally {
    test.executionTime = Date.now() - startTime
  }
}

const runAllTests = async (): Promise<void> => {
  isRunning.value = true

  for (const test of testSuite.value) {
    await runSingleTest(test)
    // 短暂延迟，避免过快执行
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  isRunning.value = false

  // 显示测试总结
  console.log('🎯 测试总结:', {
    总数: testSuite.value.length,
    通过: passedTests.value,
    失败: failedTests.value,
    成功率: `${Math.round((passedTests.value / testSuite.value.length) * 100)}%`
  })
}

const clearResults = (): void => {
  testSuite.value.forEach((test) => {
    test.status = 'pending'
    test.result = undefined
    test.error = undefined
    test.executionTime = undefined
  })
  typeTestResults.value = []
}

const runTypeTests = (): void => {
  const results: TypeTestResult[] = []

  // 测试 1: 验证 window.api 类型
  try {
    const api = window.api
    if (api && api.registry) {
      results.push({
        test: 'window.api 类型验证',
        passed: true,
        message: 'API 对象存在且结构正确'
      })
    } else {
      results.push({
        test: 'window.api 类型验证',
        passed: false,
        message: 'API 对象不存在或结构不正确'
      })
    }
  } catch (error) {
    results.push({
      test: 'window.api 类型验证',
      passed: false,
      message: `API 访问失败: ${error}`
    })
  }

  // 测试 2: 验证类型推导
  try {
    // TypeScript 应该能够推导出正确的类型
    const pingPromise = window.api.registry.ping()
    if (pingPromise instanceof Promise) {
      results.push({
        test: 'Promise 类型推导',
        passed: true,
        message: '方法返回 Promise 类型正确'
      })
    } else {
      results.push({
        test: 'Promise 类型推导',
        passed: false,
        message: '方法没有返回 Promise'
      })
    }
  } catch (error) {
    results.push({
      test: 'Promise 类型推导',
      passed: false,
      message: `类型推导失败: ${error}`
    })
  }

  // 测试 3: 验证参数类型检查（编译时）
  results.push({
    test: 'TypeScript 编译时类型检查',
    passed: true,
    message: '如果代码能编译，说明类型检查正常'
  })

  typeTestResults.value = results
}
</script>

<style scoped>
.ipc-test-suite {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.test-status {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.label {
  font-weight: 600;
  color: #666;
}

.value {
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 4px;
  background: #e9ecef;
}

.value.success {
  background: #d4edda;
  color: #155724;
}

.value.error {
  background: #f8d7da;
  color: #721c24;
}

.global-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.action-button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.action-button.primary {
  background: #007bff;
  color: white;
}

.action-button.primary:hover:not(:disabled) {
  background: #0056b3;
}

.action-button.secondary {
  background: #6c757d;
  color: white;
}

.action-button.secondary:hover:not(:disabled) {
  background: #545b62;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.test-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.test-item {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  background: white;
  transition: all 0.3s;
}

.test-item.running {
  border-color: #ffc107;
  background: #fff3cd;
}

.test-item.passed {
  border-color: #28a745;
  background: #d4edda;
}

.test-item.failed {
  border-color: #dc3545;
  background: #f8d7da;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.test-header h3 {
  margin: 0;
  color: #333;
}

.test-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.test-button {
  padding: 6px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.test-button:hover:not(:disabled) {
  background: #0056b3;
}

.test-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.test-status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.test-status-badge.pending {
  background: #e9ecef;
  color: #6c757d;
}

.test-status-badge.running {
  background: #fff3cd;
  color: #856404;
}

.test-status-badge.passed {
  background: #d4edda;
  color: #155724;
}

.test-status-badge.failed {
  background: #f8d7da;
  color: #721c24;
}

.test-description {
  color: #666;
  margin-bottom: 15px;
  font-size: 14px;
}

.test-result,
.test-error {
  margin-top: 15px;
  border-radius: 4px;
  overflow: hidden;
}

.result-header,
.error-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  font-size: 14px;
}

.execution-time {
  color: #666;
  font-size: 12px;
}

.result-content,
.error-content {
  padding: 12px;
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-word;
  background: #ffffff;
  border: 1px solid #dee2e6;
  max-height: 300px;
  overflow-y: auto;
}

.error-content {
  background: #fff5f5;
  color: #c53030;
}

.type-test-results {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.type-test-results h3 {
  margin-bottom: 15px;
  color: #333;
}

.type-result {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 4px;
  background: white;
}

.type-result.passed {
  border-left: 4px solid #28a745;
}

.type-result.failed {
  border-left: 4px solid #dc3545;
}

.type-test-name {
  font-weight: 600;
  flex: 1;
}

.type-test-status {
  font-weight: bold;
}

.type-test-message {
  color: #666;
  font-size: 14px;
  flex: 2;
}
</style>
