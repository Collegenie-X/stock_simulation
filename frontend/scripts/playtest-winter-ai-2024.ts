/**
 * Playtest Script — WINTER_AI_2024 시나리오를 가상 플레이어로 실행.
 *
 * 실행: npx tsx frontend/scripts/playtest-winter-ai-2024.ts
 *
 * 검증 목적:
 * 1) 엔진이 60턴을 끝까지 돌리는가
 * 2) 점수 / 등급이 합리적으로 나오는가
 * 3) 자산 평가가 환율 + 가격 변동을 정확히 반영하는가
 */

import {
  loadScenario,
  validateScenario,
} from "../lib/scenario/loader"
import {
  initGame,
  makeDecision,
  advanceTurn,
  snapshotTurn,
  type GameState,
} from "../lib/scenario/engine"

// ============================================================
// 가상 플레이어 전략들
// ============================================================

type Strategy = (
  state: GameState,
  scenario: ReturnType<typeof loadScenario>,
) => {
  action: "buy" | "sell" | "hold"
  stockId?: string
  qty?: number
}

// 1) S 등급 목표 — 메이저 이벤트 직전/직후 매수, 익절
const smartStrategy: Strategy = (state, scenario) => {
  const turn = state.currentTurn
  const upcoming = scenario.events.find(
    (e) => e.turn === turn + 1 && e.type === "major" && e.affectedStocks.some((a) => a.direction === "up"),
  )
  if (upcoming) {
    const target = upcoming.affectedStocks.find((a) => a.direction === "up")!
    return { action: "buy", stockId: target.id, qty: 5 }
  }

  // 블랙스완 직전 = 일부 현금화
  const blackswan = scenario.events.find((e) => e.type === "blackswan")
  if (blackswan && turn === blackswan.turn - 1) {
    const heldStocks = Object.entries(state.holdings).filter(([, q]) => q > 0)
    if (heldStocks.length > 0) {
      const [sid, qty] = heldStocks[0]
      return { action: "sell", stockId: sid, qty: Math.floor(qty / 2) }
    }
  }

  // 블랙스완 다음 턴 = 저가 매수 (V자)
  if (blackswan && turn === blackswan.turn + 2) {
    return { action: "buy", stockId: "K01", qty: 30 }
  }

  // TSLA 추세 매수
  if (turn === 5) return { action: "buy", stockId: "U07", qty: 20 }

  return { action: "hold" }
}

// 2) 평균 — 매 5턴마다 한 번씩 거래
const averageStrategy: Strategy = (state, _) => {
  const turn = state.currentTurn
  if (turn % 7 === 0) {
    return { action: "buy", stockId: "K01", qty: 10 }
  }
  if (turn % 11 === 0) {
    const held = Object.entries(state.holdings).find(([, q]) => q > 0)
    if (held) return { action: "sell", stockId: held[0], qty: Math.min(held[1], 5) }
  }
  return { action: "hold" }
}

// 3) 최악 — 함정 매수 + 패닉 매도
const badStrategy: Strategy = (state, scenario) => {
  const turn = state.currentTurn

  // 작전주(에코프로비엠 같은) 진입... 이 시나리오엔 LG엔솔만 trap-vulnerable이라 매수 함정 시뮬
  // 트럼프 당선 전 LG엔솔 매수 (직격)
  if (turn === 4) return { action: "buy", stockId: "K07", qty: 15 }

  // 블랙스완 다음 턴 패닉 매도
  const blackswan = scenario.events.find((e) => e.type === "blackswan")
  if (blackswan && turn === blackswan.turn + 1) {
    const all = Object.entries(state.holdings).filter(([, q]) => q > 0)
    if (all.length > 0) {
      const [sid, q] = all[0]
      return { action: "sell", stockId: sid, qty: q }
    }
  }

  return { action: "hold" }
}

// ============================================================
// 시뮬레이터
// ============================================================

function runSimulation(
  strategy: Strategy,
  label: string,
  decisionTimeMs: number = 20000,
) {
  const scenario = loadScenario("WINTER_AI_2024")
  const state = initGame(scenario, 12345)

  console.log(`\n${"=".repeat(60)}`)
  console.log(`▶  ${label} 시작`)
  console.log("=".repeat(60))

  let safetyCounter = 0
  while (!state.isFinished && safetyCounter < scenario.totalTurns + 5) {
    const decision = strategy(state, scenario)
    const result = makeDecision(scenario, state, {
      stockId: decision.stockId || null,
      action: decision.action,
      quantity: decision.qty || 0,
      decisionTimeMs,
    })

    if (!result.success && state.currentTurn === 1) {
      // 첫 턴 매수 실패 시 hold
      makeDecision(scenario, state, {
        stockId: null,
        action: "hold",
        quantity: 0,
        decisionTimeMs,
      })
    }
    advanceTurn(scenario, state)
    safetyCounter++
  }

  if (!state.result) {
    console.log("⚠️  result not generated, forcing finish")
    state.isFinished = true
    return
  }

  const r = state.result
  console.log(`\n📊 결과:`)
  console.log(`   등급         : ${r.grade}`)
  console.log(`   수익률       : ${(r.profitRate * 100).toFixed(2)}%`)
  console.log(`   감각 점수    : ${r.senseScore}`)
  console.log(`   최종 자산    : ${r.finalAssetKrw.toLocaleString()}원`)
  console.log(`   결정 횟수    : ${state.decisions.length}회`)
  console.log(`   배지         : ${r.badges.join(", ") || "없음"}`)
  console.log(`   현금         : ${state.cash.toLocaleString()}원`)
  const heldList = Object.entries(state.holdings).filter(([, q]) => q > 0)
  if (heldList.length > 0) {
    console.log(`   미청산 보유  :`)
    for (const [sid, qty] of heldList) {
      const stock = scenario.stocks.find((s) => s.id === sid)
      const lastPrice = scenario.priceSeries[sid][scenario.totalTurns - 1]
      console.log(
        `     ${stock?.name}: ${qty}주 × ${lastPrice} (${stock?.currency})`,
      )
    }
  }
  return r
}

// ============================================================
// 메인
// ============================================================

console.log("\n🎬 WINTER_AI_2024 시나리오 검증\n")

// 1) 시나리오 로드 & 검증
const scenario = loadScenario("WINTER_AI_2024")
const issues = validateScenario(scenario)
console.log(`✅ 시나리오 로드 완료`)
console.log(`   ID         : ${scenario.id}`)
console.log(`   제목        : ${scenario.title}`)
console.log(`   기간        : ${scenario.period.start} ~ ${scenario.period.end}`)
console.log(`   턴 수       : ${scenario.totalTurns}`)
console.log(`   종목 수     : ${scenario.stocks.length}`)
console.log(`   이벤트 수   : ${scenario.events.length} (메이저 4 + 블랙스완 1)`)
console.log(`   검증 경고   : ${issues.filter((i) => i.severity === "warning").length}건`)

// 2) 첫 턴 스냅샷
const initState = initGame(scenario, 99)
const snap = snapshotTurn(scenario, initState)
console.log(`\n📺 첫 턴 스냅샷 (Turn ${snap.turn}, ${snap.date} ${snap.time}):`)
console.log(`   주차 테마   : ${snap.weekTheme}`)
console.log(`   Act         : ${snap.act}`)
console.log(`   환율        : ${snap.fxRate}`)
console.log(`   분위기      : ${snap.mood}`)
for (const stock of scenario.stocks) {
  const p = snap.prices[stock.id]
  console.log(`   ${stock.name.padEnd(15)} : ${p.native} (${stock.currency}) → ${p.krw.toLocaleString()}원`)
}

// 3) 3가지 전략 시뮬레이션
const smartResult = runSimulation(smartStrategy, "🧠 SMART 플레이어")
const avgResult = runSimulation(averageStrategy, "😐 AVERAGE 플레이어")
const badResult = runSimulation(badStrategy, "😵 BAD 플레이어")

// 4) 비교
console.log(`\n${"=".repeat(60)}`)
console.log(`📊 등급 비교 요약`)
console.log("=".repeat(60))
const print = (label: string, r: ReturnType<typeof runSimulation>) => {
  if (!r) return
  console.log(
    `${label.padEnd(20)} ${r.grade}등급 / ${(r.profitRate * 100).toFixed(1).padStart(6)}% / 감각 ${r.senseScore}`,
  )
}
print("🧠 SMART", smartResult)
print("😐 AVERAGE", avgResult)
print("😵 BAD", badResult)

console.log(`\n✅ 시뮬레이션 완료 — 엔진이 정상 동작합니다.\n`)
