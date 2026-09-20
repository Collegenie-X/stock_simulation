import { useMemo } from "react"
import { StyleSheet, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { FadeUp, Gradient, PressableScale } from "@/components/ui"
import { storage } from "@/lib/storage"
import { alpha, palette } from "@/theme"
import { LiveChart } from "./game-mode/LiveChart"
import { SprintIcon } from "./game-mode/SprintIcon"
import { StandardIcon } from "./game-mode/StandardIcon"
import { MarathonIcon } from "./game-mode/MarathonIcon"

function generateChart(volatility: number, trend: number): number[] {
  const data: number[] = [50]
  for (let i = 1; i < 24; i++) {
    const prev = data[i - 1]
    const change = (Math.random() - 0.5 + trend * 0.1) * volatility
    data.push(Math.max(8, Math.min(92, prev + change)))
  }
  return data
}

// ─── Modes ────────────────────────────────────────────────────────────────────

const MODES = [
  {
    id: "sprint",
    Icon: SprintIcon,
    name: "스프린트",
    action: "5분 즉석 단타",
    chip: "1M · 22턴",
    duration: "5분",
    color: "#FF6B35",
    glow: "rgba(255,107,53,0.45)",
    // from-orange-600/30 via-amber-500/15 to-transparent
    accent: [alpha(palette.orange[600], 0.3), alpha(palette.amber[500], 0.15), alpha(palette.amber[500], 0)],
    border: alpha(palette.orange[500], 0.4),
    chipBg: alpha(palette.orange[500], 0.15),
    chipText: palette.orange[300],
    volatility: 9,
    trend: 0.4,
    settings: { speedMode: "sprint", timerSeconds: 10, simulationMonths: 1, dailyOpportunities: 2 },
  },
  {
    id: "standard",
    Icon: StandardIcon,
    name: "스탠다드",
    action: "10분 균형 매매",
    chip: "3M · 33턴",
    duration: "10분",
    color: "#3182F6",
    glow: "rgba(49,130,246,0.45)",
    accent: [alpha(palette.blue[600], 0.3), alpha(palette.cyan[500], 0.15), alpha(palette.cyan[500], 0)],
    border: alpha(palette.blue[500], 0.4),
    chipBg: alpha(palette.blue[500], 0.15),
    chipText: palette.blue[300],
    volatility: 5,
    trend: 0.15,
    settings: { speedMode: "standard", timerSeconds: 15, simulationMonths: 3, dailyOpportunities: 2 },
  },
  {
    id: "marathon",
    Icon: MarathonIcon,
    name: "마라톤",
    action: "15분 장기 정복",
    chip: "6M · 44턴",
    duration: "15분",
    color: "#8B5CF6",
    glow: "rgba(139,92,246,0.45)",
    accent: [alpha(palette.purple[600], 0.3), alpha(palette.violet[500], 0.15), alpha(palette.violet[500], 0)],
    border: alpha(palette.purple[500], 0.4),
    chipBg: alpha(palette.purple[500], 0.15),
    chipText: palette.purple[300],
    volatility: 3,
    trend: 0.25,
    settings: { speedMode: "marathon", timerSeconds: 20, simulationMonths: 6, dailyOpportunities: 2 },
  },
] as const

export default function GameModeCards() {
  const router = useRouter()
  const charts = useMemo(() => MODES.map((m) => generateChart(m.volatility, m.trend)), [])

  const handleSelect = (mode: (typeof MODES)[number]) => {
    storage.setGameSettings(mode.settings as any)
    router.push("/practice/setup")
  }

  return (
    <View style={styles.root}>
      <View style={styles.head}>
        <View>
          <Text style={styles.kicker}>▸ CHOOSE MODE</Text>
          <Text style={styles.title}>난이도 골라서 출발</Text>
        </View>
        <Text style={styles.count}>3 MODES</Text>
      </View>

      <View style={styles.list}>
        {MODES.map((mode, i) => {
          const Icon = mode.Icon
          return (
            <FadeUp key={mode.id} delay={i * 100} duration={400}>
              <PressableScale onPress={() => handleSelect(mode)} scaleTo={0.98} style={[styles.card, { borderColor: mode.border }]}>
                {/* gradient bg */}
                <Gradient dir="r" colors={mode.accent} style={StyleSheet.absoluteFill} pointerEvents="none" />

                {/* mascot */}
                <View style={styles.mascot}>
                  <Icon color={mode.color} />
                </View>

                {/* text + chips */}
                <View style={styles.body}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{mode.name}</Text>
                    <View style={[styles.chip, { backgroundColor: mode.chipBg, borderColor: mode.border }]}>
                      <Text style={[styles.chipText, { color: mode.chipText }]}>⏱ {mode.duration}</Text>
                    </View>
                  </View>
                  <Text style={[styles.action, { color: mode.color }]}>{mode.action}</Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.meta}>🎯 {mode.chip}</Text>
                  </View>
                </View>

                {/* live chart */}
                <View style={styles.chart}>
                  <LiveChart data={charts[i]} color={mode.color} glow={mode.glow} width={80} height={48} />
                </View>

                {/* CTA arrow */}
                <View style={[styles.arrow, { backgroundColor: `${mode.color}25`, boxShadow: `0 0 12px ${mode.glow}` }]}>
                  <Text style={[styles.arrowText, { color: mode.color }]}>▶</Text>
                </View>
              </PressableScale>
            </FadeUp>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: 20 },
  head: { marginBottom: 12, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  kicker: { fontSize: 11, fontWeight: "900", color: palette.cyan[400], letterSpacing: 2.2 },
  title: { fontSize: 16, fontWeight: "900", color: "#ffffff", marginTop: 2 },
  count: { fontSize: 10, color: palette.gray[500], fontWeight: "700" },
  list: { gap: 10 },
  card: {
    width: "100%",
    overflow: "hidden",
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: "#1e1e2e",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  mascot: { width: 56, height: 56, flexShrink: 0 },
  body: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  name: { fontWeight: "900", color: "#ffffff", fontSize: 16, lineHeight: 18 },
  chip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  chipText: { fontSize: 9, fontWeight: "900" },
  action: { fontSize: 13, fontWeight: "700", marginTop: 4, lineHeight: 16 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  meta: { fontSize: 9, color: palette.gray[500], fontWeight: "700" },
  chart: { width: 80, height: 48, flexShrink: 0 },
  arrow: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  arrowText: { fontWeight: "900", fontSize: 14 },
})
