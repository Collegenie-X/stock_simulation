"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation" // added useRouter, useSearchParams
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Heart,
  ChevronRight,
  Bell,
  PieChart,
  Search,
  ArrowUpDown,
  LineChart,
  MoreHorizontal,
  CandlestickChart,
} from "lucide-react"
import scenariosData from "@/data/game-scenarios.json"
import scenarios100DaysData from "@/data/stock-100days-data.json"
// import { StockChart } from "@/components/stock-chart" // Removed as it's defined below
import { cn } from "@/lib/utils"
// Added XAxis, YAxis, Tooltip
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceDot, Label } from "recharts" // Added ReferenceDot, Label
import { storage } from "@/lib/storage"
import { AIRankingCard, AIRankingDetailModal, AINotification } from "@/components/ai-ranking-card"
import { HintModal } from "@/components/hint-modal"
import { EnhancedReportModal } from "@/components/enhanced-report-modal"
import { ItemsShopModal, OwnedItemsBadge } from "@/components/items-shop-modal"
import aiCompetitorsData from "@/data/ai-competitors.json"

// Mock data generator for history
const generateHistory = (initialPrice: number, days: number) => {
  let currentPrice = initialPrice
  const history = []
  const today = new Date()
  for (let i = days; i > 0; i--) {
    const change = (Math.random() - 0.5) * 0.05 // +/- 2.5%
    currentPrice = currentPrice * (1 + change)
    const historyDate = new Date(today)
    historyDate.setDate(today.getDate() - i)
    const dateStr = `${historyDate.getFullYear()}-${String(historyDate.getMonth() + 1).padStart(2, '0')}-${String(historyDate.getDate()).padStart(2, '0')}`
    history.push({
      date: dateStr,
      price: Math.round(currentPrice),
      index: -i,
    })
  }
  return history
}

const MiniChart = ({ 
  data, 
  color, 
  isUp, 
  weekNumber = 0 
}: { 
  data: any[]
  color: string
  isUp: boolean
  weekNumber?: number 
}) => {
  // Y축 범위 계산 (가격 변화가 잘 보이도록)
  const prices = data.map(d => d.price).filter(p => p > 0)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const padding = (maxPrice - minPrice) * 0.2 || maxPrice * 0.05 // 최소 5% 여유
  const yMin = Math.floor(minPrice - padding)
  const yMax = Math.ceil(maxPrice + padding)
  
  const strokeWidth = 2
  const gradientId = `colorGradient-${isUp ? "up" : "down"}-${Math.random().toString(36).substr(2, 9)}`
  
  return (
    <div className="h-12 w-16 shrink-0 mr-3 relative" style={{ minHeight: "48px", minWidth: "64px" }}>
      <ResponsiveContainer width="100%" height="100%" minHeight={48} minWidth={64}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="index" hide />
          <YAxis hide domain={[yMin, yMax]} />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={strokeWidth}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

const EXCHANGE_RATE = 1300
const DECISIONS_PER_DAY = 3 // 하루 3번 투자 기회 (오전/점심/저녁)
const DECISION_TIMER_SECONDS = 30 // 결정 제한시간 30초
const DAYS_PER_WEEK = 7
const DAY_PHASES = ["☀️ 오전", "🍚 점심", "🌙 저녁"]
const DAY_NAMES = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"]

// AI 분석 이유 데이터 (토스 스타일)
const AI_REASONS_UP = [
  { emoji: "📈", reason: "최근 실적 발표에서 예상치를 상회하는 매출 달성" },
  { emoji: "🏢", reason: "신규 사업 진출로 성장 기대감 상승" },
  { emoji: "💰", reason: "외국인 투자자 순매수 증가 추세" },
  { emoji: "📊", reason: "업종 대비 저평가 구간으로 반등 기대" },
  { emoji: "🔥", reason: "주요 제품 수요 급증으로 수혜 전망" },
]
const AI_REASONS_DOWN = [
  { emoji: "📉", reason: "실적 부진으로 투자 심리 위축" },
  { emoji: "⚠️", reason: "경쟁사 신제품 출시로 시장 점유율 우려" },
  { emoji: "🌐", reason: "글로벌 경기 둔화 우려 확산" },
  { emoji: "💸", reason: "기관 투자자 대량 매도세 관찰" },
  { emoji: "📰", reason: "규제 강화 이슈로 불확실성 증가" },
]

// 캐릭터 반응 이모지
const CHARACTER_REACTIONS = {
  buy: ["🤑", "💪", "🚀", "📈"],
  sell: ["💰", "🎯", "✨", "🏆"],
  skip: ["🤔", "😐", "⏭️", "💤"],
  timeout: ["⏰", "😱", "💨", "🏃"],
}

// 턴 매핑: 각 결정이 몇 턴 분량인지 (시나리오 데이터에 맞추어 조정)
const TURNS_PER_DECISION = 1

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
  const currentTurnData = stock.turns[currentTurn]
  if (!currentTurnData) {
    console.error("❌ 턴 데이터 없음:", { stockId: stock.id, currentTurn, totalTurns: stock.turns.length })
    return null
  }
  
  const sPrice = currentTurnData.price
  const sPrevPrice = currentTurn > 0 ? stock.turns[currentTurn - 1]?.price || stock.initialPrice : stock.initialPrice
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

  // 5일치 데이터 (30턴), 2턴당 1개씩 샘플링하여 15개 포인트 표시
  const historyNeeded = 30 // 5일 × 6턴
  const sampleRate = 2 // 2턴당 1개
  let rawData = []

  if (currentTurn < historyNeeded) {
    const startPrice = stock.initialPrice
    for (let i = historyNeeded - currentTurn; i > 0; i--) {
      rawData.push({ price: startPrice, index: rawData.length })
    }
  }

  const startIndex = Math.max(0, currentTurn - historyNeeded)
  const recentTurns = stock.turns.slice(startIndex, currentTurn + 1)
  rawData = [...rawData, ...recentTurns.map((t: any, idx: number) => ({ 
    price: t.price, 
    index: rawData.length + idx 
  }))]

  // 2턴당 1개씩 샘플링 (미니차트 최적화)
  const chartData = rawData.filter((_, idx) => idx % sampleRate === 0 || idx === rawData.length - 1)
  
  // 디버깅: 차트 데이터 로그 (첫 번째 주식만, 6턴마다)
  if (stock.id === 'KAKAO' && currentTurn % 6 === 0) {
    console.log(`📊 [${stock.name}] 턴 ${currentTurn}: 차트 데이터`, {
      rawDataPoints: rawData.length,
      sampledPoints: chartData.length,
      prices: chartData.map(d => d.price),
      minPrice: Math.min(...chartData.map(d => d.price)),
      maxPrice: Math.max(...chartData.map(d => d.price)),
    })
  }

  // 현재 몇 주차인지 계산
  const weekNumber = Math.floor(currentTurn / (DECISIONS_PER_DAY * DAYS_PER_WEEK))

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
        <MiniChart 
          key={`${stock.id}-${currentTurn}`}
          data={chartData} 
          color={isUp ? "#ef4444" : "#3b82f6"} 
          isUp={isUp} 
          weekNumber={weekNumber}
        />

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
  showXAxis = true,
  chartPeriod = "1M",
}: {
  data: any[]
  height?: number
  color?: "red" | "blue"
  dataKey?: string
  showXAxis?: boolean
  chartPeriod?: "1D" | "1W" | "1M" | "1Y"
}) => {
  const colorMap = {
    red: "#F87171", // 빨간색
    blue: "#60A5FA", // 파란색
  }

  const chartColor = colorMap[color]
  const gradientId = `gradient-${color}-${Math.random().toString(36).substr(2, 9)}`

  const { min, max, maxPointIndex, minPointIndex, maxPrice, minPrice } = useMemo(() => {
    if (!data || data.length === 0) return { 
      min: 0, max: 0, 
      maxPointIndex: -1, minPointIndex: -1,
      maxPrice: 0, minPrice: 0
    }
    const values = data.map((d: any) => d[dataKey])
    const minVal = Math.min(...values)
    const maxVal = Math.max(...values)
    const padding = (maxVal - minVal) * 0.2

    // 배열 인덱스 찾기 (ReferenceDot에서 사용할 실제 위치)
    const maxPointIndex = values.indexOf(maxVal)
    const minPointIndex = values.indexOf(minVal)

    return {
      min: Math.floor(minVal - padding),
      max: Math.ceil(maxVal + padding),
      maxPointIndex,
      minPointIndex,
      maxPrice: maxVal,
      minPrice: minVal,
    }
  }, [data, dataKey])

  // 날짜 포맷팅 함수 - 기간에 따라 다르게 표시
  const formatXAxis = (value: any, index: number) => {
    if (!data || !data[index]) return ''
    const dateStr = data[index].date || ''
    
    if (dateStr.includes('-')) {
      const parts = dateStr.split(' ')
      const datePart = parts[0].split('-')
      const year = datePart[0]
      const month = parseInt(datePart[1])
      const day = parseInt(datePart[2])
      const timePart = parts[1] // "09:30" 형식
      
      // 1일: 시간만 표시
      if (chartPeriod === "1D" && timePart) {
        return timePart
      }
      // 1년: 년도/월 표시
      else if (chartPeriod === "1Y") {
        return `${year.slice(2)}/${month}` // "24/1" 형식
      }
      // 1주, 1개월: 월/일만 표시
      else {
        return `${month}/${day}`
      }
    }
    return ''
  }

  return (
    <div className="w-full select-none" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 25, right: 10, left: 10, bottom: 30 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={[min, max]} />
          <XAxis 
            dataKey="index" 
            type="number"
            hide={!showXAxis}
            tickFormatter={formatXAxis}
            tick={{ fill: '#6B7280', fontSize: 10 }}
            stroke="transparent"
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={40}
            domain={[0, data.length - 1]}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const pointData = payload[0].payload
                return (
                  <div className="bg-gray-900/90 backdrop-blur border border-gray-700 text-white text-xs font-bold py-2 px-3 rounded-xl shadow-xl">
                    <div className="text-gray-400">{pointData.date || ''}</div>
                    <div className="mt-1">{Number(payload[0].value).toLocaleString()}원</div>
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
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            animationDuration={600}
            isAnimationActive={true}
            dot={false}
          />
          
          {/* 최고점 */}
          {maxPointIndex >= 0 && data[maxPointIndex] && (
            <ReferenceDot 
              x={maxPointIndex} 
              y={maxPrice} 
              r={3} 
              fill="#F87171" 
              stroke="white" 
              strokeWidth={1.5}
            >
              <Label
                content={({ viewBox }: any) => {
                  const { x, y } = viewBox
                  return (
                    <text x={x} y={y - 12} fill="#F87171" fontSize={10} textAnchor="middle" fontWeight="600">
                      최고 {maxPrice.toLocaleString()}원
                    </text>
                  )
                }}
              />
            </ReferenceDot>
          )}
          
          {/* 최저점 */}
          {minPointIndex >= 0 && data[minPointIndex] && (
            <ReferenceDot 
              x={minPointIndex} 
              y={minPrice} 
              r={3} 
              fill="#9CA3AF" 
              stroke="white" 
              strokeWidth={1.5}
            >
              <Label
                content={({ viewBox }: any) => {
                  const { x, y } = viewBox
                  return (
                    <text x={x} y={y + 18} fill="#9CA3AF" fontSize={10} textAnchor="middle" fontWeight="600">
                      최저 {minPrice.toLocaleString()}원
                    </text>
                  )
                }}
              />
            </ReferenceDot>
          )}
          
          {/* 현재 포인트 */}
          {data && data.length > 0 && (
            <ReferenceDot 
              x={data.length - 1} 
              y={data[data.length - 1][dataKey]} 
              r={4} 
              fill={chartColor} 
              stroke="white" 
              strokeWidth={2}
            />
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

  // AI 주식 100개 생성
  const generateAIStocks = (count: number, startingPrice: number, requiredTurns: number) => {
    const aiCompanies = [
      "OpenAI", "Anthropic", "DeepMind", "Cohere", "Hugging Face", "Stability AI", "Midjourney",
      "Character.AI", "Jasper", "Copy.ai", "Synthesia", "Runway", "Descript", "Otter.ai",
      "Grammarly", "Notion AI", "GitHub Copilot", "Tabnine", "Replit", "Cursor AI"
    ]
    
    const stocks = []
    for (let i = 0; i < count; i++) {
      const companyName = i < aiCompanies.length 
        ? aiCompanies[i] 
        : `AI-Tech-${String(i + 1).padStart(3, "0")}`
      
      const basePrice = startingPrice * (0.5 + Math.random())
      const turns = []
      let currentPrice = basePrice
      const startDate = new Date(2024, 0, 1)
      
      for (let turn = 0; turn < requiredTurns; turn++) {
        const change = (Math.random() - 0.48) * 0.08 // AI는 평균적으로 상승 경향
        currentPrice = Math.max(1000, Math.round(currentPrice * (1 + change)))
        
        const currentDate = new Date(startDate)
        currentDate.setDate(currentDate.getDate() + turn)
        const dateStr = `${currentDate.getFullYear()}.${String(currentDate.getMonth() + 1).padStart(2, "0")}.${String(currentDate.getDate()).padStart(2, "0")}`
        
        const newsTemplates = [
          "AI 모델 성능 개선",
          "새로운 AI 기능 출시",
          "대규모 투자 유치",
          "주요 기업과 파트너십",
          "AI 기술 혁신 발표",
          "사용자 급증",
          "AI 시장 확대",
        ]
        
        turns.push({
          turn: turn + 1,
          date: dateStr,
          price: currentPrice,
          news: newsTemplates[Math.floor(Math.random() * newsTemplates.length)],
        })
      }
      
      stocks.push({
        id: `ai-stock-${i + 1}`,
        name: companyName,
        category: "AI/테크",
        initialPrice: Math.round(basePrice),
        turns: turns,
      })
    }
    
    return stocks
  }

  // 로봇/자동차 주식 100개 생성
  const generateRobotAutoStocks = (count: number, startingPrice: number, requiredTurns: number) => {
    const companies = [
      "Tesla", "Rivian", "Lucid Motors", "NIO", "XPeng", "BYD", "Boston Dynamics",
      "ABB Robotics", "FANUC", "KUKA", "Yaskawa", "Universal Robots", "Teradyne",
      "iRobot", "Intuitive Surgical", "Symbotic", "Sarcos", "Agility Robotics"
    ]
    
    const stocks = []
    for (let i = 0; i < count; i++) {
      const companyName = i < companies.length 
        ? companies[i] 
        : `RoboAuto-${String(i + 1).padStart(3, "0")}`
      
      const basePrice = startingPrice * (0.7 + Math.random() * 0.6)
      const turns = []
      let currentPrice = basePrice
      const startDate = new Date(2024, 0, 1)
      
      for (let turn = 0; turn < requiredTurns; turn++) {
        const change = (Math.random() - 0.5) * 0.06
        currentPrice = Math.max(1000, Math.round(currentPrice * (1 + change)))
        
        const currentDate = new Date(startDate)
        currentDate.setDate(currentDate.getDate() + turn)
        const dateStr = `${currentDate.getFullYear()}.${String(currentDate.getMonth() + 1).padStart(2, "0")}.${String(currentDate.getDate()).padStart(2, "0")}`
        
        const newsTemplates = [
          "전기차 판매 증가",
          "로봇 기술 혁신",
          "자율주행 개선",
          "생산 라인 확대",
          "신규 공장 건설",
          "배터리 기술 향상",
          "글로벌 시장 진출",
        ]
        
        turns.push({
          turn: turn + 1,
          date: dateStr,
          price: currentPrice,
          news: newsTemplates[Math.floor(Math.random() * newsTemplates.length)],
        })
      }
      
      stocks.push({
        id: `robot-auto-${i + 1}`,
        name: companyName,
        category: "로봇/자동차",
        initialPrice: Math.round(basePrice),
        turns: turns,
      })
    }
    
    return stocks
  }

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
          setIsWaitingForDecision(true)
          setSelectedStockId(daily[0])
        }
      }, 2000)
    }
  }, [currentPhaseInDay, currentDay, dailyStockIds, scenario, currentTurn])

  // 30초 결정 타이머
  useEffect(() => {
    if (!isWaitingForDecision || showCardFeedback || showDaySummary || showResult || showQuickTrade) return

    const timer = setInterval(() => {
      setDecisionTimer(prev => {
        if (prev <= 1) {
          // 시간 초과 → 자동 건너뛰기
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
          // 1.5초 후 다음 기회로
          setTimeout(() => advanceToNext(), 1500)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isWaitingForDecision, showCardFeedback, showDaySummary, showResult, showQuickTrade, advanceToNext])

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

  const DatePopup = () =>
    showDatePopup && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 pointer-events-none">
        <div className="flex flex-col items-center animate-in zoom-in-50 duration-500">
          <div className="text-2xl text-gray-300 mb-2 font-medium">Today is</div>
          <div className="text-6xl md:text-8xl font-bold text-white tracking-tight drop-shadow-2xl">
            {turnData?.date || ""}
          </div>
        </div>
      </div>
    )

  // 로딩 화면 - 필수 데이터만 체크
  if (!scenario || !selectedStockId || !currentStock) {
    const loadingReason = !scenario ? "시나리오 로드 중" :
                          !selectedStockId ? "주식 선택 중" :
                          !currentStock ? "주식 데이터 로드 중" : "알 수 없음"
    
    console.log("⏳ 로딩 중:", {
      reason: loadingReason,
      hasScenario: !!scenario,
      scenarioId,
      selectedStockId,
      hasCurrentStock: !!currentStock,
      currentTurn
    })
    
    return (
      <div className="min-h-screen bg-[#191919] flex flex-col items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          <div className="text-xl font-bold text-gray-300">게임 로딩 중...</div>
          <div className="text-sm text-gray-500">{loadingReason}</div>
        </div>
      </div>
    )
  }

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

  // --- 자유 거래 VIEW (메인 게임 화면) ---
  if (viewMode === "list") {
    // 타이머 프로그레스
    const timerProgress = decisionTimer / DECISION_TIMER_SECONDS
    
    // 모든 주식 정보 계산
    const allStocksData = scenario?.stocks.map(stock => {
      const turnData = stock.turns?.[currentTurn]
      const currentPrice = turnData?.price || stock.initialPrice || 0
      const prevPrice = currentTurn > 0 
        ? (stock.turns?.[currentTurn - 1]?.price || stock.initialPrice || 0) 
        : (stock.initialPrice || 0)
      const change = prevPrice > 0 ? (((currentPrice - prevPrice) / prevPrice) * 100).toFixed(1) : "0.0"
      const isUp = Number(change) >= 0
      const myHoldings = holdings[stock.id] || 0
      const myAvg = averagePrices[stock.id] || 0
      const maxBuyQty = currentPrice > 0 ? Math.floor(cash / currentPrice) : 0
      
      return {
        ...stock,
        currentPrice,
        prevPrice,
        change,
        isUp,
        myHoldings,
        myAvg,
        maxBuyQty,
        news: (turnData as any)?.news || "시장 정보",
      }
    }) || []
    
    // 카테고리별 그룹화
    const stocksByCategory = allStocksData.reduce((acc, stock) => {
      const category = (stock as any).category || "기타"
      if (!acc[category]) acc[category] = []
      acc[category].push(stock)
      return acc
    }, {} as Record<string, typeof allStocksData>)

    return (
      <div className="min-h-screen bg-[#191919] text-white flex flex-col">
        {/* 결정 피드백 오버레이 */}
        {showCardFeedback && cardFeedbackData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="text-center animate-in zoom-in duration-300">
              <div className="text-8xl mb-4 animate-bounce">{cardFeedbackData.emoji}</div>
              <div className="text-2xl font-bold text-white mb-2">{cardFeedbackData.message}</div>
              {cardFeedbackData.priceChange && (
                <div className={cn(
                  "text-lg font-bold",
                  cardFeedbackData.type === "buy" ? "text-red-400" : 
                  cardFeedbackData.type === "sell" ? "text-blue-400" : "text-gray-400"
                )}>
                  {cardFeedbackData.priceChange}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 하루 요약 오버레이 */}
        {showDaySummary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="text-center animate-in fade-in duration-500 px-8">
              <div className="text-5xl mb-4">🌅</div>
              <div className="text-xl font-bold text-white mb-2">{currentDay}일차 종료</div>
              <div className="text-sm text-gray-400 mb-4">{currentDayName}</div>
              <div className="bg-gray-800/60 rounded-2xl p-4 inline-block">
                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-xs text-gray-400">총 자산</div>
                    <div className="text-lg font-bold text-white">{totalValue.toLocaleString()}원</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">수익률</div>
                    <div className={cn("text-lg font-bold", profitRate >= 0 ? "text-red-500" : "text-blue-500")}>
                      {profitRate >= 0 ? "+" : ""}{profitRate}%
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500 animate-pulse">다음 날로 이동 중...</div>
            </div>
          </div>
        )}

        {/* 주간 리포트 모달 */}
        <WeeklyReportModal
          isOpen={showWeeklyReport}
          onClose={handleCloseReport}
          weekNumber={currentWeekNumber}
          weeklyReturn={weeklyReturn}
          totalReturn={profitRate}
          chartData={weeklyHistory.slice(-(DAYS_PER_WEEK * DECISIONS_PER_DAY))}
        />

        {/* Header - HP / Streak / Combo */}
        <div className="px-5 py-3 sticky top-0 z-10 bg-[#191919]/95 backdrop-blur-sm border-b border-gray-800/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-lg">
                  {i < (characterData?.hearts ?? 5) ? "❤️" : "🖤"}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-0.5 text-xs font-bold text-orange-400">🔥 {characterData?.streak ?? 0}</span>
              <span className="flex items-center gap-0.5 text-xs font-bold text-yellow-400">⚡ {totalDecisions}</span>
            </div>
          </div>

          {/* 시간대 + 날짜 + 진행률 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded-full">
                {currentDayPhase}
              </span>
              <span className="text-xs text-gray-400 font-bold">
                {currentDayNumber}일차 · {currentWeekNumber}주차
              </span>
              <span className="text-xs text-gray-500">{currentDayName}</span>
            </div>
            <button onClick={() => router.push("/")} className="p-1 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 자산 요약 바 */}
        <div className="px-5 py-3 bg-gray-800/30 border-b border-gray-800/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-gray-500">총 자산</div>
              <div className="text-base font-bold text-white">{totalValue.toLocaleString()}원</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-gray-500">수익률</div>
              <div className={cn("text-base font-bold", profitRate >= 0 ? "text-red-500" : "text-blue-500")}>
                {profitRate >= 0 ? "+" : ""}{profitRate}%
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-500">현금</div>
              <div className="text-base font-bold text-gray-300">{cash.toLocaleString()}원</div>
            </div>
          </div>
          {/* 진행 바 */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
              <span>{totalDecisions}번째 결정</span>
              <span>{currentDay}일 / {totalDays}일</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1">
              <div 
                className="bg-blue-500 h-1 rounded-full transition-all duration-500" 
                style={{ width: `${totalDays > 0 ? Math.min((currentDay / totalDays) * 100, 100) : 0}%` }} 
              />
            </div>
          </div>
        </div>

        {/* 오늘의 시간대 인디케이터 */}
        <div className="px-5 py-2 flex items-center gap-1">
          {DAY_PHASES.map((phase, idx) => (
            <div key={phase} className="flex-1 flex flex-col items-center">
              <div className={cn(
                "w-full h-1 rounded-full mb-1 transition-all",
                idx < currentPhaseInDay ? "bg-blue-500" :
                idx === currentPhaseInDay ? "bg-blue-400 animate-pulse" : "bg-gray-700"
              )} />
              <span className={cn(
                "text-[10px] font-bold transition-colors",
                idx === currentPhaseInDay ? "text-blue-400" : "text-gray-600"
              )}>
                {phase}
              </span>
            </div>
          ))}
        </div>

        {/* 30초 자유 거래 타임 */}
        {isWaitingForDecision && !showQuickTrade && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* 타이머 헤더 */}
            <div className="px-5 py-3 bg-gray-800/50 border-b border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⏱️</span>
                  <div>
                    <div className="text-sm font-bold text-white">자유 거래 타임</div>
                    <div className="text-xs text-gray-400">30초 동안 자유롭게 매수/매도</div>
                  </div>
                </div>
                <div className={cn(
                  "text-3xl font-black tabular-nums",
                  decisionTimer > 20 ? "text-green-400" : 
                  decisionTimer > 10 ? "text-yellow-400" : "text-red-400 animate-pulse"
                )}>
                  {decisionTimer}
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                  className={cn(
                    "h-2 rounded-full transition-all duration-1000",
                    decisionTimer > 20 ? "bg-green-500" : 
                    decisionTimer > 10 ? "bg-yellow-500" : "bg-red-500"
                  )}
                  style={{ width: `${timerProgress * 100}%` }} 
                />
              </div>
            </div>

            {/* 주식 리스트 */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
              {Object.entries(stocksByCategory).map(([category, stocks]) => (
                <div key={category}>
                  <h3 className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {stocks.map((stock: any) => (
                      <div 
                        key={stock.id}
                        className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1 min-w-0 mr-3">
                            <div className="font-bold text-white text-sm truncate">{stock.name}</div>
                            <div className="text-xs text-gray-400 truncate">{stock.news}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-white text-sm">
                              {stock.currentPrice.toLocaleString()}원
                            </div>
                            <div className={cn("text-xs font-medium", stock.isUp ? "text-red-500" : "text-blue-500")}>
                              {stock.isUp ? "+" : ""}{stock.change}%
                            </div>
                          </div>
                        </div>
                        
                        {/* 보유 정보 */}
                        {stock.myHoldings > 0 && (
                          <div className="bg-blue-500/10 rounded-lg p-2 mb-2 text-xs">
                            <div className="flex justify-between text-gray-300">
                              <span>보유: {stock.myHoldings}주</span>
                              <span className={cn(
                                "font-bold",
                                ((stock.currentPrice - stock.myAvg) * stock.myHoldings) >= 0 ? "text-red-400" : "text-blue-400"
                              )}>
                                {((stock.currentPrice - stock.myAvg) * stock.myHoldings) >= 0 ? "+" : ""}
                                {((stock.currentPrice - stock.myAvg) * stock.myHoldings).toLocaleString()}원
                              </span>
                            </div>
                          </div>
                        )}

                        {/* 거래 버튼 */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (stock.myHoldings > 0) {
                                // 빠른 매도 (1주)
                                handleDecision("sell", 1, stock.id)
                              }
                            }}
                            disabled={stock.myHoldings === 0}
                            className={cn(
                              "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
                              stock.myHoldings > 0
                                ? "bg-blue-600 hover:bg-blue-700 text-white active:scale-95"
                                : "bg-gray-700 text-gray-500 cursor-not-allowed"
                            )}
                          >
                            매도 1주
                          </button>
                          <button
                            onClick={() => {
                              if (stock.maxBuyQty > 0) {
                                // 빠른 매수 (1주)
                                handleDecision("buy", 1, stock.id)
                              }
                            }}
                            disabled={stock.maxBuyQty === 0}
                            className={cn(
                              "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
                              stock.maxBuyQty > 0
                                ? "bg-red-500 hover:bg-red-600 text-white active:scale-95"
                                : "bg-gray-700 text-gray-500 cursor-not-allowed"
                            )}
                          >
                            매수 1주
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 다음 시간 버튼 */}
            <div className="px-5 py-3 bg-gray-800/50 border-t border-gray-700/50">
              <button
                onClick={() => handleDecision("skip")}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-2xl font-bold text-sm transition-all active:scale-95"
              >
                다음 시간으로 →
              </button>
            </div>
          </div>
        )}

        {/* [이전 코드의 나머지 부분은 동일] */}
        {false && oppStock && isWaitingForDecision && !showQuickTrade && (
          <div className="flex-1 px-5 py-3 flex flex-col overflow-y-auto">
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50 rounded-3xl p-5 flex-1 flex flex-col">
              {/* 주식 정보 */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xl font-bold text-white">PLACEHOLDER</div>
                  <div className="text-xs text-gray-400 mt-0.5">PLACEHOLDER</div>
                </div>
                <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold">
                  PLACEHOLDER
                </div>
              </div>

              {/* 가격 */}
              <div className="mb-3">
                <div className="text-3xl font-black text-white">{oppPrice.toLocaleString()}원</div>
                <div className={cn("text-sm font-bold mt-0.5 flex items-center gap-1", oppIsUp ? "text-red-500" : "text-blue-500")}>
                  <span>{oppIsUp ? "▲" : "▼"}</span>
                  <span>{Math.abs(oppPrice - oppPrevPrice).toLocaleString()}원</span>
                  <span>({oppIsUp ? "+" : ""}{oppChange}%)</span>
                </div>
              </div>

              {/* 미니 차트 */}
              {oppChartData.length > 1 && (
                <div className="h-16 mb-3 -mx-1">
                  <MiniChart 
                    data={oppChartData}
                    color={oppIsUp ? "#ef4444" : "#3b82f6"}
                    isUp={oppIsUp}
                  />
                </div>
              )}

              {/* 뉴스 */}
              <div className="bg-gray-800/50 rounded-2xl p-3 mb-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm">📰</span>
                  <span className="text-[11px] font-bold text-gray-300">오늘의 뉴스</span>
                </div>
                <div className="text-sm text-gray-200 leading-relaxed">{oppNews}</div>
              </div>

              {/* AI 분석 */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3 mb-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm">{aiReason.emoji}</span>
                  <span className="text-[11px] font-bold text-blue-400">AI 분석</span>
                </div>
                <div className="text-sm text-blue-200 leading-relaxed">{aiReason.reason}</div>
              </div>

              {/* 보유 정보 (있을 경우) */}
              {oppHoldings > 0 && (
                <div className="bg-gray-800/30 rounded-2xl p-3 mb-3 border border-gray-700/30">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">평균 매입가</span>
                    <span className="text-gray-200 font-bold">{oppAvg.toLocaleString()}원</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-400">평가손익</span>
                    <span className={cn("font-bold", (oppPrice - oppAvg) >= 0 ? "text-red-500" : "text-blue-500")}>
                      {(oppPrice - oppAvg) >= 0 ? "+" : ""}{((oppPrice - oppAvg) * oppHoldings).toLocaleString()}원
                    </span>
                  </div>
                </div>
              )}

              {/* 타이머 */}
              <div className="mt-auto pt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-400">남은 시간</span>
                  <span className={cn(
                    "text-xl font-black tabular-nums",
                    decisionTimer > 20 ? "text-green-400" : 
                    decisionTimer > 10 ? "text-yellow-400" : "text-red-400 animate-pulse"
                  )}>
                    {decisionTimer}초
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={cn(
                      "h-2.5 rounded-full transition-all duration-1000 ease-linear",
                      decisionTimer > 20 ? "bg-green-500" : 
                      decisionTimer > 10 ? "bg-yellow-500" : "bg-red-500"
                    )}
                    style={{ width: `${timerProgress * 100}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-3 mt-4 pb-6">
              <button
                onClick={() => handleDecision("skip")}
                className="flex-1 h-14 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-2xl font-bold text-base transition-all active:scale-95"
              >
                건너뛰기
              </button>
              <button
                onClick={() => {
                  if (oppHoldings > 0) {
                    setShowQuickTrade("sell")
                    setTradeQuantity(oppHoldings)
                  }
                }}
                disabled={oppHoldings === 0}
                className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-2xl font-bold text-base transition-all active:scale-95"
              >
                매도
              </button>
              <button
                onClick={() => {
                  if (maxBuyQty > 0) {
                    setShowQuickTrade("buy")
                    setTradeQuantity(1)
                  }
                }}
                disabled={maxBuyQty === 0}
                className="flex-1 h-14 bg-red-500 hover:bg-red-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-2xl font-bold text-base transition-all active:scale-95"
              >
                매수
              </button>
            </div>
          </div>
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

        {/* [제거된 섹션] */}
        {false && showQuickTrade && (
          <div className="flex-1 px-5 py-3 flex flex-col">
            <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50 rounded-3xl p-5 flex-1 flex flex-col">
              {/* 타이틀 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{showQuickTrade === "buy" ? "📈" : "📉"}</span>
                  <div>
                    <div className="text-lg font-bold text-white">{oppStock.name}</div>
                    <div className={cn("text-sm font-bold", showQuickTrade === "buy" ? "text-red-400" : "text-blue-400")}>
                      {showQuickTrade === "buy" ? "매수" : "매도"}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowQuickTrade(null)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

              {/* 현재가 */}
              <div className="bg-gray-800/50 rounded-2xl p-4 mb-4">
                <div className="text-xs text-gray-400 mb-1">현재가</div>
                <div className="text-2xl font-black text-white">{oppPrice.toLocaleString()}원</div>
              </div>

              {/* 수량 선택 */}
              <div className="mb-4">
                <div className="text-xs text-gray-400 mb-2">수량</div>
                <div className="flex items-center justify-center gap-4">
                  <button 
                    onClick={() => setTradeQuantity(q => Math.max(1, q - 1))}
                    className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-xl font-bold transition-all active:scale-90"
                  >
                    -
                  </button>
                  <div className="w-24 text-center">
                    <div className="text-3xl font-black text-white">{tradeQuantity}</div>
                    <div className="text-xs text-gray-500">주</div>
                  </div>
                  <button 
                    onClick={() => {
                      const max = showQuickTrade === "buy" ? maxBuyQty : oppHoldings
                      setTradeQuantity(q => Math.min(max, q + 1))
                    }}
                    className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-xl font-bold transition-all active:scale-90"
                  >
                    +
                  </button>
                </div>
                {/* 빠른 수량 선택 */}
                <div className="flex gap-2 mt-3 justify-center">
                  {[1, 5, 10].map(q => {
                    const max = showQuickTrade === "buy" ? maxBuyQty : oppHoldings
                    if (q > max) return null
                    return (
                      <button 
                        key={q}
                        onClick={() => setTradeQuantity(q)}
                        className={cn(
                          "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                          tradeQuantity === q ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-400"
                        )}
                      >
                        {q}주
                      </button>
                    )
                  })}
                  <button 
                    onClick={() => setTradeQuantity(showQuickTrade === "buy" ? maxBuyQty : oppHoldings)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                      tradeQuantity === (showQuickTrade === "buy" ? maxBuyQty : oppHoldings) 
                        ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-400"
                    )}
                  >
                    전량
                  </button>
                </div>
              </div>

              {/* 총 금액 */}
              <div className="bg-gray-800/50 rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    {showQuickTrade === "buy" ? "총 매수 금액" : "총 매도 금액"}
                  </span>
                  <span className="text-xl font-bold text-white">
                    {(oppPrice * tradeQuantity).toLocaleString()}원
                  </span>
                </div>
                {showQuickTrade === "buy" && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">매수 후 잔액</span>
                    <span className="text-sm text-gray-400">
                      {(cash - oppPrice * tradeQuantity).toLocaleString()}원
                    </span>
                  </div>
                )}
                {showQuickTrade === "sell" && oppAvg > 0 && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">예상 손익</span>
                    <span className={cn("text-sm font-bold", (oppPrice - oppAvg) * tradeQuantity >= 0 ? "text-red-500" : "text-blue-500")}>
                      {(oppPrice - oppAvg) * tradeQuantity >= 0 ? "+" : ""}
                      {((oppPrice - oppAvg) * tradeQuantity).toLocaleString()}원
                    </span>
                  </div>
                )}
              </div>

              {/* 타이머 (거래 화면에서도 계속 표시) */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">남은 시간</span>
                  <span className={cn(
                    "text-base font-bold tabular-nums",
                    decisionTimer > 20 ? "text-green-400" : 
                    decisionTimer > 10 ? "text-yellow-400" : "text-red-400 animate-pulse"
                  )}>
                    {decisionTimer}초
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div 
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-1000",
                      decisionTimer > 20 ? "bg-green-500" : 
                      decisionTimer > 10 ? "bg-yellow-500" : "bg-red-500"
                    )}
                    style={{ width: `${timerProgress * 100}%` }} 
                  />
                </div>
              </div>

              {/* 확인/취소 버튼 */}
              <div className="flex gap-3 mt-auto pb-2">
                <button
                  onClick={() => setShowQuickTrade(null)}
                  className="flex-1 h-14 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-2xl font-bold text-base transition-all active:scale-95"
                >
                  취소
                </button>
                <button
                  onClick={() => handleDecision(showQuickTrade, tradeQuantity)}
                  className={cn(
                    "flex-[2] h-14 rounded-2xl font-bold text-base text-white transition-all active:scale-95",
                    showQuickTrade === "buy" 
                      ? "bg-red-500 hover:bg-red-600" 
                      : "bg-blue-600 hover:bg-blue-700"
                  )}
                >
                  {showQuickTrade === "buy" ? "매수 확인" : "매도 확인"}
                </button>
              </div>
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
          weekNumber={currentWeekNumber}
          weeklyReturn={weeklyReturn}
          totalReturn={profitRate}
          chartData={weeklyHistory.slice(-(DAYS_PER_WEEK * DECISIONS_PER_DAY))} // Show last 1주간
        />

        {/* Header */}
        <div className="px-4 py-3 sticky top-0 bg-[#191919]/95 backdrop-blur-sm z-10 border-b border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => setViewMode("list")} className="p-1">
              <ArrowLeft className="w-6 h-6 text-gray-300" />
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setHintLevel(2)
                  setShowHintModal(true)
                }}
                className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl hover:bg-yellow-500/20 transition-all active:scale-95 flex items-center gap-1"
              >
                <span className="text-sm">💡</span>
                <span className="text-xs font-bold text-yellow-400">심층분석</span>
              </button>
              <Heart
                className={cn(
                  "w-6 h-6 transition-colors cursor-pointer",
                  favorites.includes(selectedStockId) ? "text-red-500 fill-current" : "text-gray-400",
                )}
                onClick={() => toggleFavorite(selectedStockId)}
              />
              <Bell className="w-6 h-6 text-gray-400" />
              <MoreHorizontal className="w-6 h-6 text-gray-400" />
            </div>
          </div>
          
          {/* 현재 날짜 및 주차 정보 */}
          <div className="flex items-center justify-center gap-2 pb-2">
            <span className="text-xs text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full">
              {currentDayNumber}일차 · {currentWeekNumber}주차
            </span>
            <span className="text-xs text-gray-500">
              {`${currentDayName} (${currentDayPhase})`}
            </span>
            {isPlaying && (
              <span className="flex items-center gap-1 text-xs text-green-400 animate-pulse">
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                진행 중
              </span>
            )}
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
          <div className="h-[360px] w-full mb-4 relative bg-gray-900 rounded-xl overflow-hidden">
            <StockChart 
              data={chartData} 
              height={360} 
              color={isUp ? "red" : "blue"} 
              showXAxis={true}
              chartPeriod={chartPeriod}
            />
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

          {/* My Investment Card - 간소화 */}
          {currentHoldings > 0 && (
            <div className="px-5 mb-6">
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30 rounded-3xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💼</span>
                    <h3 className="font-bold text-white text-base">내 주식 정보</h3>
                  </div>
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full font-bold">{currentHoldings}주</span>
                </div>

                {/* 평가손익 & 수익률 */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-900/40 rounded-2xl p-4">
                    <div className="text-xs text-gray-400 mb-1">평가손익</div>
                    <div className={cn("text-2xl font-bold", isProfit ? "text-red-500" : "text-blue-500")}>
                      {isProfit ? "+" : ""}
                      {((currentPrice - myAvg) * currentHoldings).toLocaleString()}
                      <span className="text-sm ml-0.5">원</span>
                    </div>
                  </div>
                  <div className="bg-gray-900/40 rounded-2xl p-4">
                    <div className="text-xs text-gray-400 mb-1">수익률</div>
                    <div className={cn("text-2xl font-bold", isProfit ? "text-red-500" : "text-blue-500")}>
                      {isProfit ? "+" : ""}
                      {myReturn}%
                    </div>
                  </div>
                </div>

                {/* 현재 평가금액 */}
                <div className="bg-gray-800/30 rounded-xl p-3.5 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">현재 평가금액</span>
                    <span className="text-xl font-bold text-white">{(currentPrice * currentHoldings).toLocaleString()}원</span>
                  </div>
                </div>

                {/* 가격 비교 - 작게 */}
                <div className="flex items-center justify-between text-xs px-1">
                  <div className="text-gray-400">
                    <span>평균 매입가 </span>
                    <span className="text-gray-300 font-medium">{myAvg.toLocaleString()}원</span>
                  </div>
                  <div className="text-gray-400">
                    <span>현재가 </span>
                    <span className="text-white font-medium">{currentPrice.toLocaleString()}원</span>
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
