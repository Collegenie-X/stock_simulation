import React, { useEffect, useMemo, useRef, useState } from "react"
import { Animated, Easing, StyleSheet, Text, View, useWindowDimensions } from "react-native"
import Svg, { Circle, Defs, Line, Path, RadialGradient, Rect, Stop } from "react-native-svg"

interface Candle {
  x: number
  open: number
  close: number
  high: number
  low: number
  color: string
}

interface Particle {
  id: number
  x: number
  vx: number
  vy: number
  emoji: string
}

const CANDLE_COUNT = 40
const EMOJIS = ["📈", "📉", "💰", "🎯", "⚡", "🔥", "💎", "🚀"]
/** 웹: 프레임(60fps)당 0.3 진행. 앱은 50ms(=3프레임) 간격으로 0.9 씩 진행해 같은 속도를 유지 */
const TICK_MS = 50
const STEP_PER_TICK = 0.9
/** 웹: life 1 → 0, 프레임당 -0.002 ⇒ 500프레임 ≈ 8.3초 */
const PARTICLE_LIFE_MS = (1 / 0.002 / 60) * 1000

function generateCandles(W: number, H: number): Candle[] {
  const candleW = W / CANDLE_COUNT
  const candles: Candle[] = []
  let price = H * 0.45
  for (let i = 0; i < CANDLE_COUNT; i++) {
    const change = (Math.random() - 0.48) * 30
    const open = price
    price += change
    const close = price
    const high = Math.max(open, close) + Math.random() * 15
    const low = Math.min(open, close) - Math.random() * 15
    const isUp = close > open
    candles.push({
      x: i * candleW + candleW * 0.5,
      open,
      close,
      high,
      low,
      color: isUp ? "rgba(239,68,68,0.6)" : "rgba(59,130,246,0.6)",
    })
  }
  return candles
}

/** 아래에서 위로 떠오르며 사라지는 이모지 파티클 (웹 canvas 파티클 대체) */
function FloatingEmoji({ p, H, onDone }: { p: Particle; H: number; onDone: (id: number) => void }) {
  const v = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const anim = Animated.timing(v, { toValue: 1, duration: PARTICLE_LIFE_MS, easing: Easing.linear, useNativeDriver: true })
    anim.start(({ finished }) => finished && onDone(p.id))
    return () => anim.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const frames = PARTICLE_LIFE_MS / (1000 / 60)
  return (
    <Animated.View
      style={{
        position: "absolute",
        left: p.x,
        top: H + 20,
        opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] }),
        transform: [
          { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, p.vx * frames] }) },
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, p.vy * frames] }) },
        ],
      }}
    >
      <Text style={{ fontSize: 20, color: "#ffffff" }}>{p.emoji}</Text>
    </Animated.View>
  )
}

export default function ChartBackground() {
  const { width: W, height: H } = useWindowDimensions()
  const [candles, setCandles] = useState<Candle[]>(() => generateCandles(W, H))
  const [drawProgress, setDrawProgress] = useState(0)
  const [particles, setParticles] = useState<Particle[]>([])
  const progressRef = useRef(0)
  const idRef = useRef(0)

  // 화면 크기가 바뀌면 다시 생성 (웹 resize 핸들러)
  useEffect(() => {
    progressRef.current = 0
    setDrawProgress(0)
    setCandles(generateCandles(W, H))
  }, [W, H])

  useEffect(() => {
    const interval = setInterval(() => {
      if (progressRef.current >= CANDLE_COUNT + 30) {
        // regenerate when done
        progressRef.current = 0
        setCandles(generateCandles(W, H))
        setDrawProgress(0)
        return
      }
      progressRef.current += STEP_PER_TICK
      // 모든 캔들이 그려진 뒤에는 화면이 변하지 않으므로 리렌더 생략
      if (progressRef.current <= CANDLE_COUNT + STEP_PER_TICK) setDrawProgress(progressRef.current)
    }, TICK_MS)
    return () => clearInterval(interval)
  }, [W, H])

  // 웹: 60프레임(1초)마다 파티클 생성, 최대 13개
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) => {
        if (prev.length > 12) return prev
        return [
          ...prev,
          {
            id: ++idRef.current,
            x: Math.random() * W,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -(0.3 + Math.random() * 0.7),
            emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
          },
        ]
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [W])

  const removeParticle = (id: number) => setParticles((prev) => prev.filter((p) => p.id !== id))

  const candleW = W / CANDLE_COUNT
  const visibleCount = Math.min(Math.floor(drawProgress), CANDLE_COUNT)

  const gridLines = useMemo(() => {
    const ys: number[] = []
    for (let y = 0; y < H; y += 60) ys.push(y)
    return ys
  }, [H])

  let linePath = ""
  for (let i = 0; i < visibleCount; i++) {
    const c = candles[i]
    const y = (c.open + c.close) / 2
    linePath += `${i === 0 ? "M" : " L"} ${c.x} ${y}`
  }
  const lastVisible = visibleCount > 1 ? candles[visibleCount - 1] : null
  const lastY = lastVisible ? (lastVisible.open + lastVisible.close) / 2 : 0

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={W} height={H}>
        <Defs>
          <RadialGradient id="introChartGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="rgb(100,140,255)" stopOpacity={0.3} />
            <Stop offset="1" stopColor="rgb(100,140,255)" stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {/* grid lines */}
        {gridLines.map((y) => (
          <Line key={y} x1={0} y1={y} x2={W} y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
        ))}

        {/* draw line + glow */}
        {visibleCount > 1 && !!lastVisible && (
          <>
            <Path d={linePath} stroke="rgba(100,140,255,0.25)" strokeWidth={2} fill="none" />
            <Circle cx={lastVisible.x} cy={lastY} r={40} fill="url(#introChartGlow)" />
          </>
        )}

        {/* candlesticks */}
        {candles.slice(0, visibleCount).map((c, i) => {
          const a = i === visibleCount - 1 && drawProgress < CANDLE_COUNT ? Math.min(1, (drawProgress % 1) + 0.3) : 1
          const bodyTop = Math.min(c.open, c.close)
          const bodyH = Math.max(Math.abs(c.close - c.open), 2)
          return (
            <React.Fragment key={i}>
              <Line x1={c.x} y1={c.high} x2={c.x} y2={c.low} stroke={c.color} strokeWidth={1} opacity={a * 0.7} />
              <Rect x={c.x - candleW * 0.3} y={bodyTop} width={candleW * 0.6} height={bodyH} fill={c.color} opacity={a * 0.7} />
            </React.Fragment>
          )
        })}
      </Svg>

      {/* particles */}
      {particles.map((p) => (
        <FloatingEmoji key={p.id} p={p} H={H} onDone={removeParticle} />
      ))}
    </View>
  )
}
