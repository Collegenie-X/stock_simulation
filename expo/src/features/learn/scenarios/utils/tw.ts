/**
 * 데이터(JSON)에 들어있는 Tailwind 클래스 문자열을 RN 색상으로 변환하는 유틸
 *   twColor("text-red-400")        → "#f87171"
 *   twColor("bg-red-500/15")       → "rgba(239,68,68,0.15)"
 *   twGradient("from-a-500 to-b-600") → ["#..", "#.."]
 */
import { alpha, palette } from "@/theme"

const PREFIX = /^(text|bg|border|from|via|to|ring)-/

function resolveToken(token: string): string | undefined {
  const body = token.replace(PREFIX, "")
  const [name, opacityRaw] = body.split("/")
  let hex: string | undefined
  const arbitrary = name.match(/^\[(#[0-9a-fA-F]{3,8})\]$/)
  if (arbitrary) hex = arbitrary[1]
  else if (name === "white") hex = "#ffffff"
  else if (name === "black") hex = "#000000"
  else if (name === "transparent") return "transparent"
  else {
    const m = name.match(/^([a-z]+)-(\d{2,3})$/)
    if (m) {
      const shades = (palette as unknown as Record<string, Record<string, string> | string>)[m[1]]
      if (shades && typeof shades === "object") hex = shades[m[2]]
    }
  }
  if (!hex) return undefined
  if (opacityRaw) {
    const o = opacityRaw.startsWith("[") ? parseFloat(opacityRaw.slice(1, -1)) : parseFloat(opacityRaw) / 100
    if (isFinite(o)) return alpha(hex, o)
  }
  return hex
}

/** 클래스 문자열에서 특정 prefix(text/bg/border…)의 첫 색상을 찾음. prefix 생략 시 첫 번째 색상 토큰 */
export function twColor(classes: string | undefined | null, prefix?: "text" | "bg" | "border" | "from" | "via" | "to", fallback = "#ffffff"): string {
  if (!classes) return fallback
  for (const token of classes.split(/\s+/)) {
    if (!PREFIX.test(token)) continue
    if (prefix && !token.startsWith(prefix + "-")) continue
    const c = resolveToken(token)
    if (c) return c
  }
  return fallback
}

/** "from-x via-y to-z" (여러 문자열 가능) → 그라데이션 색상 배열 */
export function twGradient(...classes: (string | undefined | null)[]): string[] {
  const joined = classes.filter(Boolean).join(" ")
  const out: string[] = []
  for (const p of ["from", "via", "to"] as const) {
    const has = joined.split(/\s+/).some((t) => t.startsWith(p + "-"))
    if (has) out.push(twColor(joined, p))
  }
  if (out.length === 0) return ["#374151", "#1f2937"]
  if (out.length === 1) return [out[0], out[0]]
  return out
}
