/**
 * GlowOrb — 웹의 `blur-[100px]` 글로우를 대체하는 부드러운 빛 번짐
 * (RN 에는 blur 필터가 없어 SVG 방사형 그라데이션으로 구현 — iOS/Android/Web 동일하게 보임)
 *
 *   <GlowOrb color={palette.green[500]} size={420} opacity={0.35} style={{ top: -80, alignSelf: "center" }} />
 */
import React, { useId } from "react"
import { View, type StyleProp, type ViewStyle } from "react-native"
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg"

interface GlowOrbProps {
  color: string
  size?: number
  /** 중심부 최대 불투명도 */
  opacity?: number
  style?: StyleProp<ViewStyle>
}

export function GlowOrb({ color, size = 320, opacity = 0.3, style }: GlowOrbProps) {
  const id = "glow" + useId().replace(/[^a-zA-Z0-9]/g, "")
  return (
    <View pointerEvents="none" style={[{ position: "absolute", width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity={opacity} />
            <Stop offset="0.35" stopColor={color} stopOpacity={opacity * 0.55} />
            <Stop offset="0.7" stopColor={color} stopOpacity={opacity * 0.15} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={size} height={size} fill={`url(#${id})`} />
      </Svg>
    </View>
  )
}
