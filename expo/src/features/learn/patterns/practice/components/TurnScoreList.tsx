import React from "react"
import { StyleSheet, Text, View } from "react-native"
import { Brain } from "lucide-react-native"
import type { TurnEval } from "@/data/pattern-practice"
import { Gradient } from "@/components/ui"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"

/** Turn Score List (턴 개별 평가) — 웹 page.tsx 에 정의된 컴포넌트 (웹에서도 현재 화면에 배치되어 있지 않음) */
export function TurnScoreList({ turnEvals }: { turnEvals: TurnEval[] }) {
  const total = turnEvals.reduce((s, e) => s + e.score, 0)
  const correctCount = turnEvals.filter((e) => e.correct).length

  return (
    <Gradient dir="b" colors={["#0d0d1a", "#111111"]} style={styles.root}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Brain size={20} color={palette.indigo[400]} />
          <Text style={styles.headerTitle}>AI 턴별 채점 리포트</Text>
        </View>
        <View style={styles.headerLeft}>
          <Text style={styles.correct}>
            {correctCount}/{turnEvals.length} 정답
          </Text>
          <Text style={styles.total}>
            {total.toFixed(1)}
            <Text style={styles.totalMax}>/20</Text>
          </Text>
        </View>
      </View>

      {/* 턴 리스트 */}
      <View>
        {turnEvals.map((ev, i) => {
          const pct = (ev.score / 2.5) * 100
          const barColor = ev.score >= 2.0 ? palette.green[500] : ev.score >= 1.0 ? palette.yellow[500] : palette.red[500]
          const scoreColor = ev.score >= 2.0 ? palette.green[400] : ev.score >= 1.0 ? palette.yellow[400] : palette.red[400]
          const actionLabel = ev.action === "buy" ? "매수" : ev.action === "sell" ? "매도" : ev.action === "timeout" ? "시간초과" : "관망"
          const actionColor =
            ev.action === "buy"
              ? { bg: alpha(palette.green[500], 0.2), text: palette.green[400], border: alpha(palette.green[500], 0.3) }
              : ev.action === "sell"
                ? { bg: alpha(palette.red[500], 0.2), text: palette.red[400], border: alpha(palette.red[500], 0.3) }
                : ev.action === "timeout"
                  ? { bg: alpha(palette.orange[500], 0.2), text: palette.orange[400], border: alpha(palette.orange[500], 0.3) }
                  : { bg: alpha("#ffffff", 0.05), text: palette.gray[500], border: alpha("#ffffff", 0.1) }
          return (
            <View key={ev.turn} style={[styles.item, i > 0 && styles.itemDivider]}>
              <View style={styles.itemTop}>
                {/* 턴 번호 */}
                <Text style={styles.turn}>T{ev.turn + 1}</Text>
                {/* 행동 배지 */}
                <View style={[styles.badge, { backgroundColor: actionColor.bg, borderColor: actionColor.border }]}>
                  <Text style={[styles.badgeText, { color: actionColor.text }]}>{actionLabel}</Text>
                </View>
                {/* 가격 + 손익 */}
                <Text style={styles.price} numberOfLines={1}>
                  {formatNumber(ev.price)}원
                  {(ev.action === "buy" || ev.action === "sell") && (
                    <Text style={{ fontWeight: "700", color: ev.turnPnl > 0 ? palette.green[400] : ev.turnPnl < 0 ? palette.red[400] : palette.gray[500] }}>
                      {"  "}
                      {ev.turnPnl > 0 ? "+" : ""}
                      {formatNumber(ev.turnPnl)}원
                    </Text>
                  )}
                </Text>
                {/* 점수 */}
                <Text style={[styles.score, { color: scoreColor }]}>
                  {ev.score.toFixed(1)}
                  <Text style={styles.scoreMax}>/2.5</Text>
                </Text>
              </View>
              {/* 점수 바 */}
              <View style={styles.itemBottom}>
                <View style={{ width: 32 }} />
                <View style={styles.track}>
                  <View style={{ height: "100%", borderRadius: 9999, backgroundColor: barColor, width: `${Math.max(0, Math.min(100, pct))}%` }} />
                </View>
                <Text style={styles.verdict}>{ev.verdict}</Text>
              </View>
            </View>
          )
        })}
      </View>

      {/* 요약 */}
      <View style={styles.footer}>
        <Text style={styles.footerLabel}>턴당 평균</Text>
        <Text style={styles.footerValue}>
          {(total / turnEvals.length).toFixed(2)}
          <Text style={styles.totalMax}>/2.5</Text>
        </Text>
      </View>
    </Gradient>
  )
}

const styles = StyleSheet.create({
  root: { borderRadius: 16, borderWidth: 1, borderColor: alpha(palette.indigo[500], 0.2), overflow: "hidden" },
  header: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: alpha(palette.indigo[500], 0.15), flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 14, fontWeight: "900", color: palette.indigo[300] },
  correct: { fontSize: 12, color: palette.gray[500] },
  total: { fontSize: 14, fontWeight: "900", color: palette.yellow[400], fontVariant: ["tabular-nums"] },
  totalMax: { fontSize: 12, fontWeight: "400", color: palette.gray[600] },
  item: { paddingHorizontal: 16, paddingVertical: 12 },
  itemDivider: { borderTopWidth: 1, borderTopColor: alpha("#ffffff", 0.05) },
  itemTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 6 },
  turn: { fontSize: 12, fontWeight: "900", color: palette.gray[600], width: 32 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: "900" },
  price: { flex: 1, minWidth: 0, fontSize: 11, color: palette.gray[500] },
  score: { fontSize: 14, fontWeight: "900", fontVariant: ["tabular-nums"] },
  scoreMax: { fontSize: 10, fontWeight: "400", color: palette.gray[600] },
  itemBottom: { flexDirection: "row", alignItems: "center", gap: 8 },
  track: { flex: 1, height: 6, backgroundColor: "#1a1a1a", borderRadius: 9999, overflow: "hidden" },
  verdict: { flex: 1, fontSize: 10, lineHeight: 12, color: palette.gray[500] },
  footer: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: alpha(palette.indigo[500], 0.15), backgroundColor: "#0a0a15", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  footerLabel: { fontSize: 12, color: palette.gray[500] },
  footerValue: { fontSize: 14, fontWeight: "900", color: palette.indigo[300] },
})
