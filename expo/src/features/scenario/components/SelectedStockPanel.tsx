import { useMemo, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import Svg, { Polyline } from "react-native-svg"
import { TrendingDown, TrendingUp } from "lucide-react-native"
import type { GameScenario, ScenarioStock } from "@/data/game-scenarios/types"
import type { TurnSnapshot } from "@/lib/scenario/engine"
import { formatNumber } from "@/lib/format"
import { palette } from "@/theme"

// ============================================================
// 선택 종목 패널 — 간단 차트 + 정보
// ============================================================
export function SelectedStockPanel({
  scenario,
  stock,
  snapshot,
  held,
  avgPrice,
}: {
  scenario: GameScenario
  stock: ScenarioStock
  snapshot: TurnSnapshot
  held: number
  avgPrice: number
}) {
  const [w, setW] = useState(0)
  const series = scenario.priceSeries[stock.id]
  const upToNow = useMemo(() => series.slice(0, snapshot.turn), [series, snapshot.turn])
  const min = Math.min(...upToNow)
  const max = Math.max(...upToNow)
  const range = max - min || 1
  const h = 96
  const pad = 2
  const points = upToNow
    .map((p, i) => {
      const x = (i / Math.max(upToNow.length - 1, 1)) * w
      const y = pad + (h - pad * 2) - ((p - min) / range) * (h - pad * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")

  const last = upToNow[upToNow.length - 1]
  const prev = upToNow[upToNow.length - 2] ?? last
  const change = ((last - prev) / prev) * 100
  const isUp = change >= 0
  const changeColor = isUp ? palette.red[400] : palette.blue[400]

  const myPnL = held > 0 && avgPrice > 0 ? ((last - avgPrice) / avgPrice) * 100 : 0

  return (
    <View style={{ paddingHorizontal: 16 }}>
      <View style={styles.card}>
        <View style={styles.top}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: palette.gray[500] }}>
              {stock.market === "KR" ? "🇰🇷 KOSPI" : "🇺🇸 NASDAQ"} · {stock.character}
            </Text>
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#ffffff" }}>{stock.name}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 20, fontWeight: "700", color: "#ffffff" }}>{stock.currency === "KRW" ? `${formatNumber(last)}원` : `$${last.toFixed(2)}`}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              {isUp ? <TrendingUp size={12} color={changeColor} /> : <TrendingDown size={12} color={changeColor} />}
              <Text style={{ fontSize: 12, color: changeColor }}>
                {isUp ? "+" : ""}
                {change.toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>

        {/* 미니 차트 */}
        <View style={{ marginTop: 12, height: h }} onLayout={(e) => setW(Math.round(e.nativeEvent.layout.width))}>
          {w > 0 && (
            <Svg width={w} height={h}>
              <Polyline points={points} fill="none" stroke={isUp ? "#f87171" : "#60a5fa"} strokeWidth={2} />
            </Svg>
          )}
        </View>

        {/* 보유 정보 */}
        {held > 0 && (
          <View style={styles.holdRow}>
            <View style={styles.holdCell}>
              <Text style={styles.holdLabel}>보유</Text>
              <Text style={styles.holdValue}>{held}주</Text>
            </View>
            <View style={styles.holdCell}>
              <Text style={styles.holdLabel}>평단</Text>
              <Text style={styles.holdValue}>{stock.currency === "KRW" ? `${formatNumber(Math.round(avgPrice))}원` : `$${avgPrice.toFixed(2)}`}</Text>
            </View>
            <View style={styles.holdCell}>
              <Text style={styles.holdLabel}>평가손익</Text>
              <Text style={[styles.holdValue, { color: myPnL >= 0 ? palette.red[400] : palette.blue[400] }]}>
                {myPnL >= 0 ? "+" : ""}
                {myPnL.toFixed(1)}%
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: palette.gray[900], borderWidth: 1, borderColor: palette.gray[800], borderRadius: 16, padding: 16 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  holdRow: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: palette.gray[800], flexDirection: "row", gap: 8 },
  holdCell: { flex: 1, alignItems: "center" },
  holdLabel: { fontSize: 10, color: palette.gray[500] },
  holdValue: { fontSize: 12, fontWeight: "700", color: "#ffffff" },
})
