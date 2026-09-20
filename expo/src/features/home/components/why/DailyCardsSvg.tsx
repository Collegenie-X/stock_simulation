import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from "react-native-svg"
import { PulseCircle } from "../svg/PulseCircle"

const W = 120
const H = 80

// ─── 4) 하루 3번 카드 판단 — 즉시 피드백 ─────────────────────────────────────

export function DailyCardsSvg() {
  // intraday price path with 3 decision points
  const color = "#10B981"
  // raw price data (24 ticks)
  const data = [42, 40, 38, 36, 34, 33, 32, 34, 38, 44, 50, 54, 58, 62, 60, 64, 70, 74, 76, 80, 82, 85, 86, 84]
  const padX = 8
  const padTop = 18
  const padBot = 16
  const innerW = W - padX * 2
  const innerH = H - padTop - padBot
  const stepX = innerW / (data.length - 1)
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => ({
    x: padX + i * stepX,
    y: padTop + innerH - ((v - min) / range) * innerH,
  }))

  // smooth path
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1]
    const cur = pts[i]
    const cp1x = prev.x + (cur.x - prev.x) * 0.45
    const cp2x = cur.x - (cur.x - prev.x) * 0.45
    d += ` C ${cp1x} ${prev.y}, ${cp2x} ${cur.y}, ${cur.x} ${cur.y}`
  }
  const areaD = `${d} L ${pts[pts.length - 1].x} ${H - padBot} L ${pts[0].x} ${H - padBot} Z`

  // decision points: ▲ 매수 (low/dip), ● 관망 (mid), ▼ 매도 (peak)
  const buyIdx = 6
  const holdIdx = 12
  const sellIdx = 21

  return (
    <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <Defs>
        <LinearGradient id="dc-bg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#0a1f1a" />
          <Stop offset="100%" stopColor="#0f0f17" />
        </LinearGradient>
        <LinearGradient id="dc-area" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <Stop offset="100%" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Rect width={W} height={H} rx="8" fill="url(#dc-bg)" />

      {/* dotted grids */}
      {[0.33, 0.66].map((p) => (
        <Line
          key={p}
          x1={padX}
          y1={padTop + innerH * p}
          x2={W - padX}
          y2={padTop + innerH * p}
          stroke="#ffffff"
          strokeOpacity="0.06"
          strokeDasharray="1.5 3"
        />
      ))}

      {/* time markers — 아침 / 점심 / 저녁 */}
      {[buyIdx, holdIdx, sellIdx].map((idx) => (
        <Line
          key={idx}
          x1={pts[idx].x}
          y1={padTop}
          x2={pts[idx].x}
          y2={H - padBot}
          stroke="#ffffff"
          strokeOpacity="0.12"
          strokeDasharray="2 2"
        />
      ))}

      {/* area + line */}
      <Path d={areaD} fill="url(#dc-area)" />
      <Path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* HEADER: ☀ DAY · 3 decisions */}
      <G transform="translate(8 10)">
        <Circle r="2.6" fill="#fbbf24" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const a = (i * Math.PI) / 4
          return (
            <Line
              key={i}
              x1={Math.cos(a) * 4}
              y1={Math.sin(a) * 4}
              x2={Math.cos(a) * 5.5}
              y2={Math.sin(a) * 5.5}
              stroke="#fbbf24"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
          )
        })}
      </G>
      <SvgText x="18" y="12" fontSize="6" fill="#fbbf24" fontWeight="900">DAY · 3 DECISIONS</SvgText>

      {/* decision 1: 매수 ▲ at dip → ✓ */}
      <G>
        <PulseCircle cx={pts[buyIdx].x} cy={pts[buyIdx].y} r={[6, 9]} opacity={[0.22, 0]} fill="#10B981" yoyo={false} />
        <Circle cx={pts[buyIdx].x} cy={pts[buyIdx].y} r="3.2" fill="#10B981" stroke="#fff" strokeWidth="1.2" />
        <SvgText x={pts[buyIdx].x} y={pts[buyIdx].y + 1.5} fontSize="4.5" fill="#fff" textAnchor="middle" fontWeight="900">▲</SvgText>
        {/* badge */}
        <G transform={`translate(${pts[buyIdx].x} ${pts[buyIdx].y + 12})`}>
          <Rect x="-9" y="-4" width="18" height="7" rx="3.5" fill="#10B981" />
          <SvgText x="0" y="1.2" fontSize="4.5" fill="#022c22" textAnchor="middle" fontWeight="900">매수 ✓</SvgText>
        </G>
      </G>

      {/* decision 2: 관망 ● at mid */}
      <G>
        <Circle cx={pts[holdIdx].x} cy={pts[holdIdx].y} r="3" fill="#94a3b8" stroke="#fff" strokeWidth="1.2" />
        <G transform={`translate(${pts[holdIdx].x} ${pts[holdIdx].y - 10})`}>
          <Rect x="-9" y="-4" width="18" height="7" rx="3.5" fill="#475569" />
          <SvgText x="0" y="1.2" fontSize="4.5" fill="#cbd5e1" textAnchor="middle" fontWeight="900">관망 ●</SvgText>
        </G>
      </G>

      {/* decision 3: 매도 ▼ at peak → ✓ */}
      <G>
        <PulseCircle cx={pts[sellIdx].x} cy={pts[sellIdx].y} r={[6, 9]} opacity={[0.22, 0]} fill="#F04452" yoyo={false} />
        <Circle cx={pts[sellIdx].x} cy={pts[sellIdx].y} r="3.2" fill="#F04452" stroke="#fff" strokeWidth="1.2" />
        <SvgText x={pts[sellIdx].x} y={pts[sellIdx].y + 1.5} fontSize="4.5" fill="#fff" textAnchor="middle" fontWeight="900">▼</SvgText>
        <G transform={`translate(${pts[sellIdx].x - 4} ${pts[sellIdx].y - 10})`}>
          <Rect x="-9" y="-4" width="18" height="7" rx="3.5" fill="#F04452" />
          <SvgText x="0" y="1.2" fontSize="4.5" fill="#fff" textAnchor="middle" fontWeight="900">매도 ✓</SvgText>
        </G>
      </G>

      {/* x-axis time labels */}
      <SvgText x={pts[buyIdx].x} y={H - 3} fontSize="4.5" fill="#94a3b8" textAnchor="middle" fontWeight="700">아침</SvgText>
      <SvgText x={pts[holdIdx].x} y={H - 3} fontSize="4.5" fill="#94a3b8" textAnchor="middle" fontWeight="700">점심</SvgText>
      <SvgText x={pts[sellIdx].x} y={H - 3} fontSize="4.5" fill="#94a3b8" textAnchor="middle" fontWeight="700">저녁</SvgText>

      {/* total result chip */}
      <G transform="translate(108 11)">
        <Rect x="-22" y="-5" width="22" height="9" rx="4.5" fill="#fbbf24" />
        <SvgText x="-11" y="1.5" fontSize="6" fill="#78350f" textAnchor="middle" fontWeight="900">+12%</SvgText>
      </G>
    </Svg>
  )
}
