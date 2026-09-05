# Flaq SaaS Template (Português do Brasil)

Template SaaS gratuito e de código aberto para criar plataformas de geração de imagens e vídeos por IA com a API
unificada da Flaq.ai.

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

## Sobre a Flaq.ai

A [Flaq.ai](https://flaq.ai/pt/) reúne os principais modelos de geração de imagens e vídeos em uma API, com autenticação
consistente. O template já implementa conexão com a API, consulta de status, exibição dos resultados e download.

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

## Programa de Afiliados da Flaq.ai

No [Programa de Afiliados da Flaq.ai](https://flaq.ai/pt/affiliate-program?utm_source=flaq-saas-template), você pode
ganhar 20% sobre o primeiro pedido pago válido de um usuário indicado e 10% sobre os pedidos pagos válidos seguintes
realizados em até 60 dias após o cadastro. A elegibilidade e os pagamentos seguem os termos atuais da página do
programa.

## Internacionalização

O código e os READMEs oferecem os mesmos 15 locales: `en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`,
`ko`, `th`, `vi` e `ar`. O inglês usa `/`, os demais idiomas usam `/{locale}/` e o árabe é exibido da direita para a
esquerda.

## Documentação e licença

Para configuração completa, stack técnico e deploy, consulte [README.md](./README.md) ou [README_zh.md](./README_zh.md).
O projeto é disponibilizado sob a [MIT License](LICENSE).
