import { ScrollView, StyleSheet, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { PressableScale, Pulse } from "@/components/ui"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"
import { MiniLine } from "./MiniLine"

interface StockItem {
  name: string
  price: number
  change: number
  chartData: number[]
}

const STOCKS: StockItem[] = [
  { name: "삼성전자", price: 68000, change: 1.2, chartData: [67000, 67200, 67800, 68200, 68000, 68500, 69000, 68800, 69200] },
  { name: "카카오", price: 72000, change: 3.5, chartData: [68000, 69500, 71000, 70500, 72000, 71500, 73000, 72800, 74000] },
  { name: "테슬라", price: 245000, change: -2.1, chartData: [255000, 252000, 248000, 250000, 245000, 243000, 246000, 242000, 240000] },
  { name: "네이버", price: 185000, change: -0.8, chartData: [188000, 187000, 186500, 186000, 185000, 185500, 184000, 185200, 184500] },
  { name: "현대차", price: 198000, change: 2.3, chartData: [192000, 194000, 193000, 196000, 198000, 197000, 199000, 200000, 201000] },
]

export default function HotStocks() {
  const router = useRouter()

  return (
    <View>
      <View style={styles.head}>
        <Text style={styles.title}>HOT CHARTS</Text>
        <Pulse>
          <Text style={styles.live}>LIVE</Text>
        </Pulse>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
        {STOCKS.map((stock) => {
          const isUp = stock.change >= 0
          return (
            <PressableScale key={stock.name} onPress={() => router.push("/practice/setup")} scaleTo={0.95} style={styles.card}>
              <Text numberOfLines={1} style={styles.name}>
                {stock.name}
              </Text>
              <Text style={styles.price}>{formatNumber(stock.price)}원</Text>
              <MiniLine data={stock.chartData} isUp={isUp} />
              <Text style={[styles.change, { color: isUp ? palette.red[400] : palette.blue[400] }]}>
                {isUp ? "+" : ""}
                {stock.change}%
              </Text>
            </PressableScale>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  title: { fontSize: 14, fontWeight: "700", color: palette.gray[400], letterSpacing: 0.7 },
  live: { fontSize: 10, color: palette.gray[600] },
  list: { gap: 10, paddingHorizontal: 20, paddingBottom: 4 },
  card: { backgroundColor: "#1e1e2e", borderRadius: 16, padding: 12, borderWidth: 1, borderColor: alpha("#ffffff", 0.05), width: 130 },
  name: { fontSize: 12, fontWeight: "700", color: "#ffffff", marginBottom: 2 },
  price: { fontSize: 10, color: palette.gray[500], marginBottom: 8 },
  change: { fontSize: 12, fontWeight: "700", marginTop: 6 },
})
