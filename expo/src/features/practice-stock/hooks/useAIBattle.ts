import { useEffect, useState } from "react"
import { useAICompetitor } from "./useAICompetitor"
import type { StockCompareResult, UserDayDecision, WaveAnalysis } from "./useAICompetitor"
import type { GameScenario } from "./useScenario"

interface UseAIBattleArgs {
  scenario: GameScenario | null
  initialValue: number
  currentTurn: number
  currentDay: number
  holdings: { [key: string]: number }
  cash: number
  liveProfitRate: number
  showDaySummary: boolean
  showMiniReport: boolean
  dailyUserDecisions: UserDayDecision[]
  setStockCompareResults: (results: StockCompareResult[]) => void
}

/**
 * AI 대결 시스템 — useAICompetitor + 하루 요약/미니 리포트 표시 시 AI 시뮬레이션 자동 실행
 * (웹 page.tsx 의 AI 관련 state/effect 와 동일)
 */
export function useAIBattle({
  scenario,
  initialValue,
  currentTurn,
  currentDay,
  holdings,
  cash,
  liveProfitRate,
  showDaySummary,
  showMiniReport,
  dailyUserDecisions,
  setStockCompareResults,
}: UseAIBattleArgs) {
  // AI 갭 피드백 상태
  const [showAIGapFeedback, setShowAIGapFeedback] = useState(false)
  const [lastWaveAnalysis, setLastWaveAnalysis] = useState<WaveAnalysis | undefined>(undefined)
  // 게임 전체 누적 선택 타임라인 (최종 리포트용)
  const [decisionTimeline, setDecisionTimeline] = useState<StockCompareResult[]>([])

  const competitor = useAICompetitor(initialValue)
  const { simulateDayTrades, calcTotalValue: calcAITotalValue, calcBestAITotalValue } = competitor

  // 하루 요약 또는 미니 리포트 표시 시 AI 시뮬레이션 자동 실행
  useEffect(() => {
    if ((showDaySummary || showMiniReport) && scenario) {
      const result = simulateDayTrades(scenario.stocks as any, currentTurn, holdings, cash, currentDay, liveProfitRate, dailyUserDecisions)
      if (result?.waveAnalysis) {
        setLastWaveAnalysis(result.waveAnalysis)
        setShowAIGapFeedback(true)
      }
      if (result?.stockCompareResults && result.stockCompareResults.length > 0) {
        setStockCompareResults(result.stockCompareResults)
        // 누적 타임라인에 day/turn 포함하여 추가
        const stamped = result.stockCompareResults.map((r) => ({
          ...r,
          day: r.day ?? currentDay,
          turn: r.turn ?? currentTurn,
        }))
        setDecisionTimeline((prev) => [...prev, ...stamped])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDaySummary, showMiniReport])

  const aiTotalValue = scenario ? calcAITotalValue(scenario.stocks as any, currentTurn) : initialValue
  const bestAITotalValue = scenario ? calcBestAITotalValue(scenario.stocks as any, currentTurn) : initialValue
  const aiProfitRate = scenario ? Number((((aiTotalValue - initialValue) / initialValue) * 100).toFixed(1)) : 0
  const bestAIProfitRate = scenario ? Number((((bestAITotalValue - initialValue) / initialValue) * 100).toFixed(1)) : 0

  return {
    ...competitor,
    showAIGapFeedback,
    setShowAIGapFeedback,
    lastWaveAnalysis,
    decisionTimeline,
    aiTotalValue,
    bestAITotalValue,
    aiProfitRate,
    bestAIProfitRate,
  }
}
