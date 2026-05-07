import type { AbilityKey, AssessmentMode, PersonalityType } from "./types";

export const PERSONALITY_META: Record<
  PersonalityType,
  {
    emoji: string;
    label: string;
    desc: string;
    catchphrase: string;
    oneLiner: string;
    judge: string;
    accent: string;
    border: string;
    bg: string;
    text: string;
    glow: string;
    tips: string[];
    analysis: string[];
  }
> = {
  analyst: {
    emoji: "📊",
    label: "분석가형",
    desc: "숫자와 데이터 앞에선 감정 따위 없어! 차트가 말해주는 대로 움직이는 냉철한 투자자야.",
    catchphrase: "스캔 완료 📊",
    oneLiner: "데이터 스캔!",
    judge: "흠… 숫자가 답이지.",
    accent: "from-blue-500 to-cyan-500",
    border: "border-blue-500/60",
    bg: "bg-blue-500/10",
    text: "text-blue-300",
    glow: "shadow-[0_0_24px_rgba(59,130,246,0.35)]",
    tips: [
      "차트 패턴 더 파기 📊",
      "가끔은 직감도 믿기 ✨",
    ],
    analysis: [
      "숫자와 데이터를 기반으로 ==논리적 판단==을 내리는 능력이 탁월합니다.",
      "차트의 ==패턴과 추세==를 빠르게 파악하며, 진입 타이밍을 정밀하게 계산합니다.",
      "감정보다 ==지표와 수치==를 신뢰하기 때문에 충동적 매매 실수가 적습니다.",
      "==리스크 대비 수익률(R:R)==을 항상 계산하고 진입하는 습관이 몸에 배어 있습니다.",
      "주변 소음보다 ==자신의 분석==을 믿는 자신감이 강점입니다.",
      "다만 지나친 분석이 ==결정 지연==으로 이어질 수 있어 주의가 필요합니다.",
      "시장의 ==비합리적 급등락==에 당황할 수 있으며, 이때 유연한 대응이 과제입니다.",
      "==트레이딩 일지== 작성과 복기 습관이 성과를 크게 높여줄 것입니다.",
      "단기 노이즈에 흔들리지 않고 ==중장기 그림==을 볼 줄 아는 냉철함이 있습니다.",
      "==백테스트와 시뮬레이션==을 통해 전략을 검증하는 능력이 남다릅니다.",
    ],
  },
  challenger: {
    emoji: "⚡",
    label: "도전가형",
    desc: "기회가 보이면 바로 달려드는 타입! 높은 리스크 = 높은 리턴을 본능적으로 알고 있어.",
    catchphrase: "돌격! 🚀",
    oneLiner: "기회 포착, 발사!",
    judge: "쫄지 마, 가즈아~",
    accent: "from-orange-500 to-red-500",
    border: "border-orange-500/60",
    bg: "bg-orange-500/10",
    text: "text-orange-300",
    glow: "shadow-[0_0_24px_rgba(249,115,22,0.35)]",
    tips: [
      "손절 라인 사수 🛑",
      "사기 전 3초 멈추기 ⏸️",
    ],
    analysis: [
      "기회를 포착하는 ==순간 판단력==이 뛰어나 타이밍 매매에 강합니다.",
      "높은 ==리스크 감수 성향==으로 큰 수익을 노릴 수 있지만, 손실도 빠를 수 있습니다.",
      "==첫 번째 상승 파동==에서 과감하게 진입하는 능력이 탁월합니다.",
      "손절을 미루는 경향이 있어 ==철저한 손절 원칙== 수립이 핵심 과제입니다.",
      "공격적인 성향 덕분에 ==상승장==에서 놀라운 성과를 낼 수 있습니다.",
      "하지만 ==하락장과 횡보장==에서는 불필요한 거래로 손실이 쌓일 수 있습니다.",
      "==포지션 사이징==을 철저히 관리해야 대형 손실을 예방할 수 있습니다.",
      "자신의 판단에 대한 강한 ==확신 편향==이 객관성을 가릴 수 있습니다.",
      "빠른 실행력과 결단력은 ==단기 트레이딩==에서 큰 강점입니다.",
      "==매매 빈도==를 줄이고 확실한 셋업만 공략하면 수익률이 크게 개선됩니다.",
    ],
  },
  conservative: {
    emoji: "🛡️",
    label: "안정추구형",
    desc: "원금이 제일 중요해! 리스크는 최소화하고 안전하게 가는 게 진짜 투자야.",
    catchphrase: "방어! 🛡️",
    oneLiner: "원금 사수!",
    judge: "조심해서 나쁠 거 없잖아?",
    accent: "from-green-500 to-emerald-500",
    border: "border-green-500/60",
    bg: "bg-green-500/10",
    text: "text-green-300",
    glow: "shadow-[0_0_24px_rgba(34,197,94,0.35)]",
    tips: [
      "배당·우량주 중심 🏦",
      "리스크 한 칸씩 늘리기 📈",
    ],
    analysis: [
      "==원금 보존==을 최우선으로 하는 투자 철학이 장기적으로 안정된 자산을 만듭니다.",
      "변동성이 클 때도 ==침착한 판단==을 유지하며 패닉 매도를 하지 않습니다.",
      "==배당주와 우량주== 중심 포트폴리오가 성향에 매우 잘 맞습니다.",
      "시장이 급락할 때 오히려 ==저점 매수== 기회를 냉정하게 포착합니다.",
      "과도한 신중함이 ==진입 타이밍 지연==으로 이어져 기회를 놓칠 수 있습니다.",
      "==분산 투자==를 자연스럽게 실천하여 리스크를 효과적으로 관리합니다.",
      "단기 급등보다 ==가치 있는 기업==을 장기 보유하는 전략이 유효합니다.",
      "결정까지 ==충분한 검토 시간==이 필요하며, 이는 실수를 줄여줍니다.",
      "==복리 효과==를 극대화할 수 있는 장기 투자자로서의 잠재력이 높습니다.",
      "확실한 기회에는 ==계산된 과감함==도 발휘할 줄 알아야 합니다.",
    ],
  },
  emotional: {
    emoji: "🎭",
    label: "감성투자형",
    desc: "직관과 감정으로 시장을 느끼는 타입! 감각적 판단이 때로는 엄청난 위력을 발휘해.",
    catchphrase: "감 왔다 ✨",
    oneLiner: "직감 발동!",
    judge: "느낌적인 느낌이 와…",
    accent: "from-purple-500 to-violet-500",
    border: "border-purple-500/60",
    bg: "bg-purple-500/10",
    text: "text-purple-300",
    glow: "shadow-[0_0_24px_rgba(168,85,247,0.35)]",
    tips: [
      "감각을 데이터로 검증 🔍",
      "흔들릴 땐 원칙 소환 🧭",
    ],
    analysis: [
      "시장의 ==분위기와 흐름==을 감각적으로 읽어내는 능력이 탁월합니다.",
      "다른 투자자들이 놓치는 ==숨겨진 모멘텀==을 직관적으로 포착합니다.",
      "그러나 ==감정적 판단==이 데이터보다 앞설 때 치명적인 실수로 이어질 수 있습니다.",
      "==FOMO==에 취약하여 고점 추격 매수를 특히 조심해야 합니다.",
      "시장 심리를 읽는 능력은 ==대중 심리 역이용==에 큰 강점이 됩니다.",
      "==명확한 진입·청산 기준==을 사전에 수립하면 감정적 의사결정을 크게 줄일 수 있습니다.",
      "강한 ==공감 능력==이 시장 참여자들의 행동을 예측하는 데 도움이 됩니다.",
      "매매 후 결과보다 ==과정의 원칙 준수==를 평가 기준으로 삼으면 성장이 빠릅니다.",
      "직관이 맞을 때는 놀라운 수익을 내지만, 틀릴 때를 대비한 ==리스크 관리==가 필수입니다.",
      "==투자 일지==를 통해 직관이 얼마나 정확했는지 데이터로 검증하는 습관을 권장합니다.",
    ],
  },
  systematic: {
    emoji: "🧘",
    label: "침착형",
    desc: "원칙이 있으니까 무서울 게 없어! 일관된 전략으로 꾸준히 이기는 진짜 고수야.",
    catchphrase: "GO 🧘",
    oneLiner: "원칙 가동!",
    judge: "원칙대로. 끝.",
    accent: "from-cyan-500 to-teal-500",
    border: "border-cyan-500/60",
    bg: "bg-cyan-500/10",
    text: "text-cyan-300",
    glow: "shadow-[0_0_24px_rgba(6,182,212,0.35)]",
    tips: [
      "전략 그대로 유지 🎯",
      "가끔은 새 기회도 잡기 🪝",
    ],
    analysis: [
      "사전에 수립한 ==투자 원칙==을 흔들림 없이 실행하는 능력이 최고의 강점입니다.",
      "시장의 소란과 무관하게 ==자신의 시스템==을 신뢰하며 일관된 성과를 냅니다.",
      "==감정적 편향==에서 가장 자유로운 유형으로, 급등락에도 냉정함을 유지합니다.",
      "장기적으로 ==복리 수익==을 극대화할 수 있는 이상적인 투자 성향입니다.",
      "지나친 원칙 고수가 ==유연한 시장 대응==을 가로막을 수 있습니다.",
      "==리밸런싱==을 꾸준히 실천하여 포트폴리오를 최적 상태로 유지합니다.",
      "새로운 기회가 왔을 때 ==기존 전략 틀== 안에서만 바라보는 경향을 주의해야 합니다.",
      "==규칙 기반 매매==는 심리적 스트레스를 최소화하며 지속 가능한 투자를 가능케 합니다.",
      "시장이 극단적일 때 ==예외적 대응==을 허용하는 유연성도 필요합니다.",
      "꾸준한 ==전략 검증과 개선==으로 시스템을 지속적으로 업그레이드할 때 빛납니다.",
    ],
  },
};

export const ABILITY_META: Record<
  AbilityKey,
  { label: string; emoji: string; bar: string; oneLiner: string }
> = {
  riskTolerance: { label: "리스크 감수", emoji: "🎲", bar: "bg-gradient-to-r from-red-500 to-orange-500", oneLiner: "강심장 +1 💥" },
  analysis: { label: "분석력", emoji: "📊", bar: "bg-gradient-to-r from-blue-500 to-cyan-500", oneLiner: "차트 해독! 🔓" },
  emotionControl: { label: "감정 통제", emoji: "🧘", bar: "bg-gradient-to-r from-green-500 to-emerald-500", oneLiner: "멘탈 락 🔒" },
  coping: { label: "대처 능력", emoji: "⚡", bar: "bg-gradient-to-r from-yellow-500 to-amber-500", oneLiner: "순발력 폭발! ⚡" },
  infoJudgment: { label: "정보 판별", emoji: "🔍", bar: "bg-gradient-to-r from-purple-500 to-violet-500", oneLiner: "가짜뉴스 컷! ✂️" },
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
  tipsTitle: "다음 미션",
  startGameBtn: "시뮬레이션 시작하기 🚀",
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
