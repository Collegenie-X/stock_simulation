import React, { useEffect, useRef, useState } from "react"
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native"
import { Bot, Heart } from "lucide-react-native"
import { Heartbeat } from "@/components/ui"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"
import { MiniChart } from "./MiniChart"
import { buildChartData } from "@/features/practice-stock/utils/stockBreath"
import type { StockListItem } from "@/features/practice-stock/types"

export interface StockRowProps {
  stock: StockListItem
  currentTurn: number
  stockViewTab: "현재가" | "평가금"
  isFavorite: boolean
  livePrice: number
  tickUp: boolean
  showInvestmentInfo?: boolean
  /** AI도 이 주식을 보유 중인지 */
  isAIHolding?: boolean
  onSelect: () => void
  onToggleFavorite: () => void
}

export const StockRow = ({
  stock,
  currentTurn,
  stockViewTab,
  isFavorite,
  livePrice,
  showInvestmentInfo = false,
  isAIHolding = false,
  onSelect,
  onToggleFavorite,
}: StockRowProps) => {
  const chartData = buildChartData(stock, currentTurn)

  // 가격 변동 시 플래시 (웹: animate-ticker-pulse — scale 1 → 1.04 → 1, 0.4s)
  const prevPriceRef = useRef(livePrice)
  const [flash, setFlash] = useState<"up" | "down" | null>(null)
  const pulse = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (livePrice !== prevPriceRef.current) {
      setFlash(livePrice > prevPriceRef.current ? "up" : "down")
      prevPriceRef.current = livePrice
      pulse.setValue(0)
      Animated.timing(pulse, { toValue: 1, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }).start()
      const t = setTimeout(() => setFlash(null), 500)
      return () => clearTimeout(t)
    }
  }, [livePrice, pulse])

  const pulseStyle = {
    transform: [{ scale: pulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.04, 1] }) }],
    opacity: flash ? 1 : 0.96,
  }

  const liveDailyChange =
    stock.prevPrice > 0 ? ((livePrice - stock.prevPrice) / stock.prevPrice) * 100 : 0
  const liveDailyChangePct = Math.abs(liveDailyChange).toFixed(1)
  const liveDailyIsUp = liveDailyChange >= 0

  const liveProfit = stock.myAvg > 0
    ? ((livePrice - stock.myAvg) / stock.myAvg) * 100
    : 0
  const liveProfitPct = Math.abs(liveProfit).toFixed(1)
  const liveIsProfit = liveProfit >= 0

  const showEval = showInvestmentInfo && stock.myHoldings > 0 && stockViewTab === "평가금"
  const rightIsUp = showEval ? liveIsProfit : liveDailyIsUp
  const rightValue = showEval ? formatNumber(Math.round(livePrice * stock.myHoldings)) : formatNumber(livePrice)
  const rightPct = showEval ? liveProfitPct : liveDailyChangePct

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onSelect}
        style={({ pressed }) => [styles.main, pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }]}
      >
        {/* 미니차트 */}
        <View style={styles.chartWrap}>
          <MiniChart
            data={chartData}
            color={stock.isUp ? "#ef4444" : "#3b82f6"}
            isUp={stock.isUp}
          />
          {/* AI 보유 뱃지 */}
          {isAIHolding && (
            <View style={styles.aiBadge}>
              <Bot size={8} color="#ffffff" />
            </View>
          )}
        </View>

        {/* 이름 + 서브정보 */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{stock.name}</Text>
            {isAIHolding && (
              <View style={styles.aiTag}>
                <Bot size={8} color={palette.purple[400]} />
                <Text style={styles.aiTagText}>AI</Text>
              </View>
            )}
          </View>
          {showInvestmentInfo && stock.myHoldings > 0 ? (
            stockViewTab === "현재가" ? (
              <Text style={styles.sub}>📍 {formatNumber(Math.round(stock.myAvg))}원</Text>
            ) : (
              <Text style={styles.sub}>📦 {stock.myHoldings}주</Text>
            )
          ) : (
            <Text style={styles.sub}>← {formatNumber(Math.round(stock.prevPrice))}원</Text>
          )}
        </View>

        {/* 오른쪽 가격 (라이브) */}
        <View style={styles.right}>
          <Animated.View style={pulseStyle}>
            <Text style={[styles.price, { color: rightIsUp ? palette.red[400] : palette.blue[400] }]}>
              {rightValue}원
            </Text>
          </Animated.View>
          <View style={styles.pctRow}>
            <Text style={[styles.arrow, { color: rightIsUp ? palette.red[500] : palette.blue[500] }]}>
              {rightIsUp ? "▲" : "▼"}
            </Text>
            <Text style={[styles.pct, { color: rightIsUp ? palette.red[500] : palette.blue[500] }]}>
              {rightPct}%
            </Text>
          </View>
        </View>
      </Pressable>

      {/* 관심 하트 버튼 */}
      <Pressable
        onPress={onToggleFavorite}
        hitSlop={6}
        style={({ pressed }) => [styles.heartBtn, pressed && { transform: [{ scale: 0.9 }] }]}
      >
        {isFavorite ? (
          <Heartbeat>
            <Heart size={20} color={palette.red[500]} fill={palette.red[500]} />
          </Heartbeat>
        ) : (
          <Heart size={20} color={palette.gray[600]} />
        )}
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderRadius: 8 },
  main: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  chartWrap: { flexShrink: 0, position: "relative" },
  aiBadge: {
    position: "absolute",
    bottom: -2,
    right: 10,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: palette.purple[500],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#191919",
  },
  info: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  name: { fontWeight: "700", color: "#ffffff", fontSize: 14, flexShrink: 1 },
  aiTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    flexShrink: 0,
    backgroundColor: alpha(palette.purple[500], 0.15),
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  aiTagText: { fontSize: 8, fontWeight: "700", color: palette.purple[400] },
  sub: { fontSize: 12, color: palette.gray[500] },
  right: { alignItems: "flex-end", flexShrink: 0 },
  price: { fontSize: 14, fontWeight: "700" },
  pctRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 2 },
  arrow: { fontSize: 8 },
  pct: { fontSize: 12, fontWeight: "700" },
  heartBtn: { flexShrink: 0, padding: 4 },
})
