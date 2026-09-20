import React from "react"
import { StyleSheet, Text, View } from "react-native"
import { CenterModal, PressableScale } from "@/components/ui"
import { alpha, palette } from "@/theme"

interface Props {
  visible: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ExitDialog({ visible, onConfirm, onCancel }: Props) {
  return (
    <CenterModal visible={visible} onClose={onCancel} dismissable={false} backdropColor="rgba(0,0,0,0.85)" style={styles.dialog}>
      <View style={styles.head}>
        <Text style={styles.emoji}>🚪</Text>
        <Text style={styles.title}>정말 종료할까요?</Text>
        <Text style={styles.body}>
          지금까지의 점수가 <Text style={styles.bodyStrong}>사라져요!</Text>
          {"\n"}정말 게임을 끝낼까요?
        </Text>
      </View>
      <View style={styles.actions}>
        <PressableScale onPress={onCancel} style={[styles.btn, styles.cancel]}>
          <Text style={styles.btnText}>계속할게요</Text>
        </PressableScale>
        <PressableScale onPress={onConfirm} style={[styles.btn, styles.confirm]}>
          <Text style={styles.btnText}>종료할게요</Text>
        </PressableScale>
      </View>
    </CenterModal>
  )
}

const styles = StyleSheet.create({
  dialog: {
    maxWidth: 384,
    backgroundColor: "#1a1a1a",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: alpha("#ffffff", 0.1),
    padding: 24,
    boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
  },
  head: { alignItems: "center", marginBottom: 20 },
  emoji: { fontSize: 48, color: "#ffffff", marginBottom: 12 },
  title: { fontSize: 20, fontWeight: "900", color: "#ffffff" },
  body: { fontSize: 14, lineHeight: 22, color: palette.gray[400], marginTop: 8, textAlign: "center" },
  bodyStrong: { color: palette.red[400], fontWeight: "700" },
  actions: { flexDirection: "row", gap: 12 },
  btn: { flex: 1, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  cancel: { backgroundColor: "#252525", borderWidth: 1, borderColor: alpha("#ffffff", 0.1) },
  confirm: { backgroundColor: palette.red[600] },
  btnText: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
})
