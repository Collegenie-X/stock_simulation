import { useEffect, useId, useRef, useState } from "react"
import { Animated, Easing, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native"
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from "react-native-svg"
import { formatNumber } from "@/lib/format"
import { Float } from "@/components/ui"
import { alpha } from "@/theme"
import type { ActionType, TradeRecord } from "../utils"

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

const BADGE_ACTION_COLOR: Record<ActionType, string> = {
  buy: "#ef4444",
  sell: "#3b82f6",
  hold: "#4b5563",
}

export function LiveChart({
  points,
  animProg,
  isUp,
  height = 200,
  turnSize = 20,
  trades,
  rider,
}: {
  points: number[]
  animProg: number
  isUp: boolean
  height?: number
  turnSize?: number
  trades?: TradeRecord[]
  /** 차트 끝점을 타고 다니는 캐릭터(이모지) */
  rider?: string
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "")
  const [W, setW] = useState(0)
  const pulse = useRef(new Animated.Value(0)).current

  // 웹 <animate> (r 7→13→7, fill-opacity 0.15→0→0.15, 1.5s) 대체
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 750, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 750, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ]),
    )
    anim.start()
    return () => anim.stop()
  }, [pulse])

  const onLayout = (e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width)
    if (w !== W) setW(w)
  }

  if (points.length < 2) return <View style={[styles.empty, { height }]} />

  const visCount = Math.max(2, Math.ceil(points.length * animProg))
  const visible = points.slice(0, visCount)
  const min = Math.min(...points) * 0.996
  const max = Math.max(...points) * 1.004
  const range = max - min || 1
  const PX = 6
  // 거래 뱃지 표시 시 하단 여백 확보
  const PY = 16
  const BADGE_H = trades && trades.length > 0 ? 22 : 0
  const chartH = height - PY * 2 - BADGE_H
  const toX = (i: number) => PX + (i / Math.max(points.length - 1, 1)) * (W - PX * 2)
  const toY = (p: number) => PY + chartH - ((p - min) / range) * chartH
  const pathD = visible.map((p, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(2)},${toY(p).toFixed(2)}`).join(" ")
  const lx = toX(visible.length - 1)
  const ly = toY(visible[visible.length - 1])
  const areaD = `${pathD} L${lx.toFixed(2)},${PY + chartH} L${PX},${PY + chartH} Z`
  const stroke = isUp ? "#ef4444" : "#3b82f6"
  const startPrice = points[0]
  const startY = toY(startPrice)

  // 각 거래 뱃지의 x 위치: 각 턴 끝 지점
  const tradeBadges = (trades ?? []).map((trade, i) => {
    const ptIdx = Math.min((i + 1) * turnSize, points.length - 1)
    const bx = toX(ptIdx)
    const by = PY + chartH + BADGE_H / 2 + 2 // 차트 하단 뱃지 영역 중앙
    const color = BADGE_ACTION_COLOR[trade.action]
    return { bx, by, color, num: i + 1, action: trade.action }
  })

  const priceLabels = [min, min + range * 0.5, max].map((p) => ({
    y: toY(p),
    label: formatNumber(Math.round(p)),
  }))

  // 현재가 라벨이 좌우로 잘리지 않도록 보정
  const labelX = Math.max(PX + 38, Math.min(W - PX - 38, lx))
  const labelY = Math.max(2, ly - 20)
  // 캐릭터: 현재가 라벨 위, 공간이 없으면 끝점 아래
  const riderSize = 26
  const riderX = Math.max(0, Math.min(W - riderSize - 4, lx - riderSize / 2))
  const riderY = labelY - riderSize - 2 >= 0 ? labelY - riderSize - 2 : ly + 10

  return (
    <View style={styles.card}>
      <View style={{ height }} onLayout={onLayout}>
        {W > 0 && (
          <Svg width={W} height={height}>
            <Defs>
              <LinearGradient id={`cg${uid}`} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={stroke} stopOpacity={0.2} />
                <Stop offset="1" stopColor={stroke} stopOpacity={0} />
              </LinearGradient>
            </Defs>

            {[0.2, 0.4, 0.6, 0.8].map((r) => (
              <Line key={r} x1={PX} x2={W - PX} y1={PY + chartH * r} y2={PY + chartH * r} stroke="#ffffff" strokeOpacity={0.03} strokeDasharray="4 4" />
            ))}

            {/* 턴 구분선 + 뱃지 연결선 */}
            {tradeBadges.map(({ bx, by, color, num }) => (
              <Line key={num} x1={bx} x2={bx} y1={PY} y2={by - 10} stroke={color} strokeOpacity={0.25} strokeDasharray="2 3" />
            ))}

            <Line x1={PX} x2={W - PX} y1={startY} y2={startY} stroke="#888" strokeOpacity={0.15} strokeDasharray="3 3" />

            <Path d={areaD} fill={`url(#cg${uid})`} />
            <Path d={pathD} fill="none" stroke={stroke} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

            {/* 차트 끝점 pulse */}
            <Circle cx={lx} cy={ly} r={4} fill={stroke} />
            <AnimatedCircle
              cx={lx}
              cy={ly}
              r={pulse.interpolate({ inputRange: [0, 1], outputRange: [7, 13] })}
              fill={stroke}
              fillOpacity={pulse.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0] })}
            />

            {/* 현재가 라벨 */}
            <Rect x={labelX - 38} y={labelY} width={76} height={16} rx={4} fill={stroke} fillOpacity={0.9} />
            <SvgText x={labelX} y={labelY + 11} textAnchor="middle" fontSize={9} fontWeight="bold" fill="white">
              {formatNumber(Math.round(visible[visible.length - 1]))}
            </SvgText>

            {priceLabels.map((pl, i) => (
              <SvgText key={i} x={W - PX - 2} y={pl.y + 3} textAnchor="end" fontSize={7} fill="#555">
                {pl.label}
              </SvgText>
            ))}

            <SvgText x={PX + 2} y={startY - 4} textAnchor="start" fontSize={7} fill="#666">
              시작
            </SvgText>

            {/* 거래 번호 뱃지 */}
            {tradeBadges.map(({ bx, by, color, num }) => (
              <G key={num}>
                {/* 차트 라인 위 점 */}
                <Circle cx={bx} cy={toY(points[Math.min((num - 1) * turnSize + (turnSize - 1), points.length - 1)])} r={3} fill={color} stroke="#111118" strokeWidth={1.5} />
                {/* 하단 번호 원 */}
                <Circle cx={bx} cy={by} r={9} fill={color} fillOpacity={0.9} />
                <Circle cx={bx} cy={by} r={9} fill="none" stroke="#111118" strokeWidth={1} />
                <SvgText x={bx} y={by + 3.5} textAnchor="middle" fontSize={9} fontWeight="bold" fill="white">
                  {String(num)}
                </SvgText>
              </G>
            ))}
          </Svg>
        )}
        {W > 0 && !!rider && (
          <View pointerEvents="none" style={{ position: "absolute", left: riderX, top: riderY }}>
            <Float duration={900} distance={4}>
              <Text style={{ fontSize: 20, lineHeight: riderSize, color: "#ffffff" }}>{rider}</Text>
            </Float>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  empty: { backgroundColor: "#111118", borderRadius: 16 },
  card: { backgroundColor: "#111118", borderRadius: 16, padding: 8, borderWidth: 1, borderColor: alpha("#ffffff", 0.05) },
})
