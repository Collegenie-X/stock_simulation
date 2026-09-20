export type WavePeriod = "1D" | "1W" | "1M"

export interface WavePoint {
  time: string
  price: number
  action: "buy" | "sell" | null
}

export const waveDayData: WavePoint[] = [
  { time: "9시", price: 68000, action: null },
  { time: "10시", price: 69500, action: null },
  { time: "11시", price: 71000, action: "buy" },
  { time: "12시", price: 73000, action: null },
  { time: "13시", price: 72000, action: null },
  { time: "14시", price: 74500, action: null },
  { time: "15시", price: 76000, action: "sell" },
  { time: "16시", price: 75500, action: null },
]

export const waveWeekData: WavePoint[] = [
  { time: "월", price: 65000, action: null },
  { time: "화", price: 67000, action: null },
  { time: "수", price: 72000, action: "buy" },
  { time: "목", price: 68000, action: null },
  { time: "금", price: 75000, action: null },
  { time: "토", price: 85000, action: "sell" },
  { time: "일", price: 80000, action: null },
]

export const waveMonthData: WavePoint[] = [
  { time: "1주", price: 65000, action: null },
  { time: "2주", price: 72000, action: "buy" },
  { time: "3주", price: 85000, action: "sell" },
  { time: "4주", price: 88000, action: "buy" },
]

export function getWaveData(period: WavePeriod): WavePoint[] {
  return period === "1D" ? waveDayData : period === "1W" ? waveWeekData : waveMonthData
}

export const dailyProfitData = [
  { day: "1일", profit: 2.5, type: "profit" },
  { day: "2일", profit: -1.2, type: "loss" },
  { day: "3일", profit: 3.8, type: "profit" },
  { day: "4일", profit: -0.5, type: "loss" },
  { day: "5일", profit: 5.2, type: "profit" },
  { day: "6일", profit: 1.3, type: "profit" },
  { day: "7일", profit: -2.1, type: "loss" },
  { day: "8일", profit: 4.6, type: "profit" },
  { day: "9일", profit: 2.9, type: "profit" },
  { day: "10일", profit: -1.8, type: "loss" },
  { day: "11일", profit: 6.1, type: "profit" },
  { day: "12일", profit: 3.2, type: "profit" },
  { day: "13일", profit: -0.9, type: "loss" },
  { day: "14일", profit: 4.8, type: "profit" },
]

export const tradeAnalysis = [
  { date: "1월 3일", action: "buy", price: 72000, wavePoint: "파도가 올라가기 시작할 때", result: "+18%", timing: "완벽", desc: "가격이 낮을 때 샀어요" },
  { date: "1월 9일", action: "sell", price: 85000, wavePoint: "파도가 가장 높을 때", result: "+18%", timing: "우수", desc: "가격이 높을 때 팔았어요" },
  { date: "1월 13일", action: "buy", price: 88000, wavePoint: "파도가 다시 올라가기 전", result: "+27%", timing: "완벽", desc: "파도가 내려온 후 다시 탔어요" },
  { date: "1월 15일", action: "sell", price: 95000, wavePoint: "파도 꼭대기", result: "+8%", timing: "양호", desc: "적당한 높이에서 내렸어요" },
]
