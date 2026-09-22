# Flaq SaaS Template (Italiano)

Template SaaS gratuito e open source per creare piattaforme di generazione di immagini e video AI con l'API unificata di
Flaq.ai.

## Informazioni su Flaq.ai

[Flaq.ai](https://flaq.ai/it/) è una piattaforma di modelli AI per creatori e sviluppatori. Un'unica chiave API offre
accesso unificato alla generazione e modifica di immagini, alla generazione di video e ai modelli linguistici.

- **Esplora e confronta i modelli** — Consulta capacità, parametri supportati e prezzi attuali nel
  [Model Market](https://flaq.ai/model-market/).
- **Prova prima dell'integrazione** — Usa il Playground di Flaq.ai per testare i modelli supportati e perfezionare
  prompt e impostazioni.
- **Crea flussi di lavoro creativi** — Segui la [documentazione API](https://flaq.ai/docs/) per integrare l'AI nei tuoi
  prodotti e strumenti.

Flaq Creator Desktop porta i flussi di immagini e video in uno spazio di lavoro desktop dedicato. Collega il tuo Client
Key Flaq.ai nell'app per creare e gestire risorse visive. Non tutte le API della piattaforma sono disponibili nell'app
desktop; modelli e prezzi aggiornati sono indicati su Flaq.ai.

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português](./README_pt.md) · [Español](./README_es.md) · [Deutsch](./README_de.md) ·
[Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) · [繁體中文](./README_tw.md) ·
[한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) · [العربية](./README_ar.md)

## Informazioni sul template

Realizzato con Next.js 16, React 19, TypeScript e Tailwind CSS. Include cinque flussi pronti all'uso: testo-immagine,
immagine-immagine, testo-video, immagine-video e prova virtuale di abiti.

### Funzionalità principali

- 🎨 Pagine di generazione immagini e video con scelta di modello e parametri
- 🔌 Integrazione con l'API Flaq.ai tramite un unico Client Key
- 🧠 Supporto per Nano Banana Pro, Seedream, GPT Image, Grok Imagine, Veo, Wan, Kling, Seedance, Vidu e altri modelli
- 🌐 15 lingue per interfaccia, routing e link SEO alternativi
- ☁️ Upload su Cloudflare R2 e archiviazione degli asset generati
- 🔒 Memorizzazione cifrata della chiave API lato client
- 📱 UI responsive, modalità scura e cronologia delle generazioni

## Avvio rapido

```bash
git clone https://github.com/flaqai/flaq-saas-template.git
cd flaq-saas-template
pnpm install
cp .env.example .env.local
pnpm dev
```

Configura `NEXT_PUBLIC_SITE_URL` in `.env.local` e aggiungi, se necessario, i valori di Cloudflare R2. Inserisci poi il
Client Key di [Flaq.ai](https://flaq.ai/it/) dalle impostazioni dell'app. Per tutte le variabili e la procedura completa
consulta la [documentazione inglese](./README.md#getting-started).

## Internazionalizzazione

Codice e README supportano gli stessi 15 locale: `en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`, `ko`,
`th`, `vi` e `ar`. L'inglese usa `/`, le altre lingue `/{locale}/` e l'arabo viene visualizzato da destra a sinistra.

## Programma di affiliazione Flaq.ai

Diventa partner affiliato Flaq.ai e guadagna commissioni presentando flussi di immagini e video AI, API dei modelli e
strumenti creativi. Il programma accoglie creatori, designer, sviluppatori, formatori AI, recensori di modelli e team
che condividono flussi AI pratici.

- **Premi per le segnalazioni** — Guadagna il 20% sul primo ordine valido a pagamento di un utente segnalato e il 10%
  sui successivi ordini validi a pagamento entro 60 giorni dalla registrazione, secondo le regole di idoneità e
  attribuzione.
- **Promozione flessibile** — Condividi il tuo link in tutorial, recensioni, progetti creativi, community o guide di
  integrazione API.
- **Area partner** — Gestisci i link, verifica le attività di segnalazione e configura i pagamenti su Flaq.ai.

Accedi a Flaq.ai, completa il profilo e accetta l'accordo di affiliazione, quindi crea il tuo link personale. Il
progetto include anche inviti localizzati al programma; l'iscrizione e la gestione delle commissioni avvengono su
Flaq.ai, non nell'app desktop.

**[Partecipa al programma di affiliazione Flaq.ai →](https://flaq.ai/it/affiliate-program/)**

> Idoneità alle commissioni, attribuzione, rimborsi, verifica dei pagamenti e accordi personalizzati approvati sono
> regolati dalle condizioni aggiornate della pagina ufficiale.

## Documentazione e licenza

Per configurazione completa, stack tecnico e deployment consulta [README.md](./README.md) o
[README_zh.md](./README_zh.md). Il progetto è distribuito con [MIT License](LICENSE).
