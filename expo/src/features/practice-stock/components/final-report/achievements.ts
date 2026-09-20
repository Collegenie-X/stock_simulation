import { Crown, Flame, PieChart, Shield, Star, Swords, Target, TrendingUp, Zap, type LucideIcon } from "lucide-react-native"
import { alpha, palette } from "@/theme"

export type AchievementRarity = "common" | "rare" | "epic" | "legendary"

export interface FinalAchievement {
  /** 웹은 ReactNode 아이콘 — 앱에서는 rarity 색을 입히기 위해 컴포넌트 타입으로 보관 */
  Icon: LucideIcon
  text: string
  rarity: AchievementRarity
}

// ── 업적 ─────────────────────────────────────────────────
export function buildAchievements(
  profitRate: number, tradeCount: number, holdingsCount: number,
  gapToSimilar: number, gapToBest: number, totalDays: number, winRate: number,
): FinalAchievement[] {
  const list: FinalAchievement[] = []
  if (gapToBest >= 0)          list.push({ Icon: Crown,      text: "최고 AI 격파!",    rarity: "legendary" })
  if (profitRate >= 10)        list.push({ Icon: Flame,      text: "수익률 10% 돌파",  rarity: "epic" })
  else if (profitRate >= 5)    list.push({ Icon: TrendingUp, text: "수익률 5% 달성",   rarity: "rare" })
  if (gapToSimilar > 0)        list.push({ Icon: Swords,     text: "유사 AI 승리",     rarity: "rare" })
  if (tradeCount >= totalDays * 2) list.push({ Icon: Zap,    text: "적극적 트레이더",  rarity: "common" })
  if (holdingsCount >= 5)      list.push({ Icon: PieChart,   text: "분산 투자 마스터", rarity: "rare" })
  if (profitRate >= 0)         list.push({ Icon: Shield,     text: "원금 수호자",      rarity: "common" })
  if (winRate >= 70)           list.push({ Icon: Target,     text: "높은 승률 달성",   rarity: "epic" })
  if (list.length === 0)       list.push({ Icon: Star,       text: "첫 게임 완료!",    rarity: "common" })
  return list.slice(0, 5)
}

export const RARITY_STYLE: Record<AchievementRarity, { bg: string; border: string; text: string }> = {
  common:    { bg: alpha(palette.gray[700], 0.3),    border: alpha(palette.gray[600], 0.3),    text: palette.gray[300] },
  rare:      { bg: alpha(palette.blue[500], 0.1),    border: alpha(palette.blue[500], 0.2),    text: palette.blue[400] },
  epic:      { bg: alpha(palette.purple[500], 0.1),  border: alpha(palette.purple[500], 0.2),  text: palette.purple[400] },
  legendary: { bg: alpha(palette.yellow[500], 0.1),  border: alpha(palette.yellow[500], 0.2),  text: palette.yellow[400] },
}
