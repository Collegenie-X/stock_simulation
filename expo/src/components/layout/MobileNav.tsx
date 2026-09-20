/**
 * 모바일 하단 네비게이션 바 (웹 components/mobile-nav.tsx 포팅)
 */
import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { usePathname, useRouter, type Href } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LineChart, Map, Trophy, User, type LucideIcon } from "lucide-react-native"
import { alpha, layout, palette } from "@/theme"

interface NavItem {
  icon: LucideIcon
  label: string
  href: string
}

const navItems: NavItem[] = [
  { icon: Map, label: "홈", href: "/home" },
  { icon: LineChart, label: "연습", href: "/learn" },
  { icon: Trophy, label: "도전", href: "/compete" },
  { icon: User, label: "MY", href: "/profile" },
]

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.nav, { paddingBottom: insets.bottom }]}>
      <View style={styles.row}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/home" && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Pressable
              key={item.href}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              onPress={() => !isActive && router.replace(item.href as Href)}
              style={styles.item}
            >
              <View style={[styles.iconWrap, isActive && { backgroundColor: alpha("#ffffff", 0.1) }]}>
                <Icon size={24} color={isActive ? "#ffffff" : palette.gray[500]} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && <View style={styles.dot} />}
              </View>
              <Text style={[styles.label, { color: isActive ? "#ffffff" : palette.gray[500] }]}>{item.label}</Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  nav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#1a1a1a",
    borderTopWidth: 1,
    borderTopColor: alpha("#ffffff", 0.05),
  },
  row: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", height: layout.navHeight, paddingHorizontal: 8 },
  item: { flex: 1, height: "100%", alignItems: "center", justifyContent: "center", gap: 4, minHeight: 44, minWidth: 44 },
  iconWrap: { padding: 8, borderRadius: 12 },
  dot: { position: "absolute", bottom: -4, alignSelf: "center", width: 4, height: 4, borderRadius: 2, backgroundColor: palette.blue[500] },
  label: { fontSize: 10, fontWeight: "600", letterSpacing: -0.25 },
})
