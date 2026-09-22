![Flaq Open Media Creator](./docs/assets/flaq-open-media-creator-banner.png)

# Flaq Open Media Creator

面向 AI 图片与视频创作的开源桌面工作台，改造自
[Flaq SaaS Template](https://github.com/flaqai/flaq-saas-template)。复用 Flaq 的创作工具与视觉设计，通过精简表单、说明弹窗、可恢复草稿和本地素材管理，让设计师更专注于创作。当前安装后的应用名称仍为
**Flaq Creator**，包名与原生应用标识保持不变。

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português (Brasil)](./README_pt.md) · [Español](./README_es.md) ·
[Deutsch](./README_de.md) · [Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) ·
[繁體中文](./README_tw.md) · [한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) ·
[العربية](./README_ar.md)

## 关于 Flaq.ai

[Flaq.ai](https://flaq.ai/zh/) 是面向创作者和开发者的 AI 模型平台，通过一个 API
Key 统一接入图片生成与编辑、视频生成和语言模型。

- **探索与比较模型** — 在[模型市场](https://flaq.ai/model-market/)查看模型能力、支持参数和当前价格。
- **接入前先体验** — 使用 Flaq.ai 的 Playground 测试支持的模型，调整提示词和生成参数。
- **构建创作工作流** — 参考 [API 文档](https://flaq.ai/docs/)，将 AI 能力接入自己的产品和工具。

Flaq Creator Desktop 将平台的图片与视频工作流带到独立桌面工作台。在应用中配置 Flaq.ai Client
Key，即可创作和管理视觉素材。平台提供的全部 API 能力并不意味着桌面应用均已支持；可用模型和使用价格以 Flaq.ai 官网为准。

## 功能与页面

7 个创作入口统一登记在 [lib/features/catalog.ts](./lib/features/catalog.ts) 中。下列路径省略了当前语言前缀。

| 创作功能         | 路由                  | 用途                             |
| ---------------- | --------------------- | -------------------------------- |
| AI Media Creator | `/ai-media-creator`   | 统一图片／视频创作工作区         |
| 文生图           | `/text-to-image`      | 根据提示词生成图片               |
| 图生图           | `/image-to-image`     | 编辑或转换参考图片               |
| 虚拟试穿         | `/virtual-try-on`     | 结合服装与模特参考图生成试穿效果 |
| 文生视频         | `/text-to-video`      | 根据提示词生成视频               |
| 图生视频         | `/image-to-video`     | 以图片作为视频生成输入           |
| 参考生视频       | `/reference-to-video` | 根据参考素材生成视频             |

输入类型、数量限制和参数以所选模型为准；实际接入能力以
[lib/constants/template-models/](./lib/constants/template-models/) 为准，不等于 Flaq.ai 平台全部模型。

桌面体验还包括：

- **提示词素材库**（`/recommended-prompts`）：按模型分类的固定内容快照，支持复制完整提示词、图片／视频预览、缩放与拖动查看。示例图片随应用提供，示例视频需要联网播放；合集中的模型名称不代表生成表单已经接入该模型。
- **素材目录**（`/media-library`，也内嵌于“设置 → 历史记录”）：聚合已上传参考素材和生成作品，按类型、来源筛选和搜索，查看预览、下载与本地归档状态。
- **创作工作台**：首次启动的 Flaq.ai 配置引导、连接测试、模型与参数选择、上下文帮助弹窗、外观和语言设置。
- **草稿与历史恢复**：输入素材字节保存在 IndexedDB，任务历史与上传素材索引保存在本机。待完成任务恢复的是状态查询，不会重新提交一次付费生成。
- **本地作品归档**：桌面端生成结果按 `YYYY/MM/DD`
  保存到可配置目录。归档恢复只重试保存已有结果；“生成成功”和“本地归档成功”是两个独立状态。
- **媒体工具**：原生保存对话框、PNG／JPEG／WebP 图片导出、按需加载的 FFmpeg WASM 裁剪。

真实生成需要联网、有效的 Flaq.ai Client Key 和足够额度。本项目不是离线模型运行器，也不是跨设备同步的云端资产管理系统。

## 快速开始

### 环境要求

- Node.js **22**，与 [.nvmrc](./.nvmrc) 一致。
- pnpm **10.5.2**，与 [package.json](./package.json) 的 `packageManager` 一致。
- 原生开发与打包需要 Rust 和目标操作系统对应的
  [Tauri 环境依赖](https://v2.tauri.app/start/prerequisites/)。仅构建静态前端不需要 Rust。
- 真实生成需要 Flaq.ai 账号和 Client Key；默认桌面图床**不要求自行申请 Cloudflare 账号**。

在本仓库根目录执行：

```bash
pnpm install --frozen-lockfile
pnpm desktop:dev
```

开发版使用独立应用标识 `ai.flaq.creator.dev`，安装版使用
`ai.flaq.creator`。两者的配置、WebView 数据和默认作品目录互相隔离。

### 连接 Flaq.ai

1. 登录 [Flaq.ai](https://flaq.ai/zh/)，获取 Client Key。
2. 按首次启动引导操作，或打开“设置 → 连接”。
3. Base URL 默认使用 `https://api.flaq.ai`；也可以填写兼容且可信的网关。
4. 填写 Client Key，测试连接并保存。
5. 保留内置图床，或主动配置自己的 R2 预设。
6. 选择工具与模型，填写提示词／参考素材后提交；在“设置 → 历史记录”管理结果，在“设置 → 通用”修改作品存储目录。

> **密钥保存方式：**勾选“记住我”后，连接信息以可读 JSON 保存到当前用户应用配置目录下的
> `auth.json`。它**不是系统钥匙串，也没有应用层加密**。Unix 下限制为当前用户访问；不勾选时，会话密钥不会写入该原生文件。共享设备不建议记住密钥；不要提交密钥、含敏感信息的日志或本地配置。

### 上传与本地数据

| 数据／流程     | 当前实现                                                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 桌面内置图床   | 使用 Client Key 向 Flaq 的 `/api/v1/files/presignedUrl` 请求短时签名链接，再直传素材；共享 R2 凭据保留在服务端，不打进安装包 |
| 桌面自定义 R2  | 可选配置账号 ID、桶、Access Key、Secret Key 与素材公网域名；本机签名，预设使用 WebView 中的 AES-GCM 存储，不是系统凭据保险库 |
| 输入草稿       | IndexedDB 保存素材字节和元数据；选中文件不会立即上传，提交生成时才上传                                                       |
| 历史与素材目录 | Web Storage 保存本机任务记录和已上传素材索引；目录记录不代表素材所有权或云端删除权限                                         |
| 生成文件       | 原生流式保存到配置目录，默认位于应用数据目录；归档失败不会把已完成生成改成失败                                               |

自定义 R2 需要可公开访问素材的域名，而不是直接使用 S3
API 端点。云端保留时间由 Flaq 服务策略或自己的桶生命周期决定，与本地归档相互独立。自定义预设的浏览器侧加密不能防御被攻陷的 WebView，或能够读取应用数据及代码的攻击者；仅使用可信的 API 网关和上传目标。

### 可选的 Web 模式

项目保留运行 Next.js 服务端的 Web 模式：

```bash
pnpm dev
# Web 生产模式
pnpm build
pnpm start
```

浏览器访问 `http://localhost:3000`。如需配置 Web 环境，使用编辑器将 [.env.example](./.env.example) 复制为
`.env.local`，按需填写：

| 环境变量                                                                      | 用途                             |
| ----------------------------------------------------------------------------- | -------------------------------- |
| `NEXT_PUBLIC_SITE_URL`、`NEXT_PUBLIC_CONTACT_US_EMAIL`                        | 公开的站点地址与联系邮箱         |
| `R2_ACCOUNT_ID`、`R2_ACCESS_KEY_ID`、`R2_SECRET_ACCESS_KEY`、`R2_BUCKET_NAME` | Web 上传签名接口使用的服务端凭据 |

Web 上传使用
`app/api/upload/presigned-url/route.ts`，并读取“图床”设置中的公网域名。桌面默认走 Flaq 签名服务，不需要本地 R2 环境变量，也没有本地 Next.js
API 服务。不要给任何密钥添加 `NEXT_PUBLIC_` 前缀，也不要将密钥放进安装包。

## 技术方案与代码结构

**Tauri 2 + Rust 承载 Next.js 静态导出的界面，安装包不内置 Node.js／Next.js 服务端。**
桌面端与 Web 端共享 React 页面、表单、模型契约、翻译与设计资源。

| 层次           | 技术与职责                                                                |
| -------------- | ------------------------------------------------------------------------- |
| 界面           | Next.js 16、React 19、TypeScript、Tailwind CSS 4、Radix UI、Framer Motion |
| 表单与状态     | React Hook Form + Zod、Zustand，部分数据读取使用 SWR                      |
| 功能／模型契约 | 7 个工具共用入口注册表；统一输入、限制和默认参数                          |
| 服务层         | Flaq 请求适配、上传策略、集中轮询、生成与归档生命周期                     |
| 平台适配       | 原生／Web HTTP、媒体导出与保存、系统浏览器外链；界面不直接调用原生命令    |
| 原生层         | Tauri 2／Rust：配置、权限、窗口、日志、流式下载与原子保存                 |
| 本地化         | next-intl、15 个已注册语种、阿拉伯语 RTL                                  |
| 验证           | Node／tsx 回归测试、Rust 测试、Playwright 布局测试、ESLint 与 TypeScript  |

```text
app/[locale]/       多语言工具、素材库、首页与政策页面
app/api/            仅 Web 使用的上传签名与图片代理
components/         共用界面、桌面外壳、表单、弹窗与媒体／提示词查看器
hooks/              界面集成与复用 Hook
lib/features/       功能注册表
lib/constants/template-models/  模型能力契约
lib/desktop/        连接配置、草稿、素材目录与媒体设置
lib/platform/       原生／Web 平台适配
lib/recommended-prompts*        提示词定义与固定内容快照
network/            API 客户端、上传策略、轮询、历史与生命周期
store/              共享 Zustand 状态
i18n/ + messages/   语种注册、路由与翻译文件
src-tauri/          Rust 外壳、权限与打包配置
scripts/            隔离构建、媒体准备、内容同步和发布工具
tests/              契约、存储、恢复、构建／发布与界面回归测试
public/             应用资源与内置提示词图片
docs/               架构、扩展指南、Review 记录与 README 横幅
```

桌面构建在独立临时副本中排除 Web 专用路由，成功后才替换
`out/`，不会搬移或删除源码路由。桌面 HTTP 请求、上传和下载使用原生适配层，不依赖浏览器 CORS。自定义 R2 的 AWS 签名模块、裁剪所需的本地 FFmpeg 资源按需加载；上传限制并发，共享媒体处理串行执行，任务轮询集中管理。

扩展功能时，先补功能注册表和模型契约；API 逻辑放入 `network/`，复用
`lib/platform/`，同步翻译与回归测试，避免在页面里重复实现上传、轮询或原生命令。详细文档：

- [桌面架构与存储边界](./docs/DESKTOP_ARCHITECTURE.md)
- [新增模块与本地 QA](./docs/ADDING_MODULES.md)
- [领域术语](./CONTEXT.md)
- [页面功能盘点](./docs/PRODUCT_INVENTORY.md)与 [Review 报告](./docs/REVIEW_REPORT.md)
  （阶段性记录，不代表当前版本已完成全部发布验证）

## 构建与测试

| 命令                                              | 用途                                                          |
| ------------------------------------------------- | ------------------------------------------------------------- |
| `pnpm desktop:dev`                                | 准备媒体资源，启动开发界面与原生应用                          |
| `pnpm build:desktop`                              | 生成全部已注册语种的桌面静态前端到 `out/`                     |
| `pnpm desktop:build`                              | 构建前端与当前系统的原生安装包                                |
| `pnpm check`                                      | TypeScript + Node 回归测试 + ESLint                           |
| `pnpm test:ui-layout`                             | Playwright 布局测试，需要已安装 Google Chrome，使用 3000 端口 |
| `cargo test --manifest-path src-tauri/Cargo.toml` | Rust 原生测试，需要目标平台构建依赖                           |
| `pnpm prompts:sync`                               | 维护命令：联网刷新提示词快照及素材                            |

无费用模拟生成：先运行 `pnpm build:desktop`，再运行 `node scripts/desktop-preview.mjs`。打开
`http://127.0.0.1:4173/zh/`，将 Base URL 设置为 `http://127.0.0.1:4173`，Client Key 设置为
`test-only-key`，不要勾选记住。该预览使用模拟 API，不能验证真实 Flaq 生成、R2 上传或原生行为；不要填入真实密钥。

### 打包支持范围

当前仓库中的[发布流程](./.github/workflows/desktop-build.yml)定义如下目标：

| 平台                | 产物                               |
| ------------------- | ---------------------------------- |
| macOS Apple Silicon | `.dmg` 与包含 `.app` 的 ZIP        |
| macOS Intel         | `.dmg` 与包含 `.app` 的 ZIP        |
| Windows x64         | NSIS `.exe` 安装包，不包含 MSI     |
| Linux               | 可从源码构建；尚未纳入当前发布矩阵 |

手动触发只生成候选包；匹配版本的 `desktop-v<version>` 标签触发正式发布流程。发布汇总产物包括 `SHA256SUMS` 和
`release-manifest.json`。当前流程构建未签名安装包；公开分发仍需平台签名／公证及原生启动验证。“已配置工作流”不等于“所有平台都已构建和测试通过”。

## 国际化 (i18n)

语种注册表与 README 翻译包含：
`en`、`ja`、`id`、`it`、`pt`、`es`、`de`、`ru`、`fr`、`zh`、`tw`、`ko`、`th`、`vi`、`ar`。

- 桌面路由始终包含语言前缀，包括 `/en/`；启动时优先使用已保存语言，其次系统语言，最后英语。繁体中文系统变体映射到 `tw`。
- Web 英语使用 `/`，其他语言使用前缀；阿拉伯语设置 RTL 文档方向。
- **当前限制：**部分新增设置、素材目录与提示词素材库文案直接使用中英文。 `zh`／`tw`
  共用中文文案，其他语言在这些面板中回退到英文；注册了 15 个语种不代表每条新界面文案都已翻译完成。
- 新增语种需同步 [i18n/languages.ts](./i18n/languages.ts)、`messages/`、路由与构建的语种处理、对应 README 和一致性测试。

## Flaq.ai 联盟计划

加入 Flaq.ai 联盟合作伙伴计划，向受众介绍 AI 图片与视频工作流、模型 API 和创作工具，获得推荐佣金。计划欢迎创作者、设计师、开发者、AI 教育者、模型评测者及分享实用 AI 工作流的团队参与。

- **推荐奖励**
  — 推荐用户的首笔有效付费订单可获得 20% 佣金，注册后 60 天内的后续有效付费订单可获得 10% 佣金，具体以资格与归因规则为准。
- **灵活推广** — 在教程、模型评测、创作案例、社区或 API 接入指南中分享专属推荐链接。
- **合作伙伴工作台** — 在 Flaq.ai 管理推荐链接、查看推荐活动并配置收款信息。

登录 Flaq.ai，完善联盟资料并确认协议后，即可创建专属推荐链接。本项目也提供本地化的联盟推广入口；合作伙伴申请和佣金管理在 Flaq.ai 网站完成，而非桌面应用内。

**[加入 Flaq.ai 联盟合作伙伴计划 →](https://flaq.ai/zh/affiliate-program/)**

> 佣金资格、归因、退款、结算审核及经批准的定制合作安排，均以官方计划页面的最新条款为准。

## 许可证

本项目基于 [MIT License](LICENSE) 开源。
