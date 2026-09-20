import { StyleSheet, Text, View } from "react-native"
import { FadeIn } from "@/components/ui"
import { alpha, palette } from "@/theme"

/** 피드백 (웹: fixed top-24 중앙 토스트) */
export function FeedbackToast({ lines, top }: { lines: string[]; top: number }) {
  if (lines.length === 0) return null
  return (
    <View pointerEvents="none" style={[styles.wrap, { top }]}>
      <FadeIn duration={150} style={styles.toast}>
        {lines.map((line, i) => (
          <Text key={i} style={i === 0 ? styles.first : styles.rest}>
            {line}
          </Text>
        ))}
      </FadeIn>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, alignItems: "center", zIndex: 30 },
  toast: {
    backgroundColor: "rgba(0,0,0,0.9)",
    borderWidth: 1,
    borderColor: alpha(palette.purple[500], 0.5),
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxWidth: 320,
    boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
  },
  first: { fontWeight: "700", color: palette.purple[300], fontSize: 16 },
  rest: { fontSize: 12, color: palette.gray[400] },
})
