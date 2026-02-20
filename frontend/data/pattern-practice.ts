import { type ChartPattern, CHART_PATTERNS } from './chart-patterns';

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
  initialReveal: number;
  hint: string;
}

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

interface ScenarioDef {
  prices: number[];
  signal: 'buy' | 'sell';
  optimalEntry: number;
  optimalExit: number;
  reveal: number;
  hint: string;
  overrides?: Record<number, Partial<Candle>>;
}

const SCENARIOS: Record<string, ScenarioDef> = {
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
    reveal: 5,
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
    reveal: 5,
    hint: '세 개의 골짜기(왼쪽 어깨→머리→오른쪽 어깨)를 찾으세요. 넥라인 돌파 시 매수!',
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
    reveal: 5,
    hint: '같은 높이의 두 고점(M자 형태)을 확인하세요. 넥라인 이탈 시 매도!',
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
    reveal: 5,
    hint: '같은 깊이의 두 저점(W자 형태)을 확인하세요. 넥라인 돌파 시 매수!',
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
    reveal: 5,
    hint: '같은 높이의 세 고점을 확인하세요. 세 번 막힌 저항선을 이탈하면 강한 매도 신호!',
  },
  'ascending-triangle': {
    prices: [
      50000, 52000, 54000, 56000, 58000,
      55500, 58000,
      56000, 58000,
      56500, 58000,
      57000, 58000,
      57500, 58000,
      59500, 61500, 63500, 65500, 67000,
    ],
    signal: 'buy',
    optimalEntry: 15,
    optimalExit: 19,
    reveal: 4,
    hint: '저점이 점점 높아지면서 같은 저항선에서 막히는 모양을 관찰하세요. 저항선 돌파 시 매수!',
  },
  'descending-triangle': {
    prices: [
      65000, 63000, 61000, 59000, 57000,
      59500, 57000,
      59000, 57000,
      58500, 57000,
      58000, 57000,
      57500, 57000,
      55500, 53500, 51500, 49500, 48000,
    ],
    signal: 'sell',
    optimalEntry: 15,
    optimalExit: 19,
    reveal: 4,
    hint: '고점이 점점 낮아지면서 같은 지지선에서 받쳐지는 모양을 관찰하세요. 지지선 이탈 시 매도!',
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
    reveal: 4,
    hint: '고점은 낮아지고 저점은 높아지며 수렴하는 삼각형을 관찰하세요. 이탈 방향을 확인 후 진입!',
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
    reveal: 4,
    hint: '상승하지만 상승폭이 줄어드는 쐐기형을 관찰하세요. 하단 이탈 시 매도!',
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
    reveal: 4,
    hint: '하락하지만 하락폭이 줄어드는 쐐기형을 관찰하세요. 상단 돌파 시 매수!',
  },
  'doji': {
    prices: [
      50000, 51500, 53000, 54800, 56500, 58000,
      59500, 61000, 62500,
      62500,
      61000, 59000, 57000, 55000, 53500,
    ],
    signal: 'sell',
    optimalEntry: 10,
    optimalExit: 14,
    reveal: 5,
    hint: '상승 추세 끝에서 시가≈종가인 십자가 캔들(도지)을 찾으세요. 다음 캔들 확인 후 매도!',
    overrides: {
      9: { open: 62600, close: 62500, high: 64500, low: 60500 },
    },
  },
  'hammer': {
    prices: [
      65000, 63500, 62000, 60200, 58500, 57000,
      55500, 54000, 52500,
      53500,
      55000, 57000, 59000, 61000, 63000,
    ],
    signal: 'buy',
    optimalEntry: 10,
    optimalExit: 14,
    reveal: 5,
    hint: '하락 추세 바닥에서 긴 아래꼬리 캔들(망치형)을 찾으세요. 다음 날 양봉 확인 후 매수!',
    overrides: {
      9: { open: 52800, close: 53500, high: 54000, low: 49000 },
    },
  },
  'shooting-star': {
    prices: [
      50000, 51500, 53000, 54800, 56500, 58000,
      59500, 61000, 62500,
      62000,
      60500, 58500, 56500, 54500, 53000,
    ],
    signal: 'sell',
    optimalEntry: 10,
    optimalExit: 14,
    reveal: 5,
    hint: '상승 추세 고점에서 긴 윗꼬리 캔들(유성형)을 찾으세요. 다음 날 음봉 확인 후 매도!',
    overrides: {
      9: { open: 62800, close: 62000, high: 66000, low: 61800 },
    },
  },
  'bullish-engulfing': {
    prices: [
      65000, 63500, 62000, 60200, 58500, 57000,
      55500, 54200,
      53500, 55500,
      57500, 59500, 61500, 63500, 65000,
    ],
    signal: 'buy',
    optimalEntry: 10,
    optimalExit: 14,
    reveal: 5,
    hint: '하락 중 작은 음봉 다음 큰 양봉이 감싸는 패턴을 찾으세요. 장악형 양봉 확인 후 매수!',
    overrides: {
      8: { open: 54300, close: 53500, high: 54500, low: 53200 },
      9: { open: 53200, close: 55500, high: 55800, low: 52800 },
    },
  },
  'bearish-engulfing': {
    prices: [
      50000, 51500, 53000, 54800, 56500, 58000,
      59500, 60800,
      61500, 59500,
      57500, 55500, 53500, 51500, 50000,
    ],
    signal: 'sell',
    optimalEntry: 10,
    optimalExit: 14,
    reveal: 5,
    hint: '상승 중 작은 양봉 다음 큰 음봉이 감싸는 패턴을 찾으세요. 장악형 음봉 확인 후 매도!',
    overrides: {
      8: { open: 60700, close: 61500, high: 61800, low: 60500 },
      9: { open: 61800, close: 59500, high: 62200, low: 59200 },
    },
  },
  'morning-star': {
    prices: [
      65000, 63200, 61500, 59500, 58000, 56500,
      55000, 52500,
      52000, 53500, 56000,
      58000, 60000, 62000, 64000, 65500,
    ],
    signal: 'buy',
    optimalEntry: 11,
    optimalExit: 15,
    reveal: 5,
    hint: '하락 후 큰 음봉→작은 캔들→큰 양봉 3개 조합(모닝스타)을 찾으세요. 확인 후 매수!',
    overrides: {
      7: { open: 55200, close: 52500, high: 55500, low: 52000 },
      8: { open: 52200, close: 52000, high: 52800, low: 51500 },
      9: { open: 52200, close: 53500, high: 53800, low: 51800 },
      10: { open: 53800, close: 56000, high: 56500, low: 53500 },
    },
  },
};

export function getScenario(patternId: string): PatternScenario | null {
  const def = SCENARIOS[patternId];
  if (!def) return null;
  return {
    candles: toOHLC(def.prices, def.overrides),
    signal: def.signal,
    optimalEntryIndex: def.optimalEntry,
    optimalExitIndex: def.optimalExit,
    initialReveal: def.reveal,
    hint: def.hint,
  };
}
