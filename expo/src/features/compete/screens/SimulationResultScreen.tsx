import { StyleSheet, Text, View } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Screen } from "@/components/layout"
import { Gradient, PressableScale } from "@/components/ui"
import historyData from "@/data/compete-history.json"
import { alpha, palette } from "@/theme"
import { CumulativeReturnChart } from "../components/result/CumulativeReturnChart"
import { DailyReturnBars } from "../components/result/DailyReturnBars"
import { ResultBottomBar } from "../components/result/ResultBottomBar"
import { ResultHeader } from "../components/result/ResultHeader"
import { ResultNotFound } from "../components/result/ResultNotFound"
import { SimulationHeroCard } from "../components/result/SimulationHeroCard"
import { TradeListSection, type SimulationTrade } from "../components/result/TradeListSection"
import { WaveAccuracyCard } from "../components/result/WaveAccuracyCard"

export default function SimulationResultScreen() {
  const params = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/compete"))

  const record = historyData.simulations.find((s) => s.id === params.id)

  if (!record) return <ResultNotFound onBack={goBack} />

  const isProfit = record.result === "profit"
  const profitAmount = record.profitAmount

  // Daily return 차트 데이터
  const dailyData = record.dailyReturns.map((v, i) => ({
    day: `${i + 1}일`,
    value: v,
    type: v >= 0 ? "profit" : "loss",
  }))

  // 누적 수익 곡선 (dailyReturns 누적)
  const cumulativeData = record.dailyReturns.reduce<{ day: string; cumulative: number }[]>((acc, v, i) => {
    const prev = i === 0 ? 0 : acc[i - 1].cumulative
    acc.push({ day: `${i + 1}일`, cumulative: parseFloat((prev + v).toFixed(2)) })
    return acc
  }, [])

  return (
    <Screen
      bg="#000000"
      withHeader
      contentStyle={{ paddingBottom: 152 }}
      fixed={
        <>
          <ResultHeader title="실전 시뮬레이션 결과" onBack={goBack} showShare />
          <ResultBottomBar>
            <PressableScale onPress={goBack} style={{ flex: 1 }}>
              <Gradient dir="r" colors={[palette.yellow[500], palette.orange[600]]} style={styles.cta}>
                <Text style={styles.ctaText}>🏆 경쟁 페이지로</Text>
              </Gradient>
            </PressableScale>
          </ResultBottomBar>
        </>
      }
    >
      <View style={{ paddingHorizontal: 16 }}>
        {/* Hero Card */}
        <SimulationHeroCard
          isProfit={isProfit}
          weekLabel={record.weekLabel}
          scenarioName={record.scenarioName}
          profitRate={record.profitRate}
          profitAmount={profitAmount}
          finalAssets={record.finalAssets}
          rank={record.rank}
          totalUsers={record.totalUsers}
          tradeCount={record.tradeCount}
          winDays={record.winDays}
          loseDays={record.loseDays}
          waveAccuracy={record.waveAccuracy}
        />

        {/* 누적 수익률 곡선 */}
        <CumulativeReturnChart data={cumulativeData} isProfit={isProfit} />

        {/* 일별 수익/손실 막대 */}
        <DailyReturnBars data={dailyData} winDays={record.winDays} loseDays={record.loseDays} />

        {/* 파도 정확도 */}
        <WaveAccuracyCard waveAccuracy={record.waveAccuracy} />

        {/* 거래 기록 (펼치기/닫기) */}
        <TradeListSection trades={record.trades as SimulationTrade[]} />

        {/* 관심 종목 */}
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>이번 시뮬레이션 종목</Text>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            {record.stocks.map((s) => (
              <View key={s} style={styles.chip}>
                <Text style={styles.chipText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  panel: { marginTop: 12, marginBottom: 16, backgroundColor: "#0f0f0f", borderRadius: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05), padding: 16 },
  panelTitle: { fontSize: 14, fontWeight: "700", color: "#ffffff", marginBottom: 8 },
  chip: { backgroundColor: alpha("#ffffff", 0.1), paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9999, borderWidth: 1, borderColor: alpha("#ffffff", 0.1) },
  chipText: { color: "#ffffff", fontSize: 12, fontWeight: "600" },
  cta: { height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center", boxShadow: "0 10px 15px rgba(0,0,0,0.3)" },
  ctaText: { fontSize: 16, fontWeight: "900", color: "#ffffff" },
})
