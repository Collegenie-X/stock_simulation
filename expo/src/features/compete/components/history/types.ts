export interface SimulationRecord {
  id: string
  date: string
  weekLabel: string
  scenarioName: string
  stocks: string[]
  profitRate: number
  profitAmount: number
  finalAssets: number
  result: "profit" | "loss"
  style: string
  rank: number
  totalUsers: number
  percentile: number
  waveAccuracy: number
  tradeCount: number
  highlight: string
  winDays: number
  loseDays: number
  rankScore?: number
  rankScoreBreakdown?: { profitPercentile: number; waveAccuracy: number; winRate: number; consistency: number }
}

export interface PracticeRecord {
  id: string
  date: string
  stock?: string
  stockName?: string
  stockEmoji?: string
  patternName: string
  patternEmoji: string
  rounds: number
  totalScore: number
  maxScore: number
  grade: string
  stars: number
  profitPct?: number
  avgTurnScore: number
  bestRound: number
  highlight: string
  isExperiment: boolean
  wave3Accuracy?: number
  correctionAccuracy?: number
  roundResults: Array<{ round: number; score: number; grade: string; pnl: number; emoji: string }>
}

export interface RankTrendItem {
  week: string
  rank: number
  profitRate: number
}
