import { useMemo, useState } from "react"
import { useIsFocused } from "expo-router"
import { DAYS_PER_WEEK, DAY_NAMES, DAY_PHASES, DECISIONS_PER_DAY } from "../config"
import type { ChartPeriod, StockViewTab, ViewMode } from "../types"
import { generateHistory } from "../utils/stockDataUtils"
import { useAIBattle } from "./useAIBattle"
import { useDayProgression } from "./useDayProgression"
import { useGameSession } from "./useGameSession"
import { useLivePrices } from "./useLivePrices"
import { useScenario } from "./useScenario"
import { useTrading } from "./useTrading"

/**
 * 주식 게임 화면의 전체 상태 — 웹 page.tsx 의 로직을 역할별 훅으로 나눠 조합합니다.
 *   useScenario        시나리오 확장
 *   useGameSession     세션 상태 + 저장/복원
 *   useDayProgression  타이머 / 시간대·일차 진행 / 리포트 흐름
 *   useTrading         매수·매도·건너뛰기 / 예약 주문
 *   useLivePrices      라이브 호가
 *   useAIBattle        AI 경쟁자 시뮬레이션
 */
export function useGameState(scenarioId: string, refreshParam?: string) {
  const isFocused = useIsFocused()

  // ── 화면(UI) 상태 ─────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("1D")
  const [favorites, setFavorites] = useState<string[]>([])
  const [showDatePopup] = useState(false)
  const [stockViewTab, setStockViewTab] = useState<StockViewTab>("현재가")
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [showProfitAnalysis, setShowProfitAnalysis] = useState(false)
  const [showHintModal, setShowHintModal] = useState(false)
  const [hintLevel, setHintLevel] = useState<1 | 2>(1)
  // 더미 데이터 미리보기 상태
  const [showPreviewMiniReport, setShowPreviewMiniReport] = useState(false)
  const [showPreviewFinalReport, setShowPreviewFinalReport] = useState(false)

  const [gameSettings, setGameSettings] = useState<any>(null)

  // ── 로직 훅 조합 ─────────────────────────────────────────
  const scenario = useScenario(scenarioId, gameSettings?.speedMode)
  const session = useGameSession({ scenarioId, scenario, refreshParam, setGameSettings })
  const progression = useDayProgression({ scenario, session, isFocused })
  const trading = useTrading({ scenarioId, scenario, session, progression, viewMode, setViewMode })

  const { currentTurn, holdings, averagePrices, cash, selectedStockId, lastWeekValue } = session
  const { currentDay, currentPhaseInDay } = progression

  // currentStock을 useMemo로 최적화하여 주기적으로 업데이트
  const currentStock = useMemo(() => {
    if (!scenario || !scenario.stocks || !selectedStockId) return undefined
    return scenario.stocks.find((s) => s.id === selectedStockId)
  }, [scenario, selectedStockId])

  const turnData = currentStock?.turns?.[currentTurn]

  const derivedMaxTurns = useMemo(() => {
    return scenario?.totalTurns || 10
  }, [scenario])

  const totalDays = Math.ceil(derivedMaxTurns / DECISIONS_PER_DAY)
  const currentDayName = DAY_NAMES[(currentDay - 1) % DAY_NAMES.length]
  const currentDayPhase = DAY_PHASES[currentPhaseInDay] || DAY_PHASES[0]
  const currentWeekNumber = Math.ceil(currentDay / DAYS_PER_WEEK)
  const currentDayNumber = currentDay

  const currentPrice = turnData?.price || 0
  const currentHoldings = holdings[selectedStockId] || 0
  const currentAvgPrice = averagePrices[selectedStockId] || 0

  const prevPrice =
    currentTurn > 0 && currentStock ? currentStock.turns[currentTurn - 1].price : currentStock?.initialPrice || 0
  const change = currentPrice && prevPrice ? (((currentPrice - prevPrice) / prevPrice) * 100).toFixed(1) : "0.0"
  const isUp = Number.parseFloat(change) >= 0

  const prevDayData = useMemo(() => {
    if (!currentStock || currentTurn < 2) return undefined
    const prev1 = currentStock.turns[currentTurn - 1]?.price || 0
    const prev2 = currentStock.turns[currentTurn - 2]?.price || currentStock.initialPrice
    if (!prev1 || !prev2) return undefined
    const prevChange = ((prev1 - prev2) / prev2) * 100
    return {
      change: Number(prevChange.toFixed(1)),
      isUp: prevChange >= 0,
      news: (currentStock.turns[currentTurn - 1] as any)?.news || "",
    }
  }, [currentStock, currentTurn])

  const totalStockValue =
    scenario?.stocks.reduce((acc, stock) => {
      const stockPrice = stock.turns[currentTurn]?.price || 0
      const stockHoldings = holdings[stock.id] || 0
      return acc + stockPrice * stockHoldings
    }, 0) || 0

  const totalValue = Math.round(cash + totalStockValue)
  const initialValue: number = gameSettings ? gameSettings.initialCash : 1000000
  const profitRate = Number.parseFloat((((totalValue - initialValue) / initialValue) * 100).toFixed(1))

  // 전체 주식 리스트 데이터 (page 레벨로 호이스팅 → useLivePrices 공유)
  const allStocksData = useMemo(() => {
    if (!scenario) return []
    return scenario.stocks.map((stock) => {
      const turnData = stock.turns?.[currentTurn]
      const currentPrice = turnData?.price || stock.initialPrice || 0
      const prevPrice = currentTurn > 0 ? stock.turns?.[currentTurn - 1]?.price || stock.initialPrice || 0 : stock.initialPrice || 0
      const change = prevPrice > 0 ? (((currentPrice - prevPrice) / prevPrice) * 100).toFixed(1) : "0.0"
      return {
        ...stock,
        currentPrice,
        prevPrice,
        change,
        isUp: Number(change) >= 0,
        myHoldings: holdings[stock.id] || 0,
        myAvg: averagePrices[stock.id] || 0,
        maxBuyQty: currentPrice > 0 ? Math.floor(cash / currentPrice) : 0,
        news: (turnData as any)?.news || "시장 정보",
      }
    })
  }, [scenario, currentTurn, holdings, averagePrices, cash])

  // 라이브 가격 (StockListSection + GameHeader 공유)
  const { livePrices, tickUps } = useLivePrices(allStocksData as any)

  // 라이브 가격 기반 총자산 (GameHeader 표시용)
  const liveTotalStockValue = allStocksData.reduce((acc, stock) => {
    const lp = livePrices[stock.id] ?? stock.currentPrice
    return acc + lp * stock.myHoldings
  }, 0)
  const liveTotalValue = Math.round(cash + liveTotalStockValue)
  const liveProfitRate = Number.parseFloat((((liveTotalValue - initialValue) / initialValue) * 100).toFixed(1))

  // AI 대결 시스템
  const ai = useAIBattle({
    scenario,
    initialValue,
    currentTurn,
    currentDay,
    holdings,
    cash,
    liveProfitRate,
    showDaySummary: progression.showDaySummary,
    showMiniReport: progression.showMiniReport,
    dailyUserDecisions: progression.dailyUserDecisions,
    setStockCompareResults: progression.setStockCompareResults,
  })

  const currentWeekValue = totalValue
  const weeklyReturn =
    lastWeekValue > 0 ? Number.parseFloat((((currentWeekValue - lastWeekValue) / lastWeekValue) * 100).toFixed(1)) : 0

  const handleCloseReport = () => progression.handleCloseReport(currentWeekValue)

  const chartData = useMemo(() => {
    if (!currentStock) return []

    const history = generateHistory(currentStock.initialPrice, 365) // Generate 1 year history
    const gameData = currentStock.turns.slice(0, currentTurn + 1).map((t, idx) => ({
      index: history.length + idx,
      price: t.price,
      date: t.date,
    }))

    const fullData = [...history, ...gameData]

    let filteredData
    switch (chartPeriod) {
      case "1D":
        filteredData = fullData.slice(-20) // Approx 1 day in game minutes
        break
      case "1W":
        filteredData = fullData.slice(-100) // Approx 1 week
        break
      case "1M":
        filteredData = fullData.slice(-400) // Approx 1 month
        break
      case "1Y":
        filteredData = fullData // Full history
        break
      default:
        filteredData = fullData.slice(-400)
    }

    // 인덱스 재정렬
    return filteredData.map((d, idx) => ({ ...d, index: idx }))
  }, [currentStock, currentTurn, chartPeriod])

  const maxBuyQuantity = Math.floor(cash / currentPrice)

  const toggleFavorite = (stockId: string) => {
    setFavorites((prev) => (prev.includes(stockId) ? prev.filter((id) => id !== stockId) : [...prev, stockId]))
  }

  return {
    // 화면 상태
    viewMode,
    setViewMode,
    chartPeriod,
    setChartPeriod,
    favorites,
    toggleFavorite,
    showDatePopup,
    stockViewTab,
    setStockViewTab,
    showExitConfirm,
    setShowExitConfirm,
    showProfitAnalysis,
    setShowProfitAnalysis,
    showHintModal,
    setShowHintModal,
    hintLevel,
    setHintLevel,
    showPreviewMiniReport,
    setShowPreviewMiniReport,
    showPreviewFinalReport,
    setShowPreviewFinalReport,
    gameSettings,
    // 로직
    scenario,
    session,
    progression,
    trading,
    ai,
    // 파생 값
    currentStock,
    turnData,
    totalDays,
    currentDayName,
    currentDayPhase,
    currentWeekNumber,
    currentDayNumber,
    currentPrice,
    currentHoldings,
    currentAvgPrice,
    prevPrice,
    change,
    isUp,
    prevDayData,
    totalValue,
    initialValue,
    profitRate,
    allStocksData,
    livePrices,
    tickUps,
    liveTotalValue,
    liveProfitRate,
    weeklyReturn,
    handleCloseReport,
    chartData,
    maxBuyQuantity,
  }
}
