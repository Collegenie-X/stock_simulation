// ============================================================
// 경쟁 페이지 설정 및 라벨
// ============================================================

export const COMPETE_LABELS = {
  pageTitle: "도전",

  hero: {
    challengerSpirit: "도전자 정신",
    myRank: "내 순위",
    rankUnit: "위",
    totalUsers: "명 중",
    topPercent: "상위",
    shareBtn: "📤 랭킹 공유",
    challengerScore: "도전자 점수",
    challengerScoreDesc: "공격적일수록 점수 상승",
    vsAI: "AI 멘토와 비교",
    aiBeaten: "추월 성공!",
    aiBehind: "차이 극복 중",
    levelLabel: "레벨",
    winRate: "승률",
    totalTrades: "총 거래",
    bestRank: "최고 순위",
    shareTitle: "내 랭킹 공유하기",
    shareDesc: "친구들에게 나의 투자 실력을 증명하세요!",
    shareCode: "공유 코드",
    copyCode: "코드 복사",
    copyLink: "링크 복사",
  },

  pattern: {
    title: "나의 투자 DNA",
    subtitle: "나만의 파도 타기 패턴",
    wavePattern: "파도 패턴",
    investmentStyle: "투자 성향",
    favoriteStocks: "관심 종목 TOP 5",
    waveStats: {
      wave1: "1파 포착률",
      wave3: "3파 집중도",
      wave5: "5파 탈출",
      correction: "조정 대응",
    },
    avgHoldDays: "평균 보유일",
    days: "일",
    bestWave: "주력 파동",
    weakPoint: "보완 포인트",
    tradeCount: "거래 횟수",
    avgReturn: "평균 수익률",
    totalProfit: "누적 수익",
  },

  history: {
    title: "나의 역대 기록",
    subtitle: "투자 패턴 히스토리 & 실험실",
    rankLabel: "순위",
    profitLabel: "수익률",
    waveAccuracy: "파도 정확도",
    tradeCount: "거래 수",
    result: {
      profit: "수익",
      loss: "손실",
    },
    experimentBadge: "실험",
    percentileLabel: "상위",
    rankTrendTitle: "순위 변화 추이",
    viewAll: "전체 보기",
  },

  leaderboard: {
    title: "주간 리더보드",
    filterAll: "전체 단계",
    filterLabels: [
      "전체",
      "1단계 (500만원)",
      "2단계 (1,000만원)",
      "3단계 (5,000만원)",
      "4단계 (1억원)",
      "5단계 (5억원)",
      "6단계 (10억원)",
    ],
    peekStrategy: "👁️ 투자 전략 엿보기",
    peekCost: "사용권 2개",
    portfolio: "포트폴리오",
    strategy: "전략",
    trades: "거래",
    waveType: "파동 유형",
  },

  challenge: {
    title: "주간 챌린지",
    timeRemaining: "남은 시간",
    participants: "명 참가",
    challengeBtn: "도전",
    reward: "보상",
    progress: "진행",
    difficulty: "난이도",
    items: [
      {
        id: "1",
        emoji: "🌅",
        title: "조건부 주문 마스터",
        desc: "아침 타임에 완벽한 주문 설정",
        reward: "200XP + 사용권 2개",
        progress: "3/5일",
        active: true,
      },
      {
        id: "2",
        emoji: "🤖",
        title: "AI 멘토 추월하기",
        desc: "김철수 또는 박영희 수익률 넘기",
        reward: "300XP + 특별 칭호",
        difficulty: "⭐⭐⭐⭐",
        active: false,
      },
      {
        id: "3",
        emoji: "🌊",
        title: "5턴 시나리오 완주",
        desc: "3개 시나리오 모두 4성 이상",
        reward: "500XP + 레벨업",
        progress: "1/3 완료",
        active: false,
      },
    ],
  },

  stats: {
    title: "📊 실시간 통계",
    participants: "참가자",
    avgReturn: "평균 수익률",
    levelDistribution: "단계별 분포",
    todayNew: "오늘",
    weeklyAvg: "주간 평균",
    levelUnit: "명",
  },
} as const

// ============================================================
// 투자 성향 정의
// ============================================================
export const INVESTMENT_STYLES: Record<
  string,
  { label: string; emoji: string; gradientFrom: string; gradientTo: string; desc: string; bgClass: string }
> = {
  aggressive: {
    label: "공격형",
    emoji: "⚡",
    gradientFrom: "#ef4444",
    gradientTo: "#f97316",
    desc: "고위험 고수익 추구",
    bgClass: "from-red-500 to-orange-500",
  },
  moderate: {
    label: "균형형",
    emoji: "⚖️",
    gradientFrom: "#3b82f6",
    gradientTo: "#8b5cf6",
    desc: "위험과 수익의 균형",
    bgClass: "from-blue-500 to-purple-500",
  },
  conservative: {
    label: "안정형",
    emoji: "🛡️",
    gradientFrom: "#10b981",
    gradientTo: "#14b8a6",
    desc: "안정적 수익 우선",
    bgClass: "from-green-500 to-teal-500",
  },
}

// ============================================================
// 파동 패턴 유형
// ============================================================
export const WAVE_PATTERN_TYPES: Record<
  string,
  { label: string; emoji: string; desc: string; color: string }
> = {
  wave3Focus: {
    label: "3파 집중형",
    emoji: "🌊",
    desc: "상승 3파에서 최대 수익",
    color: "text-cyan-400",
  },
  earlyEntry: {
    label: "선점형",
    emoji: "🚀",
    desc: "1파 초기 진입 전문",
    color: "text-yellow-400",
  },
  topCapture: {
    label: "꼭대기형",
    emoji: "🏔️",
    desc: "5파 고점에서 탈출",
    color: "text-orange-400",
  },
  correction: {
    label: "조정파 활용형",
    emoji: "📉",
    desc: "2/4파 조정 저가 매수",
    color: "text-purple-400",
  },
}

// ============================================================
// 메달 및 순위 관련
// ============================================================
export const RANK_MEDALS = ["🥇", "🥈", "🥉"] as const

export const RANK_GRADIENTS: Record<number, string> = {
  0: "from-yellow-500 to-yellow-600",
  1: "from-gray-400 to-gray-500",
  2: "from-orange-500 to-orange-600",
}
