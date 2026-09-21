# Flaq Creator Desktop

Cross-platform desktop adaptation of the open-source [Flaq SaaS Template](https://github.com/flaqai/flaq-saas-template),
designed for AI image and video creation with the [Flaq.ai](https://flaq.ai) API. The original web experience remains
available, while the desktop build adds a focused creator workspace for macOS, Windows, and Linux.

**Read this README in:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português (Brasil)](./README_pt.md) · [Español](./README_es.md) ·
[Deutsch](./README_de.md) · [Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) ·
[繁體中文](./README_tw.md) · [한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) ·
[العربية](./README_ar.md)

> The README language set mirrors `i18n/languages.ts`, so every UI locale has a matching project introduction.

## Desktop app

The desktop edition keeps the template's seven creative workflows and visual language, while replacing the long
marketing layout with a compact workspace, contextual guide dialogs, a first-run Flaq.ai setup flow, and automatic
date-based local media archiving. All 15 UI locales are included, with RTL layout for Arabic.

- Product and route inventory: [`docs/PRODUCT_INVENTORY.md`](./docs/PRODUCT_INVENTORY.md)
- Desktop architecture and service boundaries: [`docs/DESKTOP_ARCHITECTURE.md`](./docs/DESKTOP_ARCHITECTURE.md)
- Review findings and verification boundaries: [`docs/REVIEW_REPORT.md`](./docs/REVIEW_REPORT.md)
- Adding modules and repeatable local QA: [`docs/ADDING_MODULES.md`](./docs/ADDING_MODULES.md)

```bash
# Run the desktop app in development mode
pnpm desktop:dev

# Produce the static desktop frontend
pnpm build:desktop

# Build the native installer for the current operating system
pnpm desktop:build
```

Native builds require the standard [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) for the target
operating system, including Rust. Cross-platform release builds are configured in `.github/workflows/desktop-build.yml`.

## Table of Contents

- [Flaq Creator Desktop](#flaq-creator-desktop)
  - [Desktop app](#desktop-app)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Environment Variables](#environment-variables)
    - [Cloudflare R2 Storage Setup](#cloudflare-r2-storage-setup)
    - [Flaq.ai API Key Setup](#flaqai-api-key-setup)
  - [Usage](#usage)
    - [Development](#development)
    - [Build](#build)
    - [Lint \& Format](#lint--format)
  - [AIGC Capabilities](#aigc-capabilities)
  - [Flaq.ai Affiliate Program](#flaqai-affiliate-program)
  - [Internationalization (i18n)](#internationalization-i18n)
  - [SEO and AI Crawler Discovery](#seo-and-ai-crawler-discovery)
  - [Project Structure](#project-structure)
  - [Deployment](#deployment)
  - [License](#license)

## Features

- 🎨 **Text-to-Image** — Generate stunning images from text prompts using state-of-the-art AI models
- 🖼️ **Image-to-Image** — Transform existing images into creative variations with consistent style
- 🎬 **Text-to-Video** — Create high-quality videos from simple text descriptions
- 📹 **Image-to-Video** — Animate static images into dynamic video content
- 👗 **Virtual Try-On** — AI-powered virtual clothing try-on experience
- 🌐 **Internationalization** — 15 locales aligned with Flaq.ai, with locale-aware routing and SEO alternates
- 🚀 **No Signup Required** — Explore, modify, and self-host the template without creating an app account
- 🤝 **Affiliate Promotion** — Responsive Flaq.ai affiliate callout with localized copy and destination links
- 🔒 **Secure API Key Management** — Encrypted client-side storage for your Flaq.ai credentials
- ☁️ **Cloudflare R2 Storage** — Built-in image hosting with Cloudflare's global CDN
- 📱 **Responsive Design** — Fully responsive UI built with Tailwind CSS and Radix UI
- 🌓 **Dark Mode** — Beautiful dark-themed UI out of the box
- ⚡ **Fast Performance** — Powered by Next.js 16 with Turbopack support
- 🔍 **SEO Optimized** — Dynamic metadata, Open Graph, sitemap, and structured data
- 🤖 **AI Crawler Ready** — Curated `llms.txt`, expanded `llms-full.txt`, and public crawler access

## Tech Stack

| Category          | Technology                                                                |
| ----------------- | ------------------------------------------------------------------------- |
| Framework         | [Next.js 16](https://nextjs.org/) (App Router)                            |
| Language          | [TypeScript](https://www.typescriptlang.org/)                             |
| UI Library        | [React 19](https://react.dev/)                                            |
| Styling           | [Tailwind CSS v4](https://tailwindcss.com/)                               |
| Component Library | [Radix UI](https://www.radix-ui.com/)                                     |
| Animations        | [Framer Motion](https://www.framer.com/motion/)                           |
| Forms             | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| State Management  | [Zustand](https://zustand.docs.pmnd.rs/)                                  |
| Data Fetching     | [SWR](https://swr.vercel.app/)                                            |
| i18n              | [next-intl](https://next-intl-docs.vercel.app/)                           |
| Icons             | [Lucide React](https://lucide.dev/)                                       |
| Charts            | [Recharts](https://recharts.org/)                                         |
| Package Manager   | [pnpm](https://pnpm.io/)                                                  |
| Linting           | [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)          |

## Getting Started

### Prerequisites

- **Node.js** >= 18.x (check `.nvmrc` for the recommended version)
- **pnpm** >= 10.x (the project uses `packageManager` field in `package.json`)
- A [Flaq.ai](https://flaq.ai/) account with an active API key
- A [Cloudflare](https://cloudflare.com) account (for R2 image storage)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/flaqai/flaq-saas-template.git
cd flaq-saas-template

# 2. Install pnpm if you haven't already
npm install -g pnpm

# 3. Install dependencies
pnpm install

# 4. Copy the environment template
cp .env.example .env.local
```

### Environment Variables

Edit `.env.local` and configure the following variables:

```bash
# Your site URL (used for metadata, sitemap, and Open Graph)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Contact email displayed in the footer
NEXT_PUBLIC_CONTACT_US_EMAIL="contact@flaq.ai"

# Cloudflare R2 Storage Configuration (server-side only)
# Get these from Cloudflare Dashboard > R2 > Manage R2 API Tokens
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_r2_bucket_name
```

> **⚠️ Important**: Never expose `R2_SECRET_ACCESS_KEY` to the client. The R2 credentials are server-side only.

### Cloudflare R2 Storage Setup

This template uses Cloudflare R2 for storing user-uploaded images and generated assets. Follow these steps:

1. **Log in** to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. **Navigate** to **R2** in the sidebar
3. **Create a bucket** (e.g., `flaq-ai-saas`)
4. **Generate API Tokens**:
   - Go to **Manage R2 API Tokens**
   - Create a new API token with **Object Read & Write** permissions
   - Save the **Access Key ID** and **Secret Access Key** securely
5. **Configure Public Access**:
   - In your R2 bucket settings, enable **Public Access** via a custom domain or `r2.dev` subdomain
   - Note down the **Public Domain** URL (e.g., `https://your-bucket.your-account.r2.cloudflarestorage.com`)
6. **Set environment variables** in `.env.local` (see above)
7. **Configure the public domain** for the web deployment. The desktop app uses its provisioned Flaq R2 configuration by
   default; users who select Custom Cloudflare R2 can enter a separate credential set encrypted in the local app
   profile. In both cases files upload to R2 first and only their public URLs are sent to generation APIs.

> The current desktop build may package an encrypted built-in R2 preset and fall back to the Flaq presigned-URL service
> when that preset is absent. Package encryption is obfuscation, not a secure vault; embedded credentials can be
> extracted by a determined user. Prefer the server-issued presigned-URL path for stronger production isolation.

### Flaq.ai API Key Setup

1. **Register/Sign in** at [flaq.ai](https://flaq.ai)
2. **Navigate** to your account dashboard
3. **Generate a Client Key** from the API Keys section
4. **Copy** your Client Key
5. **Open** the app and click the **gear icon** (⚙️) in the header to open the **Open API Settings** dialog
6. **Paste** your Client Key and click **Test Connection** to verify
7. **Save** the settings

> **💡 Tip**: In the desktop app, enabling "Remember Me" stores the API key as readable text in `auth.json` under
> the current user's application configuration directory. On shared or public devices, leave this option unchecked.

> **🔑 API Credits**: You need sufficient API credits to generate images and videos. Top up your balance at
> [flaq.ai](https://flaq.ai) if needed.

## Usage

### Development

```bash
# Start the development server (with Turbopack for faster HMR)
pnpm dev:turbo

# Or start without Turbopack
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
# Production build
pnpm build

# Build with bundle analysis
pnpm build:analyze

# Start production server
pnpm start
```

### Lint & Format

```bash
# Run ESLint
pnpm lint

# Auto-fix lint issues
pnpm lint:fix

# Format code with Prettier
pnpm prettier

# TypeScript type checking
pnpm ts-check
```

## AIGC Capabilities

This template comes with five fully functional AI generation tools, all powered by [Flaq.ai](https://flaq.ai) API:

| Capability         | Description                                                                               | Supported Models                                                             |
| ------------------ | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Text-to-Image**  | Generate images from natural language prompts                                             | Nano Banana Pro, Seedream 5.0, GPT Image 2, Qwen Image 2.0, Grok Imagine     |
| **Image-to-Image** | Transform or enhance existing images with AI, maintaining style and composition           | Nano Banana Pro Edit, Seedream 5.0 Edit, GPT Image 2 Edit, Grok Imagine Edit |
| **Text-to-Video**  | Create videos from text descriptions with advanced motion synthesis                       | Veo 3.1, Wan 2.7, Kling 3.0, Seedance 2.0, Vidu Q3                           |
| **Image-to-Video** | Animate static images into dynamic videos                                                 | Veo 3.1, Wan 2.7, Kling 3.0, Seedance 2.0, Vidu Q3                           |
| **Virtual Try-On** | AI-powered virtual clothing try-on — upload a garment and a model photo to see the result | GPT Image 2 Edit, Nano Banana Pro Edit                                       |

Each tool includes:

- Pre-configured form with model selection and parameter controls
- Real-time generation status polling
- Result gallery with download and share options
- History of previously generated assets

## Flaq.ai Affiliate Program

Public landing and generation pages include a localized promotion for the
[Flaq.ai Affiliate Program](https://flaq.ai/affiliate-program?utm_source=flaq-saas-template). The call-to-action opens
the matching Flaq.ai language page and includes `utm_source=flaq-saas-template` for source attribution.

According to the current program terms, affiliates can earn 20% on a referred user's first valid paid order and 10% on
subsequent valid paid orders made within 60 days of registration. Eligibility and payout are governed by the terms
published on the linked program page.

## Internationalization (i18n)

This template supports **15 locales** out of the box: English (default), Japanese, Indonesian, Italian, Brazilian
Portuguese, Spanish, German, Russian, French, Simplified Chinese, Traditional Chinese, Korean, Thai, Vietnamese, and
Arabic.

- Translation files are located in the `messages/` directory, one JSON file per locale
- Locale is auto-detected from the browser's `Accept-Language` header
- Users can manually switch languages via the footer or the language dialog
- URL structure: `/` for English and `/{locale}/` for other languages (for example, `/ja/` or `/zh/`)
- Arabic pages automatically use right-to-left document direction

To add more languages:

1. Add the locale to `i18n/languages.ts`
2. Create a new translation file in `messages/`
3. Add any new language-specific metadata in the layout files

## SEO and AI Crawler Discovery

Every public page has localized title and description copy, an absolute canonical URL, 15-language `hreflang`
alternates, Open Graph metadata, a Twitter card, and index/follow directives. The generated `/sitemap.xml` includes
every public route in every locale with matching language alternates.

- `/robots.txt` allows search engines and AI assistants to crawl public content while blocking API and callback routes
- `/llms.txt` provides a concise, structured map of the product, pages, languages, documentation, and policies
- `/llms-full.txt` provides expanded project context, capabilities, setup instructions, architecture, and usage
  boundaries
- JSON-LD identifies the website and MIT-licensed open-source repository without unverifiable ratings

Set `NEXT_PUBLIC_SITE_URL` to the production origin before deployment so canonical, sitemap, and LLM resource URLs use
the correct domain.

## Project Structure

```
.
├── app/                     # Next.js App Router pages
│   ├── [locale]/           # Internationalized routes (15 supported locales)
│   │   ├── (with-footer)/  # Pages with footer layout
│   │   │   ├── (home)/     # Landing page
│   │   │   └── (ai-features)/ # AIGC feature pages
│   │   └── (without-footer)/ # Full-screen pages (e.g., +page)
│   ├── api/                # API routes (proxy-image, upload)
│   ├── robots.ts           # Robots.txt generation
│   ├── sitemap.ts          # Dynamic sitemap generation
│   ├── llms.txt/           # Concise AI-readable site map
│   └── llms-full.txt/      # Expanded AI-readable project context
├── components/             # Reusable React components
│   ├── ui/                 # shadcn/ui-style components (Radix-based)
│   ├── dialog/             # Dialog components (API settings, etc.)
│   ├── layout/             # Layout components (header, footer, sidebar)
│   └── ...                 # Feature-specific components
├── hooks/                  # Custom React hooks
├── i18n/                   # Internationalization configuration
│   ├── languages.ts        # Supported locales definition
│   ├── request.ts          # next-intl request configuration
│   └── routing.ts          # Locale routing configuration
├── lib/                    # Utility libraries
│   ├── seo/                # Metadata, llms.txt, and crawler helpers
│   ├── constants/          # App constants, model configs, navigation
│   ├── utils/              # Utility functions
│   └── env.ts              # Environment variable helpers
├── messages/               # One translation file for each supported locale
├── network/                # API client and network utilities
│   ├── clientFetch.ts      # Flaq.ai API client with auth
│   ├── image/              # Image generation API calls
│   ├── video/              # Video generation API calls
│   └── upload/             # R2 upload client
├── public/                 # Static assets (images, icons, fonts)
├── store/                  # Zustand state stores
├── next.config.mjs         # Next.js configuration
├── proxy.ts                # Middleware proxy (i18n + IP forwarding)
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Deployment

The easiest way to deploy this template is via [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/flaq-saas-template)

1. Push the repository to GitHub
2. Import the project in Vercel
3. Add all environment variables (`R2_*`, `NEXT_PUBLIC_*`) in Vercel's project settings
4. Deploy!

> The template also works on any platform that supports Next.js (Netlify, Cloudflare Pages, Docker, etc.).

## License

This project is open-source under the [MIT License](LICENSE).
