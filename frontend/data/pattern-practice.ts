import { CHART_PATTERNS } from './chart-patterns';
import BASIC_STRATEGY_DATA from './basic-strategy-scenarios.json';

// ─── Types ───────────────────────────────────────────────
export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface PatternScenario {
  candles: Candle[];
  signal: 'buy' | 'sell';
  optimalEntryIndex: number;
  optimalExitIndex: number;
  hint: string;
}

export type Grade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

// ─── Per-turn evaluation ──────────────────────────────────
export interface TurnEval {
  turn: number;
  action: 'buy' | 'sell' | 'skip' | 'timeout';
  price: number;
  turnPnl: number;    // 이 턴 단독 행동의 예상 손익 (최종가 기준)
  score: number;      // 0.0 ~ 2.5
  verdict: string;
  correct: boolean;
}

export interface RoundScore {
  total: number;
  grade: Grade;
  emoji: string;
  message: string;
  userPnl: number;
  optimalPnl: number;
  turnEvals: TurnEval[];
}

export interface TradeLog {
  action: 'buy' | 'sell' | 'skip' | 'timeout';
  price: number;
  turn: number;
  shares: number;   // 거래 주식 수 (skip/timeout = 0)
  amount: number;   // 총 금액 price × shares (skip/timeout = 0)
  pct: number;      // 투자 비율 0.25/0.5/0.75/1.0 (skip/timeout = 0)
}

// ─── Constants ───────────────────────────────────────────
export const TOTAL_ROUNDS = 3;
export const TURNS_PER_ROUND = 10;
export const CANDLES_PER_TURN = 2;
export const INITIAL_REVEAL = 4;
export const INITIAL_CASH = 1_000_000;   // 시작 자금 100만원 (현금 50% + 주식 50%)
// 패턴 연습 턴 제한 시간: 15초 고정 (시나리오 플레이는 30초)
export const DECISION_TIMERS = [15, 15, 15];
const TARGET_LENGTH = INITIAL_REVEAL + TURNS_PER_ROUND * CANDLES_PER_TURN + 2; // 26

// 10턴 기준 최대 점수 25점 (턴당 2.5점)
const GRADE_MAP: { min: number; grade: Grade; emoji: string; message: string }[] = [
  { min: 22, grade: 'S', emoji: '🔥', message: '전설적인 매매!' },
  { min: 18, grade: 'A', emoji: '💪', message: '상위 5% 수준!' },
  { min: 13, grade: 'B', emoji: '👍', message: '평균 이상' },
  { min: 8, grade: 'C', emoji: '🤔', message: '아쉬운 판단' },
  { min: 3, grade: 'D', emoji: '😅', message: '많이 부족해요' },
  { min: 0, grade: 'F', emoji: '💤', message: '매매를 못했어요' },
];

// ─── OHLC generator ──────────────────────────────────────
function toOHLC(
  closePrices: number[],
  overrides?: Record<number, Partial<Candle>>,
): Candle[] {
  return closePrices.map((close, i) => {
    if (overrides?.[i]) {
      const o = overrides[i];
      const op = o.open ?? (i === 0 ? close * 0.998 : closePrices[i - 1]);
      const cl = o.close ?? close;
      return {
        open: Math.round(op),
        high: Math.round(o.high ?? Math.max(op, cl) * 1.004),
        low: Math.round(o.low ?? Math.min(op, cl) * 0.996),
        close: Math.round(cl),
      };
    }
    const open = i === 0 ? close * 0.998 : closePrices[i - 1];
    const body = Math.abs(close - open);
    const wick = Math.max(body * 0.35, close * 0.003);
    return {
      open: Math.round(open),
      high: Math.round(Math.max(open, close) + wick),
      low: Math.round(Math.min(open, close) - wick),
      close: Math.round(close),
    };
  });
}

// ─── Auto-extend short scenarios ─────────────────────────
interface ScenarioDef {
  prices: number[];
  signal: 'buy' | 'sell';
  optimalEntry: number;
  optimalExit: number;
  hint: string;
  overrides?: Record<number, Partial<Candle>>;
}

function ensureLength(def: ScenarioDef): ScenarioDef {
  if (def.prices.length >= TARGET_LENGTH) return def;

  const deficit = TARGET_LENGTH - def.prices.length;
  const addFront = Math.ceil(deficit / 2);
  const addBack = deficit - addFront;

  const first = def.prices[0];
  const second = def.prices[1];
  const step = (second - first) * 0.55;
  const front: number[] = [];
  for (let i = addFront; i > 0; i--) {
    front.push(Math.round(first - step * i + Math.sin(i * 3.7) * first * 0.004));
  }

  const last = def.prices[def.prices.length - 1];
  const prev = def.prices[def.prices.length - 2];
  const endStep = (last - prev) * 0.55;
  const back: number[] = [];
  for (let i = 1; i <= addBack; i++) {
    back.push(Math.round(last + endStep * i + Math.sin(i * 5.1) * last * 0.004));
  }

  const shifted = def.overrides
    ? Object.fromEntries(
        Object.entries(def.overrides).map(([k, v]) => [String(Number(k) + addFront), v]),
      )
    : undefined;

  return {
    ...def,
    prices: [...front, ...def.prices, ...back],
    optimalEntry: def.optimalEntry + addFront,
    optimalExit: def.optimalExit + addFront,
    overrides: shifted,
  };
}

// ─── Scenario definitions ────────────────────────────────
// 모든 시나리오: 파동이 2회 이상 반복 (상승↑하락↓재상승 or 하락↓반등↑재하락)
// hint: 답 없이 상황 묘사만 — 플레이어가 스스로 판단
const RAW_SCENARIOS: Record<string, ScenarioDef> = {
  'head-shoulders': {
    // 상승 → 1차 고점 → 반등 → 더 높은 고점(머리) → 반등 → 낮은 고점 → 하락
    prices: [
      46000, 48500, 51000, 53500,           // 초기 상승
      56000, 58500, 57000, 54500, 52000,    // 1차 상승·하락 (왼쪽 어깨)
      54500, 57000, 60000, 63000, 61500,    // 2차 상승 (머리)
      58500, 55000, 52500,                  // 2차 하락
      54500, 57000, 59500, 58000,           // 3차 반등 (오른쪽 어깨)
      55500, 52500, 49500, 47000, 44500,    // 넥라인 이탈·하락
    ],
    signal: 'sell',
    optimalEntry: 21,
    optimalExit: 25,
    hint: '주가가 세 번 봉우리를 만들고 있어요. 각 봉우리의 높이를 비교해 보세요.',
  },
  'inv-head-shoulders': {
    // 하락 → 1차 저점 → 반등 → 더 깊은 저점(머리) → 반등 → 얕은 저점 → 상승
    prices: [
      64000, 61500, 59000, 56500,           // 초기 하락
      54000, 51500, 53000, 55500, 58000,    // 1차 하락·반등 (왼쪽 어깨)
      55500, 53000, 50000, 47000, 49500,    // 2차 하락 (머리)
      52500, 56000, 58500,                  // 2차 반등
      56000, 53500, 51000, 52500,           // 3차 하락 (오른쪽 어깨)
      55500, 58500, 61500, 64000, 66500,    // 넥라인 돌파·상승
    ],
    signal: 'buy',
    optimalEntry: 21,
    optimalExit: 25,
    hint: '주가가 세 번 바닥을 찍고 있어요. 각 바닥의 깊이를 비교해 보세요.',
  },
  'double-top': {
    // 상승 → 1차 고점 → 조정 → 재상승 → 같은 고점 저항 → 하락
    prices: [
      46000, 48000, 50500, 53000,           // 초기 상승
      56000, 59000, 61500, 59500, 57000,    // 1차 고점·조정
      55000, 57500, 60000, 61500,           // 재상승 시도
      59500, 57000, 54500,                  // 2차 고점 저항·하락
      52000, 49500, 47500, 45500,           // 넥라인 이탈·하락
    ],
    signal: 'sell',
    optimalEntry: 15,
    optimalExit: 20,
    hint: '주가가 비슷한 높이에서 두 번 막혔어요. 지금 어떤 흐름인지 살펴보세요.',
  },
  'double-bottom': {
    // 하락 → 1차 저점 → 반등 → 재하락 → 같은 저점 지지 → 상승
    prices: [
      64000, 62000, 59500, 57000,           // 초기 하락
      54000, 51000, 48500, 50500, 53000,    // 1차 저점·반등
      55000, 53000, 50500, 48500,           // 재하락 시도
      50500, 53000, 55500,                  // 2차 저점 지지·반등
      58000, 60500, 62500, 64500,           // 넥라인 돌파·상승
    ],
    signal: 'buy',
    optimalEntry: 15,
    optimalExit: 20,
    hint: '주가가 비슷한 깊이에서 두 번 버텼어요. 지금 어떤 흐름인지 살펴보세요.',
  },
  'triple-top': {
    // 상승 → 고점1 → 조정 → 고점2 → 조정 → 고점3 → 붕괴
    prices: [
      46000, 48500, 51000, 54000,           // 초기 상승
      57000, 60000, 57500, 55000, 52500,    // 1차 고점·조정
      55000, 57500, 60000,                  // 2차 고점
      57500, 55000, 52500,                  // 2차 조정
      55000, 57500, 60000,                  // 3차 고점
      57000, 54000, 51000,                  // 3차 조정
      48000, 45500, 43000, 41000,           // 지지선 붕괴·급락
    ],
    signal: 'sell',
    optimalEntry: 20,
    optimalExit: 24,
    hint: '같은 가격대에서 반복적으로 막히고 있어요. 몇 번째 시도인지 세어보세요.',
  },
  'ascending-triangle': {
    // 횡보 → 저점 상승 + 고점 수평 → 돌파 → 상승
    prices: [
      48000, 50500, 53000, 55500,           // 초기 상승
      58000, 55000, 58000, 55500, 58000,    // 1차 수렴 (저점↑, 고점 수평)
      56000, 58000, 56500, 58000,           // 2차 수렴 (저점↑ 계속)
      57000, 58000, 57500, 58000,           // 3차 수렴 (더 좁아짐)
      59500, 61500, 63500, 65500, 67500,    // 돌파·급등
    ],
    signal: 'buy',
    optimalEntry: 17,
    optimalExit: 21,
    hint: '위쪽은 계속 같은 곳에서 막히는데, 아래쪽은 어떻게 변하고 있나요?',
  },
  'descending-triangle': {
    // 횡보 → 고점 하락 + 저점 수평 → 이탈 → 하락
    prices: [
      67500, 65500, 63500, 61500,           // 초기 하락
      59000, 62000, 59000, 61500, 59000,    // 1차 수렴 (고점↓, 저점 수평)
      61000, 59000, 60500, 59000,           // 2차 수렴 (고점↓ 계속)
      60000, 59000, 59500, 59000,           // 3차 수렴 (더 좁아짐)
      57500, 55500, 53500, 51500, 49500,    // 이탈·급락
    ],
    signal: 'sell',
    optimalEntry: 17,
    optimalExit: 21,
    hint: '아래쪽은 계속 같은 곳에서 버티는데, 위쪽은 어떻게 변하고 있나요?',
  },
  'symmetrical-triangle': {
    // 변동성 큰 횡보 → 점점 수렴 → 돌파
    prices: [
      50000, 55000, 45500, 54000,           // 초기 큰 변동
      47000, 53000, 48000, 52000,           // 1차 수렴
      49000, 51500, 49500, 51000,           // 2차 수렴
      50000, 50500, 50200, 50800,           // 3차 수렴 (거의 수평)
      52500, 55000, 57500, 60000, 62500,    // 돌파·급등
    ],
    signal: 'buy',
    optimalEntry: 15,
    optimalExit: 20,
    hint: '주가의 변동 폭이 점점 좁아지고 있어요. 에너지가 모이는 중이에요.',
  },
  'rising-wedge': {
    // 상승하지만 상승폭 감소 → 2회 반등 후 이탈
    prices: [
      48000, 50000, 49000, 52000,           // 초기 상승
      51000, 54000, 53000, 56000,           // 1차 상승 (폭 큼)
      55200, 57500, 56800, 58500,           // 2차 상승 (폭 중간)
      58000, 59500, 59200, 60000,           // 3차 상승 (폭 작음)
      59000, 57000, 54500, 52000,           // 하단 이탈·급락
      49500, 47500,                          // 추가 하락
    ],
    signal: 'sell',
    optimalEntry: 15,
    optimalExit: 21,
    hint: '올라가고 있지만 각 상승의 폭이 어떻게 변하는지 살펴보세요.',
  },
  'falling-wedge': {
    // 하락하지만 하락폭 감소 → 2회 반등 후 돌파
    prices: [
      67500, 65500, 66500, 63500,           // 초기 하락
      64500, 61500, 62500, 59500,           // 1차 하락 (폭 큼)
      60200, 57500, 58200, 56500,           // 2차 하락 (폭 중간)
      57000, 55500, 55800, 55000,           // 3차 하락 (폭 작음)
      56500, 59000, 61500, 64000,           // 상단 돌파·반등
      66500, 68500,                          // 추가 상승
    ],
    signal: 'buy',
    optimalEntry: 15,
    optimalExit: 21,
    hint: '내려가고 있지만 각 하락의 폭이 어떻게 변하는지 살펴보세요.',
  },
  'doji': {
    // 상승 → 1차 조정 → 재상승 → 도지 → 하락
    prices: [
      48000, 50000, 52000, 54000,           // 초기 상승
      56000, 58000, 56500, 54500, 56500,    // 1차 상승·조정·재상승
      58500, 60500, 62500, 62500,           // 2차 상승 → 도지
      61000, 59000, 57000, 55000, 53500,    // 하락
    ],
    signal: 'sell',
    optimalEntry: 13,
    optimalExit: 18,
    hint: '오늘 캔들이 평소와 다른 모양이에요. 시가와 종가를 비교해 보세요.',
    overrides: { 12: { open: 62600, close: 62500, high: 64500, low: 60500 } },
  },
  'hammer': {
    // 하락 → 1차 반등 → 재하락 → 망치형 → 상승
    prices: [
      66000, 64000, 62000, 60000,           // 초기 하락
      58000, 56000, 57500, 59500, 57500,    // 1차 하락·반등·재하락
      55500, 53500, 51500, 53500,           // 2차 하락 → 망치형
      55500, 57500, 59500, 61500, 63500,    // 반등·상승
    ],
    signal: 'buy',
    optimalEntry: 13,
    optimalExit: 18,
    hint: '오늘 캔들의 아래쪽 꼬리 길이가 눈에 띄어요. 어떤 의미일까요?',
    overrides: { 12: { open: 52800, close: 53500, high: 54200, low: 49000 } },
  },
  'shooting-star': {
    // 상승 → 1차 조정 → 재상승 → 유성형 → 하락
    prices: [
      48000, 50000, 52000, 54000,           // 초기 상승
      56000, 58000, 56500, 54500, 56500,    // 1차 상승·조정·재상승
      58500, 60500, 62500, 62000,           // 2차 상승 → 유성형
      60500, 58500, 56500, 54500, 53000,    // 하락
    ],
    signal: 'sell',
    optimalEntry: 13,
    optimalExit: 18,
    hint: '오늘 캔들의 위쪽 꼬리 길이가 눈에 띄어요. 어떤 의미일까요?',
    overrides: { 12: { open: 62800, close: 62000, high: 66500, low: 61800 } },
  },
  'bullish-engulfing': {
    // 하락 → 1차 반등 → 재하락 → 장악형 → 상승
    prices: [
      66000, 64000, 62000, 60000,           // 초기 하락
      58000, 56000, 57500, 59500, 57500,    // 1차 하락·반등·재하락
      55500, 53500, 53500, 55500,           // 2차 하락 → 장악형
      57500, 59500, 61500, 63500, 65000,    // 반등·상승
    ],
    signal: 'buy',
    optimalEntry: 13,
    optimalExit: 18,
    hint: '어제와 오늘 캔들의 크기와 방향을 비교해 보세요.',
    overrides: {
      11: { open: 54300, close: 53500, high: 54500, low: 53200 },
      12: { open: 53200, close: 55500, high: 55800, low: 52800 },
    },
  },
  'bearish-engulfing': {
    // 상승 → 1차 조정 → 재상승 → 장악형 → 하락
    prices: [
      48000, 50000, 52000, 54000,           // 초기 상승
      56000, 58000, 56500, 54500, 56500,    // 1차 상승·조정·재상승
      58500, 60500, 61500, 59500,           // 2차 상승 → 장악형
      57500, 55500, 53500, 51500, 50000,    // 하락
    ],
    signal: 'sell',
    optimalEntry: 13,
    optimalExit: 18,
    hint: '어제와 오늘 캔들의 크기와 방향을 비교해 보세요.',
    overrides: {
      11: { open: 60700, close: 61500, high: 61800, low: 60500 },
      12: { open: 61800, close: 59500, high: 62200, low: 59200 },
    },
  },
  'morning-star': {
    // 하락 → 1차 반등 → 재하락 → 모닝스타 3캔들 → 상승
    prices: [
      66000, 64000, 62000, 60000,           // 초기 하락
      58000, 56000, 57500, 59500, 57500,    // 1차 하락·반등·재하락
      55500, 53000, 52000, 53500, 56000,    // 2차 하락 → 모닝스타
      58000, 60000, 62000, 64000, 65500,    // 상승
    ],
    signal: 'buy',
    optimalEntry: 14,
    optimalExit: 19,
    hint: '최근 3개 캔들의 흐름이 독특해요. 크기와 방향을 순서대로 살펴보세요.',
    overrides: {
      10: { open: 55200, close: 52500, high: 55500, low: 52000 },
      11: { open: 52200, close: 52000, high: 52800, low: 51500 },
      12: { open: 52200, close: 53500, high: 53800, low: 51800 },
      13: { open: 53800, close: 56000, high: 56500, low: 53500 },
    },
  },
};

// Pre-process: extend all scenarios to TARGET_LENGTH
const SCENARIOS: Record<string, ScenarioDef> = Object.fromEntries(
  Object.entries(RAW_SCENARIOS).map(([k, v]) => [k, ensureLength(v)]),
);

// ─── Variation for multiple rounds ───────────────────────
function addVariation(prices: number[], round: number): number[] {
  const scales = [1.0, 0.88, 1.13];
  const s = scales[round % scales.length];
  return prices.map((p, i) => {
    const noise = 1 + Math.sin(round * 31 + i * 7.3) * 0.008;
    return Math.round(p * s * noise);
  });
}

function scaleOverrides(
  ov: Record<number, Partial<Candle>> | undefined,
  s: number,
): Record<number, Partial<Candle>> | undefined {
  if (!ov) return undefined;
  return Object.fromEntries(
    Object.entries(ov).map(([k, v]) => [
      k,
      {
        open: v.open != null ? Math.round(v.open * s) : undefined,
        close: v.close != null ? Math.round(v.close * s) : undefined,
        high: v.high != null ? Math.round(v.high * s) : undefined,
        low: v.low != null ? Math.round(v.low * s) : undefined,
      },
    ]),
  );
}

export function getScenarioForRound(
  patternId: string,
  round: number,
): PatternScenario | null {
  const def = SCENARIOS[patternId];
  if (!def) return null;
  const scales = [1.0, 0.88, 1.13];
  const s = scales[round % scales.length];
  return {
    candles: toOHLC(addVariation(def.prices, round), scaleOverrides(def.overrides, s)),
    signal: def.signal,
    optimalEntryIndex: def.optimalEntry,
    optimalExitIndex: def.optimalExit,
    hint: def.hint,
  };
}

// ─── Trade Matching: FIFO 방식 매수-매도 매칭 ─────────────
interface TradeOutcome {
  profit: number;        // 실현/미실현 손익 (양수=수익, 음수=손실)
  counterPrice: number;  // 매수→평균매도가, 매도→평균매수가
  isPaired: boolean;     // 실제 반대 매매와 매칭됐는지
  violatesBLSH: boolean; // "비쌀때팔고 쌀때사라" 원칙 위반
}

interface ShareLot { price: number; shares: number; turn: number; }

function computeTradeOutcomes(
  trades: TradeLog[],
  finalPrice: number,
): Map<number, TradeOutcome> {
  const outcomes = new Map<number, TradeOutcome>();
  const queue: ShareLot[] = [];

  interface BuyAccum {
    totalShares: number;
    totalProfit: number;
    pairedShares: number;
    weightedExitPrice: number;
  }
  const buyAccum = new Map<number, BuyAccum>();

  const active = [...trades]
    .filter(t => t.action === 'buy' || t.action === 'sell')
    .sort((a, b) => a.turn - b.turn);

  for (const trade of active) {
    const n = trade.shares || 1; // fallback for old data

    if (trade.action === 'buy') {
      queue.push({ price: trade.price, shares: n, turn: trade.turn });
      buyAccum.set(trade.turn, { totalShares: n, totalProfit: 0, pairedShares: 0, weightedExitPrice: 0 });

    } else if (trade.action === 'sell') {
      let remaining = n;
      let totalSellProfit = 0;
      let totalBuyPrice = 0;
      let sharesMatched = 0;

      while (remaining > 0 && queue.length > 0) {
        const lot = queue[0];
        const matching = Math.min(remaining, lot.shares);
        const profit = (trade.price - lot.price) * matching;

        const bt = buyAccum.get(lot.turn);
        if (bt) {
          bt.totalProfit += profit;
          bt.pairedShares += matching;
          bt.weightedExitPrice += trade.price * matching;
        }
        totalSellProfit += profit;
        totalBuyPrice += lot.price * matching;
        sharesMatched += matching;
        lot.shares -= matching;
        if (lot.shares <= 0) queue.shift();
        remaining -= matching;
      }

      const avgBuy = sharesMatched > 0 ? totalBuyPrice / sharesMatched : trade.price;
      outcomes.set(trade.turn, {
        profit: totalSellProfit,
        counterPrice: avgBuy,
        isPaired: sharesMatched > 0,
        violatesBLSH: totalSellProfit < 0,
      });
    }
  }

  // 남은 미매칭 매수 → 최종가 청산
  for (const lot of queue) {
    const bt = buyAccum.get(lot.turn);
    if (bt) bt.totalProfit += (finalPrice - lot.price) * lot.shares;
  }

  // 매수 턴 결과 확정
  for (const trade of active.filter(t => t.action === 'buy')) {
    const bt = buyAccum.get(trade.turn);
    if (!bt) continue;
    const unpaired = bt.totalShares - bt.pairedShares;
    const avgExit = bt.totalShares > 0
      ? (bt.weightedExitPrice + finalPrice * unpaired) / bt.totalShares
      : finalPrice;
    outcomes.set(trade.turn, {
      profit: bt.totalProfit,
      counterPrice: avgExit,
      isPaired: bt.pairedShares > 0,
      violatesBLSH: bt.totalProfit < 0,
    });
  }

  return outcomes;
}

function fmtWon(n: number): string {
  return (n >= 0 ? '+' : '') + Math.round(n).toLocaleString('ko-KR') + '원';
}

// ─── Per-Turn Scoring: 실제 수익 기반 ────────────────────
function evaluateTurns(
  trades: TradeLog[],
  candles: Candle[],
  scenario: PatternScenario,
  finalPrice: number,
  startingShares = 0,
): TurnEval[] {
  const outcomes = computeTradeOutcomes(trades, finalPrice);
  const isBuySignal = scenario.signal === 'buy';
  const evals: TurnEval[] = [];
  let runningShares = startingShares;  // 현재 보유 주수 (초기 주식 포함)

  for (let t = 0; t < TURNS_PER_ROUND; t++) {
    const trade = trades.find(x => x.turn === t);
    const action = (trade?.action ?? 'skip') as TurnEval['action'];
    const sharesBefore = runningShares;
    const candleIdx = Math.min(INITIAL_REVEAL + (t + 1) * CANDLES_PER_TURN - 1, candles.length - 1);
    const currentPrice = candles[candleIdx].close;
    const zone = getZone(candleIdx, scenario.optimalEntryIndex, scenario.optimalExitIndex);
    const hasPosition = sharesBefore > 0;

    let ev: TurnEval;

    // ── TIMEOUT ──
    if (action === 'timeout') {
      ev = { turn: t, action, price: currentPrice, turnPnl: 0, score: 0, verdict: '⏰ 시간초과 — 기회 낭비', correct: false };

    // ── BUY ──
    } else if (action === 'buy') {
      const outcome = outcomes.get(t);
      const profit = outcome?.profit ?? 0;
      const exitPrice = outcome?.counterPrice ?? finalPrice;
      const blsh = outcome?.violatesBLSH ?? false;
      const n = trade?.shares ?? 1;
      const profitPerShare = n > 0 ? profit / n : 0;

      if (isBuySignal) {
        if (profit > 0) {
          const pct = profitPerShare / currentPrice;
          const score = pct >= 0.03 ? 2.5 : pct >= 0.01 ? 2.0 : 1.5;
          ev = { turn: t, action, price: currentPrice, turnPnl: profit, score,
            verdict: `✅ 싸게 매수 ${n}주 → 수익 ${fmtWon(profit)} (평균매도 ${Math.round(exitPrice).toLocaleString('ko-KR')}원)`,
            correct: true };
        } else if (blsh) {
          ev = { turn: t, action, price: currentPrice, turnPnl: profit, score: 0,
            verdict: `❌ 비쌀 때 매수 ${n}주! 손실 ${fmtWon(profit)} — "쌀 때 사라" 원칙 위반`,
            correct: false };
        } else {
          ev = { turn: t, action, price: currentPrice, turnPnl: profit, score: 0,
            verdict: `❌ 매수 ${n}주 손실 ${fmtWon(profit)}`,
            correct: false };
        }
      } else {
        if (profit > 0) {
          ev = { turn: t, action, price: currentPrice, turnPnl: profit, score: 0.5,
            verdict: `⚠️ 패턴 반대 방향이지만 수익 ${fmtWon(profit)} (운이 좋았어요)`,
            correct: false };
        } else {
          ev = { turn: t, action, price: currentPrice, turnPnl: profit, score: 0,
            verdict: `❌ 패턴 반대 방향 매수 ${n}주 손실 ${fmtWon(profit)}`,
            correct: false };
        }
      }

    // ── SELL ──
    } else if (action === 'sell') {
      const outcome = outcomes.get(t);
      const profit = outcome?.profit ?? 0;
      const avgBuyPrice = outcome?.counterPrice ?? currentPrice;
      const blsh = outcome?.violatesBLSH ?? false;
      const n = trade?.shares ?? 1;
      const profitPerShare = n > 0 ? profit / n : 0;

      if (!isBuySignal) {
        // 하락 패턴 — 매도가 정방향
        if (profit > 0) {
          const pct = profitPerShare / currentPrice;
          const score = pct >= 0.03 ? 2.5 : pct >= 0.01 ? 2.0 : 1.5;
          ev = { turn: t, action, price: currentPrice, turnPnl: profit, score,
            verdict: `✅ 고점 매도 ${n}주 → 수익 ${fmtWon(profit)} (평균매수 ${Math.round(avgBuyPrice).toLocaleString('ko-KR')}원)`,
            correct: true };
        } else if (blsh) {
          ev = { turn: t, action, price: currentPrice, turnPnl: profit, score: 0,
            verdict: `❌ 쌀 때 매도 ${n}주! 손실 ${fmtWon(profit)} — "비쌀 때 팔아라" 원칙 위반`,
            correct: false };
        } else {
          ev = { turn: t, action, price: currentPrice, turnPnl: profit, score: 0,
            verdict: `❌ 매도 ${n}주 손실 ${fmtWon(profit)}`,
            correct: false };
        }
      } else {
        // 상승 패턴 — 매도는 보유 청산
        if (hasPosition) {
          if (profit > 0) {
            const pct = profitPerShare / avgBuyPrice;
            const score = pct >= 0.03 ? 2.5 : pct >= 0.01 ? 2.0 : 1.5;
            ev = { turn: t, action, price: currentPrice, turnPnl: profit, score,
              verdict: `✅ 이익 실현 ${n}주 ${fmtWon(profit)} (매수 ${Math.round(avgBuyPrice).toLocaleString('ko-KR')}원 → 매도 ${currentPrice.toLocaleString('ko-KR')}원)`,
              correct: true };
          } else if (blsh) {
            ev = { turn: t, action, price: currentPrice, turnPnl: profit, score: 0,
              verdict: `❌ 쌀 때 청산 ${n}주! 손실 ${fmtWon(profit)} — "비쌀 때 팔아라" 원칙 위반`,
              correct: false };
          } else {
            ev = { turn: t, action, price: currentPrice, turnPnl: profit, score: 0,
              verdict: `❌ 청산 ${n}주 손실 ${fmtWon(profit)}`,
              correct: false };
          }
        } else {
          ev = { turn: t, action, price: currentPrice, turnPnl: 0, score: 0,
            verdict: `❌ 보유 없이 매도 시도`,
            correct: false };
        }
      }

    // ── SKIP ──
    } else {
      if (zone === 'early')
        ev = { turn: t, action, price: currentPrice, turnPnl: 0, score: 1.5, verdict: '👀 패턴 형성 전 — 올바른 관망', correct: true };
      else if (zone === 'forming')
        ev = { turn: t, action, price: currentPrice, turnPnl: 0, score: 1.0, verdict: '👀 패턴 확인 대기 중', correct: true };
      else if (zone === 'entry')
        ev = { turn: t, action, price: currentPrice, turnPnl: 0, score: 0, verdict: '😱 핵심 진입 타이밍을 놓쳤어요!', correct: false };
      else if (zone === 'hold') {
        if (hasPosition)
          ev = { turn: t, action, price: currentPrice, turnPnl: 0, score: 1.5, verdict: '✅ 수익 구간 포지션 홀딩', correct: true };
        else
          ev = { turn: t, action, price: currentPrice, turnPnl: 0, score: 0.5, verdict: '⚠️ 수익 구간인데 포지션 없음', correct: false };
      } else if (zone === 'exit') {
        if (hasPosition)
          ev = { turn: t, action, price: currentPrice, turnPnl: 0, score: 0, verdict: '💸 이익 실현 타이밍을 놓쳤어요!', correct: false };
        else
          ev = { turn: t, action, price: currentPrice, turnPnl: 0, score: 0.5, verdict: '관망 유지', correct: false };
      } else {
        if (hasPosition)
          ev = { turn: t, action, price: currentPrice, turnPnl: 0, score: 1.0, verdict: '✅ 포지션 유지 중', correct: true };
        else
          ev = { turn: t, action, price: currentPrice, turnPnl: 0, score: 0.5, verdict: '관망', correct: false };
      }
    }

    evals.push(ev);
    const n = trade?.shares ?? 0;
    if (action === 'buy') runningShares += n;
    else if (action === 'sell') runningShares = Math.max(0, runningShares - n);
  }

  return evals;
}

export function calculateRoundScore(
  trades: TradeLog[],
  finalCash: number,
  finalShares: number,
  finalPrice: number,
  scenario: PatternScenario,
  startingShares = 0,
): RoundScore {
  const turnEvals = evaluateTurns(trades, scenario.candles, scenario, finalPrice, startingShares);
  const rawTotal = turnEvals.reduce((sum, e) => sum + e.score, 0);
  const total = Math.round(rawTotal);

  // 사용자 손익: 최종 포트폴리오 가치 - 초기 자금
  const userPnl = (finalCash + finalShares * finalPrice) - INITIAL_CASH;

  // 최적 전략 손익: 초기 자금으로 최적 구간에 전부 투자
  const optE = scenario.candles[scenario.optimalEntryIndex]?.close ?? 0;
  const optX = scenario.candles[scenario.optimalExitIndex]?.close ?? 0;
  const optimalShares = optE > 0 ? Math.floor(INITIAL_CASH * 0.8 / Math.min(optE, optX)) : 10;
  const optimalPnl = scenario.signal === 'buy'
    ? (optX - optE) * optimalShares
    : (optE - optX) * optimalShares;

  const g = getGrade(total);
  return { total, ...g, userPnl, optimalPnl, turnEvals };
}

function getGrade(score: number): { grade: Grade; emoji: string; message: string } {
  for (const g of GRADE_MAP) {
    if (score >= g.min) return { grade: g.grade, emoji: g.emoji, message: g.message };
  }
  return { grade: 'F', emoji: '💤', message: '매매를 못했어요' };
}

export function getFinalResult(totalScore: number) {
  const maxScore = TOTAL_ROUNDS * 20;
  const pct = (totalScore / maxScore) * 100;
  if (pct >= 95)
    return { stars: 3, emoji: '🏆', title: '전설적인 트레이더!', sub: '상위 1% — 패턴 마스터입니다!' };
  if (pct >= 80)
    return { stars: 3, emoji: '🎉', title: '상위 5% 실력!', sub: '실전에서도 통할 수 있어요!' };
  if (pct >= 60)
    return { stars: 2, emoji: '👏', title: '평균 이상', sub: '타이밍 개선이 필요합니다!' };
  if (pct >= 40)
    return { stars: 1, emoji: '💪', title: '아직 부족해요', sub: '패턴 복습 후 다시 도전!' };
  if (pct >= 20)
    return { stars: 0, emoji: '📚', title: '기초부터 다시', sub: '패턴 설명을 정독하세요!' };
  return { stars: 0, emoji: '😰', title: '전략이 없어요', sub: '학습 후 다시 도전하세요!' };
}

// ─── Smart Turn Feedback ─────────────────────────────────
export interface TurnFeedback {
  isGood: boolean;
  emoji: string;
  title: string;
  reason: string;
  effect: 'sparkle' | 'shake' | 'neutral';
}

function getZone(
  idx: number,
  optEntry: number,
  optExit: number,
): 'early' | 'forming' | 'entry' | 'hold' | 'exit' | 'late' {
  if (idx < optEntry - 3) return 'early';
  if (idx < optEntry) return 'forming';
  if (idx <= optEntry + 2) return 'entry';
  if (idx < optExit - 1) return 'hold';
  if (idx <= optExit + 1) return 'exit';
  return 'late';
}

export function getTurnFeedback(params: {
  action: 'buy' | 'sell' | 'skip';
  candleIndex: number;
  scenario: PatternScenario;
  sharesHeld: number;
  isTimeout: boolean;
}): TurnFeedback {
  const { action, candleIndex, scenario, sharesHeld, isTimeout } = params;
  const zone = getZone(candleIndex, scenario.optimalEntryIndex, scenario.optimalExitIndex);
  const isBuySignal = scenario.signal === 'buy';
  const entryAction = isBuySignal ? 'buy' : 'sell';
  const exitAction = isBuySignal ? 'sell' : 'buy';
  const hasPosition = sharesHeld > 0;

  if (isTimeout) {
    return zone === 'entry'
      ? { isGood: false, emoji: '⏰', title: '시간 초과!', reason: '지금이 최적의 진입 타이밍이었어요!', effect: 'shake' }
      : { isGood: false, emoji: '⏰', title: '시간 초과', reason: '다음 턴에는 빠르게 결정하세요!', effect: 'neutral' };
  }

  if (action === entryAction) {
    if (zone === 'early')
      return { isGood: false, emoji: '🤔', title: '너무 빨라요!', reason: '패턴이 아직 형성 중이에요. 더 기다려보세요!', effect: 'shake' };
    if (zone === 'forming')
      return { isGood: false, emoji: '😬', title: '조금 일러요', reason: '패턴이 거의 완성돼요. 확인 후 진입하면 더 안전해요!', effect: 'shake' };
    if (zone === 'entry')
      return { isGood: true, emoji: '🎯', title: '완벽한 타이밍!', reason: '패턴이 확인되는 최적의 진입 포인트입니다!', effect: 'sparkle' };
    if (zone === 'hold')
      return { isGood: true, emoji: '👍', title: '늦었지만 좋아요', reason: '조금 늦었지만 아직 수익 구간이에요!', effect: 'sparkle' };
    if (zone === 'exit' || zone === 'late')
      return { isGood: false, emoji: '😅', title: '너무 늦었어요', reason: '이미 최적 구간을 지났어요. 다음 기회를 노리세요!', effect: 'shake' };
  }

  if (action === exitAction) {
    if (hasPosition) {
      // exitAction = 상승패턴에서 '팔래', 하락패턴에서 '살래' (숏 커버링)
      const exitLabel = isBuySignal ? '익절' : '숏 커버링';
      if (zone === 'exit')
        return { isGood: true, emoji: '💰', title: `완벽한 ${exitLabel}!`, reason: '최적의 이익 실현 타이밍이에요!', effect: 'sparkle' };
      if (zone === 'hold')
        return { isGood: true, emoji: '💵', title: '수익 확정!', reason: '이익을 확정했어요. 조금 더 기다리면 더 좋았을 수도!', effect: 'sparkle' };
      if (zone === 'late')
        return { isGood: true, emoji: '🤏', title: `늦은 ${exitLabel}`, reason: '최적보다 늦었지만 포지션을 정리한 건 잘했어요!', effect: 'neutral' };
      return { isGood: false, emoji: '😱', title: '너무 빨리!', reason: '아직 수익 구간이 남았어요. 좀 더 기다려보세요!', effect: 'shake' };
    }
    // 포지션 없이 청산 버튼 → 방향 반대
    return { isGood: false, emoji: '⚠️', title: '방향이 반대!', reason: isBuySignal
      ? '이 패턴은 상승 신호예요! 팔래가 아닌 살래를 노리세요!'
      : '이 패턴은 하락 신호예요! 살래가 아닌 팔래를 노리세요!', effect: 'shake' };
  }

  // Skip
  if (zone === 'entry')
    return { isGood: false, emoji: '😱', title: '놓쳤어요!', reason: '지금이 최적의 진입 타이밍이었어요!', effect: 'shake' };
  if (zone === 'early')
    return { isGood: true, emoji: '🧐', title: '좋은 관망!', reason: '아직은 지켜보는 게 맞아요. 패턴을 기다리세요!', effect: 'neutral' };
  if (zone === 'forming')
    return { isGood: true, emoji: '👀', title: '관망 중', reason: '패턴이 만들어지고 있어요. 곧 진입 기회가 와요!', effect: 'neutral' };
  if (hasPosition && (zone === 'exit'))
    return { isGood: false, emoji: '💸', title: '청산 놓쳤어요!', reason: '지금이 이익 실현 타이밍이었는데...!', effect: 'shake' };
  return { isGood: false, emoji: '🤷', title: '관망', reason: '기회를 찾아보세요!', effect: 'neutral' };
}

// ─── Basic Strategy Types ─────────────────────────────────
export const BASIC_TURNS_PER_ROUND = 10;
export const BASIC_CANDLES_PER_TURN = 2;
export const BASIC_INITIAL_REVEAL = 4;
export const BASIC_DECISION_TIMERS = [20, 18, 16, 15];

export interface BasicTurnDescription {
  turn: number;
  priceIndex: number;
  event: string;
  wave: string;
  hint: string;
}

export interface BasicScenarioDef {
  id: string;
  title: string;
  stock: string;
  theme: string;
  signal: 'buy' | 'sell';
  optimalEntry: number;
  optimalExit: number;
  hint: string;
  waveDescription: string;
  strategyTip: string;
  prices: number[];
  turnDescriptions: BasicTurnDescription[];
}

export interface BasicStrategy {
  id: string;
  name: string;
  nameEn: string;
  emoji: string;
  category: string;
  description: string;
  keyLesson: string;
  wavePattern: string;
  scenarios: BasicScenarioDef[];
}

// ─── Basic Strategy Data Accessors ───────────────────────
export const BASIC_STRATEGIES: BasicStrategy[] =
  BASIC_STRATEGY_DATA.strategies as BasicStrategy[];

export function getBasicStrategy(strategyId: string): BasicStrategy | null {
  return BASIC_STRATEGIES.find(s => s.id === strategyId) ?? null;
}

export function getBasicScenario(
  strategyId: string,
  scenarioIndex: number,
  round = 0,
): PatternScenario | null {
  const strategy = getBasicStrategy(strategyId);
  if (!strategy) return null;
  const def = strategy.scenarios[scenarioIndex];
  if (!def) return null;

  const scales = [1.0, 0.92, 1.08, 0.96];
  const s = scales[round % scales.length];
  const scaledPrices = def.prices.map((p, i) => {
    const noise = 1 + Math.sin(round * 29 + i * 6.1) * 0.006;
    return Math.round(p * s * noise);
  });

  return {
    candles: toOHLC(scaledPrices),
    signal: def.signal,
    optimalEntryIndex: def.optimalEntry,
    optimalExitIndex: def.optimalExit,
    hint: def.hint,
  };
}

export function getBasicScenarioForRound(
  strategyId: string,
  round: number,
): PatternScenario | null {
  const strategy = getBasicStrategy(strategyId);
  if (!strategy) return null;
  const scenarioIndex = round % strategy.scenarios.length;
  return getBasicScenario(strategyId, scenarioIndex, round);
}

export function calculateBasicRoundScore(
  trades: TradeLog[],
  finalCash: number,
  finalShares: number,
  finalPrice: number,
  scenario: PatternScenario,
  startingShares = 0,
): RoundScore {
  const turnEvals = evaluateTurns(trades, scenario.candles, scenario, finalPrice, startingShares);
  const rawTotal = turnEvals.reduce((sum, e) => sum + e.score, 0);
  const total = Math.round(rawTotal);

  const userPnl = (finalCash + finalShares * finalPrice) - INITIAL_CASH;

  const optE = scenario.candles[scenario.optimalEntryIndex]?.close ?? 0;
  const optX = scenario.candles[scenario.optimalExitIndex]?.close ?? 0;
  const optimalShares = optE > 0 ? Math.floor(INITIAL_CASH * 0.8 / Math.min(optE, optX)) : 10;
  const optimalPnl = scenario.signal === 'buy'
    ? (optX - optE) * optimalShares
    : (optE - optX) * optimalShares;

  const g = getGrade(total);
  return { total, ...g, userPnl, optimalPnl, turnEvals };
}
