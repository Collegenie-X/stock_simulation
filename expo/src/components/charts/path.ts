/** SVG path 유틸 — 직선 / monotone-X 곡선 */
export interface Pt {
  x: number
  y: number
}

export function linePath(pts: Pt[]): string {
  if (pts.length === 0) return ""
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join("")
}

/** recharts `type="monotone"` 과 동일한 monotone cubic 보간 */
export function monotonePath(pts: Pt[]): string {
  const n = pts.length
  if (n < 3) return linePath(pts)
  const dx: number[] = []
  const slope: number[] = []
  for (let i = 0; i < n - 1; i++) {
    dx.push(pts[i + 1].x - pts[i].x)
    slope.push(dx[i] === 0 ? 0 : (pts[i + 1].y - pts[i].y) / dx[i])
  }
  const m: number[] = [slope[0]]
  for (let i = 1; i < n - 1; i++) {
    m.push(slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2)
  }
  m.push(slope[n - 2])
  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) {
      m[i] = 0
      m[i + 1] = 0
    } else {
      const a = m[i] / slope[i]
      const b = m[i + 1] / slope[i]
      const s = a * a + b * b
      if (s > 9) {
        const t = 3 / Math.sqrt(s)
        m[i] = t * a * slope[i]
        m[i + 1] = t * b * slope[i]
      }
    }
  }
  let d = `M${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3
    d += `C${(pts[i].x + h).toFixed(2)},${(pts[i].y + m[i] * h).toFixed(2)} ${(pts[i + 1].x - h).toFixed(2)},${(pts[i + 1].y - m[i + 1] * h).toFixed(2)} ${pts[i + 1].x.toFixed(2)},${pts[i + 1].y.toFixed(2)}`
  }
  return d
}

export function areaPath(line: string, pts: Pt[], baseY: number): string {
  if (!pts.length) return ""
  return `${line}L${pts[pts.length - 1].x.toFixed(2)},${baseY.toFixed(2)}L${pts[0].x.toFixed(2)},${baseY.toFixed(2)}Z`
}

/** 보기 좋은 눈금 생성 */
export function niceTicks(min: number, max: number, count = 4): number[] {
  if (!isFinite(min) || !isFinite(max)) return []
  if (min === max) return [min]
  const step = (max - min) / count
  return Array.from({ length: count + 1 }, (_, i) => min + step * i)
}
