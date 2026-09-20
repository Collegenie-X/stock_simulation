import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import { StyleSheet, Text, View, type LayoutChangeEvent } from "react-native"
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from "react-native-svg"
import { RotateCcw } from "lucide-react-native"
import type { LegendaryScenario, ScenarioEvent } from "@/data/legendary-scenarios"
import { Float, Pop, PressableScale, Pulse } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { buildPrices } from "../utils/personality"

interface Props {
  scenario: LegendaryScenario
}

const HEIGHT = 190
const PAD_X = 18
const PAD_TOP = 72 // 캐릭터 + 말풍선 자리
const PAD_BOTTOM = 14
const SEG = 16 // 턴 하나를 몇 조각으로 그릴지
const PLAY_MS = 4200
const BUBBLE_W = 168

const SENTIMENT_COLOR: Record<ScenarioEvent["sentiment"], string> = {
  positive: palette.green[500],
  negative: palette.orange[400],
  shock: palette.red[500],
  neutral: palette.gray[500],
}

function faceFor(ev: ScenarioEvent | undefined, playing: boolean): string {
  if (!ev) return "🙂"
  const c = parseFloat(ev.priceChange)
  if (ev.sentiment === "shock" || c <= -5) return "😱"
  if (c >= 5) return "🤩"
  if (c >= 1) return playing ? "🏄" : "😆"
  if (c <= -1) return "😟"
  return "😐"
}

export function ScenarioPriceChart({ scenario }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "")
  const [W, setW] = useState(0)
  const [prog, setProg] = useState(0)
  const [sel, setSel] = useState<number | null>(null) // 선택한 턴 (1~n), 재생 중엔 null
  const [more, setMore] = useState(false)
  const rafRef = useRef(0)

  const prices = useMemo(() => buildPrices(scenario.events), [scenario])
  const n = prices.length - 1

  const play = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    setSel(null)
    setMore(false)
    setProg(0)
    const start = Date.now()
    const tick = () => {
      const p = Math.min((Date.now() - start) / PLAY_MS, 1)
      setProg(p)
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
      else setSel(n)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [n])

  useEffect(() => {
    play()
    return () => cancelAnimationFrame(rafRef.current)
  }, [play])

  const onLayout = (e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width)
    if (w !== W) setW(w)
  }

  // 턴 지점 + 부드러운 곡선 샘플
  const { nodes, samples } = useMemo(() => {
    const minP = Math.min(...prices)
    const range = Math.max(...prices) - minP || 1
    const chartH = HEIGHT - PAD_TOP - PAD_BOTTOM
    const nodes = prices.map((p, i) => ({
      x: PAD_X + (i / Math.max(n, 1)) * (W - PAD_X * 2),
      y: PAD_TOP + (1 - (p - minP) / range) * chartH,
    }))
    const samples: { x: number; y: number }[] = [nodes[0]]
    for (let i = 1; i < nodes.length; i++) {
      const a = nodes[i - 1]
      const b = nodes[i]
      for (let k = 1; k <= SEG; k++) {
        const t = k / SEG
        const e = t * t * (3 - 2 * t) // 부드러운 S자 연결
        samples.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * e })
      }
    }
    return { nodes, samples }
  }, [prices, n, W])

  const playing = sel === null
  const lastIdx = playing ? Math.max(1, Math.round(prog * (samples.length - 1))) : samples.length - 1
  const visible = samples.slice(0, lastIdx + 1)
  const turn = sel ?? Math.round(lastIdx / SEG)
  const event = turn > 0 ? scenario.events[turn - 1] : undefined
  const rider = sel === null ? visible[visible.length - 1] : nodes[sel]

  const totalReturn = prices[n] - 100
  const isPositive = totalReturn >= 0
  const lineColor = isPositive ? "#22c55e" : "#ef4444"
  const bottomY = HEIGHT - PAD_BOTTOM
  const lineD = visible.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")
  const areaD = `${lineD} L${visible[visible.length - 1].x.toFixed(1)},${bottomY} L${PAD_X},${bottomY} Z`
  const shownReturn = (prices[Math.min(turn, n)] ?? 100) - 100

  const bubbleLeft = Math.max(4, Math.min(W - BUBBLE_W - 4, rider.x - BUBBLE_W / 2))
  const changeColor = event && parseFloat(event.priceChange) < 0 ? palette.red[400] : palette.green[400]

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={{ fontSize: 10, color: palette.gray[500] }}>{playing ? "캐릭터가 파도를 타는 중…" : "숫자를 누르면 그때로 가요"}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: "900", color: shownReturn >= 0 ? palette.green[400] : palette.red[400], fontVariant: ["tabular-nums"] }}>
            {shownReturn >= 0 ? "+" : ""}
            {shownReturn.toFixed(1)}%
          </Text>
          <PressableScale onPress={play} style={styles.replay}>
            <RotateCcw size={11} color={palette.gray[300]} />
            <Text style={{ fontSize: 9, fontWeight: "700", color: palette.gray[300] }}>다시</Text>
          </PressableScale>
        </View>
      </View>

      <View style={{ height: HEIGHT }} onLayout={onLayout}>
        {W > 0 && (
          <>
            <Svg width={W} height={HEIGHT}>
              <Defs>
                <LinearGradient id={`g${uid}`} x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={lineColor} stopOpacity={0.25} />
                  <Stop offset="1" stopColor={lineColor} stopOpacity={0} />
                </LinearGradient>
              </Defs>

              {/* 시작 기준선 */}
              <Line x1={PAD_X} y1={nodes[0].y} x2={W - PAD_X} y2={nodes[0].y} stroke="white" strokeOpacity={0.12} strokeDasharray="3,3" />

              <Path d={areaD} fill={`url(#g${uid})`} />
              <Path d={lineD} fill="none" stroke={lineColor} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

              {/* 지나온 턴 지점 */}
              {nodes.map((p, i) => {
                if (i === 0 || i * SEG > lastIdx) return null
                const active = i === turn
                return <Circle key={i} cx={p.x} cy={p.y} r={active ? 5 : 3} fill={SENTIMENT_COLOR[scenario.events[i - 1].sentiment]} stroke="#12121a" strokeWidth={1.5} />
              })}
            </Svg>

            {/* 말풍선 */}
            {event && (
              <View pointerEvents="none" style={[styles.bubble, { left: bubbleLeft, top: Math.max(0, rider.y - 70) }]}>
                <Text numberOfLines={1} style={{ fontSize: 10, fontWeight: "700", color: "#ffffff" }}>
                  {turn}턴 · {event.title}
                </Text>
                <Text style={{ fontSize: 11, fontWeight: "900", color: changeColor }}>{event.priceChange}</Text>
              </View>
            )}

            {/* 선을 타는 캐릭터 */}
            <View pointerEvents="none" style={{ position: "absolute", left: rider.x - 13, top: rider.y - 30 }}>
              <Float duration={800} distance={3}>
                <Text style={{ fontSize: 20, lineHeight: 26, color: "#ffffff" }}>{faceFor(event, playing)}</Text>
              </Float>
            </View>
          </>
        )}
      </View>

      {/* 턴 뱃지 */}
      <View style={styles.turns}>
        {scenario.events.map((ev, i) => {
          const t = i + 1
          const reached = t * SEG <= lastIdx
          const active = t === turn
          const color = SENTIMENT_COLOR[ev.sentiment]
          const badge = (
            <View style={[styles.turnBadge, { borderColor: reached ? color : palette.gray[700], backgroundColor: active ? color : alpha(color, reached ? 0.15 : 0) }]}>
              <Text style={{ fontSize: 11, fontWeight: "900", color: active ? "#111111" : reached ? color : palette.gray[600] }}>{t}</Text>
            </View>
          )
          return (
            <PressableScale
              key={t}
              scaleTo={0.85}
              onPress={() => {
                cancelAnimationFrame(rafRef.current)
                setProg(1)
                setSel(t)
              }}
              style={{ flex: 1, alignItems: "center" }}
            >
              {active && playing ? <Pulse duration={600}>{badge}</Pulse> : badge}
            </PressableScale>
          )
        })}
      </View>

      {/* 선택한 턴 한 줄 요약 (+ 자세히) */}
      {!playing && event && (
        <Pop key={sel} style={styles.detail}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={[styles.dot, { backgroundColor: SENTIMENT_COLOR[event.sentiment] }]} />
            <Text numberOfLines={1} style={{ flex: 1, fontSize: 12, fontWeight: "700", color: "#ffffff" }}>
              {event.title}
            </Text>
            <PressableScale onPress={() => setMore(!more)}>
              <Text style={{ fontSize: 10, fontWeight: "700", color: palette.purple[400] }}>{more ? "접기" : "자세히 보기"}</Text>
            </PressableScale>
          </View>
          {more && <Text style={{ fontSize: 11, color: palette.gray[300], lineHeight: 17, marginTop: 6 }}>{event.description}</Text>}
        </Pop>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#12121a", borderRadius: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.08), overflow: "hidden" },
  head: { paddingHorizontal: 12, paddingTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  replay: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999, backgroundColor: alpha("#ffffff", 0.08) },
  bubble: { position: "absolute", width: BUBBLE_W, alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: alpha("#000000", 0.75), borderWidth: 1, borderColor: alpha("#ffffff", 0.12) },
  turns: { flexDirection: "row", paddingHorizontal: 8, paddingBottom: 10 },
  turnBadge: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  detail: { marginHorizontal: 10, marginBottom: 10, padding: 10, borderRadius: 12, backgroundColor: alpha("#ffffff", 0.05) },
  dot: { width: 8, height: 8, borderRadius: 4 },
})
