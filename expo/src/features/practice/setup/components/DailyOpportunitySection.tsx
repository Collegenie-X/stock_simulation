import { StyleSheet, Text, View } from "react-native"
import { Calendar, Sparkles } from "lucide-react-native"
import { Gradient, PressableScale } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { DayCycleScene } from "../illustrations"
import { DAILY_OPTIONS, LABELS } from "../config"
import { SectionHeader } from "./SectionHeader"

interface DailyOpportunitySectionProps {
  dailyOpp: number
  onSelect: (v: number) => void
}

export function DailyOpportunitySection({ dailyOpp, onSelect }: DailyOpportunitySectionProps) {
  return (
    <View>
      <SectionHeader
        icon={<Calendar size={16} color={palette.emerald[300]} />}
        title={LABELS.dailyOppTitle}
        accentBg={alpha(palette.emerald[500], 0.2)}
        accentBorder={alpha(palette.emerald[400], 0.3)}
      />
      <View style={styles.grid}>
        {DAILY_OPTIONS.map((opt) => {
          const isSelected = dailyOpp === opt.value
          return (
            <PressableScale
              key={opt.value}
              scaleTo={0.98}
              pressedOpacity={1}
              onPress={() => onSelect(opt.value)}
              style={[
                styles.card,
                isSelected
                  ? { borderColor: palette.emerald[500], boxShadow: "0 0 20px rgba(16,185,129,0.35)" }
                  : { backgroundColor: "#1f1f1f", borderColor: "#2a2a2a" },
              ]}
            >
              {isSelected && (
                <Gradient
                  dir="br"
                  colors={[alpha(palette.emerald[500], 0.25), alpha(palette.teal[500], 0.1), alpha(palette.teal[500], 0)]}
                  style={StyleSheet.absoluteFill}
                  pointerEvents="none"
                />
              )}
              <View>
                <Gradient dir="b" colors={[alpha(palette.slate[900], 0.8), alpha(palette.indigo[950], 0.4)]} style={styles.sceneBox}>
                  <DayCycleScene count={opt.value as 1 | 2} active={isSelected} />
                </Gradient>
                <View style={styles.labelRow}>
                  <Text style={[styles.label, { color: isSelected ? palette.emerald[300] : "#ffffff" }]}>{opt.label}</Text>
                  {isSelected && <Sparkles size={14} color={palette.emerald[300]} />}
                </View>
                <Text style={styles.desc}>{opt.desc}</Text>
                <Text style={styles.sub}>{opt.sub}</Text>
              </View>
            </PressableScale>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", gap: 12 },
  card: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 2, overflow: "hidden" },
  sceneBox: {
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: alpha("#ffffff", 0.05),
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  labelRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  label: { fontSize: 20, fontWeight: "900" },
  desc: { fontSize: 12, color: palette.gray[400], marginTop: 2 },
  sub: { fontSize: 10, color: palette.gray[500], marginTop: 4 },
})
