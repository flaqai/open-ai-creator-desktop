![Flaq Open Media Creator](./docs/assets/flaq-open-media-creator-banner.png)

# Flaq Open Media Creator

Una **aplicación de escritorio de código abierto para crear imágenes y vídeos con IA**, dirigida a creadores,
diseñadores y equipos de marca. Reúne inspiración para prompts, referencias y un lienzo infinito para generar,
previsualizar, perfeccionar y organizar tus creaciones localmente.

Adaptada de [Flaq SaaS Template](https://github.com/flaqai/flaq-saas-template), conecta los modelos de Flaq AI mediante
Tauri 2 + Rust y una interfaz React moderna. La aplicación instalada se llama **Flaq Creator**.

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português (Brasil)](./README_pt.md) · [Español](./README_es.md) ·
[Deutsch](./README_de.md) · [Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) ·
[繁體中文](./README_tw.md) · [한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) ·
[العربية](./README_ar.md)

## Plataforma de modelos Flaq AI y herramientas creativas en línea

[Flaq AI](https://flaq.ai/es/) reúne modelos destacados para generar y editar imágenes, crear vídeos y realizar tareas
de lenguaje, al servicio de creadores, desarrolladores y empresas.

- **API estables de alta concurrencia** — Integra generación con IA en productos y procesos de producción mediante una
  API unificada.
- **Creación directamente en línea** — Prueba modelos y herramientas en el navegador en [Flaq AI](https://flaq.ai/es/),
  sin programar ni instalar la aplicación.
- **Exploración e integración** — Compara modelos en el [catálogo](https://flaq.ai/es/model-market/) y consulta la
  [documentación API](https://flaq.ai/es/docs/).

Contacto comercial: [contact@flaq.ai](mailto:contact@flaq.ai)

## Funciones de creación con IA: de las ideas a imágenes y vídeos

### Generación de imágenes, creación de vídeos y prueba virtual de ropa

Ocho accesos apoyan la creación diaria: explora ideas en el espacio unificado o utiliza herramientas específicas para
productos, redes sociales, conceptos publicitarios y vídeos cortos.

| Herramienta        | Qué puedes crear                                                                 | Ruta                  |
| ------------------ | -------------------------------------------------------------------------------- | --------------------- |
| AI Media Creator   | Imágenes y vídeos en un mismo espacio, revisando resultados y ajustando ideas    | `/ai-media-creator`   |
| Lienzo infinito IA | Textos, medios y ajustes de generación organizados en un proyecto local guardado | `/ai-canvas`          |
| Texto a imagen     | Estilos para portadas, carteles y escenas de productos a partir de prompts       | `/text-to-image`      |
| Imagen a imagen    | Nuevos estilos y direcciones visuales a partir de imágenes de referencia         | `/image-to-image`     |
| Prueba virtual     | Conceptos de moda y comercio combinando referencias de prendas y modelos         | `/virtual-try-on`     |
| Texto a vídeo      | Escenas en movimiento y conceptos de campaña a partir de ideas escritas          | `/text-to-video`      |
| Imagen a vídeo     | Presentaciones animadas de productos y clips a partir de imágenes fijas          | `/image-to-video`     |
| Referencia a vídeo | Vídeos guiados por medios de referencia                                          | `/reference-to-video` |

Las rutas omiten el prefijo de idioma. Las herramientas comparten el [registro de funciones](./lib/features/catalog.ts).
Entradas, límites y parámetros dependen del modelo elegido y de los
[contratos de modelos](./lib/constants/template-models/).

### Biblioteca de prompts y lienzo infinito para explorar ideas

- **Empieza con ejemplos**: explora la biblioteca, copia prompts completos y examina imágenes/vídeos con zoom y
  desplazamiento. Las imágenes vienen incluidas; los vídeos se reproducen en línea. El modelo indicado en una colección
  no garantiza que esté disponible en los formularios.
- **Organiza proyectos visualmente**: distribuye textos, medios y ajustes en el lienzo, desplázate, amplía y trabaja con
  nodos. Guarda proyectos locales y continúa después.
- **Elige modelos para cada tarea**: ajusta parámetros compatibles con ayuda contextual. La guía inicial y la prueba de
  conexión facilitan la configuración; apariencia e idioma adaptan el espacio al uso diario.

### Biblioteca local, recuperación de borradores y exportación creativa

- **Encuentra referencias y trabajos**: busca referencias subidas y resultados por tipo y origen, previsualiza, descarga
  y consulta el estado del archivo local. Abre `/media-library` o Ajustes → Historial.
- **Conserva el progreso**: los borradores guardan prompts, parámetros y medios localmente; historial e índices de
  referencias permanecen en el dispositivo. Recuperar tareas pendientes consulta la original sin enviar otra generación
  de pago.
- **Archiva resultados**: imágenes y vídeos se guardan en `YYYY/MM/DD` dentro de una carpeta configurable para edición y
  entrega. Recuperar el archivo reintenta guardar resultados existentes, sin generar de nuevo.
- **Prepara el siguiente paso**: usa diálogos nativos, exportación PNG/JPEG/WebP y recorte con FFmpeg WASM cargado bajo
  demanda.

### Flujo de trabajo para creadores

1. Explora ejemplos de prompts u organiza textos y referencias en el lienzo.
2. Elige herramienta y modelo, y configura prompt, referencias y parámetros disponibles.
3. Envía, revisa resultados y ajusta la siguiente generación.
4. Encuentra resultados en la biblioteca y utiliza archivos guardados o exportados en la producción posterior.

La generación requiere conexión, una Client Key de Flaq AI válida y créditos suficientes. Los modelos se ejecutan en la
nube; borradores, proyectos e índices locales no ofrecen sincronización entre dispositivos.

## Primeros pasos: ejecutar el cliente y conectar Flaq AI

### Requisitos

- Node.js **22**, según [.nvmrc](./.nvmrc).
- pnpm **10.5.2**, según `packageManager` en [package.json](./package.json).
- Rust y los [requisitos de Tauri](https://v2.tauri.app/start/prerequisites/) del sistema de destino para desarrollo y
  empaquetado nativos. Compilar solo el frontend no requiere Rust.
- Cuenta de Flaq AI y Client Key para generar realmente. La subida predeterminada **no** requiere una cuenta propia de
  Cloudflare.

Desde la raíz del repositorio:

```bash
pnpm install --frozen-lockfile
pnpm desktop:dev
```

Desarrollo usa `ai.flaq.creator.dev`; la aplicación instalada, `ai.flaq.creator`. Configuración, datos WebView y
carpetas predeterminadas de medios están separados.

### Conectar Flaq AI

1. Inicia sesión en [Flaq AI](https://flaq.ai/es/) y obtén una Client Key.
2. Sigue la guía inicial o abre Ajustes → Conexión.
3. Usa la Base URL `https://api.flaq.ai` o una pasarela compatible y de confianza.
4. Introduce la clave, prueba la conexión y guarda.
5. Mantén el proveedor de subida integrado o configura explícitamente tu perfil R2.
6. Elige herramienta y modelo, introduce prompt/referencias y envía. Gestiona resultados en Ajustes → Historial y cambia
   la carpeta de archivo en Ajustes → General.

> **Almacenamiento de credenciales:** «Recordarme» guarda JSON legible en `auth.json`, en el directorio de configuración
> del usuario actual. **No utiliza el llavero del sistema ni cifrado de aplicación.** En Unix los permisos se limitan al
> usuario actual; las credenciales de sesión no se guardan en ese archivo nativo. Evita recordar claves en equipos
> compartidos y nunca incluyas claves, registros con secretos ni configuración local en commits.

### Subida de medios y almacenamiento local

| Elemento             | Implementación actual                                                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Subida integrada     | La Client Key solicita URL firmadas temporales a `/api/v1/files/presignedUrl` y sube los medios directamente. Las credenciales R2 compartidas permanecen en el servidor, fuera del paquete. |
| R2 personalizado     | ID de cuenta, bucket, claves de acceso y secreta, y dominio público opcionales. Firma local; perfiles con AES-GCM en WebView, no en una bóveda del sistema.                                 |
| Borradores           | IndexedDB conserva bytes y metadatos; seleccionar no sube el archivo. Se sube al enviar la generación.                                                                                      |
| Historial y catálogo | Web Storage local indexa tareas y referencias subidas. Las entradas no otorgan propiedad ni permiso de borrado en la nube.                                                                  |
| Archivos generados   | Guardado nativo en streaming en la raíz configurada, por defecto el directorio de datos de la aplicación. Un fallo de archivo no invalida una generación completada.                        |

R2 personalizado necesita un dominio público accesible para medios, no solo el endpoint S3. La retención depende de Flaq
o del ciclo de vida del bucket; el archivo local es independiente. El cifrado de perfiles en el navegador no protege
contra un WebView comprometido ni contra quien acceda al perfil y código de la aplicación. Usa pasarelas y destinos de
confianza.

### Modo Web opcional

Se conserva el modo Next.js original con servidor:

```bash
pnpm dev
pnpm build
pnpm start
```

Abre `http://localhost:3000`. Para configurar el entorno Web, copia [.env.example](./.env.example) a `.env.local` con tu
editor y completa solo los valores necesarios.

| Variables                                                                     | Uso                                                          |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CONTACT_US_EMAIL`                        | URL pública y datos de contacto                              |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` | Credenciales exclusivas del servidor para firmar subidas Web |

Las subidas Web usan `app/api/upload/presigned-url/route.ts` y el dominio público de Alojamiento de imágenes. El cliente
usa firmas Flaq: no necesita variables R2 locales ni servidor API Next.js local. Nunca antepongas `NEXT_PUBLIC_` a
secretos ni los incluyas en instaladores.

## Arquitectura del cliente: Tauri 2, Rust y Next.js

**Tauri 2 + Rust aloja una interfaz Next.js exportada estáticamente, sin servidor Node.js/Next.js incluido.** Escritorio
y Web comparten páginas React, formularios, contratos de modelos, traducciones y recursos de diseño.

### Tecnología moderna para la creación diaria

- **Capa nativa e interfaz estática**: Tauri 2 usa el WebView del sistema y Rust gestiona ventanas, configuración y
  archivos. No requiere servidor Node.js local.
- **Tipos y validación**: TypeScript, contratos compartidos y Zod alinean formularios y API, reduciendo
  incompatibilidades de parámetros y facilitando integraciones.
- **Tareas asíncronas y módulos bajo demanda**: consultas centralizadas y concurrencia limitada coordinan el trabajo.
  FFmpeg y firma R2 personalizada cargan cuando se necesitan, reduciendo trabajo al iniciar.
- **Guardado fiable**: Rust descarga a archivos temporales y publica los completos, reduciendo resultados parciales tras
  interrupciones. Los estados separados de generación y archivo permiten recuperación.

### Privacidad de archivos: almacenamiento local y subidas controladas

El cliente protege los materiales con flujos explícitos y comprobaciones de acceso:

- **Borradores locales primero**: IndexedDB conserva medios y metadatos. Seleccionar no sube archivos; la subida
  comienza al enviar la generación.
- **Autorización temporal**: el proveedor integrado obtiene URL firmadas con la Client Key. Las credenciales R2
  compartidas quedan en el servicio y no se distribuyen con la aplicación.
- **Acceso individual desde el lienzo**: el código nativo resuelve rutas reales y comprueba que sean medios archivados
  en un directorio permitido antes de autorizar su vista previa.
- **Configuración separada**: desarrollo e instalación usan identificadores y datos WebView distintos. En Unix, solo el
  usuario actual lee y escribe las conexiones recordadas.

**Límites de privacidad:** guardar localmente no implica funcionamiento totalmente sin conexión ni cifrado de archivos.
Los prompts y referencias pertinentes se envían al servicio configurado; la retención depende de sus políticas o del
bucket. Las Client Keys recordadas son JSON legible, no entradas del llavero. Consulta «Subida de medios y
almacenamiento local».

### Tecnologías y estructura del código

| Capa                           | Implementación y responsabilidad                                                                |
| ------------------------------ | ----------------------------------------------------------------------------------------------- |
| Interfaz                       | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Radix UI, Framer Motion                       |
| Formularios y estado           | React Hook Form + Zod; Zustand; SWR donde corresponde                                           |
| Contratos de funciones/modelos | Registro de ocho herramientas; entradas, límites y valores predeterminados compartidos          |
| Servicios                      | Adaptadores Flaq, política de subidas, consultas centralizadas y ciclos de generación/archivo   |
| Límite de plataforma           | HTTP nativo/Web, exportación/guardado y enlaces; la UI no llama directamente a comandos nativos |
| Capa nativa                    | Tauri 2 / Rust: configuración, permisos, ventanas, registros, streaming y guardado atómico      |
| Localización                   | next-intl, 15 idiomas registrados, árabe RTL                                                    |
| Verificación                   | Regresiones Node/tsx, pruebas Rust y de diseño Playwright, ESLint y TypeScript                  |

```text
app/[locale]/       Páginas localizadas de herramientas, biblioteca, inicio y políticas
app/api/            Firma de subidas y proxy de imágenes exclusivos de Web
components/         UI compartida, capa de escritorio, formularios, diálogos, visores
hooks/              Integración UI y hooks reutilizables
lib/features/       Registro de funciones
lib/constants/template-models/  Contratos de modelos
lib/desktop/        Conexión, borradores, catálogo y preferencias de medios
lib/platform/       Adaptadores nativos/Web
lib/recommended-prompts*        Definiciones e instantánea de prompts seleccionados
network/            Clientes API, subidas, consultas, historial y ciclos de vida
store/              Estado Zustand compartido
i18n/ + messages/   Idiomas, rutas y traducciones
src-tauri/          Capa Rust, capacidades y configuración de paquetes
scripts/            Builds aislados, preparación de medios, sincronización y publicación
tests/              Contratos, almacenamiento, recuperación, builds/publicación y regresiones UI
public/             Recursos de la aplicación e imágenes de prompts incluidas
docs/               Arquitectura, guía de módulos, revisiones y banner README
```

El build de escritorio trabaja en un directorio aislado, excluye allí las rutas Web y sustituye `out/` solo si termina
correctamente; no mueve ni borra rutas fuente. HTTP nativo procesa API, subidas y descargas sin las restricciones CORS
del navegador. Firma AWS para R2 personalizado y FFmpeg local cargan bajo demanda. Las subidas limitan concurrencia, el
procesamiento compartido de medios se serializa y las consultas se centralizan.

Para ampliar módulos, actualiza registro y contratos, coloca API en `network/`, reutiliza `lib/platform/` y añade
traducciones y regresiones. Consulta:

- [Arquitectura y límites de almacenamiento](./docs/DESKTOP_ARCHITECTURE.md)
- [Añadir módulos y QA local](./docs/ADDING_MODULES.md)
- [Vocabulario del dominio](./CONTEXT.md)
- [Inventario del producto](./docs/PRODUCT_INVENTORY.md) e [informe de revisión](./docs/REVIEW_REPORT.md): registros
  puntuales, no garantía de validación de la versión actual.

## Compilación, pruebas y empaquetado del cliente

| Comando                                           | Propósito                                                               |
| ------------------------------------------------- | ----------------------------------------------------------------------- |
| `pnpm desktop:dev`                                | Preparar medios e iniciar UI de desarrollo y aplicación nativa          |
| `pnpm build:desktop`                              | Frontend estático a `out/` para todos los idiomas registrados           |
| `pnpm desktop:build`                              | Compilar frontend y paquetes nativos para el sistema actual             |
| `pnpm check`                                      | TypeScript + regresiones Node + ESLint                                  |
| `pnpm test:ui-layout`                             | Pruebas de diseño Playwright; requiere Google Chrome y puerto 3000      |
| `cargo test --manifest-path src-tauri/Cargo.toml` | Pruebas Rust nativas; requiere dependencias de compilación de destino   |
| `pnpm prompts:sync`                               | Mantenimiento: actualizar prompts y recursos seleccionados desde la red |

Para simular generaciones, ejecuta `pnpm build:desktop` y después `node scripts/desktop-preview.mjs`. Abre
`http://127.0.0.1:4173/zh/`, configura Base URL como `http://127.0.0.1:4173` y usa `test-only-key` sin recordarla. Las
API simuladas no validan generación Flaq real, subidas R2 ni comportamiento nativo. No uses claves reales.

### Estado del empaquetado

El [flujo de publicación](./.github/workflows/desktop-build.yml) define:

| Destino             | Artefactos                                               |
| ------------------- | -------------------------------------------------------- |
| macOS Apple Silicon | `.dmg` y `.app` comprimida en ZIP                        |
| macOS Intel         | `.dmg` y `.app` comprimida en ZIP                        |
| Windows x64         | Instalador NSIS `.exe`; sin MSI                          |
| Linux               | Compilable desde código; no incluido en la matriz actual |

Las ejecuciones manuales generan candidatos; las etiquetas `desktop-v<version>` correspondientes activan la publicación.
Los resultados incluyen `SHA256SUMS` y `release-manifest.json`. Los paquetes actuales no están firmados; la distribución
pública aún necesita firma/notarización y pruebas nativas de arranque. Un flujo definido no demuestra que todas las
plataformas se hayan compilado y probado.

## Idiomas y localización de la interfaz (i18n)

El registro y los README cubren: `en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`, `ko`, `th`, `vi`,
`ar`.

- Las rutas de escritorio siempre incluyen idioma, también `/en/`. Se prioriza el guardado, luego el del sistema y luego
  inglés. Las variantes de chino tradicional corresponden a `tw`.
- Web usa `/` para inglés y prefijos para los demás. Árabe usa dirección RTL.
- **Limitación actual:** algunos textos recientes de ajustes, biblioteca y prompts están escritos directamente en chino
  e inglés. `zh`/`tw` comparten chino; los demás usan inglés en esos paneles. Registrar 15 idiomas no significa traducir
  cada texto nuevo.
- Añade idiomas en [i18n/languages.ts](./i18n/languages.ts), `messages/`, rutas/builds, README y pruebas de paridad.

## Equipo Flaq AI: ingeniería de IA y procesos creativos

[Flaq AI](https://flaq.ai/es/) es operada por **FLAQ AI PTE. LTD.**, registrada en Singapur. El equipo combina diseño de
producto, ingeniería de modelos y API, y experiencia creativa para ayudar a creadores, desarrolladores y empresas a
entender, comparar y utilizar IA.

Trabaja en experiencias de modelos y herramientas, integración API y aplicaciones de modelos de imagen, vídeo, audio y
lenguaje, transformando ideas en procesos de producción utilizables.

Más información: [equipo y empresa Flaq AI](https://flaq.ai/about/). Contacto:
[contact@flaq.ai](mailto:contact@flaq.ai).

## Afiliación Flaq AI: comparte herramientas y gana recompensas

Participa como afiliado y recibe comisiones por presentar procesos de imágenes y vídeos, API y herramientas creativas.
El programa acoge a creadores, diseñadores, desarrolladores, educadores de IA, evaluadores de modelos y equipos que
comparten aplicaciones prácticas.

- **Recompensas por referidos** — 20 % del primer pedido de pago válido y 10 % de los siguientes dentro de los 60 días
  posteriores al registro, según elegibilidad y atribución.
- **Promoción flexible** — Comparte tu enlace en tutoriales, reseñas, muestras creativas, comunidades o guías de
  integración API.
- **Espacio de socios** — Gestiona enlaces, actividad de referidos y datos de cobro en Flaq AI.

Inicia sesión, completa perfil y acuerdo de afiliación, y crea tu enlace. El proyecto incluye accesos promocionales
localizados; la inscripción y las comisiones se gestionan en Flaq AI, no en el cliente.

**[Unirse al programa de afiliación Flaq AI →](https://flaq.ai/es/affiliate-program/)**

> Elegibilidad, atribución, reembolsos, revisión de pagos y acuerdos personalizados aprobados se rigen por las
> condiciones vigentes en la página oficial.

## Licencia

Proyecto de código abierto bajo [licencia MIT](LICENSE).
