import patternData from './chart-patterns.json'

export interface ChartHighlight {
  x: number
  y: number
  label: string
  type: 'buy' | 'sell' | 'info' | 'danger'
  position: 'above' | 'below'
}

export interface ChartData {
  points: [number, number][]
  necklineY: number | null
  highlights: ChartHighlight[]
}

export interface PatternStep {
  phase: 'before' | 'forming' | 'signal' | 'after'
  emoji: string
  title: string
  description: string
  priceNote?: string
}

export interface ProfitScenario {
  stock: string
  entryPrice: number
  shares: number
  targetPrice: number
  stopLoss: number
  entryNote: string
  signalType: 'buy' | 'sell'
}

export interface ChartPattern {
  id: string
  name: string
  nameEn: string
  emoji: string
  category: PatternCategory
  type: "반전" | "지속" | "캔들"
  signal: "매수" | "매도" | "양방향"
  difficulty: number
  reliability: number
  description: string
  howToRead: string
  tradingTip: string
  keyPoints: string[]
  example: {
    situation: string
    action: string
    result: string
  }
  chartData: ChartData
  steps: PatternStep[]
  profitScenario: ProfitScenario
}

export type PatternCategory =
  | "추세 반전"
  | "추세 지속"
  | "캔들스틱"

export const CHART_PATTERNS: ChartPattern[] = patternData.patterns as ChartPattern[]

export const PATTERN_CATEGORIES = patternData.patternCategories as Record<PatternCategory, {
  emoji: string
  color: string
  bgColor: string
  borderColor: string
  description: string
}>

export const SIGNAL_COLORS = patternData.signalColors as {
  "매수": { color: string; bg: string; border: string }
  "매도": { color: string; bg: string; border: string }
  "양방향": { color: string; bg: string; border: string }
}
