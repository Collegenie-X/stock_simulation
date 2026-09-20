import { StyleSheet, Text, View } from "react-native"
import { Float, PressableScale } from "@/components/ui"
import { alpha, palette } from "@/theme"

interface ResultScreenProps {
  profitRate: number
  onGoHome: () => void
}

export const ResultScreen = ({ profitRate, onGoHome }: ResultScreenProps) => {
  const badge = (
    <View style={[styles.badge, { backgroundColor: alpha(profitRate > 0 ? palette.red[500] : palette.blue[500], 0.2) }]}>
      <Text style={styles.badgeEmoji}>{profitRate > 0 ? "🏆" : "💪"}</Text>
    </View>
  )

  return (
    <View style={styles.root}>
      {/* 웹: 수익일 때 animate-bounce */}
      {profitRate > 0 ? (
        <Float duration={1000} distance={16} style={styles.badgeWrap}>
          {badge}
        </Float>
      ) : (
        <View style={styles.badgeWrap}>{badge}</View>
      )}
      <Text style={styles.title}>게임 종료!</Text>
      <Text style={styles.subtitle}>
        최종 수익률: <Text style={{ color: profitRate > 0 ? palette.red[500] : palette.blue[500] }}>{profitRate}%</Text>
      </Text>
      <PressableScale onPress={onGoHome} style={styles.button}>
        <Text style={styles.buttonText}>홈으로 돌아가기</Text>
      </PressableScale>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#191919", alignItems: "center", justifyContent: "center", padding: 24 },
  badgeWrap: { marginBottom: 24 },
  badge: { width: 128, height: 128, borderRadius: 64, alignItems: "center", justifyContent: "center", boxShadow: "0 25px 50px rgba(0,0,0,0.25)" },
  badgeEmoji: { fontSize: 72, color: "#ffffff" },
  title: { fontSize: 30, fontWeight: "700", color: "#ffffff", marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 16, fontWeight: "500", color: palette.gray[400], marginBottom: 32, textAlign: "center" },
  button: { width: "100%", height: 56, borderRadius: 16, backgroundColor: palette.blue[600], alignItems: "center", justifyContent: "center" },
  buttonText: { fontSize: 18, fontWeight: "700", color: "#ffffff" },
})
