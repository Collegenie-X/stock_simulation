import React from "react"
import { StyleSheet, Text, View } from "react-native"
import { Newspaper, TrendingDown, TrendingUp } from "lucide-react-native"
import { alpha, palette } from "@/theme"
import type { DailyEvent } from "./generateDailyEvents"

interface DailyNewsCardProps {
  events: DailyEvent[]
  isUp: boolean
  /** 전일 데이터가 있을 때만 하단 안내 문구 표시 */
  showDelayNotice: boolean
}

/** 오늘의 이벤트/뉴스 카드 */
export function DailyNewsCard({ events, isUp, showDelayNotice }: DailyNewsCardProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Newspaper size={16} color={palette.yellow[500]} />
          <Text style={styles.title}>시장 뉴스</Text>
          <View style={[styles.trendPill, { backgroundColor: alpha(isUp ? palette.red[500] : palette.blue[500], 0.15) }]}>
            <Text style={[styles.trendText, { color: isUp ? palette.red[400] : palette.blue[400] }]}>
              {isUp ? "상승세" : "하락세"}
            </Text>
          </View>
        </View>
        <View style={styles.list}>
          {events.map((evt, idx) => (
            <View key={idx} style={[styles.item, idx < events.length - 1 && styles.itemBorder]}>
              <View
                style={[
                  styles.icon,
                  {
                    backgroundColor:
                      evt.type === "positive"
                        ? alpha(palette.red[500], 0.15)
                        : evt.type === "negative"
                          ? alpha(palette.blue[500], 0.15)
                          : alpha(palette.gray[700], 0.5),
                  },
                ]}
              >
                {evt.type === "positive" ? (
                  <TrendingUp size={12} color={palette.red[400]} />
                ) : evt.type === "negative" ? (
                  <TrendingDown size={12} color={palette.blue[400]} />
                ) : (
                  <Text style={styles.iconEmoji}>{evt.emoji}</Text>
                )}
              </View>
              <View style={styles.body}>
                <Text style={styles.headline}>{evt.headline}</Text>
                {!!evt.detail && <Text style={styles.detail}>{evt.detail}</Text>}
                {!!evt.isDelayed && (
                  <View style={styles.delayedTag}>
                    <Text style={styles.delayedText}>어제 발표 · 주가 이미 반영</Text>
                  </View>
                )}
              </View>
              <Text style={styles.time}>{evt.time}</Text>
            </View>
          ))}
        </View>
        {showDelayNotice && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>뉴스가 보도될 때쯤 주가는 이미 움직인 뒤입니다</Text>
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
  header: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 12, fontWeight: "700", color: palette.gray[300] },
  trendPill: { marginLeft: "auto", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999 },
  trendText: { fontSize: 10, fontWeight: "700" },
  list: { paddingHorizontal: 16, paddingBottom: 16 },
  item: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 10 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: alpha(palette.gray[800], 0.3) },
  icon: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 },
  iconEmoji: { fontSize: 10, color: "#ffffff" },
  body: { flex: 1, minWidth: 0 },
  headline: { fontSize: 12, color: palette.gray[200], lineHeight: 19 },
  detail: { fontSize: 10, color: palette.gray[500], marginTop: 2 },
  delayedTag: {
    alignSelf: "flex-start",
    marginTop: 4,
    backgroundColor: alpha(palette.yellow[500], 0.1),
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  delayedText: { fontSize: 9, color: palette.yellow[600] },
  time: { fontSize: 9, color: palette.gray[600], marginTop: 4, flexShrink: 0 },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: alpha(palette.gray[800], 0.3),
  },
  footerText: { fontSize: 10, color: palette.gray[600], fontStyle: "italic", textAlign: "center" },
})
