import { StyleSheet, Text, View } from "react-native"
import type { TurnSnapshot } from "@/lib/scenario/engine"
import { alpha, palette } from "@/theme"

// ============================================================
// 뉴스 패널
// ============================================================
export function NewsPanel({ snapshot }: { snapshot: TurnSnapshot }) {
  return (
    <View style={{ paddingHorizontal: 16, marginTop: 12, gap: 8 }}>
      {snapshot.news.length === 0 ? (
        <View style={[styles.item, styles.normal, { alignItems: "center" }]}>
          <Text style={{ fontSize: 12, color: palette.gray[500], textAlign: "center" }}>⚪ 별다른 소식 없음 — 거래량 평이</Text>
        </View>
      ) : (
        snapshot.news.map((n, i) => (
          <View key={i} style={[styles.item, n.level === "major" ? styles.major : n.level === "minor" ? styles.minor : styles.normal]}>
            <View style={styles.head}>
              <Text style={{ flex: 1, fontSize: 14, fontWeight: "700", color: "#ffffff" }}>{n.headline}</Text>
              {!!n.badge && (
                <View style={styles.badge}>
                  <Text style={{ fontSize: 9, color: palette.gray[400] }}>{n.badge}</Text>
                </View>
              )}
            </View>
            <Text style={{ fontSize: 11, color: palette.gray[400] }}>{n.body}</Text>
            {!!n.source && <Text style={{ fontSize: 10, color: palette.gray[600], marginTop: 4 }}>{n.source}</Text>}
          </View>
        ))
      )}

      {/* 사전 신호 (있을 때) */}
      {snapshot.preSignals.length > 0 && (
        <View style={styles.signals}>
          <Text style={{ fontSize: 10, color: palette.purple[300], fontWeight: "700", marginBottom: 4 }}>🔮 사전 신호 감지</Text>
          {snapshot.preSignals.map((s, i) => (
            <Text key={i} style={{ fontSize: 11, color: palette.gray[300] }}>
              {s.description} (D-{s.turnsAhead})
            </Text>
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  item: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1 },
  major: { backgroundColor: alpha(palette.red[500], 0.1), borderColor: alpha(palette.red[500], 0.4) },
  minor: { backgroundColor: alpha(palette.yellow[500], 0.1), borderColor: alpha(palette.yellow[500], 0.3) },
  normal: { backgroundColor: alpha(palette.gray[900], 0.4), borderColor: alpha(palette.gray[800], 0.5) },
  head: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: palette.gray[700] },
  signals: { backgroundColor: alpha(palette.purple[500], 0.1), borderWidth: 1, borderColor: alpha(palette.purple[500], 0.3), borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8 },
})
