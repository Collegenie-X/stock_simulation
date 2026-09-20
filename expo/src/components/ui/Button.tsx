/**
 * Button — 웹 components/ui/button.tsx(shadcn) 의 variant/size 를 RN 으로 옮긴 것
 */
import React from "react"
import { Pressable, StyleSheet, Text, type PressableProps, type StyleProp, type TextStyle, type ViewStyle } from "react-native"
import { alpha, colors, radius } from "@/theme"
import { playClickSound } from "@/lib/sound"

type Variant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
type Size = "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg"

export interface ButtonProps extends Omit<PressableProps, "style" | "children"> {
  variant?: Variant
  size?: Size
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  children?: React.ReactNode
  /** 햅틱 피드백 여부 */
  haptic?: boolean
}

export function Button({ variant = "default", size = "default", style, textStyle, children, disabled, haptic, onPress, ...rest }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={(e) => {
        if (haptic) playClickSound()
        onPress?.(e)
      }}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        sizeStyles[size],
        pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
        disabled && { opacity: 0.5 },
        style,
      ]}
      {...rest}
    >
      {typeof children === "string" || typeof children === "number" ? (
        <Text style={[styles.text, variantText[variant], textStyle]}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: radius.md },
  text: { fontSize: 14, fontWeight: "500", color: colors.foreground },
})

const variantStyles: Record<Variant, ViewStyle> = {
  default: { backgroundColor: colors.primary },
  destructive: { backgroundColor: colors.destructive },
  outline: { borderWidth: 1, borderColor: colors.border, backgroundColor: alpha("#ffffff", 0.04) },
  secondary: { backgroundColor: colors.muted },
  ghost: { backgroundColor: "transparent" },
  link: { backgroundColor: "transparent" },
}

const variantText: Record<Variant, TextStyle> = {
  default: { color: "#ffffff" },
  destructive: { color: "#ffffff" },
  outline: { color: colors.foreground },
  secondary: { color: colors.foreground },
  ghost: { color: colors.foreground },
  link: { color: colors.primary, textDecorationLine: "underline" },
}

const sizeStyles: Record<Size, ViewStyle> = {
  default: { height: 36, paddingHorizontal: 16 },
  sm: { height: 32, paddingHorizontal: 12 },
  lg: { height: 40, paddingHorizontal: 24 },
  icon: { height: 36, width: 36 },
  "icon-sm": { height: 32, width: 32 },
  "icon-lg": { height: 40, width: 40 },
}
