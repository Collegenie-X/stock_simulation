// ── 이벤트 생성 (JSON 데이터 기반) ───────────────────────
import eventsData from "@/data/stock-market-events.json"

export interface DailyEvent {
  type: "positive" | "negative" | "neutral"
  emoji: string
  headline: string
  detail?: string
  time: string
  isDelayed?: boolean
}

const { categoryMapping, times: TIMES, positive: POSITIVE_POOL, negative: NEGATIVE_POOL, volumeAlert } = eventsData

function resolveCategory(category: string): string {
  for (const [key, keywords] of Object.entries(categoryMapping)) {
    if ((keywords as string[]).some((kw) => category.includes(kw))) return key
  }
  return "기본"
}

export interface EventParams {
  currentIsUp: boolean
  currentChange: number
  stockNews: string
  stockCategory: string
  stockName: string
  prevDayChange?: number
  prevDayIsUp?: boolean
  prevDayNews?: string
}

export function generateDailyEvents(params: EventParams): DailyEvent[] {
  const {
    currentIsUp, currentChange, stockNews, stockCategory, stockName,
    prevDayChange, prevDayIsUp, prevDayNews,
  } = params

  const cat = resolveCategory(stockCategory)
  const absChange = Math.abs(currentChange)
  const events: DailyEvent[] = []

  const hasPrevData = prevDayChange !== undefined && prevDayIsUp !== undefined
  const prevWasUp = prevDayIsUp ?? currentIsUp
  const prevAbsChange = Math.abs(prevDayChange ?? currentChange)

  // 1) 전일 기반 뉴스 (한발 늦은 뉴스) — 전일 움직임에 대한 보도
  if (hasPrevData) {
    const pool = prevWasUp
      ? (POSITIVE_POOL as Record<string, { headlines: string[]; details: string[] }>)
      : (NEGATIVE_POOL as Record<string, { headlines: string[]; details: string[] }>)
    const data = pool[cat] || pool["기본"]
    const seed = stockName.length + Math.round((prevDayChange ?? 0) * 100)
    const idx = Math.abs(seed) % data.headlines.length

    events.push({
      type: prevWasUp ? "positive" : "negative",
      emoji: prevWasUp ? "📈" : "📉",
      headline: data.headlines[idx],
      detail: data.details[idx],
      time: TIMES[0],
      isDelayed: true,
    })

    // 전일 뉴스 데이터가 있으면 포함
    if (prevDayNews) {
      events.push({
        type: "neutral",
        emoji: "📋",
        headline: prevDayNews,
        time: TIMES[1],
        isDelayed: true,
      })
    }

    // 오늘 방향이 전일과 반대면 "반전 경고" 추가
    if (prevWasUp !== currentIsUp) {
      events.push({
        type: currentIsUp ? "positive" : "negative",
        emoji: "🔄",
        headline: currentIsUp
          ? `${stockName}, 어제 하락 분위기에서 반등 성공`
          : `${stockName}, 호재 뉴스에도 불구하고 차익실현 매물 출회`,
        detail: currentIsUp
          ? "과매도 구간 진입 후 기술적 반등 관측"
          : "소식 발표 후 이미 오른 주가에 매도세 집중",
        time: TIMES[2],
      })
    }

    // 전일 변동폭이 컸으면 거래량 뉴스
    if (prevAbsChange > 3) {
      events.push({
        type: "neutral",
        emoji: "🔔",
        headline: volumeAlert.headline
          .replace("{stockName}", stockName)
          .replace("{volume}", String(Math.round(prevAbsChange * 30))),
        detail: prevAbsChange > 5 ? volumeAlert.detailHigh : volumeAlert.detailNormal,
        time: TIMES[3],
        isDelayed: true,
      })
    }
  } else {
    // 첫날: 전일 데이터 없으면 현재 기준으로 표시
    const pool = currentIsUp
      ? (POSITIVE_POOL as Record<string, { headlines: string[]; details: string[] }>)
      : (NEGATIVE_POOL as Record<string, { headlines: string[]; details: string[] }>)
    const data = pool[cat] || pool["기본"]
    const seed = stockName.length + Math.round(currentChange * 100)
    const idx = Math.abs(seed) % data.headlines.length

    events.push({
      type: currentIsUp ? "positive" : "negative",
      emoji: currentIsUp ? "📈" : "📉",
      headline: data.headlines[idx],
      detail: data.details[idx],
      time: TIMES[0],
    })

    if (stockNews) {
      events.push({
        type: "neutral",
        emoji: "📋",
        headline: stockNews,
        time: TIMES[1],
      })
    }

    if (absChange > 3) {
      events.push({
        type: "neutral",
        emoji: "🔔",
        headline: volumeAlert.headline
          .replace("{stockName}", stockName)
          .replace("{volume}", String(Math.round(absChange * 30))),
        detail: absChange > 5 ? volumeAlert.detailHigh : volumeAlert.detailNormal,
        time: TIMES[3],
      })
    }
  }

  return events
}
