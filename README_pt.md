# Flaq SaaS Template (Português do Brasil)

Template SaaS gratuito e de código aberto para criar plataformas de geração de imagens e vídeos por IA com a API
unificada da Flaq.ai.

## Sobre a Flaq.ai

A [Flaq.ai](https://flaq.ai/pt/) é uma plataforma de modelos de IA para criadores e desenvolvedores. Uma única chave de
API oferece acesso unificado à geração e edição de imagens, à geração de vídeos e a modelos de linguagem.

- **Explore e compare modelos** — Consulte recursos, parâmetros compatíveis e preços atuais no
  [Model Market](https://flaq.ai/model-market/).
- **Teste antes de integrar** — Use o Playground da Flaq.ai para testar modelos disponíveis e refinar prompts e
  configurações.
- **Crie fluxos criativos** — Siga a [documentação da API](https://flaq.ai/docs/) para integrar IA aos seus produtos e
  ferramentas.

O Flaq Creator Desktop traz os fluxos de imagem e vídeo para um espaço de trabalho dedicado. Conecte seu Client Key da
Flaq.ai no aplicativo para criar e gerenciar recursos visuais. Nem todas as APIs da plataforma estão disponíveis no
aplicativo desktop; consulte os modelos e preços vigentes na Flaq.ai.

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português](./README_pt.md) · [Español](./README_es.md) · [Deutsch](./README_de.md) ·
[Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) · [繁體中文](./README_tw.md) ·
[한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) · [العربية](./README_ar.md)

## Sobre o template

Construído com Next.js 16, React 19, TypeScript e Tailwind CSS. Inclui cinco fluxos prontos: texto para imagem, imagem
para imagem, texto para vídeo, imagem para vídeo e provador virtual.

### Principais recursos

- 🎨 Páginas de geração de imagens e vídeos com seleção de modelos e parâmetros
- 🔌 Integração com a API da Flaq.ai usando um único Client Key
- 🧠 Compatível com Nano Banana Pro, Seedream, GPT Image, Grok Imagine, Veo, Wan, Kling, Seedance, Vidu e outros modelos
- 🌐 15 idiomas na interface, nas rotas e nos links alternativos de SEO
- ☁️ Upload para Cloudflare R2 e armazenamento dos arquivos gerados
- 🔒 Armazenamento criptografado da chave de API no cliente
- 📱 Interface responsiva, modo escuro e histórico de gerações

## Início rápido

```bash
git clone https://github.com/flaqai/flaq-saas-template.git
cd flaq-saas-template
pnpm install
cp .env.example .env.local
pnpm dev
```

Defina `NEXT_PUBLIC_SITE_URL` em `.env.local` e adicione as configurações do Cloudflare R2 quando necessário. Depois,
informe o Client Key da [Flaq.ai](https://flaq.ai/pt/) nas configurações do aplicativo. Consulte a
[documentação completa em inglês](./README.md#getting-started) para todas as variáveis e etapas.

## Internacionalização

O código e os READMEs oferecem os mesmos 15 locales: `en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`,
`ko`, `th`, `vi` e `ar`. O inglês usa `/`, os demais idiomas usam `/{locale}/` e o árabe é exibido da direita para a
esquerda.

## Programa de Afiliados da Flaq.ai

Torne-se um parceiro afiliado da Flaq.ai e ganhe comissões apresentando fluxos de imagem e vídeo com IA, APIs de modelos
e ferramentas criativas. O programa recebe criadores, designers, desenvolvedores, educadores de IA, avaliadores de
modelos e equipes que compartilham fluxos práticos de IA.

- **Recompensas por indicação** — Ganhe 20% sobre o primeiro pedido pago válido de um usuário indicado e 10% sobre os
  pedidos pagos válidos seguintes em até 60 dias após o cadastro, conforme as regras de elegibilidade e atribuição.
- **Promoção flexível** — Compartilhe seu link em tutoriais, avaliações, projetos criativos, comunidades ou guias de
  integração de APIs.
- **Área do parceiro** — Gerencie links, acompanhe indicações e configure os recebimentos na Flaq.ai.

Entre na Flaq.ai, complete seu perfil de afiliado e aceite o acordo para criar seu link de indicação. O projeto também
oferece chamadas de afiliação em vários idiomas; o cadastro de parceiros e a gestão de comissões são feitos na Flaq.ai,
não no aplicativo desktop.

**[Participe do Programa de Afiliados da Flaq.ai →](https://flaq.ai/pt/affiliate-program/)**

> Elegibilidade das comissões, atribuição, reembolsos, análise dos pagamentos e acordos personalizados aprovados seguem
> os termos mais recentes da página oficial.

## Documentação e licença

Para configuração completa, stack técnico e deploy, consulte [README.md](./README.md) ou [README_zh.md](./README_zh.md).
O projeto é disponibilizado sob a [MIT License](LICENSE).
