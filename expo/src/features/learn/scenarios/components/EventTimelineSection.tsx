import { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { ChevronDown, Clock } from "lucide-react-native"
import type { LegendaryScenario } from "@/data/legendary-scenarios"
import { alpha, palette } from "@/theme"
import { sectionStyles } from "./CollapsibleSection"

const ROW: Record<string, { bg: string; border: string; badgeBg: string; badgeText: string }> = {
  shock: { bg: alpha(palette.red[500], 0.1), border: alpha(palette.red[500], 0.2), badgeBg: alpha(palette.red[500], 0.3), badgeText: palette.red[300] },
  negative: { bg: alpha(palette.orange[500], 0.05), border: alpha(palette.orange[500], 0.1), badgeBg: alpha(palette.orange[500], 0.2), badgeText: palette.orange[300] },
  positive: { bg: alpha(palette.green[500], 0.05), border: alpha(palette.green[500], 0.1), badgeBg: alpha(palette.green[500], 0.2), badgeText: palette.green[300] },
  neutral: { bg: "#252525", border: alpha("#ffffff", 0.05), badgeBg: palette.gray[600], badgeText: palette.gray[300] },
}

// ── 이벤트 타임라인 ────────────────────────────────────────────────
export function EventTimelineSection({ scenario }: { scenario: LegendaryScenario }) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? scenario.events : scenario.events.slice(0, 3)

  return (
    <View style={{ marginTop: 20 }}>
      <Pressable onPress={() => setOpen(!open)} style={sectionStyles.head}>
        <Clock size={16} color={palette.yellow[400]} />
        <Text style={sectionStyles.title}>무슨 일이 생길까?</Text>
        <View style={sectionStyles.badge}>
          <Text style={sectionStyles.badgeText}>{scenario.events.length}턴</Text>
        </View>
        <View style={open ? { transform: [{ rotate: "180deg" }] } : undefined}>
          <ChevronDown size={16} color={palette.gray[500]} />
        </View>
      </Pressable>

      {open && (
        <View style={{ gap: 8 }}>
          {visible.map((ev) => {
            const c = ROW[ev.sentiment] ?? ROW.neutral
            return (
              <View key={ev.turn} style={[styles.row, { backgroundColor: c.bg, borderColor: c.border }]}>
                <View style={[styles.badge, { backgroundColor: c.badgeBg }]}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: c.badgeText }}>{ev.turn}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={styles.rowTop}>
                    <Text style={styles.evTitle}>{ev.title}</Text>
                    <Text style={{ fontSize: 12, fontWeight: "700", marginLeft: 8, color: ev.priceChange.startsWith("+") ? palette.green[400] : palette.red[400] }}>{ev.priceChange}</Text>
                  </View>
                  <Text numberOfLines={2} style={styles.evDesc}>
                    {ev.description}
                  </Text>
                </View>
              </View>
            )
          })}

          {scenario.events.length > 3 && (
            <Pressable onPress={() => setExpanded(!expanded)} style={styles.more}>
              <Text style={{ fontSize: 12, color: palette.gray[400] }}>{expanded ? "접기 ▲" : `나머지 ${scenario.events.length - 3}턴 더 보기 ▼`}</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 12, borderRadius: 12, borderWidth: 1 },
  badge: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 2 },
  evTitle: { flexShrink: 1, fontSize: 12, fontWeight: "700", color: "#ffffff", lineHeight: 16 },
  evDesc: { fontSize: 10, color: palette.gray[400], lineHeight: 14 },
  more: { paddingVertical: 8, alignItems: "center", justifyContent: "center" },
})
