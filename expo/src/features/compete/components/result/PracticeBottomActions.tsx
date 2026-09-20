import { StyleSheet, Text } from "react-native"
import { RotateCcw } from "lucide-react-native"
import { Gradient, PressableScale } from "@/components/ui"
import { alpha } from "@/theme"
import { ResultBottomBar } from "./ResultBottomBar"

interface PracticeBottomActionsProps {
  onBack: () => void
  onRetry: () => void
  retryLabel: string
  colors: readonly string[]
  shadowColor: string
}

export function PracticeBottomActions({ onBack, onRetry, retryLabel, colors, shadowColor }: PracticeBottomActionsProps) {
  return (
    <ResultBottomBar>
      <PressableScale onPress={onBack} style={styles.back}>
        <Text style={styles.text}>돌아가기</Text>
      </PressableScale>
      <PressableScale onPress={onRetry} style={{ flex: 2 }}>
        <Gradient dir="r" colors={colors} style={[styles.retry, { boxShadow: `0 10px 15px ${alpha(shadowColor, 0.2)}` }]}>
          <RotateCcw size={20} color="#ffffff" />
          <Text style={styles.text}>{retryLabel}</Text>
        </Gradient>
      </PressableScale>
    </ResultBottomBar>
  )
}

const styles = StyleSheet.create({
  back: { flex: 1, height: 56, borderRadius: 16, backgroundColor: "#1a1a1a", borderWidth: 1, borderColor: alpha("#ffffff", 0.1), alignItems: "center", justifyContent: "center" },
  retry: { height: 56, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  text: { fontSize: 16, fontWeight: "900", color: "#ffffff" },
})
