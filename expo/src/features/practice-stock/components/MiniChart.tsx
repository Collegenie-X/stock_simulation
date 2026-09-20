import React from "react"
import { StyleSheet, View } from "react-native"
import { SeriesChart } from "@/components/charts"
import type { MiniChartProps } from "@/features/practice-stock/types"

export const MiniChart = ({ data, color }: MiniChartProps) => {
  const prices = data.map((d) => d.price).filter((p) => p > 0)
  const minPrice = prices.length ? Math.min(...prices) : 0
  const maxPrice = prices.length ? Math.max(...prices) : 1
  const padding = (maxPrice - minPrice) * 0.2 || maxPrice * 0.05
  const yMin = Math.floor(minPrice - padding)
  const yMax = Math.ceil(maxPrice + padding)

  return (
    <View style={styles.wrap}>
      <SeriesChart
        data={data}
        width={64}
        height={48}
        yDomain={[yMin, yMax > yMin ? yMax : yMin + 1]}
        margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
        series={[{ key: "price", type: "area", color, strokeWidth: 2, fillOpacity: 0.2 }]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { height: 48, width: 64, flexShrink: 0, marginRight: 12 },
})
