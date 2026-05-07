"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Coins, Play, Zap, Calendar, Star, Sparkles, Trophy, Lock } from "lucide-react"
import { storage } from "@/lib/storage"
import { cn } from "@/lib/utils"
import { SprintScene, StandardScene, MarathonScene, CoinStack, DayCycleScene } from "./illustrations"
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
// Game-style helpers
// ============================================================

const MODE_DIFFICULTY: Record<SpeedMode, number> = {
  sprint: 1,
  standard: 2,
  marathon: 3,
}

const MODE_GRADIENT: Record<string, string> = {
  orange: "from-orange-500/30 via-amber-500/15 to-transparent",
  blue: "from-blue-500/30 via-cyan-500/15 to-transparent",
  purple: "from-purple-500/30 via-fuchsia-500/15 to-transparent",
}

const MODE_GLOW: Record<string, string> = {
  orange: "shadow-[0_0_24px_rgba(249,115,22,0.45)]",
  blue: "shadow-[0_0_24px_rgba(59,130,246,0.45)]",
  purple: "shadow-[0_0_24px_rgba(168,85,247,0.45)]",
}

const MODE_BTN_GRADIENT: Record<SpeedMode, string> = {
  sprint: "bg-gradient-to-r from-orange-500 via-orange-600 to-red-500",
  standard: "bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500",
  marathon: "bg-gradient-to-r from-purple-500 via-purple-600 to-fuchsia-500",
}

const MODE_SCENE: Record<SpeedMode, React.ComponentType<{ active?: boolean; className?: string }>> = {
  sprint: SprintScene,
  standard: StandardScene,
  marathon: MarathonScene,
}

const MONEY_TIER_VISUAL = (value: number, premium: boolean): "small" | "medium" | "large" => {
  if (premium) return "large"
  if (value >= 50000000) return "large"
  if (value >= 10000000) return "medium"
  return "small"
}

const MONEY_TAGLINE: Record<number, string> = {
  5000000: "부담없이 체험",
  10000000: "직장인 첫 투자",
  50000000: "본격 입문가",
  100000000: "1억 만들기 도전",
  300000000: "자산가 체험",
  500000000: "전업 투자자",
}

function SectionHeader({
  icon,
  title,
  accent,
  hint,
}: {
  icon: React.ReactNode
  title: string
  accent: string
  hint?: string
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className={cn("relative flex items-center justify-center w-8 h-8 rounded-lg", accent)}>
        {icon}
        <span className="absolute inset-0 rounded-lg ring-1 ring-white/10" />
      </div>
      <h2 className="text-lg font-black tracking-tight uppercase">{title}</h2>
      {hint && <span className="text-[10px] text-gray-500 ml-1">{hint}</span>}
    </div>
  )
}

function DifficultyStars({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          className={cn(
            "w-3 h-3",
            i <= level ? "text-yellow-400 fill-yellow-400" : "text-gray-600"
          )}
        />
      ))}
    </div>
  )
}

// ============================================================
// Sub-components
// ============================================================

function SpeedModeSection({
  mode,
  onSelect,
  isSprintDisabled,
  dailyOpp,
}: {
  mode: SpeedMode
  onSelect: (m: SpeedMode) => void
  isSprintDisabled: boolean
  dailyOpp: number
}) {
  const oppKey = (dailyOpp === 1 ? "1" : "2") as "1" | "2"
  return (
    <section>
      <SectionHeader
        icon={<Zap className="w-4 h-4 text-blue-300" />}
        title={LABELS.speedModeTitle}
        accent="bg-blue-500/20 border border-blue-400/30"
      />
      <div className="space-y-2.5">
        {(Object.entries(SPEED_MODES) as [SpeedMode, (typeof SPEED_MODES)[SpeedMode]][]).map(
          ([key, m]) => {
            const mc = COLOR_MAP[m.color]
            const isSelected = mode === key
            const isDisabled = key === "sprint" && isSprintDisabled
            const difficulty = MODE_DIFFICULTY[key]
            const Scene = MODE_SCENE[key]

            return (
              <button
                key={key}
                onClick={() => !isDisabled && onSelect(key)}
                disabled={isDisabled}
                className={cn(
                  "group w-full p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden",
                  isDisabled && "opacity-40 cursor-not-allowed border-gray-700 bg-[#1a1a1a]",
                  !isDisabled && isSelected && `${mc.border} ${MODE_GLOW[m.color]} scale-[1.01]`,
                  !isDisabled && !isSelected && "bg-[#1f1f1f] border-[#2a2a2a] hover:border-[#3a3a3a] active:scale-[0.99]"
                )}
              >
                {/* Gradient background when selected */}
                {isSelected && !isDisabled && (
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-100 pointer-events-none",
                      MODE_GRADIENT[m.color]
                    )}
                  />
                )}
                {/* Animated scan line for selected */}
                {isSelected && !isDisabled && (
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-transparent via-white/40 to-transparent animate-scan pointer-events-none" />
                )}

                {isDisabled && (
                  <div className="absolute top-2 right-2 z-10">
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold border border-red-500/30 inline-flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      {LABELS.sprintLimitBadge}
                    </span>
                  </div>
                )}

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-16 h-16 rounded-xl flex items-center justify-center border-2 transition-all overflow-hidden p-1",
                        isSelected && !isDisabled
                          ? `${mc.bg} ${mc.border}`
                          : "bg-[#262626] border-[#333]"
                      )}
                    >
                      <Scene active={isSelected && !isDisabled} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className={cn("font-black text-base tracking-tight", isSelected ? mc.text : "text-white")}>
                          {m.name}
                        </div>
                        <DifficultyStars level={difficulty} />
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{m.desc}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={cn(
                        "text-lg font-black tabular-nums",
                        isSelected ? mc.text : "text-gray-300"
                      )}
                    >
                      {m.time[oppKey]}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {m.period} · {m.decisions[oppKey]}
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

function DailyOpportunitySection({
  dailyOpp,
  onSelect,
}: {
  dailyOpp: number
  onSelect: (v: number) => void
}) {
  return (
    <section>
      <SectionHeader
        icon={<Calendar className="w-4 h-4 text-emerald-300" />}
        title={LABELS.dailyOppTitle}
        accent="bg-emerald-500/20 border border-emerald-400/30"
      />
      <div className="grid grid-cols-2 gap-3">
        {DAILY_OPTIONS.map((opt) => {
          const isSelected = dailyOpp === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className={cn(
                "relative p-4 rounded-2xl border-2 text-left transition-all overflow-hidden active:scale-[0.98]",
                isSelected
                  ? "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.35)]"
                  : "bg-[#1f1f1f] border-[#2a2a2a] hover:border-[#3a3a3a]"
              )}
            >
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/25 via-teal-500/10 to-transparent pointer-events-none" />
              )}
              <div className="relative">
                <div className="mb-2 rounded-lg bg-gradient-to-b from-slate-900/80 to-indigo-950/40 border border-white/5 px-1 py-1">
                  <DayCycleScene count={opt.value as 1 | 2} active={isSelected} />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <div className={cn("font-black text-xl", isSelected ? "text-emerald-300" : "text-white")}>
                    {opt.label}
                  </div>
                  {isSelected && <Sparkles className="w-3.5 h-3.5 text-emerald-300" />}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{opt.desc}</div>
                <div className="text-[10px] text-gray-500 mt-1">{opt.sub}</div>
              </div>
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
      <SectionHeader
        icon={<Coins className="w-4 h-4 text-yellow-300" />}
        title={LABELS.seedMoneyTitle}
        accent="bg-yellow-500/20 border border-yellow-400/30"
        hint={LABELS.seedMoneyHint}
      />
      <div className="grid grid-cols-3 gap-2.5 pt-2">
        {MONEY_OPTIONS.map((opt) => {
          const isSelected = seedMoney === opt.value
          const isAdvanced = opt.tier === "advanced"
          const tagline = MONEY_TAGLINE[opt.value]

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
                "rounded-xl border-2 text-center transition-all relative active:scale-[0.97]",
                isSelected
                  ? isAdvanced
                    ? "border-purple-500 shadow-[0_0_18px_rgba(168,85,247,0.45)]"
                    : "border-yellow-500 shadow-[0_0_18px_rgba(234,179,8,0.45)]"
                  : "bg-[#1f1f1f] border-[#2a2a2a] hover:border-[#3a3a3a]"
              )}
            >
              {/* Gradient bg layer (clipped) */}
              <div className="absolute inset-0 rounded-[10px] overflow-hidden pointer-events-none">
                {isSelected && (
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br",
                      isAdvanced
                        ? "from-purple-500/30 via-fuchsia-500/15 to-transparent"
                        : "from-yellow-500/30 via-amber-500/15 to-transparent"
                    )}
                  />
                )}
              </div>

              {/* Premium badge — outside overflow wrapper so it doesn't clip */}
              {isAdvanced && (
                <div className="absolute -top-2 -right-1 z-20">
                  <span className="text-[8px] bg-purple-500 text-white px-1.5 py-0.5 rounded-full font-black shadow-md inline-flex items-center gap-0.5 whitespace-nowrap">
                    <Trophy className="w-2 h-2" />
                    {LABELS.advancedBadge}
                  </span>
                </div>
              )}

              <div className="relative py-3 px-1.5">
                {/* Speech bubble tagline */}
                {tagline && (
                  <div className="relative mb-1.5 mx-auto inline-block">
                    <div
                      className={cn(
                        "text-[9px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap",
                        isSelected
                          ? isAdvanced
                            ? "bg-purple-500/25 border-purple-400/50 text-purple-100"
                            : "bg-yellow-500/25 border-yellow-400/50 text-yellow-100"
                          : "bg-[#2a2a2a] border-[#3a3a3a] text-gray-400"
                      )}
                    >
                      {tagline}
                    </div>
                    {/* Bubble tail */}
                    <div
                      className={cn(
                        "absolute left-1/2 -translate-x-1/2 -bottom-[3px] w-1.5 h-1.5 rotate-45 border-r border-b",
                        isSelected
                          ? isAdvanced
                            ? "bg-purple-500/25 border-purple-400/50"
                            : "bg-yellow-500/25 border-yellow-400/50"
                          : "bg-[#2a2a2a] border-[#3a3a3a]"
                      )}
                    />
                  </div>
                )}

                <div className="h-9 mb-1 flex items-end justify-center">
                  <div className="w-12 h-9">
                    <CoinStack
                      size={MONEY_TIER_VISUAL(opt.value, isAdvanced)}
                      premium={isAdvanced}
                      active={isSelected}
                    />
                  </div>
                </div>
                <div
                  className={cn(
                    "font-black text-sm tabular-nums",
                    isSelected
                      ? isAdvanced
                        ? "text-purple-300"
                        : "text-yellow-300"
                      : "text-gray-300"
                  )}
                >
                  {opt.label}
                </div>
                {isAdvanced && (
                  <div className="text-[9px] text-gray-500 mt-0.5">{LABELS.advancedSubLabel}</div>
                )}
              </div>
            </button>
          )
        })}
      </div>
      <div className="mt-3 text-xs text-gray-400 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 border border-blue-500/20 rounded-xl p-3">
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
      dailyOpportunities: dailyOpp as 1 | 2,
      initialCash: seedMoney,
    })
    router.push(`/practice/stock/${currentMode.scenarioId}`)
  }

  return (
    <div className="min-h-screen bg-[#191919] text-white pb-36 relative overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-64 bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent blur-3xl" />

      {/* Header */}
      <div className="relative pt-safe-top px-5 py-4 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tight">
            {LABELS.pageTitle}{" "}
            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-bold border border-emerald-500/30 align-middle">
              {LABELS.freeBadge}
            </span>
          </h1>
        </div>
      </div>

      <div className="relative px-5 space-y-6 mt-2">
        <SpeedModeSection
          mode={mode}
          onSelect={handleModeSelect}
          isSprintDisabled={isSprintDisabled}
          dailyOpp={dailyOpp}
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
      <div
        className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#191919] via-[#191919]/95 to-transparent z-20"
        style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
      >
        <div className="px-5 pt-6 pb-1">
          <button
            onClick={handleStart}
            className={cn(
              "relative w-full py-4 rounded-2xl font-black text-lg shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 overflow-hidden border-2 border-white/10",
              MODE_BTN_GRADIENT[mode],
              mode === "sprint" && "shadow-orange-900/40",
              mode === "standard" && "shadow-blue-900/40",
              mode === "marathon" && "shadow-purple-900/40"
            )}
          >
            {/* Shimmer */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full animate-[shimmer_2.5s_ease-in-out_infinite] pointer-events-none" />
            <Play className="w-5 h-5 fill-current drop-shadow" />
            <span className="relative drop-shadow tracking-tight">
              {LABELS.startButton(
                currentMode.icon,
                currentMode.name,
                currentMode.time[(dailyOpp === 1 ? "1" : "2") as "1" | "2"]
              )}
            </span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          60%,
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  )
}
