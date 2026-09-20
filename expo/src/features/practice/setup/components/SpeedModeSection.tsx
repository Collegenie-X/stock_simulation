import type { ComponentType } from "react"
import { StyleSheet, Text, View } from "react-native"
import { Lock, Zap } from "lucide-react-native"
import { Gradient, PressableScale } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { MarathonScene, SprintScene, StandardScene } from "../illustrations"
import { type SpeedMode, SPEED_MODES, LABELS, COLOR_MAP } from "../config"
import { SectionHeader } from "./SectionHeader"
import { DifficultyStars } from "./DifficultyStars"
import { ScanLine } from "./ScanLine"

const MODE_DIFFICULTY: Record<SpeedMode, number> = {
  sprint: 1,
  standard: 2,
  marathon: 3,
}

const MODE_SCENE: Record<SpeedMode, ComponentType<{ active?: boolean }>> = {
  sprint: SprintScene,
  standard: StandardScene,
  marathon: MarathonScene,
}

interface SpeedModeSectionProps {
  mode: SpeedMode
  onSelect: (m: SpeedMode) => void
  isSprintDisabled: boolean
  dailyOpp: number
}

export function SpeedModeSection({ mode, onSelect, isSprintDisabled, dailyOpp }: SpeedModeSectionProps) {
  const oppKey = (dailyOpp === 1 ? "1" : "2") as "1" | "2"
  return (
    <View>
      <SectionHeader
        icon={<Zap size={16} color={palette.blue[300]} />}
        title={LABELS.speedModeTitle}
        accentBg={alpha(palette.blue[500], 0.2)}
        accentBorder={alpha(palette.blue[400], 0.3)}
      />
      <View style={{ gap: 10 }}>
        {(Object.entries(SPEED_MODES) as [SpeedMode, (typeof SPEED_MODES)[SpeedMode]][]).map(([key, m]) => {
          const mc = COLOR_MAP[m.color]
          const isSelected = mode === key
          const isDisabled = key === "sprint" && isSprintDisabled
          const difficulty = MODE_DIFFICULTY[key]
          const Scene = MODE_SCENE[key]
          const isActive = isSelected && !isDisabled

          return (
            <PressableScale
              key={key}
              scaleTo={0.99}
              pressedOpacity={1}
              onPress={() => !isDisabled && onSelect(key)}
              disabled={isDisabled}
              style={[
                styles.card,
                isDisabled && { opacity: 0.4, borderColor: palette.gray[700], backgroundColor: "#1a1a1a" },
                isActive && { borderColor: mc.border, boxShadow: mc.glow, transform: [{ scale: 1.01 }] },
                !isDisabled && !isSelected && { backgroundColor: "#1f1f1f", borderColor: "#2a2a2a" },
              ]}
            >
              {/* Gradient background when selected */}
              {isActive && <Gradient dir="br" colors={mc.gradient} style={StyleSheet.absoluteFill} pointerEvents="none" />}
              {/* Animated scan line for selected */}
              {isActive && <ScanLine />}

              {isDisabled && (
                <View style={styles.limitBadge}>
                  <Lock size={10} color={palette.red[400]} />
                  <Text style={styles.limitBadgeText}>{LABELS.sprintLimitBadge}</Text>
                </View>
              )}

              <View style={styles.row}>
                <View style={styles.left}>
                  <View
                    style={[
                      styles.sceneBox,
                      isActive ? { backgroundColor: mc.bg, borderColor: mc.border } : { backgroundColor: "#262626", borderColor: "#333333" },
                    ]}
                  >
                    <Scene active={isActive} />
                  </View>
                  <View style={{ flexShrink: 1 }}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.name, { color: isSelected ? mc.text : "#ffffff" }]}>{m.name}</Text>
                      <DifficultyStars level={difficulty} />
                    </View>
                    <Text style={styles.desc}>{m.desc}</Text>
                  </View>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[styles.time, { color: isSelected ? mc.text : palette.gray[300] }]}>{m.time[oppKey]}</Text>
                  <Text style={styles.period}>
                    {m.period} · {m.decisions[oppKey]}
                  </Text>
                </View>
              </View>
            </PressableScale>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { width: "100%", padding: 16, borderRadius: 16, borderWidth: 2, borderColor: "transparent", overflow: "hidden" },
  limitBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: alpha(palette.red[500], 0.2),
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: alpha(palette.red[500], 0.3),
  },
  limitBadgeText: { fontSize: 10, fontWeight: "700", color: palette.red[400] },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  left: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  sceneBox: { width: 64, height: 64, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 2, overflow: "hidden", padding: 4 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { fontSize: 16, fontWeight: "900", letterSpacing: -0.4 },
  desc: { fontSize: 12, color: palette.gray[400], marginTop: 2 },
  time: { fontSize: 18, fontWeight: "900", fontVariant: ["tabular-nums"] },
  period: { fontSize: 10, color: palette.gray[500] },
})
