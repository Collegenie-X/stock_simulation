import { useEffect, useMemo, useRef, useState } from "react"
import { StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native"
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg"
import { CHART_VARIANTS, CHART_COLORS } from "../config"

interface AnimatedMiniChartProps {
  variant: number
  accent: string
  trigger?: number | boolean
  style?: StyleProp<ViewStyle>
}

const TOTAL_FRAMES = 80
const PAD = { x: 8, y: 10 }

/** 웹의 <canvas> 드로잉을 react-native-svg + frame state 로 재구현 */
export default function AnimatedMiniChart({ variant, accent, trigger, style }: AnimatedMiniChartProps) {
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [frame, setFrame] = useState(0)
  const rafRef = useRef<number>(0)

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout
    if (width !== size.w || height !== size.h) setSize({ w: width, h: height })
  }

  useEffect(() => {
    let f = 0
    setFrame(0)
    const tick = () => {
      f++
      setFrame(f)
      if (f <= TOTAL_FRAMES + 40) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [variant, accent, trigger])

  const points = CHART_VARIANTS[variant] ?? CHART_VARIANTS[0]
  const colors = CHART_COLORS[accent] ?? CHART_COLORS.green
  const W = size.w || 300
  const H = size.h || 100

  const progress = Math.min(frame / TOTAL_FRAMES, 1)
  const visibleCount = Math.max(2, Math.round(progress * (points.length - 1)))

  const { linePath, areaPath, last } = useMemo(() => {
    const toX = (i: number, total: number) => PAD.x + (i / (total - 1)) * (W - PAD.x * 2)
    const toY = (v: number) => PAD.y + ((100 - v) / 100) * (H - PAD.y * 2)

    const pts: { x: number; y: number }[] = []
    for (let i = 0; i <= visibleCount && i < points.length; i++) {
      pts.push({ x: toX(i, points.length), y: toY(points[i]) })
    }
    let curve = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 1; i < pts.length; i++) {
      const cpx = (pts[i - 1].x + pts[i].x) / 2
      const cpy = (pts[i - 1].y + pts[i].y) / 2
      curve += ` Q ${pts[i - 1].x} ${pts[i - 1].y} ${cpx} ${cpy}`
    }
    const lastPt = pts[pts.length - 1]
    return {
      linePath: `${curve} L ${lastPt.x} ${lastPt.y}`,
      // 곡선은 마지막 구간의 중점에서 끝나므로, 마지막 점까지 이은 뒤 아래로 닫아야 모서리가 비스듬해지지 않는다
      areaPath: `${curve} L ${lastPt.x} ${lastPt.y} L ${lastPt.x} ${H} L ${pts[0].x} ${H} Z`,
      last: lastPt,
    }
  }, [W, H, visibleCount, points])

  const dotR = 3 + Math.sin(frame * 0.15) * 1.2
  const gradId = `miniChartFill-${accent}`

  return (
    <View style={[styles.fill, style]} onLayout={onLayout} pointerEvents="none">
      {size.w > 0 && (
        <Svg width={W} height={H}>
          <Defs>
            <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.stroke} stopOpacity={accent === "green" ? 0.25 : 0.2} />
              <Stop offset="1" stopColor={colors.stroke} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path d={areaPath} fill={`url(#${gradId})`} />
          <Path d={linePath} stroke={colors.stroke} strokeWidth={2} fill="none" />
          <Circle cx={last.x} cy={last.y} r={dotR + 4} fill={colors.dot.replace("0.8", "0.15")} />
          <Circle cx={last.x} cy={last.y} r={dotR} fill={colors.dot} />
        </Svg>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { width: "100%", height: "100%" },
})
