"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Coins, Play, Clock, Calendar, Sun, Moon } from "lucide-react"
import { storage } from "@/lib/storage"
import { cn } from "@/lib/utils"
import {
  type SpeedMode,
  SPEED_MODES,
  DAILY_OPTIONS,
  MONEY_OPTIONS,
  LABELS,
  COLOR_MAP,
  SPRINT_MAX_CAPITAL,
  DEFAULT_SEED_MONEY,
  DEFAULT_DAILY_OPP,
  DEFAULT_MODE,
} from "./config"

// ============================================================
// Sub-components
// ============================================================

function SpeedModeSection({
  mode,
  onSelect,
  isSprintDisabled,
}: {
  mode: SpeedMode
  onSelect: (m: SpeedMode) => void
  isSprintDisabled: boolean
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-5 h-5 text-blue-400" />
        <h2 className="text-lg font-bold">{LABELS.speedModeTitle}</h2>
      </div>
      <div className="space-y-2.5">
        {(Object.entries(SPEED_MODES) as [SpeedMode, (typeof SPEED_MODES)[SpeedMode]][]).map(
          ([key, m]) => {
            const mc = COLOR_MAP[m.color]
            const isSelected = mode === key
            const isDisabled = key === "sprint" && isSprintDisabled

            return (
              <button
                key={key}
                onClick={() => !isDisabled && onSelect(key)}
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
                      {LABELS.sprintLimitBadge}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{m.icon}</span>
                    <div>
                      <div className={cn("font-bold", isSelected ? mc.text : "text-white")}>
                        {m.name}
                      </div>
                      <div className="text-xs text-gray-400">{m.desc}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn("text-lg font-bold", isSelected ? mc.text : "text-gray-300")}>
                      {m.time}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {m.period} · {m.decisions}
                    </div>
                  </div>
                </div>
              </button>
            )
          }
        )}
      </div>
    </section>
  )
}

function DailyIconRenderer({ icons }: { icons: string[] }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      {icons.map((icon, i) => {
        if (icon === "sun") return <Sun key={i} className="w-4 h-4 text-yellow-400" />
        if (icon === "moon") return <Moon key={i} className="w-4 h-4 text-indigo-400" />
        if (icon === "rice") return <span key={i} className="text-xs">🍚</span>
        return null
      })}
    </div>
  )
}

function DailyOpportunitySection({
  dailyOpp,
  onSelect,
}: {
  dailyOpp: number
  onSelect: (v: number) => void
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-5 h-5 text-emerald-400" />
        <h2 className="text-lg font-bold">{LABELS.dailyOppTitle}</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {DAILY_OPTIONS.map((opt) => {
          const isSelected = dailyOpp === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className={cn(
                "p-4 rounded-2xl border text-left transition-all",
                isSelected
                  ? "bg-emerald-500/15 border-emerald-500"
                  : "bg-[#222] border-transparent"
              )}
            >
              <DailyIconRenderer icons={opt.icons} />
              <div className={cn("font-bold", isSelected ? "text-emerald-400" : "text-white")}>
                {opt.label}
              </div>
              <div className="text-xs text-gray-400">{opt.desc}</div>
              <div className="text-[10px] text-gray-500 mt-1">{opt.sub}</div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function SeedMoneySection({
  seedMoney,
  mode,
  onSelect,
  onModeChange,
}: {
  seedMoney: number
  mode: SpeedMode
  onSelect: (v: number) => void
  onModeChange: (m: SpeedMode) => void
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Coins className="w-5 h-5 text-yellow-400" />
        <h2 className="text-lg font-bold">{LABELS.seedMoneyTitle}</h2>
        <span className="text-[10px] text-gray-500 ml-1">{LABELS.seedMoneyHint}</span>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {MONEY_OPTIONS.map((opt) => {
          const isSelected = seedMoney === opt.value
          const isAdvanced = opt.tier === "advanced"

          return (
            <button
              key={opt.value}
              onClick={() => {
                onSelect(opt.value)
                if (opt.value > SPRINT_MAX_CAPITAL && mode === "sprint") {
                  onModeChange("standard")
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
                    {LABELS.advancedBadge}
                  </span>
                </div>
              )}
              <div
                className={cn(
                  "font-bold text-sm",
                  isSelected ? "text-yellow-400" : "text-gray-300"
                )}
              >
                {opt.label}
              </div>
              {isAdvanced && (
                <div className="text-[9px] text-gray-500 mt-0.5">{LABELS.advancedSubLabel}</div>
              )}
            </button>
          )
        })}
      </div>
      <div className="mt-3 text-xs text-gray-500 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
        💡 <strong className={LABELS.capitalGuideBasicClass}>5천만원 이하</strong>: 모든 모드 선택
        가능 · <strong className={LABELS.capitalGuideAdvancedClass}> 5천만원 초과</strong>:
        스탠다드/마라톤만 가능
      </div>
    </section>
  )
}

// ============================================================
// Main Page
// ============================================================

export default function GameSetupPage() {
  const router = useRouter()
  const [mode, setMode] = useState<SpeedMode>(DEFAULT_MODE)
  const [seedMoney, setSeedMoney] = useState(DEFAULT_SEED_MONEY)
  const [dailyOpp, setDailyOpp] = useState(DEFAULT_DAILY_OPP)

  useEffect(() => {
    const settings = storage.getGameSettings()
    if (settings?.speedMode) setMode(settings.speedMode as SpeedMode)
    if (settings?.initialCash) setSeedMoney(settings.initialCash)
    if (settings?.dailyOpportunities) setDailyOpp(settings.dailyOpportunities)
  }, [])

  const currentMode = SPEED_MODES[mode]
  const isSprintDisabled = seedMoney > SPRINT_MAX_CAPITAL

  const handleModeSelect = (key: SpeedMode) => {
    setMode(key)
  }

  const handleStart = () => {
    storage.setGameSettings({
      speedMode: mode,
      timerSeconds: currentMode.timer,
      simulationMonths: currentMode.simulationMonths,
      dailyOpportunities: dailyOpp as 2 | 3,
      initialCash: seedMoney,
    })
    router.push(`/practice/stock/${currentMode.scenarioId}`)
  }

  return (
    <div className="min-h-screen bg-[#191919] text-white pb-36">
      {/* Header */}
      <div className="pt-safe-top px-5 py-4 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">
          {LABELS.pageTitle}{" "}
          <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-bold border border-emerald-500/30 align-middle">
            {LABELS.freeBadge}
          </span>
        </h1>
      </div>

      <div className="px-5 space-y-6 mt-2">
        <SpeedModeSection
          mode={mode}
          onSelect={handleModeSelect}
          isSprintDisabled={isSprintDisabled}
        />

        <DailyOpportunitySection dailyOpp={dailyOpp} onSelect={setDailyOpp} />

        <SeedMoneySection
          seedMoney={seedMoney}
          mode={mode}
          onSelect={setSeedMoney}
          onModeChange={setMode}
        />
      </div>

      {/* Start Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#191919] via-[#191919] to-transparent" style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}>
        <div className="px-5 pt-4 pb-1">
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
            {LABELS.startButton(currentMode.icon, currentMode.name, currentMode.time)}
          </button>
        </div>
      </div>
    </div>
  )
}
