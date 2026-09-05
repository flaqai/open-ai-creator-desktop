# Flaq SaaS Template (Русский)

Бесплатный SaaS-шаблон с открытым исходным кодом для создания платформ генерации изображений и видео с помощью единого
API Flaq.ai.

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português](./README_pt.md) · [Español](./README_es.md) · [Deutsch](./README_de.md) ·
[Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) · [繁體中文](./README_tw.md) ·
[한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) · [العربية](./README_ar.md)

## О шаблоне

Создан на Next.js 16, React 19, TypeScript и Tailwind CSS. Включает пять готовых сценариев: текст в изображение,
изображение в изображение, текст в видео, изображение в видео и виртуальная примерка.

### Основные возможности

- 🎨 Страницы генерации изображений и видео с выбором модели и параметров
- 🔌 Интеграция API Flaq.ai с одним Client Key
- 🧠 Поддержка Nano Banana Pro, Seedream, GPT Image, Grok Imagine, Veo, Wan, Kling, Seedance, Vidu и других моделей
- 🌐 15 языков для интерфейса, маршрутов и альтернативных SEO-ссылок
- ☁️ Загрузка в Cloudflare R2 и хранение созданных материалов
- 🔒 Зашифрованное хранение API-ключа на стороне клиента
- 📱 Адаптивный интерфейс, тёмная тема и история генераций

## О Flaq.ai

[Flaq.ai](https://flaq.ai/ru/) объединяет ведущие модели генерации изображений и видео в одном API с единым способом
аутентификации. В шаблоне уже реализованы подключение к API, проверка статуса, отображение результатов и скачивание.

## Быстрый старт

```bash
git clone https://github.com/flaqai/flaq-saas-template.git
cd flaq-saas-template
pnpm install
cp .env.example .env.local
pnpm dev
```

Задайте `NEXT_PUBLIC_SITE_URL` в `.env.local` и при необходимости добавьте параметры Cloudflare R2. Затем укажите Client
Key [Flaq.ai](https://flaq.ai/ru/) в настройках приложения. Все переменные и шаги описаны в
[полной документации на английском](./README.md#getting-started).

## Партнёрская программа Flaq.ai

В [партнёрской программе Flaq.ai](https://flaq.ai/ru/affiliate-program?utm_source=flaq-saas-template) можно получать 20%
с первого действительного оплаченного заказа привлечённого пользователя и 10% с последующих действительных заказов в
течение 60 дней после регистрации. Условия участия и выплат определяются актуальными правилами на странице программы.

## Интернационализация

Код и READMEs поддерживают одинаковые 15 локалей: `en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`,
`ko`, `th`, `vi` и `ar`. Английская версия использует `/`, остальные — `/{locale}/`, а арабская отображается справа
налево.

## Документация и лицензия

Полная настройка, стек технологий и развёртывание описаны в [README.md](./README.md) и [README_zh.md](./README_zh.md).
Проект распространяется по [MIT License](LICENSE).
