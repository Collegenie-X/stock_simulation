// ============================================================
// 게임 설정 상수
// ============================================================
export const EXCHANGE_RATE = 1300
export const DECISIONS_PER_DAY = 3
export const DECISION_TIMER_SECONDS = 30
export const DAYS_PER_WEEK = 7
export const TURNS_PER_DECISION = 1
export const AI_REPORT_INTERVAL = 3

export const DAY_PHASES = ["☀️ 오전", "🍚 점심", "🌙 저녁"] as const
export const DAY_NAMES = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"] as const

// ============================================================
// UI 라벨 (한국어)
// ============================================================
export const LABELS = {
  // 주식 섹션
  sections: {
    myStocks: "💼 내 주식",
    watchlist: "❤️ 관심 주식",
    allStocks: "📊 전체 주식",
  },

  // 뷰 탭
  viewTabs: {
    currentPrice: "현재가",
    valuation: "평가금",
  },

  // 액션 버튼
  actions: {
    buy: "구매하기",
    sell: "판매하기",
    skip: "다음 시간으로",
    exit: "종료",
    pause: "일시정지",
    play: "재생",
    nextWeek: "다음 주차 시작하기",
    backToHome: "홈으로 돌아가기",
    continuePlay: "계속 플레이",
    endGame: "게임 종료",
  },

  // 타이머 영역
  timer: {
    label: "⚡ 자유 거래 타임",
    unit: "초",
    decisionsUnit: "결정",
  },

  // 게임 종료 확인
  exitConfirm: {
    title: "게임을 정말 끝낼까요?",
    description: "지금까지의 진행 상황은 저장됩니다.",
    cancel: "계속 플레이",
    confirm: "게임 종료",
  },

  // 헤더 정보
  header: {
    totalAsset: "총 자산",
    profitRate: "수익률",
    dayLabel: "일차",
    weekLabel: "주차",
    bestAILabel: "최고 AI",
    similarAILabel: "유사 AI",
    gapLabel: "갭",
  },

  // 주식 상세 정보
  stockDetail: {
    myStockInfo: "내 주식",
    evalProfit: "평가손익",
    profitRate: "수익률",
    evalAmount: "현재 평가금액",
    avgBuyPrice: "평균 매입가",
    currentPrice: "현재가",
    pendingOrders: "미체결 주문",
    cancelOrder: "취소",
    // 내 주식 카드
    avgCalcButton: "물타기 계산기",
    avgPerShare: "1주 평균",
    holdingQty: "보유 수량",
    totalAmount: "총 금액",
    feeTaxIncluded: "수수료·세금 포함",
    tradingFee: "거래 수수료",
    feeEstimate: "0원 예상",
    sellTax: "팔 때 낼 세금",
  },

  // 일일 요약
  daySummary: {
    dayEnd: "일차 종료",
    totalAsset: "총 자산",
    profitRate: "수익률",
    tradeVolume: "거래량",
    profitAmount: "수익금",
    movingToNext: "다음 날로 이동 중...",
    analysisTitle: "📝 오늘의 분석",
    gapAnalysisTitle: "📊 AI 갭 분석",
    waveAnalysisTitle: "🌊 파도 흐름 분석",
    bestAILabel: "최고 AI",
    similarAILabel: "성향 유사 AI",
    gapToBestLabel: "최고 AI 대비",
    gapToSimilarLabel: "유사 AI 대비",
    gapTrendLabel: "갭 추이 (최근 7일)",
  },

  // AI 갭 피드백 (매수/매도 즉시)
  aiGapFeedback: {
    title: "AI 갭 현황",
    hideLabel: "숨기기",
    showLabel: "AI 갭 보기",
    bestAIGap: "최고 AI 대비",
    similarAIGap: "유사 AI 대비",
    waveAccuracy: "파도 읽기",
    followTip: "AI 따라하기 연습",
  },

  // 로딩
  loading: {
    title: "게임 로딩 중...",
  },

  // 게임 결과
  result: {
    title: "게임 종료!",
    finalReturn: "최종 수익률",
  },

  // 수익 분석
  profitAnalysis: {
    title: "수익 분석",
    periods: ["일", "주", "월"] as const,
    realizedProfit: "실현수익",
    sellProfit: "판매수익",
    totalTrades: "총 거래",
    buyCount: "매수",
    sellCount: "매도",
    profitLabel: "수익",
    lossLabel: "손실",
    noTradeHistory: "거래 내역이 없습니다",
    tradeRatioTitle: "종목별 거래 비율",
    tradeHistoryTitle: "거래 내역",
    dailyViewLabel: "일별",
    weeklyViewLabel: "주별",
    monthlyViewLabel: "월별",
    prevPeriodLabel: "이전",
    nextPeriodLabel: "다음",
  },

  // 주간 리포트
  weeklyReport: {
    title: "주간 리포트",
    weekLabel: "주차 투자 분석",
    weeklyReturn: "주간 수익률",
    totalReturn: "누적 수익률",
    chartTitle: "자산 흐름도",
  },

  // 차트 기간
  chartPeriods: ["1일", "1주", "3달", "1년"] as const,
  stockDetailTabs: ["차트", "호가", "내 주식", "종목정보", "커뮤니티"] as const,

  // 미니 게임 리포트 (3일 간격)
  miniReport: {
    periodTitle: "{day}일차 중간 리포트",
    myResult: "내 투자 성적",
    bestAI: "최고 AI",
    gapSimilar: "유사 AI 대비",
    gapBest: "최고 AI 대비",
    achievementsTitle: "🏅 획득 업적",
    continueButton: "확인 완료 — 다음 날 시작",
    // 탭
    tabSummary: "종합",
    tabTrades: "거래 내역",
    tabHoldings: "보유 종목",
    // 종합 탭
    totalTrades: "총 거래",
    buyLabel: "매수",
    sellLabel: "매도",
    winRateLabel: "승률",
    realizedProfit: "실현 수익",
    unrealizedProfit: "평가 손익",
    profitTradesLabel: "수익",
    lossTradesLabel: "손실",
    holdingStocksUnit: "종목 보유 중",
    // 거래 내역 탭
    totalBuyAmount: "총 매수 금액",
    totalSellAmount: "총 매도 금액",
    tradeListTitle: "거래 내역서",
    noTrades: "아직 거래 내역이 없습니다",
    // 보유 종목 탭
    cashLabel: "보유 현금",
    stockValueLabel: "주식 평가액",
    holdingListTitle: "보유 종목 상세",
    noHoldings: "보유 중인 종목이 없습니다",
    totalUnrealizedLabel: "총 평가 손익",
    holdingStocks: "보유 종목",
    totalAsset: "총 자산",
  },

  // 최종 게임 리포트 (게임 종료)
  finalReport: {
    gameComplete: "🎮 게임 완료!",
    gradeLabel: "등급",
    finalReturn: "최종 수익률",
    tabOverview: "종합",
    tabStocks: "주식 상세",
    tabTrades: "거래",
    tabAI: "AI 대결",
    totalDays: "플레이 일수",
    totalTrades: "총 거래",
    winRate: "매도 승률",
    holdingStocks: "보유 종목",
    achievementsTitle: "🏆 획득 업적",
    bestTrade: "최고의 거래",
    worstTrade: "아쉬운 거래",
    buyCount: "매수",
    sellCount: "매도",
    realizedProfit: "실현 수익",
    recentTrades: "최근 거래 내역",
    noTrades: "거래 내역이 없습니다",
    bestAI: "최고 AI",
    gapSimilar: "유사 AI 대비",
    gapBest: "최고 AI 대비",
    rankingTitle: "🏅 최종 순위",
    playAgain: "다시 도전하기",
    goHome: "홈으로 돌아가기",
    // 주식 상세 탭
    stockDetailTitle: "종목별 분석",
    stockDetailEmpty: "종목 상세 데이터가 없습니다",
    waveAnalysisLabel: "파도 분석",
    improvementLabel: "개선 포인트",
    myTradesLabel: "내 거래 내역",
    aiCompareLabel: "AI 거래 비교",
    priceChartLabel: "가격 흐름 + 거래 마커",
  },
} as const

// ============================================================
// 디버그 모드 설정
// ============================================================
// true → 하단 "3일차 리포트 / 최종 보고서" 버튼 노출
// false → 실제 서비스 모드 (버튼 숨김)
export const DEBUG_BUTTONS = true

// ============================================================
// 속도 모드별 필요 턴 수
// ============================================================
export const SPEED_MODE_TURNS: Record<string, number> = {
  sprint: 30,
  standard: 100,
  marathon: 200,
  default: 100,
}

// ============================================================
// 차트 기간 매핑
// ============================================================
export const CHART_PERIOD_MAP: Record<string, string> = {
  "1일": "1D",
  "1주": "1W",
  "3달": "1M",
  "1년": "1Y",
}
