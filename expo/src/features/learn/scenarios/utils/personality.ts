/**
 * 시나리오 이벤트(턴별 등락률)에서 "주식 캐릭터"의 성격 수치를 뽑아내는 유틸
 * — 별도 데이터 없이 모든 시나리오에 자동 적용됨
 */
import type { LegendaryScenario, ScenarioEvent } from "@/data/legendary-scenarios"
import { palette } from "@/theme"

export function parseRate(s: string): number {
  return parseFloat(s.replace("%", "").replace("+", "")) / 100
}

/** 100에서 시작하는 누적 가격 (길이 = 이벤트 수 + 1) */
export function buildPrices(events: ScenarioEvent[]): number[] {
  const prices: number[] = [100]
  events.forEach((ev) => prices.push(prices[prices.length - 1] * (1 + parseRate(ev.priceChange))))
  return prices
}

export interface PersonalityStat {
  key: "volatility" | "growth" | "risk" | "resilience"
  label: string
  emoji: string
  value: number // 0~100
  color: string
  comment: string
}

export interface StockPersonality {
  title: string
  emoji: string
  catchphrase: string
  stats: PersonalityStat[]
}

const clamp = (v: number) => Math.max(5, Math.min(100, Math.round(v)))
const level = (v: number, low: string, mid: string, high: string) => (v >= 67 ? high : v >= 34 ? mid : low)

export function getStockPersonality(scenario: LegendaryScenario): StockPersonality {
  const changes = scenario.events.map((e) => parseRate(e.priceChange) * 100)
  const prices = buildPrices(scenario.events)
  const final = prices[prices.length - 1]
  const minP = Math.min(...prices)

  // 최대 낙폭
  let peak = prices[0]
  let maxDD = 0
  prices.forEach((p) => {
    peak = Math.max(peak, p)
    maxDD = Math.max(maxDD, ((peak - p) / peak) * 100)
  })

  const avgAbs = changes.reduce((s, c) => s + Math.abs(c), 0) / Math.max(changes.length, 1)
  const volatility = clamp((avgAbs / 8) * 100)
  const growth = clamp(((final - 100 + 20) / 60) * 100)
  const risk = clamp((maxDD / 25) * 100)
  const resilience = clamp((((final - minP) / minP) * 100 * 100) / 40)

  const stats: PersonalityStat[] = [
    { key: "volatility", label: "흔들림", emoji: "🎢", value: volatility, color: palette.orange[400], comment: level(volatility, "잔잔해요", "꽤 흔들려요", "엄청 흔들려요") },
    { key: "growth", label: "성장", emoji: "🌱", value: growth, color: palette.green[400], comment: level(growth, "주춤해요", "꾸준해요", "쑥쑥 커요") },
    { key: "risk", label: "위험", emoji: "⚠️", value: risk, color: palette.red[400], comment: level(risk, "안전한 편", "조심해요", "크게 떨어져요") },
    { key: "resilience", label: "회복", emoji: "🤸", value: resilience, color: palette.cyan[400], comment: level(resilience, "느려요", "다시 올라와요", "금방 올라와요") },
  ]

  let title = "균형 잡힌 모범생"
  let emoji = "🧑‍🎓"
  let catchphrase = "큰 사고 없이 내 길을 가는 타입이야."
  if (volatility >= 60 && growth >= 60) {
    title = "롤러코스터 성장러"
    emoji = "🎢"
    catchphrase = "무섭게 흔들리지만, 결국 위로 달려가!"
  } else if (risk >= 67 && growth < 45) {
    title = "폭풍 속 승부사"
    emoji = "🌪️"
    catchphrase = "한 번 빠지면 깊어. 떨어지면 빨리 파는 게 좋아!"
  } else if (resilience >= 67) {
    title = "쓰러져도 오뚝이"
    emoji = "🤸"
    catchphrase = "넘어져도 금방 일어나. 바닥에서 날 믿어봐!"
  } else if (volatility >= 60) {
    title = "예측불가 변덕쟁이"
    emoji = "🃏"
    catchphrase = "뉴스 한 줄에 기분이 확확 바뀌어!"
  } else if (volatility < 34) {
    title = "느긋한 거북이"
    emoji = "🐢"
    catchphrase = "천천히, 하지만 꾸준히 가는 게 내 스타일."
  } else if (growth >= 60) {
    title = "꾸준한 우상향러"
    emoji = "🚀"
    catchphrase = "조금씩 쌓아서 크게 가는 타입이야."
  }

  return { title, emoji, catchphrase, stats }
}

/** 이름으로 시드를 만든 0~1 난수열 (같은 이름이면 항상 같은 모양) */
export function seededSeries(seedText: string, count: number): number[] {
  let h = 2166136261
  for (let i = 0; i < seedText.length; i++) {
    h ^= seedText.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const out: number[] = []
  for (let i = 0; i < count; i++) {
    h ^= h << 13
    h ^= h >>> 17
    h ^= h << 5
    out.push(((h >>> 0) % 10000) / 10000)
  }
  return out
}
