import { Flame, Shield, Star, Swords, Target, Zap, type LucideIcon } from "lucide-react-native"
import { alpha, palette } from "@/theme"

// ── 등급 ──────────────────────────────────────────────────
export type Grade = "S" | "A" | "B" | "C" | "D"

export function calcGrade(profitRate: number, gapToBest: number): Grade {
  if (profitRate >= 5 && gapToBest >= 0) return "S"
  if (profitRate >= 2 || gapToBest >= -1) return "A"
  if (profitRate >= 0) return "B"
  if (profitRate >= -3) return "C"
  return "D"
}

export const GRADE_CONFIG: Record<Grade, { color: string; bg: string; border: string; glow: string; emoji: string; label: string }> = {
  S: { color: palette.yellow[300], bg: alpha(palette.yellow[500], 0.2), border: alpha(palette.yellow[400], 0.6), glow: alpha(palette.yellow[500], 0.4), emoji: "👑", label: "전설적인 투자!" },
  A: { color: palette.green[400],  bg: alpha(palette.green[500], 0.2),  border: alpha(palette.green[500], 0.4),  glow: alpha(palette.green[500], 0.3),  emoji: "🌟", label: "훌륭한 성과!" },
  B: { color: palette.blue[400],   bg: alpha(palette.blue[500], 0.2),   border: alpha(palette.blue[500], 0.4),   glow: alpha(palette.blue[500], 0.3),   emoji: "💪", label: "안정적 투자" },
  C: { color: palette.orange[400], bg: alpha(palette.orange[500], 0.2), border: alpha(palette.orange[500], 0.4), glow: alpha(palette.orange[500], 0.3), emoji: "📈", label: "성장 중" },
  D: { color: palette.red[400],    bg: alpha(palette.red[500], 0.2),    border: alpha(palette.red[500], 0.4),    glow: alpha(palette.red[500], 0.3),    emoji: "🔥", label: "도전 계속!" },
}

export interface MiniAchievement {
  Icon: LucideIcon
  iconColor: string
  text: string
}

export function pickAchievements(
  profitRate: number, tradeCount: number, holdingsCount: number, gapToSimilar: number,
): MiniAchievement[] {
  const list: MiniAchievement[] = []
  if (profitRate >= 3)                   list.push({ Icon: Flame,  iconColor: palette.orange[400], text: "수익률 3% 돌파!" })
  if (profitRate >= 0 && profitRate < 3) list.push({ Icon: Shield, iconColor: palette.blue[400],   text: "원금 방어 성공" })
  if (tradeCount >= 6)                   list.push({ Icon: Zap,    iconColor: palette.yellow[400], text: "활발한 트레이더" })
  if (holdingsCount >= 3)                list.push({ Icon: Target, iconColor: palette.cyan[400],   text: "분산 투자 실천" })
  if (gapToSimilar > 0)                  list.push({ Icon: Swords, iconColor: palette.purple[400], text: "유사 AI 추월!" })
  if (list.length === 0)                 list.push({ Icon: Star,   iconColor: palette.gray[400],   text: "경험치 획득 중" })
  return list.slice(0, 3)
}
