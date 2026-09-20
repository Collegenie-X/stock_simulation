import { useCallback, useEffect, useRef, useState } from "react"
import { StyleSheet, Text, View, type LayoutChangeEvent } from "react-native"
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg"
import { Play, TrendingUp } from "lucide-react-native"
import { Gradient, PressableScale, Pulse } from "@/components/ui"
import { palette } from "@/theme"
import { PulseCircle } from "./svg/PulseCircle"

function generateChartData(length: number): number[] {
  const data: number[] = [50]
  let trend = (Math.random() - 0.5) * 2
  let momentum = 0

  for (let i = 1; i < length; i++) {
    const prev = data[i - 1]

    if (Math.random() < 0.08) {
      trend = (Math.random() - 0.5) * 4
    }

    if (Math.random() < 0.12) {
      momentum = (Math.random() - 0.5) * 15
    } else {
      momentum *= 0.7
    }

    const noise = (Math.random() - 0.5) * 8
    const change = trend + momentum + noise

    const meanRevert = (50 - prev) * 0.02
    const next = prev + change + meanRevert

    data.push(Math.max(8, Math.min(92, next)))
  }
  return data
}

function toSvgPath(data: number[], stepX: number, height: number): string {
  if (data.length < 2) return ""
  const points = data.map((v, i) => ({
    x: i * stepX,
    y: height - (v / 100) * height,
  }))

  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const cp1x = points[i - 1].x + stepX * 0.4
    const cp1y = points[i - 1].y
    const cp2x = points[i].x - stepX * 0.4
    const cp2y = points[i].y
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i].x} ${points[i].y}`
  }
  return d
}

interface HeroChartProps {
  onPlay: () => void
  bestReturn?: number
  gamesPlayed?: number
}

const H = 220

export default function HeroChart({ onPlay, bestReturn = 0, gamesPlayed = 0 }: HeroChartProps) {
  const [chartData, setChartData] = useState<number[]>(() => generateChartData(60))
  const [visibleLength, setVisibleLength] = useState(1)
  const [W, setW] = useState(0)
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dataRef = useRef(chartData)

  const animate = useCallback(() => {
    setVisibleLength((prev) => {
      if (prev >= dataRef.current.length) {
        const newData = generateChartData(60)
        dataRef.current = newData
        setChartData(newData)
        return 1
      }
      return prev + 1
    })
    animRef.current = setTimeout(() => animate(), 60)
  }, [])

  useEffect(() => {
    animate()
    return () => {
      if (animRef.current) clearTimeout(animRef.current)
    }
  }, [animate])

  const onLayout = (e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width)
    if (w !== W) setW(w)
  }

  const visible = chartData.slice(0, visibleLength)
  // 웹은 viewBox 400x200 + preserveAspectRatio="none" — 앱은 실제 픽셀 크기로 직접 계산
  const stepX = W / (chartData.length - 1)
  const path = toSvgPath(visible, stepX, H)
  const lastY = visible.length > 0 ? H - (visible[visible.length - 1] / 100) * H : H / 2
  const lastX = ((visible.length - 1) / (chartData.length - 1)) * W
  const isUp = visible.length > 1 && visible[visible.length - 1] > visible[0]
  const strokeColor = isUp ? "#F04452" : "#3182F6"

  const changePercent =
    visible.length > 1
      ? (((visible[visible.length - 1] - visible[0]) / visible[0]) * 100).toFixed(1)
      : "0.0"

  const areaPath = path ? `${path} L ${lastX} ${H} L 0 ${H} Z` : ""

  return (
    <View style={styles.root} onLayout={onLayout}>
      <Gradient dir="b" colors={["#1a1a2e", "#16162a"]} style={StyleSheet.absoluteFill} />

      <View style={{ height: H }}>
        {W > 0 && (
          <Svg width={W} height={H}>
            <Defs>
              <LinearGradient id="hero-gradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={strokeColor} stopOpacity={0.35} />
                <Stop offset="1" stopColor={strokeColor} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            {!!areaPath && <Path d={areaPath} fill="url(#hero-gradient)" />}
            {!!path && (
              <>
                {/* glow (feGaussianBlur 대체) */}
                <Path d={path} fill="none" stroke={strokeColor} strokeOpacity={0.15} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
                <Path d={path} fill="none" stroke={strokeColor} strokeOpacity={0.25} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
                <Path d={path} fill="none" stroke={strokeColor} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
              </>
            )}
            {visible.length > 1 && (
              <>
                <PulseCircle cx={lastX} cy={lastY} r={[6, 14]} opacity={[0.5, 0.1]} fill={strokeColor} duration={1200} />
                <Circle cx={lastX} cy={lastY} r={4} fill={strokeColor} />
              </>
            )}
          </Svg>
        )}
      </View>

      {/* Live price indicator */}
      {visible.length > 5 && (
        <View style={styles.live}>
          <View style={styles.liveRow}>
            <Pulse>
              <View style={styles.liveDot} />
            </Pulse>
            <Text style={styles.liveLabel}>LIVE</Text>
          </View>
          <Text style={[styles.liveValue, { color: isUp ? palette.red[400] : palette.blue[400] }]}>
            {isUp ? "+" : ""}
            {changePercent}%
          </Text>
        </View>
      )}

      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.titleWrap}>
          <Text style={styles.kicker}>STOCK WAVE GAME</Text>
          <Text style={styles.title}>차트를 읽고,{"\n"}파도를 타라</Text>
        </View>

        <PressableScale onPress={onPlay} scaleTo={0.95} pressedOpacity={1} style={styles.ctaWrap}>
          {/* blur-xl 글로우 대체 */}
          <Pulse style={styles.ctaGlow}>
            <Gradient dir="r" colors={[palette.orange[500], palette.red[500]]} style={styles.ctaGlowFill} />
          </Pulse>
          <Gradient dir="r" colors={[palette.orange[500], palette.red[500]]} style={styles.cta}>
            <Play size={20} color="#ffffff" fill="#ffffff" />
            <Text style={styles.ctaText}>지금 도전하기</Text>
          </Gradient>
        </PressableScale>

        <View style={styles.meta}>
          {gamesPlayed > 0 && <Text style={styles.metaPlayed}>{gamesPlayed}판 플레이</Text>}
          {bestReturn !== 0 && (
            <View style={styles.metaBest}>
              <TrendingUp size={12} color={bestReturn > 0 ? palette.red[400] : palette.blue[400]} />
              <Text style={[styles.metaBestText, { color: bestReturn > 0 ? palette.red[400] : palette.blue[400] }]}>
                최고 {bestReturn > 0 ? "+" : ""}
                {bestReturn.toFixed(1)}%
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { marginHorizontal: 20, borderRadius: 24, overflow: "hidden" },
  live: { position: "absolute", top: 16, right: 16, zIndex: 3, alignItems: "flex-end" },
  liveRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: palette.emerald[400] },
  liveLabel: { fontSize: 10, color: palette.gray[500] },
  liveValue: { fontSize: 18, fontWeight: "900", fontVariant: ["tabular-nums"] },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 2, alignItems: "center", justifyContent: "center" },
  titleWrap: { alignItems: "center", marginBottom: 16 },
  kicker: { fontSize: 10, color: palette.gray[500], marginBottom: 6, letterSpacing: 2, fontWeight: "500" },
  title: { fontSize: 24, lineHeight: 30, fontWeight: "900", color: "#ffffff", letterSpacing: -0.4, textAlign: "center" },
  ctaWrap: { alignItems: "center", justifyContent: "center" },
  ctaGlow: { position: "absolute", top: -6, bottom: -6, left: -10, right: -10 },
  ctaGlowFill: { flex: 1, borderRadius: 9999, opacity: 0.3 },
  cta: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 36, paddingVertical: 16, borderRadius: 9999, opacity: 0.95, boxShadow: "0 0 24px rgba(249,115,22,0.5)" },
  ctaText: { fontSize: 15, fontWeight: "700", color: "#ffffff" },
  meta: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 12 },
  metaPlayed: { fontSize: 11, color: palette.gray[400] },
  metaBest: { flexDirection: "row", alignItems: "center", gap: 2 },
  metaBestText: { fontSize: 11, fontWeight: "500" },
})
