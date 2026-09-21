import type { AbilityKey, AssessmentMode, HabitTag, MoneyTag, PersonalityType } from "./types";

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
    /** 리포트 핵심 요약에 쓰는 한 줄 */
    summary: string;
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
    summary: "근거가 있어야 움직입니다. 급한 순간에도 계산이 먼저입니다.",
    analysis: [
      "숫자와 데이터를 기반으로 ==논리적 판단==을 내리는 능력이 탁월합니다.",
      "급락·호재 장면 모두에서 ==이유부터 확인==하는 편입니다. 충동 매매 실수가 적은 유형입니다.",
      "팔자마자 반등한 장면에서도 억울함보다 ==복기==를 택합니다. 후회를 정보로 바꾸는 힘입니다.",
      "차트 끝의 떨림보다 ==거래량과 근거==를 봅니다. 단기 소음에 강합니다.",
      "돈이 급할 때조차 ==어느 종목을 팔지 계산==합니다. 다만 계산보다 먼저 ==비상금==이 있어야 팔 일이 안 생깁니다.",
      "돈에 ==쓸 시기==를 붙여 나누는 습관이 잘 맞습니다. 2년 안에 쓸 돈은 주식 밖에 두는 방식입니다.",
      "다만 지나친 분석이 ==결정 지연==으로 이어질 수 있습니다. 기다림과 미룸을 구분해야 합니다.",
      "시장의 ==비합리적 급등락==에는 설명이 안 붙습니다. 이때는 분석보다 미리 정한 규칙이 필요합니다.",
      "==금액이 커져도== 같은 계산을 할 수 있는지가 다음 과제입니다. 1,000만원의 -5%는 다르게 느껴집니다.",
      "==매매 일지==와 복기 습관이 성과를 가장 크게 올려 줄 유형입니다.",
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
    summary: "기회 앞에서 빠릅니다. 속도가 강점이자 가장 비싼 약점입니다.",
    analysis: [
      "기회를 포착하는 ==순간 판단력==이 뛰어나 상승 초입에 강합니다.",
      "급등·호재 장면에서 ==바로 매수==로 기우는 편입니다. 설계상 가장 비용이 큰 습관인 ==추격매수==와 가깝습니다.",
      "꽁돈이 생기면 ==전부 투자==하려는 경향이 있습니다. 없던 돈도 잃으면 똑같이 아픕니다.",
      "돈이 급할 때 주식을 파는 대신 ==빚으로 막는 선택==을 조심해야 합니다. 이자는 본전을 기다려 주지 않습니다.",
      "==신용·레버리지==는 수익을 2배로 만들지만 버틸 시간을 절반으로 줄입니다.",
      "손실 중 ==물타기==를 고르는 편입니다. 판단이 맞았는지, 인정하기 싫은 것인지 구분이 필요합니다.",
      "횡보장에서 ==가만히 있지 못하는== 편입니다. 가만히 있는 것보다 못한 매매가 가장 흔한 손실 원인입니다.",
      "==한 종목에 넣는 돈의 크기==를 먼저 정해 두면 큰 손실을 막을 수 있습니다.",
      "공격적인 성향은 ==상승장==에서 빛납니다. 문제는 하락장에서도 같은 속도라는 점입니다.",
      "==사기 전 3초==, 그리고 생활비 3개월치 ==비상금==. 이 두 가지가 이 유형의 안전벨트입니다.",
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
    summary: "지키는 것이 먼저입니다. 다만 큰돈 앞에서는 지키려다 싸게 팔 수 있습니다.",
    analysis: [
      "==원금 보존==을 최우선으로 하는 태도가 장기적으로 자산을 지켜 줍니다.",
      "꽁돈이 생겨도 ==예금·비상금==으로 먼저 보냅니다. 급한 돈 때문에 주식을 팔 일이 적은 구조입니다.",
      "==빚으로 투자하지 않는다==는 선이 분명합니다. 내 돈이어야 기다릴 수 있습니다.",
      "다만 급락 장면에서 ==일단 파는 쪽==으로 기울기 쉽습니다. 설계상 ==급락 손절==은 반등을 놓치는 대표 습관입니다.",
      "==금액이 커지면== 같은 -5%에도 절반을 파는 경향이 있습니다. 돈이 그릇보다 클 때 나오는 신호입니다.",
      "==본전이 오면 팔겠다==는 생각은 기준이 시장이 아니라 내 매수가라는 뜻입니다. 시장은 내 매수가를 모릅니다.",
      "종목을 비울 때 ==오른 것부터 파는== 편입니다. 잘 크는 나무를 먼저 베는 일이 될 수 있습니다.",
      "과도한 신중함이 ==진입 지연==으로 이어질 수 있습니다. 나눠서 사는 방식이 잘 맞습니다.",
      "==전부 팔기 / 전부 들기== 대신 ==절반만== 움직이는 연습이 효과적입니다.",
      "시간을 길게 쓸수록 유리한 유형입니다. ==작은 금액으로 급락을 미리 겪어 보는 것==이 가장 좋은 훈련입니다.",
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
    summary: "분위기를 가장 먼저 느낍니다. 그 감각에 기준을 붙이는 것이 과제입니다.",
    analysis: [
      "시장의 ==분위기와 흐름==을 감각적으로 읽어내는 능력이 있습니다.",
      "다만 ==무서워서 팔고, 억울해서 다시 사는== 흐름에 빠지기 쉽습니다. 비싸게 사고 싸게 파는 순서입니다.",
      "==차트 끝의 떨림==에 손이 먼저 나가는 편입니다. 그 떨림은 방향이 아닐 때가 많습니다.",
      "주식 계좌를 ==통장처럼== 쓰는 경향이 있습니다. 쓰려고 파는 순간, 파는 이유는 시장이 아니라 내 지갑이 됩니다.",
      "돈이 필요할 때 ==수익 난 종목만== 파는 선택을 조심해야 합니다. 계좌에 물린 종목만 남습니다.",
      "==다들 한다==는 이유로 빚이나 테마에 끌리기 쉽습니다. 가장 위험한 매수 이유입니다.",
      "==금액이 커지면== 숫자가 생활비로 보이기 시작합니다. 작은 돈에서 먼저 겪어 보는 것이 중요합니다.",
      "이유 없는 관망, 즉 ==결정을 미루는 기다림==이 있는지 살펴보세요. 기다림에는 '무엇을'이 있어야 합니다.",
      "==사고파는 기준==을 미리 적어 두면 감정적 결정을 크게 줄일 수 있습니다.",
      "결과보다 ==과정을 지켰는지==를 평가 기준으로 삼으면 성장이 가장 빠른 유형입니다.",
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
    summary: "규칙이 감정보다 먼저 움직입니다. 돈에도 자리를 정해 두는 편입니다.",
    analysis: [
      "미리 정한 ==원칙==을 흔들림 없이 실행하는 능력이 최고의 강점입니다.",
      "급락·급등·떨림 장면 모두에서 ==계획대로==를 고릅니다. 감정적 매매에서 가장 자유로운 유형입니다.",
      "==비상금 → 정해진 금액 투자==의 순서가 잡혀 있습니다. 급한 돈 때문에 저점에서 팔 일이 적습니다.",
      "돈에 ==꼬리표==를 붙입니다. 여행비는 여행비, 투자금은 투자금입니다. 주식이 자랄 시간을 갖게 됩니다.",
      "==금액이 커져도 %로 봅니다.== 가장 어려운 능력이며, 큰돈을 넣을 자격에 가깝습니다.",
      "경험을 ==규칙 한 줄==로 바꾸는 습관이 있습니다. '다음 급락엔 절반만'이 대표적입니다.",
      "종목을 비울 때 ==틀린 것부터== 정리합니다. 손절을 실패가 아니라 관리로 봅니다.",
      "다만 지나친 원칙 고수가 ==유연한 대응==을 막을 수 있습니다. 규칙에도 점검 주기가 필요합니다.",
      "==현금이 너무 많이 놀고 있지 않은지==는 가끔 확인하세요. 비상금은 생활비 3~6개월치면 충분합니다.",
      "규칙을 ==실제로 지켰는지==는 시뮬레이션 기록이 알려 줍니다. 아는 것과 지키는 것은 다른 능력입니다.",
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
  moneyManagement: { label: "자금 관리", emoji: "💰", bar: "bg-gradient-to-r from-emerald-500 to-teal-500", oneLiner: "돈마다 자리 있음! 🗂️" },
};

// ─── 자산 점검: 주식은 제2의 자산. 꽁돈이 생길 때, 급한 돈이 필요할 때 어떻게 하는가 ───
// order = 위험도 순 (동점이면 더 위험한 쪽을 보여준다)
export const MONEY_ORDER: MoneyTag[] = ["leverage", "allin", "wallet", "separated"];

export const MONEY_META: Record<
  MoneyTag,
  { emoji: string; label: string; short: string; desc: string; check: string; missions: string[]; color: string; safe: boolean }
> = {
  separated: {
    emoji: "🏦",
    label: "칸막이형",
    short: "쓸 돈과 굴릴 돈을 나눠 둡니다.",
    desc: "비상금·생활비·투자금에 ==칸막이==가 있습니다. 급한 일이 생겨도 주식을 건드리지 않아도 됩니다.",
    check: "돈이 필요한 날은 시장이 좋은 날을 기다려 주지 않습니다. 이미 대비가 되어 있는 구조입니다.",
    missions: ["비상금은 생활비 3~6개월치면 충분 🧱", "현금이 너무 많이 놀고 있진 않은지 체크 👀"],
    color: "#34d399",
    safe: true,
  },
  wallet: {
    emoji: "👛",
    label: "지갑형",
    short: "주식 계좌를 통장처럼 씁니다.",
    desc: "필요하면 팔아 쓰고, 생기면 다시 넣습니다. 주식을 ==현금처럼== 다루는 방식입니다.",
    check: "문제는 ==파는 날을 내가 못 고른다==는 점입니다. 돈이 필요한 날이 하필 -12%인 날이면 손실이 그대로 확정됩니다.",
    missions: ["1~2년 안에 쓸 돈은 주식 밖에 두기 🗂️", "수익 난 것만 파는 버릇 조심 ✂️"],
    color: "#fbbf24",
    safe: false,
  },
  allin: {
    emoji: "🎰",
    label: "올인형",
    short: "생기는 돈은 전부 주식으로 갑니다.",
    desc: "현금은 ==노는 돈==이라고 느낍니다. 꽁돈도, 남는 월급도 전부 투자합니다.",
    check: "==비상금이 없으면== 급한 일이 생길 때 가장 싼 가격에 팔게 됩니다. 쉬는 돈이 급한 날의 나를 구합니다.",
    missions: ["생활비 3개월치 비상금부터 🧱", "꽁돈은 절반만 투자하기 ✌️"],
    color: "#fb923c",
    safe: false,
  },
  leverage: {
    emoji: "💳",
    label: "빚투형",
    short: "주식은 안 팔고 빚으로 막거나, 빚으로 더 삽니다.",
    desc: "마이너스통장·할부·신용으로 ==시간을 빌려== 씁니다. 주식은 끝까지 들고 가려 합니다.",
    check: "==빚은 버틸 시간을 빼앗습니다.== 이자와 강제 매도는 본전을 기다려 주지 않습니다.",
    missions: ["빚으로 산 주식 비중 0으로 만들기 🚫", "'본전 오면 판다' 대신 가격 기준 정하기 📏"],
    color: "#f87171",
    safe: false,
  },
};

// ─── 매매 습관: 설계 문서 12장 습관 태그 ───
export const HABIT_META: Record<HabitTag, { emoji: string; label: string; fear: string; tip: string }> = {
  chase: { emoji: "🏃", label: "급등 추격매수", fear: "놓칠까 봐 두려움", tip: "사기 전 3초. 이미 오른 이유를 한 줄로 말해 보기" },
  panicSell: { emoji: "😱", label: "급락 손절", fear: "더 잃을까 봐 두려움", tip: "전부 말고 절반만. 파는 기준은 기분이 아니라 가격으로" },
  earlyProfit: { emoji: "✂️", label: "조기 익절", fear: "번 것을 뺏길까 봐 두려움", tip: "수익 난 것부터 파는 버릇 점검. 잘 크는 나무는 두기" },
  averagingDown: { emoji: "🪣", label: "물타기", fear: "틀렸음을 인정하기 싫음", tip: "더 사기 전에 '처음 산 이유가 아직 맞나' 확인" },
  tailFollow: { emoji: "〰️", label: "꼬리 추종", fear: "지금 아니면 늦는다는 조급함", tip: "차트 끝의 떨림은 방향이 아님. 종가 보고 결정" },
  blindWait: { emoji: "🤷", label: "이유 없는 관망", fear: "결정하기가 두려움", tip: "기다릴 땐 '무엇을 기다리는지' 한 줄 적기" },
  breakeven: { emoji: "🧲", label: "본전 집착", fear: "손실을 확정하기 싫음", tip: "내 매수가는 시장이 모르는 숫자. 앞날만 보고 판단" },
  overtrade: { emoji: "🔄", label: "지루함 매매", fear: "가만히 있으면 뒤처질까 봐 두려움", tip: "가만히 있는 것도 선택. '그대로 보유'와 비교해 보기" },
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

// 간략 측정에 포함할 핵심 문항 ID (감정 3 + 자산 5 + 차트 2 = 10문항)
// Q2: 손실 감정, Q7: 수익 달성, Q8: 뉴스 반응
// Q26: 금액의 무게, Q22: 꽁돈, Q23: 급한 목돈, Q27: 주식을 현금처럼, Q28: 빚투
// Q14: 급등 차트 반응, Q15: 하락 차트 반응
export const QUICK_QUESTION_IDS = [2, 7, 8, 26, 22, 23, 27, 28, 14, 15];

export const ASSESSMENT_MODE_CONFIG: Record<
  AssessmentMode,
  { questionCount: number; timeEstimate: string; subtitle: string }
> = {
  quick: { questionCount: 10, timeEstimate: "약 3분", subtitle: "10문항 · 약 3분 · 정답 없음!" },
  detailed: { questionCount: 30, timeEstimate: "약 10분", subtitle: "30문항 · 약 10분 · 정답 없음!" },
};

export const LABELS = {
  pageTitle: "내 투자 성향 찾기",
  pageSubtitle: "30문항 · 약 10분 · 정답 없음!",
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

// ─── RN 전용: 위 Tailwind 클래스(accent/border/bg/text/glow)에 대응하는 실제 색상 값 ───
export const PERSONALITY_COLORS: Record<
  PersonalityType,
  {
    /** accent 그라데이션 (from → to) */
    accent: readonly [string, string];
    /** border-*-500/60 */
    border: string;
    /** bg-*-500/10 */
    bg: string;
    /** text-*-300 */
    text: string;
    /** shadow-[0_0_24px_rgba(..,0.35)] */
    glow: string;
    /** 리포트 형광펜 색 */
    highlight: string;
  }
> = {
  analyst: { accent: ["#3b82f6", "#06b6d4"], border: "rgba(59,130,246,0.6)", bg: "rgba(59,130,246,0.1)", text: "#93c5fd", glow: "0 0 24px rgba(59,130,246,0.35)", highlight: "#67e8f9" },
  challenger: { accent: ["#f97316", "#ef4444"], border: "rgba(249,115,22,0.6)", bg: "rgba(249,115,22,0.1)", text: "#fdba74", glow: "0 0 24px rgba(249,115,22,0.35)", highlight: "#fb923c" },
  conservative: { accent: ["#22c55e", "#10b981"], border: "rgba(34,197,94,0.6)", bg: "rgba(34,197,94,0.1)", text: "#86efac", glow: "0 0 24px rgba(34,197,94,0.35)", highlight: "#86efac" },
  emotional: { accent: ["#a855f7", "#8b5cf6"], border: "rgba(168,85,247,0.6)", bg: "rgba(168,85,247,0.1)", text: "#d8b4fe", glow: "0 0 24px rgba(168,85,247,0.35)", highlight: "#d8b4fe" },
  systematic: { accent: ["#06b6d4", "#14b8a6"], border: "rgba(6,182,212,0.6)", bg: "rgba(6,182,212,0.1)", text: "#67e8f9", glow: "0 0 24px rgba(6,182,212,0.35)", highlight: "#5eead4" },
};

/** ABILITY_META[*].bar 그라데이션에 대응하는 색상 */
export const ABILITY_BAR_COLORS: Record<AbilityKey, readonly [string, string]> = {
  riskTolerance: ["#ef4444", "#f97316"],
  analysis: ["#3b82f6", "#06b6d4"],
  emotionControl: ["#22c55e", "#10b981"],
  coping: ["#eab308", "#f59e0b"],
  infoJudgment: ["#a855f7", "#8b5cf6"],
  moneyManagement: ["#10b981", "#14b8a6"],
};
