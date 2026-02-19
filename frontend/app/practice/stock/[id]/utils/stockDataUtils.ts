// ============================================================
// AI 분석 이유 데이터
// ============================================================
export const AI_REASONS_UP = [
  { emoji: "📈", reason: "최근 실적 발표에서 예상치를 상회하는 매출 달성" },
  { emoji: "🏢", reason: "신규 사업 진출로 성장 기대감 상승" },
  { emoji: "💰", reason: "외국인 투자자 순매수 증가 추세" },
  { emoji: "📊", reason: "업종 대비 저평가 구간으로 반등 기대" },
  { emoji: "🔥", reason: "주요 제품 수요 급증으로 수혜 전망" },
]

export const AI_REASONS_DOWN = [
  { emoji: "📉", reason: "실적 부진으로 투자 심리 위축" },
  { emoji: "⚠️", reason: "경쟁사 신제품 출시로 시장 점유율 우려" },
  { emoji: "🌐", reason: "글로벌 경기 둔화 우려 확산" },
  { emoji: "💸", reason: "기관 투자자 대량 매도세 관찰" },
  { emoji: "📰", reason: "규제 강화 이슈로 불확실성 증가" },
]

// ============================================================
// 캐릭터 반응 이모지
// ============================================================
export const CHARACTER_REACTIONS = {
  buy: ["🤑", "💪", "🚀", "📈"],
  sell: ["💰", "🎯", "✨", "🏆"],
  skip: ["🤔", "😐", "⏭️", "💤"],
  timeout: ["⏰", "😱", "💨", "🏃"],
}

// ============================================================
// 차트용 히스토리 데이터 생성 (상세 뷰용)
// ============================================================
export function generateHistory(initialPrice: number, days: number) {
  let currentPrice = initialPrice
  const history = []
  const today = new Date()
  for (let i = days; i > 0; i--) {
    const change = (Math.random() - 0.5) * 0.05
    currentPrice = currentPrice * (1 + change)
    const historyDate = new Date(today)
    historyDate.setDate(today.getDate() - i)
    const dateStr = `${historyDate.getFullYear()}-${String(historyDate.getMonth() + 1).padStart(2, "0")}-${String(historyDate.getDate()).padStart(2, "0")}`
    history.push({ date: dateStr, price: Math.round(currentPrice), index: -i })
  }
  return history
}

// ============================================================
// AI 주식 생성
// ============================================================
export function generateAIStocks(count: number, startingPrice: number, requiredTurns: number) {
  const aiCompanies = [
    "OpenAI", "Anthropic", "DeepMind", "Cohere", "Hugging Face",
    "Stability AI", "Midjourney", "Character.AI", "Jasper", "Copy.ai",
    "Synthesia", "Runway", "Descript", "Otter.ai", "Grammarly",
    "Notion AI", "GitHub Copilot", "Tabnine", "Replit", "Cursor AI",
  ]
  const newsTemplates = [
    "AI 모델 성능 개선", "새로운 AI 기능 출시", "대규모 투자 유치",
    "주요 기업과 파트너십", "AI 기술 혁신 발표", "사용자 급증", "AI 시장 확대",
  ]

  const stocks = []
  for (let i = 0; i < count; i++) {
    const companyName =
      i < aiCompanies.length ? aiCompanies[i] : `AI-Tech-${String(i + 1).padStart(3, "0")}`
    const basePrice = startingPrice * (0.5 + Math.random())
    let currentPrice = basePrice
    const startDate = new Date(2024, 0, 1)
    const turns = []

    for (let turn = 0; turn < requiredTurns; turn++) {
      const change = (Math.random() - 0.48) * 0.08
      currentPrice = Math.max(1000, Math.round(currentPrice * (1 + change)))
      const d = new Date(startDate)
      d.setDate(d.getDate() + turn)
      const dateStr = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`
      turns.push({
        turn: turn + 1,
        date: dateStr,
        price: currentPrice,
        news: newsTemplates[Math.floor(Math.random() * newsTemplates.length)],
      })
    }

    stocks.push({
      id: `ai-stock-${i + 1}`,
      name: companyName,
      category: "AI/테크",
      initialPrice: Math.round(basePrice),
      turns,
    })
  }
  return stocks
}

// ============================================================
// 로봇/자동차 주식 생성
// ============================================================
export function generateRobotAutoStocks(count: number, startingPrice: number, requiredTurns: number) {
  const companies = [
    "Tesla", "Rivian", "Lucid Motors", "NIO", "XPeng", "BYD",
    "Boston Dynamics", "ABB Robotics", "FANUC", "KUKA", "Yaskawa",
    "Universal Robots", "Teradyne", "iRobot", "Intuitive Surgical",
    "Symbotic", "Sarcos", "Agility Robotics",
  ]
  const newsTemplates = [
    "전기차 판매 증가", "로봇 기술 혁신", "자율주행 개선",
    "생산 라인 확대", "신규 공장 건설", "배터리 기술 향상", "글로벌 시장 진출",
  ]

  const stocks = []
  for (let i = 0; i < count; i++) {
    const companyName =
      i < companies.length ? companies[i] : `RoboAuto-${String(i + 1).padStart(3, "0")}`
    const basePrice = startingPrice * (0.7 + Math.random() * 0.6)
    let currentPrice = basePrice
    const startDate = new Date(2024, 0, 1)
    const turns = []

    for (let turn = 0; turn < requiredTurns; turn++) {
      const change = (Math.random() - 0.5) * 0.06
      currentPrice = Math.max(1000, Math.round(currentPrice * (1 + change)))
      const d = new Date(startDate)
      d.setDate(d.getDate() + turn)
      const dateStr = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`
      turns.push({
        turn: turn + 1,
        date: dateStr,
        price: currentPrice,
        news: newsTemplates[Math.floor(Math.random() * newsTemplates.length)],
      })
    }

    stocks.push({
      id: `robot-auto-${i + 1}`,
      name: companyName,
      category: "로봇/자동차",
      initialPrice: Math.round(basePrice),
      turns,
    })
  }
  return stocks
}
