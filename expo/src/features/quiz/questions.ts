export interface QuizScore {
  safe?: number
  balanced?: number
  aggressive?: number
}

export interface QuizQuestion {
  id: number
  question: string
  options: { text: string; score: QuizScore }[]
}

export const questions: QuizQuestion[] = [
  {
    id: 1,
    question: "투자에서 가장 중요하게 생각하는 것은?",
    options: [
      { text: "안정적인 수익", score: { safe: 3 } },
      { text: "적당한 위험과 수익", score: { balanced: 3 } },
      { text: "높은 수익 기회", score: { aggressive: 3 } },
    ],
  },
  {
    id: 2,
    question: "내 투자금이 10% 하락했다면?",
    options: [
      { text: "즉시 손절하고 빠져나온다", score: { safe: 3 } },
      { text: "상황을 지켜보며 판단한다", score: { balanced: 3 } },
      { text: "추가 매수 기회로 본다", score: { aggressive: 3 } },
    ],
  },
  {
    id: 3,
    question: "투자 결정을 내릴 때 주로 참고하는 것은?",
    options: [
      { text: "기업의 재무제표와 가치", score: { safe: 2, balanced: 1 } },
      { text: "차트와 기술적 지표", score: { balanced: 2, aggressive: 1 } },
      { text: "뉴스와 시장 분위기", score: { aggressive: 3 } },
    ],
  },
  {
    id: 4,
    question: "단기간에 큰 수익을 낼 수 있는 고위험 종목이 있다면?",
    options: [
      { text: "관심 없다. 안정적인 게 좋다", score: { safe: 3 } },
      { text: "일부만 투자해본다", score: { balanced: 3 } },
      { text: "큰 기회라고 생각하고 적극 투자", score: { aggressive: 3 } },
    ],
  },
  {
    id: 5,
    question: "나의 투자 기간은 보통?",
    options: [
      { text: "장기 (1년 이상)", score: { safe: 3 } },
      { text: "중기 (3개월~1년)", score: { balanced: 3 } },
      { text: "단기 (1일~3개월)", score: { aggressive: 3 } },
    ],
  },
  {
    id: 6,
    question: "투자할 때 가장 스트레스 받는 상황은?",
    options: [
      { text: "내 종목이 조금이라도 떨어질 때", score: { safe: 3 } },
      { text: "큰 폭으로 떨어질 때", score: { balanced: 3 } },
      { text: "스트레스를 별로 안 받는다", score: { aggressive: 3 } },
    ],
  },
  {
    id: 7,
    question: "포트폴리오를 구성한다면?",
    options: [
      { text: "안전한 대형주 위주", score: { safe: 3 } },
      { text: "대형주 + 중소형주 믹스", score: { balanced: 3 } },
      { text: "성장 가능성 높은 중소형주", score: { aggressive: 3 } },
    ],
  },
  {
    id: 8,
    question: "투자 공부는 얼마나 하시나요?",
    options: [
      { text: "기본적인 것만 안다", score: { safe: 2, aggressive: 1 } },
      { text: "꾸준히 공부하며 투자한다", score: { balanced: 3 } },
      { text: "전문가 수준으로 분석한다", score: { balanced: 1, aggressive: 2 } },
    ],
  },
  {
    id: 9,
    question: "시장이 3일 연속 급락! 당신의 반응은?",
    options: [
      { text: "잠을 못 자고 계속 주가 확인", score: { safe: 3 } },
      { text: "미리 정한 계획대로 차분하게 행동", score: { balanced: 3 } },
      { text: "저가 매수 기회라고 생각한다", score: { aggressive: 3 } },
    ],
  },
  {
    id: 10,
    question: "SNS에서 '확실한 정보'라며 종목을 추천하면?",
    options: [
      { text: "무시한다 (출처 불명은 위험)", score: { safe: 3 } },
      { text: "직접 분석 후 판단한다", score: { balanced: 3 } },
      { text: "일단 소액이라도 매수해본다", score: { aggressive: 3 } },
    ],
  },
  {
    id: 11,
    question: "보유 종목이 갑자기 -5% 갭하락으로 시작! 어떻게?",
    options: [
      { text: "바로 매도한다", score: { safe: 3 } },
      { text: "30분 관망 후 지지선 확인한다", score: { balanced: 3 } },
      { text: "저가 매수 기회로 추가 매수한다", score: { aggressive: 3 } },
    ],
  },
  {
    id: 12,
    question: "매수 후 +20% 수익 중! 수익 실현을 어떻게?",
    options: [
      { text: "전량 매도하고 확실하게 수익 확보", score: { safe: 3 } },
      { text: "분할 매도 (절반 먼저)", score: { balanced: 3 } },
      { text: "더 오를 것 같아 계속 보유", score: { aggressive: 3 } },
    ],
  },
]
