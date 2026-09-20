import { StyleSheet, Text, View } from "react-native"
import { CenterModal, PressableScale } from "@/components/ui"
import { alpha, palette } from "@/theme"

export function ExitConfirmModal({ visible, onCancel, onExit }: { visible: boolean; onCancel: () => void; onExit: () => void }) {
  return (
    <CenterModal visible={visible} onClose={onCancel} backdropColor="rgba(0,0,0,0.7)" style={styles.dialog}>
      <Text style={styles.title}>게임을 종료할까요?</Text>
      <Text style={styles.desc}>현재 진행 중인 내용은 저장되지 않습니다.</Text>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <PressableScale scaleTo={0.95} onPress={onCancel} style={[styles.btn, { backgroundColor: palette.gray[700] }]}>
          <Text style={styles.btnText}>계속하기</Text>
        </PressableScale>
        <PressableScale scaleTo={0.95} onPress={onExit} style={[styles.btn, { backgroundColor: palette.red[600] }]}>
          <Text style={styles.btnText}>종료</Text>
        </PressableScale>
      </View>
    </CenterModal>
  )
}

const styles = StyleSheet.create({
  dialog: { backgroundColor: "#1e1e1e", borderRadius: 16, padding: 24, maxWidth: 384, borderWidth: 1, borderColor: alpha(palette.gray[700], 0.5) },
  title: { fontSize: 18, fontWeight: "900", color: "#ffffff", marginBottom: 8 },
  desc: { fontSize: 14, color: palette.gray[400], marginBottom: 20 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  btnText: { color: "#ffffff", fontWeight: "700", fontSize: 14 },
})
