<template>
  <div class="error-test-suite">
    <h3>错误传播机制验证测试</h3>
    <p class="description">验证各种类型的错误能否正确从主进程传播到渲染进程</p>

    <div class="error-tests">
      <div
        v-for="test in errorTests"
        :key="test.id"
        class="error-test-item"
        :class="{
          running: test.status === 'running',
          passed: test.status === 'passed',
          failed: test.status === 'failed'
        }"
      >
        <div class="test-header">
          <h4>{{ test.name }}</h4>
          <button
            class="test-button"
            :disabled="isRunning || test.status === 'running'"
            @click="runErrorTest(test)"
          >
            {{ test.status === 'running' ? '运行中...' : '测试' }}
          </button>
        </div>

        <p class="test-description">{{ test.description }}</p>
        <p class="expected-behavior">预期行为: {{ test.expectedBehavior }}</p>

        <div v-if="test.result" class="test-result">
          <div class="result-status" :class="test.result.success ? 'success' : 'failure'">
            {{ test.result.success ? '✅ 测试通过' : '❌ 测试失败' }}
          </div>
          <div class="result-details">
            <strong>详细信息:</strong>
            <pre>{{ test.result.details }}</pre>
          </div>
          <div v-if="test.result.errorInfo" class="error-info">
            <strong>捕获的错误信息:</strong>
            <pre>{{ test.result.errorInfo }}</pre>
          </div>
        </div>
      </div>
    </div>

    <div v-if="completedErrorTests > 0" class="test-summary">
      <h4>测试总结</h4>
      <div class="summary-stats">
        <span>总数: {{ errorTests.length }}</span>
        <span>已完成: {{ completedErrorTests }}</span>
        <span>通过: {{ passedErrorTests }}</span>
        <span>失败: {{ failedErrorTests }}</span>
      </div>
    </div>

    <div class="global-actions">
      <button class="run-all-button" :disabled="isRunning" @click="runAllErrorTests">
        {{ isRunning ? '运行中...' : '运行所有错误测试' }}
      </button>
      <button class="clear-button" :disabled="isRunning" @click="clearErrorResults">
        清空结果
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

type TestStatus = 'pending' | 'running' | 'passed' | 'failed'

interface ErrorTestResult {
  success: boolean
  details: string
  errorInfo?: {
    type: string
    message: string
    stack?: string
  }
}

interface ErrorTest {
  id: string
  name: string
  description: string
  expectedBehavior: string
  testFn: () => Promise<ErrorTestResult>
  status: TestStatus
  result?: ErrorTestResult
}

const isRunning = ref(false)

const errorTests = ref<ErrorTest[]>([
  {
    id: 'validation-error',
    name: '验证错误传播',
    description: '测试主进程抛出的验证错误是否能正确传播到渲染进程',
    expectedBehavior: '应该捕获到包含"验证错误"字样的错误信息',
    testFn: async () => {
      try {
        await window.api.registry.throwError('validation')
        return {
          success: false,
          details: '错误：应该抛出验证错误但没有抛出任何错误'
        }
      } catch (error) {
        const errorInfo = {
          type: error?.constructor?.name || 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        }

        if (errorInfo.message.includes('验证错误')) {
          return {
            success: true,
            details: '成功捕获验证错误，错误信息正确传播',
            errorInfo
          }
        } else {
          return {
            success: false,
            details: '捕获到错误但错误信息不正确',
            errorInfo
          }
        }
      }
    },
    status: 'pending'
  },
  {
    id: 'business-error',
    name: '业务逻辑错误传播',
    description: '测试主进程抛出的业务逻辑错误是否能正确传播',
    expectedBehavior: '应该捕获到包含"业务逻辑错误"字样的错误信息',
    testFn: async () => {
      try {
        await window.api.registry.throwError('business')
        return {
          success: false,
          details: '错误：应该抛出业务逻辑错误但没有抛出任何错误'
        }
      } catch (error) {
        const errorInfo = {
          type: error?.constructor?.name || 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        }

        if (errorInfo.message.includes('业务逻辑错误')) {
          return {
            success: true,
            details: '成功捕获业务逻辑错误，错误信息正确传播',
            errorInfo
          }
        } else {
          return {
            success: false,
            details: '捕获到错误但错误信息不正确',
            errorInfo
          }
        }
      }
    },
    status: 'pending'
  },
  {
    id: 'timeout-error',
    name: '超时错误传播',
    description: '测试主进程抛出的超时错误是否能正确传播',
    expectedBehavior: '应该捕获到包含"超时错误"字样的错误信息',
    testFn: async () => {
      try {
        await window.api.registry.throwError('timeout')
        return {
          success: false,
          details: '错误：应该抛出超时错误但没有抛出任何错误'
        }
      } catch (error) {
        const errorInfo = {
          type: error?.constructor?.name || 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        }

        if (errorInfo.message.includes('超时错误')) {
          return {
            success: true,
            details: '成功捕获超时错误，错误信息正确传播',
            errorInfo
          }
        } else {
          return {
            success: false,
            details: '捕获到错误但错误信息不正确',
            errorInfo
          }
        }
      }
    },
    status: 'pending'
  },
  {
    id: 'generic-error',
    name: '通用错误传播',
    description: '测试主进程抛出的通用错误是否能正确传播',
    expectedBehavior: '应该捕获到包含"通用错误"字样的错误信息',
    testFn: async () => {
      try {
        await window.api.registry.throwError('unknown')
        return {
          success: false,
          details: '错误：应该抛出通用错误但没有抛出任何错误'
        }
      } catch (error) {
        const errorInfo = {
          type: error?.constructor?.name || 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        }

        if (errorInfo.message.includes('通用错误')) {
          return {
            success: true,
            details: '成功捕获通用错误，错误信息正确传播',
            errorInfo
          }
        } else {
          return {
            success: false,
            details: '捕获到错误但错误信息不正确',
            errorInfo
          }
        }
      }
    },
    status: 'pending'
  },
  {
    id: 'parameter-validation',
    name: '参数验证错误传播',
    description: '测试因参数验证失败导致的错误传播',
    expectedBehavior: '应该捕获到参数验证相关的错误信息',
    testFn: async () => {
      try {
        // 传递无效参数给异步操作
        await window.api.registry.asyncOperation(-1) // 负数应该被拒绝
        return {
          success: false,
          details: '错误：应该因为无效参数抛出错误但没有抛出'
        }
      } catch (error) {
        const errorInfo = {
          type: error?.constructor?.name || 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        }

        if (errorInfo.message.includes('延迟时间') || errorInfo.message.includes('参数')) {
          return {
            success: true,
            details: '成功捕获参数验证错误，错误信息正确传播',
            errorInfo
          }
        } else {
          return {
            success: false,
            details: '捕获到错误但错误信息不符合预期',
            errorInfo
          }
        }
      }
    },
    status: 'pending'
  }
])

const completedErrorTests = computed(
  () =>
    errorTests.value.filter((test) => test.status === 'passed' || test.status === 'failed').length
)

const passedErrorTests = computed(
  () => errorTests.value.filter((test) => test.status === 'passed').length
)

const failedErrorTests = computed(
  () => errorTests.value.filter((test) => test.status === 'failed').length
)

const runErrorTest = async (test: ErrorTest): Promise<void> => {
  test.status = 'running'
  test.result = undefined

  try {
    const result = await test.testFn()
    test.result = result
    test.status = result.success ? 'passed' : 'failed'
    console.log(`错误测试 ${test.name}:`, result.success ? '通过' : '失败', result)
  } catch (error) {
    test.result = {
      success: false,
      details: `测试执行失败: ${error instanceof Error ? error.message : String(error)}`,
      errorInfo: {
        type: error?.constructor?.name || 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }
    }
    test.status = 'failed'
    console.error(`错误测试 ${test.name} 执行失败:`, error)
  }
}

const runAllErrorTests = async (): Promise<void> => {
  isRunning.value = true

  for (const test of errorTests.value) {
    await runErrorTest(test)
    // 短暂延迟
    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  isRunning.value = false

  console.log('🔥 错误传播测试总结:', {
    总数: errorTests.value.length,
    通过: passedErrorTests.value,
    失败: failedErrorTests.value,
    成功率: `${Math.round((passedErrorTests.value / errorTests.value.length) * 100)}%`
  })
}

const clearErrorResults = (): void => {
  errorTests.value.forEach((test) => {
    test.status = 'pending'
    test.result = undefined
  })
}
</script>

<style scoped>
.error-test-suite {
  max-width: 900px;
  margin: 20px auto;
  padding: 20px;
  background: #fff8f0;
  border: 2px solid #ff9800;
  border-radius: 8px;
}

.error-test-suite h3 {
  color: #e65100;
  margin-bottom: 10px;
}

.description {
  color: #666;
  margin-bottom: 20px;
  font-style: italic;
}

.error-tests {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.error-test-item {
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  padding: 15px;
  background: white;
  transition: all 0.3s;
}

.error-test-item.running {
  border-color: #ff9800;
  background: #fff3e0;
}

.error-test-item.passed {
  border-color: #4caf50;
  background: #e8f5e8;
}

.error-test-item.failed {
  border-color: #f44336;
  background: #ffebee;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.test-header h4 {
  margin: 0;
  color: #333;
  font-size: 16px;
}

.test-button {
  padding: 6px 12px;
  background: #ff9800;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}

.test-button:hover:not(:disabled) {
  background: #f57c00;
}

.test-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.test-description,
.expected-behavior {
  margin: 5px 0;
  font-size: 14px;
  color: #666;
}

.expected-behavior {
  font-weight: 600;
  color: #5d4037;
}

.test-result {
  margin-top: 15px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #ddd;
}

.result-status {
  padding: 8px 12px;
  font-weight: bold;
  font-size: 14px;
}

.result-status.success {
  background: #c8e6c9;
  color: #2e7d32;
}

.result-status.failure {
  background: #ffcdd2;
  color: #c62828;
}

.result-details,
.error-info {
  padding: 10px 12px;
  background: #f9f9f9;
  border-top: 1px solid #ddd;
}

.result-details pre,
.error-info pre {
  margin: 5px 0 0 0;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  white-space: pre-wrap;
  word-break: break-word;
  color: #333;
  background: white;
  padding: 8px;
  border-radius: 3px;
  border: 1px solid #e0e0e0;
}

.test-summary {
  margin: 20px 0;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.test-summary h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.summary-stats {
  display: flex;
  gap: 20px;
  font-weight: 600;
}

.summary-stats span {
  padding: 4px 8px;
  background: white;
  border-radius: 4px;
  border: 1px solid #ddd;
  font-size: 14px;
}

.global-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.run-all-button {
  padding: 12px 24px;
  background: #ff5722;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
}

.run-all-button:hover:not(:disabled) {
  background: #e64a19;
}

.run-all-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.clear-button {
  padding: 12px 24px;
  background: #757575;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
}

.clear-button:hover:not(:disabled) {
  background: #616161;
}

.clear-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
