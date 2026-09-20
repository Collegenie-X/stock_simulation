import { Modal, Pressable, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { PressableScale } from "@/components/ui"
import { alpha, layout, palette } from "@/theme"
import { LABELS } from "../config"
import type { ExitConfirmDialogProps } from "../types"

export const ExitConfirmDialog = ({ isOpen, onCancel, onConfirm }: ExitConfirmDialogProps) => {
  const insets = useSafeAreaInsets()
  if (!isOpen) return null

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={[styles.sheet, { paddingBottom: 40 + insets.bottom }]}>
          <View style={styles.center}>
            <Text style={styles.emoji}>🚪</Text>
            <Text style={styles.title}>{LABELS.exitConfirm.title}</Text>
            <Text style={styles.description}>{LABELS.exitConfirm.description}</Text>
          </View>
          <View style={styles.buttons}>
            <PressableScale onPress={onCancel} scaleTo={0.95} style={[styles.button, { backgroundColor: palette.gray[700] }]}>
              <Text style={styles.buttonText}>{LABELS.exitConfirm.cancel}</Text>
            </PressableScale>
            <PressableScale onPress={onConfirm} scaleTo={0.95} style={[styles.button, { backgroundColor: alpha(palette.red[500], 0.9) }]}>
              <Text style={styles.buttonText}>{LABELS.exitConfirm.confirm}</Text>
            </PressableScale>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", alignItems: "center", backgroundColor: "rgba(0,0,0,0.7)" },
  sheet: {
    width: "100%",
    maxWidth: layout.maxWidth,
    backgroundColor: "#242424",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
  },
  center: { alignItems: "center" },
  emoji: { fontSize: 30, marginBottom: 8, color: "#ffffff" },
  title: { fontSize: 18, fontWeight: "900", color: "#ffffff", textAlign: "center" },
  description: { fontSize: 14, color: palette.gray[400], marginTop: 4, textAlign: "center" },
  buttons: { flexDirection: "row", gap: 12, paddingTop: 8 },
  button: { flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  buttonText: { fontSize: 16, fontWeight: "700", color: "#ffffff" },
})
