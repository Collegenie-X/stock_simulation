import React from "react"
import { StyleSheet, Text, View } from "react-native"
import type { TurnFeedback } from "@/data/pattern-practice"
import { FadeIn, Gradient, Pop, Shake } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { ParticleEffect } from "./ParticleEffect"

/** 턴 피드백 오버레이 (웹: `fixed inset-0 z-50` + shake / pop keyframes) */
export function FeedbackOverlay({ feedback }: { feedback: TurnFeedback }) {
  const top = feedback.isGood ? palette.green[900] : feedback.effect === "shake" ? palette.red[900] : palette.gray[900]

  const body = (
    <Gradient dir="b" colors={[alpha(top, 0.8), "rgba(0,0,0,0.8)", "rgba(0,0,0,0.9)"]} style={styles.fill}>
      <View style={styles.center}>
        <ParticleEffect type={feedback.effect === "sparkle" ? "sparkle" : "shake"} />
        <Pop duration={400} style={{ marginBottom: 16 }}>
          <Text style={styles.emoji}>{feedback.emoji}</Text>
        </Pop>
        <Text style={styles.title}>{feedback.title}</Text>
        <Text style={styles.reason}>{feedback.reason}</Text>
      </View>
    </Gradient>
  )

  return (
    <FadeIn duration={150} style={styles.root}>
      {feedback.effect === "shake" ? (
        <Shake distance={8} style={styles.fill}>
          {body}
        </Shake>
      ) : (
        body
      )}
    </FadeIn>
  )
}

const styles = StyleSheet.create({
  root: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 50, backgroundColor: "rgba(0,0,0,0.35)" },
  fill: { flex: 1, alignItems: "center", justifyContent: "center" },
  center: { alignItems: "center", paddingHorizontal: 24, paddingVertical: 48, alignSelf: "stretch" },
  emoji: { fontSize: 80, lineHeight: 96, color: "#ffffff", textAlign: "center" },
  title: { fontSize: 30, fontWeight: "900", color: "#ffffff", marginBottom: 8, textAlign: "center" },
  reason: { fontSize: 18, lineHeight: 25, color: alpha("#ffffff", 0.7), maxWidth: 280, textAlign: "center" },
})
