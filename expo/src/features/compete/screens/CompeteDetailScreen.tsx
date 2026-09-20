import { useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { MobileHeader, MobileNav, Screen } from "@/components/layout"
import { Button, Gradient } from "@/components/ui"
import leaderboardData from "@/data/leaderboard.json"
import { palette } from "@/theme"
import { DailyProfitSection } from "../components/user-detail/DailyProfitSection"
import { ProfitTrendSection } from "../components/user-detail/ProfitTrendSection"
import { StrategySection } from "../components/user-detail/StrategySection"
import { SummaryCard } from "../components/user-detail/SummaryCard"
import { TradeAnalysisSection } from "../components/user-detail/TradeAnalysisSection"
import { WavePatternSection } from "../components/user-detail/WavePatternSection"
import { WaveRidingSection } from "../components/user-detail/WaveRidingSection"
import { getWaveData, type WavePeriod } from "../components/user-detail/data"

export default function CompeteDetailScreen() {
  const params = useLocalSearchParams<{ userId: string }>()
  const router = useRouter()
  const userId = params.userId as string
  const [wavePeriod, setWavePeriod] = useState<WavePeriod>("1W")

  const user = leaderboardData.rankings.find((r) => r.userId === userId)

  if (!user) {
    return (
      <Screen bg={palette.gray[50]} scroll={false} contentStyle={styles.center}>
        <Text style={{ color: palette.gray[500], fontSize: 16 }}>사용자를 찾을 수 없습니다</Text>
        <Button style={{ marginTop: 16 }} onPress={() => router.push("/compete")}>
          돌아가기
        </Button>
      </Screen>
    )
  }

  const waveData = getWaveData(wavePeriod)
  const isTopThree = user.rank <= 3

  return (
    <View style={{ flex: 1 }}>
      <Gradient dir="br" colors={[palette.cyan[50], palette.blue[50], palette.purple[50]]} style={StyleSheet.absoluteFill} />
      <Screen
        bg="transparent"
        withHeader
        withNav
        fixed={
          <>
            <MobileHeader title={`${user.nickname} 파도 타기 보고서`} showBack />
            <MobileNav />
          </>
        }
      >
        <View style={{ paddingHorizontal: 20 }}>
          {/* Summary Card */}
          <SummaryCard profitRate={user.profitRate} rank={user.rank} level={user.level} />

          <WaveRidingSection period={wavePeriod} onChangePeriod={setWavePeriod} data={waveData} />

          <DailyProfitSection />

          <TradeAnalysisSection />

          {/* Wave Pattern Chart */}
          <WavePatternSection data={waveData} />

          {/* Profit Trend */}
          <ProfitTrendSection profitRate={user.profitRate} />

          {/* Investment Strategy (Top 3 only) */}
          {isTopThree ? <StrategySection /> : <View style={{ height: 24 }} />}
        </View>
      </Screen>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
})
