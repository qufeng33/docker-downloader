import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin, swcPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), swcPlugin({})],
    resolve: {
      alias: {
        '@main': resolve('src/main'),
        '@shared': resolve('src/shared')
      }
    },
    build: {
      rollupOptions: {
        // 为 NestJS 装饰器支持配置
        external: ['reflect-metadata']
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin(), swcPlugin({})],
    resolve: {
      alias: {
        '@preload': resolve('src/preload'),
        '@shared': resolve('src/shared')
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@shared': resolve('src/shared')
      }
    },
    plugins: [vue()],
    build: {
      rollupOptions: {
        output: {
          // 为 Vue 3 和 Element Plus 优化 chunk 分割
          manualChunks: {
            'element-plus': ['element-plus'],
            'vue-ecosystem': ['vue', 'vue-router', 'pinia']
          }
        }
      }
    }
  }
})
