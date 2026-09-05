# Flaq SaaS Template (Deutsch)

Kostenlose Open-Source-SaaS-Vorlage zum Aufbau von Plattformen für KI-Bild- und Videogenerierung mit der einheitlichen
Flaq.ai API.

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

## Über Flaq.ai

[Flaq.ai](https://flaq.ai/de/) bündelt führende Bild- und Videogenerierungsmodelle hinter einer API und einer
einheitlichen Authentifizierung. API-Verbindung, Statusabfrage, Ergebnisanzeige und Downloads sind in dieser Vorlage
bereits implementiert.

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

## Flaq.ai-Partnerprogramm

Im [Flaq.ai-Partnerprogramm](https://flaq.ai/de/affiliate-program?utm_source=flaq-saas-template) erhältst du 20 %
Provision auf die erste gültige bezahlte Bestellung eines geworbenen Nutzers und 10 % auf weitere gültige bezahlte
Bestellungen innerhalb von 60 Tagen nach der Registrierung. Für Teilnahme und Auszahlung gelten die aktuellen
Bedingungen auf der Programmseite.

## Internationalisierung

Code und READMEs unterstützen dieselben 15 Locales: `en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`,
`ko`, `th`, `vi` und `ar`. Englisch verwendet `/`, andere Sprachen `/{locale}/`; Arabisch wird von rechts nach links
dargestellt.

## Dokumentation und Lizenz

Vollständige Einrichtung, Technik-Stack und Deployment stehen in [README.md](./README.md) oder
[README_zh.md](./README_zh.md). Das Projekt steht unter der [MIT License](LICENSE).
