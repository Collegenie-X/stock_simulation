import Svg, { Circle, Defs, G, Line, LinearGradient, Path, RadialGradient, Rect, Stop, Text as SvgText } from "react-native-svg"
import { PulseG } from "../svg/PulseG"

const W = 120
const H = 80

// ─── 2) 핫종목 1년 — 캘린더 + 불꽃 + 종목 티커 ──────────────────────────────

export function HotStocksSvg() {
  return (
    <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <Defs>
        <LinearGradient id="hs-bg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#1e1b4b" />
          <Stop offset="100%" stopColor="#0f0f17" />
        </LinearGradient>
        <LinearGradient id="hs-chip" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#06b6d4" />
          <Stop offset="100%" stopColor="#0e7490" />
        </LinearGradient>
        <RadialGradient id="hs-brain" cx="0.5" cy="0.5">
          <Stop offset="0%" stopColor="#a78bfa" />
          <Stop offset="100%" stopColor="#5b21b6" />
        </RadialGradient>
      </Defs>
      <Rect width={W} height={H} rx="8" fill="url(#hs-bg)" />

      {/* circuit grid background */}
      <G opacity="0.18" stroke="#06b6d4" strokeWidth="0.4" fill="none">
        <Path d="M0 20 H 30 V 40 H 60 V 25 H 90 V 50 H 120" />
        <Path d="M0 60 H 25 V 75 H 70 V 55 H 100 V 70 H 120" />
        <Circle cx="30" cy="20" r="1" fill="#06b6d4" />
        <Circle cx="60" cy="40" r="1" fill="#06b6d4" />
        <Circle cx="90" cy="25" r="1" fill="#06b6d4" />
        <Circle cx="70" cy="55" r="1" fill="#06b6d4" />
      </G>

      {/* LEFT — AI memory chip (반도체) */}
      <G transform="translate(14 18)">
        {/* chip pins */}
        {[0, 1, 2, 3].map((i) => (
          <G key={i}>
            <Rect x="-4" y={3 + i * 6} width="4" height="2" fill="#94a3b8" />
            <Rect x="22" y={3 + i * 6} width="4" height="2" fill="#94a3b8" />
            <Rect x={3 + i * 5} y="-3" width="2" height="3" fill="#94a3b8" />
            <Rect x={3 + i * 5} y="22" width="2" height="3" fill="#94a3b8" />
          </G>
        ))}
        <Rect x="0" y="0" width="22" height="22" rx="2" fill="url(#hs-chip)" stroke="#0e7490" strokeWidth="0.6" />
        {/* etched AI letters */}
        <SvgText x="11" y="14" fontSize="9" fill="#a5f3fc" textAnchor="middle" fontWeight="900" fontFamily="monospace">AI</SvgText>
        {/* pulse ring */}
        <PulseG>
          <Circle cx="11" cy="11" r="13" fill="none" stroke="#06b6d4" strokeWidth="0.6" opacity="0.5" />
        </PulseG>
        <SvgText x="11" y="34" fontSize="5" fill="#67e8f9" textAnchor="middle" fontWeight="900">반도체</SvgText>
      </G>

      {/* CENTER — robot head (로봇) */}
      <G transform="translate(60 22)">
        {/* antenna */}
        <Line x1="0" y1="-2" x2="0" y2="-7" stroke="#94a3b8" strokeWidth="1" />
        <PulseG>
          <Circle cx="0" cy="-8" r="1.5" fill="#fbbf24" />
        </PulseG>
        {/* head */}
        <Rect x="-9" y="-2" width="18" height="16" rx="3" fill="#475569" stroke="#94a3b8" strokeWidth="0.8" />
        {/* visor */}
        <Rect x="-7" y="1" width="14" height="6" rx="1.5" fill="#0f172a" />
        {/* eyes */}
        <PulseG>
          <Circle cx="-3" cy="4" r="1.5" fill="#10B981" />
        </PulseG>
        <PulseG>
          <Circle cx="3" cy="4" r="1.5" fill="#10B981" />
        </PulseG>
        {/* mouth grid */}
        <Line x1="-4" y1="10" x2="4" y2="10" stroke="#94a3b8" strokeWidth="0.6" />
        <Line x1="-2" y1="9" x2="-2" y2="11" stroke="#94a3b8" strokeWidth="0.6" />
        <Line x1="0" y1="9" x2="0" y2="11" stroke="#94a3b8" strokeWidth="0.6" />
        <Line x1="2" y1="9" x2="2" y2="11" stroke="#94a3b8" strokeWidth="0.6" />
        {/* neck */}
        <Rect x="-3" y="14" width="6" height="3" fill="#334155" />
        <SvgText x="0" y="24" fontSize="5" fill="#cbd5e1" textAnchor="middle" fontWeight="900">로봇</SvgText>
      </G>

      {/* RIGHT — AI brain (생성형 AI) */}
      <G transform="translate(102 22)">
        <Circle r="11" fill="url(#hs-brain)" />
        {/* brain folds */}
        <Path d="M-7 -2 Q -3 -8 0 -4 Q 3 -8 7 -2" stroke="#e9d5ff" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        <Path d="M-7 2 Q -3 -2 0 1 Q 3 -2 7 2" stroke="#e9d5ff" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        <Path d="M-6 6 Q -2 3 1 5 Q 4 3 6 6" stroke="#e9d5ff" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        {/* synapse pulses */}
        <PulseG>
          <Circle cx="-4" cy="-4" r="1" fill="#fbbf24" />
        </PulseG>
        <PulseG>
          <Circle cx="5" cy="3" r="0.8" fill="#fbbf24" />
        </PulseG>
        <SvgText x="0" y="24" fontSize="5" fill="#e9d5ff" textAnchor="middle" fontWeight="900">생성AI</SvgText>
      </G>

      {/* bottom ticker pills */}
      <G fontSize="5" fontWeight="900">
        <Rect x="6" y="62" width="34" height="11" rx="3" fill="#10B981" />
        <SvgText x="23" y="69.5" fill="#022c22" textAnchor="middle">에코프로 +312%</SvgText>

        <Rect x="44" y="62" width="28" height="11" rx="3" fill="#F04452" />
        <SvgText x="58" y="69.5" fill="#450a0a" textAnchor="middle">SK하이닉스</SvgText>

        <Rect x="76" y="62" width="38" height="11" rx="3" fill="#fbbf24" />
        <SvgText x="95" y="69.5" fill="#78350f" textAnchor="middle">레인보우로보틱스</SvgText>
      </G>

      {/* HOT badge top right */}
      <G transform="translate(108 10)">
        <Rect x="-12" y="-5" width="14" height="9" rx="4.5" fill="#F04452" />
        <SvgText x="-5" y="1.5" fontSize="5.5" fill="#fff" textAnchor="middle" fontWeight="900">🔥HOT</SvgText>
      </G>
      <SvgText x="6" y="11" fontSize="5" fill="#94a3b8" fontWeight="900" letterSpacing="1">1Y · TRENDING</SvgText>
    </Svg>
  )
}
