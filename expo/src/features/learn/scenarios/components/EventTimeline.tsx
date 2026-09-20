import { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { ChevronDown, ChevronUp, Clock } from "lucide-react-native"
import type { LegendaryScenario } from "@/data/legendary-scenarios"
import { alpha, palette } from "@/theme"

const ROW_STYLE: Record<string, { bg: string; border: string }> = {
  shock: { bg: alpha(palette.red[500], 0.1), border: alpha(palette.red[500], 0.2) },
  negative: { bg: alpha(palette.orange[500], 0.05), border: alpha(palette.orange[500], 0.1) },
  positive: { bg: alpha(palette.green[500], 0.05), border: alpha(palette.green[500], 0.1) },
  neutral: { bg: "#252525", border: alpha("#ffffff", 0.05) },
}

const BADGE_STYLE: Record<string, { bg: string; text: string }> = {
  shock: { bg: alpha(palette.red[500], 0.3), text: palette.red[300] },
  negative: { bg: alpha(palette.orange[500], 0.2), text: palette.orange[300] },
  positive: { bg: alpha(palette.green[500], 0.2), text: palette.green[300] },
  neutral: { bg: palette.gray[600], text: palette.gray[300] },
}

export function EventTimeline({ scenario }: { scenario: LegendaryScenario }) {
  const [expanded, setExpanded] = useState(false)
  const visibleEvents = expanded ? scenario.events : scenario.events.slice(0, 4)

  return (
    <View>
      <View style={styles.header}>
        <Clock size={16} color={palette.yellow[400]} />
        <Text style={styles.title}>10턴 이벤트 타임라인</Text>
      </View>
      <View style={{ gap: 8 }}>
        {visibleEvents.map((event) => {
          const row = ROW_STYLE[event.sentiment] ?? ROW_STYLE.neutral
          const badge = BADGE_STYLE[event.sentiment] ?? BADGE_STYLE.neutral
          return (
            <View key={event.turn} style={[styles.row, { backgroundColor: row.bg, borderColor: row.border }]}>
              <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: badge.text }}>{event.turn}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={styles.rowTop}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      marginLeft: 8,
                      color: event.priceChange.startsWith("+") ? palette.green[400] : event.priceChange.startsWith("-") ? palette.red[400] : palette.gray[400],
                    }}
                  >
                    {event.priceChange}
                  </Text>
                </View>
                <Text style={styles.desc}>{event.description}</Text>
              </View>
            </View>
          )
        })}
      </View>
      {scenario.events.length > 4 && (
        <Pressable onPress={() => setExpanded(!expanded)} style={styles.more}>
          <Text style={styles.moreText}>{expanded ? "접기" : `나머지 ${scenario.events.length - 4}개 이벤트 보기`}</Text>
          {expanded ? <ChevronUp size={14} color={palette.gray[400]} /> : <ChevronDown size={14} color={palette.gray[400]} />}
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  title: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 12, borderRadius: 12, borderWidth: 1 },
  badge: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 2 },
  eventTitle: { fontSize: 14, fontWeight: "700", color: "#ffffff", flexShrink: 1 },
  desc: { fontSize: 12, color: palette.gray[400] },
  more: { marginTop: 8, paddingVertical: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
  moreText: { fontSize: 12, color: palette.gray[400] },
})
