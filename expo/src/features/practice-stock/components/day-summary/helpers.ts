import { alpha, palette } from "@/theme"
import type { InvestStyle, WaveAnalysis } from "@/features/practice-stock/hooks/useAICompetitor"

// ── 스타일 라벨 ────────────────────────────────────────────
export const STYLE_LABELS: Record<InvestStyle, { label: string; color: string; bg: string }> = {
  conservative: { label: "안정형", color: palette.blue[400], bg: alpha(palette.blue[500], 0.2) },
  stable: { label: "신중형", color: palette.cyan[400], bg: alpha(palette.cyan[500], 0.2) },
  balanced: { label: "균형형", color: palette.green[400], bg: alpha(palette.green[500], 0.2) },
  aggressive: { label: "공격형", color: palette.orange[400], bg: alpha(palette.orange[500], 0.2) },
  ultra_aggressive: { label: "초공격형", color: palette.red[400], bg: alpha(palette.red[500], 0.2) },
}

// ── 분석 코멘트 생성 ───────────────────────────────────────
export function generateBattleComment(
  userRate: number,
  aiRate: number,
  aiName: string,
): string {
  const diff = userRate - aiRate
  if (diff > 3) return `${aiName}을(를) 크게 앞서고 있습니다! 현재 전략을 유지하세요.`
  if (diff > 0) return `${aiName}보다 소폭 앞서고 있습니다. 방심은 금물!`
  if (diff === 0) return `${aiName}와(과) 동률입니다. 다음 결정이 중요합니다!`
  if (diff > -3) return `${aiName}에게 근소하게 뒤지고 있습니다. 역전 기회를 노리세요!`
  return `${aiName}에게 많이 뒤지고 있습니다. 전략 수정이 필요할 수 있습니다.`
}

export function generateTip(aiStyle: InvestStyle, userRate: number): string {
  if (aiStyle === "conservative") {
    return userRate < 0
      ? "AI처럼 보수적으로 손실을 최소화해 보세요."
      : "AI보다 더 공격적으로 수익을 노려보세요."
  }
  if (aiStyle === "aggressive" || aiStyle === "ultra_aggressive") {
    return userRate < 0
      ? "AI의 공격적 전략은 변동성이 큽니다. 리스크 관리가 핵심!"
      : "좋은 흐름! 이익 실현 타이밍도 놓치지 마세요."
  }
  return "균형 잡힌 접근이 장기적으로 유리합니다."
}

export function generateWaveComment(wave: WaveAnalysis, gapToBest: number): string {
  const accuracyLabel = wave.accuracy >= 70 ? "잘 읽고 있습니다" : wave.accuracy >= 50 ? "보통 수준입니다" : "연습이 필요합니다"
  const gapLabel = gapToBest >= 0 ? `최고 AI보다 ${Math.abs(gapToBest).toFixed(1)}%p 앞서고 있어요` : `최고 AI보다 ${Math.abs(gapToBest).toFixed(1)}%p 뒤처져 있어요`
  return `${wave.trend} 파도 (강도 ${wave.strength}%) - 파도 읽기 정확도 ${wave.accuracy}%, ${accuracyLabel}. ${gapLabel}.`
}

/** 상승=빨강 / 하락=파랑 */
export const rateColor = (isProfit: boolean) => (isProfit ? palette.red[400] : palette.blue[400])
