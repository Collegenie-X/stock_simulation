import { Pressable, StyleSheet, Text } from "react-native"
import { alpha, palette } from "@/theme"

export function QuizOption({ text, onPress }: { text: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.option, pressed && { borderColor: alpha(palette.blue[500], 0.5), backgroundColor: "#2a2a2a", transform: [{ scale: 0.98 }] }]}
    >
      <Text style={styles.text}>{text}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  option: { width: "100%", padding: 20, backgroundColor: "#252525", borderRadius: 16, borderWidth: 2, borderColor: alpha("#ffffff", 0.05) },
  text: { fontSize: 16, lineHeight: 24, fontWeight: "500", color: "#ffffff" },
})
