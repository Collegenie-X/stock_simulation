import { StyleSheet, Text, View } from "react-native"
import { palette } from "@/theme"

/** 슬라이드 상단 공통 헤더 (이모지 + 제목 + 설명) */
export function SlideHeading({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <View style={styles.root}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc}>{desc}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { alignItems: "center", marginBottom: 32 },
  emoji: { fontSize: 60, lineHeight: 72, marginBottom: 16, color: "#ffffff" },
  title: { fontSize: 24, lineHeight: 32, fontWeight: "700", color: "#ffffff", marginBottom: 8, textAlign: "center" },
  desc: { fontSize: 16, lineHeight: 24, color: palette.gray[400], textAlign: "center" },
})
