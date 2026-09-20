// 매수 수량 추천 — 현재 cash의 20%로 진입
export function suggestBuyQty(cash: number, priceKrw: number): number {
  if (priceKrw <= 0) return 0
  const budget = cash * 0.2
  return Math.max(1, Math.floor(budget / priceKrw))
}
