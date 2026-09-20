import { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { ChevronDown } from "lucide-react-native"
import { alpha, palette } from "@/theme"

// ── 공통 섹션 헤더 (접기/펼치기) ──────────────────────────────────
export function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false,
  badge,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  badge?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <View style={{ marginTop: 20 }}>
      <Pressable onPress={() => setOpen(!open)} style={sectionStyles.head}>
        {icon}
        <Text style={sectionStyles.title}>{title}</Text>
        {!!badge && (
          <View style={sectionStyles.badge}>
            <Text style={sectionStyles.badgeText}>{badge}</Text>
          </View>
        )}
        <View style={open ? { transform: [{ rotate: "180deg" }] } : undefined}>
          <ChevronDown size={16} color={palette.gray[500]} />
        </View>
      </Pressable>
      {open && children}
    </View>
  )
}

export const sectionStyles = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  title: { flex: 1, fontSize: 14, fontWeight: "700", color: "#ffffff" },
  badge: { backgroundColor: alpha("#ffffff", 0.1), paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999 },
  badgeText: { fontSize: 10, color: palette.gray[400] },
})
