/** 투자 DNA 핵심 요약 — 성향/파도 패턴 칩 + 차오르는 4개 세로 게이지 */
import { useEffect, useRef, useState } from "react"
import { Animated, Easing, StyleSheet, Text, View } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { localStore } from "@/lib/storage"
import { alpha, palette } from "@/theme"
import { INVESTMENT_STYLES, WAVE_PATTERN_TYPES } from "../../config"

interface WaveStats {
  wave1Capture: number
  wave3Focus: number
  wave5Exit: number
  correctionHandling: number
}

interface DnaSummaryProps {
  investmentStyle: string
  wavePatternType: string
  wavePatternStats: WaveStats
}

const GAUGE_H = 64

function Gauge({ label, value, color, delay }: { label: string; value: number; color: string; delay: number }) {
  const v = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const anim = Animated.timing(v, { toValue: 1, duration: 900, delay, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true })
    anim.start()
    return () => anim.stop()
  }, [v, delay])
  const h = (Math.max(0, Math.min(100, value)) / 100) * GAUGE_H

  return (
    <View style={styles.gauge}>
      <Text style={[styles.gaugeValue, { color }]}>{value}</Text>
      <View style={styles.gaugeTrack}>
        <Animated.View style={{ height: h, borderRadius: 6, overflow: "hidden", transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [h, 0] }) }] }}>
          <LinearGradient colors={[color, alpha(color, 0.35)]} style={StyleSheet.absoluteFill} />
        </Animated.View>
      </View>
      <Text style={styles.gaugeLabel}>{label}</Text>
    </View>
  )
}

export function DnaSummary({ investmentStyle, wavePatternType, wavePatternStats }: DnaSummaryProps) {
  // 최신 성향 분석 결과가 있으면 우선 적용 (MyPatternSection 과 동일 규칙)
  const [dna] = useState(() => localStore.getJSON<{ investmentStyle?: string; wavePatternType?: string; wavePatternStats?: WaveStats }>("compete_dna_result"))
  const styleInfo = INVESTMENT_STYLES[dna?.investmentStyle ?? investmentStyle] ?? INVESTMENT_STYLES.aggressive
  const waveInfo = WAVE_PATTERN_TYPES[dna?.wavePatternType ?? wavePatternType] ?? WAVE_PATTERN_TYPES.wave3Focus
  const stats = dna?.wavePatternStats ?? wavePatternStats

  return (
    <View style={styles.root}>
      <View style={styles.left}>
        <LinearGradient colors={[styleInfo.gradientFrom, styleInfo.gradientTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.styleChip}>
          <Text style={styles.styleEmoji}>{styleInfo.emoji}</Text>
          <Text style={styles.styleLabel}>{styleInfo.label}</Text>
        </LinearGradient>
        <View style={styles.waveChip}>
          <Text style={styles.waveEmoji}>{waveInfo.emoji}</Text>
          <Text style={styles.waveLabel}>{waveInfo.label}</Text>
        </View>
      </View>

      <View style={styles.gauges}>
        <Gauge label="1파" value={stats.wave1Capture} color={palette.cyan[400]} delay={150} />
        <Gauge label="3파" value={stats.wave3Focus} color={palette.blue[400]} delay={250} />
        <Gauge label="5파" value={stats.wave5Exit} color={palette.purple[400]} delay={350} />
        <Gauge label="조정" value={stats.correctionHandling} color={palette.amber[400]} delay={450} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flexDirection: "row", alignItems: "flex-end", gap: 14 },
  left: { flex: 1, gap: 8 },
  styleChip: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10 },
  styleEmoji: { fontSize: 20, color: "#ffffff" },
  styleLabel: { fontSize: 16, fontWeight: "900", color: "#ffffff" },
  waveChip: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9, backgroundColor: alpha("#ffffff", 0.05), borderWidth: 1, borderColor: alpha("#ffffff", 0.08) },
  waveEmoji: { fontSize: 16, color: "#ffffff" },
  waveLabel: { fontSize: 13, fontWeight: "800", color: "#ffffff" },
  gauges: { flexDirection: "row", gap: 8, alignItems: "flex-end" },
  gauge: { alignItems: "center", gap: 4, width: 30 },
  gaugeValue: { fontSize: 11, fontWeight: "900", fontVariant: ["tabular-nums"] },
  gaugeTrack: { width: 14, height: GAUGE_H, borderRadius: 6, backgroundColor: alpha("#ffffff", 0.06), overflow: "hidden", justifyContent: "flex-end" },
  gaugeLabel: { fontSize: 10, fontWeight: "700", color: palette.gray[500] },
})
