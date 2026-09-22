# Flaq SaaS Template (한국어)

Flaq.ai 통합 API로 AI 이미지 및 동영상 생성 플랫폼을 구축할 수 있는 무료 오픈 소스 SaaS 템플릿입니다.

## Flaq.ai 소개

[Flaq.ai](https://flaq.ai/ko/)는 크리에이터와 개발자를 위한 AI 모델 플랫폼입니다. 하나의 API 키로 이미지 생성·편집,
동영상 생성, 언어 모델에 통합 접근할 수 있습니다.

- **모델 탐색과 비교** — [모델 마켓](https://flaq.ai/model-market/)에서 기능, 지원 매개변수, 현재 요금을 비교하세요.
- **연동 전 테스트** — Flaq.ai Playground에서 지원 모델을 테스트하며 프롬프트와 생성 설정을 조정하세요.
- **창작 워크플로 구축** — [API 문서](https://flaq.ai/docs/)를 참고해 제품과 도구에 AI 기능을 통합하세요.

Flaq Creator Desktop은 플랫폼의 이미지·동영상 워크플로를 전용 데스크톱 작업 공간으로 제공합니다. 앱에서 Flaq.ai Client
Key를 연결해 시각 자료를 만들고 관리할 수 있습니다. 플랫폼의 모든 API 기능이 데스크톱 앱에서 지원되는 것은 아닙니다.
이용 가능한 모델과 요금은 Flaq.ai에서 확인하세요.

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

## 국제화

코드와 README는 동일한 15개 locale을 지원합니다: `en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`, `ko`,
`th`, `vi`, `ar`. 영어는 `/`, 다른 언어는 `/{locale}/`를 사용하며 아랍어는 오른쪽에서 왼쪽으로 표시됩니다.

## Flaq.ai 제휴 프로그램

Flaq.ai 제휴 파트너가 되어 AI 이미지·동영상 워크플로, 모델 API, 창작 도구를 소개하고 추천 수수료를 받으세요. 크리에이터,
디자이너, 개발자, AI 교육자, 모델 리뷰어, 실용적인 AI 워크플로를 공유하는 팀을 환영합니다.

- **추천 보상** — 추천 사용자의 첫 유효 유료 주문에서 20%, 가입 후 60일 이내의 후속 유효 유료 주문에서 10%의 수수료를
  받을 수 있습니다. 자격 및 추천 기여도 인정 규칙이 적용됩니다.
- **다양한 홍보 방식** — 튜토리얼, 모델 리뷰, 창작 사례, 커뮤니티, API 연동 가이드에서 전용 추천 링크를 공유하세요.
- **파트너 작업 공간** — Flaq.ai에서 추천 링크와 추천 활동을 확인하고 지급 정보를 설정할 수 있습니다.

Flaq.ai에 로그인하고 제휴 프로필과 약관 동의를 완료한 후 전용 추천 링크를 만드세요. 이 프로젝트도 다국어 제휴 안내를
제공하지만, 파트너 신청과 수수료 관리는 데스크톱 앱이 아닌 Flaq.ai에서 이루어집니다.

**[Flaq.ai 제휴 프로그램 참여하기 →](https://flaq.ai/ko/affiliate-program/)**

> 수수료 자격, 추천 기여도 인정, 환불, 지급 심사 및 승인된 개별 제휴 조건은 공식 프로그램 페이지의 최신 약관을 따릅니다.

## 문서 및 라이선스

전체 설정, 기술 스택, 배포 방법은 [README.md](./README.md) 또는 [README_zh.md](./README_zh.md)를 참고하세요. 이
프로젝트는 [MIT License](LICENSE)로 제공됩니다.
