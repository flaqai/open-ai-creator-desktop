![Flaq Open Media Creator](./docs/assets/flaq-open-media-creator-banner.png)

# Flaq Open Media Creator (한국어)

Flaq SaaS Template을 기반으로 만든 오픈 소스 AI 이미지·동영상 데스크톱 작업 공간입니다. 설치된 앱의 이름은 Flaq
Creator로 유지됩니다.

**README:** [English](./README.md) · [日本語](./README_ja.md) · [Bahasa Indonesia](./README_id.md) ·
[Italiano](./README_it.md) · [Português (Brasil)](./README_pt.md) · [Español](./README_es.md) ·
[Deutsch](./README_de.md) · [Русский](./README_ru.md) · [Français](./README_fr.md) · [简体中文](./README_zh.md) ·
[繁體中文](./README_tw.md) · [한국어](./README_ko.md) · [ไทย](./README_th.md) · [Tiếng Việt](./README_vi.md) ·
[العربية](./README_ar.md)

## Flaq.ai 소개

[Flaq.ai](https://flaq.ai/ko/)는 크리에이터와 개발자를 위한 AI 모델 플랫폼입니다. 하나의 API 키로 이미지 생성·편집,
동영상 생성, 언어 모델에 통합 접근할 수 있습니다.

- **모델 탐색과 비교** — [모델 마켓](https://flaq.ai/model-market/)에서 기능, 지원 매개변수, 현재 요금을 비교하세요.
- **연동 전 테스트** — Flaq.ai Playground에서 지원 모델을 테스트하며 프롬프트와 생성 설정을 조정하세요.
- **창작 워크플로 구축** — [API 문서](https://flaq.ai/docs/)를 참고해 제품과 도구에 AI 기능을 통합하세요.

Flaq Creator Desktop은 플랫폼의 이미지·동영상 워크플로를 전용 데스크톱 작업 공간으로 제공합니다. 앱에서 Flaq.ai Client
Key를 연결해 시각 자료를 만들고 관리할 수 있습니다. 플랫폼의 모든 API 기능이 데스크톱 앱에서 지원되는 것은 아닙니다.
이용 가능한 모델과 요금은 Flaq.ai에서 확인하세요.

## 현재 구현

Tauri 2와 Rust가 Next.js 16·React 19의 정적 UI를 실행합니다. 데스크톱 앱에는 Node.js/Next.js 서버가 포함되지 않습니다.
Web 버전과 폼, 모델 정의, 디자인을 공유합니다.

7개 제작 진입점: 통합 AI Media Creator, 텍스트→이미지, 이미지→이미지, 가상 피팅, 텍스트→동영상, 이미지→동영상,
참조→동영상. 프롬프트 라이브러리, 검색 가능한 자료 목록, 설정의 작업 기록, IndexedDB 초안, 날짜별 로컬 보관을
제공합니다. 예제 이미지는 앱에 포함되고 동영상은 온라인 재생됩니다. 생성 성공과 로컬 저장 성공은 별도 상태입니다.

## 빠른 시작

이 저장소의 루트에서 실행하세요. Node.js 22, pnpm 10.5.2, Rust 및 운영체제별 Tauri 의존성이 필요합니다. 설정 → 연결에서
Flaq.ai Client Key를 입력하고 연결을 테스트한 뒤 저장하세요. 기본 Base URL은 `https://api.flaq.ai`입니다. 실제 생성에는
인터넷 연결과 API 크레딧이 필요합니다.

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

## 업로드와 인증 정보

기본 업로드는 Flaq의 `/api/v1/files/presignedUrl`에서 단기 서명 URL을 받습니다. 공용 R2 자격 증명은 서버에 남으며 개인
Cloudflare 계정은 필요하지 않습니다. 사용자 R2는 선택 사항이며 로컬에서 서명합니다. 프리셋의 AES-GCM WebView 저장은 OS
자격 증명 보관소가 아닙니다. 기억하기를 선택하면 Client Key가 앱 설정 디렉터리의 `auth.json`에 평문으로 저장됩니다.

## 지원 범위와 언어

현재 릴리스 구성은 macOS Apple Silicon/Intel(DMG·ZIP), Windows x64(NSIS EXE)입니다. Linux는 소스 빌드 대상으로 릴리스
매트릭스에 포함되지 않습니다. 현재 패키지는 서명되지 않았습니다. 15개 로케일이 등록되어 있지만 새 설정·자료·프롬프트
패널 일부는 중국어/영어만 제공합니다. `zh`/`tw`는 중국어를 공유하고 나머지는 영어로 표시됩니다. 데스크톱은 `/en/`을
포함해 항상 언어 접두사를 사용합니다. Web 영어는 `/`, 다른 언어는 접두사를 사용하며 아랍어는 RTL입니다.

`en`, `ja`, `id`, `it`, `pt`, `es`, `de`, `ru`, `fr`, `zh`, `tw`, `ko`, `th`, `vi`, `ar`

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
