// ============================================================
// 랭킹 규칙 정의
// ============================================================

/**
 * 랭킹 반영 기준
 *
 * [반영 O] 실전 시뮬레이션
 *   - 모든 참여자가 동일 시나리오를 플레이 → 공정한 상대 비교 가능
 *   - 주간 랭킹: 해당 주 시나리오 1회 결과 기준
 *   - 누적 랭킹: 최근 4주 도전자 점수 평균
 *
 * [반영 X] 한종목 연습 / 파도 연습
 *   - 개인 학습 목적, 시나리오·난이도가 제각각 → 비교 불공정
 *   - 점수/등급은 개인 성장 지표로만 활용
 *
 * 도전자 점수 산정 공식 (0~100점):
 *   수익률 백분위  × 0.50  (해당 주 참여자 중 상위 몇 %)
 *   파도 정확도    × 0.25  (매매 타이밍이 엘리엇 파동 기준에 맞는 비율)
 *   승률           × 0.15  (수익 거래 / 전체 거래)
 *   일관성 보너스  × 0.10  (연속 참여 주수: 3주+5점, 5주+10점)
 */
export const RANKING_RULES = {
  // 랭킹에 반영되는 게임 유형
  rankedGameType: 'simulation' as const,

  // 도전자 점수 가중치
  scoreWeights: {
    profitPercentile: 0.50,
    waveAccuracy: 0.25,
    winRate: 0.15,
    consistency: 0.10,
  },

  // 일관성 보너스 (연속 참여 주수 → 추가 점수)
  consistencyBonus: [
    { weeks: 3, bonus: 5 },
    { weeks: 5, bonus: 10 },
  ],

  // 랭킹 탭 종류
  rankTabs: [
    { id: 'weekly', label: '주간 랭킹', desc: '이번 주 시나리오 결과' },
    { id: 'cumulative', label: '누적 랭킹', desc: '최근 4주 평균 점수' },
  ] as const,

  // 랭킹 안내 문구
  notice: {
    ranked: '실전 시뮬레이션만 글로벌 랭킹에 반영됩니다.',
    notRanked: '한종목·파도 연습은 개인 성장 지표 전용입니다.',
    scoreFormula: '도전자 점수 = 수익률(50%) + 파도정확도(25%) + 승률(15%) + 일관성(10%)',
    weeklyDesc: '매주 같은 시나리오를 플레이한 참여자끼리 공정하게 비교합니다.',
  },
} as const

/**
 * 도전자 점수 계산 함수
 * @param profitPercentile  수익률 상위 백분위 (0~100)
 * @param waveAccuracy      파도 정확도 (0~100)
 * @param winRate           승률 (0~100)
 * @param consistencyWeeks  연속 참여 주수
 */
export function calcChallengerScore(
  profitPercentile: number,
  waveAccuracy: number,
  winRate: number,
  consistencyWeeks: number,
): number {
  const { scoreWeights, consistencyBonus } = RANKING_RULES
  const bonus = consistencyBonus
    .filter((b) => consistencyWeeks >= b.weeks)
    .reduce((max, b) => Math.max(max, b.bonus), 0)

  const base =
    profitPercentile * scoreWeights.profitPercentile +
    waveAccuracy * scoreWeights.waveAccuracy +
    winRate * scoreWeights.winRate

  return Math.min(100, Math.round(base + bonus * scoreWeights.consistency * 10))
}

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
    title: "리더보드",
    weeklyTab: "주간 랭킹",
    cumulativeTab: "누적 랭킹",
    weeklyDesc: "이번 주 시나리오 결과",
    cumulativeDesc: "최근 4주 평균 점수",
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
    scoreLabel: "도전자 점수",
    rankBasis: "실전 시뮬레이션 기준",
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
