/**
 * TrendLine — 왼쪽에서 오른쪽으로 그려지는 추이 그래프 (순위 추이 등)
 * higherIsBetter=false 이면 값이 작을수록 위쪽에 표시합니다(순위).
 */
import { useEffect, useId, useMemo, useRef, useState } from "react"
import { Animated, Easing, StyleSheet, Text, View } from "react-native"
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg"
import { monotonePath } from "@/components/charts"
import { Ping } from "@/components/ui"
import { palette } from "@/theme"

interface TrendLineProps {
  values: number[]
  labels?: string[]
  color: string
  height?: number
  higherIsBetter?: boolean
  /** 마지막 점 위 말풍선 */
  lastLabel?: string
}

export function TrendLine({ values, labels, color, height = 72, higherIsBetter = true, lastLabel }: TrendLineProps) {
  const uid = "tl" + useId().replace(/[^a-zA-Z0-9]/g, "")
  const [width, setWidth] = useState(0)
  const reveal = useRef(new Animated.Value(0)).current
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!width) return
    reveal.setValue(0)
    setDone(false)
    const anim = Animated.timing(reveal, { toValue: 1, duration: 1400, delay: 300, easing: Easing.inOut(Easing.cubic), useNativeDriver: false })
    anim.start(({ finished }) => finished && setDone(true))
    return () => anim.stop()
  }, [width, reveal])

  const { line, area, pts } = useMemo(() => {
    if (!width || values.length < 2) return { line: "", area: "", pts: [] as { x: number; y: number }[] }
    const padX = 8
    const padTop = 22
    const padBottom = 8
    const lo = Math.min(...values)
    const hi = Math.max(...values)
    const span = hi - lo || 1
    const p = values.map((v, i) => {
      const t = (v - lo) / span
      const yNorm = higherIsBetter ? 1 - t : t
      return { x: padX + (i / (values.length - 1)) * (width - padX * 2), y: padTop + yNorm * (height - padTop - padBottom) }
    })
    const l = monotonePath(p)
    return { line: l, area: `${l}L${p[p.length - 1].x},${height}L${p[0].x},${height}Z`, pts: p }
  }, [width, values, height, higherIsBetter])

  const last = pts[pts.length - 1]

  return (
    <View>
      <View style={{ height }} onLayout={(e) => setWidth(Math.round(e.nativeEvent.layout.width))}>
        {width > 0 && (
          <Animated.View style={{ height, overflow: "hidden", width: reveal.interpolate({ inputRange: [0, 1], outputRange: [0, width] }) }}>
            <Svg width={width} height={height}>
              <Defs>
                <LinearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={color} stopOpacity={0.35} />
                  <Stop offset="1" stopColor={color} stopOpacity={0} />
                </LinearGradient>
              </Defs>
              <Path d={area} fill={`url(#${uid})`} />
              <Path d={line} stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              {pts.slice(0, -1).map((p, i) => (
                <Circle key={i} cx={p.x} cy={p.y} r={2.5} fill="#1e1e2e" stroke={color} strokeWidth={1.5} />
              ))}
            </Svg>
          </Animated.View>
        )}
        {done && !!last && (
          <>
            <Ping duration={1600} scaleTo={2.6} style={[styles.dot, { left: last.x - 5, top: last.y - 5, backgroundColor: color }]} />
            <View style={[styles.dot, { left: last.x - 5, top: last.y - 5, backgroundColor: color, borderWidth: 2, borderColor: "#ffffff" }]} />
            {!!lastLabel && (
              <View style={[styles.bubble, { right: Math.max(0, width - last.x - 22), top: Math.max(0, last.y - 26), backgroundColor: color }]}>
                <Text style={styles.bubbleText}>{lastLabel}</Text>
              </View>
            )}
          </>
        )}
      </View>
      {!!labels && (
        <View style={styles.labels}>
          {labels.map((l, i) => (
            <Text key={i} style={[styles.label, i === labels.length - 1 && { color: "#ffffff", fontWeight: "800" }]}>
              {l}
            </Text>
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  dot: { position: "absolute", width: 10, height: 10, borderRadius: 5 },
  bubble: { position: "absolute", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  bubbleText: { fontSize: 10, fontWeight: "900", color: "#0b0b12" },
  labels: { flexDirection: "row", justifyContent: "space-between", marginTop: 4, paddingHorizontal: 2 },
  label: { fontSize: 9, color: palette.gray[600] },
})
