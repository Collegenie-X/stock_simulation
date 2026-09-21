import { StyleSheet, Text, View } from "react-native"
import Svg, { G, Line, Path, Rect, Text as SvgText } from "react-native-svg"
import { FadeUp, Gradient, Pop } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { monotonePath } from "@/components/charts"
import onboardingData from "../data.json"
import { densify, useReveal } from "./useReveal"

const { data, sellTurn, insight } = onboardingData.comparisonChart
const SUB = 5
const W = 300, H = 132, PAD_L = 8, PAD_R = 26, MIN = 96, MAX = 138

// 순위가 아니라 "같은 조건의 네 갈래 길" — 같은 돈 · 같은 종목 · 같은 순간
const PATHS = [
  { who: "best", emoji: "🎯", label: "최고의 선택", color: "#eab308", width: 1.8, dash: "5 4", bg: alpha(palette.yellow[500], 0.12), border: alpha(palette.yellow[500], 0.3) },
  { who: "hold", emoji: "🪨", label: "안 팔고 버티기", color: "#9ca3af", width: 1.6, dash: undefined, bg: alpha("#ffffff", 0.05), border: alpha("#ffffff", 0.12) },
  { who: "similarAI", emoji: "🤖", label: "나를 닮은 AI", color: "#818cf8", width: 2, dash: "5 4", bg: alpha(palette.indigo[500], 0.12), border: alpha(palette.indigo[500], 0.3) },
  { who: "user", emoji: "🧑", label: "나", color: "#22c55e", width: 2.8, dash: undefined, bg: alpha(palette.green[500], 0.14), border: alpha(palette.green[500], 0.35) },
] as const

const SERIES = PATHS.map((p) => {
  const values = densify(data.map((row) => row[p.who]), SUB)
  const pts = values.map((v, i) => ({
    x: PAD_L + (i * (W - PAD_L - PAD_R)) / (values.length - 1),
    y: H - 14 - ((v - MIN) / (MAX - MIN)) * (H - 28),
  }))
  return { ...p, values, pts }
})
const TOTAL = SERIES[0].pts.length
const SELL_I = (sellTurn - 1) * SUB

/** 슬라이드 2 — 내가 간 길과 가지 않은 길이 같은 순간에서 함께 달린다 */
export function ComparePreview() {
  const n = useReveal(TOTAL, 110, 2600)
  const turn = Math.min(data.length, Math.floor((n - 1) / SUB) + 1)
  const done = n >= TOTAL
  const sellX = SERIES[3].pts[SELL_I].x

  return (
    <Gradient dir="b" colors={["#0a0a0a", "#050505"]} style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔀 가지 않은 길</Text>
        <Text style={styles.headerSub}>같은 돈 · 같은 종목 · 같은 순간</Text>
        <View style={styles.turnPill}>
          <Text style={styles.turnText}>{turn}/8턴</Text>
        </View>
      </View>

      {/* 네 갈래 길이 함께 달리는 차트 */}
      <View style={styles.chart}>
        <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
          {[0.25, 0.5, 0.75].map((p) => (
            <Line key={p} x1={0} y1={H * p} x2={W} y2={H * p} stroke="#ffffff" strokeOpacity={0.04} strokeDasharray="2 4" />
          ))}
          {/* 갈림길: 내가 판 순간 */}
          {n > SELL_I && (
            <G>
              <Rect x={sellX - 1} y={6} width={2} height={H - 18} fill="#ef4444" opacity={0.5} rx={1} />
              <SvgText x={sellX + 5} y={H - 6} fontSize={8.5} fontWeight="900" fill="#f87171">
                😱 여기서 다 팔았죠
              </SvgText>
            </G>
          )}
          {SERIES.map((s) => {
            const shown = s.pts.slice(0, n)
            const tip = shown[shown.length - 1]
            return (
              <G key={s.who}>
                <Path d={monotonePath(shown)} fill="none" stroke={s.color} strokeWidth={s.width} strokeDasharray={s.dash} strokeLinecap="round" strokeLinejoin="round" />
                <SvgText x={tip.x + 9} y={tip.y + 5} textAnchor="middle" fontSize={s.who === "user" ? 15 : 12}>
                  {s.emoji}
                </SvgText>
              </G>
            )
          })}
        </Svg>
      </View>

      {/* 지금 이 순간의 결과 (차트와 함께 숫자가 움직임) */}
      <View style={styles.body}>
        <View style={styles.cards}>
          {[...SERIES].reverse().map((s) => {
            const v = s.values[n - 1] - 100
            return (
              <View key={s.who} style={[styles.card, { backgroundColor: s.bg, borderColor: s.border }]}>
                <Text style={styles.cardEmoji}>{s.emoji}</Text>
                <Text numberOfLines={1} style={styles.cardLabel}>
                  {s.label}
                </Text>
                <Text style={[styles.cardValue, { color: s.color }]}>
                  {v >= 0 ? "+" : ""}
                  {v.toFixed(1)}%
                </Text>
              </View>
            )
          })}
        </View>

        <View style={styles.comment}>
          <Text style={styles.commentEmoji}>💬</Text>
          {done ? (
            <Pop style={{ flex: 1 }}>
              <Text style={styles.commentText}>{insight}</Text>
            </Pop>
          ) : (
            <FadeUp key="run" style={{ flex: 1 }}>
              <Text style={[styles.commentText, { color: palette.gray[500] }]}>네 갈래 길이 같이 달리는 중…</Text>
            </FadeUp>
          )}
        </View>
      </View>
    </Gradient>
  )
}

const styles = StyleSheet.create({
  root: { borderRadius: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05), overflow: "hidden" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: alpha("#ffffff", 0.05),
  },
  headerTitle: { fontSize: 10, fontWeight: "900", color: palette.indigo[300] },
  headerSub: { flex: 1, fontSize: 8, color: palette.gray[500] },
  turnPill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 9999, backgroundColor: alpha(palette.indigo[500], 0.2) },
  turnText: { fontSize: 9, fontWeight: "900", color: palette.indigo[200], fontVariant: ["tabular-nums"] },
  chart: { height: 140, paddingHorizontal: 6, paddingTop: 4 },
  body: { paddingHorizontal: 12, paddingTop: 4, paddingBottom: 10 },
  cards: { flexDirection: "row", gap: 5 },
  card: { flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 2, paddingVertical: 6, alignItems: "center" },
  cardEmoji: { fontSize: 14, lineHeight: 17, color: "#ffffff" },
  cardLabel: { fontSize: 7.5, fontWeight: "700", color: palette.gray[400], marginTop: 1 },
  cardValue: { fontSize: 11, lineHeight: 13, fontWeight: "900", marginTop: 2, fontVariant: ["tabular-nums"] },
  comment: {
    marginTop: 8,
    minHeight: 26,
    backgroundColor: alpha(palette.indigo[500], 0.1),
    borderWidth: 1,
    borderColor: alpha(palette.indigo[500], 0.2),
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  commentEmoji: { fontSize: 12, lineHeight: 14, color: "#ffffff" },
  commentText: { fontSize: 9, lineHeight: 12.5, color: palette.indigo[200] },
})
