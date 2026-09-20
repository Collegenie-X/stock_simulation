import React, { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { Target, TrendingUp, Waves, Zap } from "lucide-react-native"
import { alpha, palette } from "@/theme"
import { RotatingChevron } from "./RotatingChevron"

const WAVE_READING_STEPS = [
  {
    step: 1,
    emoji: "🌊",
    icon: Waves,
    title: "파도 흐름 파악하기",
    description: "상승/하락의 큰 흐름을 먼저 읽어요",
    tip: "급등락에 흔들리지 말고 전체 방향성을 봐요",
    // border-cyan-500/30 bg-cyan-500/8
    color: palette.cyan[500],
  },
  {
    step: 2,
    emoji: "📊",
    icon: TrendingUp,
    title: "전환점 포착하기",
    description: "파도가 바뀌는 순간을 감지해요",
    tip: "거래량과 패턴 변화에 주목하세요",
    color: palette.purple[500],
  },
  {
    step: 3,
    emoji: "🎯",
    icon: Target,
    title: "AI와 갭 비교하기",
    description: "유사 AI 대비 나의 판단을 점검해요",
    tip: "갭이 클수록 개선 포인트가 명확해요",
    color: palette.orange[500],
  },
  {
    step: 4,
    emoji: "⚡",
    icon: Zap,
    title: "실전 감각 키우기",
    description: "반복 연습으로 파도 읽기 정확도를 높여요",
    tip: "70% 이상이면 실전 준비 완료!",
    color: palette.green[500],
  },
]

export function LearningProcessSteps() {
  const [open, setOpen] = useState(false)

  return (
    <View style={styles.section}>
      <Pressable onPress={() => setOpen(!open)} style={styles.header}>
        <Text style={styles.heading}>
          🌊 파도 읽기 연습 프로세스 <Text style={styles.headingSub}>({WAVE_READING_STEPS.length}단계)</Text>
        </Text>
        <RotatingChevron rotated={open} size={16} color={palette.gray[500]} />
      </Pressable>

      {open && (
        <View style={styles.list}>
          {WAVE_READING_STEPS.map((step, idx) => {
            const Icon = step.icon
            return (
              <View key={step.step} style={[styles.card, { borderColor: alpha(step.color, 0.3), backgroundColor: alpha(step.color, 0.08) }]}>
                <View style={styles.cardTop}>
                  <View style={styles.iconWrap}>
                    <Icon size={16} color={alpha("#ffffff", 0.8)} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.title}>{step.title}</Text>
                    <Text style={styles.desc}>{step.description}</Text>
                  </View>
                  <Text style={styles.index}>0{idx + 1}</Text>
                </View>
                <View style={styles.tipWrap}>
                  <View style={styles.tip}>
                    <Text style={styles.tipEmoji}>💡</Text>
                    <Text style={styles.tipText}>{step.tip}</Text>
                  </View>
                </View>
              </View>
            )
          })}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  section: { marginTop: 20 },
  header: { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heading: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  headingSub: { fontSize: 12, fontWeight: "400", color: palette.gray[500] },
  list: { marginTop: 12, gap: 8 },
  card: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12 },
  iconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: alpha("#ffffff", 0.1), alignItems: "center", justifyContent: "center" },
  title: { fontSize: 12, fontWeight: "700", color: "#ffffff" },
  desc: { fontSize: 10, color: palette.gray[400], marginTop: 2 },
  index: { fontSize: 10, fontWeight: "700", color: palette.gray[600] },
  tipWrap: { paddingHorizontal: 12, paddingBottom: 10 },
  tip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: alpha("#ffffff", 0.05), borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6 },
  tipEmoji: { fontSize: 10, color: "#ffffff" },
  tipText: { fontSize: 10, color: palette.gray[300], flexShrink: 1 },
})
