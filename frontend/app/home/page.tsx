"use client"

import { useEffect, useState } from "react"
import { MobileNav } from "@/components/mobile-nav"
import { storage } from "@/lib/storage"
import { Settings } from "lucide-react"
import HeroChart from "./components/HeroChart"
import GameModeCards from "./components/GameModeCards"
import PlayerStats from "./components/PlayerStats"
import WhySimulation from "./components/WhySimulation"
import MyPersonality from "./components/MyPersonality"

export default function HomePage() {
  const [character, setCharacter] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const onboardingComplete = storage.getOnboardingStatus()
    if (!onboardingComplete) {
      window.location.href = "/onboarding"
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
  }, [])

  if (isLoading || !character) {
    return (
      <div className="min-h-screen bg-[#141420] flex items-center justify-center">
        <div className="animate-pulse text-4xl">📈</div>
      </div>
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
    window.location.href = "/practice/setup"
  }

  return (
    <div className="min-h-screen bg-[#141420] text-white pb-24">
      {/* Header */}
      <div className="pt-safe-top px-5 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl">📈</span>
          <span className="font-black text-base tracking-tight">파도를 타라</span>
        </div>
        <button
          onClick={() => (window.location.href = "/profile")}
          className="p-2 bg-white/5 rounded-full active:bg-white/10 transition-colors"
        >
          <Settings className="w-4.5 h-4.5 text-gray-400" />
        </button>
      </div>

      <div className="space-y-5 pt-2">
        {/* Player Stats Bar */}
        <PlayerStats
          level={character.level}
          hearts={hearts}
          maxHearts={maxHearts}
          streak={streak}
          winRate={winRate}
        />

        {/* My Personality DNA */}
        <MyPersonality />

        {/* Hero Chart with Play CTA */}
        <HeroChart
          onPlay={handleQuickPlay}
          bestReturn={bestReturn}
          gamesPlayed={gamesPlayed}
        />

        {/* Game Mode Selection */}
        <GameModeCards />

        {/* Why Simulation */}
        <WhySimulation />
      </div>

      <MobileNav />
    </div>
  )
}
