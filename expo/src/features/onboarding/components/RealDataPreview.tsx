import { useEffect, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import Svg, { Path } from "react-native-svg"
import { FadeUp, Gradient, Pulse } from "@/components/ui"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"

type Stock = {
  ticker: string
  name: string
  price: number
  pct: number
  spark: number[]
  logoBg: [string, string]
  logoText: string
}

const STOCKS: Stock[] = [
  {
    ticker: "NVDA",
    name: "엔비디아",
    price: 1284.5,
    pct: 6.42,
    spark: [40, 45, 42, 50, 55, 52, 60, 68, 65, 75, 82, 88],
    logoBg: [palette.green[400], palette.emerald[600]],
    logoText: "N",
  },
  {
    ticker: "005930",
    name: "삼성전자",
    price: 78400,
    pct: 2.15,
    spark: [50, 52, 48, 55, 58, 56, 60, 62, 64, 68, 65, 70],
    logoBg: [palette.blue[400], palette.blue[700]],
    logoText: "삼",
  },
  {
    ticker: "000660",
    name: "SK하이닉스",
    price: 235500,
    pct: 4.83,
    spark: [42, 48, 45, 52, 58, 55, 65, 70, 68, 75, 80, 85],
    logoBg: [palette.red[400], palette.rose[600]],
    logoText: "SK",
  },
  {
    ticker: "TSLA",
    name: "테슬라",
    price: 248.32,
    pct: -1.84,
    spark: [70, 65, 68, 60, 62, 55, 58, 52, 55, 50, 48, 52],
    logoBg: [palette.red[500], palette.red[800]],
    logoText: "T",
  },
  {
    ticker: "005380",
    name: "현대차",
    price: 245000,
    pct: 3.27,
    spark: [45, 48, 46, 52, 55, 58, 56, 62, 65, 68, 66, 72],
    logoBg: [palette.indigo[400], palette.blue[700]],
    logoText: "현",
  },
  {
    ticker: "454910",
    name: "레인보우로보틱스",
    price: 187300,
    pct: 8.91,
    spark: [30, 38, 35, 45, 52, 50, 60, 68, 72, 78, 85, 92],
    logoBg: [palette.cyan[400], palette.teal[600]],
    logoText: "R",
  },
]

function buildSpark(values: number[], w: number, h: number) {
  const step = w / (values.length - 1)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const norm = (v: number) => h - ((v - min) / range) * h * 0.85 - h * 0.075
  return values.map((v, i) => `${i === 0 ? "M" : "L"} ${i * step},${norm(v)}`).join(" ")
}

function fmtPrice(ticker: string, p: number) {
  if (/^\d/.test(ticker)) return `₩${formatNumber(Math.round(p))}`
  return `$${p.toFixed(2)}`
}

export function RealDataPreview({ trigger }: { trigger: number }) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    setTick(0)
    const timer = setInterval(() => setTick((t) => t + 1), 1800)
    return () => clearInterval(timer)
  }, [trigger])

  // 0~3번 인덱스 노출 (스크롤처럼 변경)
  const visible = [0, 1, 2, 3].map((i) => STOCKS[(tick + i) % STOCKS.length])

  return (
    <Gradient dir="b" colors={["#0a0a0a", "#050505"]} style={styles.root}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pulse>
            <View style={styles.liveDot} />
          </Pulse>
          <Text style={styles.liveText}>LIVE · AI / ROBOT</Text>
        </View>
        <Text style={styles.count}>{STOCKS.length}종목</Text>
      </View>

      {/* 종목 리스트 */}
      <View style={styles.list}>
        {visible.map((s, i) => {
          const up = s.pct >= 0
          return (
            <FadeUp key={`${s.ticker}-${tick}-${i}`} delay={i * 60} duration={400} distance={6} style={styles.row}>
              {/* 로고 */}
              <Gradient dir="br" colors={s.logoBg} style={styles.logo}>
                <Text style={styles.logoText}>{s.logoText}</Text>
              </Gradient>

              {/* 이름·티커 */}
              <View style={styles.nameBox}>
                <Text numberOfLines={1} style={styles.name}>
                  {s.name}
                </Text>
                <Text style={styles.ticker}>{s.ticker}</Text>
              </View>

              {/* 미니 스파크라인 */}
              <Svg width={40} height={18}>
                <Path d={buildSpark(s.spark, 40, 18)} fill="none" stroke={up ? "#22c55e" : "#ef4444"} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>

              {/* 가격 */}
              <View style={styles.priceBox}>
                <Text style={styles.price}>{fmtPrice(s.ticker, s.price)}</Text>
                <Text style={[styles.pct, { color: up ? palette.green[400] : palette.red[400] }]}>
                  {up ? "▲" : "▼"} {Math.abs(s.pct).toFixed(2)}%
                </Text>
              </View>
            </FadeUp>
          )
        })}
      </View>

      {/* 푸터 */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>실제 1년 데이터 · 매일 업데이트</Text>
      </View>
    </Gradient>
  )
}

const styles = StyleSheet.create({
  root: { borderRadius: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05), overflow: "hidden" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: alpha("#ffffff", 0.05),
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: palette.cyan[400] },
  liveText: { fontSize: 9, fontWeight: "900", color: palette.cyan[300], letterSpacing: 0.45 },
  count: { fontSize: 8, color: palette.gray[500] },
  list: { paddingHorizontal: 8, paddingVertical: 6, gap: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 6, paddingVertical: 4, borderRadius: 8 },
  logo: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  logoText: { fontSize: 9, fontWeight: "900", color: "#ffffff" },
  nameBox: { flex: 1, minWidth: 0 },
  name: { fontSize: 10, lineHeight: 12, fontWeight: "900", color: "#ffffff" },
  ticker: { fontSize: 8, color: palette.gray[500], marginTop: 2 },
  priceBox: { alignItems: "flex-end", flexShrink: 0, width: 68 },
  price: { fontSize: 10, lineHeight: 12, fontWeight: "900", color: "#ffffff", fontVariant: ["tabular-nums"] },
  pct: { fontSize: 9, fontWeight: "900", marginTop: 2, fontVariant: ["tabular-nums"] },
  footer: { paddingHorizontal: 12, paddingBottom: 8, paddingTop: 4, borderTopWidth: 1, borderTopColor: alpha("#ffffff", 0.05) },
  footerText: { fontSize: 8.5, color: palette.gray[600], textAlign: "center" },
})
