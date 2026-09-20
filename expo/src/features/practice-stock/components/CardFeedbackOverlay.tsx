import { StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { FadeUp } from "@/components/ui"
import { alpha, palette } from "@/theme"
import type { CardFeedbackData } from "../types"

interface CardFeedbackOverlayProps {
  isVisible: boolean
  data: CardFeedbackData | null
}

export const CardFeedbackOverlay = ({ isVisible, data }: CardFeedbackOverlayProps) => {
  const insets = useSafeAreaInsets()
  if (!isVisible || !data) return null

  const accent =
    data.type === "buy"
      ? { borderColor: alpha(palette.red[500], 0.3), backgroundColor: "#2b1c1e" }
      : data.type === "sell"
        ? { borderColor: alpha(palette.blue[500], 0.3), backgroundColor: "#1b2230" }
        : { borderColor: alpha(palette.gray[600], 0.4), backgroundColor: alpha(palette.gray[800], 0.95) }

  return (
    <View pointerEvents="none" style={[styles.wrap, { top: insets.top + 16 }]}>
      {/* 웹: slide-in-from-top-3 */}
      <FadeUp duration={200} distance={-12}>
        <View style={[styles.card, accent]}>
          <Text style={styles.emoji}>{data.emoji}</Text>
          <View style={styles.body}>
            <Text style={styles.message}>{data.message}</Text>
            {!!data.priceChange && (
              <Text
                style={[
                  styles.priceChange,
                  { color: data.type === "buy" ? palette.red[400] : data.type === "sell" ? palette.blue[400] : palette.gray[400] },
                ]}
              >
                {data.priceChange}
              </Text>
            )}
          </View>
        </View>
      </FadeUp>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 16, right: 16, zIndex: 50 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  },
  emoji: { fontSize: 24, lineHeight: 28, color: "#ffffff" },
  body: { flex: 1, minWidth: 0 },
  message: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  priceChange: { fontSize: 12, fontWeight: "700", marginTop: 2 },
})
