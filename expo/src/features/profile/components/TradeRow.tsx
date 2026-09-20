import { StyleSheet, Text, View } from "react-native"
import { Zap } from "lucide-react-native"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"
import { PROFILE_LABELS } from "../config"
import type { Trade } from "../types"

const L = PROFILE_LABELS.simulationDetail

export function TradeRow({ trade, last }: { trade: Trade; last?: boolean }) {
  const isBuy = trade.action === "buy"
  const actionColor = isBuy ? palette.red[400] : palette.blue[400]
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={[styles.action, { backgroundColor: alpha(isBuy ? palette.red[500] : palette.blue[500], 0.2) }]}>
        <Text style={[styles.actionText, { color: actionColor }]}>{isBuy ? L.buyLabel : L.sellLabel}</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.top}>
          <Text style={styles.stock}>{trade.stock}</Text>
          <Text style={styles.date}>{trade.date}</Text>
        </View>
        <View style={styles.detail}>
          <Text style={styles.detailText}>
            {trade.shares}주 × {formatNumber(trade.price)}원
          </Text>
          {trade.profit != null && (
            <Text style={[styles.profit, { color: trade.profit >= 0 ? palette.red[400] : palette.blue[400] }]}>
              {trade.profit >= 0 ? "+" : ""}
              {formatNumber(trade.profit)}원
            </Text>
          )}
        </View>
        <View style={styles.wave}>
          <Zap size={12} color={palette.cyan[400]} />
          <Text style={styles.waveText}>{trade.wavePoint}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: alpha("#ffffff", 0.05) },
  action: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 },
  actionText: { fontSize: 12, fontWeight: "700" },
  body: { flex: 1, minWidth: 0 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 2 },
  stock: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  date: { fontSize: 12, color: palette.gray[400] },
  detail: { flexDirection: "row", alignItems: "center", gap: 12 },
  detailText: { fontSize: 12, color: palette.gray[400] },
  profit: { fontSize: 12, fontWeight: "600" },
  wave: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  waveText: { fontSize: 12, color: palette.cyan[400], flexShrink: 1 },
})
