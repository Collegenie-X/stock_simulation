// 웹 app/profile/simulation/[id]/page.tsx 의 타입 정의

export interface Trade {
  date: string
  action: "buy" | "sell"
  stock: string
  price: number
  shares: number
  amount: number
  profit?: number
  wavePoint: string
}

export interface Simulation {
  id: string
  date: string
  weekLabel: string
  scenarioName: string
  stocks: string[]
  profitRate: number
  profitAmount: number
  finalAssets: number
  startAssets: number
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
  trades: Trade[]
  dailyReturns: number[]
}
