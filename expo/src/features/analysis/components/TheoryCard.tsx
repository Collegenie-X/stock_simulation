import { StyleSheet, Text, View } from "react-native"
import { BounceIn, FadeUp, Gradient } from "@/components/ui"
import { alpha } from "@/theme"
import type { TheoryQuestion, TheoryOption, PersonalityType } from "../types"
import { PERSONALITY_META, PERSONALITY_COLORS, LABELS } from "../config"
import AnimatedMiniChart from "./AnimatedMiniChart"
import OptionButton from "./OptionButton"

interface TheoryCardProps {
  question: TheoryQuestion
  selected: number | null
  showFeedback: boolean
  feedbackType: PersonalityType | null
  feedbackInsight: string
  chartTrigger: number
  onSelect: (index: number, option: TheoryOption) => void
}

export default function TheoryCard({
  question,
  selected,
  showFeedback,
  feedbackType,
  feedbackInsight,
  chartTrigger,
  onSelect,
}: TheoryCardProps) {
  const meta = feedbackType ? PERSONALITY_META[feedbackType] : null
  const c = feedbackType ? PERSONALITY_COLORS[feedbackType] : null

  return (
    <FadeUp key={question.id} distance={20} duration={400} style={styles.root}>
      {/* animated chart background visual */}
      <View style={styles.chartBox}>
        <AnimatedMiniChart variant={question.chartVariant} accent={question.chartAccent} trigger={chartTrigger} />
        {/* question overlay */}
        <Gradient dir="t" colors={["rgba(0,0,0,0.8)", "rgba(0,0,0,0.4)", "rgba(0,0,0,0)"]} style={styles.overlay}>
          <Text style={styles.question}>{question.question}</Text>
        </Gradient>
      </View>

      {/* options */}
      <View style={styles.options}>
        {question.options.map((opt, i) => (
          <OptionButton
            key={`${question.id}-${i}`}
            emoji={opt.emoji}
            text={opt.text}
            personalityType={opt.personalityType}
            isSelected={selected === i}
            showFeedback={showFeedback}
            onClick={() => onSelect(i, opt)}
            delay={i * 80}
          />
        ))}
      </View>

      {/* personality feedback card */}
      {showFeedback && !!meta && !!c && (
        <BounceIn style={[styles.feedback, { borderColor: c.border, backgroundColor: c.bg, boxShadow: c.glow }]}>
          <View style={styles.feedbackHead}>
            <Text style={styles.feedbackEmoji}>{meta.emoji}</Text>
            <View>
              <Text style={[styles.feedbackLabel, { color: c.text }]}>{meta.label}</Text>
              <Text style={styles.feedbackTitle}>{LABELS.feedbackTitle}</Text>
            </View>
          </View>
          <Text style={styles.feedbackInsight}>{feedbackInsight}</Text>
        </BounceIn>
      )}
    </FadeUp>
  )
}

const styles = StyleSheet.create({
  root: { gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  chartBox: {
    height: 128,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: alpha("#ffffff", 0.08),
    backgroundColor: "#0a0a0a",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  question: {
    fontSize: 14,
    fontWeight: "700",
    color: alpha("#ffffff", 0.95),
    lineHeight: 23,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  options: { gap: 8 },
  feedback: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 16, gap: 8 },
  feedbackHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  feedbackEmoji: { fontSize: 30, color: "#ffffff" },
  feedbackLabel: { fontSize: 14, fontWeight: "900" },
  feedbackTitle: { fontSize: 11, color: alpha("#ffffff", 0.4) },
  feedbackInsight: { fontSize: 14, color: alpha("#ffffff", 0.75), lineHeight: 23 },
})
