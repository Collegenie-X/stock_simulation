import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { StyleSheet, Text, View, type LayoutChangeEvent } from "react-native"
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from "react-native-svg"
import { RotateCcw } from "lucide-react-native"
import type { ChartData, ChartHighlight } from "@/data/chart-patterns"
import { Float, Pop, PressableScale, Pulse } from "@/components/ui"
import { alpha, palette } from "@/theme"

const HEIGHT = 200
const PAD_X = 18
const PAD_TOP = 70 // 캐릭터 + 말풍선 자리
const PAD_BOTTOM = 14
const SEG = 14 // 점과 점 사이를 몇 조각으로 그릴지
const PLAY_MS = 3600
const BUBBLE_W = 170

const TYPE_COLOR: Record<ChartHighlight["type"], string> = {
  buy: palette.green[500],
  sell: palette.red[500],
  info: palette.blue[400],
  danger: palette.orange[400],
}

const TYPE_WORD: Record<ChartHighlight["type"], string> = {
  buy: "여기서 사면 좋아요",
  sell: "여기서 파는 게 좋아요",
  info: "여기를 잘 보세요",
  danger: "여기는 조심해요",
}

interface Props {
  chartData: ChartData
  signal: "매수" | "매도" | "양방향"
}

export function PatternLiveChart({ chartData, signal }: Props) {
  const uid = useRef(`plc${Math.random().toString(36).slice(2, 9)}`).current
  const [W, setW] = useState(0)
  const [prog, setProg] = useState(0)
  const [sel, setSel] = useState<number | null>(null) // 선택한 포인트, 그리는 중엔 null
  const rafRef = useRef(0)

  const lineColor = signal === "매도" ? "#ef4444" : signal === "매수" ? "#22c55e" : "#f59e0b"
  const highlights = chartData.highlights

  const play = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    setSel(null)
    setProg(0)
    const start = Date.now()
    const tick = () => {
      const p = Math.min((Date.now() - start) / PLAY_MS, 1)
      setProg(p)
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    play()
    return () => cancelAnimationFrame(rafRef.current)
  }, [play])

  const onLayout = (e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width)
    if (w !== W) setW(w)
  }

  const chartH = HEIGHT - PAD_TOP - PAD_BOTTOM
  const toX = useCallback((x: number) => PAD_X + (x / 100) * (W - PAD_X * 2), [W])
  const toY = useCallback((y: number) => PAD_TOP + (y / 100) * chartH, [chartH])

  // 부드럽게 이은 샘플 (그려지는 애니메이션용)
  const samples = useMemo(() => {
    const nodes = chartData.points.map(([x, y]) => ({ x: toX(x), y: toY(y) }))
    const out: { x: number; y: number }[] = [nodes[0]]
    for (let i = 1; i < nodes.length; i++) {
      const a = nodes[i - 1]
      const b = nodes[i]
      for (let k = 1; k <= SEG; k++) {
        const t = k / SEG
        const e = t * t * (3 - 2 * t)
        out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * e })
      }
    }
    return out
  }, [chartData, toX, toY])

  const drawing = prog < 1
  const lastIdx = Math.max(1, Math.round(prog * (samples.length - 1)))
  const visible = samples.slice(0, lastIdx + 1)
  const head = visible[visible.length - 1]

  // 머리 부분의 기울기로 표정 결정 (y 가 작아질수록 가격 상승)
  const prev = visible[Math.max(0, visible.length - 4)]
  const slope = prev.y - head.y
  const face = slope > 6 ? "🤩" : slope > 1 ? "😆" : slope < -6 ? "😱" : slope < -1 ? "😟" : "😐"

  const bottomY = HEIGHT - PAD_BOTTOM
  const lineD = visible.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")
  const areaD = `${lineD} L${head.x.toFixed(1)},${bottomY} L${PAD_X},${bottomY} Z`

  // 그리는 중에는 방금 지나온 포인트를, 멈춘 뒤에는 누른 포인트를 설명합니다
  const passedIdx = highlights.reduce((acc, h, i) => (W > 0 && toX(h.x) <= head.x + 1 ? i : acc), -1)
  const shownIdx = sel !== null ? sel : drawing && passedIdx >= 0 ? passedIdx : null
  const shown = shownIdx !== null ? highlights[shownIdx] : null
  const marker = sel !== null && shown ? { x: toX(shown.x), y: toY(shown.y) } : null
  const bubbleAt = marker ?? head
  const bubbleLeft = Math.max(4, Math.min(Math.max(W - BUBBLE_W - 4, 4), bubbleAt.x - BUBBLE_W / 2))
  const riderAt = marker ?? head

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={{ fontSize: 10, color: palette.gray[500] }}>{drawing ? "모양이 그려지는 중…" : "번호를 누르면 설명이 나와요"}</Text>
        <PressableScale onPress={play} style={styles.replay}>
          <RotateCcw size={11} color={palette.gray[300]} />
          <Text style={{ fontSize: 9, fontWeight: "700", color: palette.gray[300] }}>다시</Text>
        </PressableScale>
      </View>

      <View style={{ height: HEIGHT }} onLayout={onLayout}>
        {W > 0 && (
          <>
            <Svg width={W} height={HEIGHT}>
              <Defs>
                <LinearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={lineColor} stopOpacity={0.25} />
                  <Stop offset="1" stopColor={lineColor} stopOpacity={0} />
                </LinearGradient>
              </Defs>

              {/* 기준선(넥라인) */}
              {chartData.necklineY !== null && (
                <Line x1={PAD_X} y1={toY(chartData.necklineY)} x2={W - PAD_X} y2={toY(chartData.necklineY)} stroke={palette.yellow[400]} strokeOpacity={0.45} strokeDasharray="4,4" />
              )}

              <Path d={areaD} fill={`url(#${uid})`} />
              <Path d={lineD} fill="none" stroke={lineColor} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

              {/* 지나온 포인트 */}
              {highlights.map((h, i) => {
                const hx = toX(h.x)
                if (hx > head.x + 1) return null
                const active = i === shownIdx
                return <Circle key={i} cx={hx} cy={toY(h.y)} r={active ? 6 : 4} fill={TYPE_COLOR[h.type]} stroke="#12121a" strokeWidth={1.5} />
              })}
            </Svg>

            {/* 말풍선 */}
            {shown && (
              <View pointerEvents="none" style={[styles.bubble, { left: bubbleLeft, top: Math.max(0, bubbleAt.y - 66) }]}>
                <Text numberOfLines={1} style={{ fontSize: 11, fontWeight: "900", color: "#ffffff" }}>
                  {(shownIdx ?? 0) + 1}. {shown.label}
                </Text>
                <Text style={{ fontSize: 10, fontWeight: "700", color: TYPE_COLOR[shown.type] }}>{TYPE_WORD[shown.type]}</Text>
              </View>
            )}

            {/* 선을 타는 캐릭터 */}
            <View pointerEvents="none" style={{ position: "absolute", left: riderAt.x - 13, top: riderAt.y - 32 }}>
              <Float duration={800} distance={3}>
                <Text style={{ fontSize: 20, lineHeight: 26, color: "#ffffff" }}>{face}</Text>
              </Float>
            </View>
          </>
        )}
      </View>

      {/* 포인트 뱃지 */}
      <View style={styles.badges}>
        {highlights.map((h, i) => {
          const reached = W > 0 && toX(h.x) <= head.x + 1
          const active = i === sel
          const color = TYPE_COLOR[h.type]
          const badge = (
            <View style={[styles.badge, { borderColor: reached ? color : palette.gray[700], backgroundColor: active ? color : alpha(color, reached ? 0.15 : 0) }]}>
              <Text style={{ fontSize: 11, fontWeight: "900", color: active ? "#111111" : reached ? color : palette.gray[600] }}>{i + 1}</Text>
            </View>
          )
          return (
            <PressableScale
              key={i}
              scaleTo={0.85}
              onPress={() => {
                cancelAnimationFrame(rafRef.current)
                setProg(1)
                setSel(sel === i ? null : i)
              }}
              style={{ flex: 1, alignItems: "center" }}
            >
              {drawing && reached ? <Pulse duration={700}>{badge}</Pulse> : badge}
            </PressableScale>
          )
        })}
      </View>

      {/* 선택한 포인트 설명 */}
      {sel !== null && shown && (
        <Pop key={sel} style={styles.detail}>
          <View style={[styles.dot, { backgroundColor: TYPE_COLOR[shown.type] }]} />
          <Text style={{ flex: 1, fontSize: 12, fontWeight: "700", color: "#ffffff" }}>
            {sel + 1}. {shown.label}
          </Text>
          <Text style={{ fontSize: 11, fontWeight: "700", color: TYPE_COLOR[shown.type] }}>{TYPE_WORD[shown.type]}</Text>
        </Pop>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#12121a", borderRadius: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.08), overflow: "hidden" },
  head: { paddingHorizontal: 12, paddingTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  replay: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999, backgroundColor: alpha("#ffffff", 0.08) },
  bubble: { position: "absolute", width: BUBBLE_W, alignItems: "center", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10, backgroundColor: alpha("#000000", 0.75), borderWidth: 1, borderColor: alpha("#ffffff", 0.12) },
  badges: { flexDirection: "row", paddingHorizontal: 8, paddingBottom: 10 },
  badge: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  detail: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 10, marginBottom: 10, padding: 10, borderRadius: 12, backgroundColor: alpha("#ffffff", 0.05) },
  dot: { width: 8, height: 8, borderRadius: 4 },
})
