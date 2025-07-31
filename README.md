# Docker Downloader

> 企业级跨平台 Docker 镜像下载工具

## 1. 项目概述 (Project Overview)

Docker Downloader 是一个采用现代化架构设计的跨平台桌面应用程序，专为简化 Docker 镜像的离线下载而设计。基于 **Electron + NestJS + Vue 3 + Element Plus** 的技术栈，使用 **@doubleshot/nest-electron** 实现类型安全的 IPC 通信，提供企业级的稳定性和专业的用户体验。无论是公有仓库（如 Docker Hub）还是私有仓库，都能轻松查找、管理和下载 Docker 镜像，并将其保存为 `.tar.gz` 格式，方便在离线环境中使用 `docker load -i` 命令导入。

### 🎯 核心价值

- **离线场景支持** - 在没有 Docker 环境或网络受限的情况下，预先下载所需镜像
- **多架构支持** - 清晰展示镜像支持的所有 CPU 架构（amd64、arm64 等）
- **私有仓库管理** - 统一管理多个私有仓库的访问凭证和下载需求
- **可视化下载** - 提供直观的图形界面和下载进度管理

## 2. 核心功能 (Core Features)

### 2.1. 仓库管理 (Repository Management)

- **默认仓库：** 内置 Docker Hub (`docker.io`) 作为默认公有仓库
- **私有仓库支持：**
  - 在设置页面添加、编辑和删除私有仓库配置
  - 安全存储访问凭证（密码/访问令牌）
- **仓库切换：** 主界面下拉菜单快速切换操作仓库

### 2.2. 镜像查询与浏览 (Image Discovery)

- **智能搜索：** 输入镜像名称快速查找（支持模糊搜索）
- **标签展示：** 列表形式展示镜像的所有可用 Tags
- **架构信息：** 每个 Tag 显示支持的 CPU 架构

### 2.3. 镜像下载 (Image Download)

- **精确下载：** 选择具体的"Tag + 架构"组合进行下载
- **并发下载：** 多线程下载 layers，提升下载速度
- **标准打包：** 遵循 OCI 规范打包为 `.tar.gz` 格式
- **批量下载：** 支持同时下载多个镜像（可配置）
- **断点续传：** 大文件下载中断后可续传
- **完整性校验：** SHA256 校验确保文件完整性

### 2.4. 下载管理 (Download Management)

- **任务队列：** 统一管理所有下载任务状态
- **实时进度：** 显示下载进度、速度、剩余时间
- **任务控制：** 支持暂停、继续、取消操作
- **任务持久化：** 应用重启后恢复未完成任务
- **并发控制：** 可配置最大同时下载数
- **速度限制：** 避免占用全部网络带宽

### 2.5. 配置管理 (Configuration Management)

- **下载设置：** 并发数、批量下载、默认路径、限速配置
- **界面设置：** 主题切换（浅色/深色/跟随系统）、语言设置
- **网络设置：** 超时时间、重试次数、代理服务器配置
- **配置持久化：** 所有设置自动保存

## 3. 技术架构 (Technical Architecture)

### 3.1. 现代化技术栈

本项目采用业界领先的技术栈组合，确保代码质量、开发效率和应用性能：

| 技术栈           | 版本   | 用途               | 特点                   |
| ---------------- | ------ | ------------------ | ---------------------- |
| **Electron**     | ^37.x  | 跨平台桌面应用框架 | 成熟稳定，生态丰富     |
| **NestJS**       | ^10.x  | 主进程后端框架     | 企业级架构，依赖注入   |
| **Vue 3**        | ^3.5.x | 渲染进程前端框架   | 组合式 API，性能优异   |
| **Element Plus** | ^2.x   | UI 组件库          | 企业级设计，组件丰富   |
| **TypeScript**   | ^5.x   | 开发语言           | 类型安全，开发体验佳   |
| **Vite**         | ^7.x   | 构建工具           | 快速热更新，现代构建   |
| **pnpm**         | ^10.x  | 包管理器           | 高效依赖管理，节省空间 |
| **electron-log** | ^5.x   | 日志管理           | 跨进程日志，文件轮转   |

### 3.2. 架构设计理念

**企业级 NestJS 主进程：**

- **依赖注入容器** - 优雅管理服务间依赖关系，便于测试和维护
- **模块化设计** - Registry、Download、Auth、Packaging、Config 等独立模块
- **装饰器驱动** - 使用 `@IpcHandle()`、`@IpcOn()` 等装饰器简化 IPC 定义
- **事件驱动架构** - 基于 `@nestjs/event-emitter` 处理下载进度等异步事件

**类型安全 IPC 通信：**

- **@doubleshot/nest-electron** - 专为 NestJS + Electron 设计的 IPC 解决方案
- **自动类型生成** - 自动生成渲染进程类型定义，确保类型安全
- **装饰器一致性** - `@IpcHandle()` 如同 `@Get()` 一样的开发体验
- **零样板代码** - 无需手动编写 IPC 桥接层，专注业务逻辑

**现代化前端架构：**

- **Vue 3 组合式 API** - 更好的逻辑复用和类型推导
- **Element Plus** - 企业级 UI 组件，开箱即用
- **响应式设计** - 适配不同屏幕尺寸和分辨率
- **主题系统** - 支持浅色/深色主题切换

### 3.3. 架构优势

- **开发效率最大化：** 充分利用 NestJS 生态和装饰器特性，零学习成本
- **类型安全保障：** 全链路 TypeScript 支持，编译时错误检查
- **企业级稳定性：** 成熟的技术栈组合，久经生产环境考验
- **扩展性设计：** 模块化架构支持多窗口、Worker 进程等复杂场景
- **维护友好：** 清晰的代码组织和依赖注入，便于长期维护

## 4. 项目结构 (Project Structure)

```
docker-downloader/
├── src/
│   ├── main/                    # 主进程（NestJS）
│   │   ├── modules/            # 业务模块
│   │   │   ├── registry/       # 仓库管理模块
│   │   │   ├── download/       # 下载管理模块
│   │   │   ├── auth/           # 认证模块
│   │   │   ├── config/         # 配置管理模块
│   │   │   └── packaging/      # 镜像打包模块
│   │   ├── services/           # 核心服务
│   │   ├── controllers/        # IPC 控制器
│   │   ├── app.module.ts       # 根模块
│   │   └── main.ts             # 应用入口
│   ├── renderer/               # 渲染进程（Vue 3）
│   │   ├── src/
│   │   │   ├── components/     # Vue 组件
│   │   │   │   ├── layout/     # 布局组件
│   │   │   │   └── search/     # 搜索相关组件
│   │   │   ├── views/          # 页面视图
│   │   │   ├── composables/    # 组合式函数
│   │   │   ├── stores/         # 状态管理（Pinia）
│   │   │   ├── router/         # 路由配置
│   │   │   ├── utils/          # 工具函数
│   │   │   ├── types/          # 类型定义
│   │   │   ├── assets/         # 静态资源和样式
│   │   │   │   ├── design-tokens.css  # 设计令牌系统
│   │   │   │   └── ...         # 其他样式文件
│   │   │   ├── App.vue         # 根组件
│   │   │   └── main.ts         # 应用入口
│   │   └── index.html          # HTML 模板
│   ├── preload/                # Preload 脚本
│   │   ├── index.ts            # 主 preload 脚本
│   │   └── index.d.ts          # 类型声明
│   └── shared/                 # 共享代码
│       ├── types/              # 共享类型定义
│       ├── constants/          # 常量定义
│       └── utils/              # 共享工具函数
├── build/                      # 构建资源
├── resources/                  # 应用资源
├── out/                        # 构建输出
├── package.json                # 项目配置
├── electron.vite.config.ts     # Vite 配置
├── electron-builder.yml        # 打包配置
└── tsconfig.json               # TypeScript 配置
```

## 5. 安全性与可靠性 (Security & Reliability)

### 5.1. 数据安全

- **凭证加密：** 使用操作系统级安全存储（Keychain、Credential Manager）
- **输入验证：** 严格验证镜像名称、URL 格式，防止注入攻击
- **HTTPS 支持：** 支持证书验证和自签名证书处理

### 5.2. 错误处理

- **网络容错：** 自动重试机制，指数退避策略
- **文件校验：** SHA256 完整性验证，损坏文件自动重下
- **用户友好：** 清晰的错误提示和恢复建议

### 5.3. 日志系统

- **企业级日志：** 基于 electron-log 的跨进程日志管理
- **分级日志：** ERROR、WARN、INFO、DEBUG 四级日志
- **文件轮转：** 自动日志文件轮转和大小控制
- **跨进程支持：** 主进程和渲染进程统一日志输出
- **隐私保护：** 敏感信息不记录到日志
- **问题排查：** 提供日志查看界面和导出功能

## 6. 用户体验 (User Experience)

### 6.1. 界面设计

- **企业级 UI：** 基于 Element Plus 的专业界面设计
- **主题支持：** 浅色/深色主题，跟随系统设置
- **响应式布局：** 适配不同屏幕尺寸和分辨率

### 6.2. 操作体验

- **拖拽支持：** 文件拖拽到指定位置
- **批量操作：** 多选镜像批量下载
- **托盘最小化：** 后台下载不干扰工作

### 6.3. 性能优化

- **虚拟滚动：** Element Plus 虚拟化组件处理大量数据
- **懒加载：** 按需加载组件和数据
- **智能缓存：** 减少重复网络请求

## 7. 开发指南 (Development Guide)

### 7.1. 环境要求

| 工具        | 版本要求  | 说明                       |
| ----------- | --------- | -------------------------- |
| **Node.js** | >= 22.0.0 | JavaScript 运行时环境      |
| **pnpm**    | >= 10.0.0 | 高效的包管理器             |
| **Git**     | >= 2.0.0  | 版本控制工具               |
| **Python**  | >= 3.8    | 用于 node-gyp 编译原生模块 |

### 7.2. 开发命令

```bash
# 安装依赖
pnpm install

# 开发模式（热重载）
pnpm dev

# 类型检查
pnpm typecheck

# 代码格式化
pnpm format

# 代码检查
pnpm lint

# 构建应用
pnpm build

# 预览构建结果
pnpm start

# 打包应用（各平台）
pnpm build:win    # Windows
pnpm build:mac    # macOS
pnpm build:linux  # Linux
```

### 7.3. 核心实现要点

#### 7.3.1. NestJS 主进程架构

```typescript
// src/main/app.module.ts
import { Module } from '@nestjs/common'
import { ElectronModule } from '@doubleshot/nest-electron'
import { RegistryModule } from './modules/registry/registry.module'
import { DownloadModule } from './modules/download/download.module'

@Module({
  imports: [
    ElectronModule.registerAsync({
      useFactory: async () => {
        const win = new BrowserWindow({
          width: 1200,
          height: 800,
          webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false
          }
        })

        if (is.dev) {
          win.loadURL(process.env['ELECTRON_RENDERER_URL'])
        } else {
          win.loadFile(join(__dirname, '../renderer/index.html'))
        }

        return win
      }
    }),
    RegistryModule,
    DownloadModule
  ]
})
export class AppModule {}
```

#### 7.3.2. IPC 控制器示例

```typescript
// src/main/controllers/registry.controller.ts
import { Controller } from '@nestjs/common'
import { IpcHandle, IpcOn } from '@doubleshot/nest-electron'
import { Payload } from '@nestjs/microservices'

@Controller('registry')
export class RegistryController {
  @IpcHandle('search-images')
  async searchImages(@Payload() query: string): Promise<ImageInfo[]> {
    // 搜索镜像逻辑
    return await this.registryService.searchImages(query)
  }

  @IpcHandle('get-image-tags')
  async getImageTags(@Payload() imageName: string): Promise<TagInfo[]> {
    // 获取镜像标签逻辑
    return await this.registryService.getImageTags(imageName)
  }

  @IpcOn('download-image')
  async downloadImage(@Payload() downloadRequest: DownloadRequest): Promise<void> {
    // 下载镜像逻辑
    await this.downloadService.startDownload(downloadRequest)
  }
}
```

#### 7.3.3. 渲染进程 API 调用

```typescript
// src/renderer/src/services/api.ts
export const registryApi = {
  searchImages: (query: string): Promise<ImageInfo[]> =>
    window.electron.ipcRenderer.invoke('registry/search-images', query),

  getImageTags: (imageName: string): Promise<TagInfo[]> =>
    window.electron.ipcRenderer.invoke('registry/get-image-tags', imageName),

  downloadImage: (request: DownloadRequest): void =>
    window.electron.ipcRenderer.send('registry/download-image', request)
}
```

## 8. 贡献指南 (Contributing)

我们欢迎社区贡献！请遵循以下步骤：

1. Fork 项目仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码规范

- 使用 TypeScript 开发
- 遵循 ESLint 配置
- 编写单元测试
- 中文注释

## 9. 许可证 (License)

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 10. 联系方式 (Contact)

- **作者邮箱：** qufeng33@hotmail.com
- **问题反馈：** 欢迎通过邮件反馈问题和建议

---

**开发语言：** TypeScript | **交流语言：** 中文 | **代码注释：** 中文
