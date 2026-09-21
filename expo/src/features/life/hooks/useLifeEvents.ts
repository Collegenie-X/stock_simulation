import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react"
import { storage } from "@/lib/storage"
import { eventForDay, getLifeCharacter, recordSeasonEvent, type LifeCharacter, type LifeEvent } from "../config"

type Holdings = { [stockId: string]: number }

interface UseLifeEventsArgs {
  isLifeSeason: boolean
  currentDay: number
  /** 다른 팝업(날짜·결과)이 떠 있는 동안은 기다린다 */
  ready: boolean
  cash: number
  holdings: Holdings
  prices: { [stockId: string]: number }
  averagePrices: { [stockId: string]: number }
  setCash: Dispatch<SetStateAction<number>>
  setHoldings: Dispatch<SetStateAction<Holdings>>
  setAveragePrices: Dispatch<SetStateAction<{ [stockId: string]: number }>>
  setPaused: (paused: boolean) => void
}

export interface PendingLifeEvent {
  event: LifeEvent
  amount: number
  day: number
  character: LifeCharacter
}

export interface ForcedSale {
  stockId: string
  quantity: number
  revenue: number
  profit: number
}

/** 모자란 돈만큼, 평가액이 큰 종목부터 지금 값에 판다 */
export function planForcedSale(shortfall: number, holdings: Holdings, prices: { [id: string]: number }, averagePrices: { [id: string]: number }): ForcedSale[] {
  const sales: ForcedSale[] = []
  let left = shortfall
  const byValue = Object.keys(holdings)
    .filter((id) => holdings[id] > 0 && prices[id] > 0)
    .sort((a, b) => holdings[b] * prices[b] - holdings[a] * prices[a])
  for (const id of byValue) {
    if (left <= 0) break
    const quantity = Math.min(holdings[id], Math.ceil(left / prices[id]))
    const revenue = quantity * prices[id]
    sales.push({ stockId: id, quantity, revenue, profit: Math.round((prices[id] - (averagePrices[id] ?? prices[id])) * quantity) })
    left -= revenue
  }
  return sales
}

/**
 * 생활 사건 — 계절 중에 급하게 돈이 나가거나 들어온다.
 * 현금이 모자라면 주식을 지금 값에 팔아야 한다. 실전에서 현금을 남겨 두는 이유다.
 */
export function useLifeEvents({
  isLifeSeason,
  currentDay,
  ready,
  cash,
  holdings,
  prices,
  averagePrices,
  setCash,
  setHoldings,
  setAveragePrices,
  setPaused,
}: UseLifeEventsArgs) {
  const [pending, setPending] = useState<PendingLifeEvent | null>(null)

  useEffect(() => {
    if (!isLifeSeason || !ready || pending) return
    const life = storage.getLife()
    const character = getLifeCharacter(life?.characterId)
    if (!life || !character) return
    const hit = eventForDay(life, character, currentDay)
    if (!hit) return
    setPending({ ...hit, day: currentDay, character })
    setPaused(true)
  }, [isLifeSeason, ready, pending, currentDay, setPaused])

  const forcedSales = pending?.event.kind === "need" && cash < pending.amount ? planForcedSale(pending.amount - cash, holdings, prices, averagePrices) : []

  const resolve = useCallback(() => {
    if (!pending) return
    const isGain = pending.event.kind === "gain"
    const sales = isGain ? [] : forcedSales
    const raised = sales.reduce((sum, s) => sum + s.revenue, 0)
    // 주식을 다 팔아도 모자라면 있는 만큼만 낸다
    const paid = isGain ? 0 : Math.min(pending.amount, cash + raised)

    if (sales.length > 0) {
      setHoldings((prev) => {
        const next = { ...prev }
        for (const s of sales) {
          next[s.stockId] = (next[s.stockId] || 0) - s.quantity
          if (next[s.stockId] <= 0) delete next[s.stockId]
        }
        return next
      })
      setAveragePrices((prev) => {
        const next = { ...prev }
        for (const s of sales) if ((holdings[s.stockId] || 0) - s.quantity <= 0) delete next[s.stockId]
        return next
      })
    }
    setCash((prev) => (isGain ? prev + pending.amount : prev + raised - paid))

    const life = storage.getLife()
    if (life) {
      storage.setLife(
        recordSeasonEvent(life, {
          day: pending.day,
          eventId: pending.event.id,
          amount: isGain ? pending.amount : -paid,
          forcedSell: sales.length > 0,
        }),
      )
    }
    setPending(null)
    setPaused(false)
  }, [pending, forcedSales, cash, holdings, setCash, setHoldings, setAveragePrices, setPaused])

  return { pending, forcedSales, resolve }
}
