import { formatNumber } from "@/lib/format"

export function fmtPrice(n: number) {
  return formatNumber(n) + "원"
}

export function fmtPnl(n: number) {
  return `${n >= 0 ? "+" : ""}${formatNumber(n)}원`
}

/** 등급 배지 색상 (웹: bg-*-500/30 text-*-300) */
export function gradeColors(grade: string, bgOpacity: number): { bg: string; text: string } {
  const map: Record<string, [string, string]> = {
    S: ["234,179,8", "#fde047"],
    A: ["34,197,94", "#86efac"],
    B: ["59,130,246", "#93c5fd"],
    C: ["249,115,22", "#fdba74"],
  }
  const [rgb, text] = map[grade] ?? ["107,114,128", "#9ca3af"]
  return { bg: `rgba(${rgb},${bgOpacity})`, text }
}
