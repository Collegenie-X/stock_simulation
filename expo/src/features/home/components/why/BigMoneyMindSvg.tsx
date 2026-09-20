import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop, Text as SvgText } from "react-native-svg"
import { PulseG } from "../svg/PulseG"

const W = 120
const H = 80

// ─── 3) 큰돈 멘탈 — 1000만 vs 5억, 명상하는 사람 ─────────────────────────────

export function BigMoneyMindSvg() {
  return (
    <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <Defs>
        <LinearGradient id="bm-bg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#1a0f00" />
          <Stop offset="100%" stopColor="#0f0f17" />
        </LinearGradient>
        <LinearGradient id="gold-bar" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#fde68a" />
          <Stop offset="45%" stopColor="#fbbf24" />
          <Stop offset="100%" stopColor="#92400e" />
        </LinearGradient>
        <RadialGradient id="gold-glow" cx="0.5" cy="0.5">
          <Stop offset="0%" stopColor="#fbbf24" stopOpacity="0.55" />
          <Stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="heart-pulse" cx="0.5" cy="0.5">
          <Stop offset="0%" stopColor="#06b6d4" stopOpacity="0.55" />
          <Stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width={W} height={H} rx="8" fill="url(#bm-bg)" />

      {/* LEFT — 1000만: 작고 평범한 금화 1개 */}
      <G transform="translate(14 56)">
        <Ellipse cx="0" cy="3" rx="7" ry="1.5" fill="#000" opacity="0.45" />
        <Circle cx="0" cy="0" r="5.5" fill="url(#gold-bar)" stroke="#92400e" strokeWidth="0.6" />
        <SvgText x="0" y="2" fontSize="6" fill="#78350f" textAnchor="middle" fontWeight="900">₩</SvgText>
        <SvgText x="0" y="14" fontSize="5.5" fill="#94a3b8" textAnchor="middle" fontWeight="900">1,000만</SvgText>
      </G>

      {/* RIGHT — 5억: 거대한 금괴 피라미드 + 후광 */}
      <G transform="translate(88 24)">
        {/* glowing halo (much larger) */}
        <Circle cx="14" cy="22" r="26" fill="url(#gold-glow)" />
        {/* sparkle stars */}
        <G fill="#fde68a">
          <PulseG>
            <Path d="M-2 -2 L -1 0 L 1 1 L -1 2 L -2 4 L -3 2 L -5 1 L -3 0 Z" opacity="0.9" />
          </PulseG>
          <Path d="M30 0 L 30.6 1 L 32 1.5 L 30.6 2 L 30 3.2 L 29.4 2 L 28 1.5 L 29.4 1 Z" opacity="0.8" />
          <Circle cx="6" cy="-3" r="0.7" />
          <Circle cx="26" cy="10" r="0.6" />
        </G>

        {/* base row — 4 bars */}
        {[0, 1, 2, 3].map((i) => (
          <G key={`b-${i}`}>
            <Rect x={i * 7} y="36" width="6.5" height="6" rx="0.6" fill="url(#gold-bar)" stroke="#78350f" strokeWidth="0.4" />
          </G>
        ))}
        {/* row 2 — 3 bars */}
        {[0, 1, 2].map((i) => (
          <G key={`r2-${i}`}>
            <Rect x={3.5 + i * 7} y="30" width="6.5" height="6" rx="0.6" fill="url(#gold-bar)" stroke="#78350f" strokeWidth="0.4" />
          </G>
        ))}
        {/* row 3 — 2 bars */}
        {[0, 1].map((i) => (
          <G key={`r3-${i}`}>
            <Rect x={7 + i * 7} y="24" width="6.5" height="6" rx="0.6" fill="url(#gold-bar)" stroke="#78350f" strokeWidth="0.4" />
          </G>
        ))}
        {/* top — 1 bar */}
        <Rect x="10.5" y="18" width="6.5" height="6" rx="0.6" fill="url(#gold-bar)" stroke="#78350f" strokeWidth="0.4" />
        {/* shine highlight */}
        <Rect x="11" y="19" width="2" height="3" fill="#fef9c3" opacity="0.8" />

        {/* coins spilled at base */}
        <Circle cx="-2" cy="44" r="2.5" fill="url(#gold-bar)" stroke="#78350f" strokeWidth="0.4" />
        <Circle cx="32" cy="44" r="2.5" fill="url(#gold-bar)" stroke="#78350f" strokeWidth="0.4" />

        {/* big amount label */}
        <Rect x="-1" y="49" width="32" height="11" rx="3" fill="#fbbf24" />
        <SvgText x="15" y="56.5" fontSize="7" fill="#78350f" textAnchor="middle" fontWeight="900">5억</SvgText>

        {/* x50 multiplier badge */}
        <G transform="translate(28 4)">
          <Rect x="-7" y="-5" width="14" height="9" rx="4.5" fill="#F04452" />
          <SvgText x="0" y="1.5" fontSize="6" fill="#fff" textAnchor="middle" fontWeight="900">×50</SvgText>
        </G>
      </G>

      {/* CENTER — 흔들리지 않는 감정: 안정된 하트 + EKG 라인 */}
      <G transform="translate(60 38)">
        {/* aura */}
        <Circle r="16" fill="url(#heart-pulse)" />
        <PulseG>
          <Circle r="11" fill="none" stroke="#06b6d4" strokeWidth="0.6" opacity="0.4" />
        </PulseG>

        {/* steady heart shape */}
        <Path
          d="M0 6 C -8 0 -8 -8 -4 -8 C -2 -8 0 -6 0 -4 C 0 -6 2 -8 4 -8 C 8 -8 8 0 0 6 Z"
          fill="#06b6d4"
          stroke="#67e8f9"
          strokeWidth="0.8"
        />
        {/* steady pulse EKG line going through */}
        <Path
          d="M-14 -1 L -8 -1 L -6 -1 L -4 -4 L -2 2 L 0 -1 L 14 -1"
          fill="none"
          stroke="#fff"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* zen label */}
        <SvgText x="0" y="20" fontSize="5" fill="#67e8f9" textAnchor="middle" fontWeight="900">평정심</SvgText>
      </G>

      {/* deflected emotion arrows (탐욕/공포 → 차단됨) */}
      <G fontSize="6" fontWeight="900">
        {/* greed from gold */}
        <SvgText x="78" y="20" fill="#F04452" opacity="0.85">😱</SvgText>
        <Path d="M78 22 Q 70 28 68 32" stroke="#F04452" strokeWidth="0.8" fill="none" strokeDasharray="1.5 1.5" opacity="0.6" />
        {/* fear from small money */}
        <SvgText x="34" y="34" fill="#fbbf24" opacity="0.85">🤑</SvgText>
        <Path d="M40 34 Q 48 36 52 38" stroke="#fbbf24" strokeWidth="0.8" fill="none" strokeDasharray="1.5 1.5" opacity="0.6" />
      </G>

      {/* "BLOCKED" indicator on shield ring around heart */}
      <Circle cx="60" cy="38" r="14" fill="none" stroke="#06b6d4" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.6" />
    </Svg>
  )
}
