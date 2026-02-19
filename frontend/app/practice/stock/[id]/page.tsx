"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import scenariosData from "@/data/game-scenarios.json"
import scenarios100DaysData from "@/data/stock-100days-data.json"
import { cn } from "@/lib/utils"
import { storage } from "@/lib/storage"
import { AIRankingCard, AIRankingDetailModal, AINotification } from "@/components/ai-ranking-card"
import { HintModal } from "@/components/hint-modal"
import { EnhancedReportModal } from "@/components/enhanced-report-modal"
import { ItemsShopModal, OwnedItemsBadge } from "@/components/items-shop-modal"
import aiCompetitorsData from "@/data/ai-competitors.json"

// ── 분리된 컴포넌트 import ─────────────────────────────────────
import {
  GameHeader,
  StockListSection,
  ExitConfirmDialog,
  CardFeedbackOverlay,
  DaySummaryOverlay,
  WeeklyReportModal,
  LoadingScreen,
  ResultScreen,
  ProfitAnalysisModal,
  DetailView,
} from "./components"
import { useLivePrices } from "./components/hooks/useLivePrices"
import { generateHistory, generateAIStocks, generateRobotAutoStocks, CHARACTER_REACTIONS } from "./utils/stockDataUtils"
import { EXCHANGE_RATE, DECISIONS_PER_DAY, DECISION_TIMER_SECONDS, DAYS_PER_WEEK, TURNS_PER_DECISION, DAY_PHASES, DAY_NAMES, LABELS, SPEED_MODE_TURNS } from "./config"

export default function GamePlayPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const scenarioId = params.id as string
  const refreshParam = searchParams.get("refresh")
  const [viewMode, setViewMode] = useState<"list" | "detail" | "buy" | "sell">("list")
  const [currentTurn, setCurrentTurn] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [holdings, setHoldings] = useState<{ [key: string]: number }>({})
  const [averagePrices, setAveragePrices] = useState<{ [key: string]: number }>({})
  const [cash, setCash] = useState(1000000) // Will be updated from settings
  const [showResult, setShowResult] = useState(false)
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" | "neutral" } | null>(null)
  const [hearts, setHearts] = useState(5)
  const [selectedStockId, setSelectedStockId] = useState<string>("")
  const [chartPeriod, setChartPeriod] = useState<"1D" | "1W" | "1M" | "1Y">("1D")
  const [favorites, setFavorites] = useState<string[]>([])
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<"all" | "my" | "watch">("all")
  const [showDatePopup, setShowDatePopup] = useState(false)
  const [listDisplayMode, setListDisplayMode] = useState<"price" | "valuation">("price") // Added state for list display mode

  const [currencyMode, setCurrencyMode] = useState<"KRW" | "USD">("KRW")

  const [showWeeklyReport, setShowWeeklyReport] = useState(false)
  const [weeklyHistory, setWeeklyHistory] = useState<{ turn: number; value: number }[]>([])
  const [lastWeekValue, setLastWeekValue] = useState(0)
  const [gameSettings, setGameSettings] = useState<any>(null)

  const [tradingMode, setTradingMode] = useState<"price" | "percent">("percent")
  const [takeProfit, setTakeProfit] = useState<number | null>(null)
  const [stopLoss, setStopLoss] = useState<number | null>(null)
  const [pendingOrders, setPendingOrders] = useState<any[]>([])
  const [userLevel, setUserLevel] = useState(1)
  const [characterData, setCharacterData] = useState<any>(null)
  const [orderType, setOrderType] = useState<"market" | "conditional">("market")
  const [inputValue, setInputValue] = useState<string>("")
  const [showOrderTypeSheet, setShowOrderTypeSheet] = useState(false)

  // 새로운 기능 상태
  const [showAIRanking, setShowAIRanking] = useState(false)
  const [showAIRankingDetail, setShowAIRankingDetail] = useState(false)
  const [showHintModal, setShowHintModal] = useState(false)
  const [showItemsShop, setShowItemsShop] = useState(false)
  const [showEnhancedReport, setShowEnhancedReport] = useState(false)
  const [hintLevel, setHintLevel] = useState<1 | 2>(1)
  const [userPoints, setUserPoints] = useState(99999) // 무료 버전: 포인트 무제한
  const [ownedItems, setOwnedItems] = useState<string[]>([])
  const [aiNotification, setAiNotification] = useState<{
    isVisible: boolean
    aiName: string
    action: "buy" | "sell"
    stockName: string
    price: number
  }>({
    isVisible: false,
    aiName: "",
    action: "buy",
    stockName: "",
    price: 0,
  })

  // 카드 기반 결정 시스템 상태
  const [decisionTimer, setDecisionTimer] = useState(DECISION_TIMER_SECONDS)
  const [currentPhaseInDay, setCurrentPhaseInDay] = useState(0) // 0=오전, 1=점심, 2=저녁
  const [currentDay, setCurrentDay] = useState(1)
  const [dailyStockIds, setDailyStockIds] = useState<string[]>([])
  const [isWaitingForDecision, setIsWaitingForDecision] = useState(false)
  const [showCardFeedback, setShowCardFeedback] = useState(false)
  const [cardFeedbackData, setCardFeedbackData] = useState<{
    type: "buy" | "sell" | "skip" | "timeout"
    emoji: string
    message: string
    priceChange?: string
  } | null>(null)
  const [showDaySummary, setShowDaySummary] = useState(false)
  const [totalDecisions, setTotalDecisions] = useState(0)
  const [showQuickTrade, setShowQuickTrade] = useState<"buy" | "sell" | null>(null)
  const [tradeQuantity, setTradeQuantity] = useState(1)
  const [showProfitAnalysis, setShowProfitAnalysis] = useState(false)
  const [isTimerPaused, setIsTimerPaused] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [stockViewTab, setStockViewTab] = useState<"현재가" | "평가금">("현재가")

  // 시나리오 데이터 선택 및 확장
  const allScenarios = [...scenariosData.scenarios, scenarios100DaysData]
  const rawScenario = allScenarios.find((s) => s.id === scenarioId)
  
  // 스프린트/스탠다드/마라톤 모드에 필요한 최소 턴 수 계산
  const requiredTurns = useMemo(() => {
    const speedMode = gameSettings?.speedMode
    
    // 모드별 필요 턴 수 (여유있게)
    if (speedMode === "sprint") return 30 // 스프린트: 1개월 = ~22 결정 → 30턴
    if (speedMode === "standard") return 100 // 스탠다드: 3개월 = ~33 결정 → 100턴
    if (speedMode === "marathon") return 200 // 마라톤: 12개월 = ~60 결정 → 200턴
    
    // gameSettings가 없거나 speedMode가 없으면 100턴 (기본)
    return 100
  }, [gameSettings?.speedMode])

  // 시나리오 데이터 자동 확장 + 추가 주식 생성
  const scenario = useMemo(() => {
    if (!rawScenario) return null
    
    const currentTurns = rawScenario.totalTurns || 10
    
    const extendedScenario = { ...rawScenario }
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
      let currentDate = new Date(year, month - 1, day)
      
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
    
    // AI 주식 10개 추가
    const aiStocks = generateAIStocks(10, 50000, extendedScenario.totalTurns)
    extendedStocks = [...extendedStocks, ...aiStocks]
    
    // 로봇/자동차 주식 10개 추가
    const robotAutoStocks = generateRobotAutoStocks(10, 30000, extendedScenario.totalTurns)
    extendedStocks = [...extendedStocks, ...robotAutoStocks]
    
    extendedScenario.stocks = extendedStocks
    
    console.log("✅ 시나리오 확장 완료:", { 
      totalTurns: extendedScenario.totalTurns,
      totalStocksCount: extendedStocks.length,
      originalStocks: rawScenario.stocks.length,
      aiStocks: aiStocks.length,
      robotAutoStocks: robotAutoStocks.length,
    })
    
    return extendedScenario
  }, [rawScenario, requiredTurns])
  
  console.log("🎮 시나리오 로드:", {
    scenarioId,
    found: !!scenario,
    title: scenario?.title || (scenario as any)?.name,
    totalTurns: scenario?.totalTurns,
    stocksCount: scenario?.stocks?.length,
  })

  // localStorage에서 데이터를 로드하는 함수 (JSON API 형식)
  const loadSessionData = useCallback(() => {
    console.log("=== 세션 데이터 로드 시작 ===")
    console.log("시나리오 ID:", scenarioId)
    
    // 로딩 시작 (자동 저장 일시 중지)
    setPauseAutoSave(true)
    setIsInitialLoad(true)
    
    const savedSessionWrapper = storage.getGameSession(scenarioId)
    const settings = storage.getGameSettings()
    setGameSettings(settings)

    // JSON API 응답 형식에서 data 추출
    const savedSession = savedSessionWrapper?.data || savedSessionWrapper

    console.log("불러온 세션 데이터:", savedSession)
    console.log("holdings 상세:", savedSession?.holdings)
    console.log("holdings 키 목록:", Object.keys(savedSession?.holdings || {}))
    console.log("cash 상세:", savedSession?.cash)

    if (savedSession && Object.keys(savedSession).length > 0) {
      const newHoldings = savedSession.holdings || {}
      const newAveragePrices = savedSession.averagePrices || {}
      const newCash = savedSession.cash !== undefined ? savedSession.cash : (settings?.initialCash || 1000000)
      
      console.log("적용할 데이터:", {
        holdings: newHoldings,
        holdingsCount: Object.keys(newHoldings).length,
        holdingsKeys: Object.keys(newHoldings),
        averagePrices: newAveragePrices,
        cash: newCash,
      })

      // 턴이 최대값을 초과하지 않도록 체크 (1일 = 4턴)
      const settingsDuration = settings?.duration ? settings.duration * 30 * DECISIONS_PER_DAY : null
      const scenarioTurns = scenario?.totalTurns || 10
      const maxTurns = settingsDuration || scenarioTurns
      const safeTurn = Math.min(savedSession.currentTurn || 0, maxTurns - 1)
      console.log("🔄 턴 설정:", { 
        saved: savedSession.currentTurn, 
        max: maxTurns, 
        safe: safeTurn,
        settingsDuration,
        scenarioTurns 
      })
      setCurrentTurn(safeTurn)
      setHoldings(newHoldings)
      setAveragePrices(newAveragePrices)
      setCash(newCash)
      setPendingOrders(savedSession.pendingOrders || [])
      setWeeklyHistory(savedSession.weeklyHistory || [])
      setLastWeekValue(savedSession.lastWeekValue || 0)
      
      // isPlaying 상태 복원 (저장된 값이 있어도 강제로 true로 시작하여 자동 진행 보장)
      // const savedIsPlaying = savedSession.isPlaying !== undefined ? savedSession.isPlaying : true
      console.log("▶️ 세션 로드됨 - 자동 시작")
      setIsPlaying(true)
      
      // selectedStockId 복원 또는 기본값 설정
      if (savedSession.selectedStockId) {
        console.log("📍 저장된 주식 ID 복원:", savedSession.selectedStockId)
        setSelectedStockId(savedSession.selectedStockId)
      } else if (scenario && scenario.stocks && scenario.stocks.length > 0) {
        console.log("📍 첫 번째 주식 자동 선택:", scenario.stocks[0].id)
        setSelectedStockId(scenario.stocks[0].id)
      }
      
      console.log("✅ 세션 적용 완료")
      console.log("적용된 holdings:", newHoldings)
      console.log("적용된 holdings 키:", Object.keys(newHoldings))
      
      if (savedSession.feedback) {
        setFeedback(savedSession.feedback)
      }
    } else {
      console.log("새 세션 시작")
      const initialCash = settings?.initialCash || 1000000
      console.log("초기 자금:", initialCash)
      setCash(initialCash)
      setHoldings({})
      setAveragePrices({})
      setCurrentTurn(0)
      
      // 새 세션은 자동으로 시작
      console.log("▶️ 새 세션 자동 시작")
      setIsPlaying(true)
      
      // 새 세션 시작 시 첫 번째 주식 선택
      if (scenario && scenario.stocks && scenario.stocks.length > 0) {
        console.log("📍 새 세션 - 첫 번째 주식 선택:", scenario.stocks[0].id)
        setSelectedStockId(scenario.stocks[0].id)
      }
    }
    
    console.log("=== 세션 데이터 로드 완료 ===")
    
    // 로딩 완료 후 자동 저장 재개 및 자동 시작
    setTimeout(() => {
      console.log("자동 저장 재개")
      setIsInitialLoad(false)
      setPauseAutoSave(false)
      
      // 로드 완료 후 isPlaying 상태 확인 및 로그
      console.log("🎮 로드 완료 - isPlaying 상태 확인")
    }, 200)
  }, [scenarioId, scenario])

  useEffect(() => {
    loadSessionData()
  }, [loadSessionData, refreshParam]) // refreshParam이 변경될 때마다 다시 로드

  // 페이지에 돌아올 때마다 localStorage 데이터 다시 로드
  useEffect(() => {
    const handleFocus = () => {
      console.log("페이지 포커스 - 데이터 다시 로드")
      loadSessionData()
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === `gameSession_${scenarioId}`) {
        console.log("localStorage 변경 감지 - 데이터 다시 로드")
        loadSessionData()
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("페이지 표시됨 - 데이터 다시 로드")
        loadSessionData()
      }
    }

    window.addEventListener("focus", handleFocus)
    window.addEventListener("storage", handleStorage)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("storage", handleStorage)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [loadSessionData, scenarioId])

  // 세션 자동 저장 제어
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [pauseAutoSave, setPauseAutoSave] = useState(false)

  useEffect(() => {
    // 초기 로드 완료 표시
    if (isInitialLoad) {
      setIsInitialLoad(false)
      return
    }

    // 자동 저장 일시 중지된 경우
    if (pauseAutoSave) {
      console.log("자동 저장 일시 중지됨")
      return
    }

    if (!scenario) return

    console.log("자동 저장 실행:", { holdings, cash, holdingsCount: Object.keys(holdings).length })
    
    const session = {
      currentTurn,
      holdings,
      averagePrices,
      cash,
      pendingOrders,
      weeklyHistory,
      lastWeekValue,
      selectedStockId,
      isPlaying, // 재생 상태 저장
    }
    storage.setGameSession(scenarioId, session)
  }, [
    currentTurn,
    holdings,
    averagePrices,
    cash,
    pendingOrders,
    weeklyHistory,
    lastWeekValue,
    selectedStockId,
    isPlaying,
    scenario,
    scenarioId,
    isInitialLoad,
    pauseAutoSave,
  ])

  const handleAction = useMemo(
    () =>
      (action: "buy" | "sell", qty: number = quantity, stockId: string = selectedStockId) => {
        console.log("=== handleAction: 거래 페이지로 이동 ===")
        console.log("현재 holdings:", holdings)
        console.log("현재 cash:", cash)
        
        // 자동 저장 일시 중지
        setPauseAutoSave(true)
        
        // 현재 상태 저장
        const session = {
          currentTurn,
          holdings,
          averagePrices,
          cash,
          pendingOrders,
          weeklyHistory,
          lastWeekValue,
          selectedStockId: stockId,
          isPlaying, // 재생 상태도 저장
        }
        
        console.log("거래 페이지로 이동 전 저장:", session)
        storage.setGameSession(scenarioId, session)
        
        // 저장 확인
        const saved = storage.getGameSession(scenarioId)
        const savedData = saved?.data || saved
        console.log("저장 확인 - holdings:", savedData?.holdings)
        
        router.push(`/practice/stock/${scenarioId}/trade?type=${action}`)
      },
    [
      currentTurn,
      holdings,
      averagePrices,
      cash,
      pendingOrders,
      weeklyHistory,
      lastWeekValue,
      selectedStockId,
      isPlaying,
      scenarioId,
      router,
    ],
  ) // Add all relevant dependencies

  const stocksByCategory = useMemo(() => {
    if (!scenario) return {}
    const groups: { [key: string]: typeof scenario.stocks } = {}
    scenario.stocks.forEach((stock) => {
      const category = stock.category || "기타"
      if (!groups[category]) groups[category] = []
      groups[category].push(stock)
    })
    return groups
  }, [scenario])

  const myStocksByCategory = useMemo(() => {
    const myStocks = scenario?.stocks.filter((s) => (holdings[s.id] || 0) > 0) || []
    const groups: { [key: string]: typeof scenario.stocks } = {}
    myStocks.forEach((stock) => {
      const category = stock.category || "기타"
      if (!groups[category]) groups[category] = []
      groups[category].push(stock)
    })
    return groups
  }, [scenario, holdings])

  const myStocks = useMemo(() => {
    const stocks = scenario?.stocks.filter((s) => {
      const qty = holdings[s.id] || 0
      if (qty > 0) {
        console.log(`보유 주식: ${s.id} (${s.name}) - ${qty}주`)
      }
      return qty > 0
    }) || []
    
    console.log("내 주식 목록 계산:", {
      총개수: stocks.length,
      holdings: holdings,
      holdingsKeys: Object.keys(holdings),
      주식목록: stocks.map(s => ({ id: s.id, name: s.name, qty: holdings[s.id] }))
    })
    
    return stocks
  }, [scenario, holdings])

  const watchStocks = scenario?.stocks.filter((s) => favorites.includes(s.id)) || []

  // Initialize selected stock but keep view in list mode initially
  useEffect(() => {
    if (scenario && scenario.stocks.length > 0 && !selectedStockId) {
      console.log("📍 초기 주식 선택:", scenario.stocks[0].id, scenario.stocks[0].name)
      setSelectedStockId(scenario.stocks[0].id)
    }
  }, [scenario, selectedStockId])

  useEffect(() => {
    if (feedback) {
      console.log("피드백 표시:", feedback)
      const timer = setTimeout(() => {
        console.log("피드백 숨김")
        setFeedback(null)
      }, 3000) // 3초로 연장
      return () => clearTimeout(timer)
    }
  }, [feedback])

  useEffect(() => {
    setQuantity(1)
    setInputValue("") // Reset input value
    setOrderType("market") // Reset order type
  }, [selectedStockId, viewMode]) // Reset quantity when changing stock or view mode

  // 하루 투자 기회 주식 생성
  const generateDailyStocks = useCallback(() => {
    if (!scenario || !scenario.stocks || scenario.stocks.length === 0) return
    const stockIds = scenario.stocks.map(s => s.id)
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
  }, [scenario])

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
      setCurrentTurn(prev => Math.min(prev + TURNS_PER_DECISION, maxTurns - 1))
      if (dailyStockIds[nextPhase]) {
        setSelectedStockId(dailyStockIds[nextPhase])
      }
    } else {
      // 하루 끝 → 하루 요약 표시
      setCurrentTurn(prev => Math.min(prev + TURNS_PER_DECISION, maxTurns - 1))
      const nextDay = currentDay + 1
      
      // 주간 리포트 체크 (7일마다)
      if (currentDay % DAYS_PER_WEEK === 0) {
        setIsPlaying(false)
        setShowWeeklyReport(true)
        setCurrentDay(nextDay)
        return
      }

      // 게임 종료 체크
      if (currentTurn + TURNS_PER_DECISION >= maxTurns - 1) {
        setIsPlaying(false)
        setTimeout(() => setShowResult(true), 500)
        return
      }

      // 하루 요약 표시 (2초간)
      setShowDaySummary(true)
      setTimeout(() => {
        setShowDaySummary(false)
        setCurrentDay(nextDay)
        // 새 날 투자 기회 생성
        if (scenario && scenario.stocks.length > 0) {
          const stockIds = scenario.stocks.map(s => s.id)
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
      }, 2000)
    }
  }, [currentPhaseInDay, currentDay, dailyStockIds, scenario, currentTurn])

  // 30초 결정 타이머
  useEffect(() => {
    if (!isWaitingForDecision || showCardFeedback || showDaySummary || showResult || showQuickTrade || isTimerPaused) return

    const timer = setInterval(() => {
      setDecisionTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          const reactions = CHARACTER_REACTIONS.timeout
          const emoji = reactions[Math.floor(Math.random() * reactions.length)]
          setIsWaitingForDecision(false)
          setShowCardFeedback(true)
          setCardFeedbackData({
            type: "timeout",
            emoji,
            message: "시간 초과! 자동 건너뛰기",
          })
          setTotalDecisions(d => d + 1)
          setTimeout(() => advanceToNext(), 1500)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isWaitingForDecision, showCardFeedback, showDaySummary, showResult, showQuickTrade, isTimerPaused, advanceToNext])

  useEffect(() => {
    if (!scenario) return

    const currentStockValue = scenario.stocks.reduce((acc, stock) => {
      const stockPrice = stock.turns[currentTurn]?.price || 0
      const stockHoldings = holdings[stock.id] || 0
      return acc + stockPrice * stockHoldings
    }, 0)

    const currentValue = cash + currentStockValue

    setWeeklyHistory((prev) => [...prev, { turn: currentTurn, value: currentValue }])
  }, [currentTurn, cash, holdings, scenario])

  useEffect(() => {
    if (pendingOrders.length > 0 && currentTurn > 0 && scenario) {
      const newPendingOrders = [...pendingOrders]
      const executedIndices: number[] = []

      newPendingOrders.forEach((order, index) => {
        const stock = scenario.stocks.find((s) => s.id === order.stockId)
        if (!stock) return

        const currentPrice = stock.turns[currentTurn]?.price
        if (!currentPrice) return

        let executed = false
        let shouldExecute = false

        if (order.type === "sell") {
          // 판매 조건 확인
          if (order.condition === "ge" && currentPrice >= order.targetPrice) {
            shouldExecute = true
          } else if (order.condition === "le" && currentPrice <= order.targetPrice) {
            shouldExecute = true
          }

          if (shouldExecute) {
            // 판매 실행
            const currentHoldings = holdings[order.stockId] || 0
            if (currentHoldings >= order.quantity) {
              const revenue = order.quantity * currentPrice
              setCash((prev) => prev + revenue)
              setHoldings((prev) => {
                const newHoldings = { ...prev }
                newHoldings[order.stockId] = (newHoldings[order.stockId] || 0) - order.quantity
                if (newHoldings[order.stockId] === 0) {
                  delete newHoldings[order.stockId]
                }
                return newHoldings
              })
              setAveragePrices((prev) => {
                const newAvgPrices = { ...prev }
                if (holdings[order.stockId] - order.quantity === 0) {
                  delete newAvgPrices[order.stockId]
                }
                return newAvgPrices
              })
              setFeedback({ text: `${stock.name} ${order.quantity}주 판매 완료`, type: "success" })
              executed = true
            }
          }
        } else if (order.type === "buy") {
          // 구매 조건 확인
          if (order.condition === "le" && currentPrice <= order.targetPrice) {
            shouldExecute = true
          } else if (order.condition === "ge" && currentPrice >= order.targetPrice) {
            shouldExecute = true
          }

          if (shouldExecute) {
            // 구매 실행
            const cost = order.quantity * currentPrice
            if (cash >= cost) {
              const oldQty = holdings[order.stockId] || 0
              const oldAvg = averagePrices[order.stockId] || 0
              const newAvg = oldQty > 0 ? (oldQty * oldAvg + cost) / (oldQty + order.quantity) : currentPrice

              setCash((prev) => prev - cost)
              setHoldings((prev) => ({
                ...prev,
                [order.stockId]: (prev[order.stockId] || 0) + order.quantity,
              }))
              setAveragePrices((prev) => ({
                ...prev,
                [order.stockId]: newAvg,
              }))
              setFeedback({ text: `${stock.name} ${order.quantity}주 구매 완료`, type: "success" })
              executed = true
            }
          }
        }

        if (executed) {
          executedIndices.push(index)
        }
      })

      if (executedIndices.length > 0) {
        // 실행된 주문 제거
        const remainingOrders = newPendingOrders.filter((_, i) => !executedIndices.includes(i))
        setPendingOrders(remainingOrders)
      }
    }
  }, [currentTurn, pendingOrders, scenario, cash, holdings, averagePrices])

  useEffect(() => {
    const settings = storage.getGameSettings()
    if (settings) {
      setGameSettings(settings)
      setCash(settings.initialCash)
      setLastWeekValue(settings.initialCash)
    } else {
      // 기본 설정 생성 (backend 없이도 동작)
      const defaultSettings = {
        initialCash: 1000000,
        duration: 3, // 3개월
        speedMode: "standard" as const,
        dailyOpportunities: 3,
        timerSeconds: 30,
        simulationMonths: 3,
      }
      console.log("⚙️ 기본 설정 사용:", defaultSettings)
      setGameSettings(defaultSettings)
      setCash(defaultSettings.initialCash)
      setLastWeekValue(defaultSettings.initialCash)
      // 기본 설정 저장
      storage.setGameSettings(defaultSettings)
    }
    
    // Get user level from storage
    const character = storage.getCharacter()
    if (character) {
      setUserLevel(character.level || 1)
      setCharacterData(character)
    } else {
      // 기본 캐릭터 생성
      const defaultCharacter = {
        name: "플레이어",
        level: 1,
        exp: 0,
        hearts: 5,
        maxHearts: 5,
        streak: 0,
        bestStreak: 0,
        combo: 0,
        bestCombo: 0,
        badges: [],
        investorDNA: null,
        crisisGrade: "F",
        totalDecisions: 0,
        correctDecisions: 0,
        lastPlayedAt: new Date().toISOString(),
      }
      console.log("👤 기본 캐릭터 생성:", defaultCharacter)
      setCharacterData(defaultCharacter)
      storage.setCharacter(defaultCharacter)
    }
  }, [])

  // currentStock을 useMemo로 최적화하여 주기적으로 업데이트
  const currentStock = useMemo(() => {
    if (!scenario || !scenario.stocks || !selectedStockId) {
      console.log("⚠️ currentStock 계산 실패:", { 
        hasScenario: !!scenario, 
        stocksCount: scenario?.stocks?.length,
        selectedStockId 
      })
      return undefined
    }
    const stock = scenario.stocks.find((s) => s.id === selectedStockId)
    console.log("🔄 currentStock 업데이트:", { 
      stockId: selectedStockId, 
      stockName: stock?.name,
      found: !!stock,
      turnsAvailable: stock?.turns?.length 
    })
    return stock
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
  
  console.log("📊 현재 데이터:", {
    scenarioId,
    selectedStockId,
    currentStock: currentStock?.name,
    currentTurn,
    maxValidIndex: (currentStock?.turns?.length || 0) - 1,
    turnData: turnData ? { date: turnData.date, price: turnData.price } : null,
    totalTurns: currentStock?.turns?.length,
    isIndexValid: currentTurn < (currentStock?.turns?.length || 0),
  })

  const currentPrice = turnData?.price || 0
  const currentHoldings = holdings[selectedStockId] || 0
  const currentAvgPrice = averagePrices[selectedStockId] || 0

  const prevPrice =
    currentTurn > 0 && currentStock ? currentStock.turns[currentTurn - 1].price : currentStock?.initialPrice || 0
  const change = currentPrice && prevPrice ? (((currentPrice - prevPrice) / prevPrice) * 100).toFixed(1) : "0.0"
  const isUp = Number.parseFloat(change) >= 0

  const totalStockValue =
    scenario?.stocks.reduce((acc, stock) => {
      const stockPrice = stock.turns[currentTurn]?.price || 0
      const stockHoldings = holdings[stock.id] || 0
      return acc + stockPrice * stockHoldings
    }, 0) || 0

  const totalValue = Math.round(cash + totalStockValue)
  const initialValue = gameSettings ? gameSettings.initialCash : 1000000
  const profitRate = Number.parseFloat((((totalValue - initialValue) / initialValue) * 100).toFixed(1))

  // 전체 주식 리스트 데이터 (page 레벨로 호이스팅 → useLivePrices 공유)
  const allStocksData = useMemo(() => {
    if (!scenario) return []
    return scenario.stocks.map(stock => {
      const turnData = stock.turns?.[currentTurn]
      const currentPrice = turnData?.price || stock.initialPrice || 0
      const prevPrice = currentTurn > 0
        ? (stock.turns?.[currentTurn - 1]?.price || stock.initialPrice || 0)
        : (stock.initialPrice || 0)
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

  const currentWeekValue = totalValue
  const weeklyReturn =
    lastWeekValue > 0 ? Number.parseFloat((((currentWeekValue - lastWeekValue) / lastWeekValue) * 100).toFixed(1)) : 0

  const handleCloseReport = () => {
    setLastWeekValue(currentWeekValue)
    setShowWeeklyReport(false)
    setIsPlaying(true)
    // 주간 리포트 후 새로운 날 시작
    generateDailyStocks()
  }

  // 자유 거래 핸들러 (매수/매도/건너뛰기)
  const handleDecision = useCallback((action: "buy" | "sell" | "skip", qty: number = 1, targetStockId?: string) => {
    const stockId = targetStockId || selectedStockId
    const stock = scenario?.stocks.find(s => s.id === stockId)
    if (!stock) return
    
    const price = stock.turns[currentTurn]?.price || stock.initialPrice

    if (action === "buy") {
      const cost = qty * price
      if (cash >= cost) {
        const oldQty = holdings[stockId] || 0
        const oldAvg = averagePrices[stockId] || 0
        const newAvg = oldQty > 0 ? (oldQty * oldAvg + cost) / (oldQty + qty) : price

        setCash(prev => prev - cost)
        setHoldings(prev => ({ ...prev, [stockId]: (prev[stockId] || 0) + qty }))
        setAveragePrices(prev => ({ ...prev, [stockId]: newAvg }))

        setFeedback({ 
          text: `${stock.name} ${qty}주 매수 (${cost.toLocaleString()}원)`, 
          type: "success" 
        })
      }
    } else if (action === "sell") {
      const currentQty = holdings[stockId] || 0
      const sellQty = Math.min(qty, currentQty)
      if (sellQty > 0) {
        const revenue = sellQty * price
        const avgPrice = averagePrices[stockId] || price
        const profit = (price - avgPrice) * sellQty
        const profitPct = avgPrice > 0 ? (((price - avgPrice) / avgPrice) * 100).toFixed(1) : "0"

        setCash(prev => prev + revenue)
        setHoldings(prev => {
          const newH = { ...prev, [stockId]: (prev[stockId] || 0) - sellQty }
          if (newH[stockId] <= 0) delete newH[stockId]
          return newH
        })
        if ((holdings[stockId] || 0) - sellQty <= 0) {
          setAveragePrices(prev => {
            const newA = { ...prev }
            delete newA[stockId]
            return newA
          })
        }

        setFeedback({ 
          text: `${stock.name} ${sellQty}주 매도 (${profit >= 0 ? "+" : ""}${profit.toLocaleString()}원)`, 
          type: profit >= 0 ? "success" : "neutral" 
        })
      }
    } else if (action === "skip") {
      // 건너뛰기 (다음 시간으로)
      setIsWaitingForDecision(false)
      const reactions = CHARACTER_REACTIONS.skip
      const emoji = reactions[Math.floor(Math.random() * reactions.length)]
      setShowCardFeedback(true)
      setCardFeedbackData({
        type: "skip",
        emoji,
        message: "다음 시간으로",
      })
      setTotalDecisions(d => d + 1)
      setTimeout(() => advanceToNext(), 1000)
    }
  }, [scenario, currentTurn, cash, holdings, averagePrices, selectedStockId, isWaitingForDecision, advanceToNext])

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

  // Add conditional order logic
  const addConditionalOrder = (type: "buy" | "sell", targetPrice: number, condition: "ge" | "le") => {
    setPendingOrders((prev) => [
      ...prev,
      {
        stockId: selectedStockId,
        type,
        targetPrice,
        condition,
        quantity: quantity, // Use current quantity
      },
    ])
    setFeedback({ text: "예약 주문이 설정되었습니다", type: "success" })
    setViewMode("detail") // Go back to detail view after setting order
  }

  const toggleFavorite = (stockId: string) => {
    setFavorites((prev) => (prev.includes(stockId) ? prev.filter((id) => id !== stockId) : [...prev, stockId]))
  }

  // 로딩 화면 - 필수 데이터만 체크
  if (!scenario || !selectedStockId || !currentStock) {
    const loadingReason = !scenario ? "시나리오 로드 중" :
                          !selectedStockId ? "주식 선택 중" :
                          !currentStock ? "주식 데이터 로드 중" : "알 수 없음"
    console.log("⏳ 로딩 중:", { reason: loadingReason, scenarioId, selectedStockId, currentTurn })
    return <LoadingScreen reason={loadingReason} />
  }

  if (showResult) {
    return <ResultScreen profitRate={profitRate} onGoHome={() => (window.location.href = "/home")} />
  }

  // --- 자유 거래 VIEW (메인 게임 화면) ---
  if (viewMode === "list") {
    // 타이머 프로그레스
    const timerProgress = decisionTimer / DECISION_TIMER_SECONDS
    
    // 카테고리별 그룹화 (allStocksData는 useMemo로 컴포넌트 레벨에서 관리)
    const stocksByCategory = allStocksData.reduce((acc, stock) => {
      const category = (stock as any).category || "기타"
      if (!acc[category]) acc[category] = []
      acc[category].push(stock)
      return acc
    }, {} as Record<string, typeof allStocksData>)

    return (
      <div className="min-h-screen bg-[#191919] text-white flex flex-col">
        {/* 결정 피드백 오버레이 */}
        <CardFeedbackOverlay isVisible={showCardFeedback} data={cardFeedbackData} />

        {/* 하루 요약 오버레이 */}
        <DaySummaryOverlay
          isVisible={showDaySummary}
          currentDay={currentDay}
          currentDayName={currentDayName}
          totalValue={totalValue}
          profitRate={profitRate}
        />

        {/* 주간 리포트 모달 */}
        <WeeklyReportModal
          isOpen={showWeeklyReport}
          onClose={handleCloseReport}
          weekNumber={currentWeekNumber}
          weeklyReturn={weeklyReturn}
          totalReturn={profitRate}
          chartData={weeklyHistory.slice(-(DAYS_PER_WEEK * DECISIONS_PER_DAY))}
        />

        {/* 게임 헤더 (타이머 + 총 자산 + 종료 버튼) */}
        <GameHeader
          currentDay={currentDay}
          totalDays={totalDays}
          currentDayName={currentDayName}
          currentDayPhase={currentDayPhase}
          currentWeekNumber={currentWeekNumber}
          totalValue={liveTotalValue}
          profitRate={liveProfitRate}
          decisionTimer={decisionTimer}
          totalDecisions={totalDecisions}
          remainingDecisions={Math.max(0, totalDays * DECISIONS_PER_DAY - totalDecisions)}
          isTimerPaused={isTimerPaused}
          isWaitingForDecision={isWaitingForDecision && !showQuickTrade}
          onTogglePause={() => setIsTimerPaused(prev => !prev)}
          onExitClick={() => setShowExitConfirm(true)}
          onProfitClick={() => setShowProfitAnalysis(true)}
        />

        {/* 종료 확인 다이얼로그 */}
        <ExitConfirmDialog
          isOpen={showExitConfirm}
          onCancel={() => setShowExitConfirm(false)}
          onConfirm={() => router.push("/home")}
        />

        {/* 자유 거래 타임 - 주식 리스트 */}
        {isWaitingForDecision && !showQuickTrade && (
          <StockListSection
            allStocksData={allStocksData as any}
            currentTurn={currentTurn}
            favorites={favorites}
            stockViewTab={stockViewTab}
            livePrices={livePrices}
            tickUps={tickUps}
            onChangeViewTab={setStockViewTab}
            onSelectStock={(id) => { setSelectedStockId(id); setViewMode("detail") }}
            onToggleFavorite={toggleFavorite}
            onDecision={handleDecision}
          />
        )}

        {/* 수익 분석 모달 */}
        {showProfitAnalysis && (
          <ProfitAnalysisModal
            scenarioId={scenarioId}
            currentDay={currentDay}
            currentPrices={livePrices}
            holdings={holdings}
            averagePrices={averagePrices}
            onClose={() => setShowProfitAnalysis(false)}
          />
        )}

        {/* 대기 중 */}
        {!isWaitingForDecision && !showCardFeedback && !showDaySummary && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center animate-pulse">
              <div className="text-4xl mb-3">🎯</div>
              <div className="text-gray-400 font-medium">다음 시간대 준비 중...</div>
            </div>
          </div>
        )}


      </div>
    )
  }

  // --- DETAIL VIEW ---
  if (viewMode === "detail") {
    const myAvg = averagePrices[selectedStockId] || 0
    const myReturn = myAvg > 0 ? (((currentPrice - myAvg) / myAvg) * 100).toFixed(1) : "0.0"
    const isProfit = Number.parseFloat(myReturn) >= 0

    return (
      <DetailView
        stockName={currentStock.name}
        currentPrice={currentPrice}
        prevPrice={prevPrice}
        change={change}
        isUp={isUp}
        currentHoldings={currentHoldings}
        myAvg={myAvg}
        myReturn={myReturn}
        isProfit={isProfit}
        chartData={chartData}
        chartPeriod={chartPeriod}
        onChartPeriodChange={setChartPeriod}
        cash={cash}
        selectedStockId={selectedStockId}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        showDatePopup={showDatePopup}
        turnDate={turnData?.date || ""}
        currentDayNumber={currentDayNumber}
        currentWeekNumber={currentWeekNumber}
        currentDayName={currentDayName}
        currentDayPhase={currentDayPhase}
        isPlaying={isPlaying}
        showWeeklyReport={showWeeklyReport}
        weeklyReturn={weeklyReturn}
        profitRate={profitRate}
        weeklyHistory={weeklyHistory}
        onCloseReport={handleCloseReport}
        feedback={feedback}
        pendingOrders={pendingOrders}
        onCancelOrder={(order) => {
          const idx = pendingOrders.findIndex((o) => o === order)
          if (idx > -1) {
            const next = [...pendingOrders]
            next.splice(idx, 1)
            setPendingOrders(next)
          }
        }}
        onBack={() => setViewMode("list")}
        onBuy={() => handleAction("buy")}
        onSell={() => handleAction("sell")}
        onShowHint={() => { setHintLevel(2); setShowHintModal(true) }}
      />
    )
  }

  // <TradingView type={type} /> is now rendered in a separate page routed to by handleAction
  // The following component is a placeholder for when the trade page is not yet implemented, or as a general trade interface.
  // We will redirect to a separate trade page instead of rendering it here.

  // Removed the TradingView component as it is no longer rendered directly in this page.
  // The logic for buying and selling now redirects to a separate trade page.

  return null // Should not reach here
}
