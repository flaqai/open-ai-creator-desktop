![Flaq Open Media Creator](./docs/assets/flaq-open-media-creator-banner.png)

# Flaq Open Media Creator

Eine quelloffene **Desktop-App für KI-Bild- und Videokreation** für Kreative, Designer und Markenteams. Prompt-Ideen,
Referenzmedien und eine unendliche Arbeitsfläche kommen zusammen, um Inhalte zu generieren, anzusehen, zu verfeinern und
lokal zu organisieren.

Die App basiert auf dem [Flaq SaaS Template](https://github.com/flaqai/flaq-saas-template) und verbindet
Flaq-AI-Modelldienste mit einer Tauri-2-/Rust-Desktop-Hülle und moderner React-Oberfläche. Die installierte App heißt
**Flaq Creator**.

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português (Brasil)](./README_pt.md) · [Español](./README_es.md) ·
[Deutsch](./README_de.md) · [Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) ·
[繁體中文](./README_tw.md) · [한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) ·
[العربية](./README_ar.md)

## Flaq AI: Modellplattform und kreative Online-Werkzeuge

[Flaq AI](https://flaq.ai/de/) bündelt führende Modelle für Bilderzeugung und -bearbeitung, Videogenerierung und
Sprachaufgaben für Kreative, Entwickler und Unternehmen.

- **Stabile APIs mit hoher Parallelität** — KI-Generierung über eine einheitliche API in Produkte und Produktionsabläufe
  integrieren.
- **Direkt online gestalten** — Modelle und Werkzeuge im Browser auf [Flaq AI](https://flaq.ai/de/) ausprobieren, ohne
  Programmierung oder Desktop-Installation.
- **Entdecken und integrieren** — Modelle im [Modellkatalog](https://flaq.ai/de/model-market/) vergleichen und mit der
  [API-Dokumentation](https://flaq.ai/de/docs/) einsteigen.

Geschäftliche Anfragen: [contact@flaq.ai](mailto:contact@flaq.ai)

## KI-Desktop-Funktionen: von der Idee zu Bildern und Videos

### KI-Bilderzeugung, Videokreation und virtuelle Anprobe

Acht Einstiege unterstützen die tägliche Gestaltung. Im gemeinsamen Arbeitsbereich lassen sich Ideen erkunden;
spezialisierte Werkzeuge helfen bei Produktbildern, Social-Media-Inhalten, Kampagnenentwürfen und Kurzvideos.

| Werkzeug                    | Kreative Möglichkeiten                                                                    | Route                 |
| --------------------------- | ----------------------------------------------------------------------------------------- | --------------------- |
| AI Media Creator            | Bilder und Videos gemeinsam erstellen, Ergebnisse prüfen und Ideen verfeinern             | `/ai-media-creator`   |
| Unendliche KI-Arbeitsfläche | Texte, Medien und Generierungseinstellungen in einem gespeicherten lokalen Projekt ordnen | `/ai-canvas`          |
| Text zu Bild                | Stile für Titelbilder, Plakate und Produktszenen anhand von Prompts erkunden              | `/text-to-image`      |
| Bild zu Bild                | Neue Stile und Bildrichtungen aus Referenzbildern entwickeln                              | `/image-to-image`     |
| Virtuelle Anprobe           | Kleidungs- und Modelreferenzen für Mode- und Handelskonzepte kombinieren                  | `/virtual-try-on`     |
| Text zu Video               | Schriftliche Ideen in bewegte Szenen und Kampagnenkonzepte umsetzen                       | `/text-to-video`      |
| Bild zu Video               | Standbilder für animierte Produktdarstellungen und Clips nutzen                           | `/image-to-video`     |
| Referenz zu Video           | Videogenerierung mit Referenzmedien steuern                                               | `/reference-to-video` |

Die Routen sind ohne Sprachpräfix angegeben. Werkzeuge teilen sich das [Funktionsregister](./lib/features/catalog.ts).
Eingaben, Grenzen und Parameter hängen vom Modell und den [Modellverträgen](./lib/constants/template-models/) ab.

### Prompt-Inspiration und unendliche Arbeitsfläche

- **Mit Beispielen beginnen**: Prompt-Medienbibliothek durchsuchen, vollständige Prompts kopieren und
  Bild-/Videovorschauen vergrößern und verschieben. Beispielbilder sind enthalten, Videos werden online abgespielt. Eine
  Modellbezeichnung in einer Sammlung garantiert keine Unterstützung im Generierungsformular.
- **Projekte visuell ordnen**: Texte, Medien und Einstellungen auf der Arbeitsfläche anordnen, verschieben, zoomen und
  Knoten bearbeiten. Lokale Projekte speichern und später weiterführen.
- **Passende Modelle wählen**: unterstützte Parameter mit kontextbezogener Hilfe einstellen. Einführungsassistent und
  Verbindungstest erleichtern die Einrichtung; Darstellung und Sprache passen den Arbeitsplatz an den Alltag an.

### Lokale Medienbibliothek, wiederherstellbare Entwürfe und Export

- **Referenzen und Werke finden**: hochgeladene Referenzen und Ergebnisse nach Typ und Herkunft suchen, ansehen,
  herunterladen und den lokalen Archivstatus prüfen. Über `/media-library` oder Einstellungen → Verlauf erreichbar.
- **Fortschritt behalten**: Entwürfe speichern Prompts, Parameter und Medien lokal; Aufgabenverlauf und Referenzindizes
  bleiben auf dem Gerät. Die Wiederherstellung fragt die ursprüngliche Aufgabe ab und startet keine weitere
  kostenpflichtige Generierung.
- **Ergebnisse archivieren**: Bilder und Videos unter `YYYY/MM/DD` in einem wählbaren Ordner für Bearbeitung und
  Übergabe speichern. Die Archivwiederherstellung speichert vorhandene Ergebnisse erneut, ohne neue Generierung.
- **Medien weiterverwenden**: native Speicherdialoge, PNG/JPEG/WebP-Export und bei Bedarf geladenes FFmpeg WASM zum
  Zuschneiden nutzen.

### Praktischer Ablauf für Kreative

1. Prompt-Beispiele erkunden oder Texte und Referenzen auf der Arbeitsfläche ordnen.
2. Werkzeug und Modell wählen, Prompt, Referenzen und verfügbare Parameter festlegen.
3. Absenden, Ergebnisse ansehen und die nächste Generierung verfeinern.
4. Ergebnisse in der Bibliothek finden und archivierte oder exportierte Dateien weiterverarbeiten.

Generierung erfordert Internet, einen gültigen Flaq AI Client Key und ausreichendes Guthaben. Modelle laufen in der
Cloud; lokale Entwürfe, Projekte und Medienindizes bieten keine geräteübergreifende Cloud-Synchronisierung.

## Einstieg: Desktop-App starten und Flaq AI verbinden

### Voraussetzungen

- Node.js **22** entsprechend [.nvmrc](./.nvmrc).
- pnpm **10.5.2** entsprechend `packageManager` in [package.json](./package.json).
- Rust und die [Tauri-Voraussetzungen](https://v2.tauri.app/start/prerequisites/) des Zielsystems für native Entwicklung
  und Pakete. Ein reiner Frontend-Build benötigt kein Rust.
- Flaq-AI-Konto und Client Key für echte Generierung. Der Standard-Upload erfordert **kein** eigenes Cloudflare-Konto.

Im Stammverzeichnis des Repositorys:

```bash
pnpm install --frozen-lockfile
pnpm desktop:dev
```

Entwicklung verwendet `ai.flaq.creator.dev`, die installierte App `ai.flaq.creator`. Konfiguration, WebView-Daten und
Standard-Medienverzeichnisse sind getrennt.

### Flaq AI verbinden

1. Bei [Flaq AI](https://flaq.ai/de/) anmelden und einen Client Key erhalten.
2. Der Einführung folgen oder Einstellungen → Verbindung öffnen.
3. Die Base URL `https://api.flaq.ai` oder ein kompatibles, vertrauenswürdiges Gateway verwenden.
4. Schlüssel eingeben, Verbindung testen und speichern.
5. Den integrierten Upload-Anbieter beibehalten oder ausdrücklich ein eigenes R2-Profil konfigurieren.
6. Werkzeug und Modell wählen, Prompt/Referenzen eingeben und absenden. Ergebnisse unter Einstellungen → Verlauf
   verwalten; Archivordner unter Einstellungen → Allgemein ändern.

> **Zugangsdaten:** „Angemeldet bleiben“ speichert lesbares JSON in `auth.json` im Konfigurationsverzeichnis des
> aktuellen Benutzers. Das ist **weder der System-Schlüsselbund noch eine Verschlüsselung auf Anwendungsebene**.
> Unix-Rechte sind auf den aktuellen Benutzer beschränkt; reine Sitzungsdaten werden nicht in diese native Datei
> geschrieben. Auf gemeinsam genutzten Geräten keine Schlüssel merken lassen. Schlüssel, geheime Logdaten und lokale
> Konfiguration niemals committen.

### Medien-Uploads und lokale Datenspeicherung

| Bereich             | Aktuelle Umsetzung                                                                                                                                                                                 |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Integrierter Upload | Der Client Key fordert kurzlebige signierte URLs bei `/api/v1/files/presignedUrl` an; Medien werden direkt hochgeladen. Gemeinsame R2-Zugangsdaten bleiben auf dem Server und sind nicht im Paket. |
| Eigenes R2          | Optionale Konto-ID, Bucket, Zugriffs-/Geheimschlüssel und öffentliche Mediendomain. Lokale Signierung; Profile mit AES-GCM im WebView, nicht im System-Tresor.                                     |
| Eingabeentwürfe     | IndexedDB speichert Bytes und Metadaten. Dateiauswahl lädt nichts hoch; der Upload beginnt beim Absenden.                                                                                          |
| Verlauf und Katalog | Lokaler Web Storage indiziert Aufgaben und hochgeladene Referenzen. Einträge verleihen weder Eigentum noch Cloud-Löschrechte.                                                                      |
| Generierte Dateien  | Natives Streaming in das konfigurierte Medienverzeichnis, standardmäßig die App-Daten. Ein Archivfehler macht eine erfolgreiche Generierung nicht erfolglos.                                       |

Eigenes R2 benötigt eine öffentlich erreichbare Mediendomain, nicht nur den S3-Endpunkt. Aufbewahrung folgt der
Flaq-Richtlinie oder dem Bucket-Lebenszyklus; lokale Archive sind unabhängig. Browserseitige Profilverschlüsselung
schützt nicht vor kompromittiertem WebView oder Angreifern mit Zugriff auf App-Profil und Code. Nur vertrauenswürdige
Gateways und Upload-Ziele verwenden.

### Optionaler Webmodus

Der ursprüngliche Next.js-Webmodus mit Server bleibt erhalten:

```bash
pnpm dev
pnpm build
pnpm start
```

`http://localhost:3000` öffnen. Bei Bedarf [.env.example](./.env.example) im Editor nach `.env.local` kopieren und nur
benötigte Werte eintragen.

| Variablen                                                                     | Zweck                                                               |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CONTACT_US_EMAIL`                        | Öffentliche Website-URL und Kontaktangaben                          |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` | Ausschließlich serverseitige Zugangsdaten für Web-Upload-Signaturen |

Web-Uploads nutzen `app/api/upload/presigned-url/route.ts` und die öffentliche Domain aus dem Bildhosting. Der
Desktop-Standard nutzt Flaq-Signaturen und benötigt weder lokale R2-Variablen noch einen lokalen Next.js-API-Server.
Geheimnisse niemals mit `NEXT_PUBLIC_` kennzeichnen oder in Installer aufnehmen.

## Desktop-Architektur: Tauri 2, Rust und Next.js

**Tauri 2 + Rust lädt eine statisch exportierte Next.js-Oberfläche, ohne eingebauten Node.js-/Next.js-Server.** Desktop
und Web teilen React-Seiten, Formulare, Modellverträge, Übersetzungen und Designressourcen.

### Moderne Technik für den kreativen Alltag

- **Native Hülle und statische Oberfläche**: Tauri 2 verwendet den System-WebView; Rust übernimmt Fenster, Konfiguration
  und Speichern. Kein lokaler Node.js-Server erforderlich.
- **Typen und Eingabeprüfung**: TypeScript, gemeinsame Modellverträge und Zod stimmen Formulare und API-Anfragen ab,
  reduzieren Parameterfehler und erleichtern Modellintegration.
- **Asynchrone Aufgaben und bedarfsgesteuerte Module**: zentrales Polling und begrenzte Upload-Parallelität koordinieren
  die Arbeit. FFmpeg und eigene R2-Signierung laden bei Bedarf, um unnötige Startarbeit zu vermeiden.
- **Zuverlässige Speicherung**: Rust lädt zunächst in temporäre Dateien und veröffentlicht erst fertige Dateien. Das
  reduziert unvollständige Ergebnisse nach Abbrüchen; getrennte Generierungs- und Archivzustände ermöglichen
  Wiederherstellung.

### Datenschutz und Dateisicherheit: lokale Daten und kontrollierte Uploads

Klare Datenflüsse und Zugriffsprüfungen schützen kreative Materialien:

- **Entwürfe zunächst lokal**: IndexedDB speichert Medien und Metadaten; erst das Absenden der Generierung startet den
  Upload.
- **Kurzlebige Upload-Freigabe**: signierte URLs werden mit dem Client Key angefordert. Gemeinsame R2-Geheimnisse
  bleiben beim Dienst und werden nicht mitgeliefert.
- **Dateibezogener Canvas-Zugriff**: nativer Code löst echte Pfade auf und prüft auf archivierte Medien in erlaubten
  Ausgabeordnern, bevor er die Vorschau für diese Datei freigibt.
- **Getrennte Konfiguration**: Entwicklung und installierte App haben unterschiedliche IDs und WebView-Daten. Unter Unix
  darf nur der aktuelle Benutzer gespeicherte Verbindungsdateien lesen und schreiben.

**Datenschutzgrenzen:** lokale Speicherung bedeutet weder vollständig offline noch verschlüsselte Dateien. Generierung
sendet relevante Prompts und Referenzen an konfigurierte Dienste; deren Richtlinien oder Bucket-Regeln bestimmen die
Aufbewahrung. Gespeicherte Client Keys liegen als lesbares JSON statt im System-Schlüsselbund vor. Details stehen oben
unter „Medien-Uploads und lokale Datenspeicherung“.

### Technologiestapel und Quellstruktur

| Ebene                     | Umsetzung und Verantwortung                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| Oberfläche                | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Radix UI, Framer Motion                   |
| Formulare und Zustand     | React Hook Form + Zod; Zustand; teilweise SWR                                               |
| Funktions-/Modellverträge | Register für acht Werkzeuge; gemeinsame Eingaben, Grenzen und Vorgaben                      |
| Dienste                   | Flaq-Adapter, Upload-Richtlinie, zentrales Polling und Generierungs-/Archivlebenszyklus     |
| Plattformgrenze           | Natives/Web-HTTP, Export/Speichern, externe Links; UI ruft keine nativen Befehle direkt auf |
| Native Hülle              | Tauri 2 / Rust: Konfiguration, Rechte, Fenster, Logs, Streaming und atomisches Speichern    |
| Lokalisierung             | next-intl, 15 registrierte Sprachen, Arabisch RTL                                           |
| Prüfung                   | Node/tsx-Regressionen, Rust-Tests, Playwright-Layouttests, ESLint und TypeScript            |

```text
app/[locale]/       Lokalisierte Werkzeug-, Bibliotheks-, Start- und Richtlinienseiten
app/api/            Web-exklusive Upload-Signierung und Bildproxy
components/         Gemeinsame UI, Desktop-Hülle, Formulare, Dialoge, Medien-/Promptansichten
hooks/              UI-Integration und wiederverwendbare Hooks
lib/features/       Funktionsregister
lib/constants/template-models/  Modellverträge
lib/desktop/        Verbindung, Entwürfe, Katalog und Medienvorgaben
lib/platform/       Native/Web-Adapter
lib/recommended-prompts*        Ausgewählte Promptdefinitionen und Inhaltsstand
network/            API-Clients, Uploads, Polling, Verlauf und Lebenszyklus
store/              Gemeinsamer Zustand-State
i18n/ + messages/   Sprachregister, Routing und Übersetzungen
src-tauri/          Rust-Hülle, Berechtigungen und Paketkonfiguration
scripts/            Isolierte Builds, Medienvorbereitung, Synchronisierung und Veröffentlichung
tests/              Verträge, Speicherung, Wiederherstellung, Build/Release und UI-Regressionen
public/             App-Ressourcen und enthaltene Promptbilder
docs/               Architektur, Module, Review-Notizen und README-Banner
```

Desktop-Builds arbeiten in einem isolierten Arbeitsverzeichnis, entfernen dort reine Webrouten und ersetzen `out/` nur
bei Erfolg; Quellrouten werden nicht verschoben oder gelöscht. Natives HTTP übernimmt API, Uploads und Downloads ohne
Browser-CORS-Abhängigkeit. AWS-Signierung für eigenes R2 und lokale FFmpeg-Dateien laden bei Bedarf. Uploads haben
begrenzte Parallelität, gemeinsame Medienverarbeitung läuft seriell und Polling zentral.

Neue Module erweitern Register und Modellverträge, legen API-Logik in `network/` ab, nutzen `lib/platform/` und ergänzen
Übersetzungen sowie Regressionstests. Siehe:

- [Architektur und Speichergrenzen](./docs/DESKTOP_ARCHITECTURE.md)
- [Module ergänzen und lokale QA](./docs/ADDING_MODULES.md)
- [Fachbegriffe](./CONTEXT.md)
- [Produktinventar](./docs/PRODUCT_INVENTORY.md) und [Review-Bericht](./docs/REVIEW_REPORT.md): Momentaufnahmen, keine
  Garantie aktueller Release-Prüfung.

## Desktop-App bauen, testen und paketieren

| Befehl                                            | Zweck                                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------ |
| `pnpm desktop:dev`                                | Medien vorbereiten, Entwicklungsoberfläche und native App starten              |
| `pnpm build:desktop`                              | Statisches Frontend nach `out/` für alle registrierten Sprachen                |
| `pnpm desktop:build`                              | Frontend und native Pakete für das aktuelle System bauen                       |
| `pnpm check`                                      | TypeScript + Node-Regressionen + ESLint                                        |
| `pnpm test:ui-layout`                             | Playwright-Layouttests; installiertes Google Chrome und Port 3000 erforderlich |
| `cargo test --manifest-path src-tauri/Cargo.toml` | Native Rust-Tests; Build-Abhängigkeiten der Zielplattform erforderlich         |
| `pnpm prompts:sync`                               | Wartung: Prompt-/Medienstand aus dem Netzwerk aktualisieren                    |

Für simulierte lokale Generierung erst `pnpm build:desktop`, dann `node scripts/desktop-preview.mjs` ausführen.
`http://127.0.0.1:4173/zh/` öffnen, Base URL auf `http://127.0.0.1:4173` setzen und `test-only-key` ohne Speicherung
verwenden. Simulierte APIs prüfen weder echte Flaq-Generierung noch R2-Uploads oder natives Verhalten. Keine echten
Schlüssel verwenden.

### Paketstatus

Der hinterlegte [Release-Workflow](./.github/workflows/desktop-build.yml) definiert:

| Ziel                | Artefakte                                                 |
| ------------------- | --------------------------------------------------------- |
| macOS Apple Silicon | `.dmg` und gezippte `.app`                                |
| macOS Intel         | `.dmg` und gezippte `.app`                                |
| Windows x64         | NSIS-`.exe`-Installer; kein MSI                           |
| Linux               | Aus Quellen baubar; nicht in der aktuellen Release-Matrix |

Manuelle Läufe erzeugen Kandidaten; passende `desktop-v<version>`-Tags lösen Releases aus. Enthalten sind `SHA256SUMS`
und `release-manifest.json`. Aktuelle Pakete sind unsigniert; öffentliche Verteilung braucht noch plattformspezifische
Signierung/Notarisierung und native Starttests. Ein definierter Workflow belegt keine erfolgreichen Builds und Tests für
alle Plattformen.

## Sprachunterstützung und Oberflächenlokalisierung (i18n)

Sprachregister und README-Übersetzungen: `en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`, `ko`, `th`,
`vi`, `ar`.

- Desktop-Routen enthalten immer die Sprache, auch `/en/`. Startreihenfolge: gespeicherte Sprache, Systemsprache,
  Englisch. Traditionelle chinesische Varianten entsprechen `tw`.
- Web verwendet `/` für Englisch, sonst Präfixe. Arabisch erhält RTL-Schriftrichtung.
- **Aktuelle Grenze:** einige neue Texte in Einstellungen, Medien- und Promptbibliothek sind direkt auf
  Chinesisch/Englisch geschrieben. `zh`/`tw` teilen chinesische Texte; andere Sprachen fallen dort auf Englisch zurück.
  15 registrierte Sprachen bedeuten keine vollständige Übersetzung jeder neuen Zeichenfolge.
- Sprachen über [i18n/languages.ts](./i18n/languages.ts), `messages/`, Routing/Build-Behandlung, README-Dateien und
  Paritätstests ergänzen.

## Das Flaq-AI-Team: KI-Engineering und kreative Abläufe

[Flaq AI](https://flaq.ai/de/) wird von **FLAQ AI PTE. LTD.**, registriert in Singapur, betrieben. Das Team verbindet
Produktdesign, Modell-/API-Engineering und kreative Prozesserfahrung, damit Kreative, Entwickler und Unternehmen KI
verstehen, vergleichen und einsetzen können.

Es arbeitet an Modell- und Werkzeugerlebnissen, API-Integration und praktischen Anwendungen von Bild-, Video-, Audio-
und Sprachmodellen, um Ideen in nutzbare Produktionsabläufe zu überführen.

Mehr erfahren: [Flaq-AI-Team und Unternehmen](https://flaq.ai/about/). Geschäftlicher Kontakt:
[contact@flaq.ai](mailto:contact@flaq.ai).

## Flaq-AI-Partnerprogramm: kreative Werkzeuge teilen und Provisionen erhalten

Als Affiliate stellen Sie KI-Bild-/Videoabläufe, Modell-APIs und Kreativwerkzeuge vor und erhalten Provisionen.
Willkommen sind Kreative, Designer, Entwickler, KI-Lehrende, Modelltester und Teams, die praktische KI-Anwendungen
teilen.

- **Empfehlungsvergütung** — 20 % auf die erste gültige bezahlte Bestellung, 10 % auf weitere gültige Bestellungen
  innerhalb von 60 Tagen nach Registrierung; Teilnahme- und Zuordnungsregeln gelten.
- **Flexible Werbung** — Empfehlungslinks in Tutorials, Modelltests, Werkpräsentationen, Communitys oder API-Leitfäden
  teilen.
- **Partnerbereich** — Links, Empfehlungsaktivität und Auszahlungseinstellungen auf Flaq AI verwalten.

Bei Flaq AI anmelden, Partnerprofil und Vereinbarung abschließen und einen Link erstellen. Das Projekt enthält
lokalisierte Werbeeinstiege; Anmeldung und Provisionsverwaltung erfolgen auf Flaq AI, nicht in der Desktop-App.

**[Am Flaq-AI-Partnerprogramm teilnehmen →](https://flaq.ai/de/affiliate-program/)**

> Vergütungsberechtigung, Zuordnung, Erstattungen, Auszahlungsprüfung und genehmigte Sondervereinbarungen richten sich
> nach den aktuellen Bedingungen auf der offiziellen Seite.

## Lizenz

Dieses Projekt ist unter der [MIT-Lizenz](LICENSE) quelloffen.
