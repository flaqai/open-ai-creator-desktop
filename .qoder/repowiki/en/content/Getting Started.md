# Getting Started

<cite>
**Referenced Files in This Document**
- [README.md](file://README.md)
- [package.json](file://package.json)
- [next.config.mjs](file://next.config.mjs)
- [next-env.d.ts](file://next-env.d.ts)
- [postcss.config.js](file://postcss.config.js)
- [app/robots.ts](file://app/robots.ts)
- [app/sitemap.ts](file://app/sitemap.ts)
- [lib/env.ts](file://lib/env.ts)
- [lib/constants/index.ts](file://lib/constants/index.ts)
- [components/home/new-section/HeroSection.tsx](file://components/home/new-section/HeroSection.tsx)
</cite>

## Update Summary

**Changes Made**

- Expanded prerequisites section with Node.js 18.x requirement and pnpm 10.x specification
- Added comprehensive Cloudflare R2 storage setup instructions with step-by-step configuration
- Enhanced Flaq.ai API key setup with detailed workflow and security considerations
- Updated environment variables section with complete configuration requirements
- Added AIGC capabilities section with supported models and features
- Expanded deployment section with Vercel integration and alternative platforms
- Enhanced troubleshooting guide with specific error scenarios and resolutions

## Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Environment Setup](#environment-setup)
5. [Cloudflare R2 Storage Setup](#cloudflare-r2-storage-setup)
6. [Flaq.ai API Key Setup](#flaqai-api-key-setup)
7. [Initial Configuration](#initial-configuration)
8. [Running the Development Server](#running-the-development-server)
9. [Understanding the Project Structure](#understanding-the-project-structure)
10. [Accessing AI Features](#accessing-ai-features)
11. [AIGC Capabilities](#aigc-capabilities)
12. [Deployment](#deployment)
13. [Troubleshooting Guide](#troubleshooting-guide)
14. [Next Steps](#next-steps)

## Introduction

Flaq SaaS Template is a free and open-source SaaS starter built with Next.js 16 and React, designed to help you rapidly
prototype and launch AIGC (AI-Generated Content) applications powered by Flaq.ai. This comprehensive template provides
everything needed to build AI-powered image and video generation platforms with professional-grade features including
internationalization, secure API key management, cloud storage integration, and responsive design.

Key capabilities include:

- **AI Generation Tools**: Text-to-Image, Image-to-Image, Text-to-Video, Image-to-Video, and Virtual Try-On
- **Professional Infrastructure**: Cloudflare R2 storage, secure API key management, and CDN integration
- **Modern Development Stack**: Next.js 16 with App Router, TypeScript, Tailwind CSS v4, and Radix UI
- **Internationalization**: Built-in support for English and Simplified Chinese with automatic locale detection
- **Performance Optimized**: Powered by Next.js 16 with Turbopack support for lightning-fast development
- **SEO Ready**: Dynamic metadata, Open Graph, sitemap generation, and structured data support

**Section sources**

- [README.md:34](file://README.md#L34-L48)
- [README.md:49](file://README.md#L49-L67)

## Prerequisites

Before you begin, ensure your environment meets the following requirements:

### Core Requirements

- **Node.js** >= 18.x (recommended version specified in `.nvmrc`)
- **pnpm** >= 10.x (project uses `packageManager` field in `package.json`)
- **Basic React Knowledge**: Understanding of components, hooks, and JSX fundamentals
- **Cloudflare Account**: For R2 storage integration (required for image hosting)
- **Flaq.ai Account**: With active API key for AI generation capabilities

### Development Tools

- **Package Manager**: pnpm (configured as project package manager)
- **Code Editor**: VS Code recommended with TypeScript extensions
- **Git**: For version control and deployment

**Section sources**

- [README.md:70](file://README.md#L70-L76)
- [package.json:122](file://package.json#L122)

## Installation

Follow these step-by-step instructions to set up your Flaq SaaS Template development environment:

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/flaq-saas-template.git
cd flaq-saas-template
```

### Step 2: Install pnpm (if not already installed)

```bash
npm install -g pnpm
```

### Step 3: Install Dependencies

```bash
pnpm install
```

### Step 4: Set Up Environment Configuration

```bash
cp .env.example .env.local
```

### Step 5: Complete Environment Setup

Edit `.env.local` and configure all required environment variables as outlined in the Environment Variables section.

**Section sources**

- [README.md:77](file://README.md#L77-L92)

## Environment Setup

Configure all required environment variables in your `.env.local` file. These variables control the application's
behavior, API connections, and external integrations.

### Essential Environment Variables

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_CONTACT_US_EMAIL="contact@flaq.ai"

# Cloudflare R2 Storage (Server-side only)
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_r2_bucket_name
```

### Security Notes

- **Never expose `R2_SECRET_ACCESS_KEY` to the client** - it's server-side only
- Store sensitive credentials in your deployment platform's environment variables
- Use different credentials for development and production environments

**Section sources**

- [README.md:94](file://README.md#L94-L114)

## Cloudflare R2 Storage Setup

This template uses Cloudflare R2 for storing user-uploaded images and generated assets. Follow these detailed steps to
configure your R2 storage:

### Step 1: Log in to Cloudflare Dashboard

Access your Cloudflare account and navigate to the dashboard.

### Step 2: Create R2 Bucket

1. Navigate to **R2** in the sidebar
2. Click **Create a bucket** (e.g., `flaq-ai-saas`)
3. Choose appropriate region closest to your users

### Step 3: Generate API Tokens

1. Go to **Manage R2 API Tokens**
2. Create a new API token with **Object Read & Write** permissions
3. Save the **Access Key ID** and **Secret Access Key** securely
4. **Important**: Never share or commit these credentials to version control

### Step 4: Configure Public Access

1. In your R2 bucket settings, enable **Public Access** via custom domain or `r2.dev` subdomain
2. Note down the **Public Domain** URL (e.g., `https://your-bucket.your-account.r2.cloudflarestorage.com`)

### Step 5: Set Environment Variables

Add the following to your `.env.local` file:

```bash
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_r2_bucket_name
```

### Step 6: Configure in Application

1. Open the app and click the **gear icon** (⚙️) in the header
2. Navigate to **Open API Settings** dialog
3. Enter your R2 bucket configuration
4. Click **Test R2 Connection** to verify setup
5. Save the settings

**Section sources**

- [README.md:115](file://README.md#L115-L133)

## Flaq.ai API Key Setup

Configure your Flaq.ai API credentials to enable AI generation capabilities:

### Step 1: Register/Sign in to Flaq.ai

Visit [flaq.ai](https://flaq.ai) and create an account or sign in to your existing account.

### Step 2: Generate Client Key

1. Navigate to your account dashboard
2. Go to **API Keys** section
3. Generate a new **Client Key**
4. Copy your Client Key securely

### Step 3: Configure in Application

1. Open the app and click the **gear icon** (⚙️) in the header
2. Navigate to **Open API Settings** dialog
3. Paste your Client Key
4. Click **Test Connection** to verify
5. Optionally enable **Remember Me** for secure persistent storage
   - **Warning**: Disable for shared/public devices for maximum security

### Step 4: Verify API Credits

- Ensure you have sufficient API credits to generate images and videos
- Top up your balance at [flaq.ai](https://flaq.ai) if needed

**Section sources**

- [README.md:134](file://README.md#L134-L149)

## Initial Configuration

Beyond environment variables, the project includes several configuration files that establish the foundation for your
SaaS application:

### TypeScript Configuration

- `next-env.d.ts`: Type-safe Next.js environment declarations
- `tsconfig.json`: TypeScript compiler configuration

### Styling and Build Tools

- `postcss.config.js`: Tailwind CSS integration via PostCSS
- `tailwind.config.ts`: Tailwind CSS customization
- `components.json`: shadcn/ui component library configuration

### Internationalization

- `i18n/languages.ts`: Supported locales definition
- `i18n/request.ts`: next-intl request configuration
- `i18n/routing.ts`: Locale routing configuration

### SEO and Metadata

- `app/robots.ts`: Robots.txt generation with crawler-specific rules
- `app/sitemap.ts`: Dynamic sitemap generation with multilingual support

**Section sources**

- [next-env.d.ts:1](file://next-env.d.ts#L1-L7)
- [postcss.config.js:1](file://postcss.config.js#L1-L6)
- [app/robots.ts:1](file://app/robots.ts#L1-L35)
- [app/sitemap.ts:1](file://app/sitemap.ts#L1-L35)

## Running the Development Server

Start the development server using one of the following commands:

### Development with Turbopack (Recommended)

```bash
pnpm dev:turbo
```

### Standard Development

```bash
pnpm dev
```

### Production Build and Start

```bash
pnpm build
pnpm start
```

### Development Commands

- **Hot Reload**: Automatic page refresh on code changes
- **Type Checking**: Real-time TypeScript validation
- **Linting**: Code quality enforcement during development
- **Port**: Default port is 3000 (changeable in environment variables)

**Section sources**

- [README.md:152](file://README.md#L152-L162)
- [package.json:5](file://package.json#L5-L15)

## Understanding the Project Structure

The Flaq SaaS Template follows a well-organized structure optimized for scalability and maintainability:

```
.
├── app/                     # Next.js App Router pages and API routes
│   ├── [locale]/           # Internationalized routes (en, zh)
│   │   ├── (with-footer)/  # Pages with footer layout
│   │   │   ├── (home)/     # Landing page
│   │   │   └── (ai-features)/ # AIGC feature pages
│   │   └── (without-footer)/ # Full-screen pages (+page)
│   ├── api/                # API routes (proxy-image, upload)
│   ├── robots.ts           # Robots.txt generation
│   └── sitemap.ts          # Dynamic sitemap generation
├── components/             # Reusable React components
│   ├── ui/                 # shadcn/ui-style components (Radix-based)
│   ├── dialog/             # Dialog components (API settings, etc.)
│   ├── layout/             # Layout components (header, footer, sidebar)
│   └── feature-specific/   # AI generation tool components
├── hooks/                  # Custom React hooks
├── i18n/                   # Internationalization configuration
│   ├── languages.ts        # Supported locales definition
│   ├── request.ts          # next-intl request configuration
│   └── routing.ts          # Locale routing configuration
├── lib/                    # Utility libraries
│   ├── constants/          # App constants, model configs, navigation
│   ├── utils/              # Utility functions
│   └── env.ts              # Environment variable helpers
├── messages/               # Translation files (en.json, zh.json)
├── network/                # API client and network utilities
│   ├── clientFetch.ts      # Flaq.ai API client with auth
│   ├── image/              # Image generation API calls
│   ├── video/              # Video generation API calls
│   └── upload/             # R2 upload client
├── public/                 # Static assets (images, icons, fonts)
├── store/                  # Zustand state stores
├── next.config.mjs         # Next.js configuration
├── proxy.ts                # Middleware proxy (i18n + IP forwarding)
└── tsconfig.json           # TypeScript configuration
```

**Section sources**

- [README.md:227](file://README.md#L227-L266)

## Accessing AI Features

The template provides five fully functional AI generation tools, each with pre-configured forms and real-time processing
capabilities:

### Available AI Features

1. **Text-to-Image**: Generate images from natural language prompts
2. **Image-to-Image**: Transform existing images with AI while maintaining style
3. **Text-to-Video**: Create videos from text descriptions with motion synthesis
4. **Image-to-Video**: Animate static images into dynamic videos
5. **Virtual Try-On**: AI-powered virtual clothing try-on experience

### Feature Workflows

- Each tool includes pre-configured forms with model selection and parameter controls
- Real-time generation status polling with progress indicators
- Result galleries with download and share functionality
- History tracking of previously generated assets
- Responsive design optimized for all device sizes

**Section sources**

- [README.md:193](file://README.md#L193-L211)
- [components/home/new-section/HeroSection.tsx:1](file://components/home/new-section/HeroSection.tsx#L1-L51)

## AIGC Capabilities

The template supports multiple AI models across different generation categories:

### Supported Models by Capability

| Capability         | Description                                   | Supported Models                                                             |
| ------------------ | --------------------------------------------- | ---------------------------------------------------------------------------- |
| **Text-to-Image**  | Generate images from natural language prompts | Nano Banana Pro, Seedream 5.0, GPT Image 2, Qwen Image 2.0, Grok Imagine     |
| **Image-to-Image** | Transform or enhance existing images          | Nano Banana Pro Edit, Seedream 5.0 Edit, GPT Image 2 Edit, Grok Imagine Edit |
| **Text-to-Video**  | Create videos from text descriptions          | Veo 3.1, Wan 2.7, Kling 3.0, Seedance 2.0, Vidu Q3                           |
| **Image-to-Video** | Animate static images into videos             | Veo 3.1, Wan 2.7, Kling 3.0, Seedance 2.0, Vidu Q3                           |
| **Virtual Try-On** | AI-powered virtual clothing try-on            | GPT Image 2 Edit, Nano Banana Pro Edit                                       |

### Common Features Across All Tools

- Pre-configured form with model selection and parameter controls
- Real-time generation status polling
- Result gallery with download and share options
- History of previously generated assets
- Error handling and retry mechanisms
- Progress indicators and loading states

**Section sources**

- [README.md:195](file://README.md#L195-L204)

## Deployment

Deploy your Flaq SaaS Template using Vercel for the fastest and most reliable deployment experience:

### Vercel Deployment (Recommended)

1. Push your repository to GitHub
2. Import the project in Vercel
3. Add all environment variables (`R2_*`, `NEXT_PUBLIC_*`) in Vercel's project settings
4. Deploy!

### Alternative Deployment Platforms

The template works on any platform that supports Next.js:

- **Netlify**: Serverless functions and static site generation
- **Cloudflare Pages**: Edge computing with R2 storage integration
- **Docker**: Containerized deployment for self-hosted solutions
- **Traditional VPS**: Node.js 18+ deployment with PM2 or similar process managers

### Environment Variables for Production

Ensure all required environment variables are configured in your deployment platform:

- `NEXT_PUBLIC_SITE_URL`: Your production domain
- `NEXT_PUBLIC_CONTACT_US_EMAIL`: Support email for footer
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`: Cloudflare R2 credentials
- `NEXT_BASE_API`, `SITE_ID`: Application configuration

**Section sources**

- [README.md:268](file://README.md#L268-L279)

## Troubleshooting Guide

Common setup and runtime issues with specific solutions:

### Environment Variable Issues

**Problem**: Missing environment variables causing build/runtime errors **Solution**:

1. Verify all required variables are set in `.env.local`
2. Check for typos in variable names
3. Ensure server-side variables aren't exposed to client
4. Restart development server after changes

### Cloudflare R2 Connection Problems

**Problem**: Images not loading or upload failures **Solution**:

1. Verify R2 bucket exists and is accessible
2. Check API token permissions (must have Object Read & Write)
3. Confirm public access is enabled on the bucket
4. Test connection using the settings dialog
5. Verify bucket name matches exactly

### Flaq.ai API Key Issues

**Problem**: AI generation requests failing **Solution**:

1. Verify API key is valid and active
2. Check API credits balance
3. Ensure proper model selection for your use case
4. Test connection in the settings dialog
5. Review API rate limits and quotas

### Development Server Issues

**Problem**: Development server fails to start **Solution**:

1. Clear node_modules and reinstall dependencies: `pnpm install`
2. Check for port conflicts (default: 3000)
3. Verify Node.js version compatibility (>= 18.x)
4. Clear Next.js cache: `rm -rf .next`
5. Check TypeScript compilation errors

### Image Optimization Problems

**Problem**: Remote images not loading or optimization errors **Solution**:

1. Configure `IMAGE_REMOTE_PATTERNS` with allowed hostnames
2. Set `ALLOW_LOCAL_IMAGE_OPTIMIZATION=true` only for development
3. Verify image URLs use HTTPS protocol
4. Check Next.js image configuration in `next.config.mjs`

### Internationalization Issues

**Problem**: Language switching not working **Solution**:

1. Verify locale files exist in `messages/` directory
2. Check `i18n/languages.ts` contains the desired locales
3. Ensure URL structure follows `/` (English) and `/zh/` (Chinese)
4. Verify translation keys exist in both language files

### Build and Bundle Issues

**Problem**: Production build failing or large bundle size **Solution**:

1. Run TypeScript check: `pnpm ts-check`
2. Execute linting and fix issues: `pnpm lint:fix`
3. Analyze bundle size: `pnpm build:analyze`
4. Check for circular dependencies
5. Verify all environment variables are properly configured

**Section sources**

- [next.config.mjs:25](file://next.config.mjs#L25-L55)
- [README.md:113](file://README.md#L113-L114)

## Next Steps

With your environment configured and the development server running, you're ready to build your SaaS application:

### Immediate Next Steps

1. **Explore AI Features**: Test all five AI generation tools to understand capabilities
2. **Customize Branding**: Update logos, colors, and messaging in the UI
3. **Configure Pricing**: Set up monetization models and credit systems
4. **Add Analytics**: Integrate usage tracking and performance monitoring
5. **Plan Deployment**: Prepare for production rollout with proper monitoring

### Advanced Customization

1. **Add New AI Models**: Extend supported models in the configuration
2. **Customize UI Components**: Modify themes and layouts for your brand
3. **Implement User Management**: Add authentication and user session handling
4. **Extend Storage**: Support additional cloud providers beyond R2
5. **Add Payment Processing**: Integrate subscription and usage-based billing

### Monitoring and Maintenance

1. **Set Up Error Tracking**: Implement Sentry or similar error monitoring
2. **Performance Monitoring**: Add Lighthouse and speed monitoring
3. **Regular Updates**: Keep dependencies updated for security and performance
4. **Backup Strategy**: Implement automated backups for critical data
5. **Security Audits**: Regular security reviews and vulnerability assessments

**Section sources**

- [README.md:281](file://README.md#L281-L284)
