import { useMemo } from "react"
import { StyleSheet, Text, View } from "react-native"
import { FadeIn, FadeUp, Float, Ping } from "@/components/ui"
import playContent from "@/data/scenario-play-content.json"
import { palette } from "@/theme"
import type { FeedbackKey } from "../hooks/useScenarioPlay"

const FB = playContent.feedback

const TITLE_COLOR: Record<FeedbackKey, string> = {
  correct: palette.yellow[400],
  good: palette.green[400],
  timeout: palette.orange[400],
  bad: palette.red[400],
}

export function FeedbackOverlay({ feedback, scorePopup, combo }: { feedback: FeedbackKey; scorePopup: { points: number; label: string } | null; combo: number }) {
  const fbData = FB[feedback] as typeof FB.correct

  // 웹은 렌더마다 Math.random() 을 호출하지만, 앱에서는 피드백이 뜰 때 한 번만 뽑아 깜빡임을 방지
  const { title, message, sparkles } = useMemo(
    () => ({
      title: fbData.titles[Math.floor(Math.random() * fbData.titles.length)],
      message: fbData.messages[Math.floor(Math.random() * fbData.messages.length)],
      sparkles: Array.from({ length: 20 }, (_, i) => ({
        left: 10 + Math.random() * 80,
        top: 5 + Math.random() * 90,
        delay: i * 50,
        size: 14 + Math.random() * 18,
      })),
    }),
    [fbData],
  )

  const body = (
    <View style={styles.body}>
      {feedback === "correct" && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {sparkles.map((s, i) => (
            <Ping key={i} delay={s.delay} duration={1000} style={{ position: "absolute", left: `${s.left}%`, top: `${s.top}%` }}>
              <Text style={{ color: palette.yellow[400], fontSize: s.size }}>✦</Text>
            </Ping>
          ))}
        </View>
      )}
      <Text style={{ fontSize: 60, marginBottom: 12, color: "#ffffff" }}>{fbData.emoji}</Text>
      <Text style={[styles.title, { color: TITLE_COLOR[feedback] }]}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {scorePopup && (
        <FadeUp duration={200} style={{ marginTop: 12, alignItems: "center" }}>
          <Text style={{ color: palette.yellow[400], fontSize: 18, fontWeight: "900" }}>+{scorePopup.points}점</Text>
          <Text style={{ fontSize: 11, color: palette.gray[400], marginTop: 2 }}>{scorePopup.label}</Text>
          {combo > 1 && <Text style={{ color: palette.orange[400], fontSize: 12, fontWeight: "700", marginTop: 4 }}>🔥 {combo}콤보!</Text>}
        </FadeUp>
      )}
    </View>
  )

  return (
    <FadeIn duration={150} style={styles.overlay}>
      <View style={styles.backdrop} />
      {feedback === "correct" ? (
        <Float duration={1000} distance={18}>
          {body}
        </Float>
      ) : (
        body
      )}
    </FadeIn>
  )
}

const styles = StyleSheet.create({
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 50, alignItems: "center", justifyContent: "center" },
  backdrop: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)" },
  body: { alignItems: "center", paddingHorizontal: 32, paddingVertical: 32 },
  title: { fontSize: 24, fontWeight: "900", marginBottom: 4, textAlign: "center" },
  message: { fontSize: 14, color: palette.gray[300], maxWidth: 260, textAlign: "center" },
})
