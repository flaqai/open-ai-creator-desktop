![Flaq Open Media Creator](./docs/assets/flaq-open-media-creator-banner.png)

# Flaq Open Media Creator

Un’**app desktop open source per creare immagini e video con l’IA**, per creator, designer e team di brand. Riunisci
idee per prompt, riferimenti e una tela infinita per generare, visualizzare, perfezionare e organizzare i tuoi lavori in
locale.

Basata su [Flaq SaaS Template](https://github.com/flaqai/flaq-saas-template), collega i modelli Flaq AI tramite Tauri
2 + Rust e una moderna interfaccia React. L’app installata si chiama **Flaq Creator**.

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português (Brasil)](./README_pt.md) · [Español](./README_es.md) ·
[Deutsch](./README_de.md) · [Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) ·
[繁體中文](./README_tw.md) · [한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) ·
[العربية](./README_ar.md)

## Schermate dell’app desktop: spazio di lavoro, creazione AI e canvas infinito

Acquisite dall’app desktop macOS in esecuzione, con interfaccia in inglese. I pannelli di creazione mostrano bozze demo locali; le immagini della libreria di prompt sono esempi inclusi.

### Spazio di lavoro creativo — strumenti, ispirazione per i prompt e accesso rapido ai media

![Spazio di lavoro creativo — strumenti, ispirazione per i prompt e accesso rapido ai media](./docs/assets/screenshots/desktop-workspace.jpg)

### Creazione di immagini AI — prompt, modelli e impostazioni di generazione

![Creazione di immagini AI — prompt, modelli e impostazioni di generazione](./docs/assets/screenshots/desktop-ai-creator.jpg)

### Canvas infinito — organizza brief creativi e nodi di generazione

![Canvas infinito — organizza brief creativi e nodi di generazione](./docs/assets/screenshots/desktop-canvas.jpg)

### Ispirazione per i prompt — esplora esempi visivi e prompt riutilizzabili

![Ispirazione per i prompt — esplora esempi visivi e prompt riutilizzabili](./docs/assets/screenshots/desktop-prompt-library.jpg)

## Piattaforma di modelli Flaq AI e strumenti creativi online

[Flaq AI](https://flaq.ai/it/) riunisce importanti modelli per generazione e modifica di immagini, video e attività
linguistiche, per creator, sviluppatori e aziende.

- **API stabili ad alta concorrenza** — Integra la generazione IA nei prodotti e nei processi produttivi tramite un’API
  unificata.
- **Crea direttamente online** — Prova modelli e strumenti su [Flaq AI](https://flaq.ai/it/) nel browser, senza
  programmare né installare l’app.
- **Esplora e integra** — Confronta i modelli nel [catalogo](https://flaq.ai/it/model-market/) e consulta la
  [documentazione API](https://flaq.ai/it/docs/).

Contatti commerciali: [contact@flaq.ai](mailto:contact@flaq.ai)

## Funzioni desktop IA: dalle idee a immagini e video

### Generazione di immagini, video e prova virtuale degli abiti

Otto accessi supportano il lavoro quotidiano: esplora idee nello spazio unificato o scegli strumenti dedicati per
immagini di prodotti, contenuti social, concept pubblicitari e brevi video.

| Strumento            | Possibilità creative                                                   | Percorso              |
| -------------------- | ---------------------------------------------------------------------- | --------------------- |
| AI Media Creator     | Crea immagini e video insieme, esamina risultati e affina idee         | `/ai-media-creator`   |
| Tela infinita IA     | Organizza testi, media e impostazioni in un progetto locale salvato    | `/ai-canvas`          |
| Testo in immagine    | Esplora stili per copertine, poster e scene di prodotti tramite prompt | `/text-to-image`      |
| Immagine in immagine | Sviluppa stili e direzioni visive da immagini di riferimento           | `/image-to-image`     |
| Prova virtuale       | Combina riferimenti di abiti e modelli per moda e commercio            | `/virtual-try-on`     |
| Testo in video       | Trasforma idee scritte in scene animate e concept di campagna          | `/text-to-video`      |
| Immagine in video    | Crea presentazioni animate di prodotti e clip da immagini statiche     | `/image-to-video`     |
| Riferimenti in video | Guida la creazione video con media di riferimento                      | `/reference-to-video` |

I percorsi omettono il prefisso linguistico. Gli strumenti condividono il
[registro delle funzioni](./lib/features/catalog.ts). Input, limiti e parametri dipendono dal modello e dai
[contratti dei modelli](./lib/constants/template-models/).

### Ispirazione dai prompt e tela infinita

- **Parti dagli esempi**: esplora la libreria, copia prompt completi e ingrandisci o sposta le anteprime di
  immagini/video. Le immagini sono incluse; i video si riproducono online. Il nome di un modello nella raccolta non ne
  garantisce la presenza nei moduli di generazione.
- **Organizza visivamente i progetti**: disponi testi, media e impostazioni sulla tela; usa spostamento, zoom e nodi,
  salva localmente e riprendi in seguito.
- **Scegli modelli adatti**: regola i parametri supportati con l’aiuto contestuale. Guida iniziale e test di connessione
  facilitano la configurazione; aspetto e lingua adattano l’ambiente all’uso quotidiano.

### Libreria locale, bozze recuperabili ed esportazione

- **Trova riferimenti e lavori**: cerca riferimenti caricati e risultati per tipo e origine, visualizza, scarica e
  verifica l’archivio locale. Apri `/media-library` o Impostazioni → Cronologia.
- **Conserva i progressi**: bozze con prompt, parametri e media restano locali, insieme a cronologia e indici dei
  riferimenti. Il recupero interroga l’attività originale senza avviare un’altra generazione a pagamento.
- **Archivia i risultati**: immagini e video vengono salvati sotto `YYYY/MM/DD` in una cartella configurabile per
  montaggio e consegna. Il recupero riprova il salvataggio di risultati esistenti, senza rigenerare.
- **Prepara il passo successivo**: usa finestre native di salvataggio, esportazione PNG/JPEG/WebP e taglio con FFmpeg
  WASM caricato su richiesta.

### Flusso pratico per i creator

1. Esplora esempi o organizza testi e riferimenti sulla tela.
2. Scegli strumento e modello, poi imposta prompt, riferimenti e parametri disponibili.
3. Invia, esamina i risultati e perfeziona la generazione successiva.
4. Trova i risultati nella libreria e usa file archiviati o esportati nella produzione.

Servono rete, una Client Key Flaq AI valida e crediti sufficienti. I modelli operano nel cloud; bozze, progetti e indici
locali non offrono sincronizzazione cloud tra dispositivi.

## Avvio rapido: eseguire l’app e collegare Flaq AI

### Requisiti

- Node.js **22**, come in [.nvmrc](./.nvmrc).
- pnpm **10.5.2**, come `packageManager` in [package.json](./package.json).
- Rust e [prerequisiti Tauri](https://v2.tauri.app/start/prerequisites/) del sistema di destinazione per sviluppo e
  pacchetti nativi. Il solo frontend non richiede Rust.
- Account Flaq AI e Client Key per generazioni reali. Il caricamento predefinito **non** richiede un proprio account
  Cloudflare.

Dalla radice del repository:

```bash
pnpm install --frozen-lockfile
pnpm desktop:dev
```

Lo sviluppo usa `ai.flaq.creator.dev`; l’app installata `ai.flaq.creator`. Configurazioni, dati WebView e cartelle
predefinite dei media sono separati.

### Collegamento a Flaq AI

1. Accedi a [Flaq AI](https://flaq.ai/it/) e ottieni una Client Key.
2. Segui la guida iniziale o apri Impostazioni → Connessione.
3. Usa la Base URL `https://api.flaq.ai` o un gateway compatibile e affidabile.
4. Inserisci la chiave, verifica la connessione e salva.
5. Mantieni il provider integrato o configura esplicitamente un tuo profilo R2.
6. Scegli strumento e modello, inserisci prompt/riferimenti e invia. Gestisci i risultati in Impostazioni → Cronologia e
   la cartella archivio in Impostazioni → Generali.

> **Credenziali:** «Ricordami» salva JSON leggibile in `auth.json` nella cartella di configurazione dell’utente
> corrente. **Non usa il portachiavi del sistema né cifratura applicativa.** Su Unix i permessi sono limitati
> all’utente; le credenziali di sola sessione non finiscono in quel file nativo. Evita il salvataggio su dispositivi
> condivisi e non includere mai in commit chiavi, log con segreti o configurazioni locali.

### Caricamento dei media e archiviazione locale

| Ambito                | Implementazione attuale                                                                                                                                                             |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Caricamento integrato | La Client Key richiede URL firmati temporanei a `/api/v1/files/presignedUrl`, poi carica direttamente i media. Le credenziali R2 condivise restano sul server, fuori dal pacchetto. |
| R2 personalizzato     | ID account, bucket, chiave di accesso, segreto e dominio pubblico opzionali. Firma locale; profili AES-GCM nel WebView, non in una cassaforte di sistema.                           |
| Bozze                 | IndexedDB conserva byte e metadati; selezionare non carica il file. Il caricamento avviene all’invio.                                                                               |
| Cronologia e catalogo | Web Storage locale indicizza attività e riferimenti caricati. Le voci non conferiscono proprietà né diritti di cancellazione cloud.                                                 |
| File generati         | Salvataggio nativo in streaming nella radice configurata, per default nei dati dell’app. Un errore di archiviazione non annulla la generazione riuscita.                            |

R2 personalizzato richiede un dominio pubblico dei media, non solo l’endpoint S3. La conservazione dipende dalle
politiche Flaq o dal ciclo di vita del bucket; l’archivio locale è indipendente. La cifratura dei profili nel browser
non protegge da WebView compromessi o da chi accede a profilo e codice dell’app. Usa gateway e destinazioni affidabili.

### Modalità Web opzionale

Resta disponibile il Next.js originale con server:

```bash
pnpm dev
pnpm build
pnpm start
```

Apri `http://localhost:3000`. Per configurare il Web, copia [.env.example](./.env.example) in `.env.local` nell’editor e
compila solo i valori necessari.

| Variabili                                                                     | Utilizzo                                            |
| ----------------------------------------------------------------------------- | --------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CONTACT_US_EMAIL`                        | URL pubblico e contatti                             |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` | Credenziali solo server per firmare caricamenti Web |

Il Web usa `app/api/upload/presigned-url/route.ts` e il dominio pubblico configurato nell’hosting immagini. Il desktop
usa firme Flaq, senza variabili R2 locali né server API Next.js locale. Non anteporre `NEXT_PUBLIC_` ai segreti né
inserirli negli installer.

## Architettura desktop: Tauri 2, Rust e Next.js

**Tauri 2 + Rust ospita un’interfaccia Next.js esportata staticamente, senza server Node.js/Next.js incluso.** Desktop e
Web condividono pagine React, moduli, contratti, traduzioni e risorse grafiche.

### Tecnologia moderna per il lavoro creativo

- **Involucro nativo e UI statica**: Tauri 2 usa il WebView di sistema; Rust gestisce finestre, configurazione e file.
  Nessun server Node.js locale richiesto.
- **Tipi e validazione**: TypeScript, contratti condivisi e Zod allineano moduli e richieste API, riducendo
  incompatibilità e semplificando le integrazioni.
- **Attività asincrone e moduli su richiesta**: polling centralizzato e concorrenza limitata coordinano il lavoro.
  FFmpeg e firma R2 personalizzata si caricano quando servono, riducendo lavoro all’avvio.
- **Salvataggio affidabile**: Rust scarica in file temporanei prima di pubblicare quelli completi, riducendo risultati
  parziali dopo interruzioni. Stati distinti di generazione e archivio favoriscono il recupero.

### Privacy e sicurezza dei file: dati locali e caricamenti controllati

Flussi espliciti e verifiche d’accesso proteggono i materiali:

- **Bozze prima in locale**: IndexedDB conserva media e metadati. La selezione non carica nulla; l’invio della
  generazione avvia il caricamento.
- **Autorizzazione temporanea**: il provider ottiene URL firmati con la Client Key. I segreti R2 condivisi restano nel
  servizio, mai nel pacchetto.
- **Accesso per singolo file dalla tela**: il codice nativo risolve i percorsi reali e verifica che siano media
  archiviati in una directory consentita prima di autorizzarne l’anteprima.
- **Configurazioni separate**: sviluppo e installazione hanno ID e dati WebView distinti. Su Unix solo l’utente corrente
  può leggere e scrivere le connessioni memorizzate.

**Limiti della privacy:** archiviazione locale non significa elaborazione interamente offline o file cifrati. Prompt e
riferimenti pertinenti sono inviati ai servizi configurati; la conservazione remota dipende da servizio o bucket. Le
Client Key memorizzate sono JSON leggibile, non nel portachiavi. Vedi «Caricamento dei media e archiviazione locale».

### Stack tecnologico e struttura del codice

| Livello                    | Implementazione e responsabilità                                                        |
| -------------------------- | --------------------------------------------------------------------------------------- |
| UI                         | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Radix UI, Framer Motion               |
| Moduli e stato             | React Hook Form + Zod; Zustand; SWR dove utilizzato                                     |
| Contratti funzioni/modelli | Registro unico per otto strumenti; input, limiti e default condivisi                    |
| Servizi                    | Adattatori Flaq, politiche di caricamento, polling e ciclo generazione/archivio         |
| Confine piattaforma        | HTTP nativo/Web, export/salvataggio e link; UI senza chiamate native dirette            |
| Involucro nativo           | Tauri 2 / Rust: configurazione, permessi, finestre, log, streaming e salvataggi atomici |
| Localizzazione             | next-intl, 15 lingue registrate, arabo RTL                                              |
| Verifica                   | Regressioni Node/tsx, test Rust e layout Playwright, ESLint e TypeScript                |

```text
app/[locale]/       Pagine localizzate: strumenti, libreria, home e politiche
app/api/            Firma caricamenti e proxy immagini solo Web
components/         UI condivisa, desktop, moduli, dialoghi e visualizzatori media/prompt
hooks/              Integrazione UI e hook riutilizzabili
lib/features/       Registro funzioni
lib/constants/template-models/  Contratti modelli
lib/desktop/        Connessione, bozze, catalogo e preferenze media
lib/platform/       Adattatori nativi/Web
lib/recommended-prompts*        Definizioni e snapshot dei prompt selezionati
network/            Client API, caricamenti, polling, cronologia e ciclo di vita
store/              Stato Zustand condiviso
i18n/ + messages/   Lingue, routing e traduzioni
src-tauri/          Involucro Rust, capacità e configurazione pacchetti
scripts/            Build isolati, preparazione media, sincronizzazione e pubblicazione
tests/              Contratti, dati, recupero, build/release e regressioni UI
public/             Risorse app e immagini dei prompt incluse
docs/               Architettura, moduli, revisioni e banner README
```

I build desktop lavorano in una directory isolata, vi escludono le rotte Web e sostituiscono `out/` solo in caso di
successo, senza spostare o cancellare sorgenti. HTTP nativo gestisce API, caricamenti e download senza vincoli CORS del
browser. Firma AWS per R2 e FFmpeg locale si caricano su richiesta. Concorrenza dei caricamenti limitata, elaborazione
condivisa dei media serializzata e polling centralizzato.

Per nuovi moduli amplia registro e contratti, metti le API in `network/`, riusa `lib/platform/` e aggiungi traduzioni e
regressioni. Riferimenti:

- [Architettura e confini dei dati](./docs/DESKTOP_ARCHITECTURE.md)
- [Aggiunta di moduli e QA locale](./docs/ADDING_MODULES.md)
- [Vocabolario del dominio](./CONTEXT.md)
- [Inventario prodotto](./docs/PRODUCT_INVENTORY.md) e [rapporto di revisione](./docs/REVIEW_REPORT.md): fotografie di
  un momento, non garanzie di verifica della versione corrente.

## Build, test e pacchetti dell’app desktop

| Comando                                           | Scopo                                                            |
| ------------------------------------------------- | ---------------------------------------------------------------- |
| `pnpm desktop:dev`                                | Preparare media e avviare UI di sviluppo e app nativa            |
| `pnpm build:desktop`                              | Frontend statico in `out/`, tutte le lingue registrate           |
| `pnpm desktop:build`                              | Frontend e pacchetti nativi per il sistema corrente              |
| `pnpm check`                                      | TypeScript + regressioni Node + ESLint                           |
| `pnpm test:ui-layout`                             | Test layout Playwright; richiede Google Chrome e porta 3000      |
| `cargo test --manifest-path src-tauri/Cargo.toml` | Test Rust nativi; richiede dipendenze di build della piattaforma |
| `pnpm prompts:sync`                               | Manutenzione: aggiornare snapshot di prompt e risorse dalla rete |

Per simulare generazioni esegui `pnpm build:desktop`, poi `node scripts/desktop-preview.mjs`. Apri
`http://127.0.0.1:4173/zh/`, usa Base URL `http://127.0.0.1:4173` e `test-only-key` senza memorizzarla. Le API simulate
non verificano generazione Flaq reale, caricamenti R2 o comportamento nativo. Non usare chiavi reali.

### Stato dei pacchetti

Il [workflow di rilascio](./.github/workflows/desktop-build.yml) definisce:

| Destinazione        | Artefatti                                               |
| ------------------- | ------------------------------------------------------- |
| macOS Apple Silicon | `.dmg` e `.app` in ZIP                                  |
| macOS Intel         | `.dmg` e `.app` in ZIP                                  |
| Windows x64         | Installer NSIS `.exe`; niente MSI                       |
| Linux               | Compilabile dai sorgenti; escluso dalla matrice attuale |

Le esecuzioni manuali producono candidati; i tag corrispondenti `desktop-v<version>` avviano la pubblicazione. Inclusi
`SHA256SUMS` e `release-manifest.json`. I pacchetti sono attualmente non firmati; la distribuzione pubblica richiede
firma/notarizzazione specifica e verifiche native di avvio. Un workflow definito non dimostra build e test riusciti su
ogni piattaforma.

## Lingue supportate e localizzazione dell’interfaccia (i18n)

Registro e README coprono: `en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`, `ko`, `th`, `vi`, `ar`.

- Le rotte desktop includono sempre la lingua, anche `/en/`. Priorità: lingua salvata, sistema, inglese. Le varianti
  cinesi tradizionali corrispondono a `tw`.
- Il Web usa `/` per inglese e prefissi per le altre lingue. L’arabo usa RTL.
- **Limite attuale:** alcuni nuovi testi di impostazioni e librerie media/prompt sono scritti direttamente in cinese e
  inglese. `zh`/`tw` condividono il cinese; gli altri ricadono sull’inglese in questi pannelli. Quindici lingue
  registrate non significano ogni nuova stringa tradotta.
- Aggiungi lingue in [i18n/languages.ts](./i18n/languages.ts), `messages/`, routing/build, README e test di parità.

## Team Flaq AI: ingegneria IA e processi creativi

[Flaq AI](https://flaq.ai/it/) è gestita da **FLAQ AI PTE. LTD.**, registrata a Singapore. Il team combina design di
prodotto, ingegneria di modelli e API ed esperienza creativa per aiutare creator, sviluppatori e aziende a comprendere,
confrontare e usare l’IA.

Lavora su esperienze di modelli e strumenti, integrazione API e applicazioni pratiche di modelli per immagini, video,
audio e linguaggio, trasformando idee in processi produttivi utilizzabili.

Approfondimenti: [team e società Flaq AI](https://flaq.ai/about/). Contatti: [contact@flaq.ai](mailto:contact@flaq.ai).

## Affiliazione Flaq AI: condividi strumenti e guadagna commissioni

Diventa partner presentando processi IA per immagini/video, API e strumenti creativi. Sono benvenuti creator, designer,
sviluppatori, formatori IA, recensori di modelli e team che condividono applicazioni pratiche.

- **Premi per segnalazioni** — 20% sul primo ordine pagato valido e 10% sui successivi entro 60 giorni dalla
  registrazione, secondo idoneità e attribuzione.
- **Promozione flessibile** — Condividi il link in tutorial, recensioni, esempi creativi, comunità o guide API.
- **Spazio partner** — Gestisci link, attività delle segnalazioni e impostazioni di pagamento su Flaq AI.

Accedi, completa profilo e accordo di affiliazione, poi crea il link. Il progetto include accessi promozionali
localizzati; iscrizione e commissioni si gestiscono su Flaq AI, non nell’app desktop.

**[Partecipa al programma di affiliazione Flaq AI →](https://flaq.ai/it/affiliate-program/)**

> Idoneità, attribuzione, rimborsi, verifica dei pagamenti e accordi personalizzati approvati seguono le condizioni
> aggiornate della pagina ufficiale.

## Licenza

Progetto open source con [licenza MIT](LICENSE).
