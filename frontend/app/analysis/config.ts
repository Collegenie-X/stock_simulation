import type { AbilityKey, AssessmentMode, PersonalityType } from "./types";

export const PERSONALITY_META: Record<
  PersonalityType,
  {
    emoji: string;
    label: string;
    desc: string;
    accent: string;
    border: string;
    bg: string;
    text: string;
    glow: string;
    tips: string[];
  }
> = {
  analyst: {
    emoji: "📊",
    label: "분석가형",
    desc: "숫자와 데이터 앞에선 감정 따위 없어! 차트가 말해주는 대로 움직이는 냉철한 투자자야.",
    accent: "from-blue-500 to-cyan-500",
    border: "border-blue-500/60",
    bg: "bg-blue-500/10",
    text: "text-blue-300",
    glow: "shadow-[0_0_24px_rgba(59,130,246,0.35)]",
    tips: [
      "차트 패턴 학습을 더 깊이 해봐! 네 최고의 무기가 될 거야",
      "가끔은 직감도 믿어봐~ 데이터 + 감각 = 최강 조합이거든",
    ],
  },
  challenger: {
    emoji: "⚡",
    label: "도전가형",
    desc: "기회가 보이면 바로 달려드는 타입! 높은 리스크 = 높은 리턴을 본능적으로 알고 있어.",
    accent: "from-orange-500 to-red-500",
    border: "border-orange-500/60",
    bg: "bg-orange-500/10",
    text: "text-orange-300",
    glow: "shadow-[0_0_24px_rgba(249,115,22,0.35)]",
    tips: [
      "그 추진력 대단해! 근데 손절 라인은 꼭 지키자~",
      "감정에 휘둘리기 전에 3초만 멈추는 습관을 길러봐",
    ],
  },
  conservative: {
    emoji: "🛡️",
    label: "안정추구형",
    desc: "원금이 제일 중요해! 리스크는 최소화하고 안전하게 가는 게 진짜 투자야.",
    accent: "from-green-500 to-emerald-500",
    border: "border-green-500/60",
    bg: "bg-green-500/10",
    text: "text-green-300",
    glow: "shadow-[0_0_24px_rgba(34,197,94,0.35)]",
    tips: [
      "배당주와 우량주 중심 투자가 딱 맞아!",
      "조금씩 리스크 허용 범위를 넓혀보는 것도 도전해봐~",
    ],
  },
  emotional: {
    emoji: "🎭",
    label: "감성투자형",
    desc: "직관과 감정으로 시장을 느끼는 타입! 감각적 판단이 때로는 엄청난 위력을 발휘해.",
    accent: "from-purple-500 to-violet-500",
    border: "border-purple-500/60",
    bg: "bg-purple-500/10",
    text: "text-purple-300",
    glow: "shadow-[0_0_24px_rgba(168,85,247,0.35)]",
    tips: [
      "그 감각을 데이터로 검증하는 습관만 들이면 무적이야!",
      "감정이 흔들릴 때는 미리 정한 원칙을 떠올려봐~",
    ],
  },
  systematic: {
    emoji: "🧘",
    label: "침착형",
    desc: "원칙이 있으니까 무서울 게 없어! 일관된 전략으로 꾸준히 이기는 진짜 고수야.",
    accent: "from-cyan-500 to-teal-500",
    border: "border-cyan-500/60",
    bg: "bg-cyan-500/10",
    text: "text-cyan-300",
    glow: "shadow-[0_0_24px_rgba(6,182,212,0.35)]",
    tips: [
      "감정 없는 일관된 전략이 네 최고의 강점이야!",
      "가끔은 유연하게 새로운 기회도 잡아보는 건 어때?",
    ],
  },
};

export const ABILITY_META: Record<
  AbilityKey,
  { label: string; emoji: string; bar: string }
> = {
  riskTolerance: { label: "리스크 감수", emoji: "🎲", bar: "bg-gradient-to-r from-red-500 to-orange-500" },
  analysis: { label: "분석력", emoji: "📊", bar: "bg-gradient-to-r from-blue-500 to-cyan-500" },
  emotionControl: { label: "감정 통제", emoji: "🧘", bar: "bg-gradient-to-r from-green-500 to-emerald-500" },
  coping: { label: "대처 능력", emoji: "⚡", bar: "bg-gradient-to-r from-yellow-500 to-amber-500" },
  infoJudgment: { label: "정보 판별", emoji: "🔍", bar: "bg-gradient-to-r from-purple-500 to-violet-500" },
};

export const CHART_VARIANTS: number[][] = [
  [30, 35, 33, 40, 38, 45, 50, 55, 52, 60, 65, 70, 68, 75, 80, 85],
  [85, 82, 80, 75, 70, 65, 60, 55, 58, 52, 48, 45, 40, 38, 35, 30],
  [70, 65, 60, 55, 50, 45, 40, 38, 42, 45, 43, 40, 38, 35, 32, 30],
  [75, 72, 70, 68, 50, 48, 50, 52, 50, 52, 54, 52, 55, 53, 55, 57],
  [20, 25, 23, 28, 30, 35, 33, 38, 40, 42, 45, 48, 47, 52, 55, 58],
];

export const CHART_COLORS: Record<
  string,
  { stroke: string; fill1: string; fill2: string; dot: string }
> = {
  green: { stroke: "#22c55e", fill1: "rgba(34,197,94,0.25)", fill2: "rgba(34,197,94,0)", dot: "rgba(34,197,94,0.8)" },
  red: { stroke: "#ef4444", fill1: "rgba(239,68,68,0.2)", fill2: "rgba(239,68,68,0)", dot: "rgba(239,68,68,0.8)" },
  yellow: { stroke: "#eab308", fill1: "rgba(234,179,8,0.2)", fill2: "rgba(234,179,8,0)", dot: "rgba(234,179,8,0.8)" },
  cyan: { stroke: "#06b6d4", fill1: "rgba(6,182,212,0.2)", fill2: "rgba(6,182,212,0)", dot: "rgba(6,182,212,0.8)" },
};

// 간략 측정에 포함할 핵심 문항 ID (5 theory + 2 chart = 7문항)
// Q1: 첫 매수 감정, Q2: 손실 감정, Q4: 투자 판단 기준, Q7: 수익 달성, Q8: 뉴스 반응
// Q14: 급등 차트 반응, Q15: 하락 차트 반응
export const QUICK_QUESTION_IDS = [1, 2, 4, 7, 8, 14, 15];

export const ASSESSMENT_MODE_CONFIG: Record<
  AssessmentMode,
  { questionCount: number; timeEstimate: string; subtitle: string }
> = {
  quick: { questionCount: 7, timeEstimate: "약 2분", subtitle: "7문항 · 약 2분 · 정답 없음!" },
  detailed: { questionCount: 21, timeEstimate: "약 7분", subtitle: "21문항 · 약 7분 · 정답 없음!" },
};

export const LABELS = {
  pageTitle: "내 투자 성향 찾기",
  pageSubtitle: "21문항 · 약 7분 · 정답 없음!",
  startCta: "시작할래! 🔥",
  resultTitle: "너의 투자 성향은...",
  abilityTitle: "⚔️ 능력치",
  tipsTitle: "💡 맞춤 조언",
  homeBtn: "홈으로 돌아가기",
  retryBtn: "다시 해볼래!",
  theoryBadge: "🎭 감정 탐색",
  chartBadge: "📈 차트 반응",
  feedbackTitle: "발견된 성향",
  secondaryLabel: "보조 성향",
  nextBtnLabel: "다음으로 →",
};

export const FEEDBACK_AUTO_ADVANCE_MS = 10000;
export const RESULT_DELAY_MS = 1200;
export const POINTS_PER_SELECTION = 10;

export const PARTICLE_EMOJIS: Record<PersonalityType, string[]> = {
  analyst: ["📊", "🔢", "📈", "🧮", "💹"],
  challenger: ["⚡", "🔥", "💥", "🚀", "⭐"],
  conservative: ["🛡️", "🏦", "💎", "🔒", "✅"],
  emotional: ["🎭", "💜", "🌊", "✨", "🦋"],
  systematic: ["🧘", "⚙️", "🎯", "📋", "🔧"],
};

export const SCORE_MESSAGES = [
  "좋아! 🔥",
  "오호~ 👀",
  "흥미로운데? ✨",
  "재밌다~ 🎉",
  "나이스! 💪",
  "좋은 선택! 🌟",
  "역시! 😎",
  "ㅋㅋ 솔직해서 좋아 👍",
];
