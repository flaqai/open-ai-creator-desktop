# Flaq SaaS Template（日本語）

Flaq.ai の統合 API を使い、AI 画像・動画生成サービスをすばやく構築できる無料のオープンソース SaaS テンプレートです。

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

## Flaq.ai について

[Flaq.ai](https://flaq.ai/ja/)
は、主要な画像・動画生成モデルを 1 つの API と共通の認証方式で利用できる統合 AI プラットフォームです。このテンプレートには API 接続、状態ポーリング、結果表示、ダウンロードまでの基本フローが実装済みです。

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

## Flaq.ai アフィリエイトプログラム

[Flaq.ai アフィリエイトプログラム](https://flaq.ai/ja/affiliate-program?utm_source=flaq-saas-template)では、紹介ユーザーの最初の有効な有料注文で 20%、登録後 60 日以内の以降の有効な有料注文で 10% のコミッションを獲得できます。資格・支払い条件はリンク先の最新規約が適用されます。

## 国際化

コードと README は同じ 15 ロケールに対応します：`en`、`ja`、`id`、`it`、`pt`、`es`、`de`、`ru`、`fr`、`zh`、`tw`、`ko`、`th`、`vi`、`ar`。英語は
`/`、その他の言語は `/{locale}/` を使用し、アラビア語は RTL 表示になります。

## ドキュメントとライセンス

完全なセットアップ、技術構成、デプロイ方法は [README.md](./README.md) または [README_zh.md](./README_zh.md)
を参照してください。本プロジェクトは [MIT License](LICENSE) で公開されています。
