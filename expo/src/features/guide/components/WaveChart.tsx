import Svg, { Circle, Defs, LinearGradient, Path, Stop, Text as SvgText } from "react-native-svg"

/** 파도(주가) 곡선 + 매수/매도 포인트 */
export function WaveChart() {
  return (
    <Svg viewBox="0 0 400 200" width="100%" height="100%">
      {/* Wave path */}
      <Defs>
        <LinearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#3B82F6" stopOpacity={0.3} />
          <Stop offset="1" stopColor="#3B82F6" stopOpacity={0.05} />
        </LinearGradient>
      </Defs>
      <Path d="M 0 150 Q 50 80, 100 100 T 200 80 T 300 120 T 400 100 L 400 200 L 0 200 Z" fill="url(#waveGrad)" stroke="#3B82F6" strokeWidth={3} />

      {/* Buy point */}
      <Circle cx={100} cy={100} r={8} fill="#10B981" stroke="white" strokeWidth={2} />
      <SvgText x={100} y={90} textAnchor="middle" fill="#10B981" fontSize={12} fontWeight="bold">
        매수
      </SvgText>

      {/* Sell point */}
      <Circle cx={200} cy={80} r={8} fill="#EF4444" stroke="white" strokeWidth={2} />
      <SvgText x={200} y={70} textAnchor="middle" fill="#EF4444" fontSize={12} fontWeight="bold">
        매도
      </SvgText>
    </Svg>
  )
}
