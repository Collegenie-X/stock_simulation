# 파도를 타라 — Expo 앱

`frontend/`(Next.js 모바일 웹)를 React Native + Expo 로 옮긴 앱입니다.
**서버 없이** 동작합니다 — 정적 데이터는 `src/data/*.json`, 사용자 데이터는 기기 로컬 저장소(AsyncStorage)에 저장됩니다.

- Expo SDK 57 · React Native 0.86 · React 19 · expo-router (파일 기반 라우팅) · TypeScript
- 차트: `react-native-svg` 기반 자체 컴포넌트 (`src/components/charts`)

## 실행

```bash
cd expo
npm install
npx expo start      # i: iOS 시뮬레이터 / a: Android / w: 웹 / QR: Expo Go
```

## 폴더 구조

```
src
├── app/           라우트 파일 (웹 frontend/app 과 동일한 경로, 한 줄 re-export 만)
├── features/      화면 단위 기능 — screens / components / hooks / config / types
├── components/    공통 컴포넌트 — ui / layout / charts / game
├── data/          JSON 데이터 (웹 frontend/data 와 동일)
├── lib/           format, sound(햅틱), storage, scenario 엔진, 주가 생성기
└── theme/         색상 토큰, Tailwind hex 팔레트, alpha()
```

| 경로 | 화면 |
| --- | --- |
| `/` | 스플래시 → 온보딩 여부에 따라 `/onboarding` 또는 `/home` |
| `/home` `/learn` `/compete` `/profile` | 하단 탭 4개 (`MobileNav`) |
| `/analysis-intro` `/analysis` | 투자 성향 분석 |
| `/learn/patterns/[id]` `/learn/patterns/[id]/practice` | 차트 패턴 학습 · 연습 |
| `/learn/scenarios/[id]` `/learn/scenarios/[id]/play` | 레전드 시나리오 |
| `/practice` `/practice/setup` `/practice/stock/[id]` (`/trade`, `/orders`) | 주식 시뮬레이션 게임 |
| `/compete/[userId]` `/compete/challenge/[id]` `/compete/result/*/[id]` | 도전 · 랭킹 · 결과 |
| `/scenario` `/scenario/[id]` `/guide` `/quiz` `/profile/simulation/[id]` | 기타 |

## 데이터 저장 구조 (서버 전환 포인트)

```
화면 ──▶ storage (src/lib/storage/index.ts)      웹 lib/storage.ts 와 동일한 API
          └─▶ localStore (localStore.ts)          동기 API · 메모리 캐시 + AsyncStorage write-through
화면 ──▶ import data from "@/data/*.json"         정적 콘텐츠
```

- `localStore` 는 앱 시작 시(`src/app/_layout.tsx`) 한 번 hydrate 되며, 이후 `getItem/setItem` 을 웹 `localStorage` 처럼 **동기**로 사용합니다.
- 서버 도입 시: ① `localStore` 의 persist 부분에 서버 동기화 추가, ② `@/data/*.json` import 를 API 호출로 교체 — 화면 코드는 그대로 둘 수 있습니다.

## 개발 규칙

웹 화면을 추가로 옮기거나 새 화면을 만들 때는 [docs/PORTING_GUIDE.md](docs/PORTING_GUIDE.md) 를 따릅니다.

```bash
npx tsc --noEmit          # 타입 체크
npx expo export -p web    # 번들 검증
```

## 참고

- 앱 아이콘/스플래시 이미지는 Expo 기본 템플릿 이미지입니다. `assets/images/` 의 파일(1024×1024)을 교체하세요.
- 웹의 클릭 효과음(WebAudio)은 앱에서 햅틱(`expo-haptics`)으로 대체되었습니다.
