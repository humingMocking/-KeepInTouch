# 婚礼请柬小程序基础架构设计

## 目标

为基于 uni-app Vue 3 的微信小程序建立可运行、可扩展的前端基础架构。当前阶段不实现请柬视觉主体，待设计稿提供后再实现具体页面。

## 范围

- 保留无 tabbar 的页面结构。
- 提供主页和相册详情页路由骨架。
- 封装微信快速登录、分享配置、音频控制、自动滚动和访客记录能力。
- 为云开发访客记录预留调用契约，但不创建云函数、数据库或环境配置。
- 增加 README、`.gitignore`、项目规则和资源目录约定。

## 页面与路由

- `pages/index/index`：请柬主页占位页。负责组合后续视觉模块，并提供相册入口、音频控制和分享生命周期。
- `pages/album/album`：相册详情占位页。接收相册数据或资源配置，当前提供可替换的空状态。
- `pages.json` 不配置 `tabBar`，全局导航保持微信小程序默认导航栏。

## 能力边界

### 微信登录

`src/composables/useWechatAuth.js` 封装 `uni.login`。调用方只接收登录结果，不在前端伪造服务端 session；云函数或服务端接入由后续实现负责。

### 分享

主页通过 `onShareAppMessage` 和 `onShareTimeline` 提供统一分享配置。分享参数集中于 `src/config/invitation.js`，方便根据设计稿调整标题、路径和图片。

### 音频与自动滚动

分别由 `useBackgroundAudio` 和 `useAutoScroll` 提供生命周期安全的控制接口。页面卸载时停止/销毁定时器与音频实例，避免重复监听和资源泄漏。

### 访客记录

`src/services/visitor.js` 定义统一 `trackVisit` 接口，字段包括 `visitorId`、`scene`、`page`、`referrer`、`visitedAt`。默认实现只写入本地存储并记录调试信息；文件中保留 `uniCloud.callFunction('trackVisit')` 的替换位置。这样不引入后端，也不阻塞页面运行，后续接云函数时调用方无需改动。

## 目录约定

```text
src/
  config/          # 可替换的请柬配置
  composables/     # 页面能力封装
  services/        # 登录、访客等外部能力适配
  utils/           # 无副作用通用工具
static/
  invitation/      # 后续请柬图片、音频和相册资源
docs/
  superpowers/specs/
.agents/rules/     # 本项目协作与代码规则
```

## 非目标

- 当前阶段不实现婚礼视觉设计、复杂动画和真实相册素材。
- 不实现云函数、数据库、管理员后台或环境切换。
- 不引入第三方 UI 框架、状态管理库或 tabbar。

## 验收标准

- 使用现有 uni-app 工具链可启动并打开主页。
- 可从主页进入相册详情页并返回。
- 登录、分享、音频、自动滚动和访客记录均有可调用的独立接口，并在缺少微信/云开发运行环境时安全降级。
- 项目规则明确资源替换、页面职责和后续设计稿接入边界。
