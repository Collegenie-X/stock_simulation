/**
 * config / JSON 데이터에 남아 있는 Tailwind 클래스 문자열을 RN 색상으로 변환합니다.
 *   twColor("text-cyan-400")                → "#22d3ee"
 *   twColor("bg-green-500")                 → "#22c55e"
 *   twGradient("from-red-500 to-orange-500") → ["#ef4444", "#f97316"]
 */
import { palette } from "@/theme"

const PREFIX = /^(text|bg|from|via|to|border)-/

export function twColor(cls: string, fallback = "#ffffff"): string {
  const token = cls.trim().replace(PREFIX, "")
  if (token === "white") return "#ffffff"
  if (token === "black") return "#000000"
  const m = token.match(/^([a-z]+)-(\d{2,3})$/)
  if (!m) return fallback
  const scale = (palette as unknown as Record<string, Record<string, string> | string>)[m[1]]
  if (!scale || typeof scale === "string") return fallback
  return scale[m[2]] ?? fallback
}

export function twGradient(cls: string, fallback: readonly string[] = ["#6b7280", "#4b5563"]): string[] {
  const parts = cls.split(/\s+/).filter((p) => /^(from|via|to)-/.test(p))
  if (parts.length === 0) return [...fallback]
  const order = ["from", "via", "to"]
  parts.sort((a, b) => order.indexOf(a.split("-")[0]) - order.indexOf(b.split("-")[0]))
  return parts.map((p) => twColor(p))
}
