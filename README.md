![Flaq Open Media Creator](./docs/assets/flaq-open-media-creator-banner.png)

# Flaq Open Media Creator

An open-source **AI image and video creation desktop app** for creators, designers, and brand teams. Bring prompt
inspiration, reference media, and an infinite canvas into one workspace to generate, preview, refine, and organize
creative work locally.

Adapted from the [Flaq SaaS Template](https://github.com/flaqai/flaq-saas-template), the app connects to Flaq AI model
services through a Tauri 2 + Rust desktop shell and a modern React interface. The installed app is named **Flaq
Creator**.

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português (Brasil)](./README_pt.md) · [Español](./README_es.md) ·
[Deutsch](./README_de.md) · [Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) ·
[繁體中文](./README_tw.md) · [한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) ·
[العربية](./README_ar.md)

## Desktop App Screenshots: Workspace, AI Creation, and Infinite Canvas

Captured from the running macOS desktop app in English. Creation panels show local demo drafts; prompt-library images are bundled examples.

### Creative workspace — tools, prompt inspiration, and media shortcuts

![Creative workspace — tools, prompt inspiration, and media shortcuts](./docs/assets/screenshots/desktop-workspace.jpg)

### AI image creation — prompts, models, and generation settings

![AI image creation — prompts, models, and generation settings](./docs/assets/screenshots/desktop-ai-creator.jpg)

### Infinite canvas — arrange creative briefs and generation nodes

![Infinite canvas — arrange creative briefs and generation nodes](./docs/assets/screenshots/desktop-canvas.jpg)

### Prompt inspiration — browse visual examples and reusable prompts

![Prompt inspiration — browse visual examples and reusable prompts](./docs/assets/screenshots/desktop-prompt-library.jpg)

## Flaq AI Model Platform and Online Creative Tools

[Flaq AI](https://flaq.ai/) is an AI platform for creators, developers, and businesses, bringing together leading
mainstream AI models for image generation and editing, video generation, and language tasks.

- **High-concurrency, highly stable APIs** — Integrate AI generation into your products and production workflows through
  a unified API.
- **Create directly online** — Use AI tools and try models in your browser on [Flaq AI](https://flaq.ai/), without
  writing code or installing the desktop app.
- **Explore and integrate** — Compare models in the [Model Market](https://flaq.ai/model-market/) and get started with
  the [API documentation](https://flaq.ai/docs/).

Business inquiries: [contact@flaq.ai](mailto:contact@flaq.ai)

## AI Desktop Features: From Creative Ideas to Images and Videos

### AI Image Generation, Video Creation, and Virtual Try-On

Eight entry points support everyday creative work. Explore ideas in the unified workspace or open a dedicated tool for
product visuals, social content, campaign concepts, and short videos.

| Creative tool      | What creators can do                                                        | Route                 |
| ------------------ | --------------------------------------------------------------------------- | --------------------- |
| AI Media Creator   | Create images and videos in one workspace, review results, and refine ideas | `/ai-media-creator`   |
| AI Infinite Canvas | Organize text, media, and generation settings in a saved local project      | `/ai-canvas`          |
| Text to Image      | Explore visual styles for covers, posters, and product scenes from prompts  | `/text-to-image`      |
| Image to Image     | Develop new styles and visual directions from reference images              | `/image-to-image`     |
| Virtual Try-On     | Combine garment and model references for fashion and commerce concepts      | `/virtual-try-on`     |
| Text to Video      | Turn written ideas into moving scenes and campaign concepts                 | `/text-to-video`      |
| Image to Video     | Use still images to create animated product visuals and clips               | `/image-to-video`     |
| Reference to Video | Guide video creation with reference media                                   | `/reference-to-video` |

Routes omit the language prefix. Tools share the [feature registry](./lib/features/catalog.ts). Supported inputs,
limits, and parameters depend on the selected model and the [model contracts](./lib/constants/template-models/).

### Prompt Inspiration and Infinite Canvas for Creative Exploration

- **Start from examples**: browse the prompt media library, copy full prompts, and inspect image/video previews with
  zoom and panning. Example images are bundled; example videos stream online. A collection's model label does not
  guarantee that model is available in the generation forms.
- **Organize projects visually**: arrange text, media, and generation settings on an infinite canvas. Pan, zoom, and
  work with nodes, then save a local project to continue editing later.
- **Choose models for the task**: adjust supported parameters with contextual help. First-run guidance and connection
  testing help with setup; appearance and language settings adapt the workspace to daily use.

### Local Media Library, Recoverable Drafts, and Creative Exports

- **Find references and finished work**: search uploaded references and generated results by type and origin, preview or
  download media, and check local archive status. Open `/media-library` or Settings → History.
- **Keep creative progress**: drafts retain prompts, parameters, and input media locally. Task history and
  uploaded-reference indexes stay on the device. Pending-task recovery queries the original task without submitting
  another paid generation.
- **Archive completed outputs**: desktop images and videos are saved under `YYYY/MM/DD` in a configurable folder for
  later editing and delivery. Archive recovery retries saving existing results without generating again.
- **Prepare media for the next step**: use native save dialogs, PNG/JPEG/WebP image export, and on-demand FFmpeg WASM
  trimming to move assets into your production workflow.

### A Practical Workflow for Creators

1. Explore prompt examples or organize text and references on the canvas.
2. Choose a creative tool and model, then set the prompt, references, and supported parameters.
3. Submit, preview results, and use what you learn to refine the next generation.
4. Find outputs in the media library and use archived or exported files in further production.

Generation requires network access, a valid Flaq AI Client Key, and sufficient credits. Models run in the cloud; local
drafts, projects, and media indexes do not provide cross-device cloud sync.

## Getting Started: Run the Desktop App and Connect Flaq AI

### Prerequisites

- Node.js **22**, matching [.nvmrc](./.nvmrc).
- pnpm **10.5.2**, matching `packageManager` in [package.json](./package.json).
- Rust and the target OS's [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) for native development and
  packaging. A frontend-only build does not require Rust.
- A Flaq AI account and Client Key for real generation. The default desktop upload path does **not** require your own
  Cloudflare account.

From this repository's root:

```bash
pnpm install --frozen-lockfile
pnpm desktop:dev
```

Development uses the isolated app ID `ai.flaq.creator.dev`; the installed app uses `ai.flaq.creator`. Their
configuration, WebView data, and default media directories are separate.

### Connect Flaq AI

1. Sign in at [Flaq AI](https://flaq.ai/) and obtain a Client Key.
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

### Media Uploads and Local Data Storage

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

## Desktop Architecture: Tauri 2, Rust, and Next.js

**Tauri 2 + Rust hosts a statically exported Next.js UI. There is no bundled Node.js/Next.js server.** Desktop and web
share React pages, forms, model contracts, translations, and design assets.

### Modern Technology for Everyday Creative Work

- **Native shell and static interface**: Tauri 2 uses the system WebView for the UI while Rust handles windows,
  configuration, and file saving. The installed desktop app needs no local Node.js server.
- **Types and input validation**: TypeScript, shared model contracts, and Zod validation align forms with API requests,
  helping reduce parameter mismatches and simplify model integrations.
- **Asynchronous tasks and on-demand modules**: centralized polling and bounded upload concurrency coordinate generation
  work. FFmpeg and custom R2 signing load only when needed, reducing unnecessary startup work.
- **Reliable output saving**: Rust streams downloads into temporary files before publishing completed files, reducing
  the risk of leaving partial outputs after interrupted transfers. Separate generation and archive states support
  recovery.

### File Privacy and Security: Local Storage and Controlled Uploads

The client protects creative material through explicit data flows and file-access checks:

- **Local drafts first**: IndexedDB stores input media bytes and metadata. Selecting a file does not upload it; uploads
  begin when generation is submitted.
- **Short-lived upload authorization**: the built-in provider obtains signed upload URLs using the Client Key. Shared R2
  credentials stay on the service and are never bundled with the app.
- **File-specific canvas access**: native code resolves real paths and checks that a file is archived media in an
  allowed output directory before granting preview access to that file.
- **Separate local configuration**: development and installed apps use distinct identifiers and WebView data. On Unix,
  remembered connection files allow only the current user to read and write them.

**Privacy boundaries:** local storage does not mean fully offline processing or encrypted files. Generation sends
relevant prompts and references to the configured services; remote retention depends on service or bucket policies.
Remembered Client Keys currently use readable JSON rather than the OS keychain. See “Media Uploads and Local Data
Storage” above for storage details.

### Technology Stack and Source Layout

| Layer                   | Implementation and responsibility                                                               |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| UI                      | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Radix UI, Framer Motion                       |
| Forms and state         | React Hook Form + Zod; Zustand; SWR where used                                                  |
| Feature/model contracts | One registry for eight tools; shared model inputs, limits, and defaults                         |
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

## Desktop App Builds, Tests, and Packaging

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

## Language Support and Interface Localization (i18n)

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

## About the Flaq AI Team: AI Engineering and Creative Workflows

[Flaq AI](https://flaq.ai/) is operated by **FLAQ AI PTE. LTD.**, registered in Singapore. The team combines product
design, model and API engineering, and creative workflow experience to help creators, developers, and businesses
understand, compare, and use AI capabilities.

Its work spans model and tool experiences, API integration, and practical applications of image, video, audio, and
language models, helping turn ideas into usable production workflows.

Learn more: [Flaq AI team and company](https://flaq.ai/about/). Business inquiries:
[contact@flaq.ai](mailto:contact@flaq.ai).

## Flaq AI Affiliate Program: Share Creative Tools and Earn Referral Rewards

Become a Flaq AI affiliate partner and earn commissions by introducing AI image and video workflows, model APIs, and
creative tools to your audience. The program welcomes creators, designers, developers, AI educators, model reviewers,
and teams sharing practical AI workflows.

- **Referral rewards** — Earn 20% on a referred user's first valid paid order and 10% on subsequent valid paid orders
  within 60 days of their registration, subject to the program's eligibility and attribution rules.
- **Flexible promotion** — Share your partner referral link through tutorials, model reviews, creative showcases,
  communities, or API integration guides.
- **Partner workspace** — Manage referral links, review referral activity, and prepare payout settings on Flaq AI.

To get started, sign in to Flaq AI, complete your affiliate profile and agreement, then create your own referral link.
This project also includes localized affiliate promotion entry points; partner enrollment and commission management take
place on Flaq AI, not in the desktop app.

**[Join the Flaq AI Affiliate Program →](https://flaq.ai/affiliate-program/)**

> Commission eligibility, attribution, refunds, payout review, and any approved custom partner arrangements are governed
> by the latest terms on the official program page.

## License

This project is open-source under the [MIT License](LICENSE).
