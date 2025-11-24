"use client"

import { useEffect, useState } from "react"
import { MobileNav } from "@/components/mobile-nav"
import { storage } from "@/lib/storage"
import { Settings, TrendingUp, Play, Zap, Target, ChevronRight } from "lucide-react"
import charactersData from "@/data/characters.json"

export default function HomePage() {
  const [progress, setProgress] = useState<any>(null)
  const [portfolio, setPortfolio] = useState<any>(null)
  const [character, setCharacter] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log("[v0] HomePage useEffect - checking status")

    const onboardingComplete = storage.getOnboardingStatus()
    console.log("[v0] Onboarding complete:", onboardingComplete)

    if (!onboardingComplete) {
      console.log("[v0] Redirecting to onboarding")
      window.location.href = "/onboarding"
      return
    }

    const guideComplete = storage.getGuideComplete()
    console.log("[v0] Guide complete:", guideComplete)

    if (!guideComplete) {
      console.log("[v0] Redirecting to analysis-intro")
      window.location.href = "/analysis-intro"
      return
    }

    console.log("[v0] Loading home page data...")

    const userProgress = storage.getProgress()
    const userPortfolio = storage.getPortfolio()
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
        streak: 0,
        achievements: [],
        createdAt: new Date().toISOString(),
      }
      storage.setCharacter(userCharacter)
    }

    setProgress(userProgress)
    setPortfolio(userPortfolio)
    setCharacter(userCharacter)
    setIsLoading(false)
  }, [])

  if (isLoading || !progress || !character) {
    return (
      <div className="min-h-screen bg-[#191919] flex items-center justify-center">
        <div className="animate-pulse text-4xl">🌊</div>
      </div>
    )
  }

  const totalAssets = portfolio?.totalAssets || 10000000
  const profitRate = (((totalAssets - 10000000) / 10000000) * 100).toFixed(1)

  const characterType = character.type || "balanced"
  const characterInfo = charactersData.characters[characterType as keyof typeof charactersData.characters]
  const currentLevel = charactersData.levels.find((l) => l.level === character.level) || charactersData.levels[0]
  const nextLevel = charactersData.levels.find((l) => l.level === character.level + 1)
  const expProgress = nextLevel
    ? ((character.totalExp - currentLevel.minExp) / (nextLevel.minExp - currentLevel.minExp)) * 100
    : 100

  return (
    <div className="min-h-screen bg-[#191919] text-white pb-24">
      {/* Header */}
      <div className="pt-safe-top px-5 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌊</span>
          <span className="font-bold text-lg">파도를 타라</span>
        </div>
        <button className="p-2 bg-white/10 rounded-full">
          <Settings className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="px-5 space-y-6">
        {/* Character Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>

          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full border border-blue-500/30">
                  Lv.{character.level} {currentLevel.title}
                </span>
              </div>
              <h2 className="text-xl font-bold mb-1">{characterInfo.name}</h2>
              <p className="text-sm text-gray-400">{characterInfo.type}</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg border border-white/10">
              {characterInfo.emoji}
            </div>
          </div>

          {/* EXP Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>EXP</span>
              <span>{Math.floor(expProgress)}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${expProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#222] rounded-2xl p-4 border border-white/5">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
              <TrendingUp className="w-4 h-4" />
              <span>총 자산</span>
            </div>
            <div className="text-lg font-bold">{totalAssets.toLocaleString()}원</div>
          </div>
          <div className="bg-[#222] rounded-2xl p-4 border border-white/5">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
              <Zap className="w-4 h-4" />
              <span>수익률</span>
            </div>
            <div className={`text-lg font-bold ${Number(profitRate) >= 0 ? "text-red-400" : "text-blue-400"}`}>
              {Number(profitRate) >= 0 ? "+" : ""}
              {profitRate}%
            </div>
          </div>
        </div>

        {/* Game Modes */}
        <div>
          <h3 className="text-lg font-bold mb-3">게임 모드</h3>
          <div className="space-y-3">
            <button
              onClick={() => (window.location.href = "/practice/setup")} // Changed link to setup page
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-1 shadow-lg active:scale-[0.98] transition-transform group"
            >
              <div className="bg-[#191919] rounded-xl p-4 flex items-center justify-between h-full group-hover:bg-opacity-90 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-2xl">
                    📈
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-lg text-white">실전 연습</div>
                    <div className="text-sm text-gray-400">가상 자금으로 파도 타기 연습</div>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <Play className="w-4 h-4 text-white fill-current" />
                </div>
              </div>
            </button>

            <button
              onClick={() => (window.location.href = "/compete")}
              className="w-full bg-[#222] rounded-2xl p-4 flex items-center justify-between border border-white/5 active:bg-[#2a2a2a] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-2xl">
                  🏆
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg text-white">랭킹전</div>
                  <div className="text-sm text-gray-400">다른 투자자들과 수익률 경쟁</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Daily Mission / Status */}
        <div className="bg-[#222] rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-yellow-400" />
              오늘의 미션
            </h3>
            <span className="text-xs text-gray-400">0/3 완료</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-[#191919] rounded-xl">
              <div className="w-2 h-2 rounded-full bg-gray-600"></div>
              <span className="text-sm text-gray-300">수익률 5% 달성하기</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#191919] rounded-xl">
              <div className="w-2 h-2 rounded-full bg-gray-600"></div>
              <span className="text-sm text-gray-300">3일 연속 접속하기</span>
            </div>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  )
}
