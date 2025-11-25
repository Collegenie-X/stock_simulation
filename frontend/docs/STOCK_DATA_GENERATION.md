# 주식 데이터 생성 가이드

## 개요

이 가이드는 주식 시뮬레이션을 위한 100일치 데이터를 생성하고 관리하는 방법을 설명합니다.

## 주요 기능

### 1. 실시간 업데이트 시스템

- **자동 진행**: timeout을 통해 자동으로 거래일이 진행됩니다.
- **속도 조절**: 5가지 속도 옵션 제공
  - 초고속: 1초/일
  - 고속: 3초/일
  - 빠름: 5초/일
  - 보통: 10초/일
  - 느림: 60초/일

### 2. 100일치 데이터

- 각 주식당 100일간의 거래 데이터
- 실제 주식 시장의 변동 패턴 반영
- 주말 제외, 거래일 기준

## 파일 구조

```
frontend/
├── data/
│   ├── game-scenarios.json          # 기존 10일 시나리오
│   └── stock-100days-data.json      # 새로운 100일 시나리오
├── lib/
│   └── stock-data-generator.ts      # 데이터 생성 유틸리티
└── scripts/
    └── generate-stock-data-example.ts  # 데이터 생성 예시
```

## 사용 방법

### 1. 100일 시뮬레이션 시작하기

URL에서 시나리오 ID를 `scenario-100days`로 설정:

```
http://localhost:3000/practice/stock/scenario-100days
```

### 2. 재생 속도 조절

화면 하단의 "재생 속도" 섹션에서 5가지 옵션 중 선택:
- 빠른 테스트: 초고속 (1초/일)
- 일반적인 체험: 고속~빠름 (3~5초/일)
- 현실적인 체험: 보통~느림 (10~60초/일)

### 3. 진행 상황 확인

- 현재 날짜 표시
- 진행률 바 (예: 45/100일)
- 실시간 주가 업데이트

## 데이터 생성하기

### 기본 사용법

```typescript
import { generateStockData } from '@/lib/stock-data-generator'

// 단일 주식 데이터 생성
const kakaoData = generateStockData({
  name: '카카오',
  initialPrice: 50000,      // 시작 가격
  days: 100,                // 거래일 수
  volatility: 0.03,         // 변동성 3%
  trend: 0.005,             // 일일 평균 0.5% 상승
  startDate: new Date('2024-01-02'),
  baseVolume: 1200000,      // 기본 거래량
  generateNews: true,       // 뉴스 생성
})
```

### 여러 주식 일괄 생성

```typescript
import { generateMultipleStocks, STOCK_PRESETS } from '@/lib/stock-data-generator'

const stocks = generateMultipleStocks(
  [
    {
      id: 'stock-kakao',
      name: '카카오',
      category: 'IT/테크',
      initialPrice: 50000,
      volatility: STOCK_PRESETS.moderate.volatility,
      trend: STOCK_PRESETS.moderate.trend * 3,
      baseVolume: 1200000,
    },
    // ... 더 많은 주식
  ],
  100, // 거래일 수
  new Date('2024-01-02') // 시작 날짜
)
```

### 프리셋 활용

```typescript
// 안정형 대형주
STOCK_PRESETS.stable
// - 변동성: 1.5%
// - 추세: 0.1% 상승

// 변동형 중형주
STOCK_PRESETS.moderate
// - 변동성: 3%
// - 추세: 0.2% 상승

// 고변동 성장주
STOCK_PRESETS.volatile
// - 변동성: 5%
// - 추세: 0.5% 상승

// 하락주
STOCK_PRESETS.declining
// - 변동성: 3%
// - 추세: 0.2% 하락
```

## 데이터 구조

### StockTurn 인터페이스

```typescript
interface StockTurn {
  turn: number        // 거래일 번호 (1~100)
  date: string        // 날짜 (YYYY.MM.DD)
  price: number       // 종가
  volume: number      // 거래량
  news: string        // 뉴스/이벤트
}
```

### 시나리오 구조

```json
{
  "id": "scenario-100days",
  "title": "실전 100일 투자 시뮬레이션",
  "description": "100일간의 실제 주식 시장 변동을 경험해보세요.",
  "difficulty": "중급",
  "totalTurns": 100,
  "updateInterval": 3000,
  "stocks": [
    {
      "id": "stock-kakao",
      "name": "카카오",
      "category": "IT/테크",
      "initialPrice": 50000,
      "turns": [...]
    }
  ]
}
```

## 알고리즘 상세

### GBM (Geometric Brownian Motion)

주식 가격 변동은 GBM 모델을 사용합니다:

```
dS = μS dt + σS dW
```

여기서:
- `S`: 주가
- `μ`: 추세 (drift)
- `σ`: 변동성 (volatility)
- `dW`: 위너 프로세스 (랜덤 워크)

### 거래량 생성

거래량은 가격 변동에 비례하여 증가:

```typescript
volume = baseVolume × (1 + |priceChange| × 10) × randomFactor
```

### 뉴스 생성

가격 변동률에 따라 자동으로 적절한 뉴스 선택:
- 2% 이상 상승: 긍정적 뉴스
- 2% 이상 하락: 부정적 뉴스
- 그 외: 중립적 뉴스

## 커스터마이징

### 새로운 시나리오 추가

1. `stock-data-generator.ts` 사용하여 데이터 생성
2. 생성된 JSON을 `data/` 폴더에 저장
3. `page.tsx`에서 import 추가:

```typescript
import myScenario from "@/data/my-scenario.json"

const allScenarios = [
  ...scenariosData.scenarios,
  ...scenarios100DaysData.scenarios,
  ...myScenario.scenarios, // 추가
]
```

### 변동성 조정

더 현실적이거나 극적인 시뮬레이션을 원한다면:

```typescript
// 현실적 (낮은 변동성)
volatility: 0.01 ~ 0.02

// 일반적
volatility: 0.02 ~ 0.04

// 극적 (높은 변동성)
volatility: 0.05 ~ 0.10
```

### 추세 조정

```typescript
// 강한 하락
trend: -0.01

// 약한 하락
trend: -0.002

// 횡보
trend: 0

// 약한 상승
trend: 0.002

// 강한 상승
trend: 0.01
```

## 성능 최적화

### 메모리 관리

100일 × 10종목 = 1,000개의 턴 데이터
- JSON 파일 크기: ~200KB
- 메모리 사용량: 최소

### 렌더링 최적화

- `useMemo`를 통한 차트 데이터 캐싱
- 필요한 턴만 렌더링
- 가상 스크롤 (필요시)

## 문제 해결

### Q: 데이터가 너무 빨리/느리게 진행됩니다.

A: 화면의 "재생 속도" 설정을 조정하세요. 초고속(1초)부터 느림(60초)까지 선택 가능합니다.

### Q: 주가가 비현실적으로 변동합니다.

A: `volatility` 값을 조정하세요. 일반적으로 0.02~0.04 범위가 적절합니다.

### Q: 새로운 주식을 추가하고 싶습니다.

A: `scripts/generate-stock-data-example.ts`를 참고하여 새로운 주식 설정을 추가하세요.

## 예시 코드

### 완전한 예시

```typescript
// 1. 데이터 생성
import { generateStockData, STOCK_PRESETS } from '@/lib/stock-data-generator'

const myStock = generateStockData({
  name: '예시주식',
  initialPrice: 100000,
  days: 100,
  volatility: STOCK_PRESETS.moderate.volatility,
  trend: STOCK_PRESETS.moderate.trend,
  startDate: new Date('2024-01-02'),
  baseVolume: 500000,
})

// 2. 시나리오 구성
const myScenario = {
  id: 'my-scenario',
  title: '나만의 시뮬레이션',
  description: '커스텀 주식 데이터',
  difficulty: '중급',
  totalTurns: 100,
  stocks: [{
    id: 'my-stock',
    name: '예시주식',
    category: 'IT/테크',
    initialPrice: 100000,
    turns: myStock,
  }],
}

// 3. JSON 파일로 저장
import fs from 'fs'
fs.writeFileSync(
  'data/my-scenario.json',
  JSON.stringify({ scenarios: [myScenario] }, null, 2)
)
```

## 참고 자료

- [GBM 모델 설명](https://en.wikipedia.org/wiki/Geometric_Brownian_motion)
- [금융 시계열 분석](https://www.investopedia.com/terms/t/timeseries.asp)
- [주식 변동성](https://www.investopedia.com/terms/v/volatility.asp)

## 라이선스

이 프로젝트의 일부입니다.

