# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Docker Downloader 是一个企业级跨平台桌面应用程序，专为简化 Docker 镜像的离线下载而设计。基于 **Electron + NestJS + Vue 3 + Element Plus** 的技术栈，提供专业的稳定性和用户体验。

### 核心价值主张
- **离线场景支持** - 在没有 Docker 环境或网络受限的情况下，预先下载所需镜像
- **多架构支持** - 清晰展示镜像支持的所有 CPU 架构（amd64、arm64 等）
- **私有仓库管理** - 统一管理多个私有仓库的访问凭证和下载需求
- **可视化下载管理** - 提供直观的图形界面和下载进度管理

## 实施策略

### 渐进式开发原则

本项目采用渐进式开发策略，避免一次性引入过多复杂性：

1. **最小可行架构优先**: 首先建立最基础的架构框架，确保核心通信机制正常工作
2. **功能简化实现**: 每个模块先实现最简单的版本，验证架构可行性
3. **逐步增强特性**: 在基础功能稳定后，再逐步添加高级特性和优化
4. **分阶段验证**: 每个阶段完成后进行充分测试，确保稳定性后再进入下一阶段

## 开发命令

```bash
# 安装依赖
pnpm install

# 开发模式（热重载）
pnpm dev

# 类型检查（Node.js 和 Web 组件）
pnpm typecheck
pnpm typecheck:node   # 仅主进程
pnpm typecheck:web    # 仅渲染进程

# 代码检查和格式化
pnpm lint
pnpm format

# 构建应用
pnpm build

# 预览构建结果
pnpm start

# 平台特定构建
pnpm build:win    # Windows
pnpm build:mac    # macOS  
pnpm build:linux  # Linux
pnpm build:unpack # 构建但不打包
```

## 架构设计

### 当前架构（electron-vite 基础模板）
这是一个标准的 Electron 应用程序，包含三个主要进程：

**主进程** (`src/main/`)
- 入口文件: `src/main/index.ts`
- 创建浏览器窗口并处理系统级操作
- 基础 IPC 设置，包含 ping/pong 测试处理器

**预加载脚本** (`src/preload/`)
- 入口文件: `src/preload/index.ts`
- 通过 `contextBridge` 向渲染进程暴露安全 API

**渲染进程** (`src/renderer/`)
- 入口文件: `src/renderer/src/main.ts`
- 使用 TypeScript 的 Vue 3 应用程序

### 计划架构（NestJS 企业级架构）

**NestJS 主进程架构**
将采用企业级 NestJS 架构重构主进程：
- **模块化设计** - Registry（仓库管理）、Download（下载管理）、Auth（认证）、Config（配置）、Packaging（打包）
- **依赖注入容器** - 优雅管理服务间依赖关系
- **装饰器驱动** - 使用 `@IpcHandle()`、`@IpcOn()` 等装饰器简化 IPC 定义
- **事件驱动架构** - 基于 `@nestjs/event-emitter` 处理下载进度等异步事件

**类型安全 IPC 通信**
使用 `@doubleshot/nest-electron` 实现类型安全的 IPC 通信：
- 自动类型生成，确保渲染进程和主进程的类型安全
- 装饰器一致性，`@IpcHandle()` 如同 `@Get()` 一样的开发体验

## Element Plus UI 规范

### 组件使用要求
- 优先使用 Element Plus 提供的标准组件
- 镜像列表使用带边框和斑马纹的表格样式
- 表格必须支持虚拟化（超过 100 条记录）
- 表单验证必须实时进行并提供清晰的错误提示
- 下载进度必须显示百分比、状态信息和速度

### 主题系统
- 支持浅色、深色和自动模式
- 主题切换必须实时生效无需重启
- 深色模式下的颜色对比度必须符合无障碍标准

## 日志管理（electron-log）

### 基础配置
- 使用 electron-log 作为项目唯一的日志管理解决方案
- 主进程和渲染进程使用统一的日志配置
- 支持 ERROR、WARN、INFO、DEBUG 四个标准级别

### 日志级别控制
- 开发环境默认 DEBUG 级别
- 生产环境默认 INFO 级别
- 支持运行时动态调整日志级别

### 日志文件管理
- 日志文件按日期和级别分类存储
- 单个日志文件大小不超过 10MB
- 支持自动轮转和压缩存储
- 默认保留 30 天历史日志

## 安全性规范

### 凭证存储
- **Windows**: 使用 Windows Credential Manager
- **macOS**: 使用 Keychain Services  
- **Linux**: 使用 Secret Service API (libsecret)
- 推荐使用 keytar 或 @electron/remote 的安全存储 API

### 输入验证
- 镜像名称必须符合 Docker 官方规范
- 所有用户输入必须进行验证和清理
- 防止路径遍历、命令注入和脚本注入

### 网络安全
- 所有网络通信必须使用 HTTPS
- 证书验证必须默认启用
- 支持自签名证书（可配置）
- 实现请求频率限制机制

### 数据完整性
- 所有下载文件必须进行 SHA256 校验
- 支持 Docker Content Trust (DCT) 签名验证
- 校验失败的文件自动重新下载

## 开发规范

### 语言和交流规范
- **回复语言**: 始终使用中文回复用户的问题和请求
- **代码注释**: 使用中文注释
- **文档编写**: 使用中文编写文档和说明
- **变量命名**: 使用英文（遵循编程规范），注释使用中文

### 代码质量检查
- 每完成一个任务后，必须执行 `pnpm run lint` 进行代码规范检查
- 如果发现 lint 错误，必须修复后才能标记任务为完成状态
- 确保所有代码都符合项目的 ESLint 配置规范

### 环境要求
- **Node.js**: >= 22.0.0 (使用 LTS 版本)
- **pnpm**: >= 10.0.0 (项目包管理器)  
- **Python**: >= 3.8 (用于 node-gyp 编译原生模块)
- **Git**: >= 2.0.0 (版本控制)

### 测试要求
- 必须使用 Jest 作为测试框架
- 每个服务类都必须有对应的单元测试
- 测试覆盖率必须达到 80% 以上
- 集成测试必须覆盖主要的用户使用场景

## 关键配置文件

- **`electron.vite.config.ts`**: 三个进程的 Vite 配置
- **`tsconfig.json`**: 根 TypeScript 配置
- **`tsconfig.node.json`**: 主进程 TypeScript 配置  
- **`tsconfig.web.json`**: 渲染进程 TypeScript 配置
- **`eslint.config.mjs`**: 支持 TypeScript 和 Vue 的 ESLint 配置
- **`electron-builder.yml`**: 应用程序打包配置

## 开发注意事项

- 项目使用 **pnpm** 作为包管理器
- 全面使用 **TypeScript** 并启用严格类型检查
- Vue 组件的 script 块必须使用 `lang="ts"`（ESLint 强制要求）
- 开发模式下通过 electron-vite 支持热重载
- 图标资源位于 `resources/icon.png`

## 构建产物

- **`out/`**: 构建后的应用程序输出
- **`build/`**: 构建资源和素材  
- **`node_modules/`**: 依赖包（由 pnpm 管理）