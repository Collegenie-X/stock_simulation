/**
 * RaceTrack — 수익률 경주 트랙
 * 주자(나 · 유사 AI · 최고 투자자)가 출발선에서 자기 수익률 위치까지 달려갑니다.
 */
import { useEffect, useRef, useState } from "react"
import { Animated, Easing, StyleSheet, Text, View } from "react-native"
import { alpha, palette } from "@/theme"

export interface Racer {
  key: string
  emoji: string
  name: string
  value: number
  color: string
  isMe?: boolean
}

const RUNNER = 30

function Lane({ racer, max, width, index }: { racer: Racer; max: number; width: number; index: number }) {
  const run = useRef(new Animated.Value(0)).current
  const bob = useRef(new Animated.Value(0)).current
  const target = Math.max(0, (Math.max(0, racer.value) / max) * (width - RUNNER))

  useEffect(() => {
    run.setValue(0)
    const a = Animated.timing(run, { toValue: 1, duration: 1300 + index * 150, delay: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true })
    const b = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 320, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 320, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    )
    a.start()
    b.start()
    return () => {
      a.stop()
      b.stop()
    }
  }, [run, bob, index, target])

  return (
    <View style={styles.lane}>
      <View style={styles.laneHead}>
        <Text style={[styles.name, racer.isMe && { color: "#ffffff" }]}>{racer.name}</Text>
        <Text style={[styles.value, { color: racer.color }]}>
          {racer.value > 0 ? "+" : ""}
          {racer.value}%
        </Text>
      </View>
      <View style={[styles.track, racer.isMe && { borderColor: alpha(racer.color, 0.4) }]}>
        {/* 지나온 길 */}
        <Animated.View
          style={[
            styles.trail,
            { backgroundColor: alpha(racer.color, 0.35), width: target + RUNNER / 2, transform: [{ translateX: run.interpolate({ inputRange: [0, 1], outputRange: [-(target + RUNNER / 2), 0] }) }] },
          ]}
        />
        <Animated.View
          style={[
            styles.runner,
            { backgroundColor: alpha(racer.color, 0.25), borderColor: racer.color },
            {
              transform: [
                { translateX: run.interpolate({ inputRange: [0, 1], outputRange: [0, target] }) },
                { translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, racer.isMe ? -3 : -1.5] }) },
              ],
            },
          ]}
        >
          <Text style={styles.runnerEmoji}>{racer.emoji}</Text>
        </Animated.View>
      </View>
    </View>
  )
}

export function RaceTrack({ racers }: { racers: Racer[] }) {
  const [width, setWidth] = useState(0)
  const max = Math.max(...racers.map((r) => r.value), 1) * 1.08

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={styles.root}>
      {width > 0 && racers.map((r, i) => <Lane key={r.key} racer={r} max={max} width={width - 22} index={i} />)}
      <View pointerEvents="none" style={styles.finish}>
        <Text style={styles.flag}>🏁</Text>
        <View style={styles.finishLine} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { gap: 10, paddingRight: 22 },
  lane: { gap: 4 },
  laneHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 11, fontWeight: "700", color: palette.gray[400] },
  value: { fontSize: 12, fontWeight: "900", fontVariant: ["tabular-nums"] },
  track: { height: RUNNER, borderRadius: RUNNER / 2, backgroundColor: alpha("#ffffff", 0.04), borderWidth: 1, borderColor: alpha("#ffffff", 0.06), overflow: "hidden", justifyContent: "center" },
  trail: { position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: RUNNER / 2 },
  runner: { width: RUNNER, height: RUNNER, borderRadius: RUNNER / 2, borderWidth: 1.5, alignItems: "center", justifyContent: "center", marginTop: -1, marginLeft: -1 },
  runnerEmoji: { fontSize: 15, color: "#ffffff" },
  finish: { position: "absolute", right: 0, top: 0, bottom: 0, width: 18, alignItems: "center" },
  flag: { fontSize: 12, color: "#ffffff" },
  finishLine: { flex: 1, width: 0, borderLeftWidth: 1.5, borderLeftColor: alpha("#ffffff", 0.25), borderStyle: "dashed", marginTop: 2 },
})
