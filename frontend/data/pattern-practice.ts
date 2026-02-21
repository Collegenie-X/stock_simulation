import { CHART_PATTERNS } from './chart-patterns';

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
export const TURNS_PER_ROUND = 8;
export const CANDLES_PER_TURN = 2;
export const INITIAL_REVEAL = 4;
export const INITIAL_CASH = 1_000_000;   // 시작 자금 100만원 (현금 50% + 주식 50%)
export const DECISION_TIMERS = [12, 10, 9];
const TARGET_LENGTH = INITIAL_REVEAL + TURNS_PER_ROUND * CANDLES_PER_TURN + 2; // 22

const GRADE_MAP: { min: number; grade: Grade; emoji: string; message: string }[] = [
  { min: 18, grade: 'S', emoji: '🔥', message: '전설적인 매매!' },
  { min: 15, grade: 'A', emoji: '💪', message: '상위 5% 수준!' },
  { min: 11, grade: 'B', emoji: '👍', message: '평균 이상' },
  { min: 7, grade: 'C', emoji: '🤔', message: '아쉬운 판단' },
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
const RAW_SCENARIOS: Record<string, ScenarioDef> = {
  'head-shoulders': {
    prices: [
      50000, 51500, 53200, 55000, 57200, 59500,
      57800, 55800, 54000,
      56200, 58800, 61500, 63200,
      61000, 58200, 54200,
      56000, 58200, 60000,
      57800, 55200, 53000,
      51000, 49200, 47500, 46000,
    ],
    signal: 'sell',
    optimalEntry: 19,
    optimalExit: 25,
    hint: '세 개의 봉우리(왼쪽 어깨→머리→오른쪽 어깨)를 관찰하세요. 넥라인 이탈 시 매도!',
  },
  'inv-head-shoulders': {
    prices: [
      60000, 58500, 56800, 55000, 52800, 50500,
      52200, 54200, 56000,
      53800, 51200, 48500, 46800,
      49000, 51800, 55800,
      54000, 51800, 50000,
      52200, 54800, 57000,
      59000, 60800, 62500, 64000,
    ],
    signal: 'buy',
    optimalEntry: 19,
    optimalExit: 25,
    hint: '세 개의 골짜기를 찾으세요. 넥라인 돌파 시 매수!',
  },
  'double-top': {
    prices: [
      50000, 52000, 54000, 56500, 59000, 61500,
      59500, 57000, 55000,
      57000, 59000, 61500,
      59500, 57000, 54500,
      52500, 50500, 48500, 47000,
    ],
    signal: 'sell',
    optimalEntry: 13,
    optimalExit: 18,
    hint: '같은 높이의 두 고점(M자)을 확인하세요. 넥라인 이탈 시 매도!',
  },
  'double-bottom': {
    prices: [
      60000, 58000, 56000, 53500, 51000, 48500,
      50500, 53000, 55000,
      53000, 51000, 48500,
      50500, 53000, 55500,
      57500, 59500, 61500, 63000,
    ],
    signal: 'buy',
    optimalEntry: 13,
    optimalExit: 18,
    hint: '같은 깊이의 두 저점(W자)을 확인하세요. 넥라인 돌파 시 매수!',
  },
  'triple-top': {
    prices: [
      48000, 50000, 52500, 55000, 58000, 61000,
      59000, 56500, 54500,
      57000, 59500, 61000,
      59000, 56500, 54500,
      57000, 59500, 61000,
      58500, 56000, 53500,
      51000, 49000, 47000, 45500,
    ],
    signal: 'sell',
    optimalEntry: 19,
    optimalExit: 24,
    hint: '같은 높이의 세 고점을 확인하세요. 세 번 막힌 저항선 이탈 시 매도!',
  },
  'ascending-triangle': {
    prices: [
      50000, 52000, 54000, 56000, 58000,
      55500, 58000, 56000, 58000, 56500,
      58000, 57000, 58000, 57500, 58000,
      59500, 61500, 63500, 65500, 67000,
    ],
    signal: 'buy',
    optimalEntry: 15,
    optimalExit: 19,
    hint: '저점이 점점 높아지면서 같은 저항선에서 막히는 삼각형. 돌파 시 매수!',
  },
  'descending-triangle': {
    prices: [
      65000, 63000, 61000, 59000, 57000,
      59500, 57000, 59000, 57000, 58500,
      57000, 58000, 57000, 57500, 57000,
      55500, 53500, 51500, 49500, 48000,
    ],
    signal: 'sell',
    optimalEntry: 15,
    optimalExit: 19,
    hint: '고점이 점점 낮아지면서 같은 지지선에서 받쳐지는 삼각형. 이탈 시 매도!',
  },
  'symmetrical-triangle': {
    prices: [
      50000, 54000, 47000, 53000, 48000, 52000,
      49000, 51500, 49500, 51000, 50000, 50500,
      52000, 54500, 57000, 59500, 62000, 64000,
    ],
    signal: 'buy',
    optimalEntry: 12,
    optimalExit: 17,
    hint: '고점은 낮아지고 저점은 높아지며 수렴하는 삼각형. 이탈 방향 확인!',
  },
  'rising-wedge': {
    prices: [
      50000, 52000, 51000, 54000, 53000, 56000,
      55000, 57500, 56800, 58500, 58000, 59500,
      59200, 60000, 59500,
      57000, 54500, 52000, 49500, 47500,
    ],
    signal: 'sell',
    optimalEntry: 14,
    optimalExit: 19,
    hint: '상승하지만 상승폭이 줄어드는 쐐기형. 하단 이탈 시 매도!',
  },
  'falling-wedge': {
    prices: [
      65000, 63000, 64000, 61000, 62000, 59000,
      60000, 57500, 58200, 56500, 57000, 55500,
      55800, 55000, 55500,
      58000, 60500, 63000, 65500, 67500,
    ],
    signal: 'buy',
    optimalEntry: 14,
    optimalExit: 19,
    hint: '하락하지만 하락폭이 줄어드는 쐐기형. 상단 돌파 시 매수!',
  },
  'doji': {
    prices: [
      50000, 51500, 53000, 54800, 56500, 58000,
      59500, 61000, 62500, 62500,
      61000, 59000, 57000, 55000, 53500,
    ],
    signal: 'sell',
    optimalEntry: 10,
    optimalExit: 14,
    hint: '상승 추세 끝 십자가 캔들(도지)을 찾으세요. 확인 후 매도!',
    overrides: { 9: { open: 62600, close: 62500, high: 64500, low: 60500 } },
  },
  'hammer': {
    prices: [
      65000, 63500, 62000, 60200, 58500, 57000,
      55500, 54000, 52500, 53500,
      55000, 57000, 59000, 61000, 63000,
    ],
    signal: 'buy',
    optimalEntry: 10,
    optimalExit: 14,
    hint: '하락 바닥 긴 아래꼬리 캔들(망치형)을 찾으세요. 확인 후 매수!',
    overrides: { 9: { open: 52800, close: 53500, high: 54000, low: 49000 } },
  },
  'shooting-star': {
    prices: [
      50000, 51500, 53000, 54800, 56500, 58000,
      59500, 61000, 62500, 62000,
      60500, 58500, 56500, 54500, 53000,
    ],
    signal: 'sell',
    optimalEntry: 10,
    optimalExit: 14,
    hint: '상승 고점 긴 윗꼬리 캔들(유성형)을 찾으세요. 확인 후 매도!',
    overrides: { 9: { open: 62800, close: 62000, high: 66000, low: 61800 } },
  },
  'bullish-engulfing': {
    prices: [
      65000, 63500, 62000, 60200, 58500, 57000,
      55500, 54200, 53500, 55500,
      57500, 59500, 61500, 63500, 65000,
    ],
    signal: 'buy',
    optimalEntry: 10,
    optimalExit: 14,
    hint: '하락 중 작은 음봉→큰 양봉 장악형을 찾으세요. 확인 후 매수!',
    overrides: {
      8: { open: 54300, close: 53500, high: 54500, low: 53200 },
      9: { open: 53200, close: 55500, high: 55800, low: 52800 },
    },
  },
  'bearish-engulfing': {
    prices: [
      50000, 51500, 53000, 54800, 56500, 58000,
      59500, 60800, 61500, 59500,
      57500, 55500, 53500, 51500, 50000,
    ],
    signal: 'sell',
    optimalEntry: 10,
    optimalExit: 14,
    hint: '상승 중 작은 양봉→큰 음봉 장악형을 찾으세요. 확인 후 매도!',
    overrides: {
      8: { open: 60700, close: 61500, high: 61800, low: 60500 },
      9: { open: 61800, close: 59500, high: 62200, low: 59200 },
    },
  },
  'morning-star': {
    prices: [
      65000, 63200, 61500, 59500, 58000, 56500,
      55000, 52500, 52000, 53500, 56000,
      58000, 60000, 62000, 64000, 65500,
    ],
    signal: 'buy',
    optimalEntry: 11,
    optimalExit: 15,
    hint: '하락 후 큰 음봉→작은 캔들→큰 양봉 조합(모닝스타)을 찾으세요!',
    overrides: {
      7: { open: 55200, close: 52500, high: 55500, low: 52000 },
      8: { open: 52200, close: 52000, high: 52800, low: 51500 },
      9: { open: 52200, close: 53500, high: 53800, low: 51800 },
      10: { open: 53800, close: 56000, high: 56500, low: 53500 },
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
      if (zone === 'exit')
        return { isGood: true, emoji: '💰', title: '완벽한 청산!', reason: '최적의 이익 실현 타이밍이에요!', effect: 'sparkle' };
      if (zone === 'hold')
        return { isGood: true, emoji: '💵', title: '수익 확정!', reason: '이익을 확정했어요. 조금 더 기다리면 더 좋았을 수도!', effect: 'sparkle' };
      if (zone === 'late')
        return { isGood: true, emoji: '🤏', title: '늦은 청산', reason: '최적보다 늦었지만 포지션을 정리한 건 잘했어요!', effect: 'neutral' };
      return { isGood: false, emoji: '😱', title: '너무 빨리 청산!', reason: '아직 수익 구간이 남았어요. 좀 더 기다려보세요!', effect: 'shake' };
    }
    return { isGood: false, emoji: '⚠️', title: '방향이 반대!', reason: isBuySignal
      ? '이 패턴은 상승 신호예요! 매도가 아닌 매수를 노리세요!'
      : '이 패턴은 하락 신호예요! 매수가 아닌 매도를 노리세요!', effect: 'shake' };
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
