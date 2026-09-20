import { StyleSheet, Text, View } from "react-native"
import { BounceIn, FadeIn } from "@/components/ui"
import { palette } from "@/theme"

interface DatePopupProps {
  isVisible: boolean
  date: string
}

export const DatePopup = ({ isVisible, date }: DatePopupProps) => {
  if (!isVisible) return null

  return (
    <FadeIn duration={300} style={styles.overlay}>
      <View pointerEvents="none" style={styles.center}>
        <BounceIn duration={500} style={styles.content}>
          <Text style={styles.label}>Today is</Text>
          <Text style={styles.date} adjustsFontSizeToFit numberOfLines={1}>
            {date}
          </Text>
        </BounceIn>
      </View>
    </FadeIn>
  )
}

const styles = StyleSheet.create({
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, backgroundColor: "rgba(0,0,0,0.7)", pointerEvents: "none" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  content: { alignItems: "center" },
  label: { fontSize: 24, fontWeight: "500", color: palette.gray[300], marginBottom: 8 },
  date: { fontSize: 60, fontWeight: "700", color: "#ffffff", letterSpacing: -0.4, textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 8 }, textShadowRadius: 16 },
})
