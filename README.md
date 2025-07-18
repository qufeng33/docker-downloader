# Docker Downloader
> 企业级跨平台 Docker 镜像下载工具

## 1. 项目概述 (Project Overview)

Docker Downloader 是一个采用现代化架构设计的跨平台桌面应用程序，专为简化 Docker 镜像的离线下载而设计。基于 Electron + NestJS + Vue 3 的技术栈，提供企业级的稳定性和专业的用户体验。无论是公有仓库（如 Docker Hub）还是私有仓库，都能轻松查找、管理和下载 Docker 镜像，并将其保存为 `.tar.gz` 格式，方便在离线环境中使用 `docker load -i` 命令导入。

### 🎯 核心价值

*   **离线场景支持** - 在没有 Docker 环境或网络受限的情况下，预先下载所需镜像
*   **多架构支持** - 清晰展示镜像支持的所有 CPU 架构（amd64、arm64 等）
*   **私有仓库管理** - 统一管理多个私有仓库的访问凭证和下载需求
*   **可视化下载** - 提供直观的图形界面和下载进度管理

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

### 3.1. 现代化技术栈

本项目采用业界领先的技术栈组合，确保代码质量、开发效率和应用性能：

*   **工程化方案：** [pnpm Workspace](https://pnpm.io/workspaces) - 现代化 monorepo 管理
*   **桌面框架：** [Electron.js](https://www.electronjs.org/) - 跨平台桌面应用开发
*   **后端框架：** [NestJS](https://nestjs.com/) - 企业级 Node.js 框架
*   **IPC 通信：** [@doubleshot/nest-electron](https://github.com/DoubleShot1024/nest-electron) - 类型安全的 IPC 解决方案
*   **前端框架：** [Vue.js 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/) - 现代化响应式界面
*   **UI 组件库：** [Element Plus](https://element-plus.org/) - 成熟稳定的 Vue 3 企业级组件库
*   **状态管理：** [Pinia](https://pinia.vuejs.org/) - Vue 官方推荐状态管理
*   **构建工具：** [Vite](https://vitejs.dev/) + [electron-builder](https://www.electron.build/) - 快速构建和打包

### 3.2. 架构设计理念

**Monorepo 模块化架构：**
*   **包级别隔离** - 主进程、渲染进程、共享模块完全独立
*   **依赖精确管理** - 避免不必要的依赖污染和体积膨胀
*   **类型安全全链路** - 从主进程到渲染进程的完整 TypeScript 支持
*   **增量构建优化** - 只重建变更的包，显著提升开发效率

**企业级 NestJS 主进程：**
*   **依赖注入容器** - 优雅管理服务间依赖关系
*   **模块化设计** - Registry、Download、Auth、Packaging、Config 等独立模块
*   **装饰器驱动** - 使用 `@IpcHandle()` 等装饰器简化 IPC 定义
*   **事件驱动架构** - 基于 `@nestjs/event-emitter` 处理下载进度等异步事件

**类型安全 IPC 通信：**
*   **自动类型生成** - @doubleshot/nest-electron 自动生成渲染进程类型定义
*   **装饰器一致性** - `@IpcHandle()` 如同 `@Get()` 一样的开发体验
*   **零样板代码** - 无需手动编写 IPC 桥接层

### 3.3. 架构优势

*   **开发效率最大化：** 充分利用 NestJS 生态，零学习成本
*   **类型安全保障：** 全链路 TypeScript 支持，编译时错误检查
*   **模块化维护：** 清晰的包边界和职责分离
*   **扩展性设计：** 支持多窗口、Worker 进程等复杂场景
*   **企业级稳定性：** 成熟的技术栈组合，久经考验

## 4. 项目结构 (Project Structure)

```
docker-downloader/
├── packages/
│   ├── main/                 # 主进程包 (NestJS)
│   │   ├── src/
│   │   │   ├── modules/      # 业务模块
│   │   │   │   ├── registry/     # Registry API 通信
│   │   │   │   ├── download/     # 下载管理
│   │   │   │   ├── auth/         # 认证管理
│   │   │   │   ├── packaging/    # 镜像打包
│   │   │   │   └── config/       # 配置管理
│   │   │   ├── controllers/  # IPC 控制器
│   │   │   └── app.module.ts # 应用模块
│   │   └── package.json
│   │
│   ├── renderer/             # 渲染进程包 (Vue 3)
│   │   ├── src/
│   │   │   ├── components/   # Vue 组件
│   │   │   ├── views/        # 页面组件
│   │   │   ├── store/        # Pinia 状态管理
│   │   │   └── router/       # 路由配置
│   │   └── package.json
│   │
│   ├── preload/              # 预加载脚本包
│   │   ├── src/
│   │   │   └── index.ts      # 预加载入口
│   │   └── package.json
│   │
│   ├── shared/               # 共享工具包
│   │   ├── src/
│   │   │   ├── utils/        # 工具函数
│   │   │   └── constants/    # 常量定义
│   │   └── package.json
│   │
│   ├── types/                # 类型定义包
│   │   ├── src/
│   │   │   ├── api/          # API 接口类型
│   │   │   ├── models/       # 数据模型
│   │   │   └── events/       # 事件类型
│   │   └── package.json
│   │
│   └── electron/             # Electron 配置包
│       ├── src/
│       │   └── main.ts       # Electron 主入口
│       └── package.json
│
├── test/                     # 测试文件
├── dist/                     # 构建输出
├── pnpm-workspace.yaml       # pnpm workspace 配置
└── package.json              # 根包配置
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
*   **企业级 UI：** 基于 Element Plus 的专业界面设计
*   **主题支持：** 浅色/深色主题，跟随系统设置
*   **响应式布局：** 适配不同屏幕尺寸和分辨率

### 6.2. 操作体验
*   **拖拽支持：** 文件拖拽到指定位置
*   **批量操作：** 多选镜像批量下载
*   **托盘最小化：** 后台下载不干扰工作

### 6.3. 性能优化
*   **虚拟滚动：** Element Plus 虚拟化组件处理大量数据
*   **懒加载：** 按需加载组件和数据
*   **智能缓存：** 减少重复网络请求

## 7. 开发指南 (Development Guide)

### 7.1. 环境要求
*   Node.js >= 22.0.0
*   pnpm >= 10.0.0
*   Git

### 7.2. 开发命令
```bash
# 安装所有包依赖
pnpm install

# 开发模式（并行启动所有包）
pnpm run dev

# 构建所有包
pnpm run build

# 运行测试
pnpm run test

# 代码检查
pnpm run lint

# 包级别操作
pnpm --filter @docker-downloader/main dev
pnpm --filter @docker-downloader/renderer build
```

### 7.3. 核心实现要点

**Monorepo 包管理：**
```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
```

**类型安全 IPC 通信：**
```typescript
// packages/main/src/controllers/registry.controller.ts
@Controller()
export class RegistryController {
  @IpcHandle('registry:getTags')
  async getTags(@IpcBody() imageName: string): Promise<TagInfo[]> {
    return this.registryService.getTags(imageName);
  }
}

// packages/renderer 中自动生成类型安全的调用
const tags = await window.electronAPI.registry.getTags(imageName);
```

**Element Plus 集成：**
```typescript
// packages/renderer/src/main.ts
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

app.use(ElementPlus)
```

**安全存储：**
```typescript
// packages/main/src/modules/auth/auth.service.ts
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
