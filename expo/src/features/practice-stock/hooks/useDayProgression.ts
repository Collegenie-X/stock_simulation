import { useCallback, useEffect, useState } from "react"
import {
  AI_REPORT_INTERVAL,
  WEEKS_PER_MONTH,
  DECISIONS_PER_DAY,
  DECISION_TIMER_SECONDS,
  TURNS_PER_DECISION,
} from "../config"
import type { CardFeedbackData } from "../types"
import type { StockCompareResult, UserDayDecision } from "./useAICompetitor"
import type { GameSessionState } from "./useGameSession"
import type { GameScenario } from "./useScenario"

interface UseDayProgressionArgs {
  scenario: GameScenario | null
  session: GameSessionState
  /** 화면이 포커스 상태일 때만 타이머 진행 (웹에서는 페이지 이동 시 언마운트되어 타이머가 멈춤) */
  isFocused: boolean
}

/**
 * 카드 기반 결정 시스템 — 결정 타이머, 시간대/일차 진행, 리포트 표시 흐름
 * (웹 page.tsx 의 generateDailyStocks / advanceToNext / 타이머 effect / 리포트 닫기 핸들러와 동일)
 */
export function useDayProgression({ scenario, session, isFocused }: UseDayProgressionArgs) {
  const { currentTurn, setCurrentTurn, setIsPlaying, setSelectedStockId, setLastWeekValue } = session

  const [showResult, setShowResult] = useState(false)
  const [showWeeklyReport, setShowWeeklyReport] = useState(false)

  const [decisionTimer, setDecisionTimer] = useState(DECISION_TIMER_SECONDS)
  const [currentPhaseInDay, setCurrentPhaseInDay] = useState(0) // 0=오전, 1=점심, 2=저녁
  const [currentDay, setCurrentDay] = useState(1)
  const [dailyStockIds, setDailyStockIds] = useState<string[]>([])
  const [isWaitingForDecision, setIsWaitingForDecision] = useState(false)
  const [showCardFeedback, setShowCardFeedback] = useState(false)
  const [cardFeedbackData, setCardFeedbackData] = useState<CardFeedbackData | null>(null)
  const [showDaySummary, setShowDaySummary] = useState(false)
  const [showMiniReport, setShowMiniReport] = useState(false)
  const [reportKind, setReportKind] = useState<"week" | "month">("week")
  /** 하루가 끝날 때마다 1씩 오른다 — AI 가 매일 장을 마감하게 하는 신호 */
  const [dayEndTick, setDayEndTick] = useState(0)
  const [showFinalReport, setShowFinalReport] = useState(false)
  const [pendingNextDay, setPendingNextDay] = useState<number | null>(null)
  const [totalDecisions, setTotalDecisions] = useState(0)
  const [showQuickTrade, setShowQuickTrade] = useState<"buy" | "sell" | null>(null)
  const [tradeQuantity, setTradeQuantity] = useState(1)
  const [isTimerPaused, setIsTimerPaused] = useState(false)
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false)

  // 하루 사용자 결정 기록 (종목별 매수/매도/관망)
  const [dailyUserDecisions, setDailyUserDecisions] = useState<UserDayDecision[]>([])
  // 종목별 3자 비교 결과 (하루 요약에서 표시)
  const [stockCompareResults, setStockCompareResults] = useState<StockCompareResult[]>([])

  // 하루 투자 기회 주식 생성
  const generateDailyStocks = useCallback(() => {
    if (!scenario || !scenario.stocks || scenario.stocks.length === 0) return
    const stockIds = scenario.stocks.map((s) => s.id)
    const shuffled = [...stockIds].sort(() => Math.random() - 0.5)
    const daily = shuffled.slice(0, Math.min(DECISIONS_PER_DAY, shuffled.length))
    // 부족한 경우 반복
    while (daily.length < DECISIONS_PER_DAY) {
      daily.push(stockIds[Math.floor(Math.random() * stockIds.length)])
    }
    setDailyStockIds(daily)
    setCurrentPhaseInDay(0)
    setDecisionTimer(DECISION_TIMER_SECONDS)
    setIsTimerPaused(false)
    setIsWaitingForDecision(true)
    setShowQuickTrade(null)
    setTradeQuantity(1)
    // 선택된 주식 업데이트
    setSelectedStockId(daily[0])
  }, [scenario, setSelectedStockId])

  // 게임 시작 시 첫 날 기회 생성
  useEffect(() => {
    if (scenario && scenario.stocks.length > 0 && dailyStockIds.length === 0 && !showResult) {
      generateDailyStocks()
    }
  }, [scenario, dailyStockIds.length, showResult, generateDailyStocks])

  // 다음 기회로 이동하는 함수 (timer보다 먼저 선언)
  const advanceToNext = useCallback(() => {
    setShowCardFeedback(false)
    setCardFeedbackData(null)
    setShowQuickTrade(null)
    setTradeQuantity(1)

    const maxTurns = scenario?.totalTurns || 10

    if (currentPhaseInDay + 1 < DECISIONS_PER_DAY) {
      // 같은 날 다음 시간대
      const nextPhase = currentPhaseInDay + 1
      setCurrentPhaseInDay(nextPhase)
      setDecisionTimer(DECISION_TIMER_SECONDS)
      setIsTimerPaused(false)
      setIsWaitingForDecision(true)
      setCurrentTurn((prev) => Math.min(prev + TURNS_PER_DECISION, maxTurns - 1))
      if (dailyStockIds[nextPhase]) {
        setSelectedStockId(dailyStockIds[nextPhase])
      }
    } else {
      // 하루 끝 → 하루 요약 표시
      setCurrentTurn((prev) => Math.min(prev + TURNS_PER_DECISION, maxTurns - 1))
      const nextDay = currentDay + 1

      // 게임 종료 체크 — 마지막 날은 주간 리포트 없이 바로 최종 리포트
      if (currentTurn + TURNS_PER_DECISION >= maxTurns - 1) {
        setIsPlaying(false)
        setTimeout(() => setShowFinalReport(true), 500)
        return
      }

      setDayEndTick((t) => t + 1)

      // 일주일마다 주간 리포트, 4주마다 월간 리포트 (수동 닫기)
      if (currentDay % AI_REPORT_INTERVAL === 0) {
        setReportKind((currentDay / AI_REPORT_INTERVAL) % WEEKS_PER_MONTH === 0 ? "month" : "week")
        setShowMiniReport(true)
        setPendingNextDay(nextDay)
      } else {
        // 리포트 없는 날: 바로 다음 날로 진행
        setCurrentDay(nextDay)
        if (scenario && scenario.stocks.length > 0) {
          const stockIds = scenario.stocks.map((s) => s.id)
          const shuffled = [...stockIds].sort(() => Math.random() - 0.5)
          const daily = shuffled.slice(0, Math.min(DECISIONS_PER_DAY, shuffled.length))
          while (daily.length < DECISIONS_PER_DAY) {
            daily.push(stockIds[Math.floor(Math.random() * stockIds.length)])
          }
          setDailyStockIds(daily)
          setCurrentPhaseInDay(0)
          setDecisionTimer(DECISION_TIMER_SECONDS)
          setIsTimerPaused(false)
          setIsWaitingForDecision(true)
          setSelectedStockId(daily[0])
        }
      }
    }
  }, [currentPhaseInDay, currentDay, dailyStockIds, scenario, currentTurn, setCurrentTurn, setIsPlaying, setSelectedStockId])

  // 30초 결정 타이머
  useEffect(() => {
    if (
      !isFocused ||
      !isWaitingForDecision ||
      showCardFeedback ||
      showDaySummary ||
      showMiniReport ||
      showResult ||
      showFinalReport ||
      showQuickTrade ||
      isTimerPaused
    )
      return

    const timer = setInterval(() => {
      setDecisionTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsWaitingForDecision(false)
          setTotalDecisions((d) => d + 1)
          setShowTimeoutDialog(true)
          setTimeout(() => {
            setShowTimeoutDialog(false)
            advanceToNext()
          }, 1000)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [
    isFocused,
    isWaitingForDecision,
    showCardFeedback,
    showDaySummary,
    showMiniReport,
    showResult,
    showFinalReport,
    showQuickTrade,
    isTimerPaused,
    advanceToNext,
  ])

  // 다음 날 시작 (하루 요약 / 미니 리포트 공통)
  const startNextDay = useCallback(() => {
    setDailyUserDecisions([])
    setStockCompareResults([])
    const nextDay = pendingNextDay ?? currentDay + 1
    setPendingNextDay(null)
    setCurrentDay(nextDay)
    if (scenario && scenario.stocks.length > 0) {
      const stockIds = scenario.stocks.map((s) => s.id)
      const shuffled = [...stockIds].sort(() => Math.random() - 0.5)
      const daily = shuffled.slice(0, Math.min(DECISIONS_PER_DAY, shuffled.length))
      while (daily.length < DECISIONS_PER_DAY) {
        daily.push(stockIds[Math.floor(Math.random() * stockIds.length)])
      }
      setDailyStockIds(daily)
      setCurrentPhaseInDay(0)
      setDecisionTimer(DECISION_TIMER_SECONDS)
      setIsTimerPaused(false)
      setIsWaitingForDecision(true)
      setSelectedStockId(daily[0])
    }
  }, [pendingNextDay, currentDay, scenario, setSelectedStockId])

  // 하루 요약 수동 닫기 → 다음 날 시작
  const handleDaySummaryContinue = useCallback(() => {
    setShowDaySummary(false)
    startNextDay()
  }, [startNextDay])

  // 주간·월간 리포트 닫기 → 이번 주 시작 값을 기록하고 다음 날 시작
  const handleMiniReportContinue = useCallback(
    (currentWeekValue?: number) => {
      if (currentWeekValue !== undefined) setLastWeekValue(currentWeekValue)
      setShowMiniReport(false)
      startNextDay()
    },
    [startNextDay, setLastWeekValue],
  )

  // 주간 리포트 닫기
  const handleCloseReport = useCallback(
    (currentWeekValue: number) => {
      setLastWeekValue(currentWeekValue)
      setShowWeeklyReport(false)
      setIsPlaying(true)
      generateDailyStocks()
    },
    [generateDailyStocks, setIsPlaying, setLastWeekValue],
  )

  return {
    showResult,
    setShowResult,
    showWeeklyReport,
    decisionTimer,
    currentPhaseInDay,
    currentDay,
    dailyStockIds,
    isWaitingForDecision,
    setIsWaitingForDecision,
    showCardFeedback,
    setShowCardFeedback,
    cardFeedbackData,
    setCardFeedbackData,
    showDaySummary,
    showMiniReport,
    reportKind,
    dayEndTick,
    showFinalReport,
    totalDecisions,
    setTotalDecisions,
    showQuickTrade,
    setShowQuickTrade,
    tradeQuantity,
    setTradeQuantity,
    isTimerPaused,
    setIsTimerPaused,
    showTimeoutDialog,
    dailyUserDecisions,
    setDailyUserDecisions,
    stockCompareResults,
    setStockCompareResults,
    generateDailyStocks,
    advanceToNext,
    handleDaySummaryContinue,
    handleMiniReportContinue,
    handleCloseReport,
  }
}

export type DayProgressionState = ReturnType<typeof useDayProgression>
