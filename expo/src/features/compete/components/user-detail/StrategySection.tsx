import { StyleSheet, Text, View } from "react-native"
import { Lightbulb } from "lucide-react-native"
import { Gradient } from "@/components/ui"
import { alpha, palette } from "@/theme"

const STRATEGIES = [
  { title: "엘리엇 파동 활용", desc: "3파 상승 구간에서 집중 매수, 5파 완성 시점에 목표가 도달하여 매도하는 전략으로 안정적인 수익 실현" },
  { title: "조정파 대응", desc: "2파, 4파 조정 구간에서 관망하며, C파 완료 시점에 재진입하여 신규 상승 사이클 포착" },
  { title: "리스크 관리", desc: "매 거래마다 손절선 5% 설정, 목표 수익 15% 도달 시 분할 매도로 리스크 최소화" },
]

/** 핵심 투자 전략 (Top 3 only) */
export function StrategySection() {
  return (
    <Gradient dir="br" colors={[palette.yellow[100], palette.orange[100]]} style={styles.card}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Lightbulb size={24} color={palette.orange[600]} />
        <Text style={{ fontSize: 18, fontWeight: "700", color: palette.gray[900] }}>핵심 투자 전략</Text>
      </View>
      <View style={{ gap: 12 }}>
        {STRATEGIES.map((s) => (
          <View key={s.title} style={styles.item}>
            <Text style={styles.itemTitle}>{s.title}</Text>
            <Text style={styles.itemDesc}>{s.desc}</Text>
          </View>
        ))}
      </View>
    </Gradient>
  )
}

const styles = StyleSheet.create({
  card: { marginTop: 24, marginBottom: 24, borderRadius: 24, padding: 24, boxShadow: "0 10px 15px rgba(0,0,0,0.1)" },
  item: { backgroundColor: alpha("#ffffff", 0.8), borderRadius: 12, padding: 16 },
  itemTitle: { fontSize: 14, fontWeight: "600", color: palette.gray[700], marginBottom: 8 },
  itemDesc: { fontSize: 14, lineHeight: 20, color: palette.gray[600] },
})
