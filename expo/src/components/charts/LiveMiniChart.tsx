/**
 * LiveMiniChart — 목록 카드용 "살아 움직이는" 미니 차트
 * 선이 왼쪽부터 스스로 그려지고, 점이 선을 따라 달려갑니다.
 * 화면에 여러 개가 동시에 있어도 무겁지 않도록 하나의 공용 시계(useChartClock)로 함께 움직입니다.
 */
import React, { useEffect, useMemo, useRef } from "react"
import { Animated, Easing, View, type StyleProp, type ViewStyle } from "react-native"
import Svg, { Defs, LinearGradient, Path, Stop, Circle } from "react-native-svg"

const AnimatedPath = Animated.createAnimatedComponent(Path)
const AnimatedCircle = Animated.createAnimatedComponent(Circle)

// ── 공용 시계 ──────────────────────────────────────────────────────
const CLOCK_MS = 3400
/** 선이 다 그려지는 시점 (나머지 구간은 잠시 멈춤) */
const DRAW_END = 0.45

let clockValue: Animated.Value | null = null
let clockAnim: Animated.CompositeAnimation | null = null
let refCount = 0

/** 마운트된 미니 차트들이 함께 쓰는 0→1 반복 시계 */
export function useChartClock(): Animated.Value {
  if (!clockValue) clockValue = new Animated.Value(0)
  const value = clockValue

  useEffect(() => {
    refCount += 1
    if (refCount === 1) {
      value.setValue(0)
      clockAnim = Animated.loop(Animated.timing(value, { toValue: 1, duration: CLOCK_MS, easing: Easing.linear, useNativeDriver: false }))
      clockAnim.start()
    }
    return () => {
      refCount -= 1
      if (refCount === 0) {
        clockAnim?.stop()
        clockAnim = null
      }
    }
  }, [value])

  return value
}

export interface MiniPoint {
  /** 0(왼쪽) ~ 1(오른쪽) */
  x: number
  /** 0(아래) ~ 1(위) */
  y: number
}

interface Props {
  points: MiniPoint[]
  color: string
  width?: number
  height?: number
  area?: boolean
  strokeWidth?: number
  style?: StyleProp<ViewStyle>
}

export function LiveMiniChart({ points, color, width = 64, height = 36, area = true, strokeWidth = 2, style }: Props) {
  const clock = useChartClock()
  const uid = useRef(`lmc${Math.random().toString(36).slice(2, 9)}`).current

  const geom = useMemo(() => {
    const pad = strokeWidth + 1
    const w = Math.max(width - pad * 2, 1)
    const h = Math.max(height - pad * 2, 1)
    const xs = points.map((p) => pad + p.x * w)
    const ys = points.map((p) => pad + (1 - p.y) * h)

    // 부드러운 곡선
    let d = `M${xs[0].toFixed(2)},${ys[0].toFixed(2)}`
    for (let i = 1; i < xs.length; i++) {
      const cx = (xs[i - 1] + xs[i]) / 2
      d += ` C${cx.toFixed(2)},${ys[i - 1].toFixed(2)} ${cx.toFixed(2)},${ys[i].toFixed(2)} ${xs[i].toFixed(2)},${ys[i].toFixed(2)}`
    }
    const areaD = `${d} L${xs[xs.length - 1].toFixed(2)},${height} L${xs[0].toFixed(2)},${height} Z`

    // 길이(근사) + 점이 달려갈 구간
    const seg: number[] = [0]
    let total = 0
    for (let i = 1; i < xs.length; i++) {
      total += Math.hypot(xs[i] - xs[i - 1], ys[i] - ys[i - 1])
      seg.push(total)
    }
    const len = Math.max(total * 1.06, 1)

    // interpolate 입력은 항상 증가해야 함
    const inputs: number[] = []
    seg.forEach((s, i) => {
      const v = total > 0 ? (s / total) * DRAW_END : (i / Math.max(seg.length - 1, 1)) * DRAW_END
      inputs.push(i === 0 ? 0 : Math.max(v, inputs[i - 1] + 0.0001))
    })
    inputs.push(1)

    return { d, areaD, len, inputs, xs: [...xs, xs[xs.length - 1]], ys: [...ys, ys[ys.length - 1]] }
  }, [points, width, height, strokeWidth])

  if (points.length < 2) return <View style={[{ width, height }, style]} />

  return (
    <View style={[{ width, height }, style]}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={0.28} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {area && (
          <AnimatedPath
            d={geom.areaD}
            fill={`url(#${uid})`}
            opacity={clock.interpolate({ inputRange: [0, DRAW_END, 1], outputRange: [0.2, 1, 1] })}
          />
        )}

        <AnimatedPath
          d={geom.d}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={`${geom.len}`}
          strokeDashoffset={clock.interpolate({ inputRange: [0, DRAW_END, 1], outputRange: [geom.len, 0, 0] })}
        />

        {/* 선을 따라 달리는 점 */}
        <AnimatedCircle
          r={strokeWidth + 0.5}
          fill={color}
          cx={clock.interpolate({ inputRange: geom.inputs, outputRange: geom.xs })}
          cy={clock.interpolate({ inputRange: geom.inputs, outputRange: geom.ys })}
          opacity={clock.interpolate({ inputRange: [0, 0.05, DRAW_END, 0.92, 1], outputRange: [0, 1, 1, 1, 0] })}
        />
      </Svg>
    </View>
  )
}

/** 가격 배열 → LiveMiniChart 좌표 (0~1) */
export function valuesToPoints(values: number[]): MiniPoint[] {
  const min = Math.min(...values)
  const range = Math.max(...values) - min || 1
  return values.map((v, i) => ({ x: i / Math.max(values.length - 1, 1), y: (v - min) / range }))
}
