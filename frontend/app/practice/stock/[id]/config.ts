// ============================================================
// 게임 설정 상수
// ============================================================
export const EXCHANGE_RATE = 1300
export const DECISIONS_PER_DAY = 3
export const DECISION_TIMER_SECONDS = 30
export const DAYS_PER_WEEK = 7
export const TURNS_PER_DECISION = 1

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
  },

  // 주식 상세 정보
  stockDetail: {
    myStockInfo: "내 주식 정보",
    evalProfit: "평가손익",
    profitRate: "수익률",
    evalAmount: "현재 평가금액",
    avgBuyPrice: "평균 매입가",
    currentPrice: "현재가",
    pendingOrders: "미체결 주문",
    cancelOrder: "취소",
  },

  // 일일 요약
  daySummary: {
    dayEnd: "일차 종료",
    totalAsset: "총 자산",
    profitRate: "수익률",
    movingToNext: "다음 날로 이동 중...",
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
    title: "양도소득세",
    tabs: ["자산", "수익분석"],
    periods: ["일", "주", "월", "년", "전체"],
    realizedProfit: "실현수익",
    sellProfit: "판매수익",
    dividend: "배당금",
    rentalFee: "대여료",
    bondInterest: "채권 이자·만기수익",
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
} as const

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
