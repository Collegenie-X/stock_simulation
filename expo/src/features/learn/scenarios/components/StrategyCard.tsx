import { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { ChevronDown, ChevronUp } from "lucide-react-native"
import type { SolutionStrategy } from "@/data/legendary-scenarios"
import { alpha, palette } from "@/theme"

const riskColors: Record<SolutionStrategy["risk"], { text: string; bg: string; border: string }> = {
  낮음: { text: palette.green[400], bg: alpha(palette.green[500], 0.1), border: alpha(palette.green[500], 0.2) },
  보통: { text: palette.yellow[400], bg: alpha(palette.yellow[500], 0.1), border: alpha(palette.yellow[500], 0.2) },
  높음: { text: palette.red[400], bg: alpha(palette.red[500], 0.1), border: alpha(palette.red[500], 0.2) },
}

export function StrategyCard({ strategy }: { strategy: SolutionStrategy }) {
  const [open, setOpen] = useState(false)
  const risk = riskColors[strategy.risk] ?? riskColors["보통"]

  return (
    <View style={[styles.card, open && { borderColor: alpha("#ffffff", 0.1) }]}>
      <Pressable onPress={() => setOpen(!open)} style={styles.head}>
        <View style={styles.headLeft}>
          <Text style={{ fontSize: 24, color: "#ffffff" }}>{strategy.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{strategy.title}</Text>
            <Text style={styles.desc}>{strategy.description}</Text>
          </View>
        </View>
        {open ? <ChevronUp size={16} color={palette.gray[500]} /> : <ChevronDown size={16} color={palette.gray[500]} />}
      </Pressable>

      {open && (
        <View style={styles.body}>
          <View style={styles.chips}>
            <View style={[styles.chip, { backgroundColor: risk.bg, borderColor: risk.border }]}>
              <Text style={[styles.chipText, { color: risk.text }]}>리스크: {strategy.risk}</Text>
            </View>
            <View style={[styles.chip, { backgroundColor: alpha(palette.blue[500], 0.1), borderColor: alpha(palette.blue[500], 0.2) }]}>
              <Text style={[styles.chipText, { color: palette.blue[400] }]}>예상 수익: {strategy.expectedReturn}</Text>
            </View>
            <View style={[styles.chip, { backgroundColor: alpha(palette.purple[500], 0.1), borderColor: alpha(palette.purple[500], 0.2) }]}>
              <Text style={[styles.chipText, { color: palette.purple[400] }]}>난이도 {"⭐".repeat(strategy.difficulty)}</Text>
            </View>
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: palette.gray[300] }}>실행 단계</Text>
            {strategy.steps.map((step, idx) => (
              <View key={idx} style={styles.step}>
                <View style={styles.stepNum}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: palette.gray[400] }}>{idx + 1}</Text>
                </View>
                <Text style={{ flex: 1, fontSize: 12, color: palette.gray[300] }}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#252525", borderRadius: 12, borderWidth: 1, borderColor: alpha("#ffffff", 0.05), overflow: "hidden" },
  head: { padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  headLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  title: { fontWeight: "700", color: "#ffffff", fontSize: 14 },
  desc: { fontSize: 12, color: palette.gray[400], marginTop: 2 },
  body: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 12, gap: 12, borderTopWidth: 1, borderTopColor: alpha("#ffffff", 0.05) },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  chipText: { fontSize: 10, fontWeight: "700" },
  step: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  stepNum: { width: 20, height: 20, borderRadius: 10, backgroundColor: alpha("#ffffff", 0.1), alignItems: "center", justifyContent: "center", marginTop: 2 },
})
