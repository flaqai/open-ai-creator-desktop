# Flaq SaaS Template (Français)

Modèle SaaS gratuit et open source pour créer des plateformes de génération d'images et de vidéos par IA avec l'API
unifiée de Flaq.ai.

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

## À propos de Flaq.ai

[Flaq.ai](https://flaq.ai/fr/) réunit les principaux modèles de génération d'images et de vidéos derrière une seule API
et une authentification cohérente. La connexion, le suivi d'état, l'affichage des résultats et le téléchargement sont
déjà intégrés au modèle.

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

## Programme d'affiliation Flaq.ai

Avec le [programme d'affiliation Flaq.ai](https://flaq.ai/fr/affiliate-program?utm_source=flaq-saas-template), vous
pouvez gagner 20 % sur la première commande payée valide d'un utilisateur recommandé, puis 10 % sur ses commandes payées
valides suivantes dans les 60 jours après son inscription. L'éligibilité et les paiements dépendent des conditions à
jour de la page du programme.

## Internationalisation

Le code et les READMEs couvrent les mêmes 15 locales : `en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`,
`ko`, `th`, `vi` et `ar`. L'anglais utilise `/`, les autres langues `/{locale}/`, et l'arabe est affiché de droite à
gauche.

## Documentation et licence

Pour la configuration complète, la stack technique et le déploiement, consultez [README.md](./README.md) ou
[README_zh.md](./README_zh.md). Le projet est publié sous [MIT License](LICENSE).
