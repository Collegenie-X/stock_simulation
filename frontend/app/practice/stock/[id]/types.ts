// ============================================================
// 게임 데이터 타입 정의
// ============================================================

export interface TurnData {
  turn: number
  date: string
  price: number
  news?: string
}

export interface StockData {
  id: string
  name: string
  category?: string
  initialPrice: number
  turns: TurnData[]
}

export interface ScenarioData {
  id: string
  title?: string
  name?: string
  totalTurns: number
  stocks: StockData[]
}

// ============================================================
// 게임 상태 타입
// ============================================================

export interface Holdings {
  [stockId: string]: number
}

export interface AveragePrices {
  [stockId: string]: number
}

export interface PendingOrder {
  stockId: string
  type: "buy" | "sell"
  targetPrice: number
  condition: "ge" | "le"
  quantity: number
}

export interface TradeRecord {
  id: string
  stockId: string
  stockName: string
  action: "buy" | "sell"
  price: number
  quantity: number
  totalAmount: number
  avgBuyPrice?: number
  profit?: number
  profitRate?: number
  date: string
  turn: number
  day: number
}

export type ProfitPeriod = "일" | "주" | "월"

export interface CardFeedbackData {
  type: "buy" | "sell" | "skip" | "timeout"
  emoji: string
  message: string
  priceChange?: string
}

export interface AINotificationData {
  isVisible: boolean
  aiName: string
  action: "buy" | "sell"
  stockName: string
  price: number
}

export type ViewMode = "list" | "detail" | "buy" | "sell"
export type CurrencyMode = "KRW" | "USD"
export type ChartPeriod = "1D" | "1W" | "1M" | "1Y"
export type StockViewTab = "현재가" | "평가금"
export type DecisionAction = "buy" | "sell" | "skip"

// ============================================================
// 컴포넌트 Props 타입
// ============================================================

export interface MiniChartProps {
  data: ChartPoint[]
  color: string
  isUp: boolean
  weekNumber?: number
}

export interface ChartPoint {
  price: number
  index: number
  date?: string
}

export interface StockChartProps {
  data: ChartPoint[]
  height?: number
  color?: "red" | "blue"
  dataKey?: string
  showXAxis?: boolean
  chartPeriod?: ChartPeriod
}

export interface WeeklyReportModalProps {
  isOpen: boolean
  onClose: () => void
  weekNumber: number
  weeklyReturn: number
  totalReturn: number
  chartData: { value: number }[]
}

// 주식 리스트 아이템 (계산된 데이터 포함)
export interface StockListItem extends StockData {
  currentPrice: number
  prevPrice: number
  change: string
  isUp: boolean
  myHoldings: number
  myAvg: number
  maxBuyQty: number
  news: string
}

export interface GameHeaderProps {
  // 일/시간 정보
  currentDay: number
  totalDays: number
  currentDayName: string
  currentDayPhase: string
  currentWeekNumber: number
  // 자산 정보
  totalValue: number
  profitRate: number
  // 타이머
  decisionTimer: number
  totalDecisions: number
  remainingDecisions: number
  isTimerPaused: boolean
  isWaitingForDecision: boolean
  // 이벤트
  onTogglePause: () => void
  onExitClick: () => void
  onProfitClick: () => void
}

export interface StockListSectionProps {
  allStocksData: StockListItem[]
  currentTurn: number
  favorites: string[]
  stockViewTab: StockViewTab
  /** 라이브 가격 맵 (page 레벨에서 관리 → GameHeader와 공유) */
  livePrices: Record<string, number>
  tickUps: Record<string, boolean>
  onChangeViewTab: (tab: StockViewTab) => void
  onSelectStock: (stockId: string) => void
  onToggleFavorite: (stockId: string) => void
  onDecision: (action: DecisionAction) => void
}

export interface ExitConfirmDialogProps {
  isOpen: boolean
  onCancel: () => void
  onConfirm: () => void
}
