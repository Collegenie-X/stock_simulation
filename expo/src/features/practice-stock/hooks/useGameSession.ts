import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react"
import { AppState } from "react-native"
import { useFocusEffect } from "expo-router"
import { localStore, storage } from "@/lib/storage"
import { DECISIONS_PER_DAY } from "../config"
import type { LastTradeToast } from "../components/BottomActionBar"
import type { GameScenario } from "./useScenario"

export type GameFeedback = { text: string; type: "success" | "error" | "neutral" }

interface UseGameSessionArgs {
  scenarioId: string
  scenario: GameScenario | null
  refreshParam?: string
  setGameSettings: Dispatch<SetStateAction<any>>
}

/**
 * 게임 세션 상태 + 저장/복원 (웹 page.tsx 의 세션 관련 state/effect 를 그대로 옮김)
 * - loadSessionData: 저장된 세션 복원 (거래 페이지에서 돌아올 때 포함)
 * - 자동 저장 (초기 로드/일시 중지 제어)
 * - 자산 히스토리 기록, 피드백 자동 숨김, 기본 설정/캐릭터 초기화
 */
export function useGameSession({ scenarioId, scenario, refreshParam, setGameSettings }: UseGameSessionArgs) {
  const [currentTurn, setCurrentTurn] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [holdings, setHoldings] = useState<{ [key: string]: number }>({})
  const [averagePrices, setAveragePrices] = useState<{ [key: string]: number }>({})
  const [cash, setCash] = useState(1000000) // Will be updated from settings
  const [feedback, setFeedback] = useState<GameFeedback | null>(null)
  const [selectedStockId, setSelectedStockId] = useState<string>("")
  const [weeklyHistory, setWeeklyHistory] = useState<{ turn: number; value: number }[]>([])
  const [lastWeekValue, setLastWeekValue] = useState(0)
  const [pendingOrders, setPendingOrders] = useState<any[]>([])
  const [userLevel, setUserLevel] = useState(1)
  const [characterData, setCharacterData] = useState<any>(null)
  const [lastTrade, setLastTrade] = useState<LastTradeToast | null>(null)

  // 세션 자동 저장 제어
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [pauseAutoSave, setPauseAutoSave] = useState(false)

  // 저장소에서 데이터를 로드하는 함수 (JSON API 형식)
  const loadSessionData = useCallback(() => {
    // 로딩 시작 (자동 저장 일시 중지)
    setPauseAutoSave(true)
    setIsInitialLoad(true)

    const savedSessionWrapper = storage.getGameSession(scenarioId) as any
    const settings = storage.getGameSettings() as any
    setGameSettings(settings)

    // JSON API 응답 형식에서 data 추출
    const savedSession = savedSessionWrapper?.data || savedSessionWrapper

    if (savedSession && Object.keys(savedSession).length > 0) {
      const newHoldings = savedSession.holdings || {}
      const newAveragePrices = savedSession.averagePrices || {}
      const newCash = savedSession.cash !== undefined ? savedSession.cash : settings?.initialCash || 1000000

      // 턴이 최대값을 초과하지 않도록 체크 (1일 = 4턴)
      const settingsDuration = settings?.duration ? settings.duration * 30 * DECISIONS_PER_DAY : null
      const scenarioTurns = scenario?.totalTurns || 10
      const maxTurns = settingsDuration || scenarioTurns
      const safeTurn = Math.min(savedSession.currentTurn || 0, maxTurns - 1)
      setCurrentTurn(safeTurn)
      setHoldings(newHoldings)
      setAveragePrices(newAveragePrices)
      setCash(newCash)
      setPendingOrders(savedSession.pendingOrders || [])
      setWeeklyHistory(savedSession.weeklyHistory || [])
      setLastWeekValue(savedSession.lastWeekValue || 0)

      // isPlaying 상태 복원 (저장된 값이 있어도 강제로 true로 시작하여 자동 진행 보장)
      setIsPlaying(true)

      // selectedStockId 복원 또는 기본값 설정
      if (savedSession.selectedStockId) {
        setSelectedStockId(savedSession.selectedStockId)
      } else if (scenario && scenario.stocks && scenario.stocks.length > 0) {
        setSelectedStockId(scenario.stocks[0].id)
      }

      if (savedSession.feedback) {
        setFeedback(savedSession.feedback)
      }
    } else {
      const initialCash = settings?.initialCash || 1000000
      setCash(initialCash)
      setHoldings({})
      setAveragePrices({})
      setCurrentTurn(0)

      // 새 세션은 자동으로 시작
      setIsPlaying(true)

      // 새 세션 시작 시 첫 번째 주식 선택
      if (scenario && scenario.stocks && scenario.stocks.length > 0) {
        setSelectedStockId(scenario.stocks[0].id)
      }
    }

    // 로딩 완료 후 자동 저장 재개 및 자동 시작
    setTimeout(() => {
      setIsInitialLoad(false)
      setPauseAutoSave(false)
    }, 200)
  }, [scenarioId, scenario, setGameSettings])

  useEffect(() => {
    loadSessionData()

    // 거래 페이지에서 돌아온 경우 거래 결과 토스트 표시
    if (refreshParam) {
      const raw = localStore.getItem("lastTradeToast")
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as LastTradeToast
          setLastTrade(parsed)
          // 읽은 후 즉시 삭제 (중복 표시 방지)
          localStore.removeItem("lastTradeToast")
          // 3.5초 후 자동 초기화
          setTimeout(() => setLastTrade(null), 3500)
        } catch {
          localStore.removeItem("lastTradeToast")
        }
      }
    }
  }, [loadSessionData, refreshParam]) // refreshParam이 변경될 때마다 다시 로드

  // 화면에 돌아올 때마다 저장소 데이터 다시 로드
  // (웹: window focus / visibilitychange → 앱: 화면 포커스 / AppState active)
  const isFirstFocus = useRef(true)
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false
        return
      }
      loadSessionData()
    }, [loadSessionData]),
  )

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        loadSessionData()
      }
    })
    return () => sub.remove()
  }, [loadSessionData, scenarioId])

  useEffect(() => {
    // 초기 로드 완료 표시
    if (isInitialLoad) {
      setIsInitialLoad(false)
      return
    }

    // 자동 저장 일시 중지된 경우
    if (pauseAutoSave) {
      return
    }

    if (!scenario) return

    const session = {
      currentTurn,
      holdings,
      averagePrices,
      cash,
      pendingOrders,
      weeklyHistory,
      lastWeekValue,
      selectedStockId,
      isPlaying, // 재생 상태 저장
    }
    storage.setGameSession(scenarioId, session as any)
  }, [
    currentTurn,
    holdings,
    averagePrices,
    cash,
    pendingOrders,
    weeklyHistory,
    lastWeekValue,
    selectedStockId,
    isPlaying,
    scenario,
    scenarioId,
    isInitialLoad,
    pauseAutoSave,
  ])

  // Initialize selected stock but keep view in list mode initially
  useEffect(() => {
    if (scenario && scenario.stocks.length > 0 && !selectedStockId) {
      setSelectedStockId(scenario.stocks[0].id)
    }
  }, [scenario, selectedStockId])

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        setFeedback(null)
      }, 3000) // 3초로 연장
      return () => clearTimeout(timer)
    }
  }, [feedback])

  // 턴/자산 변동 시 자산 히스토리 기록
  useEffect(() => {
    if (!scenario) return

    const currentStockValue = scenario.stocks.reduce((acc, stock) => {
      const stockPrice = stock.turns[currentTurn]?.price || 0
      const stockHoldings = holdings[stock.id] || 0
      return acc + stockPrice * stockHoldings
    }, 0)

    const currentValue = cash + currentStockValue

    setWeeklyHistory((prev) => [...prev, { turn: currentTurn, value: currentValue }])
  }, [currentTurn, cash, holdings, scenario])

  // 게임 설정 / 캐릭터 초기화
  useEffect(() => {
    const settings = storage.getGameSettings() as any
    // 저장된 세션이 있으면 loadSessionData 가 복원한 현금/주간 기준값을 덮어쓰지 않는다
    const savedWrapper = storage.getGameSession(scenarioId) as any
    const saved = savedWrapper?.data || savedWrapper
    const hasSavedSession = !!saved && Object.keys(saved).length > 0

    if (settings) {
      // 설정 화면을 거치지 않고 진입하면 initialCash 가 없을 수 있어 기본값으로 보완 (NaN 방지)
      const initialCash = settings.initialCash || 1000000
      setGameSettings({ ...settings, initialCash })
      if (!hasSavedSession) {
        setCash(initialCash)
        setLastWeekValue(initialCash)
      } else if (!saved.lastWeekValue) {
        setLastWeekValue(initialCash)
      }
    } else {
      // 기본 설정 생성 (backend 없이도 동작)
      const defaultSettings = {
        initialCash: 1000000,
        duration: 3, // 3달
        speedMode: "standard" as const,
        dailyOpportunities: 2 as const,
        timerSeconds: 30,
        simulationMonths: 3,
      }
      setGameSettings(defaultSettings)
      setCash(defaultSettings.initialCash)
      setLastWeekValue(defaultSettings.initialCash)
      // 기본 설정 저장
      storage.setGameSettings(defaultSettings as any)
    }

    // Get user level from storage
    const character = storage.getCharacter()
    if (character) {
      setUserLevel(character.level || 1)
      setCharacterData(character)
    } else {
      // 기본 캐릭터 생성
      const defaultCharacter = {
        name: "플레이어",
        level: 1,
        exp: 0,
        hearts: 5,
        maxHearts: 5,
        streak: 0,
        bestStreak: 0,
        combo: 0,
        bestCombo: 0,
        badges: [],
        investorDNA: null,
        crisisGrade: "F",
        totalDecisions: 0,
        correctDecisions: 0,
        lastPlayedAt: new Date().toISOString(),
      }
      setCharacterData(defaultCharacter)
      storage.setCharacter(defaultCharacter as any)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    currentTurn,
    setCurrentTurn,
    isPlaying,
    setIsPlaying,
    holdings,
    setHoldings,
    averagePrices,
    setAveragePrices,
    cash,
    setCash,
    feedback,
    setFeedback,
    selectedStockId,
    setSelectedStockId,
    weeklyHistory,
    setWeeklyHistory,
    lastWeekValue,
    setLastWeekValue,
    pendingOrders,
    setPendingOrders,
    userLevel,
    characterData,
    lastTrade,
    setPauseAutoSave,
    loadSessionData,
  }
}

export type GameSessionState = ReturnType<typeof useGameSession>
