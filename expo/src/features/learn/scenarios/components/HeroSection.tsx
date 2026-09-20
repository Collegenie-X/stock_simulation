import { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { ChevronDown } from "lucide-react-native"
import type { LegendaryScenario } from "@/data/legendary-scenarios"
import { getScenarioStockType } from "@/data/scenario-stock-types"
import { FadeUp, Float, Gradient } from "@/components/ui"
import { alpha } from "@/theme"
import { twColor, twGradient } from "../utils/tw"

// ── 히어로 ────────────────────────────────────────────────────────
export function HeroSection({ scenario, diffConfig }: { scenario: LegendaryScenario; diffConfig: { label: string } }) {
  const [open, setOpen] = useState(false)
  const stockType = getScenarioStockType(scenario.id)

  return (
    <Gradient dir="br" colors={twGradient(scenario.gradientFrom, scenario.gradientTo)} style={styles.hero}>
      <Pressable style={{ padding: 16 }} onPress={() => setOpen(!open)}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
          <Float duration={2000} distance={4}>
            <Text style={{ fontSize: 30, color: "#ffffff" }}>{scenario.emoji}</Text>
          </Float>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={styles.chips}>
              <View style={styles.chip}>
                <Text style={styles.chipText}>
                  #{scenario.order} {scenario.category}
                </Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>
                  {diffConfig?.label} {"⭐".repeat(scenario.difficulty)}
                </Text>
              </View>
            </View>
            <Text style={styles.title}>{scenario.title}</Text>
            <Text style={styles.subtitle}>{scenario.subtitle}</Text>
            {stockType && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 }}>
                <View
                  style={{
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 6,
                    borderWidth: 1,
                    backgroundColor: twColor(stockType.stockTypeBg, "bg"),
                    borderColor: twColor(stockType.stockTypeBorder, "border"),
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: "700", color: twColor(stockType.stockTypeColor, "text") }}>
                    {stockType.stockTypeEmoji} {stockType.stockType}
                  </Text>
                </View>
              </View>
            )}
          </View>
          <View style={[{ marginTop: 4, opacity: 0.6 }, open && { transform: [{ rotate: "180deg" }] }]}>
            <ChevronDown size={16} color="#ffffff" />
          </View>
        </View>
      </Pressable>

      {open && (
        <FadeUp duration={300} distance={8} style={styles.body}>
          <Text style={styles.desc}>{scenario.description}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {scenario.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={{ fontSize: 10, color: "#ffffff" }}>#{tag}</Text>
              </View>
            ))}
          </View>
          {/* 통계 인라인 */}
          <View style={{ flexDirection: "row", gap: 8, paddingTop: 4 }}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{scenario.stats.avgClearRate}%</Text>
              <Text style={styles.statLabel}>평균 클리어율</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{scenario.stats.avgSurvivalRate}%</Text>
              <Text style={styles.statLabel}>생존율</Text>
            </View>
            <View style={styles.stat}>
              <Text style={{ fontSize: 10, fontWeight: "700", color: "#ffffff", lineHeight: 13, textAlign: "center" }}>{scenario.stats.bestStrategy}</Text>
              <Text style={styles.statLabel}>최고 전략</Text>
            </View>
          </View>
        </FadeUp>
      )}
    </Gradient>
  )
}

const styles = StyleSheet.create({
  hero: { marginTop: 16, borderRadius: 16, overflow: "hidden" },
  chips: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 },
  chip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: alpha("#ffffff", 0.2), borderWidth: 1, borderColor: alpha("#ffffff", 0.3) },
  chipText: { fontSize: 10, fontWeight: "700", color: "#ffffff" },
  title: { fontSize: 18, fontWeight: "700", color: "#ffffff", lineHeight: 23 },
  subtitle: { fontSize: 12, color: alpha("#ffffff", 0.7), marginTop: 2 },
  body: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: alpha("#ffffff", 0.1), gap: 12 },
  desc: { fontSize: 14, color: alpha("#ffffff", 0.9), lineHeight: 23, marginTop: 12 },
  tag: { backgroundColor: alpha("#ffffff", 0.15), borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 2 },
  stat: { flex: 1, backgroundColor: alpha("#ffffff", 0.1), borderRadius: 12, padding: 8, alignItems: "center" },
  statValue: { fontSize: 16, fontWeight: "700", color: "#ffffff" },
  statLabel: { fontSize: 9, color: alpha("#ffffff", 0.6), marginTop: 2, textAlign: "center" },
})
