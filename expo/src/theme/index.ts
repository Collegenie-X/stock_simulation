/**
 * 디자인 토큰 — 웹(frontend/app/globals.css)의 다크 테마를 RN용으로 옮긴 것
 * 모든 화면은 하드코딩 대신 이 토큰/팔레트를 사용합니다.
 */
import { palette } from "./palette"

export { palette }

export const colors = {
  background: "#191919",
  backgroundAlt: "#141420",
  card: "#1f1f1f",
  cardAlt: "#252525",
  nav: "#1a1a1a",
  foreground: "#fafafa",
  muted: "#2a2a2a",
  mutedForeground: "#8b8b8b",
  border: "#333333",
  primary: "#4f7cf7",
  destructive: "#ef4444",
  // 주식 색상 - 한국 스타일 (상승: 빨강, 하락: 파랑)
  stockUp: "#f04452",
  stockDown: "#3182f6",
  stockNeutral: "#8b8b8b",
} as const

export const radius = { sm: 8, md: 10, lg: 12, xl: 16, "2xl": 20, "3xl": 24, full: 9999 } as const

export const spacing = (n: number) => n * 4

export const layout = { navHeight: 64, headerHeight: 56, maxWidth: 448 } as const

/** Tailwind text-* 크기 매핑 */
export const fontSize = {
  xs: 12, sm: 14, base: 16, lg: 18, xl: 20, "2xl": 24, "3xl": 30, "4xl": 36, "5xl": 48, "6xl": 60,
} as const

/** Tailwind font-* 굵기 매핑 */
export const fontWeight = {
  normal: "400", medium: "500", semibold: "600", bold: "700", extrabold: "800", black: "900",
} as const

/**
 * hex 색상에 투명도 적용 — Tailwind의 `bg-white/10` → alpha("#ffffff", 0.1)
 */
export function alpha(hex: string, opacity: number): string {
  if (hex === "transparent") return hex
  let h = hex.replace("#", "")
  if (h.length === 3) h = h.split("").map((c) => c + c).join("")
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${opacity})`
}

/** 등락에 따른 주식 색상 */
export function stockColor(value: number): string {
  if (value > 0) return colors.stockUp
  if (value < 0) return colors.stockDown
  return colors.stockNeutral
}
