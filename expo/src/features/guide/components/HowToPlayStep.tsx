import { StyleSheet, Text, View } from "react-native"
import { alpha, palette } from "@/theme"

export function HowToPlayStep({ emoji, iconBg, title, desc }: { emoji: string; iconBg: string; title: string; desc: string }) {
  return (
    <View style={styles.card}>
      <View style={[styles.icon, { backgroundColor: iconBg }]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{desc}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#252525", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: alpha("#ffffff", 0.05), flexDirection: "row", alignItems: "flex-start", gap: 16 },
  icon: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  emoji: { fontSize: 24, color: "#ffffff" },
  body: { flex: 1 },
  title: { fontSize: 16, fontWeight: "700", color: "#ffffff", marginBottom: 4 },
  desc: { fontSize: 14, lineHeight: 20, color: palette.gray[400] },
})
