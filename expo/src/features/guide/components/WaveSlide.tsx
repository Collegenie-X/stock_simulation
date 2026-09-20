import { StyleSheet, Text, View } from "react-native"
import { Gradient } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { SlideHeading } from "./SlideHeading"
import { WaveChart } from "./WaveChart"

/** 슬라이드 3 — 파도 이해하기 */
export function WaveSlide() {
  return (
    <View>
      <SlideHeading emoji="🌊" title="주식은 파도처럼 움직여요" desc="파도의 높낮이를 보고 타이밍을 잡으세요" />

      <Gradient dir="br" colors={[alpha(palette.blue[500], 0.1), alpha(palette.cyan[500], 0.1)]} style={styles.panel}>
        <View style={styles.chart}>
          <WaveChart />
        </View>

        <View style={styles.grid}>
          <View style={styles.cell}>
            <Text style={styles.cellEmoji}>📉</Text>
            <Text style={styles.cellTitle}>낮을 때 사기</Text>
            <Text style={styles.cellDesc}>파도 밑에서 매수</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.cellEmoji}>📈</Text>
            <Text style={styles.cellTitle}>높을 때 팔기</Text>
            <Text style={styles.cellDesc}>파도 위에서 매도</Text>
          </View>
        </View>
      </Gradient>

      <View style={styles.tip}>
        <Text style={styles.tipText}>💡 파도를 잘 타면 큰 수익을 얻을 수 있어요!</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  panel: { borderWidth: 1, borderColor: alpha(palette.blue[500], 0.3), borderRadius: 24, padding: 24, marginBottom: 24, overflow: "hidden" },
  chart: { height: 192 },
  grid: { flexDirection: "row", gap: 12, marginTop: 16 },
  cell: { flex: 1, backgroundColor: "#252525", borderRadius: 12, padding: 12, alignItems: "center", borderWidth: 1, borderColor: alpha("#ffffff", 0.05) },
  cellEmoji: { fontSize: 24, marginBottom: 4, color: "#ffffff" },
  cellTitle: { fontSize: 12, fontWeight: "700", color: "#ffffff" },
  cellDesc: { fontSize: 12, color: palette.gray[400] },
  tip: { backgroundColor: alpha(palette.yellow[500], 0.1), borderWidth: 1, borderColor: alpha(palette.yellow[500], 0.3), borderRadius: 16, padding: 16 },
  tipText: { fontSize: 14, color: palette.yellow[400], fontWeight: "600", textAlign: "center" },
})
