![Flaq Open Media Creator](./docs/assets/flaq-open-media-creator-banner.png)

# Flaq Open Media Creator (Deutsch)

Ein quelloffener Desktop-Arbeitsbereich für KI-Bilder und -Videos auf Basis des Flaq SaaS Template. Die installierte App
heißt weiterhin Flaq Creator.

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português (Brasil)](./README_pt.md) · [Español](./README_es.md) ·
[Deutsch](./README_de.md) · [Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) ·
[繁體中文](./README_tw.md) · [한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) ·
[العربية](./README_ar.md)

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

## Aktuelle Umsetzung

Tauri 2 und Rust laden eine statische Oberfläche aus Next.js 16 und React 19, ohne eingebetteten
Node.js-/Next.js-Server. Formulare, Modellverträge und Design werden mit der Web-Version geteilt.

Sieben Einstiege: AI Media Creator, Text-zu-Bild, Bild-zu-Bild, virtuelle Anprobe, Text-zu-Video, Bild-zu-Video und
Referenz-zu-Video. Dazu kommen Prompt-Bibliothek, durchsuchbarer Medienkatalog, Verlauf in den Einstellungen,
IndexedDB-Entwürfe und lokale Datumsarchive. Beispielbilder sind enthalten; Beispielvideos werden online abgespielt.
Erfolgreiche Generierung und Archivierung sind getrennte Zustände.

## Schnellstart

Im Stammverzeichnis dieses Repositorys ausführen. Voraussetzungen: Node.js 22, pnpm 10.5.2, Rust und die
Tauri-Abhängigkeiten des Betriebssystems. Unter Einstellungen → Verbindung den Flaq.ai Client Key eintragen, testen und
speichern. Standard-Base-URL: `https://api.flaq.ai`. Echte Generierung benötigt Internet und API-Guthaben.

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

## Uploads und Zugangsdaten

Standarduploads erhalten kurzlebige signierte URLs über Flaq `/api/v1/files/presignedUrl`. Gemeinsame R2-Zugangsdaten
bleiben auf dem Server; ein eigenes Cloudflare-Konto ist nicht nötig. Eigenes R2 ist optional und wird lokal signiert.
AES-GCM-Presets im WebView sind kein Betriebssystem-Tresor. Beim Merken wird der Client Key als Klartext in `auth.json`
im App-Konfigurationsverzeichnis gespeichert.

## Plattformen und Sprachen

Die Release-Konfiguration umfasst macOS Apple Silicon/Intel (DMG, ZIP) und Windows x64 (NSIS EXE). Linux ist ein
Quellcode-Build-Ziel, nicht Teil der Release-Matrix. Pakete sind derzeit unsigniert. Es gibt 15 registrierte
Sprachvarianten, aber Teile neuer Einstellungs-, Medien- und Prompt-Panels sind nur chinesisch/englisch: `zh`/`tw`
teilen chinesische Texte, andere verwenden Englisch. Desktop-Routen haben immer ein Sprachpräfix, auch `/en/`;
Web-Englisch nutzt `/`, andere Sprachen Präfixe. Arabisch verwendet RTL.

`en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`, `ko`, `th`, `vi`, `ar`

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
