/**
 * 패턴/기본 전략 연습 게임 (웹 app/learn/patterns/[id]/practice/page.tsx)
 * - 상태/로직: hooks/usePatternPracticeGame
 * - 단계별 화면: components/{IntroView, CountdownView, PlayingView, RoundResultView, FinalResultView}
 */
import React from "react"
import { StyleSheet, Text } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Screen } from "@/components/layout"
import { Pulse } from "@/components/ui"
import { palette } from "@/theme"
import { usePatternPracticeGame } from "../hooks/usePatternPracticeGame"
import { CountdownView } from "../components/CountdownView"
import { FinalResultView } from "../components/FinalResultView"
import { IntroView } from "../components/IntroView"
import { PlayingView } from "../components/PlayingView"
import { RoundResultView } from "../components/RoundResultView"

export default function PatternPracticeScreen() {
  const params = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const game = usePatternPracticeGame(id)
  const { pattern, basicStrategy, isBasicStrategy, gamePhase, clearTimers } = game

  // 웹: router.push — 앱에서는 게임 화면으로 되돌아오지 않도록 replace
  const confirmExit = () => {
    clearTimers()
    game.setShowExitDialog(false)
    router.replace("/learn?tab=patterns")
  }

  if (!pattern && !basicStrategy) {
    return (
      <Screen bg="#000000" scroll={false} contentStyle={styles.loading}>
        <Pulse>
          <Text style={styles.loadingEmoji}>📊</Text>
        </Pulse>
      </Screen>
    )
  }

  // 공통 표시 정보
  const displayEmoji = basicStrategy?.emoji ?? pattern?.emoji ?? "📊"
  const displayName = basicStrategy?.name ?? pattern?.name ?? ""
  const displayNameEn = basicStrategy?.nameEn ?? pattern?.nameEn ?? ""
  const introGradient = isBasicStrategy ? [palette.emerald[500], palette.teal[600]] : [palette.indigo[500], palette.purple[600]]

  // ═══════════════ INTRO ═══════════════════════
  if (gamePhase === "intro") {
    return (
      <IntroView
        displayEmoji={displayEmoji}
        displayName={displayName}
        displayNameEn={displayNameEn}
        isBasicStrategy={isBasicStrategy}
        totalRounds={game.totalRounds}
        turnsPerRound={game.turnsPerRound}
        introGradient={introGradient}
        onStart={game.startGame}
      />
    )
  }

  // ═══════════════ COUNTDOWN ═══════════════════
  if (gamePhase === "countdown") {
    return (
      <CountdownView
        currentRound={game.currentRound}
        totalRounds={game.totalRounds}
        countdownVal={game.countdownVal}
        isBasicStrategy={isBasicStrategy}
        decisionSecs={game.decisionTimers[game.currentRound] ?? 15}
      />
    )
  }

  // ═══════════════ ROUND RESULT ═══════════════════
  if (gamePhase === "round-result") {
    return <RoundResultView game={game} introGradient={introGradient} onConfirmExit={confirmExit} />
  }

  // ═══════════════ FINAL RESULT ═══════════════════
  if (gamePhase === "final-result") {
    return (
      <FinalResultView
        totalScore={game.totalScore}
        totalRounds={game.totalRounds}
        roundResults={game.roundResults}
        isBasicStrategy={isBasicStrategy}
        introGradient={introGradient}
        onReview={() => router.push(`/learn/patterns/${basicStrategy?.id ?? pattern?.id}`)}
        onRetry={game.handleRetry}
      />
    )
  }

  // ═══════════════ PLAYING ═══════════════════════
  return <PlayingView game={game} displayEmoji={displayEmoji} displayName={displayName} onConfirmExit={confirmExit} />
}

const styles = StyleSheet.create({
  loading: { alignItems: "center", justifyContent: "center" },
  loadingEmoji: { fontSize: 60, color: "#ffffff" },
})
