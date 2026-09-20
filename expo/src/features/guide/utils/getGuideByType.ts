export interface GuideInfo {
  emoji: string
  strategy: string
  description: string
  tips: string[]
}

export function getGuideByType(investorType: string): GuideInfo {
  if (investorType.includes("보수적") || investorType.includes("안정형")) {
    return {
      emoji: "🛡️",
      strategy: "안정적인 파도 타기",
      description: "큰 파도보다는 작고 안정적인 파도를 선택하세요",
      tips: ["급등주보다는 안정적인 종목 위주로 투자", "손절 라인을 미리 정하고 지키기", "하루 수익률 목표: 1-3%"],
    }
  } else if (investorType.includes("공격적") || investorType.includes("도전형")) {
    return {
      emoji: "⚡",
      strategy: "큰 파도 공략하기",
      description: "높은 변동성의 파도를 적극적으로 공략하세요",
      tips: ["급등주와 테마주 적극 활용", "빠른 손절과 익절 실행", "하루 수익률 목표: 5-10%"],
    }
  } else {
    return {
      emoji: "📊",
      strategy: "똑똑한 파도 분석",
      description: "차트를 분석하고 타이밍을 잡아 파도를 타세요",
      tips: ["차트 패턴을 보고 매매 타이밍 결정", "엘리엇 파동 이론 활용하기", "하루 수익률 목표: 3-7%"],
    }
  }
}
