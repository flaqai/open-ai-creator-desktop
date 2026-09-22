![Flaq Open Media Creator](./docs/assets/flaq-open-media-creator-banner.png)

# Flaq Open Media Creator（繁體中文）

改造自 Flaq SaaS Template 的開源 AI 圖片與影片桌面創作工作台。安裝後的應用程式名稱仍為 Flaq Creator。

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português (Brasil)](./README_pt.md) · [Español](./README_es.md) ·
[Deutsch](./README_de.md) · [Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) ·
[繁體中文](./README_tw.md) · [한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) ·
[العربية](./README_ar.md)

## 關於 Flaq.ai

[Flaq.ai](https://flaq.ai/tw/) 是面向創作者與開發者的 AI 模型平台，透過一組 API
Key 統一存取圖像生成與編輯、影片生成及語言模型。

- **探索與比較模型** — 在[模型市場](https://flaq.ai/model-market/)查看模型能力、支援參數及目前價格。
- **串接前先體驗** — 使用 Flaq.ai 的 Playground 測試支援的模型，調整提示詞與生成設定。
- **建立創作工作流程** — 參考 [API 文件](https://flaq.ai/docs/)，將 AI 功能整合至自己的產品與工具。

Flaq Creator Desktop 將平台的圖像與影片工作流程帶到獨立桌面工作區。在應用程式中設定 Flaq.ai Client
Key，即可創作與管理視覺素材。平台提供的全部 API 功能不代表桌面應用程式皆已支援；可用模型與使用價格以 Flaq.ai 官網為準。

## 目前實作

Tauri 2／Rust 承載 Next.js 16、React
19 靜態介面；桌面版不內建 Node.js／Next.js 伺服器。表單、模型定義與視覺設計和 Web 版共用。

7 個創作入口：統一 AI Media
Creator、文生圖、圖生圖、虛擬試穿、文生影片、圖生影片與參考生影片。另有提示詞素材庫、可搜尋素材目錄、設定中的歷史紀錄、IndexedDB 草稿及按日期本機歸檔。示例圖片隨應用程式提供，影片需連線播放。生成成功與本機歸檔成功是兩個獨立狀態。

## 快速開始

在本儲存庫根目錄執行。需要 Node.js 22、pnpm 10.5.2、Rust 與目標系統的 Tauri 依賴。在「設定 → 連線」填入 Flaq.ai Client
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

## Flaq.ai 聯盟行銷計畫

加入 Flaq.ai 聯盟合作夥伴計畫，向受眾介紹 AI 圖像與影片工作流程、模型 API 及創作工具，獲得推薦傭金。歡迎創作者、設計師、開發者、AI 教育者、模型評測者及分享實用 AI 工作流程的團隊參與。

- **推薦獎勵**
  — 推薦使用者的首筆有效付費訂單可獲得 20% 傭金，註冊後 60 天內的後續有效付費訂單可獲得 10% 傭金，實際適用資格與歸因規則以計畫條款為準。
- **彈性推廣** — 在教學、模型評測、創作案例、社群或 API 串接指南中分享專屬推薦連結。
- **合作夥伴工作區** — 在 Flaq.ai 管理推薦連結、查看推薦活動並設定收款資訊。

登入 Flaq.ai，完成聯盟資料與協議確認後，即可建立專屬推薦連結。本專案也提供在地化的聯盟推廣入口；合作夥伴申請與傭金管理在 Flaq.ai 網站完成，而非桌面應用程式內。

**[加入 Flaq.ai 聯盟合作夥伴計畫 →](https://flaq.ai/tw/affiliate-program/)**

> 傭金資格、歸因、退款、結算審核及經核准的客製合作安排，均以官方計畫頁面的最新條款為準。

## 文件與授權

完整設定、技術架構與部署方式請參閱 [README.md](./README.md) 或 [README_zh.md](./README_zh.md)。本專案採用
[MIT License](LICENSE)。
