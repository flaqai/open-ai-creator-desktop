import { languages } from '@/i18n/languages';

import { BASE_URL } from '@/lib/env';

const pageLinks = [
  ['Home', '/', 'Overview of the free, open-source Flaq SaaS Template.'],
  ['AI Media Creator', '/ai-media-creator/', 'Unified workspace for supported AI image and video workflows.'],
  ['Text to Image', '/text-to-image/', 'Create images from text prompts with supported Flaq API models.'],
  ['Image to Image', '/image-to-image/', 'Transform or edit images with reference-guided AI models.'],
  ['Text to Video', '/text-to-video/', 'Generate videos from text prompts, including models with audio support.'],
  ['Image to Video', '/image-to-video/', 'Animate source images with supported AI video models.'],
  [
    'Reference to Video',
    '/reference-to-video/',
    'Guide video generation with images, video, audio, documents, or links when supported.',
  ],
  ['Virtual Try-On', '/virtual-try-on/', 'Preview garments on a person using AI image editing.'],
] as const;

const absoluteUrl = (path: string) => `${BASE_URL}${path}`;

export function getLlmsTxt() {
  const pages = pageLinks.map(([name, path, description]) => `- [${name}](${absoluteUrl(path)}): ${description}`);
  const localePages = languages.map(({ code, lang, label }) => {
    const path = lang === 'en' ? '/' : `/${lang}/`;
    return `- [${label} (${code})](${absoluteUrl(path)}): Localized project homepage and navigation.`;
  });

  return `# Flaq SaaS Template

> A free and open-source Next.js template for building AI image and video generation products with the Flaq API. No signup is required to use, modify, or self-host the source template under the MIT License; a Flaq Client Key and API credit are required for model generation.

Flaq SaaS Template provides production-oriented UI, internationalized routes, generation forms, local history, Cloudflare R2 uploads, SEO metadata, and integration points for one Flaq Client Key. Visitors can open and explore the app without creating an account in the template. The canonical source repository is https://github.com/flaqai/flaq-saas-template.

## Product Pages

${pages.join('\n')}

## Languages

${localePages.join('\n')}

## Developer Resources

- [Source code](https://github.com/flaqai/flaq-saas-template): MIT-licensed project source and contribution history.
- [Project README](https://github.com/flaqai/flaq-saas-template#readme): Installation, environment variables, architecture, supported models, and deployment.
- [Flaq API documentation](https://flaq.ai/docs): API concepts and integration documentation.
- [Sitemap](${absoluteUrl('/sitemap.xml')}): Complete index of localized public pages with language alternates.
- [Full LLM context](${absoluteUrl('/llms-full.txt')}): Expanded project, page, setup, and architecture information.

## Policies

- [Privacy Policy](${absoluteUrl('/privacy-policy/')}): How the template site handles information.
- [Terms of Service](${absoluteUrl('/terms-of-service/')}): Terms governing use of the template site.
- [Refund Policy](${absoluteUrl('/refund-policy/')}): Refund policy for applicable services.

## Optional

- [Flaq.ai](https://flaq.ai): Unified access to supported AI image and video models.
- [Flaq.ai Affiliate Program](https://flaq.ai/affiliate-program?utm_source=flaq-saas-template): Current referral terms and eligibility.
`;
}

export function getLlmsFullTxt() {
  return `${getLlmsTxt()}

## Full Project Context

### Identity and licensing

Flaq SaaS Template is an MIT-licensed, free and open-source starter for developers who want to launch or prototype an AI media product. No signup is required to use, modify, self-host, or explore the template. Flaq.ai is the model API provider integrated by the project. AI generation requests require a Flaq Client Key and sufficient API credit; obtaining and using that key is separate from the template's no-signup experience and free source-code license.

### Core capabilities

- Text to Image: turns natural-language prompts into images with configured models such as Nano Banana, Seedream, GPT Image, Qwen Image, and Grok Imagine.
- Image to Image: edits or transforms source images while using prompts and references to guide the result.
- Text to Video: creates video from written prompts with model-dependent duration, ratio, resolution, and audio controls.
- Image to Video: animates a source image with model-dependent motion and output settings.
- Reference to Video: accepts supported image, video, audio, document, or URL references and lets prompts mention those assets.
- Virtual Try-On: combines person and garment images to preview clothing with an AI image-editing workflow.
- AI Media Creator: combines supported image and video workflows in one adaptive workspace.

### Application behavior

Generation forms expose only the inputs and settings supported by the selected model. Tasks are submitted through the Flaq API, polled for status, and displayed in local image or video history. Local uploads can be stored in Cloudflare R2 when server-side R2 credentials and a public asset domain are configured. The Flaq Client Key can be stored in encrypted browser storage when the user enables persistence.

### Free and open-source scope

The repository, UI template, routing, localization files, forms, and deployment configuration are free to use under the MIT License. This does not mean every third-party service is free. Flaq API model inference, Cloudflare services, hosting providers, domains, and other infrastructure can have their own prices and terms. Pages should describe the template as free and open source while keeping this distinction clear.

### Internationalization

The application supports 15 locales: English (en), Japanese (ja), Indonesian (id), Italian (it), Brazilian Portuguese (pt), Spanish (es), German (de), Russian (ru), French (fr), Simplified Chinese (zh), Traditional Chinese (tw), Korean (ko), Thai (th), Vietnamese (vi), and Arabic (ar). English uses the unprefixed route. Other languages use /{locale}/. Arabic documents use right-to-left direction. Metadata, canonical URLs, hreflang alternates, sitemap entries, and affiliate destinations are locale-aware.

### Technical architecture

- Framework: Next.js 16 App Router and React 19.
- Language: TypeScript.
- Styling: Tailwind CSS 4 and Radix UI components.
- Internationalization: next-intl.
- State and fetching: Zustand and SWR.
- Forms and validation: React Hook Form and Zod.
- Storage: optional Cloudflare R2 integration.
- Package manager: pnpm.

### Local setup

1. Clone https://github.com/flaqai/flaq-saas-template.
2. Run pnpm install.
3. Copy .env.example to .env.local.
4. Set NEXT_PUBLIC_SITE_URL to the public origin, or http://localhost:3000 for local development.
5. Add Cloudflare R2 credentials if local uploads should be stored remotely.
6. Run pnpm dev and open http://localhost:3000.
7. Open API Settings in the app and add a Flaq Client Key before generating media.

### Public route catalog

${pageLinks.map(([name, path, description]) => `#### ${name}\n\nURL: ${absoluteUrl(path)}\n\n${description}`).join('\n\n')}

### Discovery and structured data

The site exposes ${absoluteUrl('/robots.txt')}, ${absoluteUrl('/sitemap.xml')}, ${absoluteUrl('/llms.txt')}, and ${absoluteUrl('/llms-full.txt')}. Public pages provide localized titles and descriptions, canonical URLs, hreflang mappings, Open Graph metadata, Twitter cards, crawl directives, and JSON-LD describing the website and open-source code repository.

### Affiliate program

Public generation pages can promote the Flaq.ai Affiliate Program using locale-aware links and utm_source=flaq-saas-template attribution. At the time this project copy was prepared, published terms described 20% commission on a referred user's first valid paid order and 10% on subsequent valid paid orders made within 60 days of registration. The linked Flaq.ai program page is authoritative for current eligibility and payout terms.
`;
}
