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
- `pnpm desktop:dev`: copies local FFmpeg assets, starts Next.js and opens Tauri with the isolated `ai.flaq.creator.dev`
  identity. Development WebView storage, IndexedDB, logs, window state, and the default media directory therefore remain
  separate from the installed `ai.flaq.creator` app.
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
dependence. Normal web requests retain the original server signing/proxy adapters. The built-in Flaq storage provider
uses the configured Client Key to request at most ten 60-second PUT URLs from `/api/v1/files/presignedUrl`; shared R2
credentials remain on the Flaq service and are never packaged with the application. Users can alternatively select a
separately stored custom R2 configuration, which is signed locally. AWS signing code is lazy-loaded until that custom
path is selected. Uploads validate every signed row before sending, run at most three transfers per batch and preserve
reference order. A failed transfer rejects the batch; successful objects from an earlier transfer are not deleted
automatically.

Preview object URLs are session-only views over in-memory files and never become durable form values. Desktop drafts
store media as owned ArrayBuffer bytes plus file metadata in IndexedDB; this avoids WebKit's external Blob references
becoming unreadable after a restart. Version 1 Blob drafts migrate on read. If WebKit can no longer read an old Blob,
the migration keeps the prompt and parameters, removes only that media value and asks the user to select it once more.
R2 upload starts only when generation is submitted. A custom R2 PUT signature lasts one hour; uploaded-object retention
is controlled by the bucket lifecycle. Built-in Flaq retention remains a server policy.

Newly completed desktop image and video results stream into the configured native media root under `YYYY/MM/DD` and
publish atomically only after successful completion. Stable task-based names make retries idempotent. The default root
is the platform application data directory and can be changed from General settings. Manual video downloads retain the
save dialog; image conversion changes actual PNG/JPEG/WebP bytes before manual export. Programmatic and anchor-based
external links use the system browser.

Broad HTTP(S) access is intentionally required for user-configured gateways and asset hosts. Embedded URL credentials
and non-HTTP(S) media downloads are rejected. Distribution hardening should review CSP and gateway allowlisting for the
deployment environment.

## Credentials and task recovery

Remembered desktop API values are stored as readable, versioned JSON in `auth.json` under the native application
configuration directory. They do not use macOS Keychain, Windows Credential Manager, Linux Secret Service or application
encryption. The application identifier separates development and installed data, while changing the WebView hostname or
port no longer changes the credential location. Native writes use a private temporary file, publish atomically where the
platform permits, and are read back before the UI reports success. On Unix, the directory and file retain `0700` and
`0600` permissions. Session-only credentials never reach the native file. The web-preview adapter retains versioned
encrypted Web Storage and migrates current-origin remembered values when the native store is empty.

Optional custom R2 values still use versioned AES-GCM storage in the application-isolated WebView profile. The
non-secret upload-provider preference defaults to the built-in Flaq R2 strategy. Custom R2 uses a separate set of
encrypted keys, so saving it cannot overwrite the default configuration. Both legacy and custom R2 values remain
untouched when only API connection data is cleared. New-format browser encryption is independent of browser version and
locale. The expensive derived key is cached; encryption failures never silently persist plaintext.

The built-in storage path never receives shared R2 credentials. It only receives short-lived signed upload URLs and the
corresponding public asset URLs from Flaq. Release builds therefore do not require R2 secrets or a client-side
encryption key. Custom R2 remains an explicit user-owned alternative with the weaker WebView storage threat model
described above.

The native `auth.json` is deliberately readable by the local user and is not a credential vault. Injected JavaScript can
also observe a key while the app is using it for a request. Custom R2 browser storage has the weaker WebView threat
model described above. Never embed user keys in source, environment defaults or installers.

Polling reserves a task before its first asynchronous request, carries abort signals, and cannot restart a stopped
timer. Missing session keys pause restoration rather than fail paid jobs. Older pending tasks are queried once before
applying the timeout, so completed results can be recovered after an overnight restart. Image/video scheduling policies
are centralized.

## Validation and release

Node regression tests cover API contracts, upload limits/order, configuration validation, storage preference switching,
cancellation, recovery, isolated build failure and model/language parity. Rust tests cover URL validation and real local
HTTP download success/failure protection. [Review report](REVIEW_REPORT.md) distinguishes automated checks, manual UI
checks and untested external/platform paths.

The desktop CI matrix packages macOS and Windows installers after an Ubuntu preflight build; it has not been executed
merely by adding the workflow. Native installers need target-OS build/smoke checks. Public distribution additionally
requires macOS signing/notarization and Windows signing credentials.
