import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin, swcPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

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
        '@': resolve('src/renderer/src'),
        '@renderer': resolve('src/renderer/src'),
        '@shared': resolve('src/shared')
      }
    },
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
        imports: ['vue', 'vue-router', 'pinia'],
        dts: resolve('src/renderer/src/auto-imports.d.ts'),
        eslintrc: {
          enabled: true,
          filepath: '.eslintrc-auto-import.json'
        }
      }),
      Components({
        resolvers: [ElementPlusResolver()],
        dts: resolve('src/renderer/src/components.d.ts')
      })
    ],
    build: {
      rollupOptions: {
        output: {
          // 优化后的 chunk 分割，移除 element-plus 手动分组（自动 tree-shaking）
          manualChunks: {
            'vue-ecosystem': ['vue', 'vue-router', 'pinia']
          }
        }
      }
    }
  }
})
