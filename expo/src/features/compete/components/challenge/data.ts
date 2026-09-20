export interface ChallengeDetail {
  id: string
  title: string
  icon: string
  description: string
  difficulty: string
  reward: { xp: number; coins: number; badge: string }
  requirements: string[]
  participants: number
  completionRate: number
  timeLimit: string
  tips: string[]
}

// 도전 과제 더미 데이터
export const challenges: Record<string, ChallengeDetail> = {
  "1": {
    id: "1",
    title: "3종목 분산 투자",
    icon: "🎯",
    description: "서로 다른 업종의 주식 3개를 골라서 투자해보세요. 계란을 한 바구니에 담지 마세요!",
    difficulty: "쉬움",
    reward: {
      xp: 100,
      coins: 5000,
      badge: "분산왕",
    },
    requirements: ["최소 3개의 다른 업종 선택", "각 종목에 최소 10% 이상 투자", "24시간 안에 완료"],
    participants: 1247,
    completionRate: 78,
    timeLimit: "24시간",
    tips: ["IT, 금융, 바이오처럼 전혀 다른 업종을 선택하세요", "한 업종이 떨어져도 다른 업종이 올라갈 수 있어요", "균형있게 나누는 것이 중요해요"],
  },
  "2": {
    id: "2",
    title: "수익률 +5% 달성",
    icon: "📈",
    description: "파도를 잘 타서 5% 수익을 만들어보세요. 큰 파도에 올라타는 타이밍이 중요해요!",
    difficulty: "보통",
    reward: {
      xp: 200,
      coins: 10000,
      badge: "서퍼",
    },
    requirements: ["수익률 +5% 이상 달성", "최소 3번 이상 거래", "48시간 안에 완료"],
    participants: 892,
    completionRate: 45,
    timeLimit: "48시간",
    tips: ["파도가 올라가는 시작점에서 매수하세요", "너무 욕심내지 말고 5%면 충분해요", "파도가 꺾이기 전에 내려오세요"],
  },
}
