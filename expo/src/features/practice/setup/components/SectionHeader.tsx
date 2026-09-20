import type { ReactNode } from "react"
import { StyleSheet, Text, View } from "react-native"
import { palette } from "@/theme"

interface SectionHeaderProps {
  icon: ReactNode
  title: string
  /** 아이콘 박스 배경색 / 테두리색 (웹의 accent 클래스 대체) */
  accentBg: string
  accentBorder: string
  hint?: string
}

export function SectionHeader({ icon, title, accentBg, accentBorder, hint }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.iconBox, { backgroundColor: accentBg, borderColor: accentBorder }]}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      {!!hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  iconBox: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  title: { fontSize: 18, fontWeight: "900", letterSpacing: -0.4, color: "#ffffff", textTransform: "uppercase" },
  hint: { fontSize: 10, color: palette.gray[500], marginLeft: 4 },
})
