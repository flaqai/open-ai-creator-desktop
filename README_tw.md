# Flaq SaaS Template（繁體中文）

免費開源的 SaaS 範本，透過 Flaq.ai 統一 API 快速建立 AI 圖像與影片生成平台。

## 關於 Flaq.ai

[Flaq.ai](https://flaq.ai/tw/) 是面向創作者與開發者的 AI 模型平台，透過一組 API
Key 統一存取圖像生成與編輯、影片生成及語言模型。

- **探索與比較模型** — 在[模型市場](https://flaq.ai/model-market/)查看模型能力、支援參數及目前價格。
- **串接前先體驗** — 使用 Flaq.ai 的 Playground 測試支援的模型，調整提示詞與生成設定。
- **建立創作工作流程** — 參考 [API 文件](https://flaq.ai/docs/)，將 AI 功能整合至自己的產品與工具。

Flaq Creator Desktop 將平台的圖像與影片工作流程帶到獨立桌面工作區。在應用程式中設定 Flaq.ai Client
Key，即可創作與管理視覺素材。平台提供的全部 API 功能不代表桌面應用程式皆已支援；可用模型與使用價格以 Flaq.ai 官網為準。

**README：** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português](./README_pt.md) · [Español](./README_es.md) · [Deutsch](./README_de.md) ·
[Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) · [繁體中文](./README_tw.md) ·
[한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) · [العربية](./README_ar.md)

## 關於本範本

採用 Next.js 16、React 19、TypeScript 與 Tailwind
CSS 建置，內含文生圖、圖生圖、文生影片、圖生影片和虛擬試衣五套可直接使用的生成流程。

### 主要特色

- 🎨 圖像與影片生成頁面，支援模型及參數選擇
- 🔌 使用單一 Client Key 串接 Flaq.ai API
- 🧠 支援 Nano Banana Pro、Seedream、GPT Image、Grok Imagine、Veo、Wan、Kling、Seedance、Vidu 等模型
- 🌐 UI、路由與 SEO 替代連結完整支援 15 種語言
- ☁️ Cloudflare R2 上傳與生成內容儲存
- 🔒 用戶端加密儲存 API 金鑰
- 📱 響應式介面、深色模式與生成歷史

## 快速開始

```bash
git clone https://github.com/flaqai/flaq-saas-template.git
cd flaq-saas-template
pnpm install
cp .env.example .env.local
pnpm dev
```

在 `.env.local` 設定 `NEXT_PUBLIC_SITE_URL`，並視需求加入 Cloudflare R2 參數；再從應用程式設定輸入
[Flaq.ai](https://flaq.ai/tw/) Client Key。完整環境變數與安裝步驟請參閱[英文完整文件](./README.md#getting-started)。

## 國際化

程式碼與 README 支援相同的 15 個 locale：`en`、`ja`、`id`、`it`、`pt`、`es`、`de`、`ru`、`fr`、`zh`、`tw`、`ko`、`th`、`vi`、`ar`。英文使用
`/`，其他語言使用 `/{locale}/`，阿拉伯文則採用由右至左顯示。

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
