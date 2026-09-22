# Flaq SaaS Template (Deutsch)

Kostenlose Open-Source-SaaS-Vorlage zum Aufbau von Plattformen für KI-Bild- und Videogenerierung mit der einheitlichen
Flaq.ai API.

## Über Flaq.ai

[Flaq.ai](https://flaq.ai/de/) ist eine KI-Modellplattform für Kreative und Entwickler. Ein einziger API-Schlüssel
ermöglicht einheitlichen Zugriff auf Bildgenerierung und -bearbeitung, Videogenerierung und Sprachmodelle.

- **Modelle entdecken und vergleichen** — Vergleiche Funktionen, unterstützte Parameter und aktuelle Preise im
  [Model Market](https://flaq.ai/model-market/).
- **Vor der Integration testen** — Probiere unterstützte Modelle im Flaq.ai Playground aus und verfeinere Prompts und
  Einstellungen.
- **Kreative Abläufe entwickeln** — Nutze die [API-Dokumentation](https://flaq.ai/docs/), um KI in eigene Produkte und
  Werkzeuge einzubinden.

Flaq Creator Desktop bündelt die Bild- und Videoabläufe in einem eigenen Desktop-Arbeitsbereich. Hinterlege deinen
Flaq.ai Client Key in der App, um visuelle Inhalte zu erstellen und zu verwalten. Nicht alle APIs der Plattform sind in
der Desktop-App verfügbar; verfügbare Modelle und Preise findest du auf Flaq.ai.

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português](./README_pt.md) · [Español](./README_es.md) · [Deutsch](./README_de.md) ·
[Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) · [繁體中文](./README_tw.md) ·
[한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) · [العربية](./README_ar.md)

## Über diese Vorlage

Erstellt mit Next.js 16, React 19, TypeScript und Tailwind CSS. Enthalten sind fünf einsatzbereite Abläufe:
Text-zu-Bild, Bild-zu-Bild, Text-zu-Video, Bild-zu-Video und virtuelle Anprobe.

### Wichtigste Funktionen

- 🎨 Seiten zur Bild- und Videogenerierung mit Modell- und Parameterauswahl
- 🔌 Flaq.ai-API-Integration mit einem einzigen Client Key
- 🧠 Unterstützung für Nano Banana Pro, Seedream, GPT Image, Grok Imagine, Veo, Wan, Kling, Seedance, Vidu und weitere
  Modelle
- 🌐 15 Sprachen für Oberfläche, Routing und alternative SEO-Links
- ☁️ Cloudflare-R2-Uploads und Speicherung generierter Dateien
- 🔒 Verschlüsselte clientseitige Speicherung des API-Schlüssels
- 📱 Responsive Oberfläche, Dark Mode und Generierungsverlauf

## Schnellstart

```bash
git clone https://github.com/flaqai/flaq-saas-template.git
cd flaq-saas-template
pnpm install
cp .env.example .env.local
pnpm dev
```

Setze `NEXT_PUBLIC_SITE_URL` in `.env.local` und ergänze bei Bedarf die Cloudflare-R2-Werte. Trage anschließend den
Client Key von [Flaq.ai](https://flaq.ai/de/) in den App-Einstellungen ein. Alle Variablen und Einrichtungsschritte
findest du in der [vollständigen englischen Dokumentation](./README.md#getting-started).

## Internationalisierung

Code und READMEs unterstützen dieselben 15 Locales: `en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`,
`ko`, `th`, `vi` und `ar`. Englisch verwendet `/`, andere Sprachen `/{locale}/`; Arabisch wird von rechts nach links
dargestellt.

## Flaq.ai-Partnerprogramm

Werde Affiliate-Partner von Flaq.ai und verdiene Provisionen, indem du KI-Bild- und Videoabläufe, Modell-APIs und
kreative Werkzeuge vorstellst. Willkommen sind Kreative, Designer, Entwickler, KI-Lehrende, Modelltester und Teams, die
praktische KI-Anwendungen teilen.

- **Empfehlungsvergütung** — Erhalte 20% auf die erste gültige bezahlte Bestellung eines geworbenen Nutzers und 10% auf
  weitere gültige bezahlte Bestellungen innerhalb von 60 Tagen nach seiner Registrierung. Es gelten die Teilnahme- und
  Zuordnungsregeln.
- **Flexible Werbung** — Teile deinen Empfehlungslink in Tutorials, Modelltests, kreativen Beispielen, Communitys oder
  API-Integrationsanleitungen.
- **Partnerbereich** — Verwalte Links, prüfe Empfehlungsaktivitäten und richte Auszahlungen auf Flaq.ai ein.

Melde dich bei Flaq.ai an, vervollständige dein Partnerprofil und bestätige die Vereinbarung, um deinen eigenen
Empfehlungslink zu erstellen. Das Projekt bietet auch lokalisierte Hinweise zum Programm; Anmeldung und
Provisionsverwaltung erfolgen auf Flaq.ai, nicht in der Desktop-App.

**[Am Flaq.ai-Partnerprogramm teilnehmen →](https://flaq.ai/de/affiliate-program/)**

> Für Provisionsberechtigung, Zuordnung, Erstattungen, Auszahlungsprüfung und genehmigte individuelle Vereinbarungen
> gelten die aktuellen Bedingungen auf der offiziellen Programmseite.

## Dokumentation und Lizenz

Vollständige Einrichtung, Technik-Stack und Deployment stehen in [README.md](./README.md) oder
[README_zh.md](./README_zh.md). Das Projekt steht unter der [MIT License](LICENSE).
