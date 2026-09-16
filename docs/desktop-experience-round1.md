# 第一轮客户端体验优化

日期：2026-09-07。仅本地修改，没有提交、推送、上传或发布，没有提交付费生成请求。

## 已实现

- 桌面固定导航：工作台、AI 创作、图片及视频工具分组；设置、帮助固定在底部；折叠选择持久化。普通 Web 保留原导航。
- 设置中心：通用（语言）、外观、连接、关于。侧栏、macOS Settings 菜单及 `⌘,` 打开同一中心；旧连接设置事件进入连接分组。
- 浅色、深色、跟随系统；默认为跟随系统。语义颜色覆盖创作表单、导航、设置、弹窗、历史及通知；同步原生窗口主题。
- 七类创作入口各存一份本地草稿。版本化 IndexedDB 记录包含文本、参数及媒体字节；恢复 File 与预览，不保存临时对象 URL、密钥、函数或待提交标记。500ms 防抖，写入按入口串行，事务提交后才显示保存成功；错误提示、失效参数警告、清空当前草稿。
- 恢复同时同步 React Hook Form 与上传控件的本地预览状态。AI 创作与参考视频草稿互相隔离；保留用户主动转入创作的原有流程，历史草稿不会自动提交。
- macOS 使用原始 `app/icon.svg` 的 F 矢量，调整圆角底板、留白及视觉尺寸；生成 16–1024 像素 iconset、ICNS，仅 macOS 配置引用新图标。
- 应用、编辑、窗口和帮助菜单；关于与设置接入设置中心。窗口移动、缩放及退出时记录几何位置，启动及显示器拓扑变化时限制到可见区域。

## 本地存储与兼容

| 内容 | 存储位置 |
| --- | --- |
| 主题、侧栏折叠 | localStorage `flaq-desktop-preferences`，version 1 |
| 语言 | 沿用 `flaq-desktop-locale` |
| 七类草稿 | IndexedDB `flaq-creator-drafts`，`drafts` 对象仓库，record version 2 |
| 窗口位置 | macOS `~/Library/Application Support/ai.flaq.creator/window-v1.json` |
| API/R2、历史 | 沿用原有接口和存储，不迁移、不修改请求契约 |

浏览器预览、原生开发版、打包应用可能使用不同 origin，草稿不跨 origin 自动同步。恢复不会访问生成接口。引用的远程素材 URL 仍需联网才能加载；本地文件以 ArrayBuffer 和文件元数据保存，避免 WebKit 重启后无法读取 IndexedDB 外置 Blob。旧版 Blob 草稿会自动迁移；无法读取的旧素材会被移除，文本和参数继续恢复。

媒体生命周期分为三层：`blob:` 对象 URL 只在当前页面会话中用于预览，不能跨重启使用，也不会写入草稿；IndexedDB 草稿保存可重新构造 File 的独立字节，保留到用户清空当前草稿；R2 只在用户提交生成时上传。自定义 R2 的 PUT 签名有效期为 1 小时，上传后对象的保留时间由用户的 Bucket 生命周期规则决定。Flaq 图床的签名和对象保留时间由服务端决定，客户端不把签名 URL 当作草稿缓存。

新增唯一开发依赖：`fake-indexeddb@6.2.4`，用于存储回归测试。原先批准的 `pnpm.onlyBuiltDependencies` 三项保持不变。没有新增运行时依赖。

## 验证结果

- `pnpm ts-check`：通过。
- `pnpm test`：29/29 通过，覆盖偏好解析、七入口隔离、Blob/File 恢复、敏感字段排除、写入顺序、清空、配额失败及模型/参数校验；包含原有回归测试。
- `cargo test --manifest-path src-tauri/Cargo.toml --locked`：4/4 通过，包含窗口离屏/小屏场景以及原有媒体保存测试。
- `pnpm lint`：0 errors，118 warnings；仍有项目中未清理的格式、未使用变量及 Hook 依赖警告，不将其表述为零警告。
- `git diff --check`：通过。
- `pnpm desktop:build --bundles app`：成功生成本地 arm64 macOS `.app`。
- 实际 `.app`：七入口导航、七类草稿重启恢复、AI 创作/参考视频隔离、本地 PNG 重启后预览恢复、清空测试草稿、侧栏折叠重启保持、深浅主题、原生标题栏同步、`⌘,` 与 Settings 菜单均已检查。
- 窗口状态文件与重启验证：记录了 `1440 × 920`、位置 `240, 42`。显示器移除/负坐标/小屏逻辑有 Rust 测试，未进行真实外接显示器热插拔。
- Finder 图标视图中已看到新的实际应用图标；Dock 自动化读取超时，Dock 视觉效果仍需人工确认。
- 跟随系统能解析当前系统外观并同步原生窗口；未改变全局 macOS 外观来实测系统主题动态变化。监听逻辑已实现。
- 未配置测试凭证、未测试云端联通、未提交任何生成任务。用于验收的少量本地示例文字草稿保留，可用“清空草稿”清除。

## 运行

开发环境使用 Node.js 22、pnpm 10.5.2、Rust stable。开发服务保持在端口 3000，原生开发进程也已启动。

```sh
cd /Users/6677h/StudioProjects/flaq客户端/open-ai-creator-desktop
source /Users/6677h/.nvm/nvm.sh
nvm use 22
export PATH="/Users/6677h/.cargo/bin:$PATH"
pnpm desktop:dev
```

若开发进程仍在运行，不要重复启动同一端口。普通 Web 用 `pnpm dev`；本地桌面布局预览可打开 `http://localhost:3000/zh/?desktop-preview`，不调用原生窗口或文件能力。

应用包：`src-tauri/target/release/bundle/macos/Flaq Creator.app`。这是本地验收构建，不是签名公证后的发布产物。

重新生成图标（macOS）：`node scripts/prepare-macos-icon.mjs`。脚本复用 Next.js 已安装的 Sharp，并调用系统 iconutil。

## 本轮未做

个人主页、作品库、提示词库、下载管理、备份迁移；这些入口没有作为占位导航加入。未运行 Windows/Linux 实机构建、未公证或发布应用。
