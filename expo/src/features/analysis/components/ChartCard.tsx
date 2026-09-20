import { StyleSheet, Text, View } from "react-native"
import { BounceIn, FadeUp, Gradient, Pulse } from "@/components/ui"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"
import type { ChartQuestion, ChartOption, PersonalityType } from "../types"
import { PERSONALITY_META, PERSONALITY_COLORS, LABELS } from "../config"
import AnimatedMiniChart from "./AnimatedMiniChart"
import OptionButton from "./OptionButton"

interface ChartCardProps {
  question: ChartQuestion
  selected: number | null
  showFeedback: boolean
  feedbackType: PersonalityType | null
  feedbackInsight: string
  trigger: number
  onSelect: (index: number, option: ChartOption) => void
}

function formatPrice(v: number) {
  return formatNumber(v) + "원"
}

export default function ChartCard({
  question,
  selected,
  showFeedback,
  feedbackType,
  feedbackInsight,
  trigger,
  onSelect,
}: ChartCardProps) {
  const meta = feedbackType ? PERSONALITY_META[feedbackType] : null
  const c = feedbackType ? PERSONALITY_COLORS[feedbackType] : null
  const isUp = question.change?.startsWith("+")
  const isDown = question.change?.startsWith("-")

  return (
    <FadeUp key={question.id} distance={20} duration={400} style={styles.root}>
      {/* scenario title */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>{question.title}</Text>
      </View>

      {/* animated chart */}
      <View style={styles.chartBox}>
        <AnimatedMiniChart variant={question.chartVariant} accent={question.chartAccent} trigger={trigger} />

        <View style={styles.topLeft}>
          <Text style={styles.stock}>{question.stock}</Text>
          <Text style={styles.sector}>{question.sector}</Text>
        </View>
        <View style={styles.topRight}>
          <Text style={styles.price}>{formatPrice(question.currentPrice)}</Text>
          {!!question.change && (
            <Text
              style={[
                styles.change,
                { color: isUp ? palette.emerald[400] : isDown ? palette.red[400] : alpha("#ffffff", 0.5) },
              ]}
            >
              {question.change}
            </Text>
          )}
        </View>

        <Gradient dir="t" colors={["rgba(0,0,0,0.8)", "rgba(0,0,0,0)"]} style={styles.situationBox}>
          <Text style={styles.situation}>{question.situation}</Text>
        </Gradient>
      </View>

      {/* info pills */}
      <View style={styles.pills}>
        {!!question.volume && (
          <View style={[styles.pill, { backgroundColor: alpha("#ffffff", 0.05), borderColor: alpha("#ffffff", 0.08) }]}>
            <Text style={[styles.pillText, { color: alpha("#ffffff", 0.55) }]}>거래량 {question.volume}</Text>
          </View>
        )}
        {!!question.news && (
          <View style={[styles.pill, { backgroundColor: alpha(palette.blue[500], 0.1), borderColor: alpha(palette.blue[500], 0.2) }]}>
            <Text style={[styles.pillText, { color: alpha(palette.blue[300], 0.8) }]}>📰 {question.news}</Text>
          </View>
        )}
        {!!question.aiWarning && (
          <Pulse style={[styles.pill, { backgroundColor: alpha(palette.yellow[500], 0.1), borderColor: alpha(palette.yellow[500], 0.2) }]}>
            <Text style={[styles.pillText, { color: alpha(palette.yellow[300], 0.8) }]}>🤖 {question.aiWarning}</Text>
          </Pulse>
        )}
      </View>

      {/* question */}
      <View style={styles.questionBox}>
        <Text style={styles.question}>{question.question}</Text>
      </View>

      {/* options */}
      <View style={styles.options}>
        {question.options.map((opt, i) => (
          <OptionButton
            key={`${question.id}-${i}`}
            emoji={opt.emoji}
            text={opt.text}
            subLabel={!showFeedback ? opt.emotion : undefined}
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

const shadow = {
  textShadowColor: "rgba(0,0,0,0.5)",
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 2,
} as const

const styles = StyleSheet.create({
  root: { gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 4 },
  title: { fontSize: 16, fontWeight: "900", color: alpha("#ffffff", 0.9) },
  chartBox: {
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: alpha("#ffffff", 0.08),
    backgroundColor: "#0a0a0a",
  },
  topLeft: { position: "absolute", top: 10, left: 12 },
  topRight: { position: "absolute", top: 10, right: 12, alignItems: "flex-end" },
  stock: { fontSize: 14, fontWeight: "700", color: alpha("#ffffff", 0.9), ...shadow },
  sector: { fontSize: 11, color: alpha("#ffffff", 0.45) },
  price: { fontSize: 16, fontWeight: "900", color: "#ffffff", ...shadow },
  change: { fontSize: 12, fontWeight: "700" },
  situationBox: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 12, paddingVertical: 8 },
  situation: { fontSize: 10, color: alpha("#ffffff", 0.55) },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  pill: { borderWidth: 1, borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 4 },
  pillText: { fontSize: 10 },
  questionBox: {
    borderRadius: 16,
    backgroundColor: alpha("#ffffff", 0.04),
    borderWidth: 1,
    borderColor: alpha("#ffffff", 0.08),
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  question: { fontSize: 14, fontWeight: "700", color: alpha("#ffffff", 0.9), lineHeight: 23, textAlign: "center" },
  options: { gap: 8 },
  feedback: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 16, gap: 8 },
  feedbackHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  feedbackEmoji: { fontSize: 30, color: "#ffffff" },
  feedbackLabel: { fontSize: 14, fontWeight: "900" },
  feedbackTitle: { fontSize: 11, color: alpha("#ffffff", 0.4) },
  feedbackInsight: { fontSize: 14, color: alpha("#ffffff", 0.75), lineHeight: 23 },
})
