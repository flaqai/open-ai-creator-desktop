![Flaq Open Media Creator](./docs/assets/flaq-open-media-creator-banner.png)

# Flaq Open Media Creator

Une **application de bureau open source de création d’images et de vidéos par IA** pour les créateurs, designers et
équipes de marque. Réunissez inspirations de prompts, médias de référence et canevas infini pour générer, prévisualiser,
affiner et organiser vos créations localement.

Adaptée du [Flaq SaaS Template](https://github.com/flaqai/flaq-saas-template), l’application accède aux modèles Flaq AI
avec une enveloppe Tauri 2 + Rust et une interface React moderne. L’application installée s’appelle **Flaq Creator**.

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português (Brasil)](./README_pt.md) · [Español](./README_es.md) ·
[Deutsch](./README_de.md) · [Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) ·
[繁體中文](./README_tw.md) · [한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) ·
[العربية](./README_ar.md)

## Captures de l’application de bureau : espace de travail, création IA et canevas infini

Capturées dans l’application macOS en cours d’exécution, avec une interface en anglais. Les panneaux de création affichent des brouillons de démonstration locaux ; les images de la bibliothèque de prompts sont des exemples intégrés.

### Espace créatif — outils, inspiration de prompts et raccourcis vers les médias

![Espace créatif — outils, inspiration de prompts et raccourcis vers les médias](./docs/assets/screenshots/desktop-workspace.jpg)

### Création d’images IA — prompts, modèles et paramètres de génération

![Création d’images IA — prompts, modèles et paramètres de génération](./docs/assets/screenshots/desktop-ai-creator.jpg)

### Canevas infini — organiser les briefs créatifs et les nœuds de génération

![Canevas infini — organiser les briefs créatifs et les nœuds de génération](./docs/assets/screenshots/desktop-canvas.jpg)

### Inspiration de prompts — parcourir des exemples visuels et des prompts réutilisables

![Inspiration de prompts — parcourir des exemples visuels et des prompts réutilisables](./docs/assets/screenshots/desktop-prompt-library.jpg)

## Plateforme de modèles Flaq AI et outils de création en ligne

[Flaq AI](https://flaq.ai/fr/) réunit des modèles IA majeurs pour la génération et la retouche d’images, la vidéo et les
tâches linguistiques, à destination des créateurs, développeurs et entreprises.

- **API stables à forte concurrence** — Intégrez la génération IA à vos produits et processus de production avec une API
  unifiée.
- **Création directement en ligne** — Essayez les outils et modèles dans votre navigateur sur
  [Flaq AI](https://flaq.ai/fr/), sans coder ni installer l’application.
- **Exploration et intégration** — Comparez les modèles dans le [catalogue](https://flaq.ai/fr/model-market/) et
  consultez la [documentation API](https://flaq.ai/fr/docs/).

Contact professionnel : [contact@flaq.ai](mailto:contact@flaq.ai)

## Fonctionnalités IA sur ordinateur : de l’idée aux images et vidéos

### Génération d’images, création vidéo et essayage virtuel

Huit entrées accompagnent la création quotidienne. Explorez vos idées dans l’espace unifié ou utilisez un outil
spécialisé pour les visuels de produits, réseaux sociaux, concepts publicitaires et vidéos courtes.

| Outil                | Possibilités créatives                                                                      | Route                 |
| -------------------- | ------------------------------------------------------------------------------------------- | --------------------- |
| AI Media Creator     | Créer des images et vidéos, examiner les résultats et affiner les idées dans un même espace | `/ai-media-creator`   |
| Canevas infini IA    | Organiser textes, médias et paramètres de génération dans un projet local enregistré        | `/ai-canvas`          |
| Texte vers image     | Explorer des styles de couvertures, affiches et scènes de produits à partir de prompts      | `/text-to-image`      |
| Image vers image     | Développer de nouveaux styles et directions visuelles à partir d’images de référence        | `/image-to-image`     |
| Essayage virtuel     | Combiner références de vêtements et de mannequins pour la mode et le commerce               | `/virtual-try-on`     |
| Texte vers vidéo     | Transformer des idées écrites en scènes animées et concepts de campagne                     | `/text-to-video`      |
| Image vers vidéo     | Animer des images fixes pour des visuels de produits et des clips                           | `/image-to-video`     |
| Référence vers vidéo | Guider la création vidéo avec des médias de référence                                       | `/reference-to-video` |

Les routes omettent le préfixe de langue. Les outils partagent le
[registre des fonctionnalités](./lib/features/catalog.ts). Entrées, limites et paramètres dépendent du modèle et des
[contrats de modèles](./lib/constants/template-models/).

### Bibliothèque de prompts et canevas infini pour explorer vos idées

- **Partir d’exemples** : parcourez la bibliothèque, copiez les prompts complets et examinez les aperçus image/vidéo
  avec zoom et déplacement. Les images sont incluses ; les vidéos sont diffusées en ligne. Le nom de modèle d’une
  collection ne garantit pas sa disponibilité dans les formulaires.
- **Organiser visuellement les projets** : disposez textes, médias et paramètres sur un canevas infini. Déplacez-vous,
  zoomez, manipulez les nœuds et enregistrez le projet local pour le reprendre plus tard.
- **Choisir le modèle adapté** : réglez les paramètres pris en charge avec l’aide contextuelle. Le guide initial et le
  test de connexion facilitent la configuration ; l’apparence et la langue s’adaptent à votre usage.

### Médiathèque locale, brouillons récupérables et export des créations

- **Retrouver références et réalisations** : recherchez les références importées et les résultats par type et origine,
  prévisualisez, téléchargez et vérifiez l’archivage local. Ouvrez `/media-library` ou Paramètres → Historique.
- **Conserver votre progression** : les brouillons gardent prompts, paramètres et médias localement. Historique et index
  des références restent sur l’appareil. La récupération interroge la tâche initiale sans lancer une nouvelle génération
  payante.
- **Archiver les résultats** : images et vidéos sont enregistrées sous `YYYY/MM/DD` dans un dossier configurable pour le
  montage et la livraison. La récupération d’archive réessaie uniquement l’enregistrement des résultats existants.
- **Préparer l’étape suivante** : utilisez les dialogues natifs d’enregistrement, l’export PNG/JPEG/WebP et le découpage
  FFmpeg WASM chargé à la demande.

### Un parcours pratique pour les créateurs

1. Explorez les exemples ou organisez textes et références sur le canevas.
2. Choisissez outil et modèle, puis renseignez prompt, références et paramètres disponibles.
3. Lancez la génération, examinez le résultat et affinez la suivante.
4. Retrouvez les fichiers dans la médiathèque et utilisez les archives ou exports dans la suite de la production.

La génération nécessite Internet, une Client Key Flaq AI valide et des crédits suffisants. Les modèles fonctionnent dans
le cloud ; brouillons, projets et index locaux ne se synchronisent pas entre appareils.

## Démarrage : lancer l’application et connecter Flaq AI

### Prérequis

- Node.js **22**, conformément à [.nvmrc](./.nvmrc).
- pnpm **10.5.2**, conformément à `packageManager` dans [package.json](./package.json).
- Rust et les [prérequis Tauri](https://v2.tauri.app/start/prerequisites/) du système cible pour le développement et les
  paquets natifs. Une compilation du frontend seul ne nécessite pas Rust.
- Un compte Flaq AI et une Client Key pour générer réellement. L’envoi par défaut ne nécessite **pas** votre propre
  compte Cloudflare.

À la racine du dépôt :

```bash
pnpm install --frozen-lockfile
pnpm desktop:dev
```

Le développement utilise `ai.flaq.creator.dev` ; l’application installée utilise `ai.flaq.creator`. Configuration,
données WebView et dossiers de médias par défaut sont séparés.

### Connexion à Flaq AI

1. Connectez-vous à [Flaq AI](https://flaq.ai/fr/) et obtenez une Client Key.
2. Suivez le guide initial ou ouvrez Paramètres → Connexion.
3. Utilisez la Base URL `https://api.flaq.ai` ou une passerelle compatible et fiable.
4. Saisissez la clé, testez la connexion et enregistrez.
5. Conservez le fournisseur d’envoi intégré ou configurez explicitement votre propre profil R2.
6. Choisissez outil et modèle, saisissez prompt/références et envoyez. Gérez les résultats dans Paramètres → Historique
   et le dossier d’archive dans Paramètres → Général.

> **Stockage des identifiants :** « Se souvenir de moi » enregistre du JSON lisible dans `auth.json`, dans le dossier de
> configuration de l’utilisateur courant. Il ne s’agit **ni du trousseau système ni d’un chiffrement applicatif**. Sous
> Unix, les permissions sont limitées à cet utilisateur ; les identifiants de session ne sont pas écrits dans ce fichier
> natif. Évitez la mémorisation sur un appareil partagé et ne commitez jamais clés, journaux contenant des secrets ou
> configuration locale.

### Envoi des médias et stockage local

| Élément                 | Implémentation actuelle                                                                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Envoi intégré           | La Client Key demande des URL signées temporaires à `/api/v1/files/presignedUrl`, puis les médias sont envoyés directement. Les identifiants R2 partagés restent sur le serveur, hors du paquet. |
| R2 personnalisé         | ID de compte, bucket, clé d’accès, clé secrète et domaine public facultatifs. Signature locale ; profils stockés avec AES-GCM dans le WebView, sans coffre système.                              |
| Brouillons              | IndexedDB conserve octets et métadonnées. Choisir un fichier ne l’envoie pas ; l’envoi intervient à la soumission.                                                                               |
| Historique et catalogue | Web Storage local indexe tâches et références envoyées. Les entrées ne confèrent ni propriété ni droit de suppression dans le cloud.                                                             |
| Fichiers générés        | Enregistrement natif en flux dans la racine configurée, par défaut le dossier de données de l’application. Un échec d’archivage n’annule pas une génération réussie.                             |

R2 personnalisé exige un domaine de médias accessible publiquement, pas seulement le point d’accès S3. La conservation
dépend de la politique Flaq ou du cycle de vie du bucket ; l’archivage local est indépendant. Le chiffrement des profils
côté navigateur ne protège pas contre un WebView compromis ou un attaquant ayant accès au profil et au code. Utilisez
uniquement des passerelles et destinations fiables.

### Mode Web facultatif

Le mode Next.js d’origine reste disponible et exécute un serveur :

```bash
pnpm dev
pnpm build
pnpm start
```

Ouvrez `http://localhost:3000`. Pour configurer l’environnement Web, copiez [.env.example](./.env.example) vers
`.env.local` dans votre éditeur et remplissez uniquement les valeurs nécessaires.

| Variables                                                                     | Usage                                                               |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CONTACT_US_EMAIL`                        | URL publique et coordonnées du site                                 |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` | Identifiants exclusivement serveur pour la signature des envois Web |

Les envois Web utilisent `app/api/upload/presigned-url/route.ts` et le domaine public configuré dans l’hébergement
d’images. Le mode bureau utilise les signatures Flaq, sans variables R2 locales ni serveur API Next.js local. Ne
préfixez jamais un secret par `NEXT_PUBLIC_` et ne l’incluez pas dans l’installateur.

## Architecture de bureau : Tauri 2, Rust et Next.js

**Tauri 2 + Rust héberge une interface Next.js exportée statiquement, sans serveur Node.js/Next.js embarqué.** Bureau et
Web partagent pages React, formulaires, contrats de modèles, traductions et ressources graphiques.

### Des technologies modernes au service de la création

- **Enveloppe native et interface statique** : Tauri 2 utilise le WebView système ; Rust gère fenêtres, configuration et
  fichiers. Aucun serveur Node.js local n’est nécessaire.
- **Types et validation** : TypeScript, contrats partagés et Zod alignent formulaires et requêtes API, limitant les
  incohérences et facilitant l’intégration de modèles.
- **Tâches asynchrones et chargement à la demande** : interrogation centralisée et concurrence limitée coordonnent le
  travail. FFmpeg et la signature R2 personnalisée ne chargent qu’au besoin, allégeant le démarrage.
- **Enregistrement fiable** : Rust télécharge dans des fichiers temporaires avant de publier les fichiers terminés,
  réduisant le risque de résultats incomplets après interruption. Les états distincts de génération et d’archivage
  facilitent la récupération.

### Confidentialité des fichiers : stockage local et envois contrôlés

Des flux de données explicites et des contrôles d’accès protègent les créations :

- **Brouillons locaux d’abord** : IndexedDB conserve médias et métadonnées. La sélection n’envoie rien ; la soumission
  de génération déclenche l’envoi.
- **Autorisation temporaire** : le fournisseur intégré obtient des URL signées avec la Client Key. Les secrets R2
  partagés restent sur le service, jamais dans l’application.
- **Accès au canevas fichier par fichier** : le code natif résout le chemin réel et vérifie qu’il s’agit d’un média
  archivé dans un dossier autorisé avant d’en permettre l’aperçu.
- **Configurations séparées** : développement et installation ont des identifiants et données WebView distincts. Sous
  Unix, seul l’utilisateur courant peut lire et écrire les connexions mémorisées.

**Limites de confidentialité :** le stockage local ne signifie ni traitement entièrement hors ligne ni chiffrement des
fichiers. Les prompts et références utiles sont envoyés aux services configurés ; la conservation distante dépend du
service ou du bucket. Les Client Keys mémorisées restent en JSON lisible, hors trousseau système. Consultez « Envoi des
médias et stockage local » ci-dessus.

### Pile technique et organisation du code

| Couche                        | Implémentation et responsabilité                                                               |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| Interface                     | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Radix UI, Framer Motion                      |
| Formulaires et état           | React Hook Form + Zod ; Zustand ; SWR selon les besoins                                        |
| Contrats fonctionnels/modèles | Registre unique pour huit outils ; entrées, limites et valeurs par défaut partagées            |
| Services                      | Adaptateurs Flaq, politique d’envoi, interrogation centralisée, cycles génération/archivage    |
| Frontière plateforme          | HTTP natif/Web, export/enregistrement, liens externes ; aucun appel natif direct depuis l’UI   |
| Enveloppe native              | Tauri 2 / Rust : configuration, permissions, fenêtres, journaux, flux et sauvegardes atomiques |
| Localisation                  | next-intl, 15 langues enregistrées, arabe RTL                                                  |
| Vérification                  | Régressions Node/tsx, tests Rust, mises en page Playwright, ESLint et TypeScript               |

```text
app/[locale]/       Pages localisées : outils, bibliothèque, accueil, politiques
app/api/            Signature d’envoi et proxy image réservés au Web
components/         UI partagée, enveloppe, formulaires, dialogues, aperçus médias/prompts
hooks/              Intégration UI et hooks réutilisables
lib/features/       Registre des fonctionnalités
lib/constants/template-models/  Contrats de modèles
lib/desktop/        Connexion, brouillons, catalogue, préférences médias
lib/platform/       Adaptateurs natifs/Web
lib/recommended-prompts*        Définitions et instantané des prompts sélectionnés
network/            Clients API, envois, interrogation, historique, cycles de vie
store/              État Zustand partagé
i18n/ + messages/   Langues, routage et traductions
src-tauri/          Enveloppe Rust, capacités et configuration des paquets
scripts/            Builds isolés, médias, synchronisation et publication
tests/              Contrats, stockage, récupération, builds/publication et régressions UI
public/             Ressources de l’application et images de prompts incluses
docs/               Architecture, modules, notes de revue et bannière README
```

La compilation bureau travaille dans un dossier isolé, y exclut les routes Web et ne remplace `out/` qu’en cas de
succès, sans déplacer ni supprimer les sources. HTTP natif gère API, envois et téléchargements sans les contraintes CORS
du navigateur. Signature AWS personnalisée et FFmpeg local chargent à la demande. Les envois ont une concurrence
limitée, le traitement partagé des médias est sérialisé et l’interrogation est centralisée.

Pour ajouter un module, étendez registre et contrats, placez les API dans `network/`, réutilisez `lib/platform/`,
ajoutez traductions et tests de régression. Voir :

- [Architecture et frontières du stockage](./docs/DESKTOP_ARCHITECTURE.md)
- [Ajout de modules et QA locale](./docs/ADDING_MODULES.md)
- [Vocabulaire métier](./CONTEXT.md)
- [Inventaire produit](./docs/PRODUCT_INVENTORY.md) et [rapport de revue](./docs/REVIEW_REPORT.md) : états ponctuels,
  sans garantie de validation de la version actuelle.

## Compilation, tests et paquets de l’application de bureau

| Commande                                          | Objectif                                                                     |
| ------------------------------------------------- | ---------------------------------------------------------------------------- |
| `pnpm desktop:dev`                                | Préparer les médias et lancer l’UI de développement et l’application native  |
| `pnpm build:desktop`                              | Frontend statique dans `out/` pour toutes les langues enregistrées           |
| `pnpm desktop:build`                              | Compiler frontend et paquets natifs pour le système courant                  |
| `pnpm check`                                      | TypeScript + régressions Node + ESLint                                       |
| `pnpm test:ui-layout`                             | Tests Playwright ; Google Chrome installé et port 3000 requis                |
| `cargo test --manifest-path src-tauri/Cargo.toml` | Tests Rust natifs ; dépendances de compilation de la plateforme requises     |
| `pnpm prompts:sync`                               | Maintenance : actualiser depuis le réseau prompts et ressources sélectionnés |

Pour simuler la génération locale, lancez `pnpm build:desktop`, puis `node scripts/desktop-preview.mjs`. Ouvrez
`http://127.0.0.1:4173/zh/`, définissez la Base URL sur `http://127.0.0.1:4173` et utilisez `test-only-key` sans la
mémoriser. Ces API simulées ne valident ni la génération Flaq réelle, ni R2, ni le comportement natif. N’utilisez pas de
vraie clé.

### État des paquets

Le [workflow de publication](./.github/workflows/desktop-build.yml) définit :

| Cible               | Artéfacts                                                                     |
| ------------------- | ----------------------------------------------------------------------------- |
| macOS Apple Silicon | `.dmg` et `.app` compressée en ZIP                                            |
| macOS Intel         | `.dmg` et `.app` compressée en ZIP                                            |
| Windows x64         | Installateur NSIS `.exe` ; pas de MSI                                         |
| Linux               | Compilation depuis les sources ; absent de la matrice de publication actuelle |

L’exécution manuelle produit des candidats ; les tags `desktop-v<version>` correspondants déclenchent la publication.
Les livrables incluent `SHA256SUMS` et `release-manifest.json`. Les paquets actuels ne sont pas signés ; une diffusion
publique nécessite encore signature/notarisation et vérifications natives de démarrage. Définir un workflow ne prouve
pas la réussite des builds et tests sur toutes les plateformes.

## Langues prises en charge et localisation de l’interface (i18n)

Registre et README couvrent : `en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`, `ko`, `th`, `vi`, `ar`.

- Les routes bureau portent toujours la langue, y compris `/en/`. Au démarrage : langue enregistrée, puis système, puis
  anglais. Les variantes du chinois traditionnel correspondent à `tw`.
- Le Web utilise `/` pour l’anglais et un préfixe pour les autres langues. L’arabe utilise RTL.
- **Limite actuelle :** certains textes récents des paramètres et bibliothèques sont écrits directement en chinois et
  anglais. `zh`/`tw` partagent le chinois ; les autres langues utilisent l’anglais dans ces panneaux. Quinze langues
  enregistrées ne signifient pas que chaque texte est traduit.
- Ajoutez les langues dans [i18n/languages.ts](./i18n/languages.ts), `messages/`, le routage/build, les README et les
  tests de parité.

## L’équipe Flaq AI : ingénierie IA et processus créatifs

[Flaq AI](https://flaq.ai/fr/) est exploité par **FLAQ AI PTE. LTD.**, enregistrée à Singapour. L’équipe associe design
produit, ingénierie des modèles et API, et expérience des processus créatifs pour aider créateurs, développeurs et
entreprises à comprendre, comparer et utiliser l’IA.

Elle travaille sur l’expérience des modèles et outils, l’intégration API et les applications concrètes des modèles
image, vidéo, audio et langage, pour transformer les idées en processus de production utilisables.

En savoir plus : [équipe et entreprise Flaq AI](https://flaq.ai/about/). Contact professionnel :
[contact@flaq.ai](mailto:contact@flaq.ai).

## Affiliation Flaq AI : partager des outils créatifs et gagner des commissions

Devenez partenaire et percevez des commissions en présentant processus image/vidéo IA, API et outils créatifs.
Créateurs, designers, développeurs, formateurs IA, évaluateurs de modèles et équipes partageant des usages concrets sont
les bienvenus.

- **Récompenses de parrainage** — 20 % sur la première commande payante admissible et 10 % sur les suivantes dans les 60
  jours après l’inscription, selon les règles d’éligibilité et d’attribution.
- **Promotion flexible** — Partagez votre lien dans des tutoriels, évaluations, portfolios, communautés ou guides
  d’intégration API.
- **Espace partenaire** — Gérez liens, activité de parrainage et paramètres de versement sur Flaq AI.

Connectez-vous, complétez votre profil et l’accord d’affiliation, puis créez votre lien. Le projet propose des entrées
promotionnelles localisées ; inscription et commissions se gèrent sur Flaq AI, pas dans l’application de bureau.

**[Rejoindre le programme d’affiliation Flaq AI →](https://flaq.ai/fr/affiliate-program/)**

> Éligibilité, attribution, remboursements, examen des versements et accords personnalisés approuvés sont régis par les
> dernières conditions de la page officielle.

## Licence

Ce projet est open source sous [licence MIT](LICENSE).
