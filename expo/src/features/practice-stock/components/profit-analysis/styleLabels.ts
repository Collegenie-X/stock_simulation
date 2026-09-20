import { alpha, palette } from "@/theme"

/** AI 투자 성향 라벨 (웹 STYLE_LABELS 의 Tailwind 클래스를 색상 값으로 옮긴 것) */
export const STYLE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  conservative: { label: "안정형", color: palette.blue[400], bg: alpha(palette.blue[500], 0.2) },
  stable: { label: "신중형", color: palette.cyan[400], bg: alpha(palette.cyan[500], 0.2) },
  balanced: { label: "균형형", color: palette.green[400], bg: alpha(palette.green[500], 0.2) },
  aggressive: { label: "공격형", color: palette.orange[400], bg: alpha(palette.orange[500], 0.2) },
  ultra_aggressive: { label: "초공격형", color: palette.red[400], bg: alpha(palette.red[500], 0.2) },
}
