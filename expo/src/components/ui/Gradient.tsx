/**
 * Gradient — 웹의 `bg-gradient-to-{dir} from-* via-* to-*` 를 대체
 *   <Gradient dir="r" colors={[palette.green[500], palette.emerald[400]]} style={...} />
 */
import React from "react"
import { LinearGradient, type LinearGradientProps } from "expo-linear-gradient"

type Dir = "t" | "b" | "l" | "r" | "tl" | "tr" | "bl" | "br"

const points: Record<Dir, { start: { x: number; y: number }; end: { x: number; y: number } }> = {
  t: { start: { x: 0.5, y: 1 }, end: { x: 0.5, y: 0 } },
  b: { start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 } },
  l: { start: { x: 1, y: 0.5 }, end: { x: 0, y: 0.5 } },
  r: { start: { x: 0, y: 0.5 }, end: { x: 1, y: 0.5 } },
  tl: { start: { x: 1, y: 1 }, end: { x: 0, y: 0 } },
  tr: { start: { x: 0, y: 1 }, end: { x: 1, y: 0 } },
  bl: { start: { x: 1, y: 0 }, end: { x: 0, y: 1 } },
  br: { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
}

export interface GradientProps extends Omit<LinearGradientProps, "colors" | "start" | "end"> {
  /** Tailwind 방향 접미사 (bg-gradient-to-br → "br") */
  dir?: Dir
  colors: readonly string[]
}

export function Gradient({ dir = "b", colors, ...rest }: GradientProps) {
  const c = (colors.length >= 2 ? colors : [colors[0], colors[0]]) as unknown as readonly [string, string, ...string[]]
  return <LinearGradient colors={c} start={points[dir].start} end={points[dir].end} {...rest} />
}
