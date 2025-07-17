# Docker Downloader
> 跨平台 Docker 镜像下载工具

## 1. 项目概述 (Project Overview)

Docker Downloader 是一个跨平台的桌面应用程序，专为简化 Docker 镜像的离线下载而设计。无论是公有仓库（如 Docker Hub）还是私有仓库，都能轻松查找、管理和下载 Docker 镜像，并将其保存为 `.tar.gz` 格式，方便在离线环境中使用 `docker load -i` 命令导入。

### 🎯 核心价值

*   **离线场景支持** - 在没有 Docker 环境或网络受限的情况下，预先下载所需镜像
*   **多架构支持** - 清晰展示镜像支持的所有 CPU 架构（amd64、arm64 等）
*   **私有仓库管理** - 统一管理多个私有仓库的访问凭证和下载需求
*   **可视化下载** - 提供直观的图形界面和下载进度管理

### 🚀 快速开始

```bash
# 克隆项目
git clone https://github.com/qufeng33/docker-downloader.git
cd docker-downloader

# 安装依赖
pnpm install

# 开发模式运行
pnpm run dev

# 构建应用
pnpm run build
```

## 2. 核心功能 (Core Features)

### 2.1. 仓库管理 (Repository Management)

*   **默认仓库：** 内置 Docker Hub (`docker.io`) 作为默认公有仓库
*   **私有仓库支持：**
    *   在设置页面添加、编辑和删除私有仓库配置
    *   安全存储访问凭证（密码/访问令牌）
*   **仓库切换：** 主界面下拉菜单快速切换操作仓库

### 2.2. 镜像查询与浏览 (Image Discovery)

*   **智能搜索：** 输入镜像名称快速查找（支持模糊搜索）
*   **标签展示：** 列表形式展示镜像的所有可用 Tags
*   **架构信息：** 每个 Tag 显示支持的 CPU 架构
*   **离线缓存：** 缓存查询结果，提升使用体验

### 2.3. 镜像下载 (Image Download)

*   **精确下载：** 选择具体的"Tag + 架构"组合进行下载
*   **并发下载：** 多线程下载 layers，提升下载速度
*   **标准打包：** 遵循 OCI 规范打包为 `.tar.gz` 格式
*   **批量下载：** 支持同时下载多个镜像（可配置）
*   **断点续传：** 大文件下载中断后可续传
*   **完整性校验：** SHA256 校验确保文件完整性

### 2.4. 下载管理 (Download Management)

*   **任务队列：** 统一管理所有下载任务状态
*   **实时进度：** 显示下载进度、速度、剩余时间
*   **任务控制：** 支持暂停、继续、取消操作
*   **任务持久化：** 应用重启后恢复未完成任务
*   **并发控制：** 可配置最大同时下载数
*   **速度限制：** 避免占用全部网络带宽

### 2.5. 配置管理 (Configuration Management)

*   **下载设置：** 并发数、批量下载、默认路径、限速配置
*   **界面设置：** 主题切换（浅色/深色/跟随系统）、语言设置
*   **网络设置：** 超时时间、重试次数、代理服务器配置
*   **配置持久化：** 所有设置自动保存

## 3. 技术架构 (Technical Architecture)

### 3.1. 技术栈选择

我们采用现代化的 JavaScript 全栈方案，确保开发效率和应用性能：

*   **桌面框架：** [Electron.js](https://www.electronjs.org/) - 跨平台桌面应用开发
*   **前端框架：** [Vue.js 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/) - 现代化响应式界面
*   **UI 组件：** [Element Plus](https://element-plus.org/) - 成熟的 Vue 3 组件库
*   **状态管理：** [Pinia](https://pinia.vuejs.org/) - Vue 官方推荐状态管理
*   **构建工具：** [Vite](https://vitejs.dev/) + [electron-builder](https://www.electron.build/) - 快速构建和打包

### 3.2. 后端架构

**主进程采用 NestJS 企业级架构：**
*   **[NestJS](https://nestjs.com/)** - 提供依赖注入、模块化、装饰器支持
*   **模块化设计** - Registry、Download、Auth、Packaging、Config 等独立模块
*   **事件驱动** - 使用 `@nestjs/event-emitter` 处理下载进度等事件
*   **安全存储** - Electron `safeStorage` API 加密存储敏感信息

### 3.3. 架构优势

*   **依赖注入：** 优雅管理服务间依赖关系
*   **模块化：** 清晰的代码组织和职责分离
*   **类型安全：** 全栈 TypeScript 支持
*   **测试友好：** 完善的单元测试和集成测试支持

## 4. 项目结构 (Project Structure)

```
docker-downloader/
├── src/
│   ├── main/             # 主进程 (NestJS)
│   │   ├── modules/      # 业务模块
│   │   │   ├── registry/     # Registry API 通信
│   │   │   ├── download/     # 下载管理
│   │   │   ├── auth/         # 认证管理
│   │   │   ├── packaging/    # 镜像打包
│   │   │   └── config/       # 配置管理
│   │   ├── shared/       # 共享模块
│   │   ├── ipc/          # IPC 通信桥接
│   │   └── preload.ts    # 预加载脚本
│   │
│   └── renderer/         # 渲染进程 (Vue.js)
│       ├── components/   # Vue 组件
│       ├── views/        # 页面组件
│       ├── store/        # Pinia 状态管理
│       └── router/       # 路由配置
│
├── test/                 # 测试文件
├── dist_electron/        # 构建输出
└── package.json
```

## 5. 安全性与可靠性 (Security & Reliability)

### 5.1. 数据安全
*   **凭证加密：** 使用操作系统级安全存储（Keychain、Credential Manager）
*   **输入验证：** 严格验证镜像名称、URL 格式，防止注入攻击
*   **HTTPS 支持：** 支持证书验证和自签名证书处理

### 5.2. 错误处理
*   **网络容错：** 自动重试机制，指数退避策略
*   **文件校验：** SHA256 完整性验证，损坏文件自动重下
*   **用户友好：** 清晰的错误提示和恢复建议

### 5.3. 日志系统
*   **分级日志：** ERROR、WARN、INFO、DEBUG 四级日志
*   **隐私保护：** 敏感信息不记录到日志
*   **问题排查：** 提供日志查看界面

## 6. 用户体验 (User Experience)

### 6.1. 界面设计
*   **现代化 UI：** 简洁直观的操作界面
*   **主题支持：** 浅色/深色主题，跟随系统设置
*   **响应式：** 适配不同屏幕尺寸

### 6.2. 操作体验
*   **拖拽支持：** 文件拖拽到指定位置
*   **批量操作：** 多选镜像批量下载
*   **托盘最小化：** 后台下载不干扰工作

### 6.3. 性能优化
*   **虚拟滚动：** 大量数据列表优化
*   **懒加载：** 按需加载组件和数据
*   **智能缓存：** 减少重复网络请求

## 7. 开发指南 (Development Guide)

### 7.1. 环境要求
*   Node.js >= 16.0.0
*   pnpm >= 8.0.0
*   Git

### 7.2. 开发命令
```bash
# 安装依赖
pnpm install

# 开发模式
pnpm run dev

# 构建应用
pnpm run build

# 运行测试
pnpm run test

# 代码检查
pnpm run lint
```

### 7.3. 核心实现要点

**NestJS 集成：**
```typescript
// 主进程初始化
const nestApp = await NestFactory.createApplicationContext(AppModule);
const ipcBridge = new IpcBridge(nestApp);
```

**IPC 通信：**
```typescript
// 预加载脚本暴露 API
contextBridge.exposeInMainWorld('electronAPI', {
  getTags: (imageName: string) => ipcRenderer.invoke('registry:get-tags', imageName),
  downloadImage: (imageInfo: ImageInfo) => ipcRenderer.invoke('download:start', imageInfo),
});
```

**安全存储：**
```typescript
// 加密存储敏感信息
const encrypted = safeStorage.encryptString(password);
const decrypted = safeStorage.decryptString(encrypted);
```

## 8. 贡献指南 (Contributing)

我们欢迎社区贡献！请遵循以下步骤：

1. Fork 项目仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码规范
*   使用 TypeScript 开发
*   遵循 ESLint 配置
*   编写单元测试
*   中文注释

## 9. 许可证 (License)

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 10. 联系方式 (Contact)

*   **作者邮箱：** qufeng33@hotmail.com
*   **问题反馈：** 欢迎通过邮件反馈问题和建议

---

**开发语言：** TypeScript | **交流语言：** 中文 | **代码注释：** 中文
