import { StyleSheet, Text, View } from "react-native"
import { Pulse, Spin } from "@/components/ui"
import { palette } from "@/theme"

interface LoadingScreenProps {
  reason?: string
}

export const LoadingScreen = ({ reason }: LoadingScreenProps) => (
  <View style={styles.root}>
    <Pulse style={styles.content}>
      <Spin>
        <View style={styles.spinner} />
      </Spin>
      <Text style={styles.title}>게임 로딩 중...</Text>
      {!!reason && <Text style={styles.reason}>{reason}</Text>}
    </Pulse>
  </View>
)

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#191919", alignItems: "center", justifyContent: "center" },
  content: { alignItems: "center", gap: 16 },
  spinner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: palette.blue[500],
    borderTopColor: "transparent",
  },
  title: { fontSize: 20, fontWeight: "700", color: palette.gray[300] },
  reason: { fontSize: 14, color: palette.gray[500] },
})
