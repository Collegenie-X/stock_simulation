import { StyleSheet, Text, View } from "react-native"
import { PressableScale } from "@/components/ui"
import { palette } from "@/theme"

interface TradeFallbackProps {
  emoji: string
  message: string
  /** 있으면 "돌아가기" 버튼 표시 */
  onBack?: () => void
}

/** 시나리오/세션/주식 정보를 찾지 못했을 때 또는 로딩 중 전체 화면 */
export default function TradeFallback({ emoji, message, onBack }: TradeFallbackProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.message}>{message}</Text>
      {onBack ? (
        <PressableScale onPress={onBack} style={styles.button}>
          <Text style={styles.message}>돌아가기</Text>
        </PressableScale>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#191919", alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 24, color: "#ffffff", marginBottom: 16 },
  message: { fontSize: 16, color: "#ffffff" },
  button: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 8, backgroundColor: palette.blue[600], borderRadius: 8 },
})
