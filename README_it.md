![Flaq Open Media Creator](./docs/assets/flaq-open-media-creator-banner.png)

# Flaq Open Media Creator (Italiano)

Uno spazio di lavoro desktop open source per creare immagini e video IA, derivato da Flaq SaaS Template. Il nome
dell’app installata rimane Flaq Creator.

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português (Brasil)](./README_pt.md) · [Español](./README_es.md) ·
[Deutsch](./README_de.md) · [Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) ·
[繁體中文](./README_tw.md) · [한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) ·
[العربية](./README_ar.md)

## Informazioni su Flaq AI

[Flaq AI](https://flaq.ai/it/) è una piattaforma di IA per creatori, sviluppatori e aziende che riunisce i principali
modelli di IA più diffusi per generare e modificare immagini, creare video e svolgere attività linguistiche.

- **API ad alta concorrenza e stabilità** — Integra la generazione IA nei prodotti e nei flussi di produzione tramite
  un’API unificata.
- **Utilizzo diretto online** — Usa modelli e strumenti creativi su [Flaq AI](https://flaq.ai/it/) nel browser, senza
  scrivere codice o installare l’app desktop.
- **Esplora e integra i modelli** — Confronta le funzionalità nel
  [catalogo dei modelli](https://flaq.ai/it/model-market/) e inizia con la
  [documentazione API](https://flaq.ai/it/docs/).

Contatti commerciali: [contact@flaq.ai](mailto:contact@flaq.ai)

## Implementazione attuale

Tauri 2 e Rust ospitano una UI statica Next.js 16 e React 19, senza server Node.js/Next.js incorporato. Moduli,
contratti dei modelli e design sono condivisi con la versione web.

Sette ingressi: AI Media Creator, testo-immagine, immagine-immagine, prova abiti virtuale, testo-video, immagine-video e
riferimenti-video. Sono disponibili libreria di prompt, catalogo multimediale ricercabile, cronologia nelle
impostazioni, bozze IndexedDB e archivi locali per data. Le immagini di esempio sono incluse; i video vengono riprodotti
online. Generazione e archiviazione hanno stati di successo separati.

## Avvio rapido

Esegui dalla radice di questo repository. Servono Node.js 22, pnpm 10.5.2, Rust e le dipendenze Tauri del sistema
operativo. In Impostazioni → Connessione inserisci il Client Key Flaq AI, verifica e salva. Base URL predefinito:
`https://api.flaq.ai`. La generazione reale richiede Internet e crediti API.

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

## Caricamenti e credenziali

Il caricamento predefinito ottiene URL firmati temporanei da Flaq `/api/v1/files/presignedUrl`. Le credenziali R2
condivise restano sul server; non serve un account Cloudflare personale. R2 personalizzato è facoltativo e usa firma
locale. I preset AES-GCM nel WebView non sono un archivio protetto del sistema. Ricordando la chiave, il Client Key
viene salvato in chiaro in `auth.json` nella directory di configurazione dell’app.

## Piattaforme e lingue

La configurazione di rilascio include macOS Apple Silicon/Intel (DMG, ZIP) e Windows x64 (NSIS EXE). Linux è compilabile
dai sorgenti ma non è nella matrice di rilascio. I pacchetti attuali non sono firmati. Sono registrate 15 lingue, ma
alcuni nuovi pannelli di impostazioni, media e prompt sono solo in cinese/inglese: `zh`/`tw` condividono il cinese, gli
altri usano l’inglese. Il desktop usa sempre prefissi, incluso `/en/`; il Web usa `/` per l’inglese e prefissi per gli
altri. L’arabo usa RTL.

`en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`, `ko`, `th`, `vi`, `ar`

## Programma di affiliazione Flaq AI

Diventa partner affiliato Flaq AI e guadagna commissioni presentando flussi di immagini e video AI, API dei modelli e
strumenti creativi. Il programma accoglie creatori, designer, sviluppatori, formatori AI, recensori di modelli e team
che condividono flussi AI pratici.

- **Premi per le segnalazioni** — Guadagna il 20% sul primo ordine valido a pagamento di un utente segnalato e il 10%
  sui successivi ordini validi a pagamento entro 60 giorni dalla registrazione, secondo le regole di idoneità e
  attribuzione.
- **Promozione flessibile** — Condividi il tuo link in tutorial, recensioni, progetti creativi, community o guide di
  integrazione API.
- **Area partner** — Gestisci i link, verifica le attività di segnalazione e configura i pagamenti su Flaq AI.

Accedi a Flaq AI, completa il profilo e accetta l'accordo di affiliazione, quindi crea il tuo link personale. Il
progetto include anche inviti localizzati al programma; l'iscrizione e la gestione delle commissioni avvengono su Flaq
AI, non nell'app desktop.

**[Partecipa al programma di affiliazione Flaq AI →](https://flaq.ai/it/affiliate-program/)**

> Idoneità alle commissioni, attribuzione, rimborsi, verifica dei pagamenti e accordi personalizzati approvati sono
> regolati dalle condizioni aggiornate della pagina ufficiale.

## Documentazione e licenza

Per configurazione completa, stack tecnico e deployment consulta [README.md](./README.md) o
[README_zh.md](./README_zh.md). Il progetto è distribuito con [MIT License](LICENSE).
