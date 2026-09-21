/**
 * 게임 설정 (웹 app/practice/setup/page.tsx 포팅)
 */
import { useEffect, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { useLocalSearchParams, useRouter, type Href } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ArrowLeft, Sparkles } from "lucide-react-native"
import { Screen } from "@/components/layout"
import { Gradient } from "@/components/ui"
import { storage } from "@/lib/storage"
import { alpha, palette } from "@/theme"
import {
  type SpeedMode,
  SPEED_MODES,
  LABELS,
  SPRINT_MAX_CAPITAL,
  DEFAULT_SEED_MONEY,
  DEFAULT_DAILY_OPP,
  DEFAULT_MODE,
} from "../config"
import { SpeedModeSection } from "../components/SpeedModeSection"
import { DailyOpportunitySection } from "../components/DailyOpportunitySection"
import { SeedMoneySection } from "../components/SeedMoneySection"
import { StartButton } from "../components/StartButton"
import { getLifeCharacter, type LifeState } from "@/features/life/config"
import { LifeSeedSection } from "@/features/life/components/LifeSeedSection"

/** 이보다 적게 남으면 한 주도 사기 어려워 캐릭터의 돈으로는 시작할 수 없다 */
const MIN_LIFE_SEED = 100000

export default function PracticeSetupScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  // 홈 카드에서 금액을 정해 들어온 경우 (예: "5억에도 평정심") — 캐릭터의 돈 대신 그 금액으로 시작
  const params = useLocalSearchParams<{ seed?: string }>()
  const presetSeed = Number(params.seed) || 0
  const [mode, setMode] = useState<SpeedMode>(DEFAULT_MODE)
  const [seedMoney, setSeedMoney] = useState(DEFAULT_SEED_MONEY)
  const [dailyOpp, setDailyOpp] = useState(DEFAULT_DAILY_OPP)
  // 캐릭터가 있으면 기본은 "캐릭터의 돈" — 결과가 집에 반영된다
  const [life, setLife] = useState<LifeState | null>(null)
  const [useLifeMoney, setUseLifeMoney] = useState(false)
  const [showCustomSeed, setShowCustomSeed] = useState(false)
  const lifeCharacter = getLifeCharacter(life?.characterId)

  useEffect(() => {
    const savedLife = storage.getLife()
    if (savedLife && getLifeCharacter(savedLife.characterId) && savedLife.assets >= MIN_LIFE_SEED) {
      setLife(savedLife)
      setUseLifeMoney(!presetSeed)
    }
    const settings = storage.getGameSettings()
    if (settings?.speedMode) setMode(settings.speedMode as SpeedMode)
    if (presetSeed) setSeedMoney(presetSeed)
    else if (settings?.initialCash) setSeedMoney(settings.initialCash)
    if (settings?.dailyOpportunities) setDailyOpp(settings.dailyOpportunities)
  }, [])

  const currentMode = SPEED_MODES[mode]
  const startCash = useLifeMoney && life ? life.assets : seedMoney
  const isSprintDisabled = startCash > SPRINT_MAX_CAPITAL

  // 큰돈은 스프린트로 굴릴 수 없다 (금액 선택 화면과 같은 규칙)
  useEffect(() => {
    if (isSprintDisabled && mode === "sprint") setMode("standard")
  }, [isSprintDisabled, mode])

  const handleModeSelect = (key: SpeedMode) => {
    setMode(key)
  }

  const handleStart = () => {
    storage.setGameSettings({
      speedMode: mode,
      timerSeconds: currentMode.timer,
      simulationMonths: currentMode.simulationMonths,
      dailyOpportunities: dailyOpp as 1 | 2,
      initialCash: startCash,
      lifeSeason: useLifeMoney && !!life,
    })
    // 새 계절은 지난 생활 사건 기록 없이 시작한다
    if (useLifeMoney && life) storage.setLife({ ...life, seasonEvents: [] })
    // 새 판은 빈 계좌에서 시작한다 (지난 판의 세션·거래 기록이 섞이지 않게)
    storage.clearGameSession(currentMode.scenarioId)
    storage.clearTradeHistory(currentMode.scenarioId)
    router.push(`/practice/stock/${currentMode.scenarioId}` as Href)
  }

  const handleBack = () => {
    if (router.canGoBack()) router.back()
    else router.replace("/home")
  }

  return (
    <Screen
      bg="#191919"
      safeBottom={false}
      contentStyle={{ paddingBottom: 144 + insets.bottom }}
      fixed={
        <StartButton
          mode={mode}
          onPress={handleStart}
          label={LABELS.startButton(currentMode.icon, currentMode.name, currentMode.time[(dailyOpp === 1 ? "1" : "2") as "1" | "2"])}
        />
      }
    >
      {/* Decorative ambient glow (웹의 blur-3xl 글로우 → 옅은 그라데이션으로 대체) */}
      <Gradient
        dir="b"
        colors={[alpha(palette.blue[500], 0.1), alpha(palette.purple[500], 0.05), alpha(palette.purple[500], 0)]}
        style={styles.glow}
        pointerEvents="none"
      />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn} accessibilityLabel="뒤로가기" hitSlop={8}>
          <ArrowLeft size={24} color="#ffffff" />
        </Pressable>
        <View style={styles.headerTitle}>
          <Gradient dir="br" colors={[palette.blue[500], palette.purple[600]]} style={styles.headerIcon}>
            <Sparkles size={16} color="#ffffff" />
          </Gradient>
          <Text style={styles.title}>{LABELS.pageTitle}</Text>
          <View style={styles.freeBadge}>
            <Text style={styles.freeBadgeText}>{LABELS.freeBadge}</Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        {life && lifeCharacter ? (
          <LifeSeedSection
            life={life}
            character={lifeCharacter}
            useLifeMoney={useLifeMoney}
            onUseLifeMoney={() => setUseLifeMoney(true)}
            showCustom={showCustomSeed}
            onToggleCustom={() => setShowCustomSeed((v) => !v)}
          >
            <SeedMoneySection
              seedMoney={useLifeMoney ? -1 : seedMoney}
              mode={mode}
              onSelect={(v) => {
                setSeedMoney(v)
                setUseLifeMoney(false)
              }}
              onModeChange={setMode}
            />
          </LifeSeedSection>
        ) : null}

        <SpeedModeSection mode={mode} onSelect={handleModeSelect} isSprintDisabled={isSprintDisabled} dailyOpp={dailyOpp} />

        <DailyOpportunitySection dailyOpp={dailyOpp} onSelect={setDailyOpp} />

        {!(life && lifeCharacter) && (
          <SeedMoneySection seedMoney={seedMoney} mode={mode} onSelect={setSeedMoney} onModeChange={setMode} />
        )}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  glow: { position: "absolute", top: 0, left: "-10%", width: "120%", height: 256 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingVertical: 16 },
  backBtn: { padding: 8, marginLeft: -8, borderRadius: 9999 },
  headerTitle: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: `0 10px 15px ${alpha(palette.purple[900], 0.3)}`,
  },
  title: { fontSize: 20, fontWeight: "900", letterSpacing: -0.4, color: "#ffffff" },
  freeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
    backgroundColor: alpha(palette.emerald[500], 0.2),
    borderWidth: 1,
    borderColor: alpha(palette.emerald[500], 0.3),
  },
  freeBadgeText: { fontSize: 10, fontWeight: "700", color: palette.emerald[400] },
  body: { paddingHorizontal: 20, gap: 24, marginTop: 8 },
})
