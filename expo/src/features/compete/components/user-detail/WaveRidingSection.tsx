import { Pressable, StyleSheet, Text, View } from "react-native"
import { Waves } from "lucide-react-native"
import { SeriesChart, type ChartReferenceDot } from "@/components/charts"
import { Gradient } from "@/components/ui"
import { formatNumber } from "@/lib/format"
import { palette } from "@/theme"
import type { WavePeriod, WavePoint } from "./data"
import { sectionStyles } from "./sectionStyles"

interface WaveRidingSectionProps {
  period: WavePeriod
  onChangePeriod: (p: WavePeriod) => void
  data: WavePoint[]
}

const PERIODS: { id: WavePeriod; label: string }[] = [
  { id: "1D", label: "1일" },
  { id: "1W", label: "1주" },
  { id: "1M", label: "1달" },
]

const GUIDE = [
  { emoji: "🔴", title: "매수 = 파도에 올라타기", desc: "가격이 낮을 때 주식을 사요" },
  { emoji: "🟢", title: "매도 = 파도에서 내리기", desc: "가격이 높을 때 주식을 팔아요" },
  { emoji: "🌊", title: "파도의 흐름을 읽어요", desc: "언제 오르고 내릴지 예측해요" },
]

export function WaveRidingSection({ period, onChangePeriod, data }: WaveRidingSectionProps) {
  // 웹 CustomDot (매수/매도 마커)
  const dots: ChartReferenceDot[] = data.flatMap((d, i) =>
    d.action === "buy"
      ? [{ index: i, y: d.price, color: "#FF3D00", stroke: "#ffffff", r: 8, label: "🏄 매수", labelColor: "#FF3D00" }]
      : d.action === "sell"
        ? [{ index: i, y: d.price, color: "#00C853", stroke: "#ffffff", r: 8, label: "🎯 매도", labelColor: "#00C853" }]
        : [],
  )

  return (
    <View style={sectionStyles.card}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Waves size={24} color={palette.cyan[600]} />
          <Text style={sectionStyles.title}>파도 타기 분석</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {PERIODS.map((p) =>
            period === p.id ? (
              <Pressable key={p.id} onPress={() => onChangePeriod(p.id)}>
                <Gradient dir="r" colors={[palette.blue[500], palette.cyan[500]]} style={[styles.periodBtn, { boxShadow: "0 4px 8px rgba(0,0,0,0.15)" }]}>
                  <Text style={[styles.periodText, { color: "#ffffff" }]}>{p.label}</Text>
                </Gradient>
              </Pressable>
            ) : (
              <Pressable key={p.id} onPress={() => onChangePeriod(p.id)} style={[styles.periodBtn, { backgroundColor: palette.gray[100] }]}>
                <Text style={[styles.periodText, { color: palette.gray[600] }]}>{p.label}</Text>
              </Pressable>
            ),
          )}
        </View>
      </View>

      <Gradient dir="b" colors={[palette.cyan[50], palette.blue[50]]} style={styles.chartBox}>
        <SeriesChart
          data={data}
          height={280}
          xKey="time"
          series={[{ key: "price", type: "area", color: "#0891b2", strokeWidth: 4, fillOpacity: 0.6, name: "주가" }]}
          yDomain={[60000, 90000]}
          showGrid
          showXAxis
          showYAxis
          xTickCount={data.length}
          yTickCount={4}
          yTickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
          yAxisWidth={32}
          gridColor="#e0f2fe"
          axisColor="#0891b2"
          referenceDots={dots}
          margin={{ top: 28, right: 16 }}
          tooltip
          tooltipFormatter={(v) => `주가 : ${formatNumber(v)}원`}
        />
      </Gradient>

      <Gradient dir="br" colors={[palette.cyan[50], palette.blue[100]]} style={styles.guideBox}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Text style={{ fontSize: 24, color: palette.gray[900] }}>🏄‍♂️</Text>
          <Text style={{ fontWeight: "700", fontSize: 16, color: palette.gray[900] }}>파도 타는 법</Text>
        </View>
        <View style={{ gap: 8 }}>
          {GUIDE.map((g) => (
            <View key={g.title} style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
              <Text style={{ fontSize: 20, color: palette.gray[900] }}>{g.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: palette.gray[800] }}>{g.title}</Text>
                <Text style={{ fontSize: 12, color: palette.gray[600] }}>{g.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </Gradient>
    </View>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 },
  periodBtn: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9999 },
  periodText: { fontSize: 12, fontWeight: "700" },
  chartBox: { marginBottom: 16, borderRadius: 16, padding: 16 },
  guideBox: { borderRadius: 16, padding: 16 },
})
