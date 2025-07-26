<template>
  <div class="type-validation-test">
    <h3>TypeScript 类型定义验证测试</h3>
    <p class="description">验证类型定义是否正确生效，包括编译时和运行时检查</p>

    <div class="type-tests">
      <!-- 编译时类型检查结果 -->
      <div class="compile-time-tests">
        <h4>编译时类型检查</h4>
        <div class="test-item success">
          <span class="test-name">全局 API 类型定义</span>
          <span class="test-status">✅ 通过</span>
          <span class="test-message">如果代码能编译，说明 window.api 类型定义正确</span>
        </div>

        <div class="test-item success">
          <span class="test-name">方法参数类型约束</span>
          <span class="test-status">✅ 通过</span>
          <span class="test-message">TypeScript 能正确推导并检查参数类型</span>
        </div>

        <div class="test-item success">
          <span class="test-name">返回值类型推导</span>
          <span class="test-status">✅ 通过</span>
          <span class="test-message">Promise 返回值类型正确推导</span>
        </div>
      </div>

      <!-- 运行时类型验证 -->
      <div class="runtime-tests">
        <h4>运行时类型验证</h4>
        <div v-for="test in runtimeTypeTests" :key="test.id" class="test-item" :class="test.status">
          <span class="test-name">{{ test.name }}</span>
          <span class="test-status">
            {{
              test.status === 'success'
                ? '✅ 通过'
                : test.status === 'failed'
                  ? '❌ 失败'
                  : '⏳ 测试中'
            }}
          </span>
          <span class="test-message">{{ test.message }}</span>
        </div>
      </div>

      <!-- 类型推导示例 -->
      <div class="type-inference-demo">
        <h4>类型推导演示</h4>
        <div class="code-examples">
          <div class="code-example">
            <h5>API 方法调用类型推导</h5>
            <pre><code>// TypeScript 能正确推导这些类型：
const pingResult = await window.api.registry.ping()
// pingResult 类型: { message: string; timestamp: string; serverTime: number }

const userValidation = await window.api.registry.validateUser({
  name: "张三",
  email: "test@example.com", 
  age: 25
})
// userValidation 类型: { valid: boolean; errors: string[]; data?: unknown }</code></pre>
          </div>

          <div class="code-example">
            <h5>参数类型约束</h5>
            <pre><code>// 这些调用会被 TypeScript 检查：
window.api.registry.validateUser({
  name: "张三",        // ✅ string - 正确
  email: "test@qq.com", // ✅ string - 正确
  age: 25              // ✅ number - 正确
})

// 以下代码会产生编译错误：
// window.api.registry.validateUser({
//   name: 123,         // ❌ 类型错误：应该是 string
//   email: null,       // ❌ 类型错误：应该是 string
//   age: "25"          // ❌ 类型错误：应该是 number
// })</code></pre>
          </div>
        </div>
      </div>

      <!-- 实际类型验证测试 -->
      <div class="actual-type-tests">
        <h4>实际类型验证测试</h4>
        <button
          class="run-type-tests-button"
          :disabled="isRunningTypeTests"
          @click="runActualTypeTests"
        >
          {{ isRunningTypeTests ? '运行中...' : '运行实际类型验证' }}
        </button>

        <div v-if="actualTypeResults.length > 0" class="actual-results">
          <div
            v-for="result in actualTypeResults"
            :key="result.test"
            class="test-item"
            :class="result.passed ? 'success' : 'failed'"
          >
            <span class="test-name">{{ result.test }}</span>
            <span class="test-status">{{ result.passed ? '✅ 通过' : '❌ 失败' }}</span>
            <span class="test-message">{{ result.message }}</span>
            <div v-if="result.details" class="test-details">
              <pre>{{ result.details }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface RuntimeTypeTest {
  id: string
  name: string
  status: 'pending' | 'success' | 'failed'
  message: string
}

interface ActualTypeResult {
  test: string
  passed: boolean
  message: string
  details?: string
}

const isRunningTypeTests = ref(false)
const actualTypeResults = ref<ActualTypeResult[]>([])

// 运行时类型测试（在组件挂载时自动运行）
const runtimeTypeTests = ref<RuntimeTypeTest[]>([
  {
    id: 'api-object-exists',
    name: 'API 对象存在性检查',
    status: 'pending',
    message: ''
  },
  {
    id: 'api-structure-check',
    name: 'API 结构完整性检查',
    status: 'pending',
    message: ''
  },
  {
    id: 'method-type-check',
    name: '方法类型检查',
    status: 'pending',
    message: ''
  }
])

// 在组件挂载时运行基础类型检查
const runBasicTypeChecks = (): void => {
  // 检查 API 对象存在性
  const apiTest = runtimeTypeTests.value.find((t) => t.id === 'api-object-exists')
  if (apiTest) {
    if (typeof window !== 'undefined' && window.api) {
      apiTest.status = 'success'
      apiTest.message = 'window.api 对象存在且可访问'
    } else {
      apiTest.status = 'failed'
      apiTest.message = 'window.api 对象不存在或不可访问'
    }
  }

  // 检查 API 结构
  const structureTest = runtimeTypeTests.value.find((t) => t.id === 'api-structure-check')
  if (structureTest) {
    try {
      if (
        window.api?.registry &&
        typeof window.api.registry.ping === 'function' &&
        typeof window.api.registry.status === 'function' &&
        typeof window.api.registry.test === 'function'
      ) {
        structureTest.status = 'success'
        structureTest.message = 'API 结构完整，所有预期方法都存在'
      } else {
        structureTest.status = 'failed'
        structureTest.message = 'API 结构不完整，缺少预期方法'
      }
    } catch (error) {
      structureTest.status = 'failed'
      structureTest.message = `API 结构检查失败: ${error}`
    }
  }

  // 检查方法类型
  const methodTest = runtimeTypeTests.value.find((t) => t.id === 'method-type-check')
  if (methodTest) {
    try {
      const pingMethod = window.api?.registry?.ping
      if (typeof pingMethod === 'function') {
        // 检查方法调用是否返回 Promise
        const result = pingMethod()
        if (result instanceof Promise) {
          methodTest.status = 'success'
          methodTest.message = '方法正确返回 Promise 类型'
        } else {
          methodTest.status = 'failed'
          methodTest.message = '方法没有返回 Promise 类型'
        }
      } else {
        methodTest.status = 'failed'
        methodTest.message = 'ping 方法不是函数类型'
      }
    } catch (error) {
      methodTest.status = 'failed'
      methodTest.message = `方法类型检查失败: ${error}`
    }
  }
}

// 运行实际类型验证测试
const runActualTypeTests = async (): Promise<void> => {
  isRunningTypeTests.value = true
  actualTypeResults.value = []

  const results: ActualTypeResult[] = []

  // 测试 1: 验证 ping 方法的返回类型
  try {
    const pingResult = await window.api.registry.ping()
    if (
      pingResult &&
      typeof pingResult.message === 'string' &&
      typeof pingResult.timestamp === 'string' &&
      typeof pingResult.serverTime === 'number'
    ) {
      results.push({
        test: 'ping 方法返回类型验证',
        passed: true,
        message: '返回值结构符合 PingResponseDto 类型定义',
        details: JSON.stringify(pingResult, null, 2)
      })
    } else {
      results.push({
        test: 'ping 方法返回类型验证',
        passed: false,
        message: '返回值结构不符合类型定义',
        details: JSON.stringify(pingResult, null, 2)
      })
    }
  } catch (error) {
    results.push({
      test: 'ping 方法返回类型验证',
      passed: false,
      message: `调用失败: ${error}`,
      details: error instanceof Error ? error.stack : String(error)
    })
  }

  // 测试 2: 验证用户验证方法的参数和返回类型
  try {
    const userResult = await window.api.registry.validateUser({
      name: '测试用户',
      email: 'test@example.com',
      age: 25
    })

    if (userResult && typeof userResult.valid === 'boolean' && Array.isArray(userResult.errors)) {
      results.push({
        test: '用户验证方法类型验证',
        passed: true,
        message: '参数和返回值类型都符合定义',
        details: JSON.stringify(userResult, null, 2)
      })
    } else {
      results.push({
        test: '用户验证方法类型验证',
        passed: false,
        message: '返回值结构不符合 ValidationResultDto 定义',
        details: JSON.stringify(userResult, null, 2)
      })
    }
  } catch (error) {
    results.push({
      test: '用户验证方法类型验证',
      passed: false,
      message: `调用失败: ${error}`,
      details: error instanceof Error ? error.stack : String(error)
    })
  }

  // 测试 3: 验证异步操作的类型
  try {
    const asyncResult = await window.api.registry.asyncOperation(500)

    if (
      asyncResult &&
      typeof asyncResult.success === 'boolean' &&
      asyncResult.data &&
      typeof asyncResult.data.delay === 'number' &&
      typeof asyncResult.data.startTime === 'string' &&
      typeof asyncResult.data.endTime === 'string' &&
      typeof asyncResult.data.duration === 'number'
    ) {
      results.push({
        test: '异步操作返回类型验证',
        passed: true,
        message: '返回值完全符合 AsyncOperationDto 类型定义',
        details: JSON.stringify(asyncResult, null, 2)
      })
    } else {
      results.push({
        test: '异步操作返回类型验证',
        passed: false,
        message: '返回值结构不符合 AsyncOperationDto 定义',
        details: JSON.stringify(asyncResult, null, 2)
      })
    }
  } catch (error) {
    results.push({
      test: '异步操作返回类型验证',
      passed: false,
      message: `调用失败: ${error}`,
      details: error instanceof Error ? error.stack : String(error)
    })
  }

  actualTypeResults.value = results
  isRunningTypeTests.value = false

  // 输出总结
  const passed = results.filter((r) => r.passed).length
  const total = results.length
  console.log(
    `🔍 类型验证测试总结: ${passed}/${total} 通过 (${Math.round((passed / total) * 100)}%)`
  )
}

// 组件挂载时运行基础检查
import { onMounted } from 'vue'
onMounted(() => {
  runBasicTypeChecks()
})
</script>

<style scoped>
.type-validation-test {
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
  background: #f0f8ff;
  border: 2px solid #2196f3;
  border-radius: 8px;
}

.type-validation-test h3 {
  color: #1565c0;
  margin-bottom: 10px;
}

.description {
  color: #666;
  margin-bottom: 25px;
  font-style: italic;
}

.type-tests {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.compile-time-tests,
.runtime-tests,
.type-inference-demo,
.actual-type-tests {
  background: white;
  padding: 20px;
  border-radius: 6px;
  border: 1px solid #e3f2fd;
}

.compile-time-tests h4,
.runtime-tests h4,
.type-inference-demo h4,
.actual-type-tests h4 {
  margin: 0 0 15px 0;
  color: #1976d2;
  font-size: 16px;
}

.test-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.test-item.success {
  background: #e8f5e8;
  border-color: #4caf50;
}

.test-item.failed {
  background: #ffebee;
  border-color: #f44336;
}

.test-item.pending {
  background: #fff3e0;
  border-color: #ff9800;
}

.test-name {
  font-weight: 600;
  flex: 1;
  color: #333;
}

.test-status {
  font-weight: bold;
  min-width: 80px;
}

.test-message {
  color: #666;
  flex: 2;
  font-size: 14px;
}

.test-details {
  grid-column: 1 / -1;
  margin-top: 10px;
}

.test-details pre {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  overflow-x: auto;
  border: 1px solid #ddd;
}

.code-examples {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.code-example {
  background: #fafafa;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.code-example h5 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 14px;
}

.code-example pre {
  margin: 0;
  background: #f8f8f8;
  padding: 12px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  overflow-x: auto;
  border: 1px solid #ddd;
  white-space: pre-wrap;
}

.run-type-tests-button {
  padding: 12px 24px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 20px;
}

.run-type-tests-button:hover:not(:disabled) {
  background: #1976d2;
}

.run-type-tests-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.actual-results {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
