/**
 * 일관된 숫자 포맷팅 유틸리티
 * hydration 에러 방지를 위해 toLocaleString() 대신 사용
 */

export function formatNumber(num: number): string {
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export function formatCurrency(amount: number, unit: string = "원"): string {
  return `${formatNumber(amount)}${unit}`
}

export function formatKRW(amount: number): string {
  if (Math.abs(amount) >= 100_000_000) {
    return `${(amount / 100_000_000).toFixed(1)}억원`
  }
  if (Math.abs(amount) >= 10_000) {
    return `${Math.round(amount / 10_000)}만원`
  }
  return `${formatNumber(amount)}원`
}

export function formatPrice(price: number): string {
  if (price >= 100_000_000) return `${(price / 100_000_000).toFixed(1)}억`
  if (price >= 10_000) return `${(price / 10_000).toFixed(1)}만원`
  return `${formatNumber(price)}원`
}
