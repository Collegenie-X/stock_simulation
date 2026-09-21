import { useState, type ReactNode } from "react"
import { LayoutAnimation, Platform, StyleSheet, Text, UIManager, View } from "react-native"
import { ChevronDown, ChevronUp } from "lucide-react-native"
import { FadeIn, PressableScale } from "@/components/ui"
import { alpha, palette } from "@/theme"

if (Platform.OS === "android") UIManager.setLayoutAnimationEnabledExperimental?.(true)

interface FoldProps {
  emoji: string
  title: string
  /** 접힌 상태에서도 보이는 한 줄 요약 */
  badge?: string
  badgeColor?: string
  defaultOpen?: boolean
  children: ReactNode
}

/** 리포트 공용 접기 — 첫 화면엔 제목과 한 줄 요약만, 누르면 펼쳐진다 */
export function Fold({ emoji, title, badge, badgeColor = palette.gray[300], defaultOpen = false, children }: FoldProps) {
  const [open, setOpen] = useState(defaultOpen)
  const Chevron = open ? ChevronUp : ChevronDown

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setOpen((v) => !v)
  }

  return (
    <View style={[styles.card, open && styles.cardOpen]}>
      <PressableScale onPress={toggle} scaleTo={0.99} style={styles.head}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.title}>{title}</Text>
        {!!badge && (
          <View style={[styles.badge, { backgroundColor: alpha(badgeColor, 0.14) }]}>
            <Text style={[styles.badgeText, { color: badgeColor }]} numberOfLines={1}>{badge}</Text>
          </View>
        )}
        <Chevron size={16} color={palette.gray[500]} />
      </PressableScale>
      {open && <FadeIn style={styles.body}>{children}</FadeIn>}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: alpha(palette.gray[800], 0.45),
    borderRadius: 16,
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.3),
    overflow: "hidden",
  },
  cardOpen: { borderColor: alpha(palette.gray[600], 0.5) },
  head: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 14 },
  emoji: { fontSize: 16, color: "#ffffff" },
  title: { flex: 1, fontSize: 13, fontWeight: "800", color: "#ffffff" },
  badge: { maxWidth: "50%", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999 },
  badgeText: { fontSize: 11, fontWeight: "800", fontVariant: ["tabular-nums"] },
  body: { paddingHorizontal: 12, paddingBottom: 12 },
})
