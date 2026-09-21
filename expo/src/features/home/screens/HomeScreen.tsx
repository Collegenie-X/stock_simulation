import { useEffect, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { Settings } from "lucide-react-native"
import { MobileNav, Screen } from "@/components/layout"
import { Pulse } from "@/components/ui"
import { storage } from "@/lib/storage"
import { alpha, palette } from "@/theme"
import HeroChart from "../components/HeroChart"
import GameModeCards from "../components/GameModeCards"
import PlayerStats from "../components/PlayerStats"
import WhySimulation from "../components/WhySimulation"
import MyPersonality from "../components/MyPersonality"
import LifeCard from "@/features/life/components/LifeCard"

export default function HomeScreen() {
  const router = useRouter()
  const [character, setCharacter] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const onboardingComplete = storage.getOnboardingStatus()
    if (!onboardingComplete) {
      router.replace("/onboarding")
      return
    }

    if (!storage.getGuideComplete()) {
      storage.setGuideComplete()
    }

    let userCharacter = storage.getCharacter()

    if (!userCharacter) {
      const profile = storage.getUserProfile()
      const characterType =
        profile?.investmentStyle === "aggressive"
          ? "aggressive"
          : profile?.investmentStyle === "conservative"
            ? "conservative"
            : "balanced"

      userCharacter = {
        type: characterType,
        level: 1,
        totalExp: 0,
        exp: 0,
        hearts: 5,
        maxHearts: 5,
        streak: 0,
        bestStreak: 0,
        combo: 0,
        bestCombo: 0,
        badges: [],
        achievements: [],
        investorDNA: null,
        crisisGrade: null,
        totalDecisions: 0,
        correctDecisions: 0,
        createdAt: new Date().toISOString(),
        lastPlayedAt: null,
      }
      storage.setCharacter(userCharacter)
    }

    setCharacter(userCharacter)
    setIsLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isLoading || !character) {
    return (
      <View style={styles.loading}>
        <Pulse>
          <Text style={styles.loadingEmoji}>📈</Text>
        </Pulse>
      </View>
    )
  }

  const hearts = character.hearts ?? 5
  const maxHearts = character.maxHearts ?? 5
  const streak = character.streak ?? 0
  const winRate =
    character.totalDecisions > 0
      ? Math.round((character.correctDecisions / character.totalDecisions) * 100)
      : 0
  const gamesPlayed = character.totalDecisions ?? 0
  const bestReturn = character.bestCombo ?? 0

  const handleQuickPlay = () => {
    storage.setGameSettings({
      speedMode: "sprint",
      timerSeconds: 10,
      simulationMonths: 1,
      dailyOpportunities: 2,
    } as any)
    router.push("/practice/setup")
  }

  return (
    <Screen bg="#141420" withNav fixed={<MobileNav />}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brand}>
          <Text style={styles.brandEmoji}>📈</Text>
          <Text style={styles.brandText}>파도를 타라</Text>
        </View>
        <Pressable
          onPress={() => router.push("/profile")}
          accessibilityLabel="설정"
          style={({ pressed }) => [styles.settingsBtn, pressed && { backgroundColor: alpha("#ffffff", 0.1) }]}
        >
          <Settings size={18} color={palette.gray[400]} />
        </Pressable>
      </View>

      <View style={styles.sections}>
        {/* Player Stats Bar */}
        <PlayerStats level={character.level} hearts={hearts} maxHearts={maxHearts} streak={streak} winRate={winRate} />

        {/* 나의 삶 — 캐릭터와 집 */}
        <LifeCard />

        {/* My Personality DNA */}
        <MyPersonality />

        {/* Hero Chart with Play CTA */}
        <HeroChart onPlay={handleQuickPlay} bestReturn={bestReturn} gamesPlayed={gamesPlayed} />

        {/* Game Mode Selection */}
        <GameModeCards />

        {/* Why Simulation */}
        <WhySimulation />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: "#141420", alignItems: "center", justifyContent: "center" },
  loadingEmoji: { fontSize: 36, color: "#ffffff" },
  header: { paddingHorizontal: 20, paddingVertical: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandEmoji: { fontSize: 20, color: "#ffffff" },
  brandText: { fontSize: 16, fontWeight: "900", letterSpacing: -0.4, color: "#ffffff" },
  settingsBtn: { padding: 8, backgroundColor: alpha("#ffffff", 0.05), borderRadius: 9999 },
  sections: { gap: 20, paddingTop: 8 },
})
