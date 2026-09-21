import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg"

// 런처 아이콘과 같은 심볼 — 차트 선이 그대로 파도 마루가 된다
const LINE = "M150 700 L285 590 L350 648 L485 462 L548 522 L640 372 C700 268 822 230 884 300 C940 366 912 474 826 494 C774 506 728 476 720 428"
const BODY = `${LINE} C768 450 838 424 824 362 C810 310 728 318 694 378 C640 470 668 640 900 770 C810 735 720 815 620 782 S420 742 330 778 S200 802 150 772 Z`

export function WaveLogo({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="100 190 860 660">
      <Defs>
        <LinearGradient id="wl-body" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#34d399" stopOpacity={0.95} />
          <Stop offset="1" stopColor="#0891b2" stopOpacity={0.45} />
        </LinearGradient>
        <LinearGradient id="wl-line" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#22d3ee" />
          <Stop offset="0.5" stopColor="#4ade80" />
          <Stop offset="1" stopColor="#ecfdf5" />
        </LinearGradient>
      </Defs>
      <Path d={BODY} fill="url(#wl-body)" />
      <Path d={LINE} fill="none" stroke="url(#wl-line)" strokeWidth={46} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={720} cy={428} r={34} fill="#ffffff" />
    </Svg>
  )
}
