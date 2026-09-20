import { useEffect, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ArrowLeft } from "lucide-react-native"
import { Screen } from "@/components/layout"
import { formatNumber } from "@/lib/format"
import { storage } from "@/lib/storage"
import scenariosData from "@/data/game-scenarios.json"
import scenarios100DaysData from "@/data/stock-100days-data.json"
import { alpha, palette } from "@/theme"

const HEADER_HEIGHT = 56

export default function OrdersScreen() {
  const params = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const scenarioId = params.id as string
  const [pendingOrders, setPendingOrders] = useState<any[]>([])
  const [scenario, setScenario] = useState<any>(null)

  useEffect(() => {
    // 100일 데이터 포함하여 시나리오 검색
    const allScenarios: any[] = [...scenariosData.scenarios, scenarios100DaysData]
    const foundScenario = allScenarios.find((s) => s.id === scenarioId)
    setScenario(foundScenario)

    const savedSession = storage.getGameSession(scenarioId)
    if (savedSession && savedSession.pendingOrders) {
      setPendingOrders(savedSession.pendingOrders)
    }
  }, [scenarioId])

  const handleCancelOrder = (index: number) => {
    const newOrders = [...pendingOrders]
    newOrders.splice(index, 1)
    setPendingOrders(newOrders)

    // Update storage
    const savedSession = storage.getGameSession(scenarioId)
    if (savedSession) {
      savedSession.pendingOrders = newOrders
      storage.setGameSession(scenarioId, savedSession)
    }
  }

  const getStockName = (stockId: string) => {
    return scenario?.stocks.find((s: any) => s.id === stockId)?.name || stockId
  }

  return (
    <Screen
      bg="#191919"
      withHeader
      fixed={
        <View style={[styles.header, { paddingTop: insets.top, height: insets.top + HEADER_HEIGHT }]}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 4 }}>
            <ArrowLeft size={24} color={palette.gray[300]} />
          </Pressable>
          <Text style={styles.headerTitle}>대기 중인 주문</Text>
        </View>
      }
    >
      <View style={styles.body}>
        {pendingOrders.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>대기 중인 주문이 없습니다.</Text>
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            {pendingOrders.map((order, idx) => {
              const isBuyOrder = order.type === "buy"
              const tone = isBuyOrder ? palette.red[500] : palette.blue[500]
              return (
                <View key={idx} style={styles.card}>
                  <View style={{ marginBottom: 16 }}>
                    <Text style={styles.stockName}>{getStockName(order.stockId)}</Text>
                    <View style={styles.row}>
                      <View style={[styles.badge, { backgroundColor: alpha(tone, 0.2) }]}>
                        <Text style={[styles.badgeText, { color: tone }]}>{isBuyOrder ? "구매" : "판매"}</Text>
                      </View>
                      <Text style={styles.target}>
                        {typeof order.targetPrice === "number" && order.targetPrice < 100
                          ? `${order.targetPrice > 0 ? "+" : ""}${order.targetPrice}% 도달 시`
                          : `${formatNumber(order.targetPrice)}원 도달 시`}
                      </Text>
                    </View>
                    <Text style={styles.condition}>
                      {order.condition === "ge" ? "이상" : "이하"} 조건 • {order.quantity}주
                    </Text>
                  </View>
                  <Pressable onPress={() => handleCancelOrder(idx)} style={({ pressed }) => [styles.cancelBtn, pressed && { backgroundColor: palette.gray[700] }]}>
                    <Text style={styles.cancelText}>주문 취소하기</Text>
                  </Pressable>
                </View>
              )
            })}
          </View>
        )}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#191919",
    borderBottomWidth: 1,
    borderBottomColor: palette.gray[800],
    zIndex: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#ffffff" },
  body: { flex: 1, padding: 20 },
  empty: { height: 256, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 16, color: palette.gray[500] },
  card: { backgroundColor: alpha(palette.gray[800], 0.3), borderRadius: 16, padding: 20, borderWidth: 1, borderColor: palette.gray[800] },
  stockName: { fontSize: 14, color: palette.gray[400], marginBottom: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 12, fontWeight: "700" },
  target: { fontSize: 18, fontWeight: "700", color: "#ffffff", flexShrink: 1 },
  condition: { fontSize: 14, color: palette.gray[500], marginTop: 4 },
  cancelBtn: { width: "100%", paddingVertical: 12, borderRadius: 12, backgroundColor: palette.gray[800], alignItems: "center" },
  cancelText: { fontSize: 14, fontWeight: "500", color: palette.gray[300] },
})
