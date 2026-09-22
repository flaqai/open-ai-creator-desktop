![Flaq Open Media Creator](./docs/assets/flaq-open-media-creator-banner.png)

# Flaq Open Media Creator (Français)

Un espace de création d’images et de vidéos IA, open source et destiné au bureau, adapté de Flaq SaaS Template.
L’application installée conserve le nom Flaq Creator.

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português (Brasil)](./README_pt.md) · [Español](./README_es.md) ·
[Deutsch](./README_de.md) · [Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) ·
[繁體中文](./README_tw.md) · [한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) ·
[العربية](./README_ar.md)

## À propos de Flaq.ai

[Flaq.ai](https://flaq.ai/fr/) est une plateforme de modèles d'IA destinée aux créateurs et aux développeurs. Une seule
clé API donne accès à la génération et à la retouche d'images, à la génération de vidéos et aux modèles de langage.

- **Explorer et comparer les modèles** — Consultez les capacités, les paramètres pris en charge et les tarifs actuels
  dans le [Model Market](https://flaq.ai/model-market/).
- **Tester avant d'intégrer** — Utilisez le Playground de Flaq.ai pour essayer les modèles compatibles et affiner vos
  prompts et réglages.
- **Créer des workflows créatifs** — Suivez la [documentation API](https://flaq.ai/docs/) pour intégrer l'IA à vos
  produits et outils.

Flaq Creator Desktop rassemble les workflows d'image et de vidéo dans un espace de travail dédié. Connectez votre Client
Key Flaq.ai dans l'application pour créer et gérer vos contenus visuels. Toutes les API de la plateforme ne sont pas
disponibles dans l'application de bureau ; les modèles et tarifs en vigueur figurent sur Flaq.ai.

## Implémentation actuelle

Tauri 2 et Rust hébergent une interface statique Next.js 16 et React 19, sans serveur Node.js/Next.js embarqué. Les
formulaires, contrats de modèles et éléments visuels sont partagés avec le Web.

Sept entrées : AI Media Creator, texte vers image, image vers image, essayage virtuel, texte vers vidéo, image vers
vidéo et références vers vidéo. S’y ajoutent une bibliothèque de prompts, un catalogue consultable, l’historique dans
les paramètres, les brouillons IndexedDB et l’archivage local par date. Les images d’exemple sont incluses ; les vidéos
sont diffusées en ligne. Génération réussie et archivage réussi sont deux états distincts.

## Démarrage rapide

Exécutez ces commandes à la racine de ce dépôt. Prérequis : Node.js 22, pnpm 10.5.2, Rust et les dépendances Tauri du
système. Dans Paramètres → Connexion, saisissez votre Client Key Flaq.ai, testez et enregistrez. Base URL par défaut :
`https://api.flaq.ai`. La génération réelle nécessite Internet et des crédits API.

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

## Téléversements et identifiants

Le téléversement par défaut reçoit des URL signées temporaires depuis Flaq `/api/v1/files/presignedUrl`. Les
identifiants R2 partagés restent sur le serveur ; aucun compte Cloudflare personnel n’est nécessaire. Un R2 personnel
peut être configuré avec signature locale. Les préréglages AES-GCM dans WebView ne sont pas un coffre-fort système. Si
vous mémorisez la clé, le Client Key est enregistré en clair dans `auth.json`, dans le répertoire de configuration de
l’application.

## Plateformes et langues

La publication est configurée pour macOS Apple Silicon/Intel (DMG, ZIP) et Windows x64 (NSIS EXE). Linux peut être
compilé depuis les sources mais ne figure pas dans la matrice de publication. Les paquets actuels ne sont pas signés.
Quinze langues sont enregistrées ; certains nouveaux panneaux de paramètres, médias et prompts restent en
chinois/anglais : `zh`/`tw` partagent le chinois, les autres utilisent l’anglais. Le bureau impose un préfixe, même
`/en/` ; le Web utilise `/` pour l’anglais et un préfixe pour les autres langues. L’arabe utilise RTL.

`en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`, `ko`, `th`, `vi`, `ar`

## Programme d'affiliation Flaq.ai

Devenez partenaire affilié Flaq.ai et percevez des commissions en présentant des workflows d'image et de vidéo IA, des
API de modèles et des outils créatifs. Le programme accueille les créateurs, designers, développeurs, formateurs en IA,
testeurs de modèles et équipes partageant des usages pratiques de l'IA.

- **Récompenses de parrainage** — Gagnez 20% sur la première commande payée valide d'un utilisateur parrainé, puis 10%
  sur les commandes payées valides suivantes dans les 60 jours après son inscription, selon les règles d'éligibilité et
  d'attribution.
- **Promotion flexible** — Partagez votre lien dans des tutoriels, comparatifs, réalisations créatives, communautés ou
  guides d'intégration API.
- **Espace partenaire** — Gérez vos liens, consultez l'activité de parrainage et configurez les versements sur Flaq.ai.

Connectez-vous à Flaq.ai, complétez votre profil et acceptez l'accord d'affiliation pour créer votre lien personnel. Le
projet propose aussi des invitations localisées au programme ; l'inscription et la gestion des commissions se font sur
Flaq.ai, pas dans l'application de bureau.

**[Rejoindre le programme d'affiliation Flaq.ai →](https://flaq.ai/fr/affiliate-program/)**

> L'éligibilité aux commissions, l'attribution, les remboursements, l'examen des versements et les accords personnalisés
> approuvés sont régis par les dernières conditions de la page officielle.

## Documentation et licence

Pour la configuration complète, la stack technique et le déploiement, consultez [README.md](./README.md) ou
[README_zh.md](./README_zh.md). Le projet est publié sous [MIT License](LICENSE).
