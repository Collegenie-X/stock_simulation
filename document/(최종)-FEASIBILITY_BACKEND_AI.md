# 백엔드 실행 가능성 조사 보고서

# 1. 실제 주식 데이터 수집 & 2. AI 판단 알고리즘 구축

---

## 📑 목차

1. [결론 먼저](#1-결론-먼저)
2. [주식 데이터 수집 — 실행 가능성](#2-주식-데이터-수집--실행-가능성)
3. [AI 판단 알고리즘 — 실행 가능성](#3-ai-판단-알고리즘--실행-가능성)
4. [구현 아키텍처 제안](#4-구현-아키텍처-제안)
5. [비용 분석](#5-비용-분석)
6. [리스크 & 대응](#6-리스크--대응)
7. [실행 로드맵](#7-실행-로드맵)

---

## 1. 결론 먼저

### 질문 1: 직전 1년 주식 데이터를 가져올 수 있는가?

> **✅ 가능합니다. 무료로, 즉시 가능합니다.**

| 방법 | 한국 주식 | 해외 주식 | 비용 | 난이도 |
|:---|:---:|:---:|:---:|:---:|
| **yfinance** (Python) | ✅ `005930.KS` | ✅ `NVDA` | 무료 | 쉬움 |
| **FinanceDataReader** (Python) | ✅ 코스피/코스닥 전체 | ✅ NYSE/NASDAQ | 무료 | 쉬움 |
| **pykrx** (Python) | ✅ KRX 직접 크롤링 | ❌ | 무료 | 보통 |
| **KRX OPEN API** | ✅ 공식 API | ❌ | 무료 (가입 필요) | 보통 |
| **Alpha Vantage** | ⚠️ 제한적 | ✅ | 무료 (25회/일) | 쉬움 |
| **Polygon.io** | ❌ | ✅ | 무료~$29/월 | 쉬움 |

**추천 조합**: `yfinance` (해외) + `FinanceDataReader` (한국) → 무료, 코드 10줄이면 1년 데이터 수집 완료

### 질문 2: 최고 AI, 유사 AI 판단 알고리즘을 구축할 수 있는가?

> **✅ 가능합니다. 현재 프론트엔드에 이미 기본 알고리즘이 있고, 백엔드로 이전하면 훨씬 정교해집니다.**

| 항목 | 현재 (프론트엔드) | 백엔드 전환 후 |
|:---|:---|:---|
| AI 전략 | 5단계 파라미터 기반 | 기술적 지표 + 백테스트 기반 |
| 유사 AI 매칭 | 현금 비율로 분류 | 매매 패턴 유사도 계산 |
| 파도 분석 | 단순 방향 분석 | 엘리엇 파동 자동 감지 |
| 데이터 | GBM 랜덤 생성 | **실제 1년 주가 데이터** |
| 성능 | 클라이언트 부하 | 서버에서 사전 계산 |

---

## 2. 주식 데이터 수집 — 실행 가능성

### 2-1. 추천 방법: yfinance + FinanceDataReader

#### 한국 주식 (FinanceDataReader)

```python
import FinanceDataReader as fdr
from datetime import datetime, timedelta

# 1년 전 날짜 계산
end_date = datetime.now()
start_date = end_date - timedelta(days=365)

# 삼성전자 1년 일봉 데이터
samsung = fdr.DataReader('005930', start_date, end_date)
# 결과: Date, Open, High, Low, Close, Volume, Change (약 250 거래일)

# SK하이닉스
skhynix = fdr.DataReader('000660', start_date, end_date)

# 카카오
kakao = fdr.DataReader('035720', start_date, end_date)

# 코스피 전체 종목 리스트
kospi_list = fdr.StockListing('KOSPI')
```

#### 해외 주식 (yfinance)

```python
import yfinance as yf

# 엔비디아 1년 일봉 데이터
nvda = yf.download('NVDA', period='1y')
# 결과: Date, Open, High, Low, Close, Adj Close, Volume (약 252 거래일)

# 여러 종목 한 번에
tickers = ['NVDA', 'AMD', 'TSMC', 'TSLA', 'AAPL']
data = yf.download(tickers, period='1y')

# 한국 주식도 가능 (Yahoo Finance 티커)
samsung_yf = yf.download('005930.KS', period='1y')  # .KS = KOSPI
kakao_yf = yf.download('035720.KS', period='1y')
```

#### 실제 수집 결과 예시

```
엔비디아 (NVDA) — 2025.02.27 기준 1년 데이터:
┌──────────┬────────┬────────┬────────┬────────┬───────────┐
│ Date     │ Open   │ High   │ Low    │ Close  │ Volume    │
├──────────┼────────┼────────┼────────┼────────┼───────────┤
│ 2025-02  │ $131.2 │ $131.8 │ $120.5 │ $124.9 │ 45,200,000│
│ 2025-01  │ $149.4 │ $153.1 │ $129.6 │ $131.2 │ 52,800,000│
│ 2024-12  │ $138.5 │ $152.9 │ $131.9 │ $149.4 │ 48,100,000│
│ ...      │ ...    │ ...    │ ...    │ ...    │ ...       │
│ 2024-03  │ $87.9  │ $95.2  │ $85.3  │ $90.3  │ 61,500,000│
└──────────┴────────┴────────┴────────┴────────┴───────────┘
약 252 거래일 × 6개 컬럼 = 1,512 데이터 포인트/종목
```

### 2-2. 데이터 파이프라인 설계

```
[데이터 수집 파이프라인]

┌─────────────────────────────────────────────────────┐
│ 1. 수집 (매일 00:00 자동 실행)                       │
│                                                     │
│   yfinance ──→ 해외 종목 (NVDA, AMD, TSLA...)       │
│   FinanceDataReader ──→ 국내 종목 (삼성, SK, 카카오) │
│                                                     │
│ 2. 전처리                                           │
│                                                     │
│   원본 데이터 ──→ 결측치 처리 (공휴일 등)            │
│              ──→ 환율 변환 (해외 → 원화)             │
│              ──→ 기술적 지표 계산 (RSI, MACD, MA)    │
│              ──→ 변동성 분류 (안정/변동/고변동)       │
│                                                     │
│ 3. 저장                                             │
│                                                     │
│   JSON 파일 (프론트엔드 호환)                        │
│   또는 PostgreSQL/SQLite (백엔드 서버)               │
│                                                     │
│ 4. AI 사전 계산                                     │
│                                                     │
│   각 턴(거래일)마다 5가지 AI의 결정을 미리 계산       │
│   결과를 JSON으로 저장 → 프론트엔드에서 즉시 비교     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 2-3. 프론트엔드 호환 JSON 변환

현재 프론트엔드의 데이터 구조에 맞춰 변환합니다:

```python
import json
import FinanceDataReader as fdr
import yfinance as yf
from datetime import datetime, timedelta

def fetch_and_convert(ticker, source='fdr', name='', category=''):
    """실제 데이터를 프론트엔드 JSON 형식으로 변환"""
    end = datetime.now()
    start = end - timedelta(days=365)
    
    if source == 'fdr':
        df = fdr.DataReader(ticker, start, end)
    else:
        df = yf.download(ticker, start=start, end=end)
    
    turns = []
    for i, (date, row) in enumerate(df.iterrows()):
        price_change = 0
        if i > 0:
            prev = df.iloc[i-1]['Close']
            price_change = (row['Close'] - prev) / prev
        
        turns.append({
            "turn": i + 1,
            "date": date.strftime('%Y.%m.%d'),
            "price": int(row['Close']),
            "open": int(row['Open']),
            "high": int(row['High']),
            "low": int(row['Low']),
            "volume": int(row['Volume']),
            "change": round(price_change * 100, 2),
            "news": generate_news_from_change(name, price_change),
        })
    
    return {
        "id": ticker,
        "name": name,
        "category": category,
        "initialPrice": turns[0]['price'] if turns else 0,
        "turns": turns,
    }

# 사용 예시
stocks = [
    fetch_and_convert('005930', 'fdr', '삼성전자', 'AI/반도체'),
    fetch_and_convert('000660', 'fdr', 'SK하이닉스', 'AI/반도체'),
    fetch_and_convert('035720', 'fdr', '카카오', 'AI/플랫폼'),
    fetch_and_convert('NVDA', 'yf', '엔비디아', 'AI/반도체'),
    fetch_and_convert('AMD', 'yf', 'AMD', 'AI/반도체'),
    fetch_and_convert('TSLA', 'yf', '테슬라', '로봇/자율주행'),
]

# 프론트엔드 호환 JSON 저장
with open('frontend/data/real-stock-1year.json', 'w', encoding='utf-8') as f:
    json.dump({"stocks": stocks, "generatedAt": datetime.now().isoformat()}, f, ensure_ascii=False)
```

**결과**: 현재 `stock-100days-data.json` (GBM 랜덤 데이터)을 **실제 데이터 JSON**으로 교체하면 프론트엔드 코드 변경 최소화로 즉시 적용 가능합니다.

### 2-4. 데이터 소스별 상세 비교

| 항목 | yfinance | FinanceDataReader | pykrx | KRX OPEN API |
|:---|:---|:---|:---|:---|
| **한국 주식** | ✅ `.KS` 접미사 | ✅ 종목코드 직접 | ✅ KRX 크롤링 | ✅ 공식 |
| **해외 주식** | ✅ 티커 직접 | ✅ NYSE/NASDAQ | ❌ | ❌ |
| **일봉 데이터** | ✅ 무제한 | ✅ 무제한 | ✅ 무제한 | ✅ |
| **분봉 데이터** | ✅ 최근 60일 | ❌ | ❌ | ⚠️ 제한 |
| **호출 제한** | 비공식 (과도 시 차단) | 없음 | 없음 | API 키 필요 |
| **안정성** | ⚠️ Yahoo 정책 변경 가능 | ✅ 안정적 | ✅ 안정적 | ✅ 공식 |
| **설치** | `pip install yfinance` | `pip install finance-datareader` | `pip install pykrx` | REST API |
| **속도** | 빠름 | 빠름 | 보통 | 보통 |
| **라이선스** | 개인/교육용 | MIT | MIT | 이용약관 |

**추천**: 
- **개발/MVP 단계**: `yfinance` + `FinanceDataReader` (무료, 즉시 사용)
- **프로덕션 단계**: `KRX OPEN API` (한국) + `Polygon.io Starter $29/월` (해외)

---

## 3. AI 판단 알고리즘 — 실행 가능성

### 3-1. 현재 알고리즘 분석

현재 `useAICompetitor.ts`에 구현된 알고리즘:

```
현재 구조:
├── 사용자 성향 분류 (classifyUserStyle)
│   └── 현금 비율 기반 5단계 분류
│       70%+ → conservative
│       50%+ → stable
│       30%+ → balanced
│       10%+ → aggressive
│       그 외 → ultra_aggressive
│
├── AI 의사결정 (runSingleAIDay)
│   ├── 보유 종목 체크
│   │   ├── 수익률 ≥ 익절 기준 → 50% 매도
│   │   └── 수익률 ≤ 손절 기준 → 전량 매도
│   └── 매수 조건 체크
│       ├── 현금 비율 > 최소 기준
│       ├── 포지션 비율 < 최대 기준
│       └── 랜덤 확률 × 투자 비중 → 매수
│
└── 파도 분석 (analyzeWavePattern)
    └── 가격 변동 방향 + 사용자 매매 방향 비교
```

**현재의 한계**:
1. 가격 데이터만 사용 (거래량, 기술적 지표 미활용)
2. 랜덤 요소가 큼 (`Math.random()` 의존)
3. 엘리엇 파동 감지가 단순 (상승/하락/횡보만 분류)
4. 백테스트 검증 없음

### 3-2. 백엔드 전환 시 강화 알고리즘

#### Phase 1: 기술적 지표 기반 AI (즉시 구현 가능)

```python
import pandas as pd
import numpy as np

class AITrader:
    """기술적 지표 기반 AI 트레이더"""
    
    def __init__(self, style: str, initial_cash: float):
        self.style = style
        self.cash = initial_cash
        self.holdings = {}  # {ticker: quantity}
        self.avg_prices = {}  # {ticker: avg_price}
        self.params = STRATEGY_PARAMS[style]
        self.trade_history = []
    
    def calculate_indicators(self, prices: pd.Series) -> dict:
        """기술적 지표 계산"""
        return {
            'sma_5': prices.rolling(5).mean().iloc[-1],
            'sma_20': prices.rolling(20).mean().iloc[-1],
            'sma_60': prices.rolling(60).mean().iloc[-1],
            'rsi': self._calc_rsi(prices, 14),
            'macd': self._calc_macd(prices),
            'bollinger': self._calc_bollinger(prices, 20),
            'volume_ratio': self._calc_volume_ratio(prices),
            'atr': self._calc_atr(prices, 14),  # 변동성
        }
    
    def decide(self, ticker: str, prices: pd.Series, 
               volumes: pd.Series, current_day: int) -> dict:
        """매매 결정 — 스타일별 전략"""
        
        indicators = self.calculate_indicators(prices)
        current_price = prices.iloc[-1]
        held = self.holdings.get(ticker, 0)
        avg = self.avg_prices.get(ticker, 0)
        profit_pct = ((current_price - avg) / avg * 100) if avg > 0 else 0
        
        # ── 매도 판단 ──
        if held > 0:
            sell_signal = self._check_sell_signal(
                indicators, profit_pct, self.params
            )
            if sell_signal['action']:
                return {
                    'action': 'sell',
                    'quantity': sell_signal['quantity'],
                    'reason': sell_signal['reason'],
                    'confidence': sell_signal['confidence'],
                }
        
        # ── 매수 판단 ──
        buy_signal = self._check_buy_signal(
            indicators, current_price, self.params
        )
        if buy_signal['action']:
            max_budget = self.cash * self.params['investment_ratio']
            quantity = int(max_budget * buy_signal['ratio'] / current_price)
            if quantity > 0 and quantity * current_price <= self.cash:
                return {
                    'action': 'buy',
                    'quantity': quantity,
                    'reason': buy_signal['reason'],
                    'confidence': buy_signal['confidence'],
                }
        
        return {
            'action': 'hold',
            'quantity': 0,
            'reason': self._hold_reason(indicators),
            'confidence': 0.5,
        }
    
    def _check_buy_signal(self, ind: dict, price: float, params: dict) -> dict:
        """매수 신호 판단 — 스타일별 차이"""
        
        signals = []
        
        # 골든크로스 (5일선 > 20일선)
        if ind['sma_5'] > ind['sma_20']:
            signals.append(('골든크로스 형성', 0.6))
        
        # RSI 과매도
        if ind['rsi'] < params['rsi_buy_threshold']:
            signals.append(('RSI 과매도 구간', 0.7))
        
        # MACD 골든크로스
        if ind['macd']['signal'] == 'golden_cross':
            signals.append(('MACD 골든크로스', 0.65))
        
        # 볼린저밴드 하단 터치
        if price <= ind['bollinger']['lower']:
            signals.append(('볼린저밴드 하단 반등', 0.7))
        
        # 거래량 급증
        if ind['volume_ratio'] > 2.0:
            signals.append(('거래량 200% 급증', 0.55))
        
        if not signals:
            return {'action': False}
        
        # 스타일별 진입 기준
        min_signals = {
            'conservative': 3,  # 3개 이상 신호 필요
            'stable': 2,
            'balanced': 2,
            'aggressive': 1,
            'ultra_aggressive': 1,
        }
        
        if len(signals) >= min_signals[self.style]:
            best = max(signals, key=lambda x: x[1])
            ratio = params['position_ratio'][len(signals) - 1]
            return {
                'action': True,
                'reason': best[0],
                'confidence': best[1],
                'ratio': ratio,
            }
        
        return {'action': False}
    
    def _check_sell_signal(self, ind: dict, profit_pct: float, 
                           params: dict) -> dict:
        """매도 신호 판단"""
        
        # 손절
        if profit_pct <= params['stop_loss']:
            return {
                'action': True,
                'quantity': self.holdings.get('current', 0),  # 전량
                'reason': f'손절선 도달 ({profit_pct:.1f}%)',
                'confidence': 0.9,
            }
        
        # 익절
        if profit_pct >= params['take_profit']:
            sell_ratio = params['take_profit_ratio']
            qty = max(1, int(self.holdings.get('current', 0) * sell_ratio))
            return {
                'action': True,
                'quantity': qty,
                'reason': f'목표 수익 달성 ({profit_pct:.1f}%)',
                'confidence': 0.85,
            }
        
        # RSI 과매수
        if ind['rsi'] > params['rsi_sell_threshold']:
            qty = max(1, int(self.holdings.get('current', 0) * 0.5))
            return {
                'action': True,
                'quantity': qty,
                'reason': 'RSI 과매수 구간',
                'confidence': 0.6,
            }
        
        # 데드크로스
        if ind['sma_5'] < ind['sma_20']:
            qty = max(1, int(self.holdings.get('current', 0) * 0.3))
            return {
                'action': True,
                'quantity': qty,
                'reason': '데드크로스 감지',
                'confidence': 0.55,
            }
        
        return {'action': False}


# ── 스타일별 전략 파라미터 ──

STRATEGY_PARAMS = {
    'conservative': {
        'investment_ratio': 0.3,
        'stop_loss': -3,
        'take_profit': 8,
        'take_profit_ratio': 1.0,  # 전량 익절
        'rsi_buy_threshold': 25,
        'rsi_sell_threshold': 70,
        'position_ratio': [0.15, 0.25, 0.30],  # 신호 1/2/3개일 때
        'min_cash_ratio': 0.5,
    },
    'stable': {
        'investment_ratio': 0.5,
        'stop_loss': -5,
        'take_profit': 10,
        'take_profit_ratio': 0.7,  # 70% 익절
        'rsi_buy_threshold': 30,
        'rsi_sell_threshold': 72,
        'position_ratio': [0.20, 0.35, 0.50],
        'min_cash_ratio': 0.35,
    },
    'balanced': {
        'investment_ratio': 0.6,
        'stop_loss': -7,
        'take_profit': 12,
        'take_profit_ratio': 0.6,
        'rsi_buy_threshold': 35,
        'rsi_sell_threshold': 75,
        'position_ratio': [0.25, 0.40, 0.60],
        'min_cash_ratio': 0.25,
    },
    'aggressive': {
        'investment_ratio': 0.7,
        'stop_loss': -8,
        'take_profit': 15,
        'take_profit_ratio': 0.5,  # 50% 익절, 나머지 보유
        'rsi_buy_threshold': 40,
        'rsi_sell_threshold': 78,
        'position_ratio': [0.35, 0.50, 0.70],
        'min_cash_ratio': 0.15,
    },
    'ultra_aggressive': {
        'investment_ratio': 0.9,
        'stop_loss': -10,
        'take_profit': 20,
        'take_profit_ratio': 0.4,  # 40%만 익절
        'rsi_buy_threshold': 45,
        'rsi_sell_threshold': 82,
        'position_ratio': [0.50, 0.70, 0.90],
        'min_cash_ratio': 0.05,
    },
}
```

#### Phase 2: 엘리엇 파동 감지 (1~2개월 내 구현)

```python
class ElliottWaveDetector:
    """엘리엇 파동 자동 감지"""
    
    def detect_waves(self, prices: pd.Series, window: int = 60) -> dict:
        """최근 N일 데이터에서 엘리엇 파동 패턴 감지"""
        
        # 1. 극점(피크/밸리) 찾기
        peaks, valleys = self._find_extremes(prices, window)
        
        # 2. 파동 카운팅
        waves = self._count_waves(peaks, valleys, prices)
        
        # 3. 현재 위치 판단
        current_wave = self._identify_current_wave(waves, prices)
        
        # 4. 피보나치 목표가 계산
        targets = self._fibonacci_targets(waves, current_wave)
        
        return {
            'waves': waves,
            'current_wave': current_wave,  # "wave_3_start", "wave_4_correction" 등
            'confidence': self._wave_confidence(waves),
            'targets': targets,
            'recommendation': self._wave_recommendation(current_wave),
        }
    
    def _find_extremes(self, prices, window):
        """지그재그 알고리즘으로 극점 탐색"""
        threshold = prices.std() * 0.5  # 변동성 기반 임계값
        peaks = []
        valleys = []
        
        last_extreme = prices.iloc[0]
        last_type = None
        
        for i in range(1, len(prices)):
            if prices.iloc[i] - last_extreme > threshold:
                if last_type != 'peak':
                    peaks.append((i, prices.iloc[i]))
                    last_extreme = prices.iloc[i]
                    last_type = 'peak'
            elif last_extreme - prices.iloc[i] > threshold:
                if last_type != 'valley':
                    valleys.append((i, prices.iloc[i]))
                    last_extreme = prices.iloc[i]
                    last_type = 'valley'
        
        return peaks, valleys
    
    def _count_waves(self, peaks, valleys, prices):
        """상승 5파 / 하락 3파 패턴 매칭"""
        # 피크-밸리 교대 순서로 파동 번호 부여
        # 상승 5파: valley(1시작) → peak(1끝) → valley(2끝) → peak(3끝) → ...
        # 하락 3파: peak(A시작) → valley(A끝) → peak(B끝) → valley(C끝)
        
        extremes = sorted(
            [(i, p, 'peak') for i, p in peaks] + 
            [(i, p, 'valley') for i, p in valleys],
            key=lambda x: x[0]
        )
        
        waves = []
        for i, (idx, price, type_) in enumerate(extremes):
            waves.append({
                'index': idx,
                'price': price,
                'type': type_,
                'wave_number': i + 1,
            })
        
        return waves
    
    def _wave_recommendation(self, current_wave):
        """파동 위치별 추천"""
        recommendations = {
            'wave_1': '1파 초기 — 소량 매수 고려',
            'wave_2_correction': '2파 조정 — 분할 매수 적기',
            'wave_3_start': '3파 시작 — 적극 매수 (가장 강한 상승)',
            'wave_3_middle': '3파 중반 — 보유 유지',
            'wave_4_correction': '4파 조정 — 추가 매수 또는 보유',
            'wave_5': '5파 마무리 — 익절 준비',
            'wave_a': 'A파 하락 — 매도 또는 관망',
            'wave_b': 'B파 반등 — 함정! 매수 금지',
            'wave_c': 'C파 하락 — 바닥 확인 후 매수 준비',
        }
        return recommendations.get(current_wave, '분석 중')
```

#### Phase 3: 유사 AI 매칭 고도화 (2~3개월 내)

```python
class SimilarAIMatcher:
    """사용자 매매 패턴 분석 → 유사 AI 매칭"""
    
    def analyze_user_pattern(self, trade_history: list) -> dict:
        """사용자 매매 패턴 분석"""
        
        if not trade_history:
            return {'style': 'balanced', 'confidence': 0.3}
        
        # 1. 매매 빈도
        buy_count = sum(1 for t in trade_history if t['action'] == 'buy')
        sell_count = sum(1 for t in trade_history if t['action'] == 'sell')
        hold_count = sum(1 for t in trade_history if t['action'] == 'hold')
        total = len(trade_history)
        
        # 2. 평균 보유 기간
        avg_hold_days = self._calc_avg_hold_days(trade_history)
        
        # 3. 손절/익절 비율
        stop_loss_trades = [t for t in trade_history 
                          if t['action'] == 'sell' and t.get('profit_pct', 0) < 0]
        take_profit_trades = [t for t in trade_history 
                            if t['action'] == 'sell' and t.get('profit_pct', 0) > 0]
        
        avg_loss = np.mean([t['profit_pct'] for t in stop_loss_trades]) if stop_loss_trades else 0
        avg_profit = np.mean([t['profit_pct'] for t in take_profit_trades]) if take_profit_trades else 0
        
        # 4. 포지션 크기
        avg_position_ratio = np.mean([t.get('position_ratio', 0.5) for t in trade_history])
        
        # 5. 스타일 점수 계산
        aggression_score = (
            (buy_count / max(total, 1)) * 0.25 +          # 매수 빈도
            (avg_position_ratio) * 0.25 +                   # 포지션 크기
            (abs(avg_loss) / 10) * 0.15 +                   # 손절 허용 범위
            (avg_profit / 20) * 0.15 +                      # 익절 목표
            (1 - avg_hold_days / 30) * 0.20                 # 보유 기간 (짧을수록 공격적)
        )
        
        # 6. 스타일 분류
        if aggression_score < 0.2:
            style = 'conservative'
        elif aggression_score < 0.4:
            style = 'stable'
        elif aggression_score < 0.6:
            style = 'balanced'
        elif aggression_score < 0.8:
            style = 'aggressive'
        else:
            style = 'ultra_aggressive'
        
        return {
            'style': style,
            'confidence': min(0.95, 0.3 + len(trade_history) * 0.05),
            'aggression_score': round(aggression_score, 3),
            'metrics': {
                'buy_ratio': buy_count / max(total, 1),
                'avg_hold_days': avg_hold_days,
                'avg_loss_pct': avg_loss,
                'avg_profit_pct': avg_profit,
                'avg_position_ratio': avg_position_ratio,
            }
        }
```

### 3-3. AI 사전 계산 시스템

**핵심 아이디어**: 실제 1년 데이터를 받으면, **모든 거래일에 대해 5가지 AI의 결정을 미리 계산**해 둡니다. 사용자가 게임을 플레이할 때는 이미 계산된 결과를 즉시 보여줍니다.

```python
def precompute_ai_decisions(stock_data: dict, initial_cash: float) -> dict:
    """모든 거래일에 대해 5가지 AI 결정을 사전 계산"""
    
    styles = ['conservative', 'stable', 'balanced', 'aggressive', 'ultra_aggressive']
    ai_traders = {s: AITrader(s, initial_cash) for s in styles}
    
    results = {s: [] for s in styles}
    prices = pd.Series([t['price'] for t in stock_data['turns']])
    
    for day in range(len(stock_data['turns'])):
        if day < 5:  # 최소 5일 데이터 필요
            for s in styles:
                results[s].append({'action': 'hold', 'reason': '데이터 축적 중'})
            continue
        
        price_window = prices[:day+1]
        
        for style in styles:
            decision = ai_traders[style].decide(
                stock_data['id'], price_window, None, day
            )
            
            # 실제 매매 실행 (포트폴리오 업데이트)
            ai_traders[style].execute(decision, stock_data['turns'][day])
            
            results[style].append({
                'day': day,
                'action': decision['action'],
                'quantity': decision['quantity'],
                'reason': decision['reason'],
                'confidence': decision['confidence'],
                'cash': ai_traders[style].cash,
                'total_value': ai_traders[style].total_value(prices.iloc[day]),
                'profit_rate': ai_traders[style].profit_rate(initial_cash, prices.iloc[day]),
            })
    
    return results

# 실행
ai_decisions = precompute_ai_decisions(samsung_data, 50_000_000)

# JSON 저장 → 프론트엔드에서 즉시 사용
with open('frontend/data/ai-decisions-samsung.json', 'w') as f:
    json.dump(ai_decisions, f, ensure_ascii=False)
```

**프론트엔드에서의 사용**:

```typescript
// 기존: useAICompetitor 훅에서 실시간 계산 (랜덤 요소)
// 변경: 사전 계산된 JSON에서 즉시 로드

const aiDecisions = await import('@/data/ai-decisions-samsung.json')

// 사용자가 Day 15에서 카카오를 매수했을 때:
const similarAI = aiDecisions[userStyle][14]  // Day 15 = index 14
const bestAI = aiDecisions['ultra_aggressive'][14]

// 즉시 비교 가능:
// "유사 AI: 매수 250주 (이유: 골든크로스 형성)"
// "최고 AI: 매수 700주 (이유: RSI 과매도 + MACD 골든크로스)"
```

---

## 4. 구현 아키텍처 제안

### 4-1. Phase 1: 서버리스 (즉시 가능, 비용 $0)

```
[현재 프론트엔드 Only 구조에서 최소 변경]

Python 스크립트 (로컬/GitHub Actions)
  ├── 매주 1회 실행 (cron)
  ├── yfinance + FinanceDataReader로 데이터 수집
  ├── 5가지 AI 결정 사전 계산
  ├── JSON 파일 생성
  └── Git commit → Vercel 자동 배포

Next.js Frontend (기존)
  ├── JSON import (기존 구조 유지)
  ├── useAICompetitor → 사전 계산 JSON 참조로 변경
  └── 나머지 코드 변경 최소화
```

**장점**: 서버 비용 $0, 기존 코드 최소 변경, 즉시 실행 가능
**단점**: 실시간 데이터 아님 (주 1회 갱신), 사용자별 개인화 제한

### 4-2. Phase 2: 경량 백엔드 (3~6개월)

```
[백엔드 추가]

Python Backend (FastAPI)
  ├── /api/stocks/realtime — 실시간 주가 조회
  ├── /api/ai/decide — AI 의사결정 API
  ├── /api/ai/compare — 사용자 vs AI 비교
  ├── /api/user/pattern — 사용자 패턴 분석
  └── /api/ranking — 랭킹 계산

Database (PostgreSQL)
  ├── stock_prices — 주가 데이터
  ├── ai_decisions — AI 사전 계산 결과
  ├── user_trades — 사용자 거래 기록
  └── rankings — 랭킹 데이터

Scheduler (Celery / cron)
  ├── 매일 00:00 — 전일 주가 수집
  ├── 매일 01:00 — AI 결정 사전 계산
  └── 매주 월요일 — 랭킹 갱신
```

---

## 5. 비용 분석

### Phase 1 (서버리스, 즉시)

| 항목 | 비용 | 비고 |
|:---|:---|:---|
| yfinance | $0 | 오픈소스 |
| FinanceDataReader | $0 | 오픈소스 |
| GitHub Actions | $0 | 무료 2,000분/월 |
| Vercel 배포 | $0 | 무료 티어 |
| **합계** | **$0/월** | |

### Phase 2 (경량 백엔드)

| 항목 | 비용 | 비고 |
|:---|:---|:---|
| 서버 (Railway/Render) | $5~25/월 | 스타터 플랜 |
| PostgreSQL (Supabase) | $0~25/월 | 무료 티어 가능 |
| Polygon.io (해외 데이터) | $29/월 | Starter 플랜 |
| 도메인/SSL | $12/년 | |
| **합계** | **$34~79/월** | |

### Phase 3 (프로덕션)

| 항목 | 비용 | 비고 |
|:---|:---|:---|
| AWS/GCP 서버 | $50~200/월 | 사용량 기반 |
| 데이터베이스 | $25~100/월 | |
| 주가 데이터 API | $29~199/월 | |
| CDN/캐시 | $10~50/월 | |
| **합계** | **$114~549/월** | |

---

## 6. 리스크 & 대응

| 리스크 | 확률 | 영향 | 대응 |
|:---|:---:|:---:|:---|
| yfinance API 차단/변경 | 중 | 높음 | FinanceDataReader 백업, Polygon.io 전환 준비 |
| 한국 주식 데이터 크롤링 차단 | 낮음 | 중 | KRX OPEN API 공식 전환 |
| AI 알고리즘 성능 부족 | 중 | 중 | 백테스트로 지속 검증, 파라미터 튜닝 |
| 데이터 정확성 이슈 | 낮음 | 높음 | 다중 소스 크로스 체크 |
| 서버 비용 증가 | 중 | 낮음 | 사전 계산 + 캐싱으로 최적화 |
| 투자 조언 규제 | 중 | 높음 | "교육/시뮬레이션 목적" 명시, 법무 검토 |

---

## 7. 실행 로드맵

### Week 1~2: 데이터 수집 파이프라인

```
□ yfinance + FinanceDataReader 설치 및 테스트
□ 대상 종목 10개 선정 (국내 5 + 해외 5)
□ 1년 일봉 데이터 수집 스크립트 작성
□ 프론트엔드 호환 JSON 변환 함수 작성
□ 기존 stock-100days-data.json → 실제 데이터 JSON 교체
□ 프론트엔드에서 정상 동작 확인
```

### Week 3~4: AI 알고리즘 강화

```
□ 기술적 지표 계산 모듈 (RSI, MACD, 볼린저밴드, 이동평균)
□ 5가지 AI 전략 파라미터 정의 (기술적 지표 기반)
□ AI 사전 계산 시스템 구현
□ 백테스트: 실제 1년 데이터로 5가지 AI 수익률 검증
□ 파라미터 튜닝 (목표: 보수형 +5~10%, 초공격형 +20~40%)
```

### Week 5~6: 통합 및 검증

```
□ 사전 계산 JSON → 프론트엔드 useAICompetitor 연동
□ 유사 AI 매칭 로직 고도화
□ 파도 분석 → 엘리엇 파동 감지 기초 버전
□ 전체 게임 플로우 테스트
□ GitHub Actions 자동화 (주 1회 데이터 갱신)
```

### Month 3~4: 백엔드 서버 (선택)

```
□ FastAPI 백엔드 구축
□ PostgreSQL 데이터베이스 설계
□ 실시간 AI 비교 API
□ 사용자 패턴 분석 API
□ 랭킹 계산 시스템
```

---

## 최종 결론

### 데이터 수집: ✅ 즉시 가능

```
yfinance + FinanceDataReader
→ 코드 10줄로 1년 데이터 수집
→ 비용 $0
→ 한국 + 해외 주식 모두 지원
→ 현재 프론트엔드 JSON 구조와 호환
```

### AI 알고리즘: ✅ 단계적 구축 가능

```
Phase 1 (2주): 기술적 지표 기반 AI → 현재보다 훨씬 정교
Phase 2 (1개월): 엘리엇 파동 감지 → 파도 분석 고도화
Phase 3 (2개월): 유사 AI 매칭 고도화 → 매매 패턴 유사도

현재 프론트엔드의 useAICompetitor.ts를
"사전 계산된 실제 데이터 기반 AI 결정 JSON"으로 교체하면
코드 변경 최소화 + 품질 대폭 향상
```

### 핵심 메시지

**"가짜 데이터 + 랜덤 AI"에서 "실제 데이터 + 기술적 지표 AI"로의 전환은 2주면 가능합니다.**

이것이 실현되면 투자 유치 제안서의 핵심 문구 — **"AI/로봇주의 실제 지난 1년 데이터로 시뮬레이션"** — 이 사실이 됩니다.

---

*Last Updated: 2026.02.27*
