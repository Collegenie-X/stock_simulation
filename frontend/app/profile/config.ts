// ============================================================
// 프로필(MY) 페이지 설정 및 라벨
// MY 페이지 = 나의 관리자 페이지
// - 횟수/현황 위주의 간단 조회
// - 세부 히스토리는 각 세션 페이지로 이동
// ============================================================

export const PROFILE_LABELS = {
  pageTitle: "MY",

  hero: {
    levelUnit: "레벨",
    toNextLevel: "다음 레벨까지",
    xpUnit: "XP",
    editProfile: "프로필 편집",
  },

  activityCount: {
    title: "나의 활동 현황",
    items: [
      { key: "simulations",   icon: "🎮", label: "시뮬레이션",  unit: "회" },
      { key: "stockPractice", icon: "📈", label: "종목 연습",   unit: "회" },
      { key: "wavePractice",  icon: "🌊", label: "파동 연습",   unit: "회" },
      { key: "learnChapters", icon: "📚", label: "완료 강의",   unit: "강" },
      { key: "totalTrades",   icon: "💱", label: "총 거래",     unit: "회" },
      { key: "achievements",  icon: "🏆", label: "획득 업적",   unit: "개" },
    ],
  },

  myStats: {
    title: "나의 현재 성적",
    profitRate:  "누적 수익률",
    winRate:     "승률",
    rank:        "현재 순위",
    rankUnit:    "위",
    bestRank:    "최고 순위",
    totalAssets: "현재 자산",
  },

  navMenu: {
    title: "관리",
    items: [
      { key: "simulation",    icon: "🎮", label: "시뮬레이션 기록",  desc: "회차별 결과 조회",  href: "/compete" },
      { key: "practice",      icon: "📊", label: "연습 기록",        desc: "종목·파동 연습 조회", href: "/practice" },
      { key: "learn",         icon: "📚", label: "학습 진도",        desc: "강의 완료 현황",    href: "/learn" },
      { key: "achievements",  icon: "🏆", label: "업적",             desc: "획득한 뱃지 모음",  href: "#" },
      { key: "rewards",       icon: "🎁", label: "보상함",           desc: "미수령 보상 확인",  href: "#", badge: "3" },
      { key: "settings",      icon: "⚙️", label: "설정",             desc: "알림·계정 관리",   href: "#" },
    ],
  },

  investmentStyle: {
    title: "나의 투자 성향",
  },

  personalInfo: {
    title: "개인 정보",
    userId:    "아이디",
    password:  "비밀번호",
    email:     "이메일",
    phone:     "휴대폰",
    joinDate:  "가입일",
    lastLogin: "최근 로그인",
    passwordMask: "••••••••",
    editBtn:   "변경",
    withdrawBtn: "회원 탈퇴",
    withdrawDesc: "탈퇴 시 모든 데이터가 삭제됩니다",
  },

  logout: "로그아웃",
} as const

// ============================================================
// 레벨 정의
// ============================================================
export const LEVEL_NAMES: Record<number, string> = {
  1: "입문 투자자",
  2: "초급 투자자",
  3: "중급 투자자",
  4: "고급 투자자",
  5: "전문 투자자",
}

export const LEVEL_EXP: Record<number, number> = {
  1: 500,
  2: 1000,
  3: 2000,
  4: 4000,
  5: 8000,
}

// ============================================================
// 업적 목록
// ============================================================
export const ACHIEVEMENTS = [
  { id: 1, name: "첫 거래 완료",   icon: "✅", unlocked: true  },
  { id: 2, name: "10거래 달성",    icon: "🎯", unlocked: true  },
  { id: 3, name: "TOP 100 진입",   icon: "🏆", unlocked: true  },
  { id: 4, name: "파도 초보자",    icon: "🌊", unlocked: true  },
  { id: 5, name: "100거래 달성",   icon: "💯", unlocked: false },
  { id: 6, name: "TOP 10 진입",    icon: "👑", unlocked: false },
] as const
