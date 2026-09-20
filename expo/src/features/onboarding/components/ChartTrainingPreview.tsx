import { useEffect, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import Svg, { Circle, Defs, G, Line, LinearGradient, Stop, Text as SvgText } from "react-native-svg"
import { Gradient, PressableScale } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { monotonePath } from "@/components/charts"
import { DrawPath } from "./DrawPath"
import { FadeInPath } from "./FadeInPath"
import { PulseCircle } from "./PulseCircle"

const PRICE_PATH = [40, 38, 45, 42, 50, 55, 52, 60, 65, 62, 72, 78, 75, 85, 92, 98]

function buildSmoothPath(values: number[], w: number, h: number) {
  const step = w / (values.length - 1)
  const norm = (v: number) => h - (v / 100) * h * 0.85 - h * 0.05
  const pts = values.map((v, i) => [i * step, norm(v)] as const)
  // 웹의 Q/T 보간은 계단처럼 보여 monotone 곡선으로 개선
  const d = monotonePath(pts.map(([x, y]) => ({ x, y })))
  return { d, pts }
}

export function ChartTrainingPreview({ trigger }: { trigger: number }) {
  const W = 300, H = 110
  const { d, pts } = buildSmoothPath(PRICE_PATH, W, H)
  const last = pts[pts.length - 1]
  const buyIdx = 3
  const sellIdx = 11

  const [price, setPrice] = useState(132.4)
  useEffect(() => {
    let raf: number
    let t = 0
    const animate = () => {
      t += 0.06
      setPrice(132.4 + Math.sin(t) * 0.8 + Math.cos(t * 1.7) * 0.4)
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [trigger])

  return (
    <Gradient dir="b" colors={["#0a0a0a", "#050505"]} style={styles.root}>
      {/* 종목 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Gradient dir="br" colors={[palette.green[400], palette.emerald[600]]} style={styles.logo}>
            <Text style={styles.logoText}>N</Text>
          </Gradient>
          <View>
            <Text style={styles.name}>엔비디아</Text>
            <Text style={styles.ticker}>NVDA · NASDAQ</Text>
          </View>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.name, { fontVariant: ["tabular-nums"] }]}>${price.toFixed(2)}</Text>
          <Text style={styles.pct}>▲ +4.85%</Text>
        </View>
      </View>

      {/* 차트 */}
      <View style={styles.chart}>
        <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="ct-fill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#22c55e" stopOpacity={0.35} />
              <Stop offset="1" stopColor="#22c55e" stopOpacity={0} />
            </LinearGradient>
            <LinearGradient id="ct-stroke" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#10b981" />
              <Stop offset="1" stopColor="#22c55e" />
            </LinearGradient>
          </Defs>

          {/* 그리드 */}
          {[0.25, 0.5, 0.75].map((p) => (
            <Line key={p} x1={0} y1={H * p} x2={W} y2={H * p} stroke="#ffffff" strokeOpacity={0.03} strokeDasharray="2 4" />
          ))}

          {/* 영역 */}
          <FadeInPath d={`${d} L ${W},${H} L 0,${H} Z`} fill="url(#ct-fill)" duration={800} />

          {/* 라인 */}
          <DrawPath d={d} fill="none" stroke="url(#ct-stroke)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" length={600} duration={1200} />

          {/* 매수 시그널 */}
          <G transform={`translate(${pts[buyIdx][0]},${pts[buyIdx][1]})`}>
            <PulseCircle r={[6, 14]} opacity={[0.3, 0]} fill="#22c55e" duration={1600} />
            <Circle r={4} fill="#22c55e" stroke="#0a0a0a" strokeWidth={1.5} />
            <SvgText y={-10} textAnchor="middle" fontSize={8} fontWeight="900" fill="#22c55e">
              BUY
            </SvgText>
          </G>

          {/* 매도 시그널 */}
          <G transform={`translate(${pts[sellIdx][0]},${pts[sellIdx][1]})`}>
            <Circle r={4} fill="#ef4444" stroke="#0a0a0a" strokeWidth={1.5} />
            <SvgText y={-10} textAnchor="middle" fontSize={8} fontWeight="900" fill="#ef4444">
              SELL?
            </SvgText>
          </G>

          {/* 현재 점 */}
          <PulseCircle cx={last[0]} cy={last[1]} r={[6, 12]} opacity={[0.2, 0.2]} fill="#22c55e" duration={1800} />
          <Circle cx={last[0]} cy={last[1]} r={3.5} fill="#22c55e" stroke="#fff" strokeWidth={1} />
        </Svg>
      </View>

      {/* 액션 버튼 */}
      <View style={styles.actions}>
        <PressableScale scaleTo={0.95} style={[styles.action, { backgroundColor: alpha(palette.green[500], 0.2), borderColor: alpha(palette.green[500], 0.4) }]}>
          <Text style={[styles.actionText, { color: palette.green[400] }]}>살래</Text>
        </PressableScale>
        <PressableScale scaleTo={0.95} style={[styles.action, { backgroundColor: alpha(palette.red[500], 0.15), borderColor: alpha(palette.red[500], 0.3) }]}>
          <Text style={[styles.actionText, { color: palette.red[400] }]}>팔래</Text>
        </PressableScale>
        <PressableScale scaleTo={0.95} style={[styles.action, { backgroundColor: alpha("#ffffff", 0.05), borderColor: alpha("#ffffff", 0.1) }]}>
          <Text style={[styles.actionText, { color: palette.gray[400] }]}>기다릴게</Text>
        </PressableScale>
      </View>
    </Gradient>
  )
}

const styles = StyleSheet.create({
  root: { borderRadius: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05), overflow: "hidden" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: { width: 24, height: 24, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: 9, fontWeight: "900", color: "#000000" },
  name: { fontSize: 11, lineHeight: 12, fontWeight: "900", color: "#ffffff" },
  ticker: { fontSize: 8, color: palette.gray[500], marginTop: 2 },
  pct: { fontSize: 8, fontWeight: "900", color: palette.green[400], marginTop: 2 },
  chart: { height: 110, paddingHorizontal: 8 },
  actions: { flexDirection: "row", gap: 6, paddingHorizontal: 12, paddingBottom: 12, paddingTop: 4 },
  action: { flex: 1, height: 32, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  actionText: { fontSize: 10, fontWeight: "900" },
})
