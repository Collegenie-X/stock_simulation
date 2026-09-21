import { useState, useEffect, useRef } from "react"
import type { StockListItem } from "../types"
import { BREATH_PATTERNS, pickPattern } from "../utils/stockBreath"

// ── 차트 꼬리용: 종목별 최근 틱 가격 ─────────────────────────
// 차트 끝에 이 값들을 이어 붙이면 끝이 실전처럼 오르락내리락 흔들린다.
// (틱마다 livePrices 가 바뀌며 다시 그려지므로 별도 state 없이 읽기만 하면 된다)
const TRAIL_LENGTH = 12

const TICK_MS = 400 // 0.4초마다 움직임
const SWING_RANGE = 0.03 // 턴 가격 기준 ±3% 안에서 왔다갔다
const STEP_SIZE = 0.3 // 한 틱에 움직이는 크기 (범위 대비)
const REST_CHANCE = 0.25 // 한 박자 쉬는 확률

// 틱 방향 비중
const BASE_UP_CHANCE = 0.3 // 평소: 오름 30% / 내림 70%
const EVENT_SENSITIVITY = 0.04 // 그 턴 등락 1% 마다 오름 확률 ±4%p (이벤트 반영)
const MIN_UP_CHANCE = 0.2
const MAX_UP_CHANCE = 0.5
// 내림이 더 잦은 만큼 오름 한 번이 더 크다 (0.3×1.4 ≈ 0.7×0.6 → 평소엔 제자리)
const UP_TICK_SIZE = 1.4
const DOWN_TICK_SIZE = 0.6
const liveTrails: Record<string, number[]> = {}

export function getLiveTrail(stockId: string): number[] {
  return liveTrails[stockId] ?? []
}

/**
 * 전체 종목의 라이브 가격을 섹션 레벨에서 한 곳에서 관리.
 * - 각 종목은 ID 기반 패턴(5종)으로 독립적인 타이밍으로 틱
 * - 헤더 총계 + 각 행이 동일한 livePrices를 공유 → 연동 보장
 */
export function useLivePrices(stocks: StockListItem[]) {
  const [livePrices, setLivePrices] = useState<Record<string, number>>(() =>
    Object.fromEntries(stocks.map((s) => [s.id, s.currentPrice]))
  )
  const [tickUps, setTickUps] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(stocks.map((s) => [s.id, true]))
  )

  // 최신 basePrice를 클로저 밖에서 읽기 위한 ref
  const stocksRef = useRef(stocks)
  stocksRef.current = stocks

  // 실제 게임 가격이 바뀌면 라이브 가격 리셋
  const priceKey = stocks.map((s) => `${s.id}:${s.currentPrice}`).join(",")
  useEffect(() => {
    setLivePrices(Object.fromEntries(stocks.map((s) => [s.id, s.currentPrice])))
    // 턴이 넘어가면 꼬리도 새 가격에서 다시 시작
    stocks.forEach((s) => { liveTrails[s.id] = [] })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceKey])

  // 0.4초마다 한 번에 갱신 (타이머 1개 + setState 1번 → 종목이 많아도 가볍다)
  // 종목마다 패턴(5종)이 다르고 가끔 한 박자 쉬어서, 다 같이 움직이는 느낌이 나지 않는다
  useEffect(() => {
    const stateMap: Record<string, { deviation: number; step: number; prev: number }> = {}
    stocks.forEach((s) => {
      stateMap[s.id] = { deviation: 0, step: 0, prev: s.currentPrice }
    })

    const timer = setInterval(() => {
      const nextPrices: Record<string, number> = {}
      const nextUps: Record<string, boolean> = {}

      stocksRef.current.forEach((s) => {
        const state = stateMap[s.id]
        if (!state || Math.random() < REST_CHANCE) return

        const pattern = BREATH_PATTERNS[pickPattern(s.id)]
        const MAX_DEV   = s.currentPrice * SWING_RANGE
        const cycleStep = state.step % 4
        const baseDelta = pattern.deltas[cycleStep]
        // 오름 30% / 내림 70% — 자주 조금씩 내리고, 가끔 크게 오른다 (평균은 제자리)
        // 이벤트가 있는 턴은 비율이 달라진다: 호재(+)면 오름이 늘고, 악재(−)면 내림이 더 늘어난다
        const eventShift = (Number(s.change) || 0) * EVENT_SENSITIVITY
        const upChance  = Math.max(MIN_UP_CHANCE, Math.min(MAX_UP_CHANCE, BASE_UP_CHANCE + eventShift))
        const isUpTick  = Math.random() < upChance
        const size      = (0.3 + Math.random() * 0.7) * (isUpTick ? UP_TICK_SIZE : DOWN_TICK_SIZE)

        // 매 틱 조금씩 중심으로 당김 (천장·바닥에 붙어 있지 않게)
        state.deviation = state.deviation * 0.92 + ((isUpTick ? size : -size) + baseDelta * 0.3) * MAX_DEV * STEP_SIZE
        state.deviation = Math.max(-MAX_DEV, Math.min(MAX_DEV, state.deviation))
        state.step++

        const next = Math.round(s.currentPrice + state.deviation)
        nextUps[s.id] = next >= state.prev
        state.prev = next
        nextPrices[s.id] = next
        liveTrails[s.id] = [...(liveTrails[s.id] ?? []), next].slice(-TRAIL_LENGTH)
      })

      setLivePrices((prev) => ({ ...prev, ...nextPrices }))
      setTickUps((prev) => ({ ...prev, ...nextUps }))
    }, TICK_MS)

    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stocks.map((s) => s.id).join(",")])

  return { livePrices, tickUps }
}
