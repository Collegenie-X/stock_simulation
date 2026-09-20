/**
 * 스플래시 배경 차트 — 웹의 canvas 실시간 드로잉을 react-native-svg 로 대체
 */
import { useEffect, useMemo, useState } from "react"
import { View, type LayoutChangeEvent } from "react-native"
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg"

const POINTS = [
  65, 58, 62, 55, 48, 52, 45, 38, 42, 35, 28,
  32, 25, 30, 22, 18, 15, 12, 8, 10, 15,
  12, 18, 22, 28, 25, 32, 38, 35, 42, 48,
  45, 52, 58, 55, 62, 68, 65, 72, 78, 75,
  82, 88, 85, 90, 95, 92, 96, 98,
]

export function AnimatedChart() {
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [count, setCount] = useState(2)

  useEffect(() => {
    const id = setInterval(() => setCount((c) => (c >= POINTS.length ? c : c + 1)), 45)
    return () => clearInterval(id)
  }, [])

  const onLayout = (e: LayoutChangeEvent) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })

  const { line, area, last } = useMemo(() => {
    const { w, h } = size
    if (!w || !h) return { line: "", area: "", last: { x: 0, y: 0 } }
    const xStep = w / (POINTS.length - 1)
    const norm = (v: number) => h - (v / 100) * h * 0.8 - h * 0.1
    const pts = POINTS.slice(0, count).map((v, i) => ({ x: i * xStep, y: norm(v) }))
    const l = pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join("")
    const lastPt = pts[pts.length - 1]
    return { line: l, area: `${l}L${lastPt.x.toFixed(1)},${h}L0,${h}Z`, last: lastPt }
  }, [size, count])

  return (
    <View style={{ flex: 1 }} onLayout={onLayout}>
      {size.w > 0 && (
        <Svg width={size.w} height={size.h}>
          <Defs>
            <LinearGradient id="splashArea" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#22c55e" stopOpacity={0.4} />
              <Stop offset="0.5" stopColor="#22c55e" stopOpacity={0.2} />
              <Stop offset="1" stopColor="#22c55e" stopOpacity={0} />
            </LinearGradient>
            <LinearGradient id="splashLine" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#10b981" />
              <Stop offset="0.5" stopColor="#22c55e" />
              <Stop offset="1" stopColor="#34d399" />
            </LinearGradient>
          </Defs>
          <Path d={area} fill="url(#splashArea)" />
          <Path d={line} stroke="rgba(34,197,94,0.5)" strokeWidth={8} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          <Path d={line} stroke="url(#splashLine)" strokeWidth={4} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          <Circle cx={last.x} cy={last.y} r={14} fill="rgba(34,197,94,0.2)" />
          <Circle cx={last.x} cy={last.y} r={9} fill="rgba(34,197,94,0.4)" />
          <Circle cx={last.x} cy={last.y} r={5} fill="#22c55e" />
        </Svg>
      )}
    </View>
  )
}
