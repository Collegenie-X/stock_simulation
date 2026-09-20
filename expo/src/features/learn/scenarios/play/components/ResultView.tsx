import { useMemo } from "react"
import { StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Waves } from "lucide-react-native"
import { Screen } from "@/components/layout"
import { Gradient, PressableScale } from "@/components/ui"
import type { AIStrategy, LegendaryScenario } from "@/data/legendary-scenarios"
import playContent from "@/data/scenario-play-content.json"
import personalityData from "@/data/scenario-personality-result.json"
import { alpha, palette } from "@/theme"
import { twGradient } from "../../utils/tw"
import { calcTheoreticalMax, getGrade, type TradeRecord, type TurnData } from "../utils"
import { LiveChart } from "./LiveChart"
import { ResultAIBattle } from "./ResultAIBattle"
import { ResultHoldings } from "./ResultHoldings"
import { ResultSummaryHeader } from "./ResultSummaryHeader"
import { ResultWaveAchievement } from "./ResultWaveAchievement"
import { TradeHistoryCard, type TradeAccountingItem } from "./TradeHistoryCard"

const { ui: UI, grades: GRADES } = playContent

interface ResultViewProps {
  scenario: LegendaryScenario
  total: number
  rate: number
  cash: number
  holdings: number
  price: number
  avgPrice: number
  trades: TradeRecord[]
  aiResults: (AIStrategy & { returnNum: number })[]
  initTotal: number
  chartPts: number[]
  turns: TurnData[]
  score: number
  bestCombo: number
  onReplay: () => void
  onBack: () => void
}

export function ResultView({ scenario, total, rate, cash, holdings, price, avgPrice, trades, aiResults, initTotal, chartPts, turns, score, bestCombo, onReplay, onBack }: ResultViewProps) {
  const insets = useSafeAreaInsets()
  const grade = getGrade(rate)
  const gi = GRADES[grade as keyof typeof GRADES] ?? GRADES.D
  const beaten = aiResults.filter((a) => rate > a.returnNum).length
  const stock = scenario.stock
  const finalHoldingValue = holdings * price
  const holdingPnL = holdings > 0 && avgPrice > 0 ? (price - avgPrice) * holdings : 0
  const holdingPnLRate = avgPrice > 0 && holdings > 0 ? ((price - avgPrice) / avgPrice) * 100 : 0

  const profitMsg = personalityData.profitMessages.find((m) => rate >= m.minRate) ?? personalityData.profitMessages[personalityData.profitMessages.length - 1]

  // AI 최고/평균 수익률 계산
  const bestAIReturn = aiResults.length > 0 ? Math.max(...aiResults.map((a) => a.returnNum)) : 0
  const avgAIReturn = aiResults.length > 0 ? aiResults.reduce((s, a) => s + a.returnNum, 0) / aiResults.length : 0

  // 수익 보너스 점수 (AI 대비 성과 반영)
  const profitBonus = useMemo(() => {
    if (rate > bestAIReturn + 3) return Math.round(400 + (rate - bestAIReturn) * 20)
    if (rate > bestAIReturn) return Math.round(250 + (rate - bestAIReturn) * 15)
    if (rate > avgAIReturn) return Math.round(100 + (rate - avgAIReturn) * 10)
    if (rate > 0) return Math.round(rate * 5)
    return Math.round(Math.max(-150, rate * 10))
  }, [rate, bestAIReturn, avgAIReturn])
  const totalScore = Math.max(0, score + profitBonus)

  // 이론적 최대 수익 계산
  const theoreticalMax = useMemo(() => calcTheoreticalMax(turns, initTotal), [turns, initTotal])

  // 턴별 실현 손익 계산 (매수 평균가 추적)
  const tradeAccounting = useMemo(() => {
    let runAvg = 0
    let runQty = 0
    return trades.map((t) => {
      let pnl = 0
      let pnlRate = 0
      const amount = t.price * t.quantity
      if (t.action === "buy") {
        const newQty = runQty + t.quantity
        runAvg = runQty > 0 ? (runAvg * runQty + t.price * t.quantity) / newQty : t.price
        runQty = newQty
      } else if (t.action === "sell" && t.quantity > 0) {
        pnl = (t.price - runAvg) * t.quantity
        pnlRate = runAvg > 0 ? ((t.price - runAvg) / runAvg) * 100 : 0
        runQty = Math.max(0, runQty - t.quantity)
        if (runQty === 0) runAvg = 0
      }
      return { ...t, amount, pnl, pnlRate }
    })
  }, [trades])

  return (
    <Screen
      bg="#0d0d0d"
      safeTop={false}
      contentStyle={{ paddingBottom: insets.bottom + 112 }}
      fixed={
        <Gradient dir="t" colors={["#0d0d0d", "#0d0d0d", alpha("#0d0d0d", 0)]} style={[styles.bottom, { paddingBottom: insets.bottom + 16 }]}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <PressableScale scaleTo={0.95} onPress={onBack} style={styles.backBtn}>
              <Text style={styles.btnText}>{UI.resultLabels.backToDetail}</Text>
            </PressableScale>
            <PressableScale scaleTo={0.95} onPress={onReplay} style={{ flex: 2 }}>
              <Gradient dir="r" colors={twGradient(scenario.gradientFrom, scenario.gradientTo)} style={styles.replayBtn}>
                <Text style={styles.btnText}>{UI.resultLabels.replay}</Text>
              </Gradient>
            </PressableScale>
          </View>
        </Gradient>
      }
    >
      <View style={{ paddingTop: insets.top, backgroundColor: "#1a1a1a" }} />
      <ResultSummaryHeader
        subtitle={`${stock.name} (${stock.code}) · ${scenario.title}`}
        profitMsg={profitMsg}
        initTotal={initTotal}
        total={total}
        rate={rate}
        gradeLabel={gi.label}
        gradeTitle={gi.title}
        totalScore={totalScore}
        score={score}
        profitBonus={profitBonus}
        bestCombo={bestCombo}
        beaten={beaten}
        aiCount={aiResults.length}
      />

      <ResultHoldings holdings={holdings} price={price} cash={cash} finalHoldingValue={finalHoldingValue} holdingPnL={holdingPnL} holdingPnLRate={holdingPnLRate} />

      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <LiveChart points={chartPts} animProg={1} isUp={rate >= 0} height={200} trades={trades} />
      </View>

      {/* 턴 히스토리 - 게임 형식 */}
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        <View style={styles.sectionHead}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Gradient dir="br" colors={[palette.cyan[500], palette.blue[600]]} style={styles.icon}>
              <Waves size={16} color="#ffffff" />
            </Gradient>
            <Text style={styles.sectionTitle}>{trades.length}턴 파도 분석</Text>
          </View>
          <View style={styles.tapHint}>
            <Text style={{ fontSize: 9, color: palette.gray[500] }}>탭하여 AI 갭 비교</Text>
          </View>
        </View>

        <View style={{ gap: 8 }}>
          {tradeAccounting.map((t, i) => {
            const nextTurnChange = turns[i + 1]?.change
            return (
              <TradeHistoryCard
                key={i}
                mode="scenario"
                trade={t as TradeAccountingItem}
                index={i}
                turnEmoji={(UI.turnEmoji as string[])[i] ?? "🔢"}
                nextTurnChange={nextTurnChange}
                aiResults={aiResults}
                turns={turns}
                initTotal={initTotal}
                userRate={rate}
                currentPrice={turns[i]?.endPrice}
              />
            )
          })}
        </View>
      </View>

      <ResultAIBattle aiResults={aiResults} rate={rate} beaten={beaten} bestAIReturn={bestAIReturn} />

      <ResultWaveAchievement rate={rate} total={total} initTotal={initTotal} theoreticalMax={theoreticalMax} />

      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        <View style={styles.lesson}>
          <Text style={{ fontSize: 10, fontWeight: "700", color: palette.yellow[400], marginBottom: 2 }}>💡 핵심 교훈</Text>
          <Text style={{ fontSize: 12, color: palette.gray[300], lineHeight: 20 }}>{scenario.keyLesson}</Text>
        </View>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  bottom: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 24, zIndex: 20 },
  backBtn: { flex: 1, height: 48, backgroundColor: "#252525", borderWidth: 1, borderColor: alpha("#ffffff", 0.1), borderRadius: 12, alignItems: "center", justifyContent: "center" },
  replayBtn: { height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  btnText: { fontWeight: "700", fontSize: 14, color: "#ffffff" },
  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  icon: { width: 32, height: 32, borderRadius: 12, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  tapHint: { backgroundColor: alpha("#ffffff", 0.05), borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 4 },
  lesson: { backgroundColor: alpha(palette.yellow[500], 0.1), borderWidth: 1, borderColor: alpha(palette.yellow[500], 0.2), borderRadius: 12, padding: 12 },
})
