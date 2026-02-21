"use client"

import { useEffect, useState } from "react"
import { MobileNav } from "@/components/mobile-nav"
import { storage } from "@/lib/storage"
import { Settings, Target, Trophy, Gamepad2 } from "lucide-react"
import HeroChart from "./components/HeroChart"
import GameModeCards from "./components/GameModeCards"
import PlayerStats from "./components/PlayerStats"
import WhySimulation from "./components/WhySimulation"

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

        {/* Hero Chart with Play CTA */}
        <HeroChart
          onPlay={handleQuickPlay}
          bestReturn={bestReturn}
          gamesPlayed={gamesPlayed}
        />

        {/* Game Mode Selection */}
        <GameModeCards />

        {/* Other Modes */}
        <div className="px-5 grid grid-cols-2 gap-2.5">
          <button
            onClick={() => (window.location.href = "/practice")}
            className="bg-[#1e1e2e] rounded-2xl p-4 border border-white/5 active:bg-[#252535] transition-colors text-left"
          >
            <Gamepad2 className="w-6 h-6 text-cyan-400 mb-2" />
            <div className="font-bold text-sm text-white">커리어 모드</div>
            <div className="text-[11px] text-gray-500 mt-0.5">1~6단계 전체 도전</div>
          </button>
          <button
            onClick={() => (window.location.href = "/compete")}
            className="bg-[#1e1e2e] rounded-2xl p-4 border border-white/5 active:bg-[#252535] transition-colors text-left"
          >
            <Trophy className="w-6 h-6 text-yellow-400 mb-2" />
            <div className="font-bold text-sm text-white">랭킹전</div>
            <div className="text-[11px] text-gray-500 mt-0.5">AI와 수익률 대결</div>
          </button>
        </div>

        {/* Daily Missions - Compact */}
        <div className="mx-5 bg-[#1e1e2e] rounded-2xl p-4 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-yellow-400" />
              오늘의 미션
            </h3>
            <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">0/3</span>
          </div>
          <div className="space-y-1.5">
            {[
              { text: "스프린트 1판 완료", reward: "+50 EXP" },
              { text: "수익률 +5% 달성", reward: "+30 EXP" },
              { text: "3 COMBO 달성", reward: "+20 EXP" },
            ].map((mission) => (
              <div key={mission.text} className="flex items-center gap-2.5 p-2.5 bg-[#141420] rounded-xl">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-600 flex-shrink-0" />
                <span className="text-xs text-gray-400 flex-1">{mission.text}</span>
                <span className="text-[10px] text-yellow-500/70 font-medium">{mission.reward}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Why Simulation */}
        <WhySimulation />
      </div>

      <MobileNav />
    </div>
  )
}
