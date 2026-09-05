# Flaq SaaS Template (Italiano)

Template SaaS gratuito e open source per creare piattaforme di generazione di immagini e video AI con l'API unificata di
Flaq.ai.

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

## Informazioni su Flaq.ai

[Flaq.ai](https://flaq.ai/it/) rende disponibili i principali modelli di generazione di immagini e video tramite
un'unica API e un sistema di autenticazione coerente. Il template implementa già connessione API, polling dello stato,
visualizzazione dei risultati e download.

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

## Programma di affiliazione Flaq.ai

Con il [Programma di affiliazione Flaq.ai](https://flaq.ai/it/affiliate-program?utm_source=flaq-saas-template) puoi
guadagnare il 20% sul primo ordine valido a pagamento di un utente segnalato e il 10% sui successivi ordini validi
effettuati entro 60 giorni dalla registrazione. Idoneità e pagamenti seguono i termini aggiornati della pagina del
programma.

## Internazionalizzazione

Codice e README supportano gli stessi 15 locale: `en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`, `ko`,
`th`, `vi` e `ar`. L'inglese usa `/`, le altre lingue `/{locale}/` e l'arabo viene visualizzato da destra a sinistra.

## Documentazione e licenza

Per configurazione completa, stack tecnico e deployment consulta [README.md](./README.md) o
[README_zh.md](./README_zh.md). Il progetto è distribuito con [MIT License](LICENSE).
