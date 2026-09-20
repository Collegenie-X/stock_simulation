import { StyleSheet, Text, View } from "react-native"
import { FadeUp, PressableScale, Pulse } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { AiBattleSvg } from "./why/AiBattleSvg"
import { HotStocksSvg } from "./why/HotStocksSvg"
import { BigMoneyMindSvg } from "./why/BigMoneyMindSvg"
import { DailyCardsSvg } from "./why/DailyCardsSvg"

// ─── Card Data ────────────────────────────────────────────────────────────────

const CARDS = [
  {
    Svg: AiBattleSvg,
    color: "#3182F6",
    badge: "01",
    title: "닮은꼴 AI와 대결",
    action: "내 패턴 AI가 짚어줘",
  },
  {
    Svg: HotStocksSvg,
    color: "#F04452",
    badge: "02",
    title: "올해 핫종목 시뮬레이션",
    action: "1년 내 진짜 종목으로",
  },
  {
    Svg: BigMoneyMindSvg,
    color: "#fbbf24",
    badge: "03",
    title: "5억에도 평정심",
    action: "돈 크기에 안 흔들리기",
  },
  {
    Svg: DailyCardsSvg,
    color: "#10B981",
    badge: "04",
    title: "하루 3번 즉답 카드",
    action: "골라→ 바로 결과 피드백",
  },
]

export default function WhySimulation() {
  return (
    <View style={styles.root}>
      <View style={styles.head}>
        <View>
          <Text style={styles.kicker}>▸ WHY PLAY</Text>
          <Text style={styles.title}>실전 전, 4단계 시뮬레이션</Text>
        </View>
        <Text style={styles.count}>4 STAGES</Text>
      </View>

      <View style={styles.grid}>
        {CARDS.map((c, i) => {
          const Svg = c.Svg
          return (
            <FadeUp key={c.title} delay={i * 80} duration={400} style={styles.cell}>
              <PressableScale scaleTo={0.97} style={styles.card}>
                <View style={styles.cardHead}>
                  <Text style={[styles.stage, { color: c.color }]}>STAGE {c.badge}</Text>
                  <Pulse>
                    <View style={[styles.dot, { backgroundColor: c.color }]} />
                  </Pulse>
                </View>

                <View style={styles.art}>
                  <Svg />
                </View>

                <Text style={styles.cardTitle}>{c.title}</Text>
                <Text style={styles.cardAction}>{c.action}</Text>
              </PressableScale>
            </FadeUp>
          )
        })}
      </View>

      <View style={styles.footer}>
        <Pulse>
          <View style={styles.footerDot} />
        </Pulse>
        <Text style={styles.footerText}>지금 바로 시작 가능</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { marginHorizontal: 20 },
  head: { marginBottom: 12, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  kicker: { fontSize: 11, fontWeight: "900", color: palette.yellow[400], letterSpacing: 2.2 },
  title: { fontSize: 16, fontWeight: "900", color: "#ffffff", marginTop: 2 },
  count: { fontSize: 10, color: palette.gray[500], fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 },
  cell: { width: "48.5%" },
  card: { overflow: "hidden", backgroundColor: "#1e1e2e", borderRadius: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.08), padding: 12 },
  cardHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  stage: { fontSize: 9, fontWeight: "900", letterSpacing: 0.9 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  art: { width: "100%", aspectRatio: 3 / 2, marginBottom: 10, borderRadius: 8, overflow: "hidden" },
  cardTitle: { fontSize: 12, fontWeight: "900", color: "#ffffff", lineHeight: 15, marginBottom: 2 },
  cardAction: { fontSize: 10, color: palette.gray[400], fontWeight: "500", lineHeight: 13 },
  footer: { marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  footerDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: palette.green[400] },
  footerText: { fontSize: 11, color: palette.gray[500], fontWeight: "700" },
})
