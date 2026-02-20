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

export interface RoundScore {
  total: number;
  grade: Grade;
  emoji: string;
  message: string;
  userPnl: number;
  optimalPnl: number;
}

export interface TradeLog {
  action: 'buy' | 'sell' | 'skip' | 'timeout';
  price: number;
  turn: number;
}

// ─── Constants ───────────────────────────────────────────
export const TOTAL_ROUNDS = 5;
export const TURNS_PER_ROUND = 5;
export const CANDLES_PER_TURN = 4;
export const INITIAL_REVEAL = 3;
export const MAX_POSITION = 3;
export const DECISION_TIMERS = [10, 9, 8, 7, 6];
const TARGET_LENGTH = INITIAL_REVEAL + TURNS_PER_ROUND * CANDLES_PER_TURN + 2; // 25

const GRADE_MAP: { min: number; grade: Grade; emoji: string; message: string }[] = [
  { min: 17, grade: 'S', emoji: '🔥', message: '완벽한 매매!' },
  { min: 13, grade: 'A', emoji: '💪', message: '뛰어난 판단!' },
  { min: 9, grade: 'B', emoji: '👍', message: '좋은 감각!' },
  { min: 5, grade: 'C', emoji: '🤔', message: '아쉬운 결과' },
  { min: 1, grade: 'D', emoji: '😅', message: '더 연습해봐요' },
  { min: 0, grade: 'F', emoji: '💤', message: '매매 기회를 놓쳤어요' },
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
  const scales = [1.0, 0.88, 1.13, 0.94, 1.07];
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
  const scales = [1.0, 0.88, 1.13, 0.94, 1.07];
  const s = scales[round % scales.length];
  return {
    candles: toOHLC(addVariation(def.prices, round), scaleOverrides(def.overrides, s)),
    signal: def.signal,
    optimalEntryIndex: def.optimalEntry,
    optimalExitIndex: def.optimalExit,
    hint: def.hint,
  };
}

// ─── Position / P&L calculation ──────────────────────────
export function calcPnl(
  trades: TradeLog[],
  netPos: number,
  currentPrice: number,
): number {
  let buys = 0;
  let sells = 0;
  for (const t of trades) {
    if (t.action === 'buy') buys += t.price;
    if (t.action === 'sell') sells += t.price;
  }
  return sells - buys + netPos * currentPrice;
}

export function calcPnlPercent(
  trades: TradeLog[],
  netPos: number,
  currentPrice: number,
): number {
  let buys = 0;
  let totalInvested = 0;
  for (const t of trades) {
    if (t.action === 'buy') { buys += t.price; totalInvested += t.price; }
    if (t.action === 'sell') { totalInvested += t.price; }
  }
  if (totalInvested === 0) return 0;
  const pnl = calcPnl(trades, netPos, currentPrice);
  return (pnl / (totalInvested / 2)) * 100;
}

// ─── Scoring ─────────────────────────────────────────────
export function calculateRoundScore(
  trades: TradeLog[],
  netPosition: number,
  finalPrice: number,
  scenario: PatternScenario,
): RoundScore {
  const closeAll = [...trades];
  let closedPos = netPosition;
  if (closedPos > 0) {
    for (let i = 0; i < closedPos; i++)
      closeAll.push({ action: 'sell', price: finalPrice, turn: -1 });
    closedPos = 0;
  } else if (closedPos < 0) {
    for (let i = 0; i < Math.abs(closedPos); i++)
      closeAll.push({ action: 'buy', price: finalPrice, turn: -1 });
    closedPos = 0;
  }

  const userPnl = calcPnl(closeAll, 0, finalPrice);

  const optE = scenario.candles[scenario.optimalEntryIndex]?.close ?? 0;
  const optX = scenario.candles[scenario.optimalExitIndex]?.close ?? 0;
  const optimalPnl =
    scenario.signal === 'buy'
      ? MAX_POSITION * (optX - optE)
      : MAX_POSITION * (optE - optX);

  let total = 0;
  if (optimalPnl > 0 && userPnl > 0) {
    const ratio = userPnl / optimalPnl;
    if (ratio >= 0.8) total = 20;
    else if (ratio >= 0.6) total = 16;
    else if (ratio >= 0.4) total = 12;
    else if (ratio >= 0.2) total = 8;
    else total = 4;
  } else if (userPnl > 0) {
    total = 4;
  }

  const g = getGrade(total);
  return {
    total,
    ...g,
    userPnl,
    optimalPnl,
  };
}

function getGrade(score: number): { grade: Grade; emoji: string; message: string } {
  for (const g of GRADE_MAP) {
    if (score >= g.min) return { grade: g.grade, emoji: g.emoji, message: g.message };
  }
  return { grade: 'F', emoji: '💤', message: '매매 기회를 놓쳤어요' };
}

export function getFinalResult(totalScore: number) {
  const maxScore = TOTAL_ROUNDS * 20;
  const pct = (totalScore / maxScore) * 100;
  if (pct >= 90)
    return { stars: 3, emoji: '🏆', title: '전설적인 트레이더!', sub: '패턴 마스터입니다!' };
  if (pct >= 70)
    return { stars: 3, emoji: '🎉', title: '뛰어난 실력!', sub: '실전에서도 통할 거예요!' };
  if (pct >= 50)
    return { stars: 2, emoji: '👏', title: '좋은 감각!', sub: '조금만 더 연습하면 완벽!' };
  if (pct >= 30)
    return { stars: 1, emoji: '💪', title: '성장하고 있어요!', sub: '패턴 복습 후 다시 도전!' };
  return { stars: 0, emoji: '📚', title: '복습이 필요해요', sub: '패턴 설명을 다시 읽어보세요!' };
}
