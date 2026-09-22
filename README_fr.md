# Flaq SaaS Template (Français)

Modèle SaaS gratuit et open source pour créer des plateformes de génération d'images et de vidéos par IA avec l'API
unifiée de Flaq.ai.

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

**README :** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português](./README_pt.md) · [Español](./README_es.md) · [Deutsch](./README_de.md) ·
[Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) · [繁體中文](./README_tw.md) ·
[한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) · [العربية](./README_ar.md)

## À propos du modèle

Construit avec Next.js 16, React 19, TypeScript et Tailwind CSS. Il comprend cinq parcours prêts à l'emploi : texte vers
image, image vers image, texte vers vidéo, image vers vidéo et essayage virtuel.

### Fonctionnalités principales

- 🎨 Pages de génération d'images et de vidéos avec choix du modèle et des paramètres
- 🔌 Intégration à l'API Flaq.ai avec un seul Client Key
- 🧠 Prise en charge de Nano Banana Pro, Seedream, GPT Image, Grok Imagine, Veo, Wan, Kling, Seedance, Vidu et d'autres
  modèles
- 🌐 15 langues pour l'interface, les routes et les liens SEO alternatifs
- ☁️ Envoi vers Cloudflare R2 et stockage des contenus générés
- 🔒 Stockage chiffré de la clé API côté client
- 📱 Interface responsive, mode sombre et historique des générations

## Démarrage rapide

```bash
git clone https://github.com/flaqai/flaq-saas-template.git
cd flaq-saas-template
pnpm install
cp .env.example .env.local
pnpm dev
```

Définissez `NEXT_PUBLIC_SITE_URL` dans `.env.local` et ajoutez les valeurs Cloudflare R2 si nécessaire. Saisissez
ensuite le Client Key [Flaq.ai](https://flaq.ai/fr/) dans les réglages de l'application. Consultez la
[documentation complète en anglais](./README.md#getting-started) pour toutes les variables et étapes.

## Internationalisation

Le code et les READMEs couvrent les mêmes 15 locales : `en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`,
`ko`, `th`, `vi` et `ar`. L'anglais utilise `/`, les autres langues `/{locale}/`, et l'arabe est affiché de droite à
gauche.

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
