import Svg, { Circle, Path } from "react-native-svg"
import { PulseCircle } from "../svg/PulseCircle"

/** 마라톤 — 산 정상 깃발 */
export function MarathonIcon({ color }: { color: string }) {
  return (
    <Svg viewBox="0 0 48 48" width="100%" height="100%">
      <Circle cx={24} cy={24} r={22} fill={`${color}22`} stroke={`${color}55`} strokeWidth={1} />
      <Path d="M8 36 L18 20 L24 28 L32 14 L40 36 Z" fill={color} fillOpacity={0.3} stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M30 16 L32 14 L34 16 L32 18 Z" fill="#fff" />
      <PulseCircle cx={32} cy={14} r={[3, 4.5]} opacity={[1, 0]} stroke="#fff" strokeWidth={1} yoyo={false} />
    </Svg>
  )
}
