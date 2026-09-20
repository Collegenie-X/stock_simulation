import React from "react"
import { StyleSheet, Text, View } from "react-native"
import { type PatternStep } from "@/data/chart-patterns"
import { Gradient } from "@/components/ui"
import { alpha, palette } from "@/theme"

interface PatternStepsProps {
  steps: PatternStep[]
  signal: "매수" | "매도" | "양방향"
}

interface StepColors {
  borderColor: string
  bgColor: string
  dotColor: string
  textColor: string
}

const PHASE_CONFIG: Record<PatternStep["phase"], StepColors & { label: string; lineColor: string }> = {
  before: {
    label: "배경",
    borderColor: palette.slate[600],
    bgColor: alpha(palette.slate[600], 0.1),
    dotColor: palette.slate[500],
    textColor: palette.slate[400],
    lineColor: palette.slate[700],
  },
  forming: {
    label: "형성 중",
    borderColor: palette.indigo[600],
    bgColor: alpha(palette.indigo[600], 0.1),
    dotColor: palette.indigo[500],
    textColor: palette.indigo[400],
    lineColor: palette.indigo[900],
  },
  signal: {
    label: "신호!",
    borderColor: palette.yellow[500],
    bgColor: alpha(palette.yellow[500], 0.1),
    dotColor: palette.yellow[400],
    textColor: palette.yellow[400],
    lineColor: palette.yellow[900],
  },
  after: {
    label: "결과",
    borderColor: palette.emerald[600],
    bgColor: alpha(palette.emerald[600], 0.1),
    dotColor: palette.emerald[500],
    textColor: palette.emerald[400],
    lineColor: palette.emerald[900],
  },
}

function getSignalStepColors(signal: "매수" | "매도" | "양방향"): StepColors & { glow: string } {
  if (signal === "매수") {
    return {
      borderColor: palette.green[500],
      bgColor: alpha(palette.green[500], 0.1),
      dotColor: palette.green[400],
      textColor: palette.green[400],
      glow: "0 0 12px rgba(34,197,94,0.25)",
    }
  }
  if (signal === "매도") {
    return {
      borderColor: palette.red[500],
      bgColor: alpha(palette.red[500], 0.1),
      dotColor: palette.red[400],
      textColor: palette.red[400],
      glow: "0 0 12px rgba(239,68,68,0.25)",
    }
  }
  return {
    borderColor: palette.yellow[500],
    bgColor: alpha(palette.yellow[500], 0.1),
    dotColor: palette.yellow[400],
    textColor: palette.yellow[400],
    glow: "0 0 12px rgba(234,179,8,0.25)",
  }
}

export function PatternSteps({ steps, signal }: PatternStepsProps) {
  const signalColors = getSignalStepColors(signal)

  return (
    <View>
      {/* 세로 연결선 */}
      <Gradient dir="b" colors={[palette.slate[700], palette.indigo[800], palette.emerald[800]]} style={styles.line} />

      <View style={{ gap: 8 }}>
        {steps.map((step, idx) => {
          const isSignal = step.phase === "signal"
          const config = PHASE_CONFIG[step.phase]
          const colors = isSignal ? signalColors : null

          const borderColor = colors?.borderColor ?? config.borderColor
          const bgColor = colors?.bgColor ?? config.bgColor
          const textColor = colors?.textColor ?? config.textColor

          return (
            <View key={idx} style={styles.row}>
              {/* 스텝 번호 & 점 */}
              <View style={styles.dotCol}>
                {/* 반투명 배경 아래로 연결선이 비치지 않도록 불투명 바탕을 깔아줌 */}
                <View style={[styles.dotBase, isSignal && { transform: [{ scale: 1.1 }] }]}>
                  <View style={[styles.dot, { backgroundColor: bgColor, borderColor }]}>
                    <Text style={styles.dotEmoji}>{step.emoji}</Text>
                  </View>
                </View>
              </View>

              {/* 내용 */}
              <View style={[styles.card, { backgroundColor: bgColor, borderColor }, isSignal && !!colors && { boxShadow: colors.glow }]}>
                <View style={styles.cardHead}>
                  <View style={[styles.phase, { backgroundColor: bgColor, borderColor }]}>
                    <Text style={[styles.phaseText, { color: textColor }]}>
                      {isSignal ? "⚡ " : ""}
                      {config.label}
                    </Text>
                  </View>
                  <Text style={styles.stepNo}>STEP {idx + 1}</Text>
                </View>

                <Text style={[styles.title, { color: isSignal ? textColor : "#ffffff" }]}>{step.title}</Text>

                <Text style={styles.desc}>{step.description}</Text>

                {!!step.priceNote && (
                  <View style={[styles.price, { backgroundColor: alpha("#000000", isSignal ? 0.3 : 0.2) }]}>
                    <Text style={styles.priceEmoji}>💰</Text>
                    <Text style={[styles.priceText, { color: textColor }]}>{step.priceNote}</Text>
                  </View>
                )}
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  line: { position: "absolute", left: 18, top: 24, bottom: 24, width: 1 },
  row: { flexDirection: "row", gap: 12 },
  dotCol: { alignItems: "center" },
  dotBase: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#191919" },
  dot: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  dotEmoji: { fontSize: 16, color: "#ffffff" },
  card: { flex: 1, borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 2 },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  phase: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999, borderWidth: 1 },
  phaseText: { fontSize: 9, fontWeight: "700" },
  stepNo: { fontSize: 9, color: palette.gray[500] },
  title: { fontSize: 12, fontWeight: "700", marginBottom: 4 },
  desc: { fontSize: 12, lineHeight: 19, color: palette.gray[400] },
  price: { marginTop: 8, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, flexDirection: "row", alignItems: "center", gap: 6 },
  priceEmoji: { fontSize: 9, color: "#ffffff" },
  priceText: { flex: 1, fontSize: 10, fontWeight: "500" },
})
