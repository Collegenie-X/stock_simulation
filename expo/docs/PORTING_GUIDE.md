# 웹(Next.js) → 앱(Expo) 포팅 가이드

`frontend/`(Next.js + Tailwind) 화면을 `expo/`(Expo SDK 57 + expo-router + React Native)로 옮길 때의 규칙입니다.
새 화면을 추가하거나 웹 변경분을 반영할 때도 이 문서를 따릅니다.

## 1. 폴더 구조

```
expo/src
├── app/                  # 라우트 파일만! (expo-router 는 app/ 안의 모든 파일을 라우트로 취급)
│   └── learn/patterns/[id]/index.tsx   →  export { default } from "@/features/learn/screens/PatternDetailScreen"
├── features/<기능>/      # 웹의 app/<기능>/ 에 대응
│   ├── screens/          # 웹 page.tsx  →  XxxScreen.tsx
│   ├── components/       # 웹 components/*.tsx (같은 파일명 유지)
│   ├── hooks/ utils/     # 웹과 동일
│   └── config.ts, types.ts
├── components/
│   ├── ui/               # Button, Gradient, PressableScale, ProgressBar, BottomSheet/CenterModal/FullScreenModal, 애니메이션 래퍼
│   ├── layout/           # Screen, MobileHeader, MobileNav
│   └── charts/           # SeriesChart(recharts 대체), Sparkline, DonutChart
├── data/                 # 웹 data/ 와 동일한 JSON·TS (그대로 복사, 수정 금지)
├── lib/                  # format, sound(햅틱), storage, scenario/*, stock-data-generator
└── theme/                # colors, palette(Tailwind hex), alpha(), fontSize …
```

라우트 경로는 웹과 **동일**하게 유지합니다. (`/learn/patterns/[id]/practice` 등)
라우트 파일은 항상 한 줄 re-export 로만 작성합니다.

## 2. 요소 변환

| 웹 | 앱 |
| --- | --- |
| `div`, `section`, `main` | `View` |
| `span`, `p`, `h1~h6`, 텍스트 | `Text` (RN 은 **모든 문자열이 `<Text>` 안에** 있어야 함. `{cond && "문자"}` 주의) |
| `button`, `onClick` | `PressableScale` / `Pressable` / `Button`, `onPress` |
| `img` | `expo-image` 의 `Image` |
| `input` | `TextInput` |
| 페이지 최상위 `min-h-screen … pb-24` | `<Screen bg="#141420" withNav fixed={<MobileNav />}>` |
| `fixed`/`sticky` 요소 (헤더, 하단 CTA) | `<Screen fixed={…}>` 에 넣고 `position:"absolute"` |
| `fixed inset-0` 모달 | `BottomSheet` / `CenterModal` / `FullScreenModal` |
| `overflow-x-auto` 가로 스크롤 | `<ScrollView horizontal showsHorizontalScrollIndicator={false}>` |
| 긴 목록 | `FlatList` (Screen `scroll={false}` 와 함께) |
| `lucide-react` | `lucide-react-native` (`className="w-4 h-4 text-red-400"` → `size={16} color={palette.red[400]}`) |
| `recharts` | `@/components/charts` 의 `SeriesChart` / `Sparkline` / `DonutChart` |
| 인라인 `<svg>` | `react-native-svg` (`Svg, Path, Circle, Line, Rect, G, Defs, LinearGradient, Stop, Text as SvgText`) |
| `<canvas>` | `react-native-svg` + state 로 재구현 |
| `bg-gradient-to-br from-a via-b to-c` | `<Gradient dir="br" colors={[a, b, c]} style={…}>` |
| `backdrop-blur` | 불투명도를 높인 배경색으로 대체 (`rgba(…,0.95)`) |
| `blur-[100px]` 글로우 | 낮은 opacity 의 원형 View 로 대체하거나 생략 |
| `animate-*`, `@keyframes`, `transition-*` | `@/components/ui` 의 `FadeUp, FadeIn, SlideIn, BounceIn, Pop, Pulse, Float, Ping, Heartbeat, Shake, Wiggle, Spin, RiseOut, Flash`. 없는 효과는 RN `Animated` 로 컴포넌트 안에서 구현 |
| `hover:*` | 제거 (필요 시 `Pressable` 의 `pressed` 상태) |
| `next/navigation` `useRouter/useParams/usePathname/useSearchParams` | `expo-router` 의 `useRouter / useLocalSearchParams / usePathname` |
| `next/link` `<Link href>` | `expo-router` `<Link href asChild><Pressable/></Link>` 또는 `router.push()` |
| `window.location.href = "/x"` | `router.push("/x")` (되돌아오면 안 되는 흐름은 `router.replace`) |
| `localStorage.getItem/setItem` | `localStore.getItem/setItem` (`@/lib/storage`) — **동기 API, 키 이름 동일 유지** |
| `storage.*` (`@/lib/storage`) | 동일 API 그대로 |
| `window.innerWidth` | `useWindowDimensions()` |
| `alert/confirm` | `Alert.alert` 또는 `CenterModal` |
| `navigator.share`, clipboard | RN `Share.share()` |
| `playClickSound()` | 동일 (`@/lib/sound`, 앱에서는 햅틱) |
| `toLocaleString()` | `@/lib/format` 의 `formatNumber` 등 (Hermes 호환) |

## 3. 스타일 변환

- `StyleSheet.create` 를 파일 하단에 두고, 동적인 값만 인라인으로 합칩니다.
- 색상: `text-gray-400` → `palette.gray[400]`, `bg-white/10` → `alpha("#ffffff", 0.1)`, `bg-[#1e1e2e]` → `"#1e1e2e"`.
- 간격: Tailwind 1 단위 = 4px (`p-5` → `padding: 20`, `gap-1.5` → `gap: 6`). `space-y-5` → 부모에 `gap: 20`.
- 글자: `text-xs`=12, `sm`=14, `base`=16, `lg`=18, `xl`=20, `2xl`=24, `3xl`=30, `4xl`=36. `text-[10px]` → 10.
  `font-medium/semibold/bold/extrabold/black` → `"500"/"600"/"700"/"800"/"900"`. `tracking-tight` → `letterSpacing: -0.4`.
- 모서리: `rounded-lg`=8(이 프로젝트 테마 기준 12), `xl`=12~16, `2xl`=16~20, `3xl`=24, `full`=9999. 웹 화면과 비슷해 보이는 값을 선택.
- RN 기본은 `flexDirection: "column"`. 웹의 `flex`(row) 는 `flexDirection: "row"` 를 명시.
- `grid grid-cols-2 gap-3` → `flexDirection:"row", flexWrap:"wrap", gap:12` + 자식 `width:"48%"` 또는 `flex:1` + `flexBasis`.
- `truncate` → `<Text numberOfLines={1}>`, `line-clamp-2` → `numberOfLines={2}`.
- `%` 기반 `translate`, `calc()`, `vh/vw` 는 사용할 수 없음 → `useWindowDimensions` / `onLayout` 으로 계산.
- 그림자: `boxShadow: "0 4px 12px rgba(0,0,0,0.3)"` (RN 0.86 지원).
- 텍스트 색/크기는 상속되지 않습니다. 모든 `<Text>` 에 color 를 직접 지정 (기본은 검정이라 다크 배경에서 안 보임).

## 4. 데이터 & 저장

- 서버 없이 동작합니다. 정적 데이터는 `@/data/*.json` 을 import, 사용자 데이터는 `storage`/`localStore`.
- `localStore` 는 메모리 캐시 + AsyncStorage write-through 이며 루트 레이아웃에서 hydrate 됩니다.
  추후 서버 연동 시 `src/lib/storage/localStore.ts` 의 persist 계층과 `src/data` import 지점만 API 호출로 교체하면 됩니다.
- 비즈니스 로직(계산, 훅, config, types)은 웹 코드를 **그대로** 옮기고 UI 계층만 바꿉니다.

## 5. 체크

```bash
npx tsc --noEmit          # 타입 체크
npx expo export -p web    # 번들 검증
npx expo start            # 실행 (i / a / w)
```
