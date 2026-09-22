![Flaq Open Media Creator](./docs/assets/flaq-open-media-creator-banner.png)

# Flaq Open Media Creator（日本語）

Flaq SaaS
Template を基にした、AI 画像・動画制作のオープンソースデスクトップワークスペースです。インストール後のアプリ名は Flaq
Creator のままです。

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português (Brasil)](./README_pt.md) · [Español](./README_es.md) ·
[Deutsch](./README_de.md) · [Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) ·
[繁體中文](./README_tw.md) · [한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) ·
[العربية](./README_ar.md)

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

## 現在の実装

Tauri 2／Rust が Next.js 16・React
19 の静的 UI を表示します。デスクトップ版に Node.js／Next.js サーバーは同梱されません。フォーム・モデル定義・デザインを Web 版と共有します。

7 つの制作入口：統合 AI Media
Creator、テキストから画像、画像から画像、バーチャル試着、テキストから動画、画像から動画、参照素材から動画。提示詞素材ライブラリ、検索可能な素材一覧、設定内の履歴、IndexedDB の下書き、日付別ローカル保存も利用できます。サンプル画像は同梱、サンプル動画はオンライン再生です。生成成功とローカル保存成功は別の状態です。

## クイックスタート

このリポジトリのルートで実行してください。Node.js 22、pnpm
10.5.2、Rust と OS ごとの Tauri 依存関係が必要です。設定 → 接続で Flaq.ai Client
Key を入力し、接続を確認して保存します。既定の Base URL は
`https://api.flaq.ai`。実際の生成にはネット接続と API クレジットが必要です。

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

## アップロードと認証情報

既定のアップロードは Flaq の `/api/v1/files/presignedUrl`
で短期署名 URL を取得します。共有 R2 認証情報はサーバーに残り、自分の Cloudflare アカウントは不要です。自分の R2 は任意で設定でき、署名はローカルで実行します。プリセットの AES-GCM
WebView 保存は OS の認証情報保管庫ではありません。「記憶する」を選ぶと Client Key はアプリ設定ディレクトリの `auth.json`
に平文で保存されます。

## 対応範囲と多言語

現在のリリース構成は macOS Apple Silicon／Intel（DMG・ZIP）と Windows x64（NSIS
EXE）です。Linux はソースビルド対象で、リリース行列には含まれません。現在のパッケージは未署名です。15 ロケールを登録していますが、新しい設定・素材・提示詞パネルの一部は中国語／英語のみです。`zh`／`tw`
は中国語を共有し、他は英語にフォールバックします。デスクトップは `/en/` を含め常に言語プレフィックスを使用。Web の英語は
`/`、他はプレフィックス付き、アラビア語は RTL です。

`en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`, `ko`, `th`, `vi`, `ar`

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
