"use client"

import { useEffect, useState } from "react"
import { MobileNav } from "@/components/mobile-nav"
import { storage } from "@/lib/storage"
import { Settings, TrendingUp, Zap, Target, ChevronRight, Shield, Timer } from "lucide-react"
import charactersData from "@/data/characters.json"

const DNA_LABELS: Record<string, { emoji: string; name: string }> = {
  turtle: { emoji: "🐢", name: "거북이형" },
  eagle: { emoji: "🦅", name: "독수리형" },
  monkey: { emoji: "🐒", name: "원숭이형" },
  fox: { emoji: "🦊", name: "여우형" },
  lion: { emoji: "🦁", name: "사자형" },
  owl: { emoji: "🦉", name: "부엉이형" },
}

export default function HomePage() {
  const [progress, setProgress] = useState<any>(null)
  const [portfolio, setPortfolio] = useState<any>(null)
  const [character, setCharacter] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const onboardingComplete = storage.getOnboardingStatus()
    if (!onboardingComplete) {
      window.location.href = "/onboarding"
      return
    }

    // 무료 버전: 가이드를 건너뛰고 바로 게임 시작 가능
    if (!storage.getGuideComplete()) {
      storage.setGuideComplete()
    }

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

    setProgress(userProgress)
    setPortfolio(userPortfolio)
    setCharacter(userCharacter)
    setIsLoading(false)
  }, [])

  if (isLoading || !progress || !character) {
    return (
      <div className="min-h-screen bg-[#191919] flex items-center justify-center">
        <div className="animate-pulse text-4xl">🏄</div>
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

  const hearts = character.hearts ?? 5
  const maxHearts = character.maxHearts ?? 5
  const streak = character.streak ?? 0
  const combo = character.bestCombo ?? 0
  const dna = character.investorDNA ? DNA_LABELS[character.investorDNA] : null
  const crisisGrade = character.crisisGrade ?? null

  return (
    <div className="min-h-screen bg-[#191919] text-white pb-24">
      {/* Header */}
      <div className="pt-safe-top px-5 py-4 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏄</span>
          <span className="font-bold text-lg">파도를 타라</span>
        </div>
        <button className="p-2 bg-white/10 rounded-full">
          <Settings className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="px-5 space-y-5 pt-5">
        {/* 총 자산 카드 - 간소화 */}
        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl p-6 border border-blue-500/30">
          <div className="text-sm text-gray-300 mb-2">총 자산</div>
          <div className="text-4xl font-bold mb-1">{totalAssets.toLocaleString()}원</div>
          <div className={`text-lg font-medium ${Number(profitRate) >= 0 ? "text-red-400" : "text-blue-400"}`}>
            {Number(profitRate) >= 0 ? "+" : ""}{profitRate}%
            <span className="text-sm text-gray-400 ml-2">수익률</span>
          </div>
        </div>

        {/* Speed Mode Selection */}
        <div>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Timer className="w-5 h-5 text-blue-400" />
            스피드 모드
          </h3>
          <div className="space-y-2.5">
            {/* Sprint */}
            <button
              onClick={() => {
                storage.setGameSettings({ speedMode: "sprint", timerSeconds: 10, simulationMonths: 1, dailyOpportunities: 2 })
                window.location.href = "/practice/setup"
              }}
              className="w-full bg-gradient-to-r from-orange-600/80 to-orange-500/80 rounded-2xl p-[1px] active:scale-[0.98] transition-transform"
            >
              <div className="bg-[#191919] rounded-[15px] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-orange-500/20 flex items-center justify-center text-xl">⚡</div>
                  <div className="text-left">
                    <div className="font-bold text-white">스프린트</div>
                    <div className="text-xs text-gray-400">5분 · 1개월 · 22회 결정</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full font-bold">10초</span>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            </button>

            {/* Standard */}
            <button
              onClick={() => {
                storage.setGameSettings({ speedMode: "standard", timerSeconds: 15, simulationMonths: 3, dailyOpportunities: 2 })
                window.location.href = "/practice/setup"
              }}
              className="w-full bg-gradient-to-r from-blue-600/80 to-blue-500/80 rounded-2xl p-[1px] active:scale-[0.98] transition-transform"
            >
              <div className="bg-[#191919] rounded-[15px] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-blue-500/20 flex items-center justify-center text-xl">🏃</div>
                  <div className="text-left">
                    <div className="font-bold text-white">스탠다드</div>
                    <div className="text-xs text-gray-400">10분 · 3개월 · 33회 결정</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full font-bold">15초</span>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            </button>

            {/* Marathon */}
            <button
              onClick={() => {
                storage.setGameSettings({ speedMode: "marathon", timerSeconds: 20, simulationMonths: 12, dailyOpportunities: 3 })
                window.location.href = "/practice/setup"
              }}
              className="w-full bg-gradient-to-r from-purple-600/80 to-purple-500/80 rounded-2xl p-[1px] active:scale-[0.98] transition-transform"
            >
              <div className="bg-[#191919] rounded-[15px] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-purple-500/20 flex items-center justify-center text-xl">🏔️</div>
                  <div className="text-left">
                    <div className="font-bold text-white">마라톤</div>
                    <div className="text-xs text-gray-400">30분 · 12개월 · 66회 결정</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full font-bold">20초</span>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Other Modes */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => (window.location.href = "/practice")}
            className="bg-[#222] rounded-2xl p-4 border border-white/5 active:bg-[#2a2a2a] transition-colors text-left"
          >
            <div className="text-2xl mb-2">🎯</div>
            <div className="font-bold text-sm text-white">커리어 모드</div>
            <div className="text-xs text-gray-500 mt-0.5">1~6단계 전체 도전</div>
          </button>
          <button
            onClick={() => (window.location.href = "/compete")}
            className="bg-[#222] rounded-2xl p-4 border border-white/5 active:bg-[#2a2a2a] transition-colors text-left"
          >
            <div className="text-2xl mb-2">🏆</div>
            <div className="font-bold text-sm text-white">랭킹전</div>
            <div className="text-xs text-gray-500 mt-0.5">AI와 수익률 대결</div>
          </button>
        </div>

        {/* Daily Mission */}
        <div className="bg-[#222] rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-yellow-400" />
              오늘의 미션
            </h3>
            <span className="text-xs text-gray-400">0/3 완료</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-[#191919] rounded-xl">
              <div className="w-2 h-2 rounded-full bg-gray-600"></div>
              <span className="text-sm text-gray-300">스프린트 1판 완료하기</span>
              <span className="ml-auto text-xs text-gray-500">+50 EXP</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#191919] rounded-xl">
              <div className="w-2 h-2 rounded-full bg-gray-600"></div>
              <span className="text-sm text-gray-300">위기 대처 성공 1회</span>
              <span className="ml-auto text-xs text-gray-500">+30 EXP</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#191919] rounded-xl">
              <div className="w-2 h-2 rounded-full bg-gray-600"></div>
              <span className="text-sm text-gray-300">3 COMBO 달성</span>
              <span className="ml-auto text-xs text-gray-500">+20 EXP</span>
            </div>
          </div>
        </div>

        {/* Free Banner */}
        <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 rounded-2xl p-4 text-center">
          <div className="text-lg font-bold text-emerald-400 mb-1">🎉 100% 무료 버전</div>
          <p className="text-xs text-gray-400">회원가입 없이 · 모든 기능 무료 · 광고 없음</p>
          <p className="text-xs text-gray-500 mt-1">데이터는 내 기기에만 안전하게 저장됩니다</p>
        </div>
      </div>

      <MobileNav />
    </div>
  )
}
