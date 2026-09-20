import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from "react-native-svg"
import { PulseCircle } from "../svg/PulseCircle"
import { PulseG } from "../svg/PulseG"

const W = 120
const H = 80

// ─── 1) 닮은꼴 AI 대결 — 나 vs AI 페이스오프 ──────────────────────────────────

export function AiBattleSvg() {
  // 두 라인 레이스: 파랑(나) vs 빨강(AI) — 비슷한 패턴이지만 끝에 AI가 살짝 앞서며 대결 강조
  const padX = 6
  const padTop = 16
  const padBot = 14
  const innerW = W - padX * 2
  const innerH = H - padTop - padBot
  // 3 계곡 — 변동성 높은 시장. 두 플레이어가 같은 시장에서 다르게 반응
  // me(나): 늦게 사고 빨리 팔며 진폭 크게 휩쓸림
  // ai(AI): 더 빠르게 매수/늦게 매도하며 효율적
  const me = [50, 58, 42, 30, 48, 56, 38, 22, 40, 52, 44, 32, 46, 56, 64, 70]
  const ai = [50, 54, 46, 38, 56, 62, 50, 36, 54, 64, 58, 50, 62, 72, 80, 88]
  const stepX = innerW / (me.length - 1)
  const min = 18
  const max = 92
  const range = max - min
  const ptsMe = me.map((v, i) => ({ x: padX + i * stepX, y: padTop + innerH - ((v - min) / range) * innerH }))
  const ptsAi = ai.map((v, i) => ({ x: padX + i * stepX, y: padTop + innerH - ((v - min) / range) * innerH }))

  const smooth = (pts: { x: number; y: number }[]) => {
    let p = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i]
      const c1x = a.x + (b.x - a.x) * 0.45
      const c2x = b.x - (b.x - a.x) * 0.45
      p += ` C ${c1x} ${a.y}, ${c2x} ${b.y}, ${b.x} ${b.y}`
    }
    return p
  }

  const meEnd = ptsMe[ptsMe.length - 1]
  const aiEnd = ptsAi[ptsAi.length - 1]

  return (
    <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <Defs>
        <LinearGradient id="ab-bg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#0a1230" />
          <Stop offset="100%" stopColor="#0f0f17" />
        </LinearGradient>
        <LinearGradient id="ab-me" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#3182F6" stopOpacity="0.4" />
          <Stop offset="100%" stopColor="#3182F6" stopOpacity="0" />
        </LinearGradient>
        <LinearGradient id="ab-ai" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#F04452" stopOpacity="0.4" />
          <Stop offset="100%" stopColor="#F04452" stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Rect width={W} height={H} rx="8" fill="url(#ab-bg)" />

      {/* dotted grid */}
      {[0.33, 0.66].map((p) => (
        <Line key={p} x1={padX} y1={padTop + innerH * p} x2={W - padX} y2={padTop + innerH * p}
          stroke="#ffffff" strokeOpacity="0.06" strokeDasharray="1.5 3" />
      ))}

      {/* HEADER: ME vs AI */}
      <G>
        <Circle cx="11" cy="10" r="2.5" fill="#3182F6" />
        <SvgText x="17" y="12" fontSize="6" fill="#93c5fd" fontWeight="900">나</SvgText>
        <SvgText x="55" y="12" fontSize="6" fill="#fbbf24" textAnchor="middle" fontWeight="900">VS</SvgText>
        <Circle cx="76" cy="10" r="2.5" fill="#F04452" />
        <SvgText x="82" y="12" fontSize="6" fill="#fca5a5" fontWeight="900">닮은 AI</SvgText>
      </G>

      {/* AREA fills */}
      <Path d={`${smooth(ptsMe)} L ${meEnd.x} ${H - padBot} L ${ptsMe[0].x} ${H - padBot} Z`} fill="url(#ab-me)" />
      <Path d={`${smooth(ptsAi)} L ${aiEnd.x} ${H - padBot} L ${ptsAi[0].x} ${H - padBot} Z`} fill="url(#ab-ai)" />

      {/* LINES */}
      <Path d={smooth(ptsMe)} fill="none" stroke="#3182F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d={smooth(ptsAi)} fill="none" stroke="#F04452" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* 3 valleys — mark valleys with subtle vertical guides */}
      {[3, 7, 11].map((i) => (
        <G key={i}>
          <Line x1={ptsMe[i].x} y1={padTop} x2={ptsMe[i].x} y2={H - padBot}
            stroke="#ffffff" strokeOpacity="0.08" strokeDasharray="1.5 2" />
          <SvgText x={ptsMe[i].x} y={padTop + 5} fontSize="4.5" fill="#fbbf24" textAnchor="middle" fontWeight="900">
            ▽{i === 3 ? "1" : i === 7 ? "2" : "3"}
          </SvgText>
        </G>
      ))}

      {/* divergence sparkles at valleys */}
      {[3, 7, 11].map((i) => (
        <G key={`s-${i}`}>
          <Circle cx={ptsMe[i].x} cy={ptsMe[i].y} r="2" fill="#3182F6" opacity="0.9" stroke="#fff" strokeWidth="0.6" />
          <Circle cx={ptsAi[i].x} cy={ptsAi[i].y} r="2" fill="#F04452" opacity="0.9" stroke="#fff" strokeWidth="0.6" />
          <Line x1={ptsMe[i].x} y1={ptsMe[i].y} x2={ptsAi[i].x} y2={ptsAi[i].y}
            stroke="#fbbf24" strokeWidth="0.5" strokeDasharray="1 1" opacity="0.6" />
        </G>
      ))}

      {/* END MARKER: 사람 머리 (나) */}
      <G transform={`translate(${meEnd.x - 2} ${meEnd.y})`}>
        <PulseCircle r={[6, 9]} opacity={[0.22, 0]} fill="#3182F6" yoyo={false} />
        <Circle cx="0" cy="-1" r="3" fill="#3182F6" stroke="#fff" strokeWidth="0.8" />
        {/* tiny face */}
        <Circle cx="-1" cy="-1.4" r="0.4" fill="#fff" />
        <Circle cx="1" cy="-1.4" r="0.4" fill="#fff" />
        <Path d="M-1 0 Q 0 0.6 1 0" stroke="#fff" strokeWidth="0.4" fill="none" strokeLinecap="round" />
        {/* +score */}
        <G transform="translate(-12 6)">
          <Rect x="-1" y="-3" width="14" height="6" rx="3" fill="#3182F6" />
          <SvgText x="6" y="1.2" fontSize="4.5" fill="#fff" textAnchor="middle" fontWeight="900">+18%</SvgText>
        </G>
      </G>

      {/* END MARKER: 로봇 머리 (AI) — 우승 트로피 표시 */}
      <G transform={`translate(${aiEnd.x - 2} ${aiEnd.y})`}>
        <PulseCircle r={[6, 9]} opacity={[0.22, 0]} fill="#F04452" yoyo={false} />
        {/* robot head box */}
        <Rect x="-3.5" y="-4" width="7" height="6.5" rx="1.4" fill="#F04452" stroke="#fff" strokeWidth="0.8" />
        {/* antenna */}
        <Line x1="0" y1="-4" x2="0" y2="-6.5" stroke="#fff" strokeWidth="0.6" />
        <PulseG>
          <Circle cx="0" cy="-7" r="0.7" fill="#fbbf24" />
        </PulseG>
        {/* eyes */}
        <Rect x="-2.2" y="-2.5" width="1.2" height="1.2" fill="#fff" />
        <Rect x="1" y="-2.5" width="1.2" height="1.2" fill="#fff" />
        {/* mouth */}
        <Line x1="-1.5" y1="0.8" x2="1.5" y2="0.8" stroke="#fff" strokeWidth="0.4" />
        {/* +score with crown */}
        <G transform="translate(-10 -10)">
          <SvgText x="3" y="2" fontSize="5">👑</SvgText>
        </G>
        <G transform="translate(-12 6)">
          <Rect x="-1" y="-3" width="14" height="6" rx="3" fill="#F04452" />
          <SvgText x="6" y="1.2" fontSize="4.5" fill="#fff" textAnchor="middle" fontWeight="900">+62%</SvgText>
        </G>
      </G>

      {/* finish line */}
      <Line x1={W - padX - 1} y1={padTop} x2={W - padX - 1} y2={H - padBot} stroke="#fbbf24" strokeWidth="0.6" strokeDasharray="1.5 1.5" opacity="0.8" />
      <SvgText x={W - padX - 3} y={padTop + 4} fontSize="4" fill="#fbbf24" textAnchor="end" fontWeight="900">FINISH</SvgText>
    </Svg>
  )
}
