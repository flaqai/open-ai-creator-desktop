# Desktop Architecture

## Boundaries

The Tauri 2 shell hosts a static Next.js UI, not a local Next.js server. The regular web build retains its API handlers
and marketing pages. Desktop and web share forms, model definitions, translations, and design assets.

| Layer             | Responsibility                                                  | Location                         |
| ----------------- | --------------------------------------------------------------- | -------------------------------- |
| Feature registry  | Seven tool identities, routes, navigation and workspace cards   | `lib/features/catalog.ts`        |
| Product UI        | Forms, previews, histories, dialogs, desktop onboarding         | `components/`                    |
| Model contracts   | Supported inputs, limits, parameters and defaults               | `lib/constants/template-models/` |
| Service adapters  | Flaq image/video contracts, upload orchestration and history    | `network/`                       |
| Task scheduling   | Deduplication, abort, retry, expiry; independent of React       | `network/polling-manager.ts`     |
| Platform adapters | Native/web HTTP, media fetch/save, image export, external links | `lib/platform/`                  |
| Native shell      | Permissions, OS save dialog, streaming/atomic media saves       | `src-tauri/`                     |

UI components must not invoke native commands, sign uploads, or implement their own polling loops. Reuse these
boundaries. See [Adding modules](ADDING_MODULES.md).

## Build modes and safety

- `pnpm dev` / `pnpm build`: normal web development/production, including Next.js API routes.
- `pnpm desktop:dev`: copies local FFmpeg assets, starts Next.js and opens Tauri.
- `pnpm build:desktop`: static export to `out/`, all 15 locales.
- `pnpm desktop:build`: static export and current-platform package.
- `pnpm check`: TypeScript, regression tests and ESLint.
- `node scripts/desktop-preview.mjs`: local-only static QA server with simulated image/video APIs.

Desktop builds run in a unique isolated staging directory. They never move/delete source routes. Only a successful
export replaces `out/`; a failed build preserves the previous usable output. Staging cleanup only removes its own
directory. TypeScript errors fail both build modes.

The root entry chooses the last language selected in the app, then a supported system language, then English.
Traditional Chinese variants map to `tw`. Routes always carry explicit locale prefixes.

FFmpeg JavaScript/WASM is copied from the installed, lockfile-pinned package into the desktop assets. It loads only when
trimming is requested. A serial queue protects the shared runtime and temporary media filenames.

## Network and media

Desktop HTTP(S) API requests, signed uploads and media fetches use the native HTTP adapter, avoiding browser CORS
dependence. Normal web requests retain the original server signing/proxy adapters. Desktop uploads use the original R2
flow: sign a PUT locally, upload the file directly to R2, then send only its public URL in the generation request. The
default provider reads the existing provisioned R2 configuration; users can select a separately stored custom R2
configuration. AWS signing code is lazy-loaded only when an upload or connection test needs it. Uploads validate all
signed rows before sending and run at most three transfers per batch, preserving reference order.

Newly completed desktop image and video results stream into the configured native media root under `YYYY/MM/DD` and
publish atomically only after successful completion. Stable task-based names make retries idempotent. The default root
is the platform application data directory and can be changed from General settings. Manual video downloads retain the
save dialog; image conversion changes actual PNG/JPEG/WebP bytes before manual export. Programmatic and anchor-based
external links use the system browser.

Broad HTTP(S) access is intentionally required for user-configured gateways and asset hosts. Embedded URL credentials
and non-HTTP(S) media downloads are rejected. Distribution hardening should review CSP and gateway allowlisting for the
deployment environment.

## Credentials and task recovery

Remembered API values and optional custom R2 values use versioned AES-GCM storage in the application-isolated WebView
profile. The non-secret upload-provider preference defaults to the provisioned Flaq R2 configuration. Custom R2 uses a
separate set of encrypted keys, so saving it cannot overwrite the default configuration. Both R2 configurations remain
untouched when only API connection data is cleared. New-format encryption is independent of browser version and locale.
The expensive derived key is cached; encryption failures never silently persist plaintext.

This is not an OS credential vault: a local attacker with profile access or injected JavaScript can compromise
credentials. Stronghold/Keychain/Credential Manager integration remains a release-hardening item. Never embed user keys
in source, environment defaults or installers.

Polling reserves a task before its first asynchronous request, carries abort signals, and cannot restart a stopped
timer. Missing session keys pause restoration rather than fail paid jobs. Older pending tasks are queried once before
applying the timeout, so completed results can be recovered after an overnight restart. Image/video scheduling policies
are centralized.

## Validation and release

Node regression tests cover API contracts, upload limits/order, configuration validation, storage preference switching,
cancellation, recovery, isolated build failure and model/language parity. Rust tests cover URL validation and real local
HTTP download success/failure protection. [Review report](REVIEW_REPORT.md) distinguishes automated checks, manual UI
checks and untested external/platform paths.

The desktop CI matrix builds macOS, Windows and Linux; it has not been executed merely by adding the workflow. Native
installers need target-OS build/smoke checks. Public distribution additionally requires macOS signing/notarization and
Windows signing credentials.
