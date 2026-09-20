import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"
import { LABELS } from "@/features/practice-stock/config"

export interface PendingOrder {
  stockId: string
  type: "buy" | "sell"
  targetPrice: number
  condition: "ge" | "le"
  quantity: number
}

interface PendingOrdersListProps {
  orders: PendingOrder[]
  onCancelOrder: (order: PendingOrder) => void
}

/** 미체결 주문 */
export function PendingOrdersList({ orders, onCancelOrder }: PendingOrdersListProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{LABELS.stockDetail.pendingOrders}</Text>
      <View style={{ gap: 12 }}>
        {orders.map((order, idx) => {
          const c = order.type === "buy" ? palette.red[500] : palette.blue[500]
          return (
            <View key={idx} style={styles.card}>
              <View style={{ flex: 1 }}>
                <View style={styles.topRow}>
                  <View style={[styles.typeTag, { backgroundColor: alpha(c, 0.2) }]}>
                    <Text style={[styles.typeText, { color: c }]}>{order.type === "buy" ? "구매" : "판매"}</Text>
                  </View>
                  <Text style={styles.condition}>{order.condition === "ge" ? "이상" : "이하"} 조건</Text>
                </View>
                <Text style={styles.target}>
                  {order.targetPrice < 100
                    ? `${order.targetPrice > 0 ? "+" : ""}${order.targetPrice}% 도달 시`
                    : `${formatNumber(order.targetPrice)}원 도달 시`}
                </Text>
              </View>
              <Pressable
                onPress={() => onCancelOrder(order)}
                style={({ pressed }) => [styles.cancelBtn, pressed && { backgroundColor: palette.gray[600] }]}
              >
                <Text style={styles.cancelText}>{LABELS.stockDetail.cancelOrder}</Text>
              </Pressable>
            </View>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, marginBottom: 24 },
  title: { fontWeight: "700", color: palette.gray[200], fontSize: 16, marginBottom: 12 },
  card: {
    backgroundColor: alpha(palette.gray[800], 0.3),
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.gray[800],
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  topRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  typeTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  typeText: { fontSize: 12, fontWeight: "700" },
  condition: { fontSize: 14, fontWeight: "700", color: palette.gray[300] },
  target: { fontSize: 18, fontWeight: "700", color: "#ffffff" },
  cancelBtn: { backgroundColor: palette.gray[700], paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  cancelText: { fontSize: 12, color: palette.gray[400] },
})
