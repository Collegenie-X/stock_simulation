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
import { WaveAccuracyAnalysis } from "../components/result/WaveAccuracyAnalysis"

export default function WavePracticeResultScreen() {
  const params = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/compete"))

  const record = historyData.wavePractice.find((s) => s.id === params.id)

  if (!record) return <ResultNotFound onBack={goBack} />

  const pct = (record.totalScore / record.maxScore) * 100
  const avgTurn = (record.totalScore / (record.rounds * 8)).toFixed(2)

  return (
    <Screen
      bg="#000000"
      withHeader
      contentStyle={{ paddingBottom: 152 }}
      fixed={
        <>
          <ResultHeader title="파도 연습 결과" onBack={goBack} />
          <PracticeBottomActions
            onBack={goBack}
            onRetry={() => router.push("/learn/patterns")}
            retryLabel="다시 도전"
            colors={[palette.cyan[500], palette.blue[600]]}
            shadowColor={palette.cyan[500]}
          />
        </>
      }
    >
      <View style={{ paddingHorizontal: 16 }}>
        {/* Hero */}
        <PracticeHero
          variant="wave"
          patternEmoji={record.patternEmoji}
          patternName={record.patternName}
          meta={`${record.rounds}라운드 · ${record.date}`}
          isExperiment={record.isExperiment}
          stars={record.stars}
        />

        {/* 점수 카드 */}
        <PracticeScoreCard variant="wave" totalScore={record.totalScore} maxScore={record.maxScore} grade={record.grade} avgTurn={avgTurn} highlight={record.highlight} />

        {/* 파도 정확도 분석 */}
        <WaveAccuracyAnalysis wave3Accuracy={record.wave3Accuracy} correctionAccuracy={record.correctionAccuracy} pct={pct} />

        {/* 라운드별 결과 */}
        <RoundResultList variant="wave" roundResults={record.roundResults} bestRound={record.bestRound} totalScore={record.totalScore} maxScore={record.maxScore} />

        {/* 평균 턴 점수 */}
        <View style={styles.panel}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={[styles.cell, { backgroundColor: alpha("#ffffff", 0.05), borderColor: alpha("#ffffff", 0.05) }]}>
              <Text style={styles.cellLabel}>평균 턴 점수</Text>
              <Text style={[styles.cellValue, { color: "#ffffff" }]}>{record.avgTurnScore.toFixed(1)}</Text>
            </View>
            <View style={[styles.cell, { backgroundColor: alpha(palette.cyan[500], 0.1), borderColor: alpha(palette.cyan[500], 0.2) }]}>
              <Text style={styles.cellLabel}>베스트 라운드</Text>
              <Text style={[styles.cellValue, { color: palette.cyan[400] }]}>R{record.bestRound}</Text>
            </View>
          </View>
        </View>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  panel: { backgroundColor: "#0f0f0f", borderRadius: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05), padding: 16, marginBottom: 16 },
  cell: { flex: 1, borderRadius: 12, padding: 12, alignItems: "center", borderWidth: 1 },
  cellLabel: { fontSize: 12, color: palette.gray[400], marginBottom: 4 },
  cellValue: { fontSize: 20, fontWeight: "900" },
})
