import React from "react"
import { StyleSheet, Text, View } from "react-native"
import { Package, Waves } from "lucide-react-native"
import { Gradient } from "@/components/ui"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"
import type { TurnHistoryEntry } from "../types"

/** In-game Turn History (live during play) */
export function InGameHistory({ history }: { history: TurnHistoryEntry[] }) {
  if (history.length === 0) return null
  return (
    <View style={styles.root}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Gradient dir="br" colors={[palette.cyan[500], palette.blue[600]]} style={styles.headerIcon}>
          <Waves size={12} color="#ffffff" />
        </Gradient>
        <Text style={styles.headerTitle}>내 투자 기록</Text>
        <Text style={styles.headerCount}>{history.length}턴</Text>
      </View>
      <View>
        {history.map((h, i) => {
          const isBuy = h.action === "buy"
          const isSell = h.action === "sell"
          const isHold = !isBuy && !isSell
          return (
            <View key={i} style={[styles.row, i > 0 && styles.rowDivider]}>
              {/* 턴 번호 */}
              <Text style={styles.turn}>{h.turn + 1}</Text>
              {/* 액션 배지 */}
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isBuy ? alpha(palette.red[500], 0.15) : isSell ? alpha(palette.blue[500], 0.15) : alpha(palette.gray[700], 0.3),
                  },
                ]}
              >
                <Text style={[styles.badgeText, { color: isBuy ? palette.red[400] : isSell ? palette.blue[400] : palette.gray[500] }]}>
                  {isBuy ? "살래" : isSell ? "팔래" : "관망"}
                </Text>
              </View>
              {/* 수량 */}
              {!isHold && h.shares > 0 ? <Text style={styles.shares}>{h.shares}주</Text> : <Text style={styles.dash}>—</Text>}
              {/* 금액 */}
              {!isHold && h.amount > 0 && <Text style={styles.amount}>{formatNumber(h.amount)}원</Text>}
              {/* 우측: 실현 손익 or 보유 주수 */}
              <View style={styles.right}>
                {h.profit !== undefined ? (
                  <Text style={[styles.profit, { color: h.profit >= 0 ? palette.red[400] : palette.blue[400] }]}>
                    {h.profit >= 0 ? "+" : ""}
                    {formatNumber(h.profit)}원
                  </Text>
                ) : null}
                <View style={styles.held}>
                  <Package size={12} color={palette.gray[600]} />
                  <Text style={styles.heldText}>{h.sharesHeld}주</Text>
                </View>
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { marginTop: 12, borderRadius: 16, backgroundColor: "#111111", borderWidth: 1, borderColor: alpha("#ffffff", 0.05), overflow: "hidden" },
  header: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: alpha("#ffffff", 0.05), flexDirection: "row", alignItems: "center", gap: 8 },
  headerIcon: { width: 24, height: 24, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 12, fontWeight: "700", color: "#ffffff" },
  headerCount: { fontSize: 10, color: palette.gray[600], marginLeft: "auto" },
  row: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10 },
  rowDivider: { borderTopWidth: 1, borderTopColor: alpha("#ffffff", 0.05) },
  turn: { fontSize: 11, fontWeight: "900", color: palette.gray[600], width: 24, fontVariant: ["tabular-nums"] },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  shares: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  dash: { fontSize: 12, color: palette.gray[600] },
  amount: { fontSize: 10, color: palette.gray[500] },
  right: { flex: 1, flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 8 },
  profit: { fontSize: 12, fontWeight: "900" },
  held: { flexDirection: "row", alignItems: "center", gap: 2 },
  heldText: { fontSize: 10, color: palette.gray[500] },
})
