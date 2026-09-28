![Flaq Open Media Creator](./docs/assets/flaq-open-media-creator-banner.png)

# Flaq Open Media Creator

Um **aplicativo desktop de código aberto para criar imagens e vídeos com IA**, para criadores, designers e equipes de
marca. Reúna inspiração para prompts, mídias de referência e uma tela infinita para gerar, visualizar, refinar e
organizar suas criações localmente.

Adaptado do [Flaq SaaS Template](https://github.com/flaqai/flaq-saas-template), conecta os modelos Flaq AI por meio de
Tauri 2 + Rust e uma interface React moderna. O aplicativo instalado se chama **Flaq Creator**.

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português (Brasil)](./README_pt.md) · [Español](./README_es.md) ·
[Deutsch](./README_de.md) · [Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) ·
[繁體中文](./README_tw.md) · [한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) ·
[العربية](./README_ar.md)

## Capturas do aplicativo desktop: espaço de trabalho, criação com IA e canvas infinito

Capturadas no aplicativo desktop macOS em execução, com interface em inglês. Os painéis de criação mostram rascunhos locais de demonstração; as imagens da biblioteca de prompts são exemplos incluídos.

### Espaço criativo — ferramentas, inspiração de prompts e atalhos para mídias

![Espaço criativo — ferramentas, inspiração de prompts e atalhos para mídias](./docs/assets/screenshots/desktop-workspace.jpg)

### Criação de imagens com IA — prompts, modelos e configurações de geração

![Criação de imagens com IA — prompts, modelos e configurações de geração](./docs/assets/screenshots/desktop-ai-creator.jpg)

### Canvas infinito — organize briefings criativos e nós de geração

![Canvas infinito — organize briefings criativos e nós de geração](./docs/assets/screenshots/desktop-canvas.jpg)

### Inspiração de prompts — explore exemplos visuais e prompts reutilizáveis

![Inspiração de prompts — explore exemplos visuais e prompts reutilizáveis](./docs/assets/screenshots/desktop-prompt-library.jpg)

## Plataforma de modelos Flaq AI e ferramentas criativas online

[Flaq AI](https://flaq.ai/pt/) reúne modelos de destaque para geração e edição de imagens, geração de vídeos e tarefas
de linguagem, atendendo criadores, desenvolvedores e empresas.

- **APIs estáveis com alta concorrência** — Integre geração de IA aos produtos e processos de produção por uma API
  unificada.
- **Crie diretamente online** — Experimente modelos e ferramentas no navegador em [Flaq AI](https://flaq.ai/pt/), sem
  programar nem instalar o aplicativo.
- **Explore e integre** — Compare modelos no [catálogo](https://flaq.ai/pt/model-market/) e consulte a
  [documentação da API](https://flaq.ai/pt/docs/).

Contato comercial: [contact@flaq.ai](mailto:contact@flaq.ai)

## Recursos do desktop com IA: de ideias a imagens e vídeos

### Geração de imagens, criação de vídeos e provador virtual

Oito entradas apoiam a criação diária. Explore ideias no espaço unificado ou use ferramentas específicas para imagens de
produtos, redes sociais, conceitos de campanhas e vídeos curtos.

| Ferramenta            | Possibilidades criativas                                                     | Rota                  |
| --------------------- | ---------------------------------------------------------------------------- | --------------------- |
| AI Media Creator      | Crie imagens e vídeos no mesmo espaço, revise resultados e refine ideias     | `/ai-media-creator`   |
| Tela infinita de IA   | Organize textos, mídias e configurações em um projeto local salvo            | `/ai-canvas`          |
| Texto para imagem     | Explore estilos para capas, cartazes e cenas de produtos a partir de prompts | `/text-to-image`      |
| Imagem para imagem    | Desenvolva estilos e direções visuais com imagens de referência              | `/image-to-image`     |
| Provador virtual      | Combine referências de roupas e modelos para moda e comércio                 | `/virtual-try-on`     |
| Texto para vídeo      | Transforme ideias escritas em cenas animadas e conceitos de campanhas        | `/text-to-video`      |
| Imagem para vídeo     | Crie visuais animados de produtos e clipes a partir de imagens estáticas     | `/image-to-video`     |
| Referência para vídeo | Oriente a criação de vídeos com mídias de referência                         | `/reference-to-video` |

As rotas omitem o prefixo de idioma. As ferramentas compartilham o [registro de recursos](./lib/features/catalog.ts).
Entradas, limites e parâmetros dependem do modelo selecionado e dos
[contratos de modelos](./lib/constants/template-models/).

### Inspiração em prompts e tela infinita para explorar ideias

- **Comece por exemplos**: explore a biblioteca, copie prompts completos e examine prévias de imagens/vídeos com zoom e
  deslocamento. Imagens de exemplo vêm incluídas; vídeos são transmitidos online. O nome de um modelo em uma coleção não
  garante sua disponibilidade nos formulários.
- **Organize projetos visualmente**: distribua textos, mídias e configurações na tela. Desloque, amplie e trabalhe com
  nós, salve o projeto local e continue depois.
- **Escolha modelos para cada tarefa**: ajuste parâmetros compatíveis com ajuda contextual. O guia inicial e o teste de
  conexão facilitam a configuração; aparência e idioma adaptam o espaço ao uso diário.

### Biblioteca local, recuperação de rascunhos e exportação

- **Encontre referências e trabalhos**: pesquise referências enviadas e resultados por tipo e origem, visualize, baixe e
  confira o arquivamento local. Abra `/media-library` ou Configurações → Histórico.
- **Preserve o progresso**: rascunhos guardam prompts, parâmetros e mídias localmente. Histórico e índices de
  referências ficam no dispositivo. Recuperar tarefas pendentes consulta a tarefa original, sem enviar outra geração
  paga.
- **Arquive resultados**: imagens e vídeos são salvos em `YYYY/MM/DD` dentro de uma pasta configurável para edição e
  entrega. A recuperação tenta salvar resultados existentes, sem gerar novamente.
- **Prepare a próxima etapa**: use diálogos nativos, exportação PNG/JPEG/WebP e corte com FFmpeg WASM carregado sob
  demanda.

### Um fluxo prático para criadores

1. Explore exemplos de prompts ou organize textos e referências na tela.
2. Escolha ferramenta e modelo e configure prompt, referências e parâmetros disponíveis.
3. Envie, visualize resultados e refine a próxima geração.
4. Encontre resultados na biblioteca e use arquivos salvos ou exportados na produção seguinte.

A geração exige internet, uma Client Key Flaq AI válida e créditos suficientes. Os modelos rodam na nuvem; rascunhos,
projetos e índices locais não oferecem sincronização entre dispositivos.

## Primeiros passos: executar o aplicativo e conectar Flaq AI

### Requisitos

- Node.js **22**, conforme [.nvmrc](./.nvmrc).
- pnpm **10.5.2**, conforme `packageManager` em [package.json](./package.json).
- Rust e os [pré-requisitos do Tauri](https://v2.tauri.app/start/prerequisites/) do sistema de destino para
  desenvolvimento e pacotes nativos. Compilar só o frontend não exige Rust.
- Conta Flaq AI e Client Key para geração real. O upload padrão **não** exige uma conta própria da Cloudflare.

Na raiz do repositório:

```bash
pnpm install --frozen-lockfile
pnpm desktop:dev
```

O desenvolvimento usa `ai.flaq.creator.dev`; o aplicativo instalado, `ai.flaq.creator`. Configurações, dados WebView e
pastas padrão de mídia são separados.

### Conectar Flaq AI

1. Entre em [Flaq AI](https://flaq.ai/pt/) e obtenha uma Client Key.
2. Siga o guia inicial ou abra Configurações → Conexão.
3. Use a Base URL `https://api.flaq.ai` ou um gateway compatível e confiável.
4. Informe a chave, teste a conexão e salve.
5. Mantenha o provedor integrado ou configure explicitamente seu perfil R2.
6. Escolha ferramenta e modelo, informe prompt/referências e envie. Gerencie resultados em Configurações → Histórico e
   altere a pasta de arquivo em Configurações → Geral.

> **Credenciais:** “Lembrar de mim” salva JSON legível em `auth.json`, no diretório de configuração do usuário atual.
> **Não é o chaveiro do sistema nem criptografia da aplicação.** No Unix, as permissões se limitam ao usuário atual;
> credenciais apenas da sessão não são gravadas nesse arquivo nativo. Evite lembrar chaves em dispositivos
> compartilhados e nunca inclua chaves, logs com segredos ou configurações locais em commits.

### Upload de mídias e armazenamento local

| Item                 | Implementação atual                                                                                                                                                                           |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Upload integrado     | A Client Key solicita URLs assinadas temporárias em `/api/v1/files/presignedUrl`; depois a mídia é enviada diretamente. Credenciais R2 compartilhadas permanecem no servidor, fora do pacote. |
| R2 personalizado     | ID de conta, bucket, chave de acesso, chave secreta e domínio público opcionais. Assinatura local; perfis com AES-GCM no WebView, não em um cofre do sistema.                                 |
| Rascunhos            | IndexedDB guarda bytes e metadados. Selecionar não envia o arquivo; o upload acontece na submissão.                                                                                           |
| Histórico e catálogo | Web Storage local indexa tarefas e referências enviadas. Entradas não concedem propriedade nem permissão para excluir na nuvem.                                                               |
| Arquivos gerados     | Gravação nativa em streaming na raiz configurada, por padrão nos dados do aplicativo. Falha ao arquivar não invalida uma geração concluída.                                                   |

R2 personalizado exige um domínio público acessível para mídia, não apenas o endpoint S3. A retenção depende da política
Flaq ou do ciclo de vida do bucket; o arquivo local é independente. A criptografia de perfis no navegador não protege
contra WebView comprometido ou invasores com acesso ao perfil e código do app. Use gateways e destinos confiáveis.

### Modo Web opcional

O modo Next.js original com servidor é mantido:

```bash
pnpm dev
pnpm build
pnpm start
```

Acesse `http://localhost:3000`. Para configurar o ambiente Web, copie [.env.example](./.env.example) para `.env.local`
no editor e preencha apenas os valores necessários.

| Variáveis                                                                     | Uso                                                         |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CONTACT_US_EMAIL`                        | URL pública e informações de contato                        |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` | Credenciais exclusivas do servidor para assinar uploads Web |

Uploads Web usam `app/api/upload/presigned-url/route.ts` e o domínio público de Hospedagem de imagens. O desktop usa
assinaturas Flaq, sem variáveis R2 locais ou servidor API Next.js local. Nunca prefixe segredos com `NEXT_PUBLIC_` nem
os inclua nos instaladores.

## Arquitetura desktop: Tauri 2, Rust e Next.js

**Tauri 2 + Rust hospeda uma interface Next.js exportada estaticamente, sem servidor Node.js/Next.js incluído.** Desktop
e Web compartilham páginas React, formulários, contratos, traduções e recursos de design.

### Tecnologia moderna para a criação diária

- **Camada nativa e interface estática**: Tauri 2 usa o WebView do sistema; Rust gerencia janelas, configuração e
  arquivos. Não precisa de servidor Node.js local.
- **Tipos e validação**: TypeScript, contratos compartilhados e Zod alinham formulários e requisições API, reduzindo
  incompatibilidades de parâmetros e simplificando integrações.
- **Tarefas assíncronas e módulos sob demanda**: consultas centralizadas e concorrência limitada coordenam o trabalho.
  FFmpeg e assinatura R2 personalizada carregam quando necessário, reduzindo trabalho na inicialização.
- **Gravação confiável**: Rust baixa em arquivos temporários antes de publicar os completos, reduzindo resultados
  parciais após interrupções. Estados separados de geração e arquivo permitem recuperação.

### Privacidade dos arquivos: dados locais e uploads controlados

Fluxos explícitos de dados e verificações de acesso protegem os materiais:

- **Rascunhos primeiro no dispositivo**: IndexedDB mantém mídia e metadados. Selecionar não envia; o upload começa ao
  submeter a geração.
- **Autorização temporária**: o provedor obtém URLs assinadas com a Client Key. Credenciais R2 compartilhadas ficam no
  serviço, nunca no aplicativo.
- **Acesso por arquivo na tela**: o código nativo resolve caminhos reais e verifica se o arquivo é uma mídia arquivada
  em uma pasta permitida antes de autorizar sua prévia.
- **Configurações separadas**: desenvolvimento e instalação usam IDs e dados WebView diferentes. No Unix, apenas o
  usuário atual lê e grava conexões lembradas.

**Limites de privacidade:** armazenamento local não significa processamento totalmente offline nem arquivos
criptografados. Prompts e referências pertinentes são enviados aos serviços configurados; a retenção remota depende do
serviço ou bucket. Client Keys lembradas ficam em JSON legível, não no chaveiro. Veja “Upload de mídias e armazenamento
local”.

### Tecnologias e estrutura do código

| Camada                       | Implementação e responsabilidade                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| Interface                    | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Radix UI, Framer Motion             |
| Formulários e estado         | React Hook Form + Zod; Zustand; SWR onde utilizado                                    |
| Contratos de funções/modelos | Registro de oito ferramentas; entradas, limites e padrões compartilhados              |
| Serviços                     | Adaptadores Flaq, política de uploads, consultas e ciclos de geração/arquivo          |
| Limite da plataforma         | HTTP nativo/Web, exportação/gravação, links externos; UI sem chamadas nativas diretas |
| Camada nativa                | Tauri 2 / Rust: configuração, permissões, janelas, logs, streaming e gravação atômica |
| Localização                  | next-intl, 15 idiomas registrados, árabe RTL                                          |
| Verificação                  | Regressões Node/tsx, testes Rust e de layout Playwright, ESLint e TypeScript          |

```text
app/[locale]/       Páginas localizadas de ferramentas, biblioteca, início e políticas
app/api/            Assinatura de uploads e proxy de imagens exclusivos da Web
components/         UI compartilhada, desktop, formulários, diálogos, visualizadores de mídia/prompts
hooks/              Integração UI e hooks reutilizáveis
lib/features/       Registro de recursos
lib/constants/template-models/  Contratos de modelos
lib/desktop/        Conexão, rascunhos, catálogo e preferências de mídia
lib/platform/       Adaptadores nativos/Web
lib/recommended-prompts*        Definições e snapshot dos prompts selecionados
network/            Clientes API, uploads, consultas, histórico e ciclo de vida
store/              Estado Zustand compartilhado
i18n/ + messages/   Idiomas, rotas e traduções
src-tauri/          Camada Rust, capacidades e configuração de pacotes
scripts/            Builds isolados, preparação de mídia, sincronização e publicação
tests/              Contratos, armazenamento, recuperação, build/release e regressões UI
public/             Recursos do app e imagens de prompts incluídas
docs/               Arquitetura, módulos, revisões e banner README
```

Builds desktop usam uma pasta isolada, excluem ali rotas apenas Web e substituem `out/` só quando bem-sucedidos, sem
mover ou excluir rotas fonte. HTTP nativo atende API, uploads e downloads sem as restrições CORS do navegador.
Assinatura AWS para R2 personalizado e FFmpeg local carregam sob demanda. Uploads têm concorrência limitada,
processamento compartilhado de mídia é serializado e consultas são centralizadas.

Para novos módulos, amplie registro e contratos, mantenha API em `network/`, reutilize `lib/platform/` e adicione
traduções e testes de regressão. Consulte:

- [Arquitetura e limites de armazenamento](./docs/DESKTOP_ARCHITECTURE.md)
- [Adicionar módulos e QA local](./docs/ADDING_MODULES.md)
- [Vocabulário do domínio](./CONTEXT.md)
- [Inventário do produto](./docs/PRODUCT_INVENTORY.md) e [relatório de revisão](./docs/REVIEW_REPORT.md): registros
  pontuais, não garantia de validação da versão atual.

## Build, testes e pacotes do aplicativo desktop

| Comando                                           | Finalidade                                                      |
| ------------------------------------------------- | --------------------------------------------------------------- |
| `pnpm desktop:dev`                                | Preparar mídias e iniciar UI de desenvolvimento e app nativo    |
| `pnpm build:desktop`                              | Frontend estático em `out/`, todos os idiomas registrados       |
| `pnpm desktop:build`                              | Compilar frontend e pacotes nativos para o sistema atual        |
| `pnpm check`                                      | TypeScript + regressões Node + ESLint                           |
| `pnpm test:ui-layout`                             | Testes de layout Playwright; requer Google Chrome e porta 3000  |
| `cargo test --manifest-path src-tauri/Cargo.toml` | Testes Rust nativos; requer dependências de build do destino    |
| `pnpm prompts:sync`                               | Manutenção: atualizar prompts e recursos selecionados pela rede |

Para geração simulada, execute `pnpm build:desktop` e depois `node scripts/desktop-preview.mjs`. Abra
`http://127.0.0.1:4173/zh/`, defina Base URL como `http://127.0.0.1:4173` e use `test-only-key` sem lembrar. APIs
simuladas não verificam geração Flaq real, uploads R2 nem comportamento nativo. Não use chaves reais.

### Estado dos pacotes

O [fluxo de publicação](./.github/workflows/desktop-build.yml) define:

| Destino             | Artefatos                                                    |
| ------------------- | ------------------------------------------------------------ |
| macOS Apple Silicon | `.dmg` e `.app` em ZIP                                       |
| macOS Intel         | `.dmg` e `.app` em ZIP                                       |
| Windows x64         | Instalador NSIS `.exe`; sem MSI                              |
| Linux               | Build a partir do código; fora da matriz de publicação atual |

Execuções manuais produzem candidatos; tags correspondentes `desktop-v<version>` disparam a publicação. Os artefatos
incluem `SHA256SUMS` e `release-manifest.json`. Pacotes atuais não são assinados; a distribuição pública ainda exige
assinatura/notarização por plataforma e verificação nativa de inicialização. Um fluxo definido não comprova build e
testes bem-sucedidos em todas as plataformas.

## Idiomas e localização da interface (i18n)

Registro e README cobrem: `en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`, `ko`, `th`, `vi`, `ar`.

- Rotas desktop sempre incluem idioma, inclusive `/en/`. Prioridade na inicialização: idioma salvo, sistema, inglês.
  Variantes de chinês tradicional correspondem a `tw`.
- Web usa `/` para inglês e prefixos para os demais. Árabe usa RTL.
- **Limitação atual:** alguns textos novos de configurações e bibliotecas são escritos diretamente em chinês e inglês.
  `zh`/`tw` compartilham chinês; outros usam inglês nesses painéis. Quinze idiomas registrados não significam todas as
  novas strings traduzidas.
- Adicione idiomas em [i18n/languages.ts](./i18n/languages.ts), `messages/`, rotas/builds, README e testes de paridade.

## Equipe Flaq AI: engenharia de IA e processos criativos

[Flaq AI](https://flaq.ai/pt/) é operada por **FLAQ AI PTE. LTD.**, registrada em Singapura. A equipe combina design de
produto, engenharia de modelos e APIs e experiência criativa para ajudar criadores, desenvolvedores e empresas a
entender, comparar e usar IA.

Seu trabalho abrange experiências com modelos e ferramentas, integração API e aplicações práticas de modelos de imagem,
vídeo, áudio e linguagem, transformando ideias em processos de produção utilizáveis.

Saiba mais: [equipe e empresa Flaq AI](https://flaq.ai/about/). Contato: [contact@flaq.ai](mailto:contact@flaq.ai).

## Afiliados Flaq AI: compartilhe ferramentas e ganhe comissões

Torne-se parceiro e receba comissões apresentando processos de imagens/vídeos IA, APIs e ferramentas criativas.
Criadores, designers, desenvolvedores, educadores de IA, avaliadores de modelos e equipes que compartilham usos práticos
são bem-vindos.

- **Recompensas por indicação** — 20% no primeiro pedido pago válido e 10% nos seguintes dentro de 60 dias após o
  cadastro, conforme elegibilidade e atribuição.
- **Promoção flexível** — Compartilhe seu link em tutoriais, avaliações, portfólios, comunidades ou guias de integração
  API.
- **Espaço do parceiro** — Gerencie links, atividade das indicações e configurações de recebimento em Flaq AI.

Entre na Flaq AI, complete perfil e acordo de afiliado e crie seu link. O projeto inclui acessos promocionais
localizados; adesão e comissões são gerenciadas na Flaq AI, não no aplicativo desktop.

**[Participar do programa de afiliados Flaq AI →](https://flaq.ai/pt/affiliate-program/)**

> Elegibilidade, atribuição, reembolsos, análise dos pagamentos e acordos personalizados aprovados seguem os termos mais
> recentes da página oficial.

## Licença

Projeto de código aberto sob a [licença MIT](LICENSE).
