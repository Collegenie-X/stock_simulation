import { STOCK_HISTORY_LIST } from "@/data/stock-history"

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
// 종목별 JSON(src/data/stock-history) 기반 종목 생성
// - source 가 "generated" 인 종목은 게임 가격(turns)을 실행 때 만든다
// - 시작가·변동성은 JSON 값 그대로 → 게임 전 3개월 차트와 끊김 없이 이어짐
// ============================================================
const GENERATED_NEWS = [
  "거래량 증가 추세", "안정적인 흐름 유지", "투자 심리 회복", "변동성 확대",
  "신규 사업 기대감", "기관 매수세 유입", "차익 실현 매물 출회", "관망세 지속",
]

// 게임 화면과 매매 화면이 같은 가격을 보도록, 한 번 만든 결과를 같이 쓴다
const generatedCache = new Map<string, ReturnType<typeof buildStocksFromHistory>>()

export function generateStocksFromHistory(existingIds: Set<string>, firstDate: string, requiredTurns: number) {
  const key = `${firstDate}:${requiredTurns}`
  let stocks = generatedCache.get(key)
  if (!stocks) {
    stocks = buildStocksFromHistory(firstDate, requiredTurns)
    generatedCache.set(key, stocks)
  }
  return stocks.filter((st) => !existingIds.has(st.id))
}

function buildStocksFromHistory(firstDate: string, requiredTurns: number) {
  const sep = firstDate.includes("-") ? "-" : "."
  const [y, m, d] = firstDate.split(" ")[0].split(/[.-]/).map(Number)

  return STOCK_HISTORY_LIST.filter((file) => file.source === "generated").map((file) => {
    let currentPrice = file.basePrice
    const turns = []
    for (let turn = 0; turn < requiredTurns; turn++) {
      // 첫 턴은 시작가 그대로, 이후는 종목 변동성만큼 움직임
      if (turn > 0) {
        const change = (Math.random() - 0.48) * file.dailyVol * 4
        currentPrice = Math.max(100, Math.round(currentPrice * (1 + change)))
      }
      const date = new Date(y, m - 1, d + turn)
      const dateStr = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join(sep)
      turns.push({
        turn: turn + 1,
        date: dateStr,
        price: currentPrice,
        news: GENERATED_NEWS[Math.floor(Math.random() * GENERATED_NEWS.length)],
      })
    }
    return { id: file.id, name: file.name, category: file.category, initialPrice: file.basePrice, turns }
  })
}
