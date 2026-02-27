# 주식 시뮬레이션 — 기술 가이드

## 🎯 주요 기능

### 1. 듀얼 AI 경쟁자 시스템
- ✅ **유사 AI**: 사용자 투자 성향 실시간 분석 → 5단계 중 매칭
- ✅ **최고 AI**: 항상 초공격형(ultra_aggressive) 전략 운영
- ✅ 같은 종목에서 동시 의사결정 → 3자 비교 (나 vs 유사 AI vs 최고 AI)
- ✅ 투자 성향 자동 분류 (보수형 → 안정형 → 균형형 → 공격형 → 초공격형)
- ✅ 파도 흐름 분석 (상승/하락/횡보 + 정확도 0~100점)

### 2. AI 갭 분석 시스템
- ✅ **실시간 갭 피드백** (AIGapFeedback) — 매 거래 직후 플로팅 배너
- ✅ **일일 갭 분석** (DaySummaryOverlay) — 매일 종료 시 AI 비교
- ✅ **3일 미니 리포트** (MiniGameReport) — 등급(S~D) + 업적 + 종목별 분석
- ✅ **최종 리포트** (FinalGameReport) — 등급(S+~F) + 자산 흐름 차트 + 순위
- ✅ **종목별 상세** (StockDetailPanel) — 가격 차트 + 거래 마커 + AI 비교
- ✅ **경쟁 갭 분석** (GapAnalysisSection) — 주간 추이 + 인사이트

### 3. 3대 게임 모드
- ✅ **연습 (Learn)**: 시나리오 학습 (5턴/30초) + 패턴 연습 (15초)
- ✅ **실전 (Practice)**: 스프린트(30턴) / 스탠다드(100턴) / 마라톤(200턴)
- ✅ **도전 (Compete)**: 주간/누적 랭킹 + 투자 DNA + 주간 챌린지

### 4. 랭킹 & 경쟁
- ✅ 도전자 점수 공식: 수익률(50%) + 파도정확도(25%) + 승률(15%) + 일관성(10%)
- ✅ 실전 시뮬레이션만 랭킹 반영 (공정성)
- ✅ 6단계 자본금 필터
- ✅ 주간 챌린지 시스템

### 5. 데이터 & 시나리오
- ✅ 업체별 100일간 거래 데이터 (GBM 모델)
- ✅ 다양한 섹터 시나리오 (AI반도체, 방산, 바이오, 금융 등)
- ✅ 엘리엇 파동 기반 패턴 데이터
- ✅ 자동 생성 뉴스/이벤트

## 🚀 빠른 시작

### 1. 실행

```bash
cd frontend
pnpm install
pnpm dev

# http://localhost:3000
```

### 2. 주요 경로

| 경로 | 설명 |
|:---|:---|
| `/learn` | 시나리오 & 패턴 학습 |
| `/learn/scenarios/[id]/play` | 시나리오 플레이 |
| `/learn/patterns/[id]/practice` | 패턴 연습 |
| `/practice/stock/[id]` | 실전 시뮬레이션 |
| `/compete` | 랭킹 & 경쟁 |
| `/onboarding` | AI 성격 분석 |

## 📁 핵심 파일

### AI 경쟁자 시스템

```
frontend/app/practice/stock/[id]/components/hooks/useAICompetitor.ts
├── InvestStyle: 5단계 투자 성향
├── STRATEGY_PARAMS: 성향별 전략 파라미터
├── classifyUserStyle(): 사용자 성향 자동 분류
├── simulateDayTrades(): 유사 AI + 최고 AI 동시 시뮬레이션
├── simulateSameStockDecisions(): 같은 종목 AI 결정
├── analyzeWavePattern(): 파도 흐름 분석
└── GapRecord: 갭 기록 데이터 구조
```

### 리포트 시스템

```
frontend/app/practice/stock/[id]/components/
├── AIGapFeedback.tsx      — 실시간 갭 배너
├── MiniGameReport.tsx     — 3일 미니 리포트
├── FinalGameReport.tsx    — 최종 종합 리포트
├── StockDetailPanel.tsx   — 종목별 드릴다운
└── DaySummaryOverlay.tsx  — 일일 요약
```

### 설정 & 타입

```
frontend/app/practice/stock/[id]/
├── config.ts   — 게임 상수 + 한국어 라벨
└── types.ts    — 전체 타입 정의

frontend/app/compete/
└── config.ts   — 랭킹 규칙 + 도전자 점수 공식
```

### 공용 UI

```
frontend/components/
└── game-play-ui.tsx  — GameActionBar + RatioModal (시나리오/패턴 공용)
```

## 📊 데이터 구조

### AI 전략 파라미터

| 성향 | investmentRatio | stopLoss | takeProfit | maxPositionRatio | minCashRatio |
|:---:|:---:|:---:|:---:|:---:|:---:|
| conservative | 0.3 | -3% | +8% | 0.15 | 0.50 |
| stable | 0.5 | -5% | +10% | 0.20 | 0.35 |
| balanced | 0.6 | -7% | +12% | 0.25 | 0.25 |
| aggressive | 0.7 | -8% | +15% | 0.35 | 0.15 |
| ultra_aggressive | 0.9 | -10% | +20% | 0.50 | 0.05 |

### 갭 기록 (GapRecord)

```typescript
interface GapRecord {
  day: number
  userRate: number        // 사용자 수익률
  bestAIRate: number      // 최고 AI 수익률
  similarAIRate: number   // 유사 AI 수익률
  gapToBest: number       // 최고 AI 대비 갭 (%p)
  gapToSimilar: number    // 유사 AI 대비 갭 (%p)
  waveAccuracy: number    // 파도 정확도 (0~100)
}
```

### 종목별 비교 (StockCompareResult)

```typescript
interface StockCompareResult {
  stockId: string
  stockName: string
  price: number
  userAction: "buy" | "sell" | "skip"
  userQty: number
  similarAction: "buy" | "sell" | "hold"
  similarQty: number
  similarReason: string
  bestAction: "buy" | "sell" | "hold"
  bestQty: number
  bestReason: string
}
```

### 도전자 점수 공식

```typescript
function calcChallengerScore(
  profitPercentile: number,  // 수익률 상위 백분위 (0~100)
  waveAccuracy: number,      // 파도 정확도 (0~100)
  winRate: number,           // 승률 (0~100)
  consistencyWeeks: number,  // 연속 참여 주수
): number {
  const base =
    profitPercentile * 0.50 +
    waveAccuracy * 0.25 +
    winRate * 0.15
  const bonus = consistencyWeeks >= 5 ? 10 : consistencyWeeks >= 3 ? 5 : 0
  return Math.min(100, Math.round(base + bonus * 0.10 * 10))
}
```

## 🎨 프리셋 설정

4가지 주식 유형 프리셋:

| 유형 | 변동성 | 추세 | 예시 |
|:---:|:---:|:---:|:---|
| 안정형 | 1.5% | +0.1% | 삼성전자, KB금융 |
| 변동형 | 3% | +0.2% | 카카오, 네이버 |
| 고변동형 | 5% | +0.5% | 하이브, 셀트리온 |
| 하락형 | 3% | -0.2% | 구조조정 중인 기업 |

## 🔧 커스터마이징

### 게임 상수 변경

```typescript
// frontend/app/practice/stock/[id]/config.ts
export const DECISIONS_PER_DAY = 3        // 하루 의사결정 횟수
export const DECISION_TIMER_SECONDS = 30  // 결정 제한 시간
export const AI_REPORT_INTERVAL = 3       // 미니 리포트 간격 (일)
```

### 속도 모드 변경

```typescript
// frontend/app/practice/stock/[id]/config.ts
export const SPEED_MODE_TURNS: Record<string, number> = {
  sprint: 30,      // 빠른 체험
  standard: 100,   // 균형 잡힌 경험
  marathon: 200,   // 심화 학습
}
```

### AI 전략 조정

```typescript
// frontend/app/practice/stock/[id]/components/hooks/useAICompetitor.ts
const STRATEGY_PARAMS: Record<InvestStyle, StrategyParams> = {
  conservative: { investmentRatio: 0.3, stopLoss: -3, takeProfit: 8, ... },
  // ... 값 조정 가능
}
```

## 📈 알고리즘 상세

### Geometric Brownian Motion (GBM)

주가 변동 공식:
```
dS = μS dt + σS dW
```

구현:
```typescript
const dailyReturn = trend / days + randomShock
currentPrice = currentPrice * (1 + dailyReturn)
```

### 파도 정확도 계산

```
1. 시장 방향 분석 (상승/하락/횡보)
2. 사용자 매매 방향과 비교
   - 상승장 + 매수 > 매도 → 높은 점수
   - 하락장 + 매도 > 매수 → 높은 점수
3. 최고 AI 매매 패턴과 비교
   - 매수 횟수 차이가 클수록 감점
4. 최종 점수: 10~100 범위
```

## 📝 향후 계획

- [ ] 실시간 서버 랭킹
- [ ] 친구 대결 모드
- [ ] 더 많은 주식 추가 (50+ 종목)
- [ ] 실제 역사적 데이터 통합
- [ ] 섹터별 상관관계 반영
- [ ] 배당금, 액면분할 이벤트
- [ ] 모바일 앱 출시

---

**Last Updated**: 2025.02.27
**Version**: v3.0
