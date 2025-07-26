import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import App from './App.vue'
import router from './router'

// 创建 Vue 应用实例
const app = createApp(App)

// 创建 Pinia 实例
const pinia = createPinia()

// 注册 Pinia 状态管理
app.use(pinia)

// 注册 Vue Router
app.use(router)

// 挂载应用
app.mount('#app')
