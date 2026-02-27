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

export interface ChartEvent {
  index: number // 차트 데이터의 인덱스
  type: "positive" | "negative" | "neutral"
  emoji: string
  headline: string
}

export interface StockChartProps {
  data: ChartPoint[]
  height?: number
  color?: "red" | "blue"
  dataKey?: string
  showXAxis?: boolean
  chartPeriod?: ChartPeriod
  events?: ChartEvent[] // 차트에 표시할 이벤트 마커
  selectedEventIndex?: number | null // 선택된 이벤트 인덱스
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
  // 유사 AI 대결 정보
  aiName: string
  aiEmoji: string
  aiProfitRate: number
  aiTopStocks: string[]
  nextReportDay: number
  // 최고 AI 정보
  bestAIName: string
  bestAIEmoji: string
  bestAIProfitRate: number
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

// AI 갭 피드백 (매수/매도 직후 표시)
export interface AIGapFeedbackProps {
  isVisible: boolean
  userProfitRate: number
  bestAIProfitRate: number
  similarAIProfitRate: number
  bestAIName: string
  similarAIName: string
  waveAccuracy: number
  onHide: () => void
}

export interface StockListSectionProps {
  allStocksData: StockListItem[]
  currentTurn: number
  favorites: string[]
  stockViewTab: StockViewTab
  /** 라이브 가격 맵 (page 레벨에서 관리 → GameHeader와 공유) */
  livePrices: Record<string, number>
  tickUps: Record<string, boolean>
  /** AI 보유 종목 (stockId → 수량) */
  aiHoldings: Record<string, number>
  aiName: string
  aiEmoji: string
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

// ============================================================
// 미니 게임 리포트 (3일 간격)
// ============================================================

export interface MiniReportHoldingItem {
  stockId: string
  stockName: string
  quantity: number
  avgPrice: number
  currentPrice: number
  profitAmount: number
  profitRate: number
}

export interface MiniGameReportProps {
  isVisible: boolean
  reportDay: number
  periodLabel: string
  userProfitRate: number
  userTotalValue: number
  initialValue: number
  cash: number
  tradeCount: number
  holdingsCount: number
  // 거래 내역
  tradeHistory: TradeRecord[]
  // 보유 종목 상세
  holdingItems: MiniReportHoldingItem[]
  // 자산 흐름 차트
  assetHistory: { turn: number; value: number }[]
  // AI 비교
  aiSimilarProfitRate: number
  aiSimilarName: string
  aiSimilarEmoji: string
  aiBestProfitRate: number
  aiBestName: string
  aiBestEmoji: string
  onContinue: () => void
}

// ============================================================
// 최종 게임 리포트 (게임 종료)
// ============================================================
export interface FinalGameReportTradeRecord {
  id?: string
  stockId?: string
  stockName: string
  action: "buy" | "sell"
  price: number
  quantity: number
  totalAmount: number
  avgBuyPrice?: number
  profit?: number
  profitRate?: number
  date?: string
  turn?: number
  day?: number
}

// 종목별 AI 거래 기록
export interface StockAITrade {
  action: "buy" | "sell" | "hold"
  price: number
  quantity: number
  turn: number
  day: number
  reason: string
}

// 종목별 가격 히스토리 포인트
export interface StockPricePoint {
  turn: number
  price: number
  date: string
}

// 종목 상세 분석 데이터
export interface StockDetailData {
  stockId: string
  stockName: string
  category: string
  // 내 거래 요약
  myTotalProfit: number
  myTotalProfitRate: number
  myTrades: FinalGameReportTradeRecord[]
  currentHolding: number
  avgBuyPrice: number
  currentPrice: number
  unrealizedProfit: number
  unrealizedProfitRate: number
  // 가격 히스토리 (차트용)
  priceHistory: StockPricePoint[]
  // 유사 AI 데이터
  aiSimilarTrades: StockAITrade[]
  aiSimilarProfit: number
  aiSimilarProfitRate: number
  // 최고 AI 데이터
  aiBestTrades: StockAITrade[]
  aiBestProfit: number
  aiBestProfitRate: number
  // 파도 분석 코멘트
  waveComment: string
}

// 자산 히스토리 (AI 비교 포함)
export interface AssetHistoryPoint {
  turn: number
  value: number
  aiSimilar?: number
  aiBest?: number
}

export interface FinalGameReportProps {
  isVisible: boolean
  totalDays: number
  userProfitRate: number
  userTotalValue: number
  initialValue: number
  cash: number
  holdings: Holdings
  tradeHistory: FinalGameReportTradeRecord[]
  weeklyHistory: { turn: number; value: number }[]
  // 자산 히스토리 (AI 포함)
  assetHistory?: AssetHistoryPoint[]
  // 종목 상세 데이터
  stockDetails?: StockDetailData[]
  aiSimilarName: string
  aiSimilarEmoji: string
  aiSimilarProfitRate: number
  aiSimilarTotalValue: number
  aiBestName: string
  aiBestEmoji: string
  aiBestProfitRate: number
  aiBestTotalValue: number
  onGoHome: () => void
  onPlayAgain: () => void
}
