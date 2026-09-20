import { ScrollView, StyleSheet, Text, View } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { ArrowLeft, Flame, Lightbulb, TrendingDown, TrendingUp, Trophy } from "lucide-react-native"
import { Screen } from "@/components/layout"
import { PressableScale, Pulse } from "@/components/ui"
import { GameActionBar, RatioModal } from "@/components/game/GamePlayUI"
import playContent from "@/data/scenario-play-content.json"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"
import { twColor } from "../../utils/tw"
import { getChartPoints } from "../utils"
import { useScenarioPlay } from "../hooks/useScenarioPlay"
import { EventBullets } from "../components/EventBullets"
import { ExitConfirmModal } from "../components/ExitConfirmModal"
import { FeedbackOverlay } from "../components/FeedbackOverlay"
import { HoldingsCard } from "../components/HoldingsCard"
import { LiveChart } from "../components/LiveChart"
import { ResultView } from "../components/ResultView"

const { ui: UI, game: GAME } = playContent

export default function ScenarioPlayScreen() {
  const params = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const g = useScenarioPlay(params.id)
  const { scenario, turns, td, init } = g

  if (!scenario || turns.length === 0 || !td || !init) {
    return (
      <Screen bg="#0d0d0d" scroll={false} contentStyle={{ alignItems: "center", justifyContent: "center" }}>
        <Pulse>
          <Text style={{ fontSize: 36, color: "#ffffff" }}>🎮</Text>
        </Pulse>
      </Screen>
    )
  }

  if (g.gameOver) {
    return (
      <ResultView
        scenario={scenario}
        total={g.total}
        rate={g.rate}
        cash={g.cash}
        holdings={g.holdings}
        price={turns[turns.length - 1].endPrice}
        avgPrice={g.avgPrice}
        trades={g.trades}
        aiResults={g.aiResults}
        initTotal={g.totalInitial}
        chartPts={getChartPoints(turns, turns.length - 1)}
        turns={turns}
        score={g.score}
        bestCombo={g.bestCombo}
        onReplay={g.reset}
        onBack={() => router.push(`/learn/scenarios/${scenario.id}`)}
      />
    )
  }

  const sent = playContent.sentiment[td.event.sentiment as keyof typeof playContent.sentiment] ?? playContent.sentiment.neutral
  const isUp = td.change >= 0
  const stock = scenario.stock
  const changeColor = isUp ? palette.red[400] : palette.blue[400]
  // 차트를 타는 캐릭터 — 등락 폭에 따라 표정이 바뀜
  const rider = td.change >= 5 ? "🤩" : td.change >= 1 ? "😆" : td.change > -1 ? "😐" : td.change > -5 ? "😟" : "😱"

  return (
    <Screen
      bg="#0d0d0d"
      scroll={false}
      safeBottom={false}
      fixed={
        <>
          {/* Feedback Overlay */}
          {g.feedback && <FeedbackOverlay feedback={g.feedback} scorePopup={g.scorePopup} combo={g.combo} />}
        </>
      }
    >
      {/* 비율 선택 모달 - 공통 컴포넌트 */}
      <RatioModal
        mode={g.showRatio}
        price={g.price}
        cash={g.cash}
        holdings={g.holdings}
        avgPrice={g.avgPrice}
        stockName={stock.name}
        hint={g.hint?.ratioGuide}
        onSelect={(ratio, label) => g.doTrade(g.showRatio!, ratio, label)}
        onClose={() => g.setShowRatio(null)}
      />

      {/* Exit Confirm Modal */}
      <ExitConfirmModal
        visible={g.showExitConfirm}
        onCancel={() => g.setShowExitConfirm(false)}
        onExit={() => {
          g.setShowExitConfirm(false)
          if (router.canGoBack()) router.back()
          else router.replace(`/learn/scenarios/${scenario.id}`)
        }}
      />

      {/* Header */}
      <View style={styles.header}>
        <PressableScale scaleTo={0.95} onPress={() => g.setShowExitConfirm(true)} style={styles.exitBtn}>
          <ArrowLeft size={16} color={palette.gray[400]} />
          <Text style={{ fontSize: 10, color: palette.gray[400], fontWeight: "700" }}>종료</Text>
        </PressableScale>
        <View style={{ alignItems: "center", flex: 1 }}>
          <Text numberOfLines={1} style={{ fontSize: 12, fontWeight: "700", color: "#ffffff" }}>
            {stock.name}
          </Text>
          <Text numberOfLines={1} style={{ fontSize: 9, color: palette.gray[600] }}>
            {stock.code} · {stock.sector}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {g.combo > 0 && (
            <View style={[styles.pill, { backgroundColor: alpha(palette.orange[500], 0.15) }]}>
              <Flame size={12} color={palette.orange[400]} />
              <Text style={[styles.pillText, { color: palette.orange[400] }]}>{g.combo}</Text>
            </View>
          )}
          <View style={[styles.pill, { backgroundColor: alpha(palette.yellow[500], 0.15) }]}>
            <Trophy size={12} color={palette.yellow[400]} />
            <Text style={[styles.pillText, { color: palette.yellow[400] }]}>{g.score}</Text>
          </View>
        </View>
      </View>

      {/* Turn Progress */}
      <View style={styles.progress}>
        {turns.map((_, i) =>
          i === g.turn ? (
            <Pulse key={i} style={[styles.progressSeg, { backgroundColor: palette.yellow[500] }]} />
          ) : (
            <View key={i} style={[styles.progressSeg, { backgroundColor: i < g.turn ? palette.green[500] : palette.gray[800] }]} />
          ),
        )}
      </View>

      {/* Holdings Card */}
      <HoldingsCard
        holdings={g.holdings}
        avgPrice={g.avgPrice}
        price={g.price}
        holdPnL={g.holdPnL}
        holdPnLRate={g.holdPnLRate}
        total={g.total}
        totalInitial={g.totalInitial}
        rate={g.rate}
        cash={g.cash}
      />

      {/* Chart */}
      <View style={{ paddingHorizontal: 12 }}>
        <LiveChart points={g.chartPts} animProg={g.animProg} isUp={isUp} height={200} rider={rider} />
        <View style={styles.priceRow}>
          <Text style={{ fontSize: 24, fontWeight: "900", color: "#ffffff" }}>
            {formatNumber(Math.round(g.price))}
            <Text style={{ fontSize: 14, color: palette.gray[500], fontWeight: "900" }}>원</Text>
          </Text>
          <View style={[styles.change, { backgroundColor: isUp ? alpha(palette.red[500], 0.15) : alpha(palette.blue[500], 0.15) }]}>
            {isUp ? <TrendingUp size={14} color={changeColor} /> : <TrendingDown size={14} color={changeColor} />}
            <Text style={{ fontSize: 14, fontWeight: "700", color: changeColor }}>
              {isUp ? "+" : ""}
              {td.change.toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Event */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.eventArea} showsVerticalScrollIndicator={false}>
        <View style={[styles.eventCard, { backgroundColor: twColor(sent.bg, "bg"), borderColor: twColor(sent.border, "border") }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Text style={{ fontSize: 16, color: "#ffffff" }}>{(UI.turnEmoji as string[])[g.turn] ?? "🔢"}</Text>
            <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999, backgroundColor: twColor(sent.bg, "bg") }}>
              <Text style={{ fontSize: 10, fontWeight: "700", color: twColor(sent.color, "text") }}>{sent.label}</Text>
            </View>
            <Text style={{ flex: 1, fontSize: 13, fontWeight: "900", color: "#ffffff" }}>{td.event.title}</Text>
          </View>
          <EventBullets description={td.event.description} />
        </View>

        {g.hint && (
          <View style={styles.hint}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 }}>
              <Lightbulb size={12} color={palette.yellow[500]} />
              <Text style={{ fontSize: 9, fontWeight: "700", color: alpha(palette.yellow[500], 0.8) }}>💡 힌트</Text>
            </View>
            <Text style={{ fontSize: 11, color: palette.gray[400], lineHeight: 18 }}>{g.hint.hint}</Text>
          </View>
        )}
      </ScrollView>

      {/* 타이머 + 액션 버튼 - 공통 컴포넌트 (시나리오: 15초) */}
      <GameActionBar
        timer={g.timer}
        timerSec={GAME.turnTimerSec}
        shakeTimer={g.shakeTimer}
        hasFeedback={!!g.feedback}
        canBuy={g.maxBuy > 0}
        canSell={g.holdings > 0}
        onBuy={() => g.setShowRatio("buy")}
        onSell={() => g.setShowRatio("sell")}
        onHold={() => g.doTrade("hold")}
        subLabels={{
          buy: g.maxBuy > 0 ? `최대 ${formatNumber(g.maxBuy)}주` : "현금 부족",
          sell: g.holdings > 0 ? `보유 ${formatNumber(g.holdings)}주` : "보유 없음",
          hold: "이번 턴 패스",
        }}
        labels={{ buy: UI.actionLabels.buy as string, sell: UI.actionLabels.sell as string, hold: UI.actionLabels.hold as string }}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  exitBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: alpha(palette.gray[800], 0.6) },
  pill: { flexDirection: "row", alignItems: "center", gap: 2, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999 },
  pillText: { fontSize: 10, fontWeight: "900" },
  progress: { paddingHorizontal: 16, paddingBottom: 4, flexDirection: "row", gap: 2 },
  progressSeg: { flex: 1, height: 6, borderRadius: 3 },
  priceRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 6, paddingHorizontal: 4 },
  change: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  eventArea: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, gap: 8 },
  eventCard: { borderRadius: 16, padding: 12, borderWidth: 1, overflow: "hidden" },
  hint: { backgroundColor: "#151515", borderRadius: 12, padding: 10, borderWidth: 1, borderColor: alpha(palette.gray[800], 0.3) },
})
