import React, { useEffect, useRef } from "react"
import { Animated, Pressable, StyleSheet, Text, View } from "react-native"
import { ChevronDown } from "lucide-react-native"
import { FadeIn } from "@/components/ui"
import { palette } from "@/theme"

export interface AccordionConfig {
  key: "simulation" | "stock" | "wave"
  icon: React.ReactNode
  title: string
  subtitle: string
  count: number
  /** 아이콘 배경색 (웹 accentClass) */
  accentColor: string
  /** 테두리색 (웹 borderClass) */
  borderColor: string
  badgeText?: string
  badge?: { bg: string; text: string; border: string }
}

interface AccordionSectionProps {
  config: AccordionConfig
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}

export function AccordionSection({ config, open, onToggle, children }: AccordionSectionProps) {
  // ChevronDown rotate-180 transition
  const rot = useRef(new Animated.Value(open ? 1 : 0)).current
  useEffect(() => {
    Animated.timing(rot, { toValue: open ? 1 : 0, duration: 300, useNativeDriver: true }).start()
  }, [open, rot])

  return (
    <View style={[styles.wrap, { borderColor: config.borderColor }]}>
      <Pressable onPress={onToggle} style={({ pressed }) => [styles.header, pressed && { backgroundColor: "#222222" }]}>
        <View style={styles.left}>
          <View style={[styles.iconBox, { backgroundColor: config.accentColor }]}>{config.icon}</View>
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={styles.title}>{config.title}</Text>
              {!!config.badgeText && !!config.badge && (
                <View style={[styles.badge, { backgroundColor: config.badge.bg, borderColor: config.badge.border }]}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: config.badge.text }}>{config.badgeText}</Text>
                </View>
              )}
            </View>
            <Text style={styles.subtitle}>
              {config.subtitle} · 최근 {config.count}개
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={styles.subtitle}>{open ? "닫기" : "열기"}</Text>
          <Animated.View style={{ transform: [{ rotate: rot.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] }) }] }}>
            <ChevronDown size={16} color={palette.gray[500]} />
          </Animated.View>
        </View>
      </Pressable>

      {open && (
        <FadeIn duration={400}>
          <View style={styles.body}>{children}</View>
        </FadeIn>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "#1a1a1a" },
  left: { flexDirection: "row", alignItems: "center", gap: 12, flexShrink: 1 },
  iconBox: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 14, fontWeight: "900", color: "#ffffff" },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999, borderWidth: 1 },
  subtitle: { fontSize: 12, color: palette.gray[500] },
  body: { backgroundColor: "#141414", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, gap: 10 },
})
