"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Coins, Play, Clock, Calendar, Hash, Sun, Moon } from "lucide-react"
import { storage } from "@/lib/storage"
import { cn } from "@/lib/utils"

type SpeedMode = "sprint" | "standard" | "marathon"

const SPEED_MODES = {
  sprint: {
    icon: "⚡",
    name: "스프린트",
    time: "~5분",
    period: "1개월",
    decisions: "22회",
    timer: 10,
    dailyOptions: [2] as const,
    color: "orange",
    desc: "점심시간에 딱! 빠르게 체험",
    details: [
      { label: "시뮬레이션", value: "1개월 (20거래일)" },
      { label: "결정 타이머", value: "10초" },
      { label: "하루 기회", value: "2회 (☀️ 아침 / 🌙 저녁)" },
      { label: "이벤트 날", value: "~11일 (55%)" },
      { label: "분당 결정", value: "4.4회 (듀오링고 수준)" },
    ],
  },
  standard: {
    icon: "🏃",
    name: "스탠다드",
    time: "~10분",
    period: "3개월",
    decisions: "33회",
    timer: 15,
    dailyOptions: [2, 3] as const,
    color: "blue",
    desc: "출퇴근길에 딱! 균형 잡힌 학습",
    details: [
      { label: "시뮬레이션", value: "3개월 (60거래일)" },
      { label: "결정 타이머", value: "15초" },
      { label: "하루 기회", value: "2~3회 (유연)" },
      { label: "핵심 플레이 주", value: "6주 / 12주" },
      { label: "분당 결정", value: "3.3회" },
    ],
  },
  marathon: {
    icon: "🏔️",
    name: "마라톤",
    time: "~30분",
    period: "12개월",
    decisions: "66회",
    timer: 20,
    dailyOptions: [3] as const,
    color: "purple",
    desc: "주말 카페에서! 1년 풀 체험",
    details: [
      { label: "시뮬레이션", value: "12개월 (240거래일)" },
      { label: "결정 타이머", value: "20초" },
      { label: "하루 기회", value: "3회 (☀️ 아침 / 🍚 점심 / 🌙 저녁)" },
      { label: "위기 이벤트", value: "연 2회 (블랙스완)" },
      { label: "분당 결정", value: "2.2회" },
    ],
  },
}

const MONEY_OPTIONS = [
  { value: 5000000, label: "500만원", tier: "basic" },
  { value: 10000000, label: "1,000만원", tier: "basic" },
  { value: 100000000, label: "1억원", tier: "basic" },
  { value: 300000000, label: "3억원", tier: "advanced" },
  { value: 500000000, label: "5억원", tier: "advanced" },
  { value: 1000000000, label: "10억원", tier: "advanced" },
]

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  orange: { bg: "bg-orange-500/15", border: "border-orange-500", text: "text-orange-400", badge: "bg-orange-500/20 text-orange-400" },
  blue: { bg: "bg-blue-500/15", border: "border-blue-500", text: "text-blue-400", badge: "bg-blue-500/20 text-blue-400" },
  purple: { bg: "bg-purple-500/15", border: "border-purple-500", text: "text-purple-400", badge: "bg-purple-500/20 text-purple-400" },
}

export default function GameSetupPage() {
  const router = useRouter()
  const [mode, setMode] = useState<SpeedMode>("sprint")
  const [seedMoney, setSeedMoney] = useState(5000000)
  const [dailyOpp, setDailyOpp] = useState<2 | 3>(2)

  useEffect(() => {
    const settings = storage.getGameSettings()
    if (settings?.speedMode) {
      setMode(settings.speedMode as SpeedMode)
    }
    if (settings?.initialCash) {
      setSeedMoney(settings.initialCash)
    }
    if (settings?.dailyOpportunities) {
      setDailyOpp(settings.dailyOpportunities as 2 | 3)
    }
  }, [])

  const currentMode = SPEED_MODES[mode]
  const c = colorMap[currentMode.color]
  
  // 1억원 초과 시 스프린트 모드 제한
  const isSprintDisabled = seedMoney > 100000000

  const handleStart = () => {
    storage.setGameSettings({
      speedMode: mode,
      timerSeconds: currentMode.timer,
      simulationMonths: mode === "sprint" ? 1 : mode === "standard" ? 3 : 12,
      dailyOpportunities: dailyOpp,
      initialCash: seedMoney,
    })

    const scenarioId = mode === "sprint" ? "scenario-1" : "scenario-100days"
    router.push(`/practice/stock/${scenarioId}`)
  }

  return (
    <div className="min-h-screen bg-[#191919] text-white pb-28">
      {/* Header */}
      <div className="pt-safe-top px-5 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">게임 설정 <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-bold border border-emerald-500/30 align-middle">무료</span></h1>
      </div>

      <div className="px-5 space-y-6 mt-2">
        {/* Speed Mode Selection */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold">스피드 모드</h2>
          </div>
          <div className="space-y-2.5">
            {(Object.entries(SPEED_MODES) as [SpeedMode, typeof SPEED_MODES.sprint][]).map(([key, m]) => {
              const mc = colorMap[m.color]
              const isSelected = mode === key
              const isDisabled = key === "sprint" && isSprintDisabled
              
              return (
                <button
                  key={key}
                  onClick={() => {
                    if (isDisabled) return
                    setMode(key)
                    if (m.dailyOptions.length === 1) setDailyOpp(m.dailyOptions[0])
                  }}
                  disabled={isDisabled}
                  className={cn(
                    "w-full p-4 rounded-2xl border text-left transition-all relative",
                    isDisabled && "opacity-40 cursor-not-allowed",
                    !isDisabled && isSelected && `${mc.bg} ${mc.border}`,
                    !isDisabled && !isSelected && "bg-[#222] border-transparent"
                  )}
                >
                  {isDisabled && (
                    <div className="absolute top-2 right-2">
                      <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold border border-red-500/30">
                        1억 초과 제한
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{m.icon}</span>
                      <div>
                        <div className={cn("font-bold", isSelected ? mc.text : "text-white")}>{m.name}</div>
                        <div className="text-xs text-gray-400">{m.desc}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn("text-lg font-bold", isSelected ? mc.text : "text-gray-300")}>{m.time}</div>
                      <div className="text-[10px] text-gray-500">{m.period} · {m.decisions}</div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Mode Details */}
        <section className={cn("rounded-2xl p-4 border", c.bg, c.border)}>
          <h3 className={cn("font-bold mb-3 flex items-center gap-2", c.text)}>
            <span className="text-lg">{currentMode.icon}</span>
            {currentMode.name} 모드 상세
          </h3>
          <div className="space-y-2">
            {currentMode.details.map((d, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-xs text-gray-400">{d.label}</span>
                <span className="text-sm font-medium text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Daily Opportunities (for Standard mode) */}
        {currentMode.dailyOptions.length > 1 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold">하루 투자 기회</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDailyOpp(2)}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all",
                  dailyOpp === 2 ? "bg-emerald-500/15 border-emerald-500" : "bg-[#222] border-transparent"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="w-4 h-4 text-yellow-400" />
                  <Moon className="w-4 h-4 text-indigo-400" />
                </div>
                <div className={cn("font-bold", dailyOpp === 2 ? "text-emerald-400" : "text-white")}>2회</div>
                <div className="text-xs text-gray-400">아침 / 저녁</div>
                <div className="text-[10px] text-gray-500 mt-1">빠르게 진행</div>
              </button>
              <button
                onClick={() => setDailyOpp(3)}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all",
                  dailyOpp === 3 ? "bg-emerald-500/15 border-emerald-500" : "bg-[#222] border-transparent"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs">🍚</span>
                  <Moon className="w-4 h-4 text-indigo-400" />
                </div>
                <div className={cn("font-bold", dailyOpp === 3 ? "text-emerald-400" : "text-white")}>3회</div>
                <div className="text-xs text-gray-400">아침 / 점심 / 저녁</div>
                <div className="text-[10px] text-gray-500 mt-1">더 상세하게</div>
              </button>
            </div>
          </section>
        )}

        {/* Seed Money Selection */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Coins className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-bold">초기 자본금</h2>
            <span className="text-[10px] text-gray-500 ml-1">돈의 크기를 느껴보세요</span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {MONEY_OPTIONS.map((opt) => {
              const isSelected = seedMoney === opt.value
              const isAdvanced = opt.tier === "advanced"
              
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSeedMoney(opt.value)
                    // 1억원 초과 선택 시 스프린트에서 스탠다드로 자동 전환
                    if (opt.value > 100000000 && mode === "sprint") {
                      setMode("standard")
                    }
                  }}
                  className={cn(
                    "py-3.5 px-2 rounded-xl border text-center transition-all relative",
                    isSelected
                      ? "bg-yellow-500/20 border-yellow-500"
                      : "bg-[#222] border-transparent hover:bg-[#2a2a2a]"
                  )}
                >
                  {isAdvanced && !isSelected && (
                    <div className="absolute -top-1 -right-1">
                      <span className="text-[8px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full font-bold">
                        고액
                      </span>
                    </div>
                  )}
                  <div className={cn(
                    "font-bold text-sm",
                    isSelected ? "text-yellow-400" : "text-gray-300"
                  )}>
                    {opt.label}
                  </div>
                  {isAdvanced && (
                    <div className="text-[9px] text-gray-500 mt-0.5">
                      스탠다드/마라톤
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          <div className="mt-3 text-xs text-gray-500 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
            💡 <strong className="text-blue-400">1억원 이하</strong>: 모든 모드 선택 가능 · 
            <strong className="text-purple-400"> 1억원 초과</strong>: 스탠다드/마라톤만 가능
          </div>
        </section>

        {/* Summary */}
        <section className="bg-[#222] rounded-2xl p-4 border border-white/5">
          <h3 className="font-bold text-sm text-gray-400 mb-3">게임 요약</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">모드</span>
              <span className="text-sm font-bold">{currentMode.icon} {currentMode.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">시간</span>
              <span className="text-sm font-bold">{currentMode.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">자본금</span>
              <span className="text-sm font-bold">
                {seedMoney >= 100000000 
                  ? `${(seedMoney / 100000000).toFixed(0)}억원` 
                  : `${(seedMoney / 10000).toFixed(0)}만원`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">하루 기회</span>
              <span className="text-sm font-bold">{dailyOpp}회</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">타이머</span>
              <span className="text-sm font-bold">{currentMode.timer}초</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">기간</span>
              <span className="text-sm font-bold">{currentMode.period}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Start Button */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#191919] via-[#191919] to-transparent">
        <button
          onClick={handleStart}
          className={cn(
            "w-full py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2",
            mode === "sprint" && "bg-orange-600 hover:bg-orange-500 shadow-orange-900/20",
            mode === "standard" && "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20",
            mode === "marathon" && "bg-purple-600 hover:bg-purple-500 shadow-purple-900/20"
          )}
        >
          <Play className="w-5 h-5 fill-current" />
          {currentMode.icon} {currentMode.name} 시작 ({currentMode.time})
        </button>
      </div>
    </div>
  )
}
