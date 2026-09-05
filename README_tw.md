# Flaq SaaS Template（繁體中文）

免費開源的 SaaS 範本，透過 Flaq.ai 統一 API 快速建立 AI 圖像與影片生成平台。

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

## 關於 Flaq.ai

[Flaq.ai](https://flaq.ai/tw/)
將主流圖像與影片生成模型整合到單一 API，並提供一致的驗證方式。本範本已完成 API 連線、狀態輪詢、結果顯示和下載等基礎流程。

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

## Flaq.ai 聯盟行銷計畫

參加
[Flaq.ai 聯盟行銷計畫](https://flaq.ai/tw/affiliate-program?utm_source=flaq-saas-template)，推薦使用者的首筆有效付費訂單可獲得 20% 傭金，註冊後 60 天內的後續有效付費訂單可獲得 10% 傭金。參加資格與結算方式以計畫頁面的最新條款為準。

## 國際化

程式碼與 README 支援相同的 15 個 locale：`en`、`ja`、`id`、`it`、`pt`、`es`、`de`、`ru`、`fr`、`zh`、`tw`、`ko`、`th`、`vi`、`ar`。英文使用
`/`，其他語言使用 `/{locale}/`，阿拉伯文則採用由右至左顯示。

## 文件與授權

完整設定、技術架構與部署方式請參閱 [README.md](./README.md) 或 [README_zh.md](./README_zh.md)。本專案採用
[MIT License](LICENSE)。
