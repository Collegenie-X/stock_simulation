/** Animated Mini Chart with moving dot (GameModeCards 의 LiveChart) */
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from "react-native-svg"
import { PulseCircle } from "../svg/PulseCircle"

export function LiveChart({ data, color, glow, width = 80, height = 48 }: { data: number[]; color: string; glow: string; width?: number; height?: number }) {
  const W = 120
  const H = 60
  const stepX = W / (data.length - 1)
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => ({ x: i * stepX, y: H - ((v - min) / range) * H * 0.85 - H * 0.075 }))

  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const cp1x = pts[i - 1].x + stepX * 0.4
    const cp2x = pts[i].x - stepX * 0.4
    d += ` C ${cp1x} ${pts[i - 1].y}, ${cp2x} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`
  }
  const last = pts[pts.length - 1]
  const areaD = `${d} L ${last.x} ${H} L 0 ${H} Z`
  const gid = `lc-${color.replace("#", "")}`

  return (
    <Svg viewBox={`0 0 ${W} ${H}`} width={width} height={height} style={{ overflow: "visible" }}>
      <Defs>
        <LinearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={0.45} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Line x1={0} y1={H * 0.5} x2={W} y2={H * 0.5} stroke={color} strokeOpacity={0.1} strokeDasharray="2 3" />
      <Path d={areaD} fill={`url(#${gid})`} />
      {/* drop-shadow glow 대체 */}
      <Path d={d} fill="none" stroke={glow} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />
      <Path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <PulseCircle cx={last.x} cy={last.y} r={[6, 9]} opacity={[0.25, 0]} fill={color} yoyo={false} />
      <Circle cx={last.x} cy={last.y} r={2.8} fill="#fff" stroke={color} strokeWidth={1.5} />
    </Svg>
  )
}
