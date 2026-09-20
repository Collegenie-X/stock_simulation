import React, { useId } from "react"
import Svg, { Circle, Defs, G, Line, LinearGradient, Polygon, Polyline, Rect, Stop, Text as SvgText } from "react-native-svg"
import type { Candle } from "@/data/pattern-practice"
import { formatNumber } from "@/lib/format"

interface LineChartProps {
  candles: Candle[]
  visibleCount: number
  buyTurns?: number[]
  sellTurns?: number[]
  /** 차트 끝을 타고 다니는 캐릭터 (등락에 따라 표정이 바뀜) */
  rider?: boolean
}

/**
 * 종가 선 그래프 (웹 practice/page.tsx 의 LineChart)
 * - SVG filter(glow) 는 react-native-svg 에서 지원되지 않아 반투명 후광 도형으로 대체
 */
export function LineChart({ candles, visibleCount, buyTurns, sellTurns, rider = true }: LineChartProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "")
  const visible = candles.slice(0, visibleCount)
  if (visible.length === 0) return null
  const W = 400
  const H = 260
  const MR = 68
  const ML = 8
  const MT = 20
  const MB = 20
  const drawW = W - MR - ML
  const drawH = H - MT - MB
  const closes = visible.map((c) => c.close)
  const maxP = Math.max(...closes)
  const minP = Math.min(...closes)
  const range = maxP - minP || 1
  const pad = range * 0.12
  const yMax = maxP + pad
  const yMin = minP - pad
  const pToY = (p: number) => MT + drawH * (1 - (p - yMin) / (yMax - yMin))
  const iToX = (i: number) => ML + (drawW / Math.max(visible.length - 1, 1)) * i
  const gridPrices = Array.from({ length: 3 }, (_, i) => yMin + ((yMax - yMin) * (i + 1)) / 4)
  const linePoints = visible.map((c, i) => `${iToX(i)},${pToY(c.close)}`).join(" ")
  const first = visible[0]
  const last = visible[visible.length - 1]
  const prevClose = visible.length > 1 ? visible[visible.length - 2].close : last.close
  const trendUp = last.close >= first.close
  const lastUp = last.close >= prevClose
  const lineColor = trendUp ? "#4ade80" : "#f87171"
  const areaPoints = `${iToX(0)},${pToY(first.close)} ${linePoints} ${iToX(visible.length - 1)},${H - MB} ${iToX(0)},${H - MB}`
  const upId = `aU${uid}`
  const downId = `aD${uid}`
  const tagColor = lastUp ? "#22c55e" : "#ef4444"
  const lastX = iToX(visible.length - 1)
  const lastY = pToY(last.close)
  const changePct = prevClose > 0 ? ((last.close - prevClose) / prevClose) * 100 : 0
  const face = changePct >= 3 ? "🤩" : changePct >= 0.5 ? "😆" : changePct <= -3 ? "😱" : changePct <= -0.5 ? "😟" : "😐"

  const marker = (idx: number, key: string, color: string, label: string) => {
    if (idx >= visibleCount || !candles[idx]) return null
    const cx = iToX(idx)
    const cy = pToY(candles[idx].close) - 16
    return (
      <G key={key}>
        <Circle cx={cx} cy={cy} r={14} fill={color} fillOpacity={0.25} />
        <Circle cx={cx} cy={cy} r={10} fill={color} stroke="#0a0a0a" strokeWidth={2} />
        <SvgText x={cx} y={cy + 4} fill="white" fontSize={10} textAnchor="middle" fontWeight="bold">
          {label}
        </SvgText>
      </G>
    )
  }

  return (
    <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id={upId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#4ade80" stopOpacity={0.25} />
          <Stop offset="100%" stopColor="#4ade80" stopOpacity={0.02} />
        </LinearGradient>
        <LinearGradient id={downId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#f87171" stopOpacity={0.25} />
          <Stop offset="100%" stopColor="#f87171" stopOpacity={0.02} />
        </LinearGradient>
      </Defs>
      <Rect width={W} height={H} fill="#0a0a0a" rx={12} />
      {gridPrices.map((p, i) => (
        <G key={i}>
          <Line x1={ML} y1={pToY(p)} x2={ML + drawW + 5} y2={pToY(p)} stroke="#1a1a1a" strokeWidth={0.5} />
          <SvgText x={ML + drawW + 10} y={pToY(p) + 4} fill="#555" fontSize={9}>
            {formatNumber(p)}
          </SvgText>
        </G>
      ))}
      <Polygon points={areaPoints} fill={`url(#${trendUp ? upId : downId})`} />
      <Polyline points={linePoints} fill="none" stroke={lineColor} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={lastX} cy={lastY} r={10} fill={lineColor} fillOpacity={0.25} />
      <Circle cx={lastX} cy={lastY} r={6} fill={lineColor} stroke="#0a0a0a" strokeWidth={2.5} />
      {rider && (
        <SvgText x={lastX} y={lastY - 18} fontSize={22} textAnchor="middle">
          {face}
        </SvgText>
      )}
      {buyTurns?.map((idx) => marker(idx, `b${idx}`, "#22c55e", "B"))}
      {sellTurns?.map((idx) => marker(idx, `s${idx}`, "#ef4444", "S"))}
      <Rect x={ML + drawW - 1} y={lastY - 15} width={70} height={30} fill={tagColor} fillOpacity={0.25} rx={9} />
      <Rect x={ML + drawW + 2} y={lastY - 12} width={64} height={24} fill={tagColor} rx={6} />
      <SvgText x={ML + drawW + 34} y={lastY + 4} fill="white" fontSize={9.5} textAnchor="middle" fontWeight="bold">
        {formatNumber(last.close)}
      </SvgText>
    </Svg>
  )
}
