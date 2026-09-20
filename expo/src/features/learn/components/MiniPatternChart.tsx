import React, { useMemo } from "react"
import { StyleSheet, View } from "react-native"
import { LiveMiniChart, type MiniPoint } from "@/components/charts"
import { type ChartData } from "@/data/chart-patterns"
import { alpha } from "@/theme"

interface MiniPatternChartProps {
  chartData: ChartData
  signal: "매수" | "매도" | "양방향"
}

const W = 80
const H = 44

/** 목록 카드용 패턴 미니 차트 — 선이 스스로 그려지고 점이 따라 움직입니다 */
export function MiniPatternChart({ chartData, signal }: MiniPatternChartProps) {
  const lineColor = signal === "매도" ? "#ef4444" : signal === "매수" ? "#22c55e" : "#f59e0b"
  // 데이터의 y는 위가 0 → 미니차트 좌표(아래가 0)로 뒤집어 줌
  const points = useMemo<MiniPoint[]>(() => chartData.points.map(([x, y]) => ({ x: x / 100, y: 1 - y / 100 })), [chartData])

  return (
    <View style={styles.wrap}>
      <LiveMiniChart points={points} color={lineColor} width={W} height={H} />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { width: W, height: H, borderRadius: 8, overflow: "hidden", backgroundColor: alpha("#ffffff", 0.03) },
})
