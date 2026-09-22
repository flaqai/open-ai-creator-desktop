# Flaq SaaS Template（日本語）

Flaq.ai の統合 API を使い、AI 画像・動画生成サービスをすばやく構築できる無料のオープンソース SaaS テンプレートです。

## Flaq.ai について

[Flaq.ai](https://flaq.ai/ja/)
は、クリエイターと開発者向けの AI モデルプラットフォームです。1 つの API キーで画像生成・編集、動画生成、言語モデルに統一的にアクセスできます。

- **モデルを探して比較** —
  [モデルマーケット](https://flaq.ai/model-market/)で機能、対応パラメーター、現在の料金を確認できます。
- **導入前に試す** — Flaq.ai の Playground で対応モデルを試し、プロンプトや生成設定を調整できます。
- **制作ワークフローを構築** —
  [API ドキュメント](https://flaq.ai/docs/)を参考に、自分の製品やツールへ AI 機能を組み込めます。

Flaq Creator Desktop は、画像・動画のワークフローを専用のデスクトップ環境にまとめます。アプリで Flaq.ai Client
Key を設定すると、ビジュアル素材を制作・管理できます。プラットフォームのすべての API 機能がデスクトップアプリで使えるわけではありません。利用可能なモデルと料金は Flaq.ai をご確認ください。

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português](./README_pt.md) · [Español](./README_es.md) · [Deutsch](./README_de.md) ·
[Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) · [繁體中文](./README_tw.md) ·
[한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) · [العربية](./README_ar.md)

## このテンプレートについて

Next.js 16、React 19、TypeScript、Tailwind
CSS で構築されています。テキストから画像、画像から画像、テキストから動画、画像から動画、バーチャル試着の 5 つの実用的な生成フローを備えています。

### 主な特長

- 🎨 画像・動画生成ページとモデル／パラメーター選択
- 🔌 1 つの Client Key で利用できる Flaq.ai API 連携
- 🧠 Nano Banana Pro、Seedream、GPT Image、Grok Imagine、Veo、Wan、Kling、Seedance、Vidu などに対応
- 🌐 UI、ルーティング、SEO 代替リンクまで揃った 15 言語対応
- ☁️ Cloudflare R2 へのアップロードと生成アセットの保存
- 🔒 暗号化されたクライアント側 API キー保存
- 📱 レスポンシブ UI、ダークモード、生成履歴

## クイックスタート

```bash
git clone https://github.com/flaqai/flaq-saas-template.git
cd flaq-saas-template
pnpm install
cp .env.example .env.local
pnpm dev
```

`.env.local` の `NEXT_PUBLIC_SITE_URL` を設定し、必要に応じて Cloudflare
R2 の値を追加してください。その後、画面右上の設定から [Flaq.ai](https://flaq.ai/ja/) の Client
Key を入力します。詳しい環境変数と導入手順は [英語版の完全ドキュメント](./README.md#getting-started)
を参照してください。

## 国際化

コードと README は同じ 15 ロケールに対応します：`en`、`ja`、`id`、`it`、`pt`、`es`、`de`、`ru`、`fr`、`zh`、`tw`、`ko`、`th`、`vi`、`ar`。英語は
`/`、その他の言語は `/{locale}/` を使用し、アラビア語は RTL 表示になります。

## Flaq.ai アフィリエイトプログラム

Flaq.ai のアフィリエイトパートナーとして、AI 画像・動画ワークフロー、モデル API、制作ツールを紹介し、紹介報酬を獲得できます。クリエイター、デザイナー、開発者、AI 教育者、モデルレビュアー、実用的な AI 活用を発信するチームを歓迎します。

- **紹介報酬**
  — 紹介ユーザーの最初の有効な有料注文で 20%、登録後 60 日以内の以降の有効な有料注文で 10% のコミッションを獲得できます。対象条件と紹介の帰属ルールが適用されます。
- **柔軟な紹介方法**
  — チュートリアル、モデルレビュー、制作事例、コミュニティ、API 導入ガイドで専用リンクを共有できます。
- **パートナー用ワークスペース** — Flaq.ai で紹介リンク、紹介状況、支払い設定を管理できます。

Flaq.ai にログインし、プロフィールを完成させてアフィリエイト規約に同意すると、専用の紹介リンクを作成できます。本プロジェクトには多言語の案内もありますが、参加申請とコミッション管理はデスクトップアプリではなく Flaq.ai 上で行います。

**[Flaq.ai アフィリエイトプログラムに参加 →](https://flaq.ai/ja/affiliate-program/)**

> 報酬の対象条件、紹介の帰属、返金、支払い審査、承認済みの個別提携条件には、公式ページの最新規約が適用されます。

## ドキュメントとライセンス

完全なセットアップ、技術構成、デプロイ方法は [README.md](./README.md) または [README_zh.md](./README_zh.md)
を参照してください。本プロジェクトは [MIT License](LICENSE) で公開されています。
