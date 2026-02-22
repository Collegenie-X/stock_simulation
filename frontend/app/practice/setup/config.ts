import setupData from "@/data/practice-setup.json"

// ============================================================
// Types
// ============================================================
export type SpeedMode = "sprint" | "standard" | "marathon"

export interface SpeedModeData {
  icon: string
  name: string
  time: string
  period: string
  decisions: string
  timer: number
  simulationMonths: number
  color: string
  desc: string
  scenarioId: string
  details: { label: string; value: string }[]
}

export interface DailyOption {
  value: number
  icons: string[]
  label: string
  desc: string
  sub: string
}

export interface MoneyOption {
  value: number
  label: string
  tier: string
}

// ============================================================
// Data (from JSON)
// ============================================================
export const SPEED_MODES = setupData.speedModes as Record<SpeedMode, SpeedModeData>
export const DAILY_OPTIONS = setupData.dailyOptions as DailyOption[]
export const MONEY_OPTIONS = setupData.moneyOptions as MoneyOption[]

// ============================================================
// Labels
// ============================================================
export const LABELS = {
  pageTitle: "게임 설정",
  freeBadge: "무료",
  speedModeTitle: "스피드 모드",
  dailyOppTitle: "하루 투자 기회",
  seedMoneyTitle: "초기 자본금",
  seedMoneyHint: "돈의 크기를 느껴보세요",
  startButton: (icon: string, name: string, time: string) =>
    `${icon} ${name} 시작 (${time})`,
  sprintLimitBadge: "5천만원 초과 제한",
  capitalGuide:
    "💡 <strong>5천만원 이하</strong>: 모든 모드 선택 가능 · <strong>5천만원 초과</strong>: 스탠다드/마라톤만 가능",
  capitalGuideBasicClass: "text-blue-400",
  capitalGuideAdvancedClass: "text-purple-400",
  advancedBadge: "고액",
  advancedSubLabel: "스탠다드/마라톤",
} as const

// ============================================================
// Color map
// ============================================================
export const COLOR_MAP: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  orange: {
    bg: "bg-orange-500/15",
    border: "border-orange-500",
    text: "text-orange-400",
    badge: "bg-orange-500/20 text-orange-400",
  },
  blue: {
    bg: "bg-blue-500/15",
    border: "border-blue-500",
    text: "text-blue-400",
    badge: "bg-blue-500/20 text-blue-400",
  },
  purple: {
    bg: "bg-purple-500/15",
    border: "border-purple-500",
    text: "text-purple-400",
    badge: "bg-purple-500/20 text-purple-400",
  },
}

// ============================================================
// Business rules
// ============================================================
export const SPRINT_MAX_CAPITAL = 50000000
export const DEFAULT_SEED_MONEY = 5000000
export const DEFAULT_DAILY_OPP = 2
export const DEFAULT_MODE: SpeedMode = "sprint"
