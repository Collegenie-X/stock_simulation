// ============================================================
// News Generator — 메이저/마이너 이벤트 + 노이즈
// 출처: docs/GAME_REALISTIC_PACING.md 2번 뉴스 3단계
// ============================================================

import type {
  GameScenario,
  NoiseNewsTemplate,
  ScenarioEvent,
  ScenarioStock,
} from "@/data/game-scenarios/types"

// ============================================================
// 시드 RNG (재현 가능)
// ============================================================
function mulberry32(seed: number): () => number {
  let t = seed >>> 0
  return () => {
    t = (t + 0x6d2b79f5) >>> 0
    let r = t
    r = Math.imul(r ^ (r >>> 15), r | 1)
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

// ============================================================
// 뉴스 표시용 모델
// ============================================================
export interface DisplayNews {
  level: "major" | "minor" | "noise"
  headline: string
  body: string
  badge?: string             // "어제 발표 · 주가 이미 반영" 같은 회색 뱃지
  source?: string
  stockId?: string           // 특정 종목 뉴스인 경우
  realCase?: string          // 실제 사건 매핑 (학습용)
}

// ============================================================
// 턴별 뉴스 생성
// ============================================================

/**
 * 매 턴 호출 — 그 턴에 표시할 뉴스 0~N개 반환.
 * - 이벤트가 있으면 메이저/마이너 뉴스
 * - 없으면 30% 확률로 노이즈
 */
export function newsForTurn(
  scenario: GameScenario,
  turn: number,
  rngSeed: number,
): DisplayNews[] {
  const rng = mulberry32(rngSeed + turn * 997)

  const events = scenario.events.filter((e) => e.turn === turn)
  const result: DisplayNews[] = []

  // 1) 이벤트 → 메이저/마이너 뉴스
  for (const ev of events) {
    result.push(eventToNews(ev))
  }

  // 2) 이벤트 없을 때만 노이즈 발생
  const cfg = scenario.noiseNewsConfig
  if (
    events.length === 0 ||
    !cfg.skipOnEventTurn
  ) {
    if (rng() < cfg.probabilityPerTurn && cfg.maxPerTurn > 0) {
      const noise = pickNoise(scenario.noiseNewsTemplates, rng)
      if (noise) {
        // 종목 매핑: 50% 확률로 특정 종목과 연결
        const stockId =
          rng() < 0.5
            ? scenario.stocks[Math.floor(rng() * scenario.stocks.length)]?.id
            : undefined

        result.push({
          level: "noise",
          headline: applyStockName(noise.headline, stockId, scenario),
          body: noise.body,
          badge: noise.badge,
          stockId,
        })
      }
    }
  }

  return result
}

// ============================================================
// 이벤트 → 뉴스 변환
// ============================================================
function eventToNews(ev: ScenarioEvent): DisplayNews {
  return {
    level: ev.type === "blackswan" || ev.type === "major" ? "major" : "minor",
    headline: ev.headline,
    body: ev.body,
    source: ev.source,
    realCase: ev.realCase,
  }
}

// ============================================================
// 노이즈 추출 (가중치 기반)
// ============================================================
function pickNoise(
  templates: NoiseNewsTemplate[],
  rng: () => number,
): NoiseNewsTemplate | null {
  if (templates.length === 0) return null
  const totalWeight = templates.reduce((s, t) => s + t.weight, 0)
  let r = rng() * totalWeight
  for (const t of templates) {
    r -= t.weight
    if (r <= 0) return t
  }
  return templates[templates.length - 1]
}

// "OO" 같은 placeholder 를 종목명으로 치환
function applyStockName(
  headline: string,
  stockId: string | undefined,
  scenario: GameScenario,
): string {
  if (!stockId) return headline
  const stock = scenario.stocks.find((s) => s.id === stockId)
  if (!stock) return headline
  return headline.replace(/OO/g, stock.name)
}

// ============================================================
// 사전 신호 — 다가올 이벤트의 힌트
// ============================================================

export interface PreSignal {
  eventId: string
  signalType: string
  description: string
  turnsAhead: number
}

/**
 * 현재 턴에서 보이기 시작하는 사전 신호 추출.
 * (학습 모드에서 시각화용 — Act 1에서만 노출)
 */
export function preSignalsForTurn(
  scenario: GameScenario,
  turn: number,
): PreSignal[] {
  const result: PreSignal[] = []
  for (const ev of scenario.events) {
    if (!ev.preSignal) continue
    if (turn >= ev.preSignal.visibleFromTurn && turn < ev.turn) {
      result.push({
        eventId: ev.id,
        signalType: ev.preSignal.type,
        description: ev.preSignal.description,
        turnsAhead: ev.turn - turn,
      })
    }
  }
  return result
}

// ============================================================
// 헤더 분위기 — 현재 시장 톤
// ============================================================

export type MarketMood = "calm" | "rising" | "falling" | "volatile" | "panic"

export function inferMarketMood(
  scenario: GameScenario,
  turn: number,
  lookback: number = 5,
): MarketMood {
  const startTurn = Math.max(1, turn - lookback)
  const stocks = scenario.stocks
  let totalChange = 0
  let absChange = 0
  let count = 0
  for (const stock of stocks) {
    const series = scenario.priceSeries[stock.id]
    if (!series) continue
    const start = series[startTurn - 1]
    const end = series[turn - 1]
    if (start && end) {
      const ch = (end - start) / start
      totalChange += ch
      absChange += Math.abs(ch)
      count++
    }
  }
  if (count === 0) return "calm"

  const avg = totalChange / count
  const vol = absChange / count

  if (vol >= 0.05) return "panic"
  if (vol >= 0.03) return "volatile"
  if (avg >= 0.015) return "rising"
  if (avg <= -0.015) return "falling"
  return "calm"
}
