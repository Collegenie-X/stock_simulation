import { useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { useLocalSearchParams, useRouter, type Href } from "expo-router"
import reportPreviewDummy from "@/data/report-preview-dummy.json"
import { Pop, Pulse } from "@/components/ui"
import { storage } from "@/lib/storage"
import { alpha, layout, palette } from "@/theme"

// ── 분리된 컴포넌트 import ─────────────────────────────────────
import {
  GameHeader,
  StockListSection,
  ExitConfirmDialog,
  CardFeedbackOverlay,
  DaySummaryOverlay,
  WeeklyReportModal,
  LoadingScreen,
  ProfitAnalysisModal,
  DetailView,
  FloatingExitButton,
  BottomActionBar,
  AIGapFeedback,
  MiniGameReport,
  FinalGameReport,
} from "../components"
import { AI_REPORT_INTERVAL, DAYS_PER_WEEK, DEBUG_BUTTONS, DECISIONS_PER_DAY } from "../config"
import { useGameState } from "../hooks/useGameState"

/**
 * 주식 게임 메인 화면 (웹: app/practice/stock/[id]/page.tsx)
 * - 게임 로직은 hooks/useGameState (+ useGameSession / useDayProgression / useTrading / useAIBattle) 로 분리
 * - "다시 하기"(웹: window.location.reload) 는 key 변경으로 화면 전체를 다시 마운트해서 처리
 */
export default function StockGameScreen() {
  const [reloadKey, setReloadKey] = useState(0)
  return <StockGame key={reloadKey} onReload={() => setReloadKey((k) => k + 1)} />
}

function StockGame({ onReload }: { onReload: () => void }) {
  const params = useLocalSearchParams<{ id: string; refresh?: string }>()
  const router = useRouter()
  const scenarioId = params.id as string
  const refreshParam = typeof params.refresh === "string" ? params.refresh : undefined

  const game = useGameState(scenarioId, refreshParam)
  const { scenario, session, progression, trading, ai } = game
  const { currentTurn, holdings, averagePrices, cash, selectedStockId, weeklyHistory, pendingOrders, setPendingOrders } = session
  const { currentDay, totalDecisions, isWaitingForDecision, showQuickTrade } = progression
  const { aiCompetitor, bestAICompetitor } = ai
  const {
    currentStock,
    turnData,
    totalDays,
    currentDayName,
    currentDayPhase,
    currentWeekNumber,
    totalValue,
    initialValue,
    profitRate,
    allStocksData,
    livePrices,
    liveTotalValue,
    liveProfitRate,
  } = game

  // 로딩 화면 - 필수 데이터만 체크
  if (!scenario || !selectedStockId || !currentStock) {
    const loadingReason = !scenario
      ? "시나리오 로드 중"
      : !selectedStockId
        ? "주식 선택 중"
        : !currentStock
          ? "주식 데이터 로드 중"
          : "알 수 없음"
    return <LoadingScreen reason={loadingReason} />
  }

  if (progression.showResult || progression.showFinalReport) {
    const tradeHist = storage.getTradeHistory(scenarioId) || []
    const mappedTrades = tradeHist.map((t: any) => ({
      stockName: t.stockName || t.stockId || "",
      action: t.action as "buy" | "sell",
      price: t.price || 0,
      quantity: t.quantity || 0,
      totalAmount: t.totalAmount || 0,
      profit: t.profit,
      profitRate: t.profitRate,
      date: t.date,
      day: t.day,
    }))

    // 선택 타임라인 + 결과(가격 변화) 계산
    const timelineWithOutcome = ai.decisionTimeline.map((entry) => {
      const stock = scenario?.stocks.find((s) => s.id === entry.stockId)
      const lastTurn = stock ? stock.turns.length - 1 : 0
      const priceAfter = stock?.turns[Math.min(lastTurn, currentTurn)]?.price ?? entry.price
      const changePct = entry.price > 0 ? Number((((priceAfter - entry.price) / entry.price) * 100).toFixed(1)) : 0
      return {
        day: entry.day,
        turn: entry.turn,
        stockId: entry.stockId,
        stockName: entry.stockName,
        price: entry.price,
        userAction: entry.userAction,
        userQty: entry.userQty,
        similarAction: entry.similarAction,
        similarQty: entry.similarQty,
        bestAction: entry.bestAction,
        bestQty: entry.bestQty,
        priceAfter,
        changePct,
      }
    })

    return (
      <View style={styles.root}>
        <FinalGameReport
          isVisible
          totalDays={currentDay}
          userProfitRate={profitRate}
          userTotalValue={totalValue}
          initialValue={initialValue}
          cash={cash}
          holdings={holdings}
          tradeHistory={mappedTrades}
          weeklyHistory={weeklyHistory}
          decisionTimeline={timelineWithOutcome as any}
          aiSimilarName={aiCompetitor.name}
          aiSimilarEmoji={aiCompetitor.emoji}
          aiSimilarProfitRate={ai.aiProfitRate}
          aiSimilarTotalValue={ai.aiTotalValue}
          aiBestName={bestAICompetitor.name}
          aiBestEmoji={bestAICompetitor.emoji}
          aiBestProfitRate={ai.bestAIProfitRate}
          aiBestTotalValue={ai.bestAITotalValue}
          onGoHome={() => router.replace("/home" as Href)}
          onPlayAgain={() => {
            storage.clearGameSession(scenarioId)
            onReload()
          }}
        />
      </View>
    )
  }

  // --- 자유 거래 VIEW (메인 게임 화면) ---
  if (game.viewMode === "list") {
    // 남은 결정 횟수 계산
    const remainingDecisions = Math.max(0, totalDays * DECISIONS_PER_DAY - totalDecisions)
    const holdingsCount = Object.keys(holdings).filter((k) => holdings[k] > 0).length
    const dummyMini = reportPreviewDummy.miniReport
    const dummyFinal = reportPreviewDummy.finalReport

    return (
      <View style={styles.root}>
        <View style={styles.container}>
          {/* 게임 헤더 (타이머 + 총 자산 + 종료 버튼) */}
          <GameHeader
            currentDay={currentDay}
            totalDays={totalDays}
            currentDayName={currentDayName}
            currentDayPhase={currentDayPhase}
            currentWeekNumber={currentWeekNumber}
            totalValue={liveTotalValue}
            profitRate={liveProfitRate}
            aiName={aiCompetitor.name}
            aiEmoji={aiCompetitor.emoji}
            aiProfitRate={ai.aiProfitRate}
            aiTopStocks={
              scenario
                ? Object.keys(aiCompetitor.holdings)
                    .filter((k) => aiCompetitor.holdings[k] > 0)
                    .map((sid) => scenario.stocks.find((s) => s.id === sid)?.name || sid)
                : []
            }
            nextReportDay={Math.ceil(currentDay / AI_REPORT_INTERVAL) * AI_REPORT_INTERVAL}
            bestAIName={bestAICompetitor.name}
            bestAIEmoji={bestAICompetitor.emoji}
            bestAIProfitRate={ai.bestAIProfitRate}
            decisionTimer={progression.decisionTimer}
            totalDecisions={totalDecisions}
            remainingDecisions={remainingDecisions}
            isTimerPaused={progression.isTimerPaused}
            isWaitingForDecision={isWaitingForDecision && !showQuickTrade}
            onTogglePause={() => progression.setIsTimerPaused((prev) => !prev)}
            onExitClick={() => game.setShowExitConfirm(true)}
            onProfitClick={() => game.setShowProfitAnalysis(true)}
          />

          {/* 자유 거래 타임 - 주식 리스트 */}
          {isWaitingForDecision && !showQuickTrade && (
            <StockListSection
              allStocksData={allStocksData as any}
              currentTurn={currentTurn}
              favorites={game.favorites}
              stockViewTab={game.stockViewTab}
              livePrices={livePrices}
              tickUps={game.tickUps}
              aiHoldings={aiCompetitor.holdings}
              aiName={aiCompetitor.name}
              aiEmoji={aiCompetitor.emoji}
              onChangeViewTab={game.setStockViewTab}
              onSelectStock={(id: string) => {
                session.setSelectedStockId(id)
                game.setViewMode("detail")
              }}
              onToggleFavorite={game.toggleFavorite}
              onDecision={trading.handleDecision}
            />
          )}

          {/* 대기 중 */}
          {!isWaitingForDecision && !progression.showCardFeedback && !progression.showDaySummary && !progression.showMiniReport && (
            <View style={styles.waiting}>
              <Pulse style={styles.waitingInner}>
                <Text style={styles.waitingEmoji}>🎯</Text>
                <Text style={styles.waitingText}>다음 시간대 준비 중...</Text>
              </Pulse>
            </View>
          )}

          {/* AI 갭 피드백 배너 (숨김 토글 가능) */}
          <AIGapFeedback
            isVisible={ai.showAIGapFeedback && !progression.showDaySummary && !progression.showWeeklyReport}
            userProfitRate={liveProfitRate}
            bestAIProfitRate={ai.bestAIProfitRate}
            similarAIProfitRate={ai.aiProfitRate}
            bestAIName={bestAICompetitor.name}
            similarAIName={aiCompetitor.name}
            waveAccuracy={ai.lastWaveAnalysis?.accuracy ?? 0}
            onHide={() => ai.setShowAIGapFeedback(false)}
          />

          {/* 하단 고정 바 (타이머 + 거래 확인 토스트 + 다음 시간으로) */}
          <BottomActionBar
            decisionTimer={progression.decisionTimer}
            totalDecisions={totalDecisions}
            remainingDecisions={remainingDecisions}
            isTimerPaused={progression.isTimerPaused}
            currentPhaseInDay={progression.currentPhaseInDay}
            currentDayPhase={currentDayPhase}
            currentDay={currentDay}
            isWaitingForDecision={isWaitingForDecision && !showQuickTrade}
            lastTrade={session.lastTrade}
            showDebugButtons={DEBUG_BUTTONS}
            onTogglePause={() => progression.setIsTimerPaused((prev) => !prev)}
            onSkip={() => trading.handleDecision("skip")}
            onPreviewMiniReport={() => game.setShowPreviewMiniReport(true)}
            onPreviewFinalReport={() => game.setShowPreviewFinalReport(true)}
          />

          {/* 플로팅 종료 버튼 (항상 표시) */}
          <FloatingExitButton onClick={() => game.setShowExitConfirm(true)} />

          {/* 결정 피드백 오버레이 */}
          <CardFeedbackOverlay isVisible={progression.showCardFeedback} data={progression.cardFeedbackData} />

          {/* 타임아웃 다이얼로그 (1초 자동 닫힘) */}
          {progression.showTimeoutDialog && (
            <View pointerEvents="none" style={styles.timeoutOverlay}>
              <Pop style={styles.timeoutCard}>
                <Text style={styles.timeoutEmoji}>⏰</Text>
                <Text style={styles.timeoutText}>시간 초과</Text>
              </Pop>
            </View>
          )}

          {/* 하루 요약 오버레이 */}
          <DaySummaryOverlay
            isVisible={progression.showDaySummary}
            currentDay={currentDay}
            currentDayName={currentDayName}
            totalValue={totalValue}
            initialValue={initialValue}
            profitRate={profitRate}
            totalDecisions={totalDecisions}
            holdingsCount={holdingsCount}
            aiName={aiCompetitor.name}
            aiEmoji={aiCompetitor.emoji}
            aiStyle={aiCompetitor.style}
            aiDescription={aiCompetitor.description}
            aiMotto={aiCompetitor.motto}
            aiTotalValue={ai.aiTotalValue}
            aiProfitRate={ai.aiProfitRate}
            aiTodayActions={aiCompetitor.todayActions}
            aiHoldingsCount={Object.keys(aiCompetitor.holdings).filter((k) => aiCompetitor.holdings[k] > 0).length}
            aiTotalTrades={aiCompetitor.totalTrades}
            bestAIName={bestAICompetitor.name}
            bestAIEmoji={bestAICompetitor.emoji}
            bestAITotalValue={ai.bestAITotalValue}
            bestAIProfitRate={ai.bestAIProfitRate}
            gapHistory={ai.gapHistory}
            waveAnalysis={ai.lastWaveAnalysis}
            stockCompareResults={progression.stockCompareResults}
            onContinue={progression.handleDaySummaryContinue}
          />

          {/* 미니 게임 리포트 (3일 간격) */}
          <MiniGameReport
            isVisible={progression.showMiniReport}
            reportDay={currentDay}
            periodLabel={`${currentDay}일차`}
            userProfitRate={profitRate}
            userTotalValue={totalValue}
            initialValue={initialValue}
            cash={cash}
            tradeCount={totalDecisions}
            holdingsCount={holdingsCount}
            tradeHistory={storage.getTradeHistory(scenarioId) as any}
            holdingItems={
              scenario
                ? Object.keys(holdings)
                    .filter((k) => holdings[k] > 0)
                    .map((stockId) => {
                      const stock = scenario.stocks.find((s) => s.id === stockId)
                      const qty = holdings[stockId]
                      const avg = averagePrices[stockId] || 0
                      const cur = livePrices[stockId] ?? (stock?.turns?.[currentTurn]?.price || avg)
                      const profitAmt = Math.round((cur - avg) * qty)
                      const profitRt = avg > 0 ? ((cur - avg) / avg) * 100 : 0
                      return {
                        stockId,
                        stockName: stock?.name || stockId,
                        quantity: qty,
                        avgPrice: avg,
                        currentPrice: cur,
                        profitAmount: profitAmt,
                        profitRate: Math.round(profitRt * 10) / 10,
                      }
                    })
                : []
            }
            assetHistory={weeklyHistory}
            aiSimilarProfitRate={ai.aiProfitRate}
            aiSimilarName={aiCompetitor.name}
            aiSimilarEmoji={aiCompetitor.emoji}
            aiBestProfitRate={ai.bestAIProfitRate}
            aiBestName={bestAICompetitor.name}
            aiBestEmoji={bestAICompetitor.emoji}
            onContinue={progression.handleMiniReportContinue}
          />

          {/* ── 더미 데이터 미리보기: 3일차 리포트 ── */}
          {game.showPreviewMiniReport && (
            <MiniGameReport
              isVisible
              reportDay={dummyMini.reportDay}
              periodLabel={dummyMini.periodLabel}
              userProfitRate={dummyMini.userProfitRate}
              userTotalValue={dummyMini.userTotalValue}
              initialValue={dummyMini.initialValue}
              cash={dummyMini.cash}
              tradeCount={dummyMini.tradeCount}
              holdingsCount={dummyMini.holdingsCount}
              tradeHistory={dummyMini.tradeHistory as any}
              holdingItems={dummyMini.holdingItems}
              assetHistory={dummyMini.assetHistory}
              aiSimilarProfitRate={dummyMini.aiSimilarProfitRate}
              aiSimilarName={dummyMini.aiSimilarName}
              aiSimilarEmoji={dummyMini.aiSimilarEmoji}
              aiBestProfitRate={dummyMini.aiBestProfitRate}
              aiBestName={dummyMini.aiBestName}
              aiBestEmoji={dummyMini.aiBestEmoji}
              onContinue={() => game.setShowPreviewMiniReport(false)}
            />
          )}

          {/* ── 더미 데이터 미리보기: 최종 보고서 ── */}
          {game.showPreviewFinalReport && (
            <FinalGameReport
              isVisible
              totalDays={dummyFinal.totalDays}
              userProfitRate={dummyFinal.userProfitRate}
              userTotalValue={dummyFinal.userTotalValue}
              initialValue={dummyFinal.initialValue}
              cash={dummyFinal.cash}
              holdings={dummyFinal.holdings}
              tradeHistory={dummyFinal.tradeHistory as any}
              weeklyHistory={dummyFinal.weeklyHistory}
              assetHistory={dummyFinal.assetHistory as any}
              stockDetails={dummyFinal.stockDetails as any}
              aiSimilarName={dummyFinal.aiSimilarName}
              aiSimilarEmoji={dummyFinal.aiSimilarEmoji}
              aiSimilarProfitRate={dummyFinal.aiSimilarProfitRate}
              aiSimilarTotalValue={dummyFinal.aiSimilarTotalValue}
              aiBestName={dummyFinal.aiBestName}
              aiBestEmoji={dummyFinal.aiBestEmoji}
              aiBestProfitRate={dummyFinal.aiBestProfitRate}
              aiBestTotalValue={dummyFinal.aiBestTotalValue}
              onGoHome={() => game.setShowPreviewFinalReport(false)}
              onPlayAgain={() => game.setShowPreviewFinalReport(false)}
            />
          )}

          {/* 주간 리포트 모달 */}
          <WeeklyReportModal
            isOpen={progression.showWeeklyReport}
            onClose={game.handleCloseReport}
            weekNumber={currentWeekNumber}
            weeklyReturn={game.weeklyReturn}
            totalReturn={profitRate}
            chartData={weeklyHistory.slice(-(DAYS_PER_WEEK * DECISIONS_PER_DAY))}
          />

          {/* 수익 분석 모달 */}
          {game.showProfitAnalysis && (
            <ProfitAnalysisModal
              scenarioId={scenarioId}
              currentDay={currentDay}
              currentPrices={livePrices}
              holdings={holdings}
              averagePrices={averagePrices}
              aiName={aiCompetitor.name}
              aiEmoji={aiCompetitor.emoji}
              aiStyle={aiCompetitor.style}
              aiMotto={aiCompetitor.motto}
              aiTotalValue={ai.aiTotalValue}
              aiProfitRate={ai.aiProfitRate}
              aiHoldings={aiCompetitor.holdings}
              aiAvgPrices={aiCompetitor.avgPrices}
              aiTodayActions={aiCompetitor.todayActions}
              aiTotalTrades={aiCompetitor.totalTrades}
              userTotalValue={liveTotalValue}
              userProfitRate={liveProfitRate}
              initialValue={initialValue}
              allStockNames={scenario ? Object.fromEntries(scenario.stocks.map((s) => [s.id, s.name])) : {}}
              onClose={() => game.setShowProfitAnalysis(false)}
            />
          )}

          {/* 종료 확인 다이얼로그 */}
          <ExitConfirmDialog
            isOpen={game.showExitConfirm}
            onCancel={() => game.setShowExitConfirm(false)}
            onConfirm={() => router.push("/home" as Href)}
          />
        </View>
      </View>
    )
  }

  // --- DETAIL VIEW ---
  if (game.viewMode === "detail") {
    const myAvg = averagePrices[selectedStockId] || 0
    const myReturn = myAvg > 0 ? (((game.currentPrice - myAvg) / myAvg) * 100).toFixed(1) : "0.0"
    const isProfit = Number.parseFloat(myReturn) >= 0

    return (
      <View style={styles.root}>
        <View style={styles.container}>
          <DetailView
            stockName={currentStock.name}
            currentPrice={game.currentPrice}
            prevPrice={game.prevPrice}
            change={game.change}
            isUp={game.isUp}
            currentHoldings={game.currentHoldings}
            myAvg={myAvg}
            myReturn={myReturn}
            isProfit={isProfit}
            chartData={game.chartData}
            chartPeriod={game.chartPeriod}
            onChartPeriodChange={game.setChartPeriod}
            cash={cash}
            selectedStockId={selectedStockId}
            favorites={game.favorites}
            onToggleFavorite={game.toggleFavorite}
            showDatePopup={game.showDatePopup}
            turnDate={turnData?.date || ""}
            currentDayNumber={game.currentDayNumber}
            currentWeekNumber={currentWeekNumber}
            currentDayName={currentDayName}
            currentDayPhase={currentDayPhase}
            isPlaying={session.isPlaying}
            showWeeklyReport={progression.showWeeklyReport}
            weeklyReturn={game.weeklyReturn}
            profitRate={profitRate}
            weeklyHistory={weeklyHistory}
            onCloseReport={game.handleCloseReport}
            feedback={session.feedback}
            pendingOrders={pendingOrders}
            stockNews={(turnData as any)?.news || ""}
            stockCategory={(currentStock as any)?.category || ""}
            prevDayChange={game.prevDayData?.change}
            prevDayIsUp={game.prevDayData?.isUp}
            prevDayNews={game.prevDayData?.news}
            onCancelOrder={(order: any) => {
              const idx = pendingOrders.findIndex((o) => o === order)
              if (idx > -1) {
                const next = [...pendingOrders]
                next.splice(idx, 1)
                setPendingOrders(next)
              }
            }}
            onBack={() => game.setViewMode("list")}
            onBuy={() => trading.handleAction("buy")}
            onSell={() => trading.handleAction("sell")}
            onShowHint={() => {
              game.setHintLevel(2)
              game.setShowHintModal(true)
            }}
            onExitClick={() => game.setShowExitConfirm(true)}
          />

          {/* 종료 확인 다이얼로그 */}
          <ExitConfirmDialog
            isOpen={game.showExitConfirm}
            onCancel={() => game.setShowExitConfirm(false)}
            onConfirm={() => router.push("/home" as Href)}
          />
        </View>
      </View>
    )
  }

  // 매수/매도는 별도 거래 페이지(/practice/stock/[id]/trade)에서 처리
  return null // Should not reach here
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#191919" },
  // 태블릿/웹에서는 웹 버전과 동일하게 가운데 448px 폭으로 고정
  container: { flex: 1, width: "100%", maxWidth: layout.maxWidth, alignSelf: "center" },
  waiting: { flex: 1, alignItems: "center", justifyContent: "center" },
  waitingInner: { alignItems: "center" },
  waitingEmoji: { fontSize: 36, marginBottom: 12, color: "#ffffff" },
  waitingText: { fontSize: 16, fontWeight: "500", color: palette.gray[400] },
  timeoutOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 50, alignItems: "center", justifyContent: "center" },
  timeoutCard: {
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 16,
    backgroundColor: alpha(palette.gray[900], 0.95),
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.6),
    boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
  },
  timeoutEmoji: { fontSize: 36, color: "#ffffff" },
  timeoutText: { fontSize: 14, fontWeight: "700", color: palette.gray[300] },
})
