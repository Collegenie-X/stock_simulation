import setupData from "@/data/practice-setup.json"
import { alpha, palette } from "@/theme"

// ============================================================
// Types
// ============================================================
export type SpeedMode = "sprint" | "standard" | "marathon"

export interface SpeedModeData {
  icon: string
  name: string
  time: Record<"1" | "2", string>
  period: string
  decisions: Record<"1" | "2", string>
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
  capitalGuideBasicColor: palette.blue[400],
  capitalGuideAdvancedColor: palette.purple[400],
  advancedBadge: "고액",
  advancedSubLabel: "스탠다드/마라톤",
} as const

// ============================================================
// Color map (웹의 Tailwind 클래스 → RN 색상값)
//   bg: bg-{c}-500/15, border: border-{c}-500, text: text-{c}-400
//   badgeBg/badgeText: bg-{c}-500/20 text-{c}-400
//   gradient: 선택 시 카드 배경 (from-{c}-500/30 via-*/15 to-transparent)
//   glow: 선택 시 외곽 글로우 (shadow-[0_0_24px_rgba(..,0.45)])
// ============================================================
export const COLOR_MAP: Record<
  string,
  { bg: string; border: string; text: string; badgeBg: string; badgeText: string; gradient: readonly string[]; glow: string }
> = {
  orange: {
    bg: alpha(palette.orange[500], 0.15),
    border: palette.orange[500],
    text: palette.orange[400],
    badgeBg: alpha(palette.orange[500], 0.2),
    badgeText: palette.orange[400],
    gradient: [alpha(palette.orange[500], 0.3), alpha(palette.amber[500], 0.15), alpha(palette.amber[500], 0)],
    glow: "0 0 24px rgba(249,115,22,0.45)",
  },
  blue: {
    bg: alpha(palette.blue[500], 0.15),
    border: palette.blue[500],
    text: palette.blue[400],
    badgeBg: alpha(palette.blue[500], 0.2),
    badgeText: palette.blue[400],
    gradient: [alpha(palette.blue[500], 0.3), alpha(palette.cyan[500], 0.15), alpha(palette.cyan[500], 0)],
    glow: "0 0 24px rgba(59,130,246,0.45)",
  },
  purple: {
    bg: alpha(palette.purple[500], 0.15),
    border: palette.purple[500],
    text: palette.purple[400],
    badgeBg: alpha(palette.purple[500], 0.2),
    badgeText: palette.purple[400],
    gradient: [alpha(palette.purple[500], 0.3), alpha(palette.fuchsia[500], 0.15), alpha(palette.fuchsia[500], 0)],
    glow: "0 0 24px rgba(168,85,247,0.45)",
  },
}

// ============================================================
// Business rules
// ============================================================
export const SPRINT_MAX_CAPITAL = 50000000
export const DEFAULT_SEED_MONEY = 5000000
export const DEFAULT_DAILY_OPP = 2
export const DEFAULT_MODE: SpeedMode = "sprint"
