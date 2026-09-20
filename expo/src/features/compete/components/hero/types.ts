export interface MyProfile {
  nickname: string
  rank: number
  totalRankUsers: number
  level: number
  levelName: string
  totalAssets: number
  profitRate: number
  winRate: number
  totalTrades: number
  investmentStyle: string
  wavePatternType: string
  challengerScore: number
  badges: string[]
  shareCode: string
  aiMentors: {
    conservative: { name: string; emoji: string; label: string; profitRate: number }
    aggressive: { name: string; emoji: string; label: string; profitRate: number }
  }
}
