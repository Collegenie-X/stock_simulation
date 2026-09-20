import { Pressable, StyleSheet, Text, View } from "react-native"
import { useRouter, type Href } from "expo-router"
import { ChevronRight, LogOut } from "lucide-react-native"
import { alpha, palette } from "@/theme"
import { PROFILE_LABELS } from "../config"

const L = PROFILE_LABELS.navMenu

export function NavMenuSection() {
  const router = useRouter()

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{L.title}</Text>
      <View style={styles.card}>
        {L.items.map((item, i) => (
          <Pressable
            key={item.key}
            // 웹의 href="#" 항목은 이동 없음
            onPress={() => item.href !== "#" && router.push(item.href as Href)}
            style={({ pressed }) => [styles.item, i > 0 && styles.itemBorder, pressed && { backgroundColor: alpha("#ffffff", 0.1) }]}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <View style={styles.texts}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.desc}>{item.desc}</Text>
            </View>
            {"badge" in item && !!item.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
            <ChevronRight size={16} color={palette.gray[600]} />
          </Pressable>
        ))}
      </View>

      {/* 로그아웃 */}
      <Pressable style={styles.logout}>
        {({ pressed }) => (
          <>
            <LogOut size={16} color={pressed ? palette.red[400] : palette.gray[500]} />
            <Text style={[styles.logoutText, { color: pressed ? palette.red[400] : palette.gray[500] }]}>{PROFILE_LABELS.logout}</Text>
          </>
        )}
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  section: { marginTop: 20 },
  title: { fontSize: 12, fontWeight: "500", color: palette.gray[500], marginBottom: 12, paddingHorizontal: 2 },
  card: { backgroundColor: "#252525", borderRadius: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05), overflow: "hidden" },
  item: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  itemBorder: { borderTopWidth: 1, borderTopColor: alpha("#ffffff", 0.05) },
  icon: { fontSize: 20, width: 32, textAlign: "center", color: "#ffffff" },
  texts: { flex: 1, minWidth: 0 },
  label: { fontSize: 14, fontWeight: "600", color: "#ffffff" },
  desc: { fontSize: 12, color: palette.gray[500], marginTop: 2 },
  badge: { backgroundColor: palette.red[500], paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999, marginRight: 4 },
  badgeText: { fontSize: 12, fontWeight: "700", color: "#ffffff" },
  logout: { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12, paddingVertical: 12 },
  logoutText: { fontSize: 14 },
})
