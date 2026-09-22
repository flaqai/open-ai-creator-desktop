![Flaq Open Media Creator](./docs/assets/flaq-open-media-creator-banner.png)

# Flaq Open Media Creator (Español)

Un espacio de trabajo de escritorio de código abierto para crear imágenes y vídeos con IA, basado en Flaq SaaS Template.
La aplicación instalada sigue llamándose Flaq Creator.

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português (Brasil)](./README_pt.md) · [Español](./README_es.md) ·
[Deutsch](./README_de.md) · [Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) ·
[繁體中文](./README_tw.md) · [한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) ·
[العربية](./README_ar.md)

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

## Implementación actual

Tauri 2 y Rust alojan la interfaz estática de Next.js 16 y React 19, sin un servidor Node.js/Next.js incluido. Los
formularios, contratos de modelos y diseño se comparten con la versión web.

Siete entradas: AI Media Creator, texto a imagen, imagen a imagen, probador virtual, texto a vídeo, imagen a vídeo y
referencia a vídeo. Incluye biblioteca de prompts, catálogo multimedia con búsqueda, historial en Ajustes, borradores en
IndexedDB y archivos locales por fecha. Las imágenes de ejemplo vienen incluidas; los vídeos se reproducen en línea. La
generación y el archivado tienen estados de éxito independientes.

## Inicio rápido

Ejecuta desde la raíz de este repositorio. Necesitas Node.js 22, pnpm 10.5.2, Rust y las dependencias Tauri del sistema.
En Ajustes → Conexión, introduce tu Client Key de Flaq.ai, prueba y guarda. Base URL predeterminada:
`https://api.flaq.ai`. La generación real requiere conexión y créditos API.

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

## Subidas y credenciales

Las subidas predeterminadas obtienen URL firmadas temporales mediante `/api/v1/files/presignedUrl` de Flaq. Las
credenciales R2 compartidas permanecen en el servidor; no necesitas una cuenta Cloudflare propia. R2 personalizado es
opcional y firma localmente. Sus preajustes AES-GCM en WebView no son una bóveda del sistema. Al recordar la clave, el
Client Key se guarda en texto plano en `auth.json`, dentro del directorio de configuración de la aplicación.

## Plataformas e idiomas

La configuración de publicación incluye macOS Apple Silicon/Intel (DMG y ZIP) y Windows x64 (NSIS EXE). Linux permite
compilación desde el código, pero no está en la matriz de publicación. Los paquetes actuales no están firmados. Hay 15
idiomas registrados, pero parte de los nuevos paneles de ajustes, medios y prompts solo está en chino/inglés: `zh`/`tw`
comparten chino; el resto usa inglés. El escritorio siempre lleva prefijo de idioma, incluido `/en/`; en web, inglés usa
`/` y los demás prefijos. Árabe usa RTL.

`en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`, `ko`, `th`, `vi`, `ar`

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
