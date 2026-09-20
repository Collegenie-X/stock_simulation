import { useEffect, useRef, useState } from "react"
import { ScrollView, Text } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Screen } from "@/components/layout"
import { loadScenario } from "@/lib/scenario/loader"
import { initGame, makeDecision, advanceTurn, snapshotTurn, type GameState, type TurnSnapshot } from "@/lib/scenario/engine"
import { localStore } from "@/lib/storage"
import type { GameScenario } from "@/data/game-scenarios/types"
import { palette } from "@/theme"
import { ActionBar } from "../components/ActionBar"
import { FeedbackToast } from "../components/FeedbackToast"
import { FinishedScreen } from "../components/FinishedScreen"
import { GameHeader } from "../components/GameHeader"
import { NewsPanel } from "../components/NewsPanel"
import { SelectedStockPanel } from "../components/SelectedStockPanel"
import { StockTabs } from "../components/StockTabs"
import { suggestBuyQty } from "../utils/suggestBuyQty"

const STORAGE_KEY = (id: string) => `scenarioGame_${id}`

export default function ScenarioGameScreen() {
  const params = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const scenarioId = params.id

  const [scenario, setScenario] = useState<GameScenario | null>(null)
  const [state, setState] = useState<GameState | null>(null)
  const [snapshot, setSnapshot] = useState<TurnSnapshot | null>(null)
  const [selectedStockId, setSelectedStockId] = useState<string>("")
  const [feedback, setFeedback] = useState<string[]>([])
  const decisionStartTimeRef = useRef<number>(Date.now())
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    },
    [],
  )

  // 시나리오 로드
  useEffect(() => {
    try {
      const sc = loadScenario(scenarioId)
      setScenario(sc)
      setSelectedStockId(sc.stocks[0].id)

      // 저장소에서 진행 중 게임 복구 시도
      const saved = localStore.getItem(STORAGE_KEY(scenarioId))
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          // 간단 검증
          if (parsed.scenarioId === scenarioId && !parsed.isFinished) {
            setState(parsed)
            decisionStartTimeRef.current = Date.now()
            return
          }
        } catch {
          // 무시하고 새 게임
        }
      }

      // 새 게임
      const newState = initGame(sc)
      setState(newState)
      decisionStartTimeRef.current = Date.now()
    } catch (e) {
      console.error("Failed to load scenario:", e)
    }
  }, [scenarioId])

  // 스냅샷 갱신
  useEffect(() => {
    if (scenario && state) {
      setSnapshot(snapshotTurn(scenario, state))
    }
  }, [scenario, state])

  // 자동 저장
  useEffect(() => {
    if (state) {
      localStore.setItem(STORAGE_KEY(scenarioId), JSON.stringify(state))
    }
  }, [state, scenarioId])

  if (!scenario || !state || !snapshot) {
    return (
      <Screen bg="#000000" scroll={false} contentStyle={{ alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 14, color: palette.gray[500] }}>시나리오 로딩 중…</Text>
      </Screen>
    )
  }

  // 게임 종료 화면
  if (state.isFinished && state.result) {
    return (
      <FinishedScreen
        scenario={scenario}
        state={state}
        onRestart={() => {
          localStore.removeItem(STORAGE_KEY(scenarioId))
          const fresh = initGame(scenario)
          setState(fresh)
        }}
        onHome={() => router.push("/scenario")}
      />
    )
  }

  const selectedStock = scenario.stocks.find((s) => s.id === selectedStockId) ?? scenario.stocks[0]
  const selectedPrice = snapshot.prices[selectedStock.id]
  const held = state.holdings[selectedStock.id] || 0
  const avgPrice = state.averagePrices[selectedStock.id] || 0

  const showFeedback = (lines: string[], ms: number) => {
    setFeedback(lines)
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    feedbackTimerRef.current = setTimeout(() => setFeedback([]), ms)
  }

  const handleAction = (action: "buy" | "sell" | "hold", qty: number = 1) => {
    if (!scenario || !state) return
    const decisionTimeMs = Date.now() - decisionStartTimeRef.current

    const result = makeDecision(scenario, state, {
      stockId: action === "hold" ? null : selectedStock.id,
      action,
      quantity: qty,
      decisionTimeMs,
    })

    if (!result.success) {
      showFeedback([`❌ ${result.error}`], 2500)
      return
    }

    // 점수 피드백
    if (result.scoreDelta !== undefined && result.scoreReasons) {
      showFeedback([`${result.scoreDelta >= 0 ? "+" : ""}${result.scoreDelta} 감각`, ...result.scoreReasons], 3000)
    }

    // 다음 턴
    advanceTurn(scenario, state)
    setState({ ...state })
    decisionStartTimeRef.current = Date.now()
  }

  const profitRate = ((state.totalAssetKrw - state.initialCapital) / state.initialCapital) * 100

  return (
    <Screen bg="#000000" scroll={false} safeBottom={false} fixed={<FeedbackToast lines={feedback} top={insets.top + 96} />}>
      {/* 헤더 */}
      <GameHeader scenario={scenario} state={state} snapshot={snapshot} profitRate={profitRate} onBack={() => router.push("/scenario")} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {/* 종목 선택 (탭) */}
        <StockTabs scenario={scenario} state={state} snapshot={snapshot} selectedStockId={selectedStock.id} onSelect={setSelectedStockId} />

        {/* 선택 종목 차트 (간단) */}
        <SelectedStockPanel scenario={scenario} stock={selectedStock} snapshot={snapshot} held={held} avgPrice={avgPrice} />

        {/* 뉴스 패널 */}
        <NewsPanel snapshot={snapshot} />
      </ScrollView>

      {/* 액션 바 */}
      <ActionBar
        held={held}
        cash={state.cash}
        canBuy={state.cash >= selectedPrice.krw}
        onSell={() => handleAction("sell", held > 0 ? held : 0)}
        onHold={() => handleAction("hold")}
        onBuy={() => handleAction("buy", suggestBuyQty(state.cash, selectedPrice.krw))}
      />
    </Screen>
  )
}
