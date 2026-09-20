import React from "react"
import { View, type StyleProp, type ViewStyle } from "react-native"
import { Gradient } from "./Gradient"
import { alpha, colors as themeColors } from "@/theme"

interface ProgressBarProps {
  /** 0~100 */
  value: number
  height?: number
  color?: string
  /** 그라데이션 색상 (지정 시 color 보다 우선) */
  gradient?: readonly string[]
  trackColor?: string
  style?: StyleProp<ViewStyle>
}

export function ProgressBar({ value, height = 6, color = themeColors.primary, gradient, trackColor = alpha("#ffffff", 0.1), style }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <View style={[{ height, borderRadius: height / 2, backgroundColor: trackColor, overflow: "hidden" }, style]}>
      {gradient ? (
        <Gradient dir="r" colors={gradient} style={{ width: `${pct}%`, height: "100%", borderRadius: height / 2 }} />
      ) : (
        <View style={{ width: `${pct}%`, height: "100%", borderRadius: height / 2, backgroundColor: color }} />
      )}
    </View>
  )
}
