import { useState, useEffect, useRef } from "react"
import type { StockListItem } from "../../types"
import { BREATH_PATTERNS, pickPattern } from "../utils/stockBreath"

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceKey])

  // 종목별 독립 인터벌 — 패턴마다 타이밍이 달라 자연스러운 비동기 흐름 생성
  useEffect(() => {
    // 각 종목의 로컬 상태 (deviation, step, prev)
    const stateMap: Record<string, { deviation: number; step: number; prev: number }> = {}
    stocks.forEach((s) => {
      stateMap[s.id] = { deviation: 0, step: 0, prev: s.currentPrice }
    })

    const timers = stocks.map((s) => {
      const pattern = BREATH_PATTERNS[pickPattern(s.id)]

      return setInterval(() => {
        const basePrice =
          stocksRef.current.find((st) => st.id === s.id)?.currentPrice ?? s.currentPrice
        const state = stateMap[s.id]
        if (!state) return

        const MAX_DEV   = basePrice * 0.008
        const cycleStep = state.step % 4
        const baseDelta = pattern.deltas[cycleStep]
        const noise     = (Math.random() - 0.5) * 0.6 // ±30% 노이즈

        state.deviation += (baseDelta + baseDelta * noise) * MAX_DEV
        if (cycleStep === 3) state.deviation *= 0.45  // 4틱 완료 후 중심 회귀
        state.deviation = Math.max(-MAX_DEV, Math.min(MAX_DEV, state.deviation))
        state.step++

        const next = Math.round(basePrice + state.deviation)
        const isUp = next >= state.prev
        state.prev = next

        setLivePrices((prev) => ({ ...prev, [s.id]: next }))
        setTickUps((prev)   => ({ ...prev, [s.id]: isUp }))
      }, pattern.intervalMs)
    })

    return () => timers.forEach(clearInterval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stocks.map((s) => s.id).join(",")])

  return { livePrices, tickUps }
}
