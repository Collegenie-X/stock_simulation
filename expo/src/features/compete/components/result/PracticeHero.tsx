import React from "react"
import { StyleSheet, Text, View } from "react-native"
import { Pulse } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { StarRow } from "./StarRow"

interface PracticeHeroProps {
  variant: "stock" | "wave"
  patternEmoji: string
  patternName: string
  stockEmoji?: string
  meta: string
  isExperiment: boolean
  stars: number
}

export function PracticeHero({ variant, patternEmoji, patternName, stockEmoji, meta, isExperiment, stars }: PracticeHeroProps) {
  const isWave = variant === "wave"
  const tone = isWave ? palette.cyan : palette.purple
  const emoji = <Text style={styles.emoji}>{patternEmoji}</Text>

  return (
    <View style={styles.wrap}>
      {/* 웹: 파도 연습만 animate-pulse */}
      {isWave ? <Pulse style={{ marginBottom: 12 }}>{emoji}</Pulse> : <View style={{ marginBottom: 12 }}>{emoji}</View>}
      <View style={styles.titleRow}>
        {!isWave && !!stockEmoji && <Text style={{ fontSize: 30, color: "#ffffff" }}>{stockEmoji}</Text>}
        <Text style={styles.title}>{patternName}</Text>
      </View>
      <Text style={styles.meta}>{meta}</Text>
      {isExperiment && (
        <View style={[styles.badge, { backgroundColor: alpha(tone[500], 0.2), borderColor: alpha(tone[500], 0.3) }]}>
          <Text style={{ fontSize: 12, fontWeight: "700", color: tone[300] }}>🧪 실험 기록</Text>
        </View>
      )}
      <View style={{ marginBottom: 16 }}>
        <StarRow count={stars} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { marginTop: 20, alignItems: "center" },
  emoji: { fontSize: 72, lineHeight: 84, color: "#ffffff" },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: "900", color: "#ffffff" },
  meta: { color: palette.gray[400], fontSize: 14, marginBottom: 16 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9999, borderWidth: 1, marginBottom: 16 },
})
