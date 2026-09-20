import { formatNumber } from "@/lib/format"

/** 웹의 `n.toLocaleString('ko-KR')` 기반 손익 포맷 (Hermes 호환) */
export function fmtPnl(n: number): string {
  return `${n >= 0 ? "+" : ""}${formatNumber(n)}원`
}
