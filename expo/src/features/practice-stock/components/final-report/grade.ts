import { alpha, palette } from "@/theme"

// ── 등급 ─────────────────────────────────────────────────
export type FinalGrade = "S+" | "S" | "A" | "B" | "C" | "D" | "F"

export function calcFinalGrade(profitRate: number, gapToBest: number, tradeCount: number, totalDays: number): FinalGrade {
  const score =
    (profitRate >= 10 ? 40 : profitRate >= 5 ? 30 : profitRate >= 0 ? 20 : profitRate >= -5 ? 10 : 0) +
    (gapToBest >= 0 ? 30 : gapToBest >= -3 ? 20 : gapToBest >= -7 ? 10 : 0) +
    (tradeCount >= totalDays ? 20 : tradeCount >= totalDays * 0.5 ? 15 : 5) + 10
  if (score >= 90) return "S+"
  if (score >= 80) return "S"
  if (score >= 65) return "A"
  if (score >= 50) return "B"
  if (score >= 35) return "C"
  if (score >= 20) return "D"
  return "F"
}

export interface FinalGradeConfig {
  color: string
  /** 배지 배경 그라데이션 (to-br) */
  bg: readonly [string, string]
  border: string
  /** 배지 그림자 색 */
  glow: string
  emoji: string
  title: string
  subtitle: string
}

export const FINAL_GRADE_CONFIG: Record<FinalGrade, FinalGradeConfig> = {
  "S+": { color: palette.yellow[300], bg: [alpha(palette.yellow[500], 0.3), alpha(palette.amber[600], 0.2)], border: alpha(palette.yellow[400], 0.5), glow: alpha(palette.yellow[500], 0.5), emoji: "👑", title: "전설의 투자자", subtitle: "AI도 인정하는 실력!" },
  S:   { color: palette.yellow[400], bg: [alpha(palette.yellow[500], 0.2), alpha(palette.amber[600], 0.1)], border: alpha(palette.yellow[500], 0.4), glow: alpha(palette.yellow[500], 0.3), emoji: "🏆", title: "마스터 투자자", subtitle: "놀라운 성과입니다!" },
  A:   { color: palette.green[400],  bg: [alpha(palette.green[500], 0.2), alpha(palette.emerald[600], 0.1)], border: alpha(palette.green[500], 0.4),  glow: alpha(palette.green[500], 0.3),  emoji: "🌟", title: "숙련된 투자자", subtitle: "꾸준한 성장세!" },
  B:   { color: palette.blue[400],   bg: [alpha(palette.blue[500], 0.2), alpha(palette.sky[600], 0.1)],     border: alpha(palette.blue[500], 0.4),   glow: alpha(palette.blue[500], 0.3),   emoji: "💎", title: "안정적 투자자", subtitle: "기본기가 탄탄합니다" },
  C:   { color: palette.orange[400], bg: [alpha(palette.orange[500], 0.2), alpha(palette.amber[600], 0.1)], border: alpha(palette.orange[500], 0.4), glow: alpha(palette.orange[500], 0.3), emoji: "📈", title: "성장하는 투자자", subtitle: "경험이 쌓이고 있어요" },
  D:   { color: palette.red[400],    bg: [alpha(palette.red[500], 0.2), alpha(palette.rose[600], 0.1)],     border: alpha(palette.red[500], 0.4),    glow: alpha(palette.red[500], 0.3),    emoji: "🔥", title: "도전적 투자자", subtitle: "실패도 경험입니다!" },
  F:   { color: palette.gray[400],   bg: [alpha(palette.gray[600], 0.2), alpha(palette.gray[700], 0.1)],    border: alpha(palette.gray[500], 0.4),   glow: alpha(palette.gray[500], 0.2),   emoji: "💪", title: "초보 투자자", subtitle: "다시 도전해 보세요!" },
}
