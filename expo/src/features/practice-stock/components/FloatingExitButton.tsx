import { StyleSheet, Text } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { X } from "lucide-react-native"
import { PressableScale } from "@/components/ui"
import { alpha, palette } from "@/theme"

interface FloatingExitButtonProps {
  onClick: () => void
}

export const FloatingExitButton = ({ onClick }: FloatingExitButtonProps) => {
  const insets = useSafeAreaInsets()
  return (
    <PressableScale onPress={onClick} scaleTo={0.95} style={[styles.button, { top: insets.top + 16 }]}>
      <Text style={styles.text}>종료</Text>
      <X size={14} color={palette.gray[400]} />
    </PressableScale>
  )
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    right: 16,
    zIndex: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: alpha(palette.gray[800], 0.95),
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.5),
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  },
  text: { fontSize: 12, fontWeight: "700", color: palette.gray[400] },
})
