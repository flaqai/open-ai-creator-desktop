# Flaq SaaS Template (한국어)

Flaq.ai 통합 API로 AI 이미지 및 동영상 생성 플랫폼을 구축할 수 있는 무료 오픈 소스 SaaS 템플릿입니다.

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português](./README_pt.md) · [Español](./README_es.md) · [Deutsch](./README_de.md) ·
[Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) · [繁體中文](./README_tw.md) ·
[한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) · [العربية](./README_ar.md)

## 템플릿 소개

Next.js 16, React 19, TypeScript, Tailwind CSS로 제작되었습니다. 텍스트-이미지, 이미지-이미지, 텍스트-동영상,
이미지-동영상, 가상 피팅의 다섯 가지 즉시 사용 가능한 생성 흐름을 제공합니다.

### 주요 기능

- 🎨 모델과 매개변수를 선택할 수 있는 이미지·동영상 생성 페이지
- 🔌 하나의 Client Key를 사용하는 Flaq.ai API 통합
- 🧠 Nano Banana Pro, Seedream, GPT Image, Grok Imagine, Veo, Wan, Kling, Seedance, Vidu 등 지원
- 🌐 UI, 라우팅, SEO 대체 링크까지 15개 언어 지원
- ☁️ Cloudflare R2 업로드 및 생성 결과 저장
- 🔒 클라이언트 측 API 키 암호화 저장
- 📱 반응형 UI, 다크 모드, 생성 기록

## Flaq.ai 소개

[Flaq.ai](https://flaq.ai/ko/)는 주요 이미지 및 동영상 생성 모델을 하나의 API와 일관된 인증 방식으로 제공합니다. 이
템플릿에는 API 연결, 상태 폴링, 결과 표시, 다운로드 흐름이 이미 구현되어 있습니다.

## 빠른 시작

```bash
git clone https://github.com/flaqai/flaq-saas-template.git
cd flaq-saas-template
pnpm install
cp .env.example .env.local
pnpm dev
```

`.env.local`에 `NEXT_PUBLIC_SITE_URL`을 설정하고 필요하면 Cloudflare R2 값을 추가하세요. 그다음 앱 설정에서
[Flaq.ai](https://flaq.ai/ko/) Client Key를 입력합니다. 전체 환경 변수와 설정 과정은
[영문 전체 문서](./README.md#getting-started)를 참고하세요.

## Flaq.ai 제휴 프로그램

[Flaq.ai 제휴 프로그램](https://flaq.ai/ko/affiliate-program?utm_source=flaq-saas-template)을 통해 추천 사용자의 첫 유효
유료 주문에서 20%, 가입 후 60일 이내의 후속 유효 유료 주문에서 10%의 커미션을 받을 수 있습니다. 자격 및 지급 기준은
프로그램 페이지의 최신 약관을 따릅니다.

## 국제화

코드와 README는 동일한 15개 locale을 지원합니다: `en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`, `ko`,
`th`, `vi`, `ar`. 영어는 `/`, 다른 언어는 `/{locale}/`를 사용하며 아랍어는 오른쪽에서 왼쪽으로 표시됩니다.

## 문서 및 라이선스

전체 설정, 기술 스택, 배포 방법은 [README.md](./README.md) 또는 [README_zh.md](./README_zh.md)를 참고하세요. 이
프로젝트는 [MIT License](LICENSE)로 제공됩니다.
