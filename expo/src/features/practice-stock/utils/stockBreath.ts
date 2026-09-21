import type { StockListItem } from "../types"
import { getPreGameHistory } from "./stockHistory"

// ── 5가지 호가 패턴 ────────────────────────────────────────────
// deltas: 4틱 사이클마다 devMax 대비 이동 비율
// intervalMs: 틱 간격 (주식마다 다르게 → 자연스러운 비동기 흐름)
export const BREATH_PATTERNS = [
  { deltas: [ 0.32,  0.22, -0.10,  0.06] as const, intervalMs: 1300 }, // 강세
  { deltas: [-0.28, -0.18,  0.08, -0.02] as const, intervalMs: 1650 }, // 약세
  { deltas: [ 0.09, -0.11,  0.07, -0.05] as const, intervalMs: 2100 }, // 횡보
  { deltas: [ 0.52, -0.58,  0.44, -0.38] as const, intervalMs:  950 }, // 변동성
  { deltas: [ 0.20,  0.28,  0.12, -0.35] as const, intervalMs: 1500 }, // 계단식
]

/** 주식 ID → 패턴 인덱스 (안정적 해시 — 새로고침해도 동일 패턴) */
export function pickPattern(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return Math.abs(h) % BREATH_PATTERNS.length
}

/**
 * 미니차트용 데이터: 게임 시작 전 3개월(JSON) + 지금까지의 게임 가격 + 실시간 꼬리.
 * trail(최근 틱 가격들)을 주면 차트 끝이 실전처럼 오르락내리락 흔들린다.
 */
export function buildChartData(stock: StockListItem, currentTurn: number, trail: number[] = []) {
  const WINDOW = 60
  const SAMPLE = 2

  const prices = getPreGameHistory(stock).map((h) => h.price)
  for (let i = 0; i <= currentTurn; i++) {
    prices.push(stock.turns?.[i]?.price || stock.initialPrice)
  }

  const recent = prices.slice(-WINDOW)
  // 과거 JSON 이 없는 종목은 예전처럼 시작가로 앞을 채움
  while (recent.length < WINDOW) recent.unshift(stock.initialPrice)

  // 과거는 SAMPLE 간격으로 솎고(끝 점은 남김), 실시간 꼬리는 솎지 않고 그대로 붙임
  const lastIdx = recent.length - 1
  return [...recent.filter((_, idx) => (lastIdx - idx) % SAMPLE === 0), ...trail]
    .map((price, index) => ({ price, index }))
}
