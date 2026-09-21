import { useMemo } from "react"
import { storage } from "@/lib/storage"
import scenariosData from "@/data/game-scenarios.json"
import scenarios100DaysData from "@/data/stock-100days-data.json"
import { generateStocksFromHistory } from "../../utils/stockDataUtils"

/**
 * 시나리오 및 주식 정보 확인 (100일 데이터 포함 + AI/로봇 주식 동적 생성)
 */
export function useTradeScenario(scenarioId: string): any | null {
  const allScenarios: any[] = [...scenariosData.scenarios, scenarios100DaysData]
  const rawScenario = allScenarios.find((s) => s.id === scenarioId)

  const scenario = useMemo(() => {
    if (!rawScenario) return null

    const settings = storage.getGameSettings()
    const speedMode = settings?.speedMode
    let requiredTurns = 100
    if (speedMode === "sprint") requiredTurns = 30
    else if (speedMode === "standard") requiredTurns = 100
    else if (speedMode === "marathon") requiredTurns = 200

    const currentTurns = rawScenario.totalTurns || 10
    const extended = { ...rawScenario, totalTurns: Math.max(currentTurns, requiredTurns) }

    const extendedStocks = rawScenario.stocks.map((stock: any) => {
      const existingTurns = stock.turns || []
      if (existingTurns.length >= requiredTurns) return stock

      const lastTurn = existingTurns[existingTurns.length - 1]
      const lastPrice = lastTurn?.price || stock.initialPrice
      const lastDate = lastTurn?.date || "2010.01.01"
      const newTurns = [...existingTurns]
      let currentPrice = lastPrice
      const [year, month, day] = lastDate.split(".").map(Number)
      const currentDate = new Date(year, month - 1, day)

      for (let i = existingTurns.length; i < requiredTurns; i++) {
        const change = (Math.random() - 0.5) * 0.06
        currentPrice = Math.max(1000, Math.round(currentPrice * (1 + change)))
        currentDate.setDate(currentDate.getDate() + 1)
        const dateStr = `${currentDate.getFullYear()}.${String(currentDate.getMonth() + 1).padStart(2, "0")}.${String(currentDate.getDate()).padStart(2, "0")}`
        newTurns.push({
          turn: i + 1,
          date: dateStr,
          price: currentPrice,
          news: ["거래량 증가 추세", "안정적인 흐름 유지", "시장 평균 수준 유지", "투자 심리 회복", "변동성 확대"][Math.floor(Math.random() * 5)],
        })
      }
      return { ...stock, turns: newTurns }
    })

    // 종목별 JSON(stock-history) 에만 있는 종목 — 게임 화면(useScenario)과 같은 가격을 쓴다
    const firstDate = rawScenario.stocks[0]?.turns?.[0]?.date || "2010.01.04"
    const existingIds = new Set<string>(extendedStocks.map((st: any) => st.id))
    extended.stocks = [...extendedStocks, ...generateStocksFromHistory(existingIds, firstDate, extended.totalTurns)]

    return extended
  }, [rawScenario])

  return scenario
}
