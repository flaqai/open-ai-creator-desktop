![Flaq Open Media Creator](./docs/assets/flaq-open-media-creator-banner.png)

# Flaq Open Media Creator (Português do Brasil)

Um espaço de trabalho desktop de código aberto para criar imagens e vídeos com IA, adaptado do Flaq SaaS Template. O
aplicativo instalado continua se chamando Flaq Creator.

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português (Brasil)](./README_pt.md) · [Español](./README_es.md) ·
[Deutsch](./README_de.md) · [Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) ·
[繁體中文](./README_tw.md) · [한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) ·
[العربية](./README_ar.md)

## Sobre a Flaq AI

A [Flaq AI](https://flaq.ai/pt/) é uma plataforma de IA para criadores, desenvolvedores e empresas que reúne os
principais modelos de IA amplamente utilizados para gerar e editar imagens, criar vídeos e trabalhar com linguagem.

- **APIs com alta concorrência e estabilidade** — Integre a geração de IA aos seus produtos e fluxos de produção por
  meio de uma API unificada.
- **Uso direto online** — Utilize modelos e ferramentas criativas na [Flaq AI](https://flaq.ai/pt/) pelo navegador, sem
  escrever código nem instalar o aplicativo desktop.
- **Explore e integre modelos** — Compare recursos no [mercado de modelos](https://flaq.ai/pt/model-market/) e comece
  pela [documentação da API](https://flaq.ai/pt/docs/).

Contato comercial: [contact@flaq.ai](mailto:contact@flaq.ai)

## Implementação atual

Tauri 2 e Rust hospedam a interface estática de Next.js 16 e React 19, sem servidor Node.js/Next.js embarcado.
Formulários, contratos dos modelos e design são compartilhados com a versão web.

Sete entradas: AI Media Creator, texto para imagem, imagem para imagem, provador virtual, texto para vídeo, imagem para
vídeo e referência para vídeo. Inclui biblioteca de prompts, catálogo pesquisável, histórico nas configurações,
rascunhos IndexedDB e arquivamento local por data. Imagens de exemplo vêm incluídas; vídeos são reproduzidos online.
Geração e arquivamento têm estados de sucesso separados.

## Início rápido

Execute na raiz deste repositório. Requer Node.js 22, pnpm 10.5.2, Rust e dependências Tauri do sistema. Em
Configurações → Conexão, informe seu Client Key Flaq AI, teste e salve. Base URL padrão: `https://api.flaq.ai`. Gerações
reais exigem internet e créditos de API.

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

## Uploads e credenciais

O upload padrão recebe URLs assinadas temporárias de Flaq `/api/v1/files/presignedUrl`. As credenciais R2 compartilhadas
ficam no servidor; não é necessário ter conta própria Cloudflare. R2 personalizado é opcional e assina localmente.
Predefinições AES-GCM no WebView não são um cofre do sistema operacional. Ao lembrar a chave, o Client Key é salvo em
texto simples no `auth.json` do diretório de configuração do aplicativo.

## Plataformas e idiomas

A configuração de lançamento inclui macOS Apple Silicon/Intel (DMG, ZIP) e Windows x64 (NSIS EXE). Linux pode ser
compilado do código, mas não integra a matriz de lançamento. Os pacotes atuais não são assinados. Há 15 idiomas
registrados, mas partes dos novos painéis de configurações, mídia e prompts só estão em chinês/inglês: `zh`/`tw`
compartilham chinês, os demais usam inglês. O desktop sempre usa prefixo, inclusive `/en/`; na web, inglês usa `/` e os
demais usam prefixos. Árabe usa RTL.

`en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`, `ko`, `th`, `vi`, `ar`

## Programa de Afiliados da Flaq AI

Torne-se um parceiro afiliado da Flaq AI e ganhe comissões apresentando fluxos de imagem e vídeo com IA, APIs de modelos
e ferramentas criativas. O programa recebe criadores, designers, desenvolvedores, educadores de IA, avaliadores de
modelos e equipes que compartilham fluxos práticos de IA.

- **Recompensas por indicação** — Ganhe 20% sobre o primeiro pedido pago válido de um usuário indicado e 10% sobre os
  pedidos pagos válidos seguintes em até 60 dias após o cadastro, conforme as regras de elegibilidade e atribuição.
- **Promoção flexível** — Compartilhe seu link em tutoriais, avaliações, projetos criativos, comunidades ou guias de
  integração de APIs.
- **Área do parceiro** — Gerencie links, acompanhe indicações e configure os recebimentos na Flaq AI.

Entre na Flaq AI, complete seu perfil de afiliado e aceite o acordo para criar seu link de indicação. O projeto também
oferece chamadas de afiliação em vários idiomas; o cadastro de parceiros e a gestão de comissões são feitos na Flaq AI,
não no aplicativo desktop.

**[Participe do Programa de Afiliados da Flaq AI →](https://flaq.ai/pt/affiliate-program/)**

> Elegibilidade das comissões, atribuição, reembolsos, análise dos pagamentos e acordos personalizados aprovados seguem
> os termos mais recentes da página oficial.

## Documentação e licença

Para configuração completa, stack técnico e deploy, consulte [README.md](./README.md) ou [README_zh.md](./README_zh.md).
O projeto é disponibilizado sob a [MIT License](LICENSE).
