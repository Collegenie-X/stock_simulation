import { StyleSheet, Text, View } from "react-native"
import { Waves } from "lucide-react-native"
import { Gradient } from "@/components/ui"
import { alpha, palette } from "@/theme"

/** 파도 타기 정확도 (실전 시뮬레이션 결과) */
export function WaveAccuracyCard({ waveAccuracy }: { waveAccuracy: number }) {
  return (
    <View style={styles.panel}>
      <View style={styles.head}>
        <Waves size={20} color={palette.cyan[400]} />
        <Text style={styles.title}>파도 타기 정확도</Text>
        <Text style={styles.value}>{waveAccuracy}%</Text>
      </View>
      <View style={styles.track}>
        <Gradient dir="r" colors={[palette.cyan[400], palette.blue[500]]} style={{ height: "100%", borderRadius: 9999, width: `${Math.max(0, Math.min(100, waveAccuracy))}%` }} />
      </View>
      <Text style={styles.comment}>
        {waveAccuracy >= 85 ? "🔥 매우 뛰어난 파도 감지 능력!" : waveAccuracy >= 70 ? "👍 파도 패턴을 잘 포착했어요" : "📈 파도 타이밍을 더 연습해 보세요"}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  panel: { marginTop: 12, backgroundColor: "#0f0f0f", borderRadius: 16, borderWidth: 1, borderColor: alpha(palette.cyan[500], 0.2), padding: 16 },
  head: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  title: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  value: { marginLeft: "auto", fontSize: 18, fontWeight: "900", color: palette.cyan[400] },
  track: { height: 8, backgroundColor: alpha("#ffffff", 0.1), borderRadius: 9999, overflow: "hidden" },
  comment: { fontSize: 12, color: palette.gray[500], marginTop: 8 },
})
