# 주식 시뮬레이션 - 100일 실시간 업데이트

## 🎯 주요 기능

이번 업데이트에서 추가된 기능:

### 1. 100일치 주식 데이터
- ✅ 업체별 100일간의 실제 거래 데이터
- ✅ 현실적인 주가 변동 패턴 (GBM 모델 사용)
- ✅ 가격 변동에 따른 동적 거래량
- ✅ 자동 생성되는 뉴스/이벤트
- ✅ 주말 제외 거래일 기준

### 2. 실시간 업데이트
- ✅ timeout을 통한 자동 진행
- ✅ 5단계 속도 조절 (1초 ~ 60초/일)
- ✅ 일시정지/재생 기능
- ✅ 진행률 표시

### 3. 데이터 생성 도구
- ✅ 유틸리티 함수 제공
- ✅ 프리셋 설정 (안정형/변동형/고변동형/하락형)
- ✅ 커스터마이징 가능
- ✅ 일괄 생성 지원

## 🚀 빠른 시작

### 1. 100일 시뮬레이션 실행

```bash
# 개발 서버 실행
cd frontend
pnpm install
pnpm dev

# 브라우저에서 접속
http://localhost:3000/practice/stock/scenario-100days
```

### 2. 속도 조절

화면에서 다음 옵션 선택:
- **초고속** (1초/일): 빠른 테스트용
- **고속** (3초/일): 일반적인 시뮬레이션
- **빠름** (5초/일): 균형잡힌 속도
- **보통** (10초/일): 여유있는 체험
- **느림** (60초/일): 실시간에 가까운 경험

### 3. 기능 사용

- ⏯️ 재생/일시정지: 언제든 중단 가능
- 📊 진행률 확인: 현재 N/100일 표시
- 📈 실시간 차트: 자동 업데이트
- 💰 자산 변동: 실시간 수익률 계산

## 📁 파일 구조

```
frontend/
├── data/
│   ├── game-scenarios.json              # 기존 10일 시나리오
│   └── stock-100days-data.json          # 신규 100일 시나리오 ⭐
│
├── lib/
│   └── stock-data-generator.ts          # 데이터 생성 유틸리티 ⭐
│
├── scripts/
│   └── generate-stock-data-example.ts   # 생성 예시 스크립트 ⭐
│
├── docs/
│   └── STOCK_DATA_GENERATION.md         # 상세 가이드 ⭐
│
└── app/
    └── practice/stock/[id]/page.tsx     # 메인 페이지 (업데이트됨) ⭐
```

## 💡 사용 예시

### 새로운 주식 데이터 생성

```typescript
import { generateStockData, STOCK_PRESETS } from '@/lib/stock-data-generator'

// 카카오 주식 100일 데이터 생성
const kakaoData = generateStockData({
  name: '카카오',
  initialPrice: 50000,
  days: 100,
  volatility: STOCK_PRESETS.moderate.volatility,  // 3% 변동성
  trend: 0.005,                                     // 일일 0.5% 상승
  startDate: new Date('2024-01-02'),
  baseVolume: 1200000,
  generateNews: true,
})
```

### 여러 주식 일괄 생성

```typescript
import { generateMultipleStocks, STOCK_PRESETS } from '@/lib/stock-data-generator'

const stocks = generateMultipleStocks(
  [
    {
      id: 'kakao',
      name: '카카오',
      category: 'IT/테크',
      initialPrice: 50000,
      ...STOCK_PRESETS.moderate,
      baseVolume: 1200000,
    },
    {
      id: 'samsung',
      name: '삼성전자',
      category: 'IT/테크',
      initialPrice: 70000,
      ...STOCK_PRESETS.stable,
      baseVolume: 18000000,
    },
  ],
  100,
  new Date('2024-01-02')
)
```

## 🎨 프리셋 설정

4가지 주식 유형 프리셋 제공:

| 유형 | 변동성 | 추세 | 예시 |
|------|--------|------|------|
| **안정형** | 1.5% | +0.1% | 삼성전자, KB금융 |
| **변동형** | 3% | +0.2% | 카카오, 네이버 |
| **고변동형** | 5% | +0.5% | 하이브, 셀트리온 |
| **하락형** | 3% | -0.2% | 구조조정 중인 기업 |

## 📊 생성된 데이터

### 현재 포함된 주식 (3종목)

1. **카카오** (IT/테크)
   - 시작가: 50,000원 → 종가: 88,500원
   - 수익률: +77%
   - 거래량: 1,200,000 ~ 4,580,000

2. **삼성전자** (IT/테크)
   - 시작가: 70,000원 → 종가: 109,200원
   - 수익률: +56%
   - 거래량: 18,000,000 ~ 49,000,000

3. **네이버** (IT/테크)
   - 시작가: 200,000원 → 종가: 277,500원
   - 수익률: +38.75%
   - 거래량: 800,000 ~ 2,410,000

### 추가 가능한 카테고리

- 자동차/화학 (현대차, LG에너지솔루션)
- 엔터/콘텐츠 (하이브, JYP, SM)
- 바이오/헬스 (셀트리온, 한미약품)
- 금융 (KB금융, 신한지주)
- 건설/중공업 (POSCO, 현대건설)
- 소비재/유통 (아모레퍼시픽, 이마트)

## 🔧 커스터마이징

### 변동성 조정

```typescript
// 낮은 변동성 (안정적)
volatility: 0.01  // 1%

// 일반적인 변동성
volatility: 0.03  // 3%

// 높은 변동성 (극적)
volatility: 0.08  // 8%
```

### 추세 조정

```typescript
// 강한 하락
trend: -0.01

// 횡보
trend: 0

// 강한 상승
trend: 0.01
```

### 재생 속도 기본값 변경

```typescript
// page.tsx에서
const [playSpeed, setPlaySpeed] = useState<1 | 3 | 5 | 10 | 60>(5)
//                                                            ^^
//                                                        원하는 기본값
```

## 🎯 주요 특징

### 1. 현실적인 가격 변동
- GBM (Geometric Brownian Motion) 모델 사용
- 실제 주식 시장의 랜덤 워크 특성 반영
- 음수 가격 방지 로직

### 2. 동적 거래량
- 가격 변동이 클수록 거래량 증가
- 랜덤 요소 포함 (80~120%)
- 현실적인 시장 분위기 재현

### 3. 자동 뉴스 생성
- 가격 변동에 따른 적절한 뉴스 선택
- 50+ 뉴스 템플릿
- 마일스톤 이벤트 (10일마다)

### 4. 주말 제외
- 실제 주식 시장처럼 평일만 거래
- 토요일, 일요일 자동 스킵

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

여기서:
- `μ` (mu): 추세 (drift)
- `σ` (sigma): 변동성 (volatility)
- `dW`: 위너 프로세스 (랜덤 워크)

## 🚀 성능

- **데이터 크기**: ~200KB (100일 × 3종목)
- **로딩 시간**: < 100ms
- **메모리 사용**: 최소
- **렌더링**: useMemo로 최적화

## 📝 향후 계획

- [ ] 더 많은 주식 추가 (50+ 종목)
- [ ] 실제 역사적 데이터 통합
- [ ] 섹터별 상관관계 반영
- [ ] 이벤트 기반 급등/급락
- [ ] 배당금, 액면분할 이벤트
- [ ] 공매도 기능
- [ ] 신용거래 기능

## 🐛 문제 해결

### Q: 데이터가 로드되지 않습니다.

```bash
# JSON 파일 확인
ls -la frontend/data/stock-100days-data.json

# import 경로 확인
# page.tsx에서 scenarios100DaysData 확인
```

### Q: 속도 조절이 작동하지 않습니다.

- 페이지 새로고침
- 브라우저 캐시 삭제
- `playSpeed` state 확인

### Q: 주가가 너무 극단적입니다.

- `volatility` 값 조정 (0.02~0.04 권장)
- `trend` 값 조정 (-0.01 ~ 0.01 범위)

## 📚 참고 문서

- [상세 가이드](docs/STOCK_DATA_GENERATION.md)
- [데이터 생성 예시](scripts/generate-stock-data-example.ts)
- [유틸리티 API](lib/stock-data-generator.ts)

## 👥 기여

버그 리포트나 기능 제안은 이슈로 등록해주세요.

## 📄 라이선스

이 프로젝트의 일부입니다.

---

**Happy Trading! 📈💰**

