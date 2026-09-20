import { useEffect, useRef, useState } from "react"
import { Animated, Pressable, StyleSheet, Text, View } from "react-native"
import { ChevronDown } from "lucide-react-native"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"
import { fmtPnl } from "../../utils/format"

export interface SimulationTrade {
  date: string
  action: string
  stock: string
  price: number
  shares: number
  amount: number
  wavePoint: string
  profit?: number
}

/** 거래 기록 (펼치기/닫기) */
export function TradeListSection({ trades }: { trades: SimulationTrade[] }) {
  const [tradesOpen, setTradesOpen] = useState(false)
  const rot = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(rot, { toValue: tradesOpen ? 1 : 0, duration: 300, useNativeDriver: true }).start()
  }, [tradesOpen, rot])

  return (
    <View style={styles.panel}>
      <Pressable onPress={() => setTradesOpen((v) => !v)} style={styles.toggle}>
        <Text style={styles.title}>📋 거래 기록</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 12, color: palette.gray[500] }}>{trades.length}건</Text>
          <Animated.View style={{ transform: [{ rotate: rot.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] }) }] }}>
            <ChevronDown size={16} color={palette.gray[500]} />
          </Animated.View>
        </View>
      </Pressable>

      {tradesOpen && (
        <View>
          {trades.map((trade, i) => {
            const isBuy = trade.action === "buy"
            const profit = trade.profit
            return (
              <View key={i} style={styles.row}>
                <View style={[styles.action, { backgroundColor: alpha(isBuy ? palette.green[500] : palette.red[500], 0.2) }]}>
                  <Text style={{ fontSize: 11, fontWeight: "900", color: isBuy ? palette.green[400] : palette.red[400] }}>{isBuy ? "매수" : "매도"}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.stock}>
                    {trade.stock}
                    <Text style={styles.detail}>
                      {"  "}
                      {trade.shares}주 × {formatNumber(trade.price)}원
                    </Text>
                  </Text>
                  <Text style={styles.meta}>
                    {trade.date} · {trade.wavePoint}
                  </Text>
                </View>
                {profit !== undefined && <Text style={[styles.profit, { color: profit >= 0 ? palette.green[400] : palette.red[400] }]}>{fmtPnl(profit)}</Text>}
              </View>
            )
          })}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  panel: { marginTop: 12, backgroundColor: "#0f0f0f", borderRadius: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05), overflow: "hidden" },
  toggle: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
  title: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: alpha("#ffffff", 0.05) },
  action: { width: 40, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  stock: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  detail: { fontSize: 12, color: palette.gray[400], fontWeight: "400" },
  meta: { fontSize: 11, color: palette.gray[500] },
  profit: { fontSize: 14, fontWeight: "900", flexShrink: 0 },
})
