# Flaq SaaS Template (Español)

Plantilla SaaS gratuita y de código abierto para crear plataformas de generación de imágenes y vídeo con IA mediante la
API unificada de Flaq.ai.

## Acerca de Flaq.ai

[Flaq.ai](https://flaq.ai/es/) es una plataforma de modelos de IA para creadores y desarrolladores. Una sola clave API
permite acceder de forma unificada a la generación y edición de imágenes, la generación de vídeo y los modelos de
lenguaje.

- **Explora y compara modelos** — Consulta capacidades, parámetros compatibles y precios actuales en el
  [Model Market](https://flaq.ai/model-market/).
- **Prueba antes de integrar** — Utiliza el Playground de Flaq.ai para probar modelos compatibles y ajustar prompts y
  configuraciones.
- **Crea flujos de trabajo creativos** — Sigue la [documentación de la API](https://flaq.ai/docs/) para integrar IA en
  tus productos y herramientas.

Flaq Creator Desktop lleva los flujos de imagen y vídeo a un espacio de trabajo de escritorio dedicado. Conecta tu
Client Key de Flaq.ai en la aplicación para crear y gestionar recursos visuales. No todas las API de la plataforma están
disponibles en la aplicación de escritorio; consulta los modelos y precios vigentes en Flaq.ai.

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

## Internacionalización

El código y los READMEs admiten los mismos 15 locales: `en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`,
`ko`, `th`, `vi` y `ar`. El inglés usa `/`, los demás idiomas `/{locale}/` y el árabe se muestra de derecha a izquierda.

## Programa de afiliados de Flaq.ai

Conviértete en socio afiliado de Flaq.ai y gana comisiones presentando flujos de imagen y vídeo con IA, API de modelos y
herramientas creativas. El programa está dirigido a creadores, diseñadores, desarrolladores, educadores de IA, analistas
de modelos y equipos que comparten flujos prácticos de IA.

- **Recompensas por recomendaciones** — Gana un 20% por el primer pedido de pago válido de un usuario referido y un 10%
  por sus siguientes pedidos de pago válidos durante los 60 días posteriores al registro, según las reglas de
  elegibilidad y atribución.
- **Promoción flexible** — Comparte tu enlace en tutoriales, reseñas, proyectos creativos, comunidades o guías de
  integración de API.
- **Espacio para socios** — Gestiona enlaces, consulta la actividad de referidos y configura los cobros en Flaq.ai.

Inicia sesión en Flaq.ai, completa tu perfil y acepta el acuerdo de afiliación para crear tu enlace personal. El
proyecto también incluye accesos localizados al programa; la inscripción y la gestión de comisiones se realizan en
Flaq.ai, no en la aplicación de escritorio.

**[Únete al programa de afiliados de Flaq.ai →](https://flaq.ai/es/affiliate-program/)**

> La elegibilidad de las comisiones, la atribución, los reembolsos, la revisión de pagos y los acuerdos personalizados
> aprobados se rigen por las condiciones vigentes de la página oficial.

## Documentación y licencia

Para la configuración completa, el stack técnico y el despliegue, consulta [README.md](./README.md) o
[README_zh.md](./README_zh.md). El proyecto se publica bajo la [MIT License](LICENSE).
