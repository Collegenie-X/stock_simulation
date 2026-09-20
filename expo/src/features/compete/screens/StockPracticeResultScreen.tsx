import { StyleSheet, Text, View } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Screen } from "@/components/layout"
import historyData from "@/data/compete-history.json"
import { alpha, palette } from "@/theme"
import { PracticeBottomActions } from "../components/result/PracticeBottomActions"
import { PracticeHero } from "../components/result/PracticeHero"
import { PracticeScoreCard } from "../components/result/PracticeScoreCard"
import { ResultHeader } from "../components/result/ResultHeader"
import { ResultNotFound } from "../components/result/ResultNotFound"
import { RoundResultList } from "../components/result/RoundResultList"

export default function StockPracticeResultScreen() {
  const params = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/compete"))

  const record = historyData.stockPractice.find((s) => s.id === params.id)

  if (!record) return <ResultNotFound onBack={goBack} />

  const avgTurn = (record.totalScore / (record.rounds * 8)).toFixed(2)

  return (
    <Screen
      bg="#000000"
      withHeader
      contentStyle={{ paddingBottom: 152 }}
      fixed={
        <>
          <ResultHeader title="한종목 연습 결과" onBack={goBack} />
          <PracticeBottomActions
            onBack={goBack}
            onRetry={() => router.push("/learn/patterns")}
            retryLabel="다시 연습"
            colors={[palette.purple[500], palette.indigo[600]]}
            shadowColor={palette.purple[500]}
          />
        </>
      }
    >
      <View style={{ paddingHorizontal: 16 }}>
        {/* Hero */}
        <PracticeHero
          variant="stock"
          patternEmoji={record.patternEmoji}
          patternName={record.patternName}
          stockEmoji={record.stockEmoji}
          meta={`${record.stockName} · ${record.rounds}라운드 · ${record.date}`}
          isExperiment={record.isExperiment}
          stars={record.stars}
        />

        {/* 점수 카드 */}
        <PracticeScoreCard variant="stock" totalScore={record.totalScore} maxScore={record.maxScore} grade={record.grade} avgTurn={avgTurn} highlight={record.highlight} />

        {/* 라운드별 결과 */}
        <RoundResultList variant="stock" roundResults={record.roundResults} bestRound={record.bestRound} totalScore={record.totalScore} maxScore={record.maxScore} />

        {/* 수익률 */}
        {record.profitPct !== undefined && (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>💰 수익률 요약</Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View
                style={[
                  styles.cell,
                  record.profitPct >= 0
                    ? { backgroundColor: alpha(palette.green[500], 0.1), borderColor: alpha(palette.green[500], 0.2) }
                    : { backgroundColor: alpha(palette.red[500], 0.1), borderColor: alpha(palette.red[500], 0.2) },
                ]}
              >
                <Text style={styles.cellLabel}>평균 수익률</Text>
                <Text style={[styles.cellValue, { color: record.profitPct >= 0 ? palette.green[400] : palette.red[400] }]}>
                  {record.profitPct >= 0 ? "+" : ""}
                  {record.profitPct}%
                </Text>
              </View>
              <View style={[styles.cell, { backgroundColor: alpha("#ffffff", 0.05), borderColor: alpha("#ffffff", 0.05) }]}>
                <Text style={styles.cellLabel}>평균 턴 점수</Text>
                <Text style={[styles.cellValue, { color: "#ffffff" }]}>{record.avgTurnScore.toFixed(1)}</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  panel: { backgroundColor: "#0f0f0f", borderRadius: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05), padding: 16, marginBottom: 16 },
  panelTitle: { fontSize: 14, fontWeight: "700", color: "#ffffff", marginBottom: 12 },
  cell: { flex: 1, borderRadius: 12, padding: 12, alignItems: "center", borderWidth: 1 },
  cellLabel: { fontSize: 12, color: palette.gray[400], marginBottom: 4 },
  cellValue: { fontSize: 20, fontWeight: "900" },
})
