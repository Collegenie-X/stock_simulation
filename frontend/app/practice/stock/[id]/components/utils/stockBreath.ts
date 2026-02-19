import type { StockListItem } from "../../types"

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

/** 미니차트용 히스토리 데이터 생성 */
export function buildChartData(stock: StockListItem, currentTurn: number) {
  const HISTORY = 30
  const SAMPLE  = 2
  const rawData: { price: number; index: number }[] = []

  if (currentTurn < HISTORY) {
    for (let i = HISTORY - currentTurn; i > 0; i--) {
      rawData.push({ price: stock.initialPrice, index: rawData.length })
    }
  }

  const startIdx = Math.max(0, currentTurn - HISTORY + 1)
  for (let i = startIdx; i <= currentTurn; i++) {
    const p = stock.turns?.[i]?.price || stock.initialPrice
    rawData.push({ price: p, index: rawData.length })
  }

  return rawData.filter((_, idx) => idx % SAMPLE === 0)
}
