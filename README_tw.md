![Flaq Open Media Creator](./docs/assets/flaq-open-media-creator-banner.png)

# Flaq Open Media Creator（繁體中文）

改造自 Flaq SaaS Template 的開源 AI 圖片與影片桌面創作工作台。安裝後的應用程式名稱仍為 Flaq Creator。

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português (Brasil)](./README_pt.md) · [Español](./README_es.md) ·
[Deutsch](./README_de.md) · [Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) ·
[繁體中文](./README_tw.md) · [한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) ·
[العربية](./README_ar.md)

## 關於 Flaq AI

[Flaq AI](https://flaq.ai/tw/)
是面向創作者、開發者與企業的 AI 平台，匯聚最主流的 AI 模型，涵蓋圖片生成與編輯、影片生成及語言模型等能力。

- **高並發、高穩定性的 API 服務** — 透過統一的 AI 生成 API，將模型能力整合至產品與正式工作流程。
- **支援直接線上使用** — 無需撰寫程式碼或安裝桌面應用程式，即可在
  [Flaq AI 官網](https://flaq.ai/tw/)透過瀏覽器體驗模型與 AI 創作工具。
- **探索模型與快速串接** — 在[模型市場](https://flaq.ai/tw/model-market/)比較模型能力，透過
  [API 文件](https://flaq.ai/tw/docs/)完成整合。

商務聯繫: [contact@flaq.ai](mailto:contact@flaq.ai)

## 目前實作

Tauri 2／Rust 承載 Next.js 16、React
19 靜態介面；桌面版不內建 Node.js／Next.js 伺服器。表單、模型定義與視覺設計和 Web 版共用。

7 個創作入口：統一 AI Media
Creator、文生圖、圖生圖、虛擬試穿、文生影片、圖生影片與參考生影片。另有提示詞素材庫、可搜尋素材目錄、設定中的歷史紀錄、IndexedDB 草稿及按日期本機歸檔。示例圖片隨應用程式提供，影片需連線播放。生成成功與本機歸檔成功是兩個獨立狀態。

## 快速開始

在本儲存庫根目錄執行。需要 Node.js 22、pnpm 10.5.2、Rust 與目標系統的 Tauri 依賴。在「設定 → 連線」填入 Flaq AI Client
Key、測試並儲存。預設 Base URL 為 `https://api.flaq.ai`。真實生成需要網路與 API 額度。

```bash
pnpm install --frozen-lockfile
pnpm desktop:dev
```

- `pnpm build:desktop` → `out/`
- `pnpm desktop:build` → Tauri
- `pnpm check` → TypeScript + tests + ESLint
- Web: `pnpm dev`; `pnpm build` + `pnpm start`

[Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) ·
[README: setup / architecture / tests](./README.md#getting-started) ·
[模块扩展 / Adding modules](./docs/ADDING_MODULES.md)

## 上傳與憑據

預設上傳向 Flaq 的 `/api/v1/files/presignedUrl`
取得短期簽名網址，共享 R2 憑據保留在伺服器，不需要自行申請 Cloudflare 帳號。自訂 R2 為選用功能，在本機簽名；預設組態使用 AES-GCM
WebView 儲存，不是系統憑據保管庫。勾選「記住我」後，Client Key 以明文儲存在應用程式設定目錄的 `auth.json`。

## 支援範圍與多語言

目前發佈組態包含 macOS Apple Silicon／Intel（DMG、ZIP）與 Windows x64（NSIS
EXE）。Linux 可由原始碼建置，尚未納入發佈矩陣。目前套件未簽名。已註冊 15 個語種，但部分新設定、素材目錄及提示詞面板只有中英文；`zh`／`tw`
共用中文，其餘回退到英文。桌面路由一律含語言前綴（包括 `/en/`），Web 英語使用 `/`、其他語言有前綴，阿拉伯語使用 RTL。

`en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`, `ko`, `th`, `vi`, `ar`

## Flaq AI 聯盟行銷計畫

加入 Flaq
AI 聯盟合作夥伴計畫，向受眾介紹 AI 圖像與影片工作流程、模型 API 及創作工具，獲得推薦傭金。歡迎創作者、設計師、開發者、AI 教育者、模型評測者及分享實用 AI 工作流程的團隊參與。

- **推薦獎勵**
  — 推薦使用者的首筆有效付費訂單可獲得 20% 傭金，註冊後 60 天內的後續有效付費訂單可獲得 10% 傭金，實際適用資格與歸因規則以計畫條款為準。
- **彈性推廣** — 在教學、模型評測、創作案例、社群或 API 串接指南中分享專屬推薦連結。
- **合作夥伴工作區** — 在 Flaq AI 管理推薦連結、查看推薦活動並設定收款資訊。

登入 Flaq
AI，完成聯盟資料與協議確認後，即可建立專屬推薦連結。本專案也提供在地化的聯盟推廣入口；合作夥伴申請與傭金管理在 Flaq
AI 網站完成，而非桌面應用程式內。

**[加入 Flaq AI 聯盟合作夥伴計畫 →](https://flaq.ai/tw/affiliate-program/)**

> 傭金資格、歸因、退款、結算審核及經核准的客製合作安排，均以官方計畫頁面的最新條款為準。

## 文件與授權

完整設定、技術架構與部署方式請參閱 [README.md](./README.md) 或 [README_zh.md](./README_zh.md)。本專案採用
[MIT License](LICENSE)。
