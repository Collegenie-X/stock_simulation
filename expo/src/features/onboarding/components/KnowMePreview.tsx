import { StyleSheet, Text, View } from "react-native"
import Svg, { Defs, LinearGradient, Path, Stop, Text as SvgText } from "react-native-svg"
import { FadeUp, Float, Gradient, Heartbeat } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { monotonePath } from "@/components/charts"
import onboardingData from "../data.json"
import { densify, useReveal } from "./useReveal"

const { waves, strategy, insight } = onboardingData.knowMe
const W = 140, H = 50

const WAVES = waves.map((w) => {
  const values = densify(w.shape, 3)
  const pts = values.map((v, i) => ({ x: 4 + (i * (W - 24)) / (values.length - 1), y: H - 6 - (v / 100) * (H - 18) }))
  return { ...w, pts, strong: w.rate >= 20 }
})
const TOTAL = WAVES[0].pts.length

/** 슬라이드 3 — 파도(장) 종류마다 내가 얼마나 잘 타는지 보인다 */
export function KnowMePreview() {
  const n = useReveal(TOTAL, 80, 2600)

  return (
    <Gradient dir="b" colors={["#0a0a0a", "#050505"]} style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🪞 나의 거울</Text>
        <Text style={styles.headerSub}>파도마다 내 실력이 달라요</Text>
      </View>

      <View style={styles.body}>
        {/* 파도 4종 — 잘 타면 서핑, 약하면 허우적 */}
        <View style={styles.grid}>
          {WAVES.map((w, i) => {
            const color = w.strong ? "#22c55e" : "#fb7185"
            const shown = w.pts.slice(0, n)
            const tip = shown[shown.length - 1]
            const d = monotonePath(shown)
            return (
              <FadeUp key={w.label} delay={i * 110} duration={350} style={styles.cell}>
                <View style={[styles.wave, { borderColor: alpha(color, 0.3), backgroundColor: alpha(color, 0.06) }]}>
                  <View style={styles.waveHead}>
                    <Text numberOfLines={1} style={styles.waveLabel}>
                      {w.label}
                    </Text>
                    <Text style={[styles.waveRate, { color }]}>{w.rate}%</Text>
                  </View>
                  <View style={{ height: H }}>
                    <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
                      <Defs>
                        <LinearGradient id={`km-${i}`} x1="0" y1="0" x2="0" y2="1">
                          <Stop offset="0" stopColor={color} stopOpacity={0.35} />
                          <Stop offset="1" stopColor={color} stopOpacity={0} />
                        </LinearGradient>
                      </Defs>
                      <Path d={`${d} L ${tip.x},${H} L ${w.pts[0].x},${H} Z`} fill={`url(#km-${i})`} />
                      <Path d={d} fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
                      <SvgText x={tip.x + 4} y={tip.y - 2} textAnchor="middle" fontSize={15}>
                        {w.strong ? "🏄" : "😵"}
                      </SvgText>
                    </Svg>
                  </View>
                  <Text style={[styles.waveTag, { color }]}>{w.strong ? "잘 타요 😎" : "약해요 💦"}</Text>
                </View>
              </FadeUp>
            )
          })}
        </View>

        {/* 닮은 전략 */}
        <View style={styles.strategy}>
          <Float distance={4} duration={1800}>
            <Text style={styles.strategyEmoji}>{strategy.emoji}</Text>
          </Float>
          <View style={{ flex: 1 }}>
            <Text style={styles.strategyLabel}>나와 가장 닮은 전략</Text>
            <Text style={styles.strategyName}>{strategy.name}</Text>
          </View>
          <Heartbeat>
            <Text style={styles.strategyMatch}>{strategy.match}%</Text>
          </Heartbeat>
        </View>

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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: alpha("#ffffff", 0.05),
  },
  headerTitle: { fontSize: 10, fontWeight: "900", color: palette.rose[300] },
  headerSub: { fontSize: 8, color: palette.gray[500] },
  body: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 10, gap: 7 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  cell: { width: "48.9%" },
  wave: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 7, paddingTop: 6, paddingBottom: 5 },
  waveHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 4 },
  waveLabel: { flex: 1, fontSize: 9, fontWeight: "900", color: "#ffffff" },
  waveRate: { fontSize: 11, fontWeight: "900", fontVariant: ["tabular-nums"] },
  waveTag: { fontSize: 8, fontWeight: "700", textAlign: "right" },
  strategy: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: alpha(palette.rose[500], 0.3),
    backgroundColor: alpha(palette.rose[500], 0.08),
  },
  strategyEmoji: { fontSize: 20, color: "#ffffff" },
  strategyLabel: { fontSize: 8, color: palette.gray[400] },
  strategyName: { fontSize: 12, fontWeight: "900", color: "#ffffff", marginTop: 1 },
  strategyMatch: { fontSize: 16, fontWeight: "900", color: palette.rose[300], fontVariant: ["tabular-nums"] },
  comment: {
    backgroundColor: alpha(palette.rose[500], 0.1),
    borderWidth: 1,
    borderColor: alpha(palette.rose[500], 0.2),
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: "row",
    gap: 6,
  },
  commentEmoji: { fontSize: 12, lineHeight: 13, color: "#ffffff" },
  commentText: { flex: 1, fontSize: 9, lineHeight: 12.5, color: palette.rose[200] },
})
