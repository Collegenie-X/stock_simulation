import React, { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { ChevronDown, ChevronUp, History } from "lucide-react-native"
import { alpha, palette } from "@/theme"
import { getStockHistoryEvents, getStockHistorySummary } from "@/features/practice-stock/utils/stockHistory"

interface PastNewsCardProps {
  stockId: string
}

/** 게임 시작 전 3개월 흐름 + 뉴스 (기본은 접힘 — 한 줄 요약만) */
export function PastNewsCard({ stockId }: PastNewsCardProps) {
  const [open, setOpen] = useState(false)
  const summary = getStockHistorySummary(stockId)
  const events = getStockHistoryEvents(stockId)
  if (!summary || events.length === 0) return null

  const isUp = summary.changeRate >= 0
  const tone = isUp ? palette.red[400] : palette.blue[400]
  // 최근 뉴스가 위로
  const list = [...events].reverse()

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <Pressable onPress={() => setOpen((v) => !v)} style={styles.header}>
          <History size={16} color={palette.yellow[500]} />
          <Text style={styles.title}>지난 3개월</Text>
          <Text style={styles.pattern} numberOfLines={1}>{summary.patternLabel}</Text>
          <Text style={[styles.rate, { color: tone }]}>
            {isUp ? "+" : ""}{summary.changeRate}%
          </Text>
          {open ? <ChevronUp size={16} color={palette.gray[500]} /> : <ChevronDown size={16} color={palette.gray[500]} />}
        </Pressable>

        {open && (
          <View style={styles.list}>
            {list.map((evt, idx) => {
              const evtUp = evt.changeRate >= 0
              return (
                <View key={`${evt.date}-${idx}`} style={[styles.item, idx < list.length - 1 && styles.itemBorder]}>
                  <Text style={styles.emoji}>{evt.emoji}</Text>
                  <View style={styles.body}>
                    <Text style={styles.headline}>{evt.headline}</Text>
                    <Text style={styles.detail}>
                      {evt.date.slice(5).replace("-", "/")} · {evt.scope === "market" ? "시장 전체" : "이 종목"}
                    </Text>
                  </View>
                  <Text style={[styles.change, { color: evtUp ? palette.red[400] : palette.blue[400] }]}>
                    {evtUp ? "▲" : "▼"}{Math.abs(evt.changeRate)}%
                  </Text>
                </View>
              )
            })}
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, marginBottom: 24 },
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: alpha(palette.gray[800], 0.4),
  },
  header: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 14 },
  title: { fontSize: 12, fontWeight: "700", color: palette.gray[300] },
  pattern: { flex: 1, fontSize: 12, color: palette.gray[500] },
  rate: { fontSize: 12, fontWeight: "700" },
  list: { paddingHorizontal: 16, paddingBottom: 12 },
  item: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: alpha(palette.gray[800], 0.3) },
  emoji: { fontSize: 14, width: 20, textAlign: "center" },
  body: { flex: 1, minWidth: 0 },
  headline: { fontSize: 12, color: palette.gray[200], lineHeight: 18 },
  detail: { fontSize: 10, color: palette.gray[500], marginTop: 2 },
  change: { fontSize: 11, fontWeight: "700", flexShrink: 0 },
})
