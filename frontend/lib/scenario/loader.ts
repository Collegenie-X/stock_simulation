// ============================================================
// Scenario Loader — JSON 로드 + 무결성 검증
// ============================================================

import type {
  GameScenario,
  ScenarioIndex,
  ScenarioStock,
} from "@/data/game-scenarios/types"

import scenarioIndex from "@/data/game-scenarios/index.json"
import winterAi2024 from "@/data/game-scenarios/winter-ai-2024.json"

// ============================================================
// Registry
// ============================================================

const SCENARIO_REGISTRY: Record<string, GameScenario> = {
  WINTER_AI_2024: winterAi2024 as unknown as GameScenario,
}

// ============================================================
// Public API
// ============================================================

export function listScenarios(): ScenarioIndex {
  return scenarioIndex as unknown as ScenarioIndex
}

export function loadScenario(id: string): GameScenario {
  const scenario = SCENARIO_REGISTRY[id]
  if (!scenario) {
    throw new ScenarioLoadError(`Unknown scenario: ${id}`)
  }
  validateScenario(scenario)
  return scenario
}

// ============================================================
// Validation
// ============================================================

export class ScenarioLoadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ScenarioLoadError"
  }
}

export interface ValidationIssue {
  severity: "error" | "warning"
  code: string
  message: string
}

/**
 * 시나리오 무결성 검증.
 * 에러 발견 시 throw, 경고는 console.warn.
 */
export function validateScenario(s: GameScenario): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  // 1) 메타 일관성
  if (s.totalTurns !== s.totalDays * s.turnsPerDay) {
    issues.push({
      severity: "error",
      code: "META_MISMATCH",
      message: `totalTurns(${s.totalTurns}) !== totalDays×turnsPerDay(${s.totalDays}×${s.turnsPerDay})`,
    })
  }

  // 2) 가격 시계열 길이
  for (const stock of s.stocks) {
    const series = s.priceSeries[stock.id]
    if (!series) {
      issues.push({
        severity: "error",
        code: "PRICE_SERIES_MISSING",
        message: `priceSeries missing for stock ${stock.id} (${stock.name})`,
      })
      continue
    }
    if (series.length !== s.totalTurns) {
      issues.push({
        severity: "error",
        code: "PRICE_SERIES_LENGTH",
        message: `${stock.id} priceSeries length ${series.length} !== ${s.totalTurns}`,
      })
    }
    if (series[0] !== stock.startPrice) {
      issues.push({
        severity: "warning",
        code: "PRICE_SERIES_START",
        message: `${stock.id} series[0]=${series[0]} !== startPrice=${stock.startPrice}`,
      })
    }
    if (series[series.length - 1] !== stock.endPrice) {
      issues.push({
        severity: "warning",
        code: "PRICE_SERIES_END",
        message: `${stock.id} last=${series[series.length - 1]} !== endPrice=${stock.endPrice}`,
      })
    }
    // NaN / 음수 검사
    series.forEach((p, i) => {
      if (!Number.isFinite(p) || p <= 0) {
        issues.push({
          severity: "error",
          code: "PRICE_INVALID",
          message: `${stock.id} turn${i + 1}: invalid price ${p}`,
        })
      }
    })
    // 한 턴에 ±20% 초과 변동 (이상치)
    for (let i = 1; i < series.length; i++) {
      const pct = Math.abs((series[i] - series[i - 1]) / series[i - 1])
      if (pct > 0.2) {
        issues.push({
          severity: "warning",
          code: "PRICE_JUMP",
          message: `${stock.id} turn${i + 1}: ${(pct * 100).toFixed(1)}% jump (${series[i - 1]} → ${series[i]})`,
        })
      }
    }
  }

  // 3) 환율 시계열
  if (s.fxSeries.length !== s.totalTurns) {
    issues.push({
      severity: "error",
      code: "FX_SERIES_LENGTH",
      message: `fxSeries length ${s.fxSeries.length} !== ${s.totalTurns}`,
    })
  }
  if (s.fxSeries[0] !== s.initialFxRate) {
    issues.push({
      severity: "warning",
      code: "FX_INITIAL",
      message: `fxSeries[0]=${s.fxSeries[0]} !== initialFxRate=${s.initialFxRate}`,
    })
  }

  // 4) 캘린더 길이
  if (s.calendar.length !== s.totalDays) {
    issues.push({
      severity: "error",
      code: "CALENDAR_LENGTH",
      message: `calendar length ${s.calendar.length} !== totalDays ${s.totalDays}`,
    })
  }

  // 5) 이벤트 turn 범위
  for (const ev of s.events) {
    if (ev.turn < 1 || ev.turn > s.totalTurns) {
      issues.push({
        severity: "error",
        code: "EVENT_TURN_OOR",
        message: `Event ${ev.id} turn ${ev.turn} out of range [1, ${s.totalTurns}]`,
      })
    }
    // affectedStocks 가 stocks 에 존재하는지
    for (const a of ev.affectedStocks) {
      const exists = s.stocks.some((st) => st.id === a.id)
      if (!exists) {
        issues.push({
          severity: "warning",
          code: "EVENT_TARGET_UNKNOWN",
          message: `Event ${ev.id} affects unknown stock ${a.id}`,
        })
      }
    }
  }

  // 6) 노이즈 템플릿
  if (s.noiseNewsTemplates.length === 0) {
    issues.push({
      severity: "warning",
      code: "NOISE_EMPTY",
      message: "No noise news templates defined",
    })
  }

  // 에러 있으면 throw
  const errors = issues.filter((i) => i.severity === "error")
  if (errors.length > 0) {
    const summary = errors.map((e) => `[${e.code}] ${e.message}`).join("\n  ")
    throw new ScenarioLoadError(`Scenario validation failed:\n  ${summary}`)
  }

  // 경고는 콘솔로
  if (issues.length > 0 && typeof console !== "undefined") {
    issues.forEach((i) =>
      console.warn(`[scenario:${s.id}] ${i.code}: ${i.message}`),
    )
  }

  return issues
}

// ============================================================
// 조회 유틸
// ============================================================

/**
 * 특정 턴의 종목 가격 (KRW 기준 환산값 포함)
 */
export function getPriceAt(
  scenario: GameScenario,
  stockId: string,
  turn: number,
): { native: number; krw: number; fx: number } {
  const series = scenario.priceSeries[stockId]
  if (!series) throw new ScenarioLoadError(`No price series for ${stockId}`)
  if (turn < 1 || turn > series.length) {
    throw new ScenarioLoadError(`Turn ${turn} out of range`)
  }
  const stock = scenario.stocks.find((s) => s.id === stockId)
  if (!stock) throw new ScenarioLoadError(`No stock ${stockId}`)

  const native = series[turn - 1]
  const fx = scenario.fxSeries[turn - 1]
  const krw =
    stock.currency === "KRW" ? Math.round(native) : Math.round(native * fx)

  return { native, krw, fx }
}

/**
 * 특정 턴의 활성 이벤트 (해당 턴에 발생하는 이벤트)
 */
export function getEventsAtTurn(
  scenario: GameScenario,
  turn: number,
): GameScenario["events"] {
  return scenario.events.filter((e) => e.turn === turn)
}

/**
 * 종목 + 턴 → 캐릭터/섹터/시장 정보 등 메타 빠르게 가져오기
 */
export function getStockMeta(
  scenario: GameScenario,
  stockId: string,
): ScenarioStock {
  const stock = scenario.stocks.find((s) => s.id === stockId)
  if (!stock) throw new ScenarioLoadError(`No stock ${stockId}`)
  return stock
}
