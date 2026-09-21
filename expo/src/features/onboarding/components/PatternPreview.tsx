import { StyleSheet, Text, View } from "react-native"
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from "react-native-svg"
import { FadeUp, Gradient, Pop, Wiggle } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { monotonePath } from "@/components/charts"
import onboardingData from "../data.json"
import { PulseCircle } from "./PulseCircle"
import { densify, useReveal } from "./useReveal"

// 오르다 뚝 떨어짐 → 내가 팔자마자 다시 오르는 장면
const PRICE = densify([50, 56, 52, 62, 68, 64, 72, 34, 12, 22, 40, 58, 70, 80, 88, 96], 3)
const SELL = 8 * 3 // 바닥에서 판 지점
const W = 300, H = 110

const PTS = PRICE.map((v, i) => ({ x: 6 + (i * (W - 28)) / (PRICE.length - 1), y: H - (v / 100) * H * 0.8 - H * 0.1 }))

/** 슬라이드 1 — 선택 기록에서 내 버릇(행동 패턴)을 찾아낸다 */
export function PatternPreview() {
  const n = useReveal(PTS.length, 90, 2400)
  const { items, insight } = onboardingData.habits
  const shown = PTS.slice(0, n)
  const d = monotonePath(shown)
  const tip = shown[shown.length - 1]
  const sold = n > SELL
  const rebounded = n >= PTS.length - 6
  const face = !sold ? (n > SELL - 5 ? "😨" : "🙂") : rebounded ? "😭" : "😱"

  return (
    <Gradient dir="b" colors={["#0a0a0a", "#050505"]} style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📒 내 선택 기록</Text>
        <Text style={styles.headerSub}>정답 말고, 내 행동을 봐요</Text>
      </View>

      {/* 차트: 뚝 떨어질 때 팔고, 팔자마자 오르는 나 */}
      <View style={styles.chart}>
        <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
          <Defs>
            <LinearGradient id="pt-fill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#22c55e" stopOpacity={0.35} />
              <Stop offset="1" stopColor="#22c55e" stopOpacity={0} />
            </LinearGradient>
          </Defs>
          {[0.25, 0.5, 0.75].map((p) => (
            <Line key={p} x1={0} y1={H * p} x2={W} y2={H * p} stroke="#ffffff" strokeOpacity={0.04} strokeDasharray="2 4" />
          ))}
          {/* 뚝 떨어지는 구간 */}
          {n > 18 && <Rect x={PTS[18].x} y={0} width={PTS[28].x - PTS[18].x} height={H} fill="#ef4444" opacity={0.09} rx={4} />}
          <Path d={`${d} L ${tip.x},${H} L ${PTS[0].x},${H} Z`} fill="url(#pt-fill)" />
          <Path d={d} fill="none" stroke="#22c55e" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />

          {/* 판 지점 */}
          {sold && (
            <G transform={`translate(${PTS[SELL].x},${PTS[SELL].y})`}>
              <PulseCircle r={[6, 15]} opacity={[0.4, 0]} fill="#ef4444" duration={1400} />
              <Circle r={4.5} fill="#ef4444" stroke="#0a0a0a" strokeWidth={1.5} />
              <SvgText x={-8} y={4} textAnchor="end" fontSize={9} fontWeight="900" fill="#f87171">
                또 팔았다!
              </SvgText>
            </G>
          )}
          {/* 팔고 난 뒤 놓친 수익 */}
          {rebounded && (
            <G>
              <Line x1={PTS[SELL].x} y1={PTS[SELL].y} x2={tip.x} y2={PTS[SELL].y} stroke="#f87171" strokeWidth={1} strokeDasharray="3 3" />
              <Line x1={tip.x} y1={PTS[SELL].y} x2={tip.x} y2={tip.y + 8} stroke="#f87171" strokeWidth={1} strokeDasharray="3 3" />
              <SvgText x={tip.x - 6} y={(PTS[SELL].y + tip.y) / 2 + 6} textAnchor="end" fontSize={9} fontWeight="900" fill="#fca5a5">
                놓친 수익 💸
              </SvgText>
            </G>
          )}
          {/* 선 끝의 내 표정 */}
          <Circle cx={tip.x} cy={tip.y} r={3.5} fill="#22c55e" stroke="#ffffff" strokeWidth={1} />
          <SvgText x={tip.x + 2} y={tip.y - 7} textAnchor="middle" fontSize={15}>
            {face}
          </SvgText>
        </Svg>
      </View>

      {/* 찾아낸 버릇 */}
      <View style={styles.body}>
        <Text style={styles.sectionLabel}>🔎 찾아낸 내 버릇</Text>
        {items.map((h, i) => {
          const top = i === 0
          const count = top && !sold ? h.count - 1 : h.count
          return (
            <FadeUp key={h.name} delay={300 + i * 140} duration={350}>
              <View style={[styles.habit, top && styles.habitTop]}>
                {top && sold ? (
                  <Wiggle duration={500} degrees={12}>
                    <Text style={styles.habitEmoji}>{h.emoji}</Text>
                  </Wiggle>
                ) : (
                  <Text style={styles.habitEmoji}>{h.emoji}</Text>
                )}
                <Text style={styles.habitName}>{h.name}</Text>
                <Pop key={count}>
                  <Text style={[styles.habitCount, top && sold && { color: palette.red[300] }]}>{count}번</Text>
                </Pop>
                <Text style={styles.habitImpact}>{h.impact}</Text>
              </View>
            </FadeUp>
          )
        })}
        <View style={styles.comment}>
          <Text style={styles.commentEmoji}>💡</Text>
          <Text style={styles.commentText}>{insight}</Text>
        </View>
      </View>
    </Gradient>
  )
}

const styles = StyleSheet.create({
  root: { borderRadius: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05), overflow: "hidden" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingTop: 10, paddingBottom: 4 },
  headerTitle: { fontSize: 10, fontWeight: "900", color: palette.green[300] },
  headerSub: { fontSize: 8, color: palette.gray[500] },
  chart: { height: 118, paddingHorizontal: 6 },
  body: { paddingHorizontal: 12, paddingTop: 6, paddingBottom: 10, gap: 5 },
  sectionLabel: { fontSize: 9, fontWeight: "700", color: palette.gray[400], marginBottom: 1 },
  habit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: alpha("#ffffff", 0.06),
    backgroundColor: alpha("#ffffff", 0.03),
  },
  habitTop: { borderColor: alpha(palette.red[500], 0.35), backgroundColor: alpha(palette.red[500], 0.1) },
  habitEmoji: { fontSize: 13, color: "#ffffff" },
  habitName: { flex: 1, fontSize: 10, fontWeight: "900", color: "#ffffff" },
  habitCount: { fontSize: 10, fontWeight: "900", color: palette.gray[300], fontVariant: ["tabular-nums"] },
  habitImpact: { width: 38, textAlign: "right", fontSize: 10, fontWeight: "900", color: palette.red[400], fontVariant: ["tabular-nums"] },
  comment: {
    marginTop: 3,
    backgroundColor: alpha(palette.green[500], 0.1),
    borderWidth: 1,
    borderColor: alpha(palette.green[500], 0.2),
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: "row",
    gap: 6,
  },
  commentEmoji: { fontSize: 12, lineHeight: 13, color: "#ffffff" },
  commentText: { flex: 1, fontSize: 9, lineHeight: 12.5, color: palette.green[200] },
})
