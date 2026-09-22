![Flaq Open Media Creator](./docs/assets/flaq-open-media-creator-banner.png)

# Flaq Open Media Creator

An open-source desktop workspace for AI image and video creation, adapted from the
[Flaq SaaS Template](https://github.com/flaqai/flaq-saas-template). Reuse Flaq's creative tools and visual design, with
focused forms, contextual help, reusable drafts, and local media management. The installed app is currently named **Flaq
Creator**; package and native identifiers are unchanged.

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português (Brasil)](./README_pt.md) · [Español](./README_es.md) ·
[Deutsch](./README_de.md) · [Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) ·
[繁體中文](./README_tw.md) · [한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) ·
[العربية](./README_ar.md)

## About Flaq.ai

[Flaq.ai](https://flaq.ai/) is an AI model platform for creators and developers, providing unified API access to image
generation and editing, video generation, and language models through a single API key.

- **Explore and compare models** — Browse the [Model Market](https://flaq.ai/model-market/) to compare capabilities,
  supported parameters, and current pricing.
- **Try before integrating** — Test supported models in Flaq.ai's Playground to refine prompts and generation settings.
- **Build creative workflows** — Use the [API documentation](https://flaq.ai/docs/) to integrate AI capabilities into
  your own products and tools.

Flaq Creator Desktop brings the platform's image and video workflows into a dedicated desktop workspace. Connect your
Flaq.ai Client Key in the app to create and manage visual assets; the platform's broader API catalog does not imply that
every capability is available in this desktop app. Available models and usage pricing are listed on Flaq.ai.

## Features

Seven creation entry points share the feature registry in [lib/features/catalog.ts](./lib/features/catalog.ts). The
paths below are relative to the current language prefix.

| Workflow           | Route                 | Purpose                                |
| ------------------ | --------------------- | -------------------------------------- |
| AI Media Creator   | `/ai-media-creator`   | Unified image/video creation workspace |
| Text to Image      | `/text-to-image`      | Generate images from prompts           |
| Image to Image     | `/image-to-image`     | Edit or transform reference images     |
| Virtual Try-On     | `/virtual-try-on`     | Combine garment and model references   |
| Text to Video      | `/text-to-video`      | Generate video from prompts            |
| Image to Video     | `/image-to-video`     | Generate video with image input        |
| Reference to Video | `/reference-to-video` | Reference-driven video generation      |

Inputs, limits, and available parameters depend on the selected model. The source of truth is
[lib/constants/template-models/](./lib/constants/template-models/), not the full Flaq.ai model catalog.

The desktop experience also includes:

- **Prompt media library** (`/recommended-prompts`): curated, versioned examples, full prompt copying, image/video
  previews, zoom and panning. Example images are bundled; example videos stream online. A collection's model label does
  not guarantee that model is integrated into the generation forms.
- **Media catalog** (`/media-library`, also embedded in Settings → History): searchable uploaded references and
  generated results, filtered by type and origin, with preview/download and local-archive status.
- **Creator workspace**: first-run Flaq.ai guidance, connection testing, model/parameter controls, contextual guide
  dialogs, appearance and language settings.
- **Persistent drafts and history**: drafts keep input media bytes in IndexedDB; task history and uploaded-reference
  indexes are device-local. Pending-task recovery resumes status queries, not a fresh paid generation.
- **Local media archiving**: completed desktop outputs are saved under `YYYY/MM/DD` in a configurable directory. Archive
  recovery retries saving existing results. Generation success and archive success are separate states.
- **Media utilities**: native save dialogs, PNG/JPEG/WebP image export, and on-demand FFmpeg WASM trimming.

AI generation requires network access, a valid Flaq.ai Client Key, and sufficient credits. This is not an offline model
runtime or an account-wide cloud asset manager.

## Getting Started

### Prerequisites

- Node.js **22**, matching [.nvmrc](./.nvmrc).
- pnpm **10.5.2**, matching `packageManager` in [package.json](./package.json).
- Rust and the target OS's [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) for native development and
  packaging. A frontend-only build does not require Rust.
- A Flaq.ai account and Client Key for real generation. The default desktop upload path does **not** require your own
  Cloudflare account.

From this repository's root:

```bash
pnpm install --frozen-lockfile
pnpm desktop:dev
```

Development uses the isolated app ID `ai.flaq.creator.dev`; the installed app uses `ai.flaq.creator`. Their
configuration, WebView data, and default media directories are separate.

### Connect Flaq.ai

1. Sign in at [Flaq.ai](https://flaq.ai/) and obtain a Client Key.
2. Follow first-run guidance or open Settings → Connection.
3. Use the default Base URL `https://api.flaq.ai`, or your compatible trusted gateway.
4. Enter the Client Key, test the connection, and save.
5. Keep the built-in upload provider, or explicitly configure your own R2 preset.
6. Choose a tool and model, enter a prompt/references, then submit. Manage outputs in Settings → History; change the
   archive folder in Settings → General.

> **Credential storage:** selecting “Remember me” saves readable JSON in `auth.json` under the current user's
> application configuration directory. This is **not** OS-keychain storage or application-level encryption. Unix
> permissions are restricted to the current user; session-only credentials are not saved to that native file. Avoid
> remembered credentials on shared devices and never commit keys, logs containing secrets, or local configuration.

### Uploads and local data

| Concern                  | Current implementation                                                                                                                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Built-in desktop uploads | The Client Key requests short-lived signed URLs from Flaq's `/api/v1/files/presignedUrl`; media is then uploaded directly. Shared R2 credentials stay on the server and are not bundled. |
| Custom desktop R2        | Optional account ID, bucket, access key, secret key, and public asset domain. Signing happens locally. Presets use AES-GCM WebView storage, not an OS credential vault.                  |
| Input drafts             | IndexedDB stores media bytes and metadata; selecting a file does not upload it. Upload occurs on submission.                                                                             |
| History and catalog      | Local Web Storage indexes task records and uploaded references. Catalog entries are not ownership or cloud-deletion permissions.                                                         |
| Generated files          | Native streaming saves to the configured media root, defaulting to the app data directory. Failed archiving does not make a completed generation fail.                                   |

Custom R2 needs a publicly reachable asset domain, not merely the S3 API endpoint. Retention is controlled by Flaq's
service policy or your bucket lifecycle; local archiving is independent of cloud hosting. Custom presets' browser-side
encryption is not protection against a compromised WebView or an attacker with access to the app profile and code. Only
use trusted API gateways and upload destinations.

### Optional web mode

The original Next.js web mode is retained and runs a server:

```bash
pnpm dev
# Production web mode
pnpm build
pnpm start
```

Use `http://localhost:3000`. If configuring the web environment, copy [.env.example](./.env.example) to `.env.local`
using your editor and fill only the values you need:

| Variables                                                                     | Use                                                      |
| ----------------------------------------------------------------------------- | -------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CONTACT_US_EMAIL`                        | Public web site URL and contact information              |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` | Server-only credentials for the web upload signing route |

Web uploads use `app/api/upload/presigned-url/route.ts` and the public domain configured in Image Hosting. The desktop
default instead uses Flaq-issued signatures: it needs neither local R2 environment values nor a local Next.js API
server. Never prefix secrets with `NEXT_PUBLIC_` or include them in installers.

## Architecture and Project Structure

**Tauri 2 + Rust hosts a statically exported Next.js UI. There is no bundled Node.js/Next.js server.** Desktop and web
share React pages, forms, model contracts, translations, and design assets.

| Layer                   | Implementation and responsibility                                                               |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| UI                      | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Radix UI, Framer Motion                       |
| Forms and state         | React Hook Form + Zod; Zustand; SWR where used                                                  |
| Feature/model contracts | One registry for seven tools; shared model inputs, limits, and defaults                         |
| Services                | Flaq request adapters, upload policy, centralized task polling and generation/archive lifecycle |
| Platform boundary       | Native/web HTTP, media export/save, external links; UI does not call native commands directly   |
| Native shell            | Tauri 2 / Rust: configuration, permissions, windows, logs, streaming and atomic media saves     |
| Localization            | next-intl, 15 registered locales, Arabic RTL                                                    |
| Verification            | Node/tsx regression tests, Rust tests, Playwright layout tests, ESLint and TypeScript           |

```text
app/[locale]/       Localized tool, library, home, and policy pages
app/api/            Web-only upload signing and image proxy
components/         Shared UI, desktop shell, forms, dialogs, media/prompt viewers
hooks/              UI integration and reusable hooks
lib/features/       Feature registry
lib/constants/template-models/  Model contracts
lib/desktop/        Connection settings, drafts, catalog, media preferences
lib/platform/       Native/web adapters
lib/recommended-prompts*        Curated prompt definitions and content snapshot
network/            API clients, upload policy, polling, history, lifecycle
store/              Shared Zustand state
i18n/ + messages/   Locale registry, routing, translation files
src-tauri/          Rust shell, capabilities, packaging configuration
scripts/            Isolated builds, media preparation, content sync, release tooling
tests/              Contracts, storage, recovery, build/release and UI regressions
public/             App assets and bundled prompt images
docs/               Architecture, module guide, review notes, README banner
```

Desktop builds work in an isolated staging directory, omit web-only routes there, and replace `out/` only on success;
the source route tree is not moved or deleted. Native HTTP handles desktop API/uploads/downloads without browser CORS
constraints. AWS signing is lazy-loaded for custom R2; local FFmpeg assets load when trimming is requested. Uploads use
bounded concurrency, shared media processing is serialized, and polling is centralized.

For new modules, extend the feature registry and model contracts, keep API logic in `network/`, reuse `lib/platform/`,
and add translations and regression tests. See:

- [Architecture and storage boundaries](./docs/DESKTOP_ARCHITECTURE.md)
- [Adding modules and local QA](./docs/ADDING_MODULES.md)
- [Domain vocabulary](./CONTEXT.md)
- [Product inventory](./docs/PRODUCT_INVENTORY.md) and [review report](./docs/REVIEW_REPORT.md) (point-in-time
  inventories, not a guarantee of current release verification)

## Build and Test

| Command                                           | Purpose                                                                         |
| ------------------------------------------------- | ------------------------------------------------------------------------------- |
| `pnpm desktop:dev`                                | Prepare media assets, start the development UI and native app                   |
| `pnpm build:desktop`                              | Static desktop frontend → `out/`, all registered locales                        |
| `pnpm desktop:build`                              | Build frontend and native packages for the current OS                           |
| `pnpm check`                                      | TypeScript + Node regression tests + ESLint                                     |
| `pnpm test:ui-layout`                             | Playwright layout tests; requires installed Google Chrome and port 3000         |
| `cargo test --manifest-path src-tauri/Cargo.toml` | Native Rust tests; requires target-platform build dependencies                  |
| `pnpm prompts:sync`                               | Maintainer command: refresh the curated prompt snapshot/assets from the network |

For local simulated generation, first run `pnpm build:desktop`, then `node scripts/desktop-preview.mjs`. Open
`http://127.0.0.1:4173/zh/`, set Base URL to `http://127.0.0.1:4173` and use `test-only-key` without remembering it.
This preview uses simulated APIs; it does not verify live Flaq generation, R2 uploads, or native behavior. Do not use
real keys for simulated testing.

### Packaging status

The checked-in [release workflow](./.github/workflows/desktop-build.yml) defines these targets:

| Target              | Artifacts                                                       |
| ------------------- | --------------------------------------------------------------- |
| macOS Apple Silicon | `.dmg` and zipped `.app`                                        |
| macOS Intel         | `.dmg` and zipped `.app`                                        |
| Windows x64         | NSIS `.exe` installer; no MSI                                   |
| Linux               | Source-build target; not included in the current release matrix |

Manual workflow runs produce candidate artifacts; matching `desktop-v<version>` tags drive release publication. Release
assembly includes `SHA256SUMS` and `release-manifest.json`. The current workflow builds unsigned packages; public
distribution still needs platform-specific signing/notarization and native smoke verification. A defined workflow is not
evidence that every platform has been built or tested successfully.

## Internationalization (i18n)

The locale registry and README translations cover: `en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`,
`ko`, `th`, `vi`, `ar`.

- Desktop routes always include the locale, including `/en/`; startup prefers the saved language, then the system
  language, then English. Traditional Chinese variants map to `tw`.
- Web routing uses `/` for English and prefixes other locales. Arabic sets RTL document direction.
- **Current limitation:** some newer settings, media-library and prompt-library text is written directly in Chinese and
  English. `zh`/`tw` share Chinese copy and other locales fall back to English in these panels. Fifteen registered
  locales does not mean every new UI string has been translated.
- Add languages through [i18n/languages.ts](./i18n/languages.ts), `messages/`, routing/build locale handling,
  corresponding README files, and parity tests.

## Flaq.ai Affiliate Program

Become a Flaq.ai affiliate partner and earn commissions by introducing AI image and video workflows, model APIs, and
creative tools to your audience. The program welcomes creators, designers, developers, AI educators, model reviewers,
and teams sharing practical AI workflows.

- **Referral rewards** — Earn 20% on a referred user's first valid paid order and 10% on subsequent valid paid orders
  within 60 days of their registration, subject to the program's eligibility and attribution rules.
- **Flexible promotion** — Share your partner referral link through tutorials, model reviews, creative showcases,
  communities, or API integration guides.
- **Partner workspace** — Manage referral links, review referral activity, and prepare payout settings on Flaq.ai.

To get started, sign in to Flaq.ai, complete your affiliate profile and agreement, then create your own referral link.
This project also includes localized affiliate promotion entry points; partner enrollment and commission management take
place on Flaq.ai, not in the desktop app.

**[Join the Flaq.ai Affiliate Program →](https://flaq.ai/affiliate-program/)**

> Commission eligibility, attribution, refunds, payout review, and any approved custom partner arrangements are governed
> by the latest terms on the official program page.

## License

This project is open-source under the [MIT License](LICENSE).
