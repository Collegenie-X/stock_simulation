export interface RankingUser {
  rank: number
  userId: string
  nickname: string
  profitRate: number
  totalAssets: number
  badges: string[]
  level: number
  style: string
  portfolio: number
  trades: number
  waveType: string
  weeklyScore?: number
  cumulativeScore?: number
  waveAccuracy?: number
  winRate?: number
  consistencyWeeks?: number
}

// 탭 타입
export type RankTab = "weekly" | "cumulative"

// 탭별 정렬 기준 점수 반환
export function getScore(user: RankingUser, tab: RankTab): number {
  return tab === "weekly" ? (user.weeklyScore ?? 0) : (user.cumulativeScore ?? 0)
}
