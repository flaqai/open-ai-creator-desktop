![Flaq Open Media Creator](./docs/assets/flaq-open-media-creator-banner.png)

# Flaq Open Media Creator (Français)

Un espace de création d’images et de vidéos IA, open source et destiné au bureau, adapté de Flaq SaaS Template.
L’application installée conserve le nom Flaq Creator.

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português (Brasil)](./README_pt.md) · [Español](./README_es.md) ·
[Deutsch](./README_de.md) · [Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) ·
[繁體中文](./README_tw.md) · [한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) ·
[العربية](./README_ar.md)

## À propos de Flaq AI

[Flaq AI](https://flaq.ai/fr/) est une plateforme d’IA pour les créateurs, développeurs et entreprises. Elle rassemble
les principaux modèles d’IA largement utilisés pour générer et retoucher des images, créer des vidéos et traiter le
langage.

- **API à forte concurrence et haute stabilité** — Intégrez la génération IA à vos produits et workflows de production
  grâce à une API unifiée.
- **Utilisation directe en ligne** — Utilisez les modèles et outils créatifs sur [Flaq AI](https://flaq.ai/fr/) dans
  votre navigateur, sans coder ni installer l’application de bureau.
- **Explorer et intégrer les modèles** — Comparez leurs capacités dans le
  [catalogue de modèles](https://flaq.ai/fr/model-market/) et démarrez avec la
  [documentation API](https://flaq.ai/fr/docs/).

Contact commercial: [contact@flaq.ai](mailto:contact@flaq.ai)

## Implémentation actuelle

Tauri 2 et Rust hébergent une interface statique Next.js 16 et React 19, sans serveur Node.js/Next.js embarqué. Les
formulaires, contrats de modèles et éléments visuels sont partagés avec le Web.

Sept entrées : AI Media Creator, texte vers image, image vers image, essayage virtuel, texte vers vidéo, image vers
vidéo et références vers vidéo. S’y ajoutent une bibliothèque de prompts, un catalogue consultable, l’historique dans
les paramètres, les brouillons IndexedDB et l’archivage local par date. Les images d’exemple sont incluses ; les vidéos
sont diffusées en ligne. Génération réussie et archivage réussi sont deux états distincts.

## Démarrage rapide

Exécutez ces commandes à la racine de ce dépôt. Prérequis : Node.js 22, pnpm 10.5.2, Rust et les dépendances Tauri du
système. Dans Paramètres → Connexion, saisissez votre Client Key Flaq AI, testez et enregistrez. Base URL par défaut :
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

## Programme d'affiliation Flaq AI

Devenez partenaire affilié Flaq AI et percevez des commissions en présentant des workflows d'image et de vidéo IA, des
API de modèles et des outils créatifs. Le programme accueille les créateurs, designers, développeurs, formateurs en IA,
testeurs de modèles et équipes partageant des usages pratiques de l'IA.

- **Récompenses de parrainage** — Gagnez 20% sur la première commande payée valide d'un utilisateur parrainé, puis 10%
  sur les commandes payées valides suivantes dans les 60 jours après son inscription, selon les règles d'éligibilité et
  d'attribution.
- **Promotion flexible** — Partagez votre lien dans des tutoriels, comparatifs, réalisations créatives, communautés ou
  guides d'intégration API.
- **Espace partenaire** — Gérez vos liens, consultez l'activité de parrainage et configurez les versements sur Flaq AI.

Connectez-vous à Flaq AI, complétez votre profil et acceptez l'accord d'affiliation pour créer votre lien personnel. Le
projet propose aussi des invitations localisées au programme ; l'inscription et la gestion des commissions se font sur
Flaq AI, pas dans l'application de bureau.

**[Rejoindre le programme d'affiliation Flaq AI →](https://flaq.ai/fr/affiliate-program/)**

> L'éligibilité aux commissions, l'attribution, les remboursements, l'examen des versements et les accords personnalisés
> approuvés sont régis par les dernières conditions de la page officielle.

## Documentation et licence

Pour la configuration complète, la stack technique et le déploiement, consultez [README.md](./README.md) ou
[README_zh.md](./README_zh.md). Le projet est publié sous [MIT License](LICENSE).
