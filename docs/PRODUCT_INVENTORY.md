# Flaq Creator Desktop — Product Inventory

This document is the source-of-truth inventory for the desktop conversion. It is based on the actual routes, forms,
model registries, storage adapters, and locale files imported from `flaqai/flaq-saas-template` on 2026-09-05.

## Product areas

| Area                 | Route                  | Primary workflow                                | Inputs and controls                                                                                             | Output and persistence                                 |
| -------------------- | ---------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Home                 | `/`                    | Discover available creation workflows           | Tool cards, examples, FAQs, resource links                                                                      | Navigation only                                        |
| AI Media Creator     | `/ai-media-creator`    | Create image or video from one unified composer | Media type, generation type, model, prompt, reference images/video/audio/files/links, model-specific parameters | Live task polling, preview, local creation history     |
| Text to Image        | `/text-to-image`       | Generate images from a prompt                   | Prompt, model/provider, aspect ratio, resolution, quality, seed where supported                                 | Image preview, local history, download/share actions   |
| Image to Image       | `/image-to-image`      | Edit or transform one or more images            | Source image(s), prompt, model/provider, aspect ratio, resolution, quality, seed where supported                | Image preview, local history, download/share actions   |
| Virtual Try-On       | `/virtual-try-on`      | Apply a garment to a model photo                | Person image, garment image, prompt presets/model options                                                       | Generated image and local history                      |
| Text to Video        | `/text-to-video`       | Generate a video from a prompt                  | Prompt, model/provider, duration, ratio, resolution, sound/BGM, seed, guidance, negative prompt when supported  | Video preview, task polling, local history             |
| Image to Video       | `/image-to-video`      | Animate an image or start/end frames            | Start image, optional end image, prompt, model-specific duration/ratio/resolution/audio controls                | Video preview, task polling, local history             |
| Reference to Video   | `/reference-to-video`  | Build a video from multiple references          | Images, video, audio, documents, links, prompt mentions, model-specific limits                                  | Video preview, task polling, local history             |
| Prompt media library | `/recommended-prompts` | Browse model-specific creative recipes          | Exact prompt snapshots for Qwen Image 3.0, Wan 3.0, MiniMax H3, and Seedance 2.5 with matching media            | Local images, online videos, and links to Flaq sources |
| History              | Settings → History     | Find uploaded assets and generated works        | Type, source, and text filters; preview and download actions                                                    | Reads the existing local media catalog                 |
| Privacy policy       | `/privacy-policy`      | Legal information                               | Read-only localized content                                                                                     | None                                                   |
| Terms of service     | `/terms-of-service`    | Legal information                               | Read-only localized content                                                                                     | None                                                   |
| Refund policy        | `/refund-policy`       | Legal information                               | Read-only localized content                                                                                     | None                                                   |
| Not found            | `/404` and catch-all   | Recover from invalid links                      | Return-home action                                                                                              | None                                                   |

All user-facing routes are localized. English uses the unprefixed web URL in the original web build; the desktop static
build emits explicit locale paths and chooses the saved language, supported system language, then English.

## Shared capabilities

- Flaq Open API configuration: custom API base URL, client key, connection test, remember-for-later preference, and
  clear/reset actions.
- Flaq setup guidance: account/API-key entry points and direct links to Flaq documentation.
- Media upload transport: desktop builds prefer an encrypted, packaged Flaq R2 preset and fall back to Client-Key-based
  short-lived upload URLs when the preset is absent. Users can instead select a separately stored custom Cloudflare R2
  account from Image Hosting settings. Package encryption is only obfuscation and does not make embedded credentials
  extraction-resistant. Files upload to storage first, and generation requests receive only public URLs.
- Asynchronous generation: task submission, polling, recovery of active tasks, success/failure states, and result
  rendering.
- Local history and archive: metadata remains in the application WebView profile; newly completed desktop image and
  video results are also written under a configurable native media directory organized as `YYYY/MM/DD`.
- Media handling: drag/drop and picker uploads, previews, image conversion/cropping, video last-frame extraction,
  audio/video previews, and FFmpeg-based helpers.
- Model-aware forms: controls are shown only when the selected model supports them.
- Navigation: the desktop sidebar includes creation tools and the prompt media library; local media history is available
  inside Settings. The web build keeps its existing navigation and standalone media-library route.
- UX infrastructure: responsive layouts, dark theme, dialogs/drawers/popovers, notifications, loading states, navigation
  guards, and local cookie consent in the web experience.
- SEO/web-only infrastructure: localized metadata, sitemap, robots, JSON-LD, and `llms.txt` endpoints. These remain
  useful for the web build but are not part of the desktop workflow.

## Model families represented by the source

- Image: Google Gemini/Nano Banana, ByteDance Seedream, OpenAI GPT Image, and Qwen.
- Video: Kling, Seedance, FLUX, MiniMax, Happy Horse, Veo, Vidu, and Wan.
- Exact model IDs, accepted reference types, durations, ratios, resolutions, and optional controls are data-driven in
  `lib/constants/template-models` and should be treated as the runtime source of truth.

## Languages

The imported project currently ships 15 locales:

| Locale | Language            | Direction |
| ------ | ------------------- | --------- |
| `en`   | English             | LTR       |
| `ja`   | Japanese            | LTR       |
| `id`   | Indonesian          | LTR       |
| `it`   | Italian             | LTR       |
| `pt`   | Portuguese (Brazil) | LTR       |
| `es`   | Spanish             | LTR       |
| `de`   | German              | LTR       |
| `ru`   | Russian             | LTR       |
| `fr`   | French              | LTR       |
| `zh`   | Simplified Chinese  | LTR       |
| `tw`   | Traditional Chinese | LTR       |
| `ko`   | Korean              | LTR       |
| `th`   | Thai                | LTR       |
| `vi`   | Vietnamese          | LTR       |
| `ar`   | Arabic              | RTL       |

## Service dependencies and desktop impact

| Dependency           | Original web behavior                                   | Desktop behavior                                                                                                       |
| -------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Flaq Open API        | Called from the browser with the configured client key  | Same API and forms; setup is presented as a first-run workflow                                                         |
| Media upload signing | Next.js server routes can read deployment `R2_*` values | Desktop prefers its packaged built-in R2 preset, falls back to Flaq-signed URLs, or signs a selected custom R2 locally |
| Image proxy          | Next.js GET route                                       | Desktop uses native HTTP media fetch; web keeps the original proxy                                                     |
| Next.js middleware   | Locale detection and URL rewriting                      | Desktop uses statically generated locale routes and a small launch redirect                                            |
| Browser storage      | Encrypted API configuration and local history           | Remembered Client Keys use native `auth.json`; other browser data remains in the isolated desktop WebView profile      |

## Desktop UX decisions

- The creation surface is primary; long SEO/marketing sections are moved behind a “tool guide” dialog in desktop mode.
- The desktop home is a compact workspace launcher instead of a marketing landing page.
- First launch opens a short Flaq connection checklist and routes directly into settings.
- External Flaq links open in the system browser.
- The original web presentation remains available when running the normal Next.js web build.

## Known issues inherited from the upstream template

The imported baseline contained TypeScript errors in an unused payment hook, a missing `SubHeading` icon import, React
19/Framer Motion inference, a frame-upload ref export, upload response typing, and Recharts tooltip typings. These are
tracked separately from the desktop conversion and are fixed in this repository so the desktop build can be validated
without relying on `ignoreBuildErrors`.
