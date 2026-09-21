import { useEffect, useRef } from "react"
import { Animated, Easing, StyleSheet, Text, View } from "react-native"
import { alpha, palette } from "@/theme"

export interface Racer {
  emoji: string
  name: string
  rate: number
  mine?: boolean
}

const MEDALS = ["🥇", "🥈", "🥉"]

/** 나와 AI 둘의 달리기 — 수익률 순서대로 줄 세우고, 막대가 달려 나간다 */
export function RankRace({ racers, start = true }: { racers: Racer[]; start?: boolean }) {
  const sorted = [...racers].sort((a, b) => b.rate - a.rate)
  const min = Math.min(...sorted.map((r) => r.rate), 0)
  const max = Math.max(...sorted.map((r) => r.rate), 0)
  const span = Math.max(max - min, 1)

  return (
    <View style={{ gap: 6 }}>
      {sorted.map((r, i) => (
        <Lane key={r.name} racer={r} medal={MEDALS[i]} ratio={0.18 + ((r.rate - min) / span) * 0.82} delay={i * 120} start={start} />
      ))}
    </View>
  )
}

function Lane({ racer, medal, ratio, delay, start }: { racer: Racer; medal: string; ratio: number; delay: number; start: boolean }) {
  const v = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (!start) { v.setValue(0); return }
    Animated.timing(v, { toValue: ratio, duration: 900, delay, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start()
  }, [start, ratio, delay, v])

  const color = racer.mine ? (racer.rate >= 0 ? palette.red[400] : palette.blue[400]) : palette.gray[400]

  return (
    <View style={[styles.lane, racer.mine && styles.laneMine]}>
      <Text style={styles.medal}>{medal}</Text>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.bar,
            { backgroundColor: alpha(color, racer.mine ? 0.5 : 0.28), width: v.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) },
          ]}
        />
        <Text style={[styles.name, racer.mine && { color: "#ffffff" }]} numberOfLines={1}>
          {racer.emoji} {racer.name}
        </Text>
      </View>
      <Text style={[styles.rate, { color: racer.rate >= 0 ? palette.red[400] : palette.blue[400] }]}>
        {racer.rate >= 0 ? "+" : ""}{racer.rate.toFixed(1)}%
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  lane: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  laneMine: { backgroundColor: alpha("#ffffff", 0.05) },
  medal: { fontSize: 16, color: "#ffffff" },
  track: { flex: 1, height: 28, borderRadius: 8, backgroundColor: alpha("#000000", 0.25), overflow: "hidden", justifyContent: "center" },
  bar: { position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 8 },
  name: { fontSize: 12, fontWeight: "800", color: palette.gray[300], paddingHorizontal: 8 },
  rate: { width: 58, textAlign: "right", fontSize: 13, fontWeight: "900", fontVariant: ["tabular-nums"] },
})
