import { StyleSheet, Text, View } from "react-native"
import { alpha, palette } from "@/theme"
import { formatNumber } from "@/lib/format"
import type { StockCompareResult } from "@/features/practice-stock/hooks/useAICompetitor"

const ACTION_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  buy: { label: "매수", color: palette.red[400], bg: alpha(palette.red[500], 0.15) },
  sell: { label: "매도", color: palette.blue[400], bg: alpha(palette.blue[500], 0.15) },
  skip: { label: "관망", color: palette.gray[400], bg: alpha(palette.gray[700], 0.4) },
  hold: { label: "관망", color: palette.gray[400], bg: alpha(palette.gray[700], 0.4) },
}

function ActionCell({ title, info, qty }: { title: string; info: { label: string; color: string; bg: string }; qty: number }) {
  return (
    <View style={styles.cell}>
      <Text style={styles.cellTitle} numberOfLines={1}>{title}</Text>
      <View style={[styles.cellBadge, { backgroundColor: info.bg }]}>
        <Text style={[styles.cellLabel, { color: info.color }]}>
          {info.label}
          {qty > 0 ? <Text style={{ fontSize: 8, color: info.color }}> {qty}주</Text> : null}
        </Text>
      </View>
    </View>
  )
}

function MatchBadge({ same, emoji, target, color }: { same: boolean; emoji: string; target: string; color: "purple" | "yellow" }) {
  if (same) {
    return (
      <View style={[styles.match, { backgroundColor: alpha(palette[color][500], 0.1), borderWidth: 1, borderColor: alpha(palette[color][500], 0.2) }]}>
        <Text style={[styles.matchText, { color: palette[color][400] }]}>{emoji} {target}와 같은 선택</Text>
      </View>
    )
  }
  return (
    <View style={[styles.match, { backgroundColor: alpha(palette.gray[700], 0.3) }]}>
      <Text style={[styles.matchText, { color: palette.gray[500] }]}>{emoji} {target}와 다른 선택</Text>
    </View>
  )
}

// ── 종목별 3자 비교 카드 ───────────────────────────────────
export function StockCompareCard({
  result, aiName, aiEmoji, bestAIName, bestAIEmoji,
}: {
  result: StockCompareResult
  aiName: string; aiEmoji: string
  bestAIName: string; bestAIEmoji: string
}) {
  const userA = ACTION_LABEL[result.userAction] ?? ACTION_LABEL.hold
  const simA = ACTION_LABEL[result.similarAction] ?? ACTION_LABEL.hold
  const bestA = ACTION_LABEL[result.bestAction] ?? ACTION_LABEL.hold

  const isSameAsSimilar = result.userAction === result.similarAction
  const isSameAsBest = result.userAction === result.bestAction

  return (
    <View style={styles.card}>
      {/* 종목명 + 가격 */}
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>{result.stockName}</Text>
        <Text style={styles.price}>{formatNumber(result.price)}원</Text>
      </View>

      {/* 3자 선택 비교 */}
      <View style={styles.grid}>
        <ActionCell title="나" info={userA} qty={result.userAction === "buy" ? result.userQty : 0} />
        <ActionCell title={`${aiEmoji} ${aiName}`} info={simA} qty={result.similarAction === "buy" ? result.similarQty : 0} />
        <ActionCell title={`${bestAIEmoji} ${bestAIName}`} info={bestA} qty={result.bestAction === "buy" ? result.bestQty : 0} />
      </View>

      {/* 일치/불일치 뱃지 */}
      <View style={styles.matches}>
        <MatchBadge same={isSameAsSimilar} emoji={aiEmoji} target="유사AI" color="purple" />
        <MatchBadge same={isSameAsBest} emoji={bestAIEmoji} target="최고AI" color="yellow" />
      </View>

      {/* AI 이유 */}
      {!!result.similarReason && (
        <Text style={[styles.reason, { marginTop: 8 }]}>
          <Text style={{ color: palette.purple[400], fontWeight: "700" }}>{aiEmoji}</Text> {result.similarReason}
        </Text>
      )}
      {!!result.bestReason && result.bestReason !== result.similarReason && (
        <Text style={[styles.reason, { marginTop: 2 }]}>
          <Text style={{ color: palette.yellow[400], fontWeight: "700" }}>{bestAIEmoji}</Text> {result.bestReason}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: alpha(palette.gray[900], 0.5),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.2),
    padding: 12,
  },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  name: { flexShrink: 1, fontSize: 12, fontWeight: "800", color: "#ffffff" },
  price: { fontSize: 10, color: palette.gray[500] },
  grid: { flexDirection: "row", gap: 6, marginBottom: 8 },
  cell: { flex: 1, alignItems: "center" },
  cellTitle: { fontSize: 8, color: palette.gray[600], marginBottom: 4 },
  cellBadge: { alignSelf: "stretch", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  cellLabel: { fontSize: 10, fontWeight: "800" },
  matches: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  match: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999 },
  matchText: { fontSize: 9, fontWeight: "700" },
  reason: { fontSize: 9, lineHeight: 14, color: palette.gray[500] },
})
