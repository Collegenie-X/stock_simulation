"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation" // added useRouter, useSearchParams
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Heart,
  ChevronRight,
  Bell,
  Play,
  Pause,
  PieChart,
  Search,
  ArrowUpDown,
  LineChart,
  MoreHorizontal,
  CandlestickChart,
} from "lucide-react"
import scenariosData from "@/data/game-scenarios.json"
// import { StockChart } from "@/components/stock-chart" // Removed as it's defined below
import { cn } from "@/lib/utils"
// Added XAxis, YAxis, Tooltip
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceDot, Label } from "recharts" // Added ReferenceDot, Label
import { storage } from "@/lib/storage"

// Mock data generator for history
const generateHistory = (initialPrice: number, days: number) => {
  let currentPrice = initialPrice
  const history = []
  for (let i = days; i > 0; i--) {
    const change = (Math.random() - 0.5) * 0.05 // +/- 2.5%
    currentPrice = currentPrice * (1 + change)
    history.push({
      date: `D-${i}`,
      price: Math.round(currentPrice),
      index: -i,
    })
  }
  return history
}

const MiniChart = ({ data, color, isUp }: { data: any[]; color: string; isUp: boolean }) => (
  <div className="h-10 w-14 shrink-0 mr-3" style={{ minHeight: "40px", minWidth: "56px" }}>
    <ResponsiveContainer width="100%" height="100%" minHeight={40} minWidth={56}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`colorGradient-${isUp ? "up" : "down"}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={2}
          fill={`url(#gradient-${isUp ? "up" : "down"})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
)

const EXCHANGE_RATE = 1300

const renderStockItem = (
  stock: any,
  currentTurn: number,
  holdings: any,
  averagePrices: any,
  setSelectedStockId: any,
  setViewMode: any,
  currencyMode: "KRW" | "USD",
  listDisplayMode: "price" | "valuation" = "price", // Added listDisplayMode parameter
) => {
  const sPrice = stock.turns[currentTurn].price
  const sPrevPrice = currentTurn > 0 ? stock.turns[currentTurn - 1].price : stock.initialPrice
  const sChange = (((sPrice - sPrevPrice) / sPrevPrice) * 100).toFixed(1)
  const isUp = Number.parseFloat(sChange) >= 0
  const myQty = holdings[stock.id] || 0
  const myAvg = averagePrices[stock.id] || 0

  let displayValue = sPrice
  let subText = stock.category
  const changeText = `${isUp ? "+" : ""}${sChange}%`
  const changeColorClass = isUp ? "text-red-500" : "text-blue-500"

  let rightBottomText = changeText
  let rightBottomClass = changeColorClass

  if (myQty > 0) {
    const avgPrice = currencyMode === "USD" ? myAvg / EXCHANGE_RATE : myAvg

    if (listDisplayMode === "valuation") {
      // Valuation Mode Logic
      displayValue = sPrice * myQty // Total Value
      subText = `${myQty}주` // Quantity as subtext

      const profit = (sPrice - myAvg) * myQty
      const profitRate = myAvg > 0 ? ((sPrice - myAvg) / myAvg) * 100 : 0
      const isProfit = profit >= 0

      // Format profit text for bottom right
      const profitValue = currencyMode === "USD" ? profit / EXCHANGE_RATE : profit
      rightBottomText = `${isProfit ? "+" : ""}${Math.round(profitValue).toLocaleString()}${currencyMode === "USD" ? "$" : "원"} (${profitRate.toFixed(1)}%)`
      rightBottomClass = isProfit ? "text-red-500" : "text-blue-500"
    } else {
      // Price Mode Logic (Default)
      subText = `내 평균 ${Math.round(avgPrice).toLocaleString()}${currencyMode === "USD" ? "$" : "원"}`
    }
  }

  if (currencyMode === "USD") {
    displayValue = displayValue / EXCHANGE_RATE
  }

  const historyNeeded = 20
  let chartData = []

  if (currentTurn < historyNeeded) {
    const startPrice = stock.initialPrice
    for (let i = historyNeeded - currentTurn; i > 0; i--) {
      chartData.push({ price: startPrice * (1 + (Math.random() - 0.5) * 0.02) })
    }
  }

  const recentTurns = stock.turns.slice(Math.max(0, currentTurn - historyNeeded), currentTurn + 1)
  chartData = [...chartData, ...recentTurns.map((t: any) => ({ price: t.price }))]

  return (
    <div
      key={stock.id}
      onClick={() => {
        setSelectedStockId(stock.id)
        setViewMode("detail")
      }}
      className="flex items-center justify-between py-4 px-3 mb-2 bg-[#252525] hover:bg-[#2a2a2a] active:scale-[0.98] transition-all cursor-pointer rounded-xl border border-gray-800 shadow-sm"
    >
      <div className="flex items-center min-w-0 flex-1">
        <MiniChart data={chartData} color={isUp ? "#ef4444" : "#3b82f6"} isUp={isUp} />

        <div className="min-w-0 flex-1 pr-2">
          <div className="font-bold text-gray-100 truncate text-[15px]">{stock.name}</div>
          <div className="text-xs text-gray-500 truncate mt-0.5">{subText}</div>
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="font-bold text-gray-100 text-[15px]">
          {currencyMode === "USD" ? "$" : ""}
          {displayValue.toLocaleString(undefined, { maximumFractionDigits: currencyMode === "USD" ? 2 : 0 })}
          {currencyMode === "KRW" ? "원" : ""}
        </div>
        <div className={cn("text-xs font-medium mt-0.5", rightBottomClass)}>{rightBottomText}</div>
      </div>
    </div>
  )
}

const WeeklyReportModal = ({
  isOpen,
  onClose,
  weekNumber,
  weeklyReturn,
  totalReturn,
  chartData,
}: {
  isOpen: boolean
  onClose: () => void
  weekNumber: number
  weeklyReturn: number
  totalReturn: number
  chartData: any[]
}) => {
  if (!isOpen) return null

  const isProfit = weeklyReturn >= 0

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-in fade-in duration-300">
      <div className="bg-[#1E1E1E] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-gray-800 animate-in zoom-in-95 duration-300">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">주간 리포트</h2>
              <p className="text-gray-400 text-sm">{weekNumber}주차 투자 분석</p>
            </div>
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-2xl",
                isProfit ? "bg-red-500/20" : "bg-blue-500/20",
              )}
            >
              {isProfit ? "🔥" : "💧"}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded-2xl p-4">
              <p className="text-gray-400 text-xs mb-1">주간 수익률</p>
              <p className={cn("text-xl font-bold", isProfit ? "text-red-500" : "text-blue-500")}>
                {isProfit ? "+" : ""}
                {weeklyReturn}%
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-2xl p-4">
              <p className="text-gray-400 text-xs mb-1">누적 수익률</p>
              <p className={cn("text-xl font-bold", totalReturn >= 0 ? "text-red-500" : "text-blue-500")}>
                {totalReturn >= 0 ? "+" : ""}
                {totalReturn}%
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-300 mb-3">자산 흐름도</h3>
            <div className="h-48 bg-gray-800/30 rounded-2xl p-2 border border-gray-800/50">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="reportGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isProfit ? "#ef4444" : "#3b82f6"} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={isProfit ? "#ef4444" : "#3b82f6"} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={isProfit ? "#ef4444" : "#3b82f6"}
                    strokeWidth={3}
                    fill="url(#reportGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <Button
            onClick={onClose}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg"
          >
            다음 주차 시작하기
          </Button>
        </div>
      </div>
    </div>
  )
}

const StockChart = ({
  data,
  height = 200,
  color = "red",
  dataKey = "price",
  showXAxis = false,
}: {
  data: any[]
  height?: number
  color?: "red" | "blue"
  dataKey?: string
  showXAxis?: boolean
}) => {
  const colorMap = {
    red: "#F04452", // Toss Red
    blue: "#3182F6", // Toss Blue
  }

  const chartColor = colorMap[color]
  const gradientId = `gradient-${color}-${Math.random().toString(36).substr(2, 9)}`

  const { min, max, maxPoint, minPoint } = useMemo(() => {
    if (!data || data.length === 0) return { min: 0, max: 0, maxPoint: null, minPoint: null }
    const values = data.map((d: any) => d[dataKey])
    const minVal = Math.min(...values)
    const maxVal = Math.max(...values)
    const padding = (maxVal - minVal) * 0.3

    const maxPoint = data.find((d) => d[dataKey] === maxVal)
    const minPoint = data.find((d) => d[dataKey] === minVal)

    return {
      min: Math.floor(minVal - padding),
      max: Math.ceil(maxVal + padding),
      maxPoint,
      minPoint,
    }
  }, [data, dataKey])

  return (
    <div className="w-full select-none" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColor} stopOpacity={0.4} />
              <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={[min, max]} />
          <XAxis dataKey="index" hide />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-gray-900/90 backdrop-blur border border-gray-700 text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-xl">
                    {Number(payload[0].value).toLocaleString()}원
                  </div>
                )
              }
              return null
            }}
            cursor={{ stroke: chartColor, strokeWidth: 1, strokeDasharray: "4 4" }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={chartColor}
            strokeWidth={3}
            fill={`url(#${gradientId})`}
            animationDuration={1000}
            isAnimationActive={true}
          />
          {maxPoint && (
            <ReferenceDot x={maxPoint.index} y={maxPoint.price} r={4} fill={chartColor} stroke="white" strokeWidth={2}>
              <Label
                content={({ viewBox }: any) => {
                  const { x, y } = viewBox
                  return (
                    <text x={x} y={y - 10} fill="#F04452" fontSize={12} textAnchor="middle" fontWeight="bold">
                      최고 {maxPoint.price.toLocaleString()}원
                    </text>
                  )
                }}
              />
            </ReferenceDot>
          )}
          {minPoint && (
            <ReferenceDot x={minPoint.index} y={minPoint.price} r={4} fill={chartColor} stroke="white" strokeWidth={2}>
              <Label
                content={({ viewBox }: any) => {
                  const { x, y } = viewBox
                  return (
                    <text x={x} y={y + 20} fill="#3182F6" fontSize={12} textAnchor="middle" fontWeight="bold">
                      최저 {minPoint.price.toLocaleString()}원
                    </text>
                  )
                }}
              />
            </ReferenceDot>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

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
  // Changed 3M to 1Y
  const [chartPeriod, setChartPeriod] = useState<"1D" | "1W" | "1M" | "1Y">("1M")
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
  const [orderType, setOrderType] = useState<"market" | "conditional">("market")
  const [inputValue, setInputValue] = useState<string>("")
  const [showOrderTypeSheet, setShowOrderTypeSheet] = useState(false)

  const scenario = scenariosData.scenarios.find((s) => s.id === scenarioId)

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

      setCurrentTurn(savedSession.currentTurn || 0)
      setHoldings(newHoldings)
      setAveragePrices(newAveragePrices)
      setCash(newCash)
      setPendingOrders(savedSession.pendingOrders || [])
      setWeeklyHistory(savedSession.weeklyHistory || [])
      setLastWeekValue(savedSession.lastWeekValue || 0)
      
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
    }
    
    console.log("=== 세션 데이터 로드 완료 ===")
    
    // 로딩 완료 후 자동 저장 재개
    setTimeout(() => {
      console.log("자동 저장 재개")
      setIsInitialLoad(false)
      setPauseAutoSave(false)
    }, 200)
  }, [scenarioId])

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

  useEffect(() => {
    let interval: NodeJS.Timeout
    const maxTurns = gameSettings ? gameSettings.duration * 20 : scenario?.totalTurns || 60 // Use settings for duration (approx 20 days/month)

    if (isPlaying && !showResult && scenario && currentTurn < maxTurns - 1 && !showWeeklyReport) {
      interval = setInterval(() => {
        setCurrentTurn((prev) => prev + 1)
      }, 60000) // 1 minute per day
    } else if (currentTurn >= maxTurns - 1) {
      setIsPlaying(false)
      setTimeout(() => setShowResult(true), 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, currentTurn, scenario, showResult, showWeeklyReport, gameSettings])

  useEffect(() => {
    if (currentTurn > 0 && currentTurn % 5 === 0) {
      setIsPlaying(false)
      setShowWeeklyReport(true)
    }
  }, [currentTurn])

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
    }
    // Get user level from storage
    const character = storage.getCharacter()
    if (character) {
      setUserLevel(character.level || 1)
    }
  }, [])

  const currentStock = scenario?.stocks.find((s) => s.id === selectedStockId)
  const turnData = currentStock?.turns[currentTurn]

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

  const totalValue = cash + totalStockValue
  const initialValue = gameSettings ? gameSettings.initialCash : 1000000
  const profitRate = Number.parseFloat((((totalValue - initialValue) / initialValue) * 100).toFixed(1))

  const currentWeekValue = totalValue
  const weeklyReturn =
    lastWeekValue > 0 ? Number.parseFloat((((currentWeekValue - lastWeekValue) / lastWeekValue) * 100).toFixed(1)) : 0

  const handleCloseReport = () => {
    setLastWeekValue(currentWeekValue)
    setShowWeeklyReport(false)
    setIsPlaying(true)
  }

  const chartData = useMemo(() => {
    if (!currentStock) return []

    const history = generateHistory(currentStock.initialPrice, 365) // Generate 1 year history
    const gameData = currentStock.turns.slice(0, currentTurn + 1).map((t, idx) => ({
      index: idx,
      price: t.price,
      date: t.date,
    }))

    const fullData = [...history, ...gameData]

    switch (chartPeriod) {
      case "1D":
        return fullData.slice(-20) // Approx 1 day in game minutes
      case "1W":
        return fullData.slice(-100) // Approx 1 week
      case "1M":
        return fullData.slice(-400) // Approx 1 month
      case "1Y":
        return fullData // Full history
      default:
        return fullData.slice(-400)
    }
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

  const DatePopup = () =>
    showDatePopup && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 pointer-events-none">
        <div className="flex flex-col items-center animate-in zoom-in-50 duration-500">
          <div className="text-2xl text-gray-300 mb-2 font-medium">Today is</div>
          <div className="text-6xl md:text-8xl font-bold text-white tracking-tight drop-shadow-2xl">
            {turnData.date}
          </div>
        </div>
      </div>
    )

  if (!scenario || !selectedStockId || !currentStock || !turnData) return null

  if (showResult) {
    return (
      <div className="min-h-screen bg-[#191919] flex flex-col items-center justify-center p-6 text-center text-white">
        <div
          className={`w-32 h-32 rounded-full flex items-center justify-center text-7xl mb-6 shadow-2xl ${
            profitRate > 0 ? "bg-red-500/20 animate-bounce" : "bg-blue-500/20"
          }`}
        >
          {profitRate > 0 ? "🏆" : "💪"}
        </div>
        <h2 className="text-3xl font-bold mb-2">게임 종료!</h2>
        <p className="text-gray-400 font-medium mb-8">
          최종 수익률: <span className={profitRate > 0 ? "text-red-500" : "text-blue-500"}>{profitRate}%</span>
        </p>
        <Button
          className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-2xl"
          onClick={() => (window.location.href = "/")}
        >
          홈으로 돌아가기
        </Button>
      </div>
    )
  }

  // --- LIST VIEW ---
  if (viewMode === "list") {
    let content
    if (activeTab === "my") {
      content = (
        <div className="space-y-6">
          {myStocks.length === 0 ? (
            <div className="text-center py-10 text-gray-500">보유한 주식이 없습니다.</div>
          ) : (
            Object.entries(myStocksByCategory).map(([category, stocks]) => (
              <div key={category} className="space-y-2">
                <h3 className="text-sm font-medium text-gray-400 px-2 flex items-center gap-2">
                  <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                  {category}
                </h3>
                <div className="px-1">
                  {stocks.map((stock) =>
                    renderStockItem(
                      stock,
                      currentTurn,
                      holdings,
                      averagePrices,
                      setSelectedStockId,
                      setViewMode,
                      currencyMode,
                      listDisplayMode, // Pass listDisplayMode
                    ),
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )
    } else if (activeTab === "watch") {
      content = (
        <div className="space-y-1 px-1">
          {watchStocks.length === 0 ? (
            <div className="text-center py-10 text-gray-500">관심 주식이 없습니다.</div>
          ) : (
            watchStocks.map((stock) =>
              renderStockItem(
                stock,
                currentTurn,
                holdings,
                averagePrices,
                setSelectedStockId,
                setViewMode,
                currencyMode,
                "price", // Pass "price" explicitly for watch tab
              ),
            )
          )}
        </div>
      )
    } else {
      // Home tab: My Stocks (if any) + All Stocks Grouped
      content = (
        <div className="space-y-8">
          {myStocks.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-gray-200 px-1">내 주식</h2>
              {Object.entries(myStocksByCategory).map(([category, stocks]) => (
                <div key={category} className="mb-4 last:mb-0">
                  <h3 className="text-xs font-medium text-gray-500 px-2 mb-1">{category}</h3>
                  <div className="px-1">
                    {stocks.map((stock) =>
                      renderStockItem(
                        stock,
                        currentTurn,
                        holdings,
                        averagePrices,
                        setSelectedStockId,
                        setViewMode,
                        currencyMode,
                        "valuation", // Force "valuation" mode for My Stocks section in Home tab
                      ),
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-200 px-1">전체 주식</h2>
            {Object.entries(stocksByCategory).map(([category, stocks]) => (
              <div key={category} className="space-y-2">
                <h3 className="text-sm font-medium text-gray-400 px-2 flex items-center gap-2">
                  <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                  {category}
                </h3>
                <div className="px-1">
                  {stocks.map((stock) =>
                    renderStockItem(
                      stock,
                      currentTurn,
                      holdings,
                      averagePrices,
                      setSelectedStockId,
                      setViewMode,
                      currencyMode,
                      "price", // Force "price" mode for Home tab
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-[#191919] text-white pb-32">
        <DatePopup />

        {/* 거래 완료 피드백 토스트 */}
        {feedback && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[150] animate-in slide-in-from-top duration-300">
            <div
              className={cn(
                "px-6 py-4 rounded-2xl shadow-2xl border-2 backdrop-blur-md flex items-center gap-3 min-w-[280px]",
                feedback.type === "success"
                  ? "bg-green-500/20 border-green-500 text-green-100"
                  : feedback.type === "error"
                    ? "bg-red-500/20 border-red-500 text-red-100"
                    : "bg-blue-500/20 border-blue-500 text-blue-100",
              )}
            >
              <div className="text-3xl">
                {feedback.type === "success" ? "✅" : feedback.type === "error" ? "❌" : "ℹ️"}
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg">{feedback.text}</div>
                <div className="text-sm opacity-80">거래가 완료되었습니다</div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="px-5 py-4 sticky top-0 z-10 bg-[#191919]/95 backdrop-blur-sm border-b border-gray-800/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-bold">나스닥</span>
              <span className="text-red-500 font-bold">22,564.22 +0.5%</span>
            </div>
            <div className="flex gap-4">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <button className="flex items-center gap-1 text-gray-400 text-sm font-medium">
              순서 바꾸기 <ArrowUpDown className="w-3 h-3" />
            </button>

            <div className="flex items-center gap-2">
              {activeTab === "my" && (
                <div className="bg-gray-800 rounded-lg p-0.5 flex mr-2">
                  <button
                    onClick={() => setListDisplayMode("price")}
                    className={cn(
                      "px-3 py-1.5 text-xs font-bold rounded-md transition-colors",
                      listDisplayMode === "price" ? "bg-gray-600 text-white" : "text-gray-400",
                    )}
                  >
                    현재가
                  </button>
                  <button
                    onClick={() => setListDisplayMode("valuation")}
                    className={cn(
                      "px-3 py-1.5 text-xs font-bold rounded-md transition-colors",
                      listDisplayMode === "valuation" ? "bg-gray-600 text-white" : "text-gray-400",
                    )}
                  >
                    평가금
                  </button>
                </div>
              )}

              <div className="bg-gray-800 rounded-lg p-0.5 flex">
                <button
                  onClick={() => setCurrencyMode("USD")}
                  className={cn(
                    "px-3 py-1.5 text-xs font-bold rounded-md transition-colors",
                    currencyMode === "USD" ? "bg-gray-600 text-white" : "text-gray-400",
                  )}
                >
                  $
                </button>
                <button
                  onClick={() => setCurrencyMode("KRW")}
                  className={cn(
                    "px-3 py-1.5 text-xs font-bold rounded-md transition-colors",
                    currencyMode === "KRW" ? "bg-gray-600 text-white" : "text-gray-400",
                  )}
                >
                  원
                </button>
              </div>
            </div>
          </div>

          {activeTab !== "watch" && activeTab !== "all" && (
            <>
              {pendingOrders.length > 0 && (
                <div className="mb-6">
                  <button
                    onClick={() => router.push(`/practice/stock/${scenarioId}/orders`)}
                    className="bg-[#1E3E3E] hover:bg-[#264f4f] transition-colors rounded-2xl px-4 py-3 flex items-center justify-between w-full group"
                  >
                    <div className="text-left">
                      <div className="text-[#4CD9C0] text-sm font-bold mb-0.5">대기 중인 주문</div>
                      <div className="text-[#4CD9C0] text-lg font-bold">조건부 주문 {pendingOrders.length}건</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#4CD9C0] group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}

              <div className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-400 font-medium">내 자산</span>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </div>
                <h1 className="text-3xl font-bold mb-1">
                  {currencyMode === "USD" ? "$" : ""}
                  {(currencyMode === "USD" ? totalValue / EXCHANGE_RATE : totalValue).toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                  {currencyMode === "KRW" ? "원" : ""}
                </h1>
                <div
                  className={cn(
                    "text-sm font-medium flex items-center gap-1",
                    profitRate >= 0 ? "text-red-500" : "text-blue-500",
                  )}
                >
                  {profitRate >= 0 ? "+" : ""}
                  {profitRate}% ({profitRate >= 0 ? "+" : ""}
                  {(totalValue - initialValue).toLocaleString()}원)
                </div>
              </div>
            </>
          )}

          <div className="flex items-center justify-between mt-4 bg-gray-800/30 p-2 rounded-xl">
            <span className="text-sm font-mono text-gray-300 ml-2">{turnData.date}</span>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={cn(
                "px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold transition-colors",
                isPlaying ? "bg-gray-700 text-gray-300" : "bg-blue-500 text-white",
              )}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3 h-3 fill-current" /> 일시정지
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" /> 재생
                </>
              )}
            </button>
          </div>
        </div>

        <div className="px-5 mt-4">
          {content}

          {activeTab !== "watch" && activeTab !== "all" && (
            <div className="mt-8 space-y-1 border-t border-gray-800 pt-4">
              <div className="flex items-center justify-between py-4 px-2 hover:bg-gray-800/30 cursor-pointer">
                <span className="font-bold text-gray-300">주문내역</span>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  이번 달 99건 <ChevronRight className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-center justify-between py-4 px-2 hover:bg-gray-800/30 cursor-pointer">
                <span className="font-bold text-gray-300">판매수익</span>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  이번 달 +395,146원 <ChevronRight className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-center justify-between py-4 px-2 hover:bg-gray-800/30 cursor-pointer">
                <span className="font-bold text-gray-300">배당금</span>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  이번 달 740원 <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              <div className="pt-4 flex justify-center">
                <button className="flex items-center gap-1 text-gray-400 font-medium text-sm hover:text-white transition-colors">
                  수익분석 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-[360px] px-4">
          <div className="bg-[#252525]/90 backdrop-blur-md rounded-[32px] px-2 py-2 flex items-center justify-between shadow-2xl border border-gray-800/50 h-[72px]">
            {/* Back Button */}
            <button
              onClick={() => router.push("/")}
              className="w-12 h-12 rounded-full bg-[#333] flex items-center justify-center text-gray-300 hover:bg-[#444] hover:text-white transition-colors shrink-0 ml-1"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            {/* Tabs */}
            <div className="flex items-center justify-around flex-1 ml-2 gap-1">
              <button
                onClick={() => setActiveTab("all")}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors w-14",
                  activeTab === "all" ? "text-white" : "text-gray-500",
                )}
              >
                <LineChart className={cn("w-6 h-6", activeTab === "all" && "fill-current")} />
                <span className="text-[10px] font-bold">증권</span>
              </button>

              <button
                onClick={() => setActiveTab("watch")}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors w-14",
                  activeTab === "watch" ? "text-white" : "text-gray-500",
                )}
              >
                <Heart className={cn("w-6 h-6", activeTab === "watch" && "fill-current")} />
                <span className="text-[10px] font-bold">관심</span>
              </button>

              <button
                onClick={() => setActiveTab("my")}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors w-14",
                  activeTab === "my" ? "text-white" : "text-gray-500",
                )}
              >
                <PieChart className={cn("w-6 h-6", activeTab === "my" && "fill-current")} />
                <span className="text-[10px] font-bold">내 주식</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- DETAIL VIEW ---
  if (viewMode === "detail") {
    const myAvg = averagePrices[selectedStockId] || 0
    const myReturn = myAvg > 0 ? (((currentPrice - myAvg) / myAvg) * 100).toFixed(1) : "0.0"
    const isProfit = Number.parseFloat(myReturn) >= 0

    return (
      <div className="min-h-screen bg-[#191919] text-white flex flex-col pb-24">
        <DatePopup />

        {/* 거래 완료 피드백 토스트 */}
        {feedback && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[150] animate-in slide-in-from-top duration-300">
            <div
              className={cn(
                "px-6 py-4 rounded-2xl shadow-2xl border-2 backdrop-blur-md flex items-center gap-3 min-w-[280px]",
                feedback.type === "success"
                  ? "bg-green-500/20 border-green-500 text-green-100"
                  : feedback.type === "error"
                    ? "bg-red-500/20 border-red-500 text-red-100"
                    : "bg-blue-500/20 border-blue-500 text-blue-100",
              )}
            >
              <div className="text-3xl">
                {feedback.type === "success" ? "✅" : feedback.type === "error" ? "❌" : "ℹ️"}
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg">{feedback.text}</div>
                <div className="text-sm opacity-80">거래가 완료되었습니다</div>
              </div>
            </div>
          </div>
        )}

        <WeeklyReportModal
          isOpen={showWeeklyReport}
          onClose={handleCloseReport}
          weekNumber={Math.floor(currentTurn / 5)}
          weeklyReturn={weeklyReturn}
          totalReturn={profitRate}
          chartData={weeklyHistory.slice(-7)} // Show last 7 points
        />

        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between sticky top-0 bg-[#191919] z-10">
          <button onClick={() => setViewMode("list")} className="p-1">
            <ArrowLeft className="w-6 h-6 text-gray-300" />
          </button>
          <div className="flex gap-4">
            <Heart
              className={cn(
                "w-6 h-6 transition-colors",
                favorites.includes(selectedStockId) ? "text-red-500 fill-current" : "text-gray-400",
              )}
              onClick={() => toggleFavorite(selectedStockId)}
            />
            <Bell className="w-6 h-6 text-gray-400" />
            <MoreHorizontal className="w-6 h-6 text-gray-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Price Info */}
          <div className="px-5 pt-2 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="font-bold text-xl text-white">{currentStock.name}</div>
              <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center">
                <Search className="w-3 h-3 text-gray-400" />
              </div>
            </div>
            <div className="text-4xl font-bold mb-2">{currentPrice.toLocaleString()}원</div>
            <div className={cn("text-sm font-medium flex items-center gap-1", isUp ? "text-red-500" : "text-blue-500")}>
              어제보다 {isUp ? "+" : ""}
              {Math.abs(currentPrice - prevPrice).toLocaleString()}원 ({change}%)
            </div>
          </div>

          <div className="flex px-5 border-b border-gray-800 mb-6">
            {["차트", "호가", "내 주식", "종목정보", "커뮤니티"].map((tab) => (
              <button
                key={tab}
                className={cn(
                  "pb-3 mr-6 text-sm font-bold relative transition-colors",
                  tab === "차트" ? "text-white" : "text-gray-500",
                )}
              >
                {tab}
                {tab === "차트" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div className="h-[360px] w-full mb-4 relative">
            <StockChart data={chartData} height={360} color={isUp ? "red" : "blue"} showXAxis={chartPeriod !== "1D"} />
          </div>

          <div className="px-5 mb-8 flex items-center justify-between">
            <div className="flex-1 flex justify-between bg-gray-800/30 rounded-lg p-1 mr-4">
              {["1일", "1주", "3달", "1년"].map((period, idx) => {
                const periodMap: { [key: string]: string } = { "1일": "1D", "1주": "1W", "3달": "1M", "1년": "1Y" }
                const mappedPeriod = periodMap[period]
                const isActive = chartPeriod === mappedPeriod
                return (
                  <button
                    key={period}
                    onClick={() => setChartPeriod(mappedPeriod as any)}
                    className={cn(
                      "flex-1 py-1.5 text-sm font-medium rounded-md transition-all text-center",
                      isActive ? "bg-gray-700 text-white shadow-sm" : "text-gray-500 hover:text-gray-300",
                    )}
                  >
                    {period}
                  </button>
                )
              })}
            </div>
            <button className="w-9 h-9 rounded-lg bg-gray-800/30 flex items-center justify-center text-gray-400">
              <CandlestickChart className="w-5 h-5" />
            </button>
          </div>

          {/* My Investment Card */}
          {currentHoldings > 0 && (
            <div className="px-5 mb-6">
              <div className="bg-gray-800/50 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-200">내 주식</h3>
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">물타기 계산기</span>
                </div>
                <div className="grid grid-cols-2 gap-y-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">평가손익</div>
                    <div className={cn("font-bold", isProfit ? "text-red-500" : "text-blue-500")}>
                      {isProfit ? "+" : ""}
                      {((currentPrice - myAvg) * currentHoldings).toLocaleString()}원
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">수익률</div>
                    <div className={cn("text-bold", isProfit ? "text-red-500" : "text-blue-500")}>
                      {isProfit ? "+" : ""}
                      {myReturn}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">보유수량</div>
                    <div className="font-bold text-gray-200">{currentHoldings}주</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">매입금액</div>
                    <div className="font-bold text-gray-200">{(myAvg * currentHoldings).toLocaleString()}원</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {pendingOrders.filter((o) => o.stockId === selectedStockId).length > 0 && (
            <div className="px-5 mb-6">
              <h3 className="font-bold text-gray-200 mb-3">미체결 주문</h3>
              <div className="space-y-3">
                {pendingOrders
                  .filter((o) => o.stockId === selectedStockId)
                  .map((order, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-800/30 rounded-2xl p-4 border border-gray-800 flex justify-between items-center"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={cn(
                              "text-xs font-bold px-1.5 py-0.5 rounded",
                              order.type === "buy" ? "bg-red-500/20 text-red-500" : "bg-blue-500/20 text-blue-500",
                            )}
                          >
                            {order.type === "buy" ? "구매" : "판매"}
                          </span>
                          <span className="text-sm font-bold text-gray-300">
                            {order.condition === "ge" ? "이상" : "이하"} 조건
                          </span>
                        </div>
                        <div className="text-lg font-bold text-white">
                          {typeof order.targetPrice === "number" && order.targetPrice < 100 // Assuming percentage if small number, though logic in trade page uses raw numbers for percent too. Let's check context.
                            ? `${order.targetPrice > 0 ? "+" : ""}${order.targetPrice}% 도달 시`
                            : `${order.targetPrice.toLocaleString()}원 도달 시`}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const newOrders = [...pendingOrders]
                          const realIdx = pendingOrders.findIndex((o) => o === order)
                          if (realIdx > -1) {
                            newOrders.splice(realIdx, 1)
                            setPendingOrders(newOrders)
                          }
                        }}
                        className="text-xs bg-gray-700 text-gray-400 px-3 py-1.5 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-[#191919] border-t border-gray-800 p-4 pb-6 z-20">
          <div className="flex gap-3">
            <button
              onClick={() => handleAction("sell")}
              disabled={currentHoldings === 0}
              className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-2xl font-bold text-lg transition-colors"
            >
              판매하기
            </button>
            <button
              onClick={() => handleAction("buy")}
              disabled={cash < currentPrice}
              className="flex-1 h-14 bg-red-500 hover:bg-red-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-2xl font-bold text-lg transition-colors"
            >
              구매하기
            </button>
          </div>
        </div>
      </div>
    )
  }

  // <TradingView type={type} /> is now rendered in a separate page routed to by handleAction
  // The following component is a placeholder for when the trade page is not yet implemented, or as a general trade interface.
  // We will redirect to a separate trade page instead of rendering it here.

  // Removed the TradingView component as it is no longer rendered directly in this page.
  // The logic for buying and selling now redirects to a separate trade page.

  return null // Should not reach here
}
