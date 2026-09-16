# Flaq Creator Desktop（中文）

这是开源 [Flaq SaaS Template](https://github.com/flaqai/flaq-saas-template) 的跨平台桌面改造版，基于
[Flaq.ai](https://flaq.ai)
API 面向 AI 图片与视频创作。项目保留原有 Web 体验，并新增可运行于 macOS、Windows 和 Linux 的专注型创作工作台。

**选择 README 语言：** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português (Brasil)](./README_pt.md) · [Español](./README_es.md) ·
[Deutsch](./README_de.md) · [Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) ·
[繁體中文](./README_tw.md) · [한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) ·
[العربية](./README_ar.md)

> README 的语言集合与 `i18n/languages.ts` 保持一致，每一种界面语言都有对应的项目介绍。

## 桌面应用

桌面版保留模板中的 7 类创作能力和原有视觉语言，并将较长的营销介绍收纳到上下文说明弹窗中；同时提供首次启动的 Flaq.ai 配置引导、按日期自动归档的本地作品存储和更适合设计师的任务入口。界面完整支持 15 种语言，阿拉伯语支持 RTL 布局。

- 页面与功能盘点：[`docs/PRODUCT_INVENTORY.md`](./docs/PRODUCT_INVENTORY.md)
- 桌面架构与服务边界：[`docs/DESKTOP_ARCHITECTURE.md`](./docs/DESKTOP_ARCHITECTURE.md)

```bash
# 启动桌面开发模式
pnpm desktop:dev

# 生成桌面静态前端
pnpm build:desktop

# 为当前操作系统构建原生安装包
pnpm desktop:build
```

原生构建需要安装目标系统对应的
[Tauri 环境依赖](https://v2.tauri.app/start/prerequisites/)（包括 Rust）。跨平台发布流程已配置在
`.github/workflows/desktop-build.yml`。

## 目录

- [桌面应用](#桌面应用)
- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
  - [环境要求](#环境要求)
  - [安装步骤](#安装步骤)
  - [环境变量配置](#环境变量配置)
  - [Cloudflare R2 存储配置](#cloudflare-r2-存储配置)
  - [Flaq.ai API Key 配置](#flaqai-api-key-配置)
- [使用方法](#使用方法)
- [AIGC 能力](#aigc-能力)
- [Flaq.ai 联盟计划](#flaqai-联盟计划)
- [国际化 (i18n)](#国际化-i18n)
- [SEO 与 AI 爬虫发现](#seo-与-ai-爬虫发现)
- [项目结构](#项目结构)
- [部署](#部署)
- [许可证](#许可证)

## 功能特性

- 🎨 **文生图** — 通过文本提示词生成惊艳的 AI 图片
- 🖼️ **图生图** — 将现有图片转换为创意变体，保持风格一致性
- 🎬 **文生视频** — 从简单的文本描述创建高质量视频
- 📹 **图生视频** — 将静态图片动画化为动态视频内容
- 👗 **虚拟试衣** — AI 驱动的虚拟服装试穿体验
- 🌐 **国际化** — 内置与 Flaq.ai 对齐的 15 种语言、语言路由与 SEO 多语言链接
- 🚀 **无需注册** — 无需创建应用账号即可浏览、修改和自行部署模板
- 🤝 **联盟推广** — 内置响应式 Flaq.ai 联盟推荐区块，文案与跳转均随当前语言切换
- 🔒 **安全密钥管理** — 加密的客户端存储保护您的 Flaq.ai 凭证
- ☁️ **Cloudflare R2 存储** — 内置图片托管，享受 Cloudflare 全球 CDN 加速
- 📱 **响应式设计** — 基于 Tailwind CSS 和 Radix UI 的全响应式界面
- 🌓 **深色模式** — 精美的深色主题 UI
- ⚡ **极速性能** — 基于 Next.js 16，支持 Turbopack
- 🔍 **SEO 优化** — 动态元数据、Open Graph、站点地图和结构化数据
- 🤖 **AI 爬虫友好** — 提供精简的 `llms.txt`、完整的 `llms-full.txt` 与公开内容抓取规则

## 技术栈

| 类别     | 技术                                                                      |
| -------- | ------------------------------------------------------------------------- |
| 框架     | [Next.js 16](https://nextjs.org/) (App Router)                            |
| 语言     | [TypeScript](https://www.typescriptlang.org/)                             |
| UI 库    | [React 19](https://react.dev/)                                            |
| 样式     | [Tailwind CSS v4](https://tailwindcss.com/)                               |
| 组件库   | [Radix UI](https://www.radix-ui.com/)                                     |
| 动画     | [Framer Motion](https://www.framer.com/motion/)                           |
| 表单     | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| 状态管理 | [Zustand](https://zustand.docs.pmnd.rs/)                                  |
| 数据请求 | [SWR](https://swr.vercel.app/)                                            |
| 国际化   | [next-intl](https://next-intl-docs.vercel.app/)                           |
| 图标     | [Lucide React](https://lucide.dev/)                                       |
| 图表     | [Recharts](https://recharts.org/)                                         |
| 包管理器 | [pnpm](https://pnpm.io/)                                                  |
| 代码规范 | [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)          |

## 快速开始

### 环境要求

- **Node.js** >= 18.x（根据 `.nvmrc` 推荐版本）
- **pnpm** >= 10.x（项目在 `package.json` 中已声明 `packageManager`）
- 一个 [Flaq.ai](https://flaq.ai/) 账户及有效的 API 密钥
- 一个 [Cloudflare](https://cloudflare.com) 账户（用于 R2 图片存储）

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/flaqai/flaq-saas-template.git
cd flaq-saas-template

# 2. 安装 pnpm（如未安装）
npm install -g pnpm

# 3. 安装依赖
pnpm install

# 4. 复制环境变量模板
cp .env.example .env.local
```

### 环境变量配置

编辑 `.env.local` 文件，配置以下变量：

```bash
# 站点 URL（用于元数据、站点地图和 Open Graph）
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# 页脚显示的联系邮箱
NEXT_PUBLIC_CONTACT_US_EMAIL="contact@flaq.ai"

# Cloudflare R2 存储配置（仅服务端）
# 从 Cloudflare 控制台 > R2 > 管理 R2 API 令牌 获取
R2_ACCOUNT_ID=你的_cloudflare_账户_id
R2_ACCESS_KEY_ID=你的_r2_访问密钥_id
R2_SECRET_ACCESS_KEY=你的_r2_秘密访问密钥
R2_BUCKET_NAME=你的_r2_存储桶名称
```

> **⚠️ 重要提示**：切勿将 `R2_SECRET_ACCESS_KEY` 暴露给客户端。R2 凭证仅在服务端使用。

### Cloudflare R2 存储配置

本模板使用 Cloudflare R2 存储用户上传的图片和生成的资源。请按以下步骤操作：

1. **登录** [Cloudflare 控制台](https://dash.cloudflare.com/)
2. **进入**侧边栏的 **R2** 页面
3. **创建存储桶**（如 `flaq-ai-saas`）
4. **生成 API 令牌**：
   - 点击 **管理 R2 API 令牌**
   - 创建新的 API 令牌，权限选择 **对象读取与写入**
   - 安全保存 **访问密钥 ID** 和 **秘密访问密钥**
5. **配置公共访问**：
   - 在 R2 存储桶设置中，通过自定义域名或 `r2.dev` 子域名启用 **公共访问**
   - 记录 **公共域名** URL（如 `https://your-bucket.your-account.r2.cloudflarestorage.com`）
6. **在 `.env.local` 中设置环境变量**（见上文）
7. **配置公共域名**：为 Web 部署配置公共资产域名。桌面端默认使用应用已配置的 Flaq R2；用户选择「自定义 Cloudflare
   R2」后，可单独保存自己的凭证。两种模式都是先直传 R2，再将公开 URL 发给生成接口。

### Flaq.ai API Key 配置

1. **注册/登录** [flaq.ai](https://flaq.ai)
2. **进入**您的账户控制台
3. **在 API 密钥管理** 中生成一个 **Client Key**
4. **复制**您的 Client Key
5. **打开应用**，点击顶部导航栏的 **齿轮图标**（⚙️）打开 **Open API 设置** 对话框
6. **粘贴**您的 Client Key，点击 **测试连接** 验证
7. **保存**设置

> **💡 提示**：启用「记住我」可跨会话安全持久化您的 API 密钥。密钥使用加密本地存储保存。在共享或公共设备上，请勿勾选此选项以确保安全。

> **🔑 API 额度**：生成图片和视频需要足够的 API 额度。如需充值，请访问 [flaq.ai](https://flaq.ai)。

## 使用方法

```bash
# 启动开发服务器（使用 Turbopack 加速热更新）
pnpm dev:turbo

# 或不使用 Turbopack
pnpm dev

# 生产环境构建
pnpm build

# 构建并分析打包体积
pnpm build:analyze

# 启动生产服务器
pnpm start

# 代码检查
pnpm lint

# 自动修复代码问题
pnpm lint:fix

# 代码格式化
pnpm prettier

# TypeScript 类型检查
pnpm ts-check
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000)。

## AIGC 能力

本模板内置五款全功能的 AI 生成工具，全部由 [Flaq.ai](https://flaq.ai) API 驱动：

| 能力         | 描述                                                       | 支持的模型                                                                   |
| ------------ | ---------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **文生图**   | 通过自然语言提示词生成图片                                 | Nano Banana Pro、Seedream 5.0、GPT Image 2、Qwen Image 2.0、Grok Imagine     |
| **图生图**   | 利用 AI 转换或增强现有图片，保持风格和构图                 | Nano Banana Pro Edit、Seedream 5.0 Edit、GPT Image 2 Edit、Grok Imagine Edit |
| **文生视频** | 从文本描述创建视频，支持高级运动合成                       | Veo 3.1、Wan 2.7、Kling 3.0、Seedance 2.0、Vidu Q3                           |
| **图生视频** | 将静态图片动画化为动态视频                                 | Veo 3.1、Wan 2.7、Kling 3.0、Seedance 2.0、Vidu Q3                           |
| **虚拟试衣** | AI 驱动的虚拟服装试穿 — 上传服装和模特照片即可查看试穿效果 | GPT Image 2 Edit、Nano Banana Pro Edit                                       |

每个工具包含：

- 预配置的表单，支持模型选择和参数控制
- 实时生成状态轮询
- 结果画廊，支持下载和分享
- 历史生成记录

## Flaq.ai 联盟计划

公开落地页和生成页面均包含本地化的
[Flaq.ai 联盟计划](https://flaq.ai/zh/affiliate-program?utm_source=flaq-saas-template)
推荐区块。按钮会根据当前语言打开 Flaq.ai 对应的联盟计划页面，并携带 `utm_source=flaq-saas-template` 用于来源归因。

根据 Flaq.ai 当前公布的规则，推荐用户的首笔有效付费订单可获得 20% 佣金，注册后 60 天内的后续有效付费订单可获得 10% 佣金。具体资格与结算规则以联盟计划页面发布的条款为准。

## 国际化 (i18n)

本模板默认支持
**15 种语言**：英文、日语、印度尼西亚语、意大利语、巴西葡萄牙语、西班牙语、德语、俄语、法语、简体中文、繁体中文、韩语、泰语、越南语和阿拉伯语。

- 翻译文件位于 `messages/` 目录，每种语言对应一个 JSON 文件
- 语言会根据浏览器的 `Accept-Language` 请求头自动检测
- 用户可通过页脚或语言对话框手动切换语言
- URL 结构：`/` 为英文，其他语言使用 `/{locale}/`（例如 `/ja/` 或 `/zh/`）
- 阿拉伯语页面会自动使用从右到左的文档方向

如需添加更多语言：

1. 在 `i18n/languages.ts` 中添加语言配置
2. 在 `messages/` 目录中创建新的翻译文件
3. 在布局文件中添加新语言的相关元数据

## SEO 与 AI 爬虫发现

每个公开页面都包含本地化标题和描述、绝对 canonical URL、15 种语言的 `hreflang`、Open Graph、Twitter
Card 以及 index/follow 指令。生成的 `/sitemap.xml` 会列出所有公开页面的全部语言版本，并声明对应的语言替代关系。

- `/robots.txt` 允许搜索引擎和 AI 助手抓取公开内容，同时屏蔽 API、回调和错误页面
- `/llms.txt` 以精简结构介绍产品、页面、语言、文档和政策入口
- `/llms-full.txt` 提供项目能力、安装方式、技术架构和免费使用边界等完整上下文
- JSON-LD 描述网站及 MIT 授权的开源代码仓库，不再使用无法验证的评分数据

部署前请将 `NEXT_PUBLIC_SITE_URL` 设置为生产环境域名，确保 canonical、sitemap 和 LLM 资源链接指向正确站点。

## 项目结构

```
.
├── app/                     # Next.js App Router 页面
│   ├── [locale]/           # 国际化路由（支持 15 种语言）
│   │   ├── (with-footer)/  # 带页脚的页面布局
│   │   │   ├── (home)/     # 首页
│   │   │   └── (ai-features)/ # AIGC 功能页面
│   │   └── (without-footer)/ # 全屏页面（如功能页）
│   ├── api/                # API 路由（图片代理、上传）
│   ├── robots.ts           # Robots.txt 生成
│   ├── sitemap.ts          # 动态站点地图生成
│   ├── llms.txt/           # 精简的 AI 可读站点导航
│   └── llms-full.txt/      # 完整的 AI 可读项目上下文
├── components/             # 可复用 React 组件
│   ├── ui/                 # shadcn/ui 风格组件（基于 Radix）
│   ├── dialog/             # 对话框组件（API 设置等）
│   ├── layout/             # 布局组件（页头、页脚、侧栏）
│   └── ...                 # 功能特定组件
├── hooks/                  # 自定义 React Hooks
├── i18n/                   # 国际化配置
│   ├── languages.ts        # 支持的语言定义
│   ├── request.ts          # next-intl 请求配置
│   └── routing.ts          # 语言路由配置
├── lib/                    # 工具库
│   ├── seo/                # 元数据、llms.txt 与爬虫辅助工具
│   ├── constants/          # 应用常量、模型配置、导航
│   ├── utils/              # 工具函数
│   └── env.ts              # 环境变量辅助函数
├── messages/               # 每种支持语言对应一个翻译文件
├── network/                # API 客户端和网络工具
│   ├── clientFetch.ts      # Flaq.ai API 客户端（含认证）
│   ├── image/              # 图片生成 API 调用
│   ├── video/              # 视频生成 API 调用
│   └── upload/             # R2 上传客户端
├── public/                 # 静态资源（图片、图标、字体）
├── store/                  # Zustand 状态管理
├── next.config.mjs         # Next.js 配置
├── proxy.ts                # 中间件代理（i18n + IP 转发）
└── tsconfig.json           # TypeScript 配置
```

## 部署

推荐通过 [Vercel](https://vercel.com) 一键部署：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/flaq-saas-template)

1. 将仓库推送到 GitHub
2. 在 Vercel 中导入项目
3. 在 Vercel 项目设置中添加所有环境变量（`R2_*`、`NEXT_PUBLIC_*`）
4. 部署！

> 本模板也支持任何兼容 Next.js 的平台（Netlify、Cloudflare Pages、Docker 等）。

## 许可证

本项目基于 [MIT License](LICENSE) 开源。
