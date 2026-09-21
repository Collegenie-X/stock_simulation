import { useMemo } from "react"
import scenariosData from "@/data/game-scenarios.json"
import scenarios100DaysData from "@/data/stock-100days-data.json"
import { generateStocksFromHistory } from "../utils/stockDataUtils"

export interface ScenarioTurn {
  turn: number
  date: string
  price: number
  news?: string
  [key: string]: any
}

export interface ScenarioStock {
  id: string
  name: string
  category?: string
  initialPrice: number
  turns: ScenarioTurn[]
  [key: string]: any
}

export interface GameScenario {
  id: string
  totalTurns: number
  stocks: ScenarioStock[]
  [key: string]: any
}

/**
 * 시나리오 데이터 선택 + 자동 확장 (웹 page.tsx 의 requiredTurns / scenario useMemo 와 동일)
 * - 스피드 모드에 필요한 턴 수만큼 기존 주식의 턴을 생성
 * - 종목별 JSON(stock-history) 에만 있는 종목(AI·로봇·추가 종목) 추가
 */
export function useScenario(scenarioId: string, speedMode?: string): GameScenario | null {
  // 시나리오 데이터 선택 및 확장
  const allScenarios = [...scenariosData.scenarios, scenarios100DaysData] as any[]
  const rawScenario = allScenarios.find((s) => s.id === scenarioId) as GameScenario | undefined

  // 스프린트/스탠다드/마라톤 모드에 필요한 최소 턴 수 계산
  const requiredTurns = useMemo(() => {
    // 모드별 필요 턴 수 (여유있게)
    if (speedMode === "sprint") return 30 // 스프린트: 1개월 = ~22 결정 → 30턴
    if (speedMode === "standard") return 100 // 스탠다드: 3개월 = ~33 결정 → 100턴
    if (speedMode === "marathon") return 200 // 마라톤: 12개월 = ~60 결정 → 200턴

    // gameSettings가 없거나 speedMode가 없으면 100턴 (기본)
    return 100
  }, [speedMode])

  // 시나리오 데이터 자동 확장 + 추가 주식 생성
  const scenario = useMemo<GameScenario | null>(() => {
    if (!rawScenario) return null

    const currentTurns = rawScenario.totalTurns || 10

    const extendedScenario: GameScenario = { ...rawScenario }
    extendedScenario.totalTurns = Math.max(currentTurns, requiredTurns)

    // 기존 주식 확장
    let extendedStocks = rawScenario.stocks.map((stock: any) => {
      const existingTurns = stock.turns || []
      const lastTurn = existingTurns[existingTurns.length - 1]
      const lastPrice = lastTurn?.price || stock.initialPrice
      const lastDate = lastTurn?.date || "2010.01.01"

      // 새로운 턴 생성
      const newTurns = [...existingTurns]
      let currentPrice = lastPrice

      // 마지막 날짜 파싱
      const [year, month, day] = lastDate.split(".").map(Number)
      const currentDate = new Date(year, month - 1, day)

      for (let i = existingTurns.length; i < requiredTurns; i++) {
        // 가격 변동 (-3% ~ +3%)
        const change = (Math.random() - 0.5) * 0.06
        currentPrice = Math.max(1000, Math.round(currentPrice * (1 + change)))

        // 날짜 증가
        currentDate.setDate(currentDate.getDate() + 1)
        const dateStr = `${currentDate.getFullYear()}.${String(currentDate.getMonth() + 1).padStart(2, "0")}.${String(currentDate.getDate()).padStart(2, "0")}`

        // 뉴스 생성
        const newsTemplates = [
          "거래량 증가 추세",
          "안정적인 흐름 유지",
          "시장 평균 수준 유지",
          "투자 심리 회복",
          "변동성 확대",
          "거래 활발",
          "관망세 지속",
        ]
        const news = newsTemplates[Math.floor(Math.random() * newsTemplates.length)]

        newTurns.push({
          turn: i + 1,
          date: dateStr,
          price: currentPrice,
          news: news,
        })
      }

      return {
        ...stock,
        turns: newTurns,
      }
    })

    // 종목별 JSON(src/data/stock-history) 에만 있는 종목 추가 — AI·로봇·추가 종목
    const firstDate = rawScenario.stocks[0]?.turns?.[0]?.date || "2010.01.04"
    const existingIds = new Set(extendedStocks.map((st: any) => st.id))
    extendedStocks = [...extendedStocks, ...generateStocksFromHistory(existingIds, firstDate, extendedScenario.totalTurns)]

    extendedScenario.stocks = extendedStocks as ScenarioStock[]

    return extendedScenario
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawScenario, requiredTurns])

  return scenario
}
