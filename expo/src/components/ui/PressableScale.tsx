/**
 * PressableScale — 웹의 `active:scale-[0.98] touch-feedback` 을 대체하는 터치 피드백 래퍼
 */
import React from "react"
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native"

export interface PressableScaleProps extends Omit<PressableProps, "style"> {
  style?: StyleProp<ViewStyle>
  scaleTo?: number
  pressedOpacity?: number
}

export function PressableScale({ style, scaleTo = 0.97, pressedOpacity = 0.9, disabled, children, ...rest }: PressableScaleProps) {
  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [style, pressed && { opacity: pressedOpacity, transform: [{ scale: scaleTo }] }, disabled && { opacity: 0.5 }]}
      {...rest}
    >
      {children}
    </Pressable>
  )
}
