# Flaq SaaS Template (Español)

Plantilla SaaS gratuita y de código abierto para crear plataformas de generación de imágenes y vídeo con IA mediante la
API unificada de Flaq.ai.

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português](./README_pt.md) · [Español](./README_es.md) · [Deutsch](./README_de.md) ·
[Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) · [繁體中文](./README_tw.md) ·
[한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) · [العربية](./README_ar.md)

## Acerca de la plantilla

Creada con Next.js 16, React 19, TypeScript y Tailwind CSS. Incluye cinco flujos listos para usar: texto a imagen,
imagen a imagen, texto a vídeo, imagen a vídeo y prueba virtual de ropa.

### Funciones principales

- 🎨 Páginas de generación de imágenes y vídeo con selección de modelos y parámetros
- 🔌 Integración con la API de Flaq.ai mediante un único Client Key
- 🧠 Compatible con Nano Banana Pro, Seedream, GPT Image, Grok Imagine, Veo, Wan, Kling, Seedance, Vidu y otros modelos
- 🌐 15 idiomas en la interfaz, las rutas y los enlaces alternativos SEO
- ☁️ Carga en Cloudflare R2 y almacenamiento de recursos generados
- 🔒 Almacenamiento cifrado de la clave API en el cliente
- 📱 Interfaz adaptable, modo oscuro e historial de generaciones

## Acerca de Flaq.ai

[Flaq.ai](https://flaq.ai/es/) reúne los principales modelos de generación de imágenes y vídeo en una sola API y con una
autenticación coherente. La plantilla ya implementa conexión, consulta de estado, presentación de resultados y descarga.

## Inicio rápido

```bash
git clone https://github.com/flaqai/flaq-saas-template.git
cd flaq-saas-template
pnpm install
cp .env.example .env.local
pnpm dev
```

Configura `NEXT_PUBLIC_SITE_URL` en `.env.local` y añade los valores de Cloudflare R2 cuando los necesites. Después
introduce el Client Key de [Flaq.ai](https://flaq.ai/es/) en los ajustes de la aplicación. Consulta la
[documentación completa en inglés](./README.md#getting-started) para ver todas las variables y pasos.

## Programa de afiliados de Flaq.ai

Con el [Programa de afiliados de Flaq.ai](https://flaq.ai/es/affiliate-program?utm_source=flaq-saas-template) puedes
ganar un 20% por el primer pedido válido de pago de un usuario referido y un 10% por sus siguientes pedidos válidos
durante los 60 días posteriores al registro. La elegibilidad y los pagos se rigen por los términos actuales de la página
del programa.

## Internacionalización

El código y los READMEs admiten los mismos 15 locales: `en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`,
`ko`, `th`, `vi` y `ar`. El inglés usa `/`, los demás idiomas `/{locale}/` y el árabe se muestra de derecha a izquierda.

## Documentación y licencia

Para la configuración completa, el stack técnico y el despliegue, consulta [README.md](./README.md) o
[README_zh.md](./README_zh.md). El proyecto se publica bajo la [MIT License](LICENSE).
