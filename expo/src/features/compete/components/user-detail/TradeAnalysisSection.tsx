import { StyleSheet, Text, View } from "react-native"
import { Gradient } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { tradeAnalysis } from "./data"
import { sectionStyles } from "./sectionStyles"

export function TradeAnalysisSection() {
  return (
    <View style={sectionStyles.card}>
      <Text style={[sectionStyles.title, { marginBottom: 8 }]}>언제 사고 팔았나요?</Text>
      <Text style={sectionStyles.subtitle}>파도의 어느 부분에서 결정했는지 볼까요?</Text>

      <View style={{ gap: 12 }}>
        {tradeAnalysis.map((trade, idx) => {
          const isBuy = trade.action === "buy"
          const timing =
            trade.timing === "완벽"
              ? { bg: palette.green[100], text: palette.green[700] }
              : trade.timing === "우수"
                ? { bg: palette.blue[100], text: palette.blue[700] }
                : { bg: palette.orange[100], text: palette.orange[700] }

          return (
            <Gradient key={idx} dir="r" colors={[palette.cyan[50], palette.blue[50], palette.purple[50]]} style={styles.card}>
              <View style={styles.top}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Text style={{ fontSize: 30, color: palette.gray[900] }}>{isBuy ? "🏄" : "🎯"}</Text>
                  <View>
                    <Text style={{ fontWeight: "700", fontSize: 16, color: isBuy ? palette.red[600] : palette.green[600] }}>{isBuy ? "매수 (사기)" : "매도 (팔기)"}</Text>
                    <Text style={styles.gray12}>{trade.date}</Text>
                  </View>
                </View>
                <Text style={styles.result}>{trade.result}</Text>
              </View>

              <View style={styles.detail}>
                <View style={styles.detailRow}>
                  <Text style={styles.gray12}>파도 위치</Text>
                  <Text style={[styles.detailValue, { fontWeight: "700", color: palette.purple[600] }]}>{trade.wavePoint}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.gray12}>한 마디로</Text>
                  <Text style={[styles.detailValue, { fontWeight: "600", color: palette.blue[600] }]}>{trade.desc}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.gray12}>평가</Text>
                  <View style={[styles.timing, { backgroundColor: timing.bg }]}>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: timing.text }}>{trade.timing}</Text>
                  </View>
                </View>
              </View>
            </Gradient>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, borderLeftWidth: 4, borderLeftColor: palette.cyan[400], boxShadow: "0 4px 6px rgba(0,0,0,0.1)" },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  gray12: { fontSize: 12, color: palette.gray[500] },
  result: { fontSize: 24, fontWeight: "700", color: palette.green[600] },
  detail: { backgroundColor: alpha("#ffffff", 0.8), borderRadius: 12, padding: 12, gap: 8 },
  detailRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  detailValue: { fontSize: 14, flexShrink: 1, textAlign: "right" },
  timing: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9999 },
})
