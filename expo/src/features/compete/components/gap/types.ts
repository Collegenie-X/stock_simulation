export interface GapPlayer {
  profitRate: number
  waveAccuracy: number
  winRate: number
  avgHoldDays: number
  weakPoint?: string
  style: string
}

export interface BestPlayer extends GapPlayer {
  nickname: string
  keyDiff: string
}

export interface SimilarAI extends GapPlayer {
  name: string
  emoji: string
  label: string
  strategy: string
}

export interface WeeklyGapItem {
  week: string
  me: number
  bestPlayer: number
  similarAI: number
}

export interface Insight {
  type: string
  icon: string
  title: string
  value: string
  desc: string
  action: string
}

export interface GapAnalysis {
  me: GapPlayer
  bestPlayer: BestPlayer
  similarAI: SimilarAI
  weeklyGap: WeeklyGapItem[]
  insights: Insight[]
}
