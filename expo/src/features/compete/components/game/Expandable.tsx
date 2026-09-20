/**
 * Expandable — 핵심 요약만 보여주고, 탭하면 상세 내용을 펼치는 카드
 */
import React, { useEffect, useRef, useState } from "react"
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native"
import { ChevronDown } from "lucide-react-native"
import { FadeUp } from "@/components/ui"
import { playClickSound } from "@/lib/sound"
import { alpha, palette } from "@/theme"

interface ExpandableProps {
  kicker: string
  title: string
  accent?: string
  /** 항상 보이는 핵심 요약 (그래프/캐릭터 등) */
  summary: React.ReactNode
  /** 펼쳤을 때만 렌더링되는 상세 내용 */
  children: React.ReactNode
  defaultOpen?: boolean
  openLabel?: string
  closeLabel?: string
}

export function Expandable({ kicker, title, accent = palette.cyan[400], summary, children, defaultOpen = false, openLabel = "자세히", closeLabel = "접기" }: ExpandableProps) {
  const [open, setOpen] = useState(defaultOpen)
  const rot = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current

  useEffect(() => {
    const anim = Animated.timing(rot, { toValue: open ? 1 : 0, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true })
    anim.start()
    return () => anim.stop()
  }, [open, rot])

  const toggle = () => {
    playClickSound()
    setOpen((o) => !o)
  }

  return (
    <View style={styles.card}>
      <Pressable onPress={toggle} style={({ pressed }) => [styles.head, pressed && { opacity: 0.8 }]}>
        <View style={{ flexShrink: 1 }}>
          <Text style={[styles.kicker, { color: accent }]}>▸ {kicker}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={[styles.toggle, { backgroundColor: alpha(accent, 0.12), borderColor: alpha(accent, 0.3) }]}>
          <Text style={[styles.toggleText, { color: accent }]}>{open ? closeLabel : openLabel}</Text>
          <Animated.View style={{ transform: [{ rotate: rot.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] }) }] }}>
            <ChevronDown size={14} color={accent} strokeWidth={3} />
          </Animated.View>
        </View>
      </Pressable>

      <Pressable onPress={toggle}>{summary}</Pressable>

      {open && (
        <FadeUp duration={320} distance={10} style={styles.detail}>
          {children}
        </FadeUp>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { marginTop: 16, backgroundColor: "#1e1e2e", borderRadius: 20, borderWidth: 1, borderColor: alpha("#ffffff", 0.06), padding: 16 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 },
  kicker: { fontSize: 10, fontWeight: "900", letterSpacing: 2, marginBottom: 2 },
  title: { fontSize: 17, fontWeight: "900", color: "#ffffff", letterSpacing: -0.4 },
  toggle: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9999, borderWidth: 1 },
  toggleText: { fontSize: 11, fontWeight: "800" },
  detail: { marginTop: 16, paddingTop: 4, borderTopWidth: 1, borderTopColor: alpha("#ffffff", 0.06) },
})
