/**
 * 차트 패턴을 "캐릭터"로 보여주기 위한 성격 수치 계산
 * — chart-patterns.json 안의 값들로만 만들기 때문에 16개 패턴 전부에 자동 적용됩니다.
 */
import type { ChartPattern } from "@/data/chart-patterns"
import { palette } from "@/theme"

export interface PatternStat {
  key: "difficulty" | "reliability" | "wobble" | "power"
  label: string
  emoji: string
  value: number // 0~100
  color: string
  comment: string
}

export interface PatternPersona {
  title: string
  emoji: string
  catchphrase: string
  signalWord: string
  color: string
  stats: PatternStat[]
}

const clamp = (v: number) => Math.max(6, Math.min(100, Math.round(v)))
const level = (v: number, low: string, mid: string, high: string) => (v >= 67 ? high : v >= 34 ? mid : low)

export function getPatternPersona(pattern: ChartPattern): PatternPersona {
  // chartData 의 y 는 위가 0 → 가격으로 바꾸려면 뒤집어야 함
  const prices = pattern.chartData.points.map(([, y]) => 100 - y)
  let move = 0
  for (let i = 1; i < prices.length; i++) move += Math.abs(prices[i] - prices[i - 1])
  const avgMove = move / Math.max(prices.length - 1, 1)
  const swing = Math.max(...prices) - Math.min(...prices)

  const difficulty = clamp((pattern.difficulty / 5) * 100)
  const reliability = clamp((pattern.reliability / 5) * 100)
  const wobble = clamp((avgMove / 18) * 100)
  const power = clamp((swing / 70) * 100)

  const stats: PatternStat[] = [
    { key: "reliability", label: "믿음직", emoji: "🎯", value: reliability, color: palette.green[400], comment: level(reliability, "가끔 틀려요", "쓸만해요", "잘 맞아요") },
    { key: "difficulty", label: "어려움", emoji: "🧩", value: difficulty, color: palette.purple[400], comment: level(difficulty, "쉬워요", "보통이에요", "어려워요") },
    { key: "wobble", label: "흔들림", emoji: "🎢", value: wobble, color: palette.orange[400], comment: level(wobble, "잔잔해요", "꽤 흔들려요", "엄청 흔들려요") },
    { key: "power", label: "움직임", emoji: "💪", value: power, color: palette.cyan[400], comment: level(power, "조금 움직여요", "제법 움직여요", "크게 움직여요") },
  ]

  const strong = pattern.reliability >= 4

  if (pattern.signal === "매수") {
    return {
      title: strong ? "믿음직한 상승 신호등" : "살짝 수줍은 상승 신호등",
      emoji: "🚦",
      signalWord: "곧 오를 수 있어요",
      catchphrase: strong ? "내가 보이면 올라갈 준비! 살 자리를 찾아봐." : "오를 것 같긴 한데, 확인하고 사는 게 좋아!",
      color: palette.green[400],
      stats,
    }
  }
  if (pattern.signal === "매도") {
    return {
      title: strong ? "무서운 하락 경고등" : "조심하라는 하락 경고등",
      emoji: "🚨",
      signalWord: "곧 떨어질 수 있어요",
      catchphrase: strong ? "내가 보이면 도망칠 준비! 팔 자리를 찾아봐." : "떨어질 수도 있어. 욕심부리지 말고 지켜봐!",
      color: palette.red[400],
      stats,
    }
  }
  return {
    title: "어느 쪽이든 가는 변덕쟁이",
    emoji: "🎭",
    signalWord: "위아래 둘 다 가능해요",
    catchphrase: "위로 갈지 아래로 갈지 나도 몰라. 터지는 쪽으로 따라가!",
    color: palette.yellow[400],
    stats,
  }
}

/** "① ~ ② ~ ③ ~" 같은 문장을 단계 칩으로 쪼갭니다 */
export function splitSteps(text: string): string[] {
  const parts = text
    .replace(/[①②③④⑤⑥⑦⑧⑨]/g, (m) => `\n${m}`)
    .split("\n")
    .map((t) => t.replace(/^[①②③④⑤⑥⑦⑧⑨]\s*/, "").trim())
    .filter(Boolean)
  return parts.length > 1 ? parts : []
}
