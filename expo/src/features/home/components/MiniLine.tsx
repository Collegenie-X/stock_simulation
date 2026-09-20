import Svg, { Polyline } from "react-native-svg"

/** HotStocks 카드의 미니 라인 차트 */
export function MiniLine({ data, isUp }: { data: number[]; isUp: boolean }) {
  const W = 56
  const H = 24
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = W / (data.length - 1)
  const color = isUp ? "#F04452" : "#3182F6"

  const points = data.map((v, i) => `${i * stepX},${H - ((v - min) / range) * H * 0.8 - H * 0.1}`)

  return (
    <Svg viewBox={`0 0 ${W} ${H}`} width={56} height={24}>
      <Polyline points={points.join(" ")} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}
