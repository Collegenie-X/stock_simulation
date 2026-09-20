import { useEffect, useRef, useState } from "react"
import { Animated, Easing, StyleSheet, Text, View } from "react-native"
import { BounceIn, Gradient } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { LABELS, PERSONALITY_META, PERSONALITY_COLORS } from "../config"
import type { PersonalityType } from "../types"
import { FlameJitter } from "./GameEffects"

interface QuestionHeaderProps {
  current: number
  total: number
  score: number
  isChart: boolean
  combo?: number
  level?: number
  leadingType?: PersonalityType | null
}

function useCountUp(target: number, duration = 500) {
  const [val, setVal] = useState(target)
  useEffect(() => {
    const start = val
    const diff = target - start
    if (diff === 0) return
    const startTs = Date.now()
    let raf = 0
    const step = () => {
      const t = Math.min(1, (Date.now() - startTs) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setVal(Math.round(start + diff * eased))
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])
  return val
}

export default function QuestionHeader({
  current,
  total,
  score,
  isChart,
  combo = 0,
  level = 1,
  leadingType = null,
}: QuestionHeaderProps) {
  const pct = (current / total) * 100
  const animatedScore = useCountUp(score)
  const leadMeta = leadingType ? PERSONALITY_META[leadingType] : null
  const leadColors = leadingType ? PERSONALITY_COLORS[leadingType] : null

  // transition-all duration-700 ease-out
  const [trackW, setTrackW] = useState(0)
  const pctAnim = useRef(new Animated.Value(pct)).current
  useEffect(() => {
    const anim = Animated.timing(pctAnim, { toValue: pct, duration: 700, easing: Easing.out(Easing.ease), useNativeDriver: false })
    anim.start()
    return () => anim.stop()
  }, [pct, pctAnim])

  const badgeColor = isChart ? palette.emerald : palette.purple

  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <View style={styles.group}>
          <View style={[styles.badge, { borderColor: alpha(badgeColor[500], 0.5), backgroundColor: alpha(badgeColor[500], 0.1) }]}>
            <Text style={[styles.badgeText, { color: badgeColor[400] }]}>{isChart ? LABELS.chartBadge : LABELS.theoryBadge}</Text>
          </View>
          <View style={styles.level}>
            <Text style={styles.levelText}>Lv.{level}</Text>
          </View>
          <Text style={styles.count}>
            {current}/{total}
          </Text>
        </View>

        <View style={styles.group}>
          {combo >= 2 && (
            <BounceIn style={styles.combo}>
              <FlameJitter>
                <Text style={styles.comboFlame}>🔥</Text>
              </FlameJitter>
              <Text style={styles.comboText}>x{combo}</Text>
            </BounceIn>
          )}
          {!!leadMeta && !!leadColors && (
            <View
              accessibilityLabel={leadMeta.label}
              style={[styles.lead, { backgroundColor: leadColors.bg, borderColor: leadColors.border }]}
            >
              <Text style={styles.leadEmoji}>{leadMeta.emoji}</Text>
            </View>
          )}
          <View style={styles.score}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.scoreText}>{animatedScore}</Text>
          </View>
        </View>
      </View>

      {/* progress bar with segments */}
      <View style={styles.track} onLayout={(e) => setTrackW(e.nativeEvent.layout.width)}>
        <Animated.View
          style={[styles.fill, { width: pctAnim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }) }]}
        >
          <Gradient
            dir="r"
            colors={
              isChart
                ? [palette.emerald[500], palette.cyan[500], palette.emerald[500]]
                : [palette.purple[500], palette.pink[500], palette.purple[500]]
            }
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        {trackW > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.shine,
              { transform: [{ translateX: pctAnim.interpolate({ inputRange: [0, 100], outputRange: [-32, trackW - 32] }) }] },
            ]}
          >
            <Gradient dir="r" colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.4)", "rgba(255,255,255,0)"]} style={StyleSheet.absoluteFill} />
          </Animated.View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { gap: 8, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  group: { flexDirection: "row", alignItems: "center", gap: 6 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  level: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: alpha(palette.yellow[500], 0.4),
    backgroundColor: alpha(palette.yellow[500], 0.1),
  },
  levelText: { fontSize: 11, fontWeight: "900", color: palette.yellow[300] },
  count: { color: alpha("#ffffff", 0.5), fontSize: 12, fontWeight: "700" },
  combo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: alpha(palette.orange[500], 0.15),
    borderWidth: 1,
    borderColor: alpha(palette.orange[500], 0.5),
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  comboFlame: { fontSize: 14, color: "#ffffff" },
  comboText: { fontSize: 11, fontWeight: "900", color: palette.orange[300] },
  lead: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 4 },
  leadEmoji: { fontSize: 14, color: "#ffffff" },
  score: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: alpha("#ffffff", 0.05),
    borderWidth: 1,
    borderColor: alpha("#ffffff", 0.1),
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  star: { color: palette.yellow[400], fontSize: 14 },
  scoreText: { color: "#ffffff", fontWeight: "900", fontSize: 14, fontVariant: ["tabular-nums"] },
  track: { height: 8, borderRadius: 9999, backgroundColor: alpha("#ffffff", 0.05), overflow: "hidden" },
  fill: { height: "100%", borderRadius: 9999, overflow: "hidden" },
  shine: { position: "absolute", top: 0, left: 0, height: "100%", width: 32 },
})
