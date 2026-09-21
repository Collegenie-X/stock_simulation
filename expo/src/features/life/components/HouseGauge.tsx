/**
 * 집 게이지 — 경험치 바처럼, 이 집 구간 안에서 지금 돈이 어디쯤인지 보여준다.
 * 왼쪽 끝을 뚫으면 좁은 집, 오른쪽 끝을 넘으면 넓은 집.
 */
import { useEffect, useRef } from "react"
import { Animated, StyleSheet, Text, View } from "react-native"
import { Gradient } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { getHouse, houseGauge, MAX_STAGE, type LifeCharacter } from "../config"

interface HouseGaugeProps {
  assets: number
  stage: number
  character: LifeCharacter
  compact?: boolean
}

export function HouseGauge({ assets, stage, character, compact = false }: HouseGaugeProps) {
  const value = houseGauge(assets, stage, character)
  const width = useRef(new Animated.Value(value)).current

  useEffect(() => {
    Animated.spring(width, { toValue: value, useNativeDriver: false, friction: 7 }).start()
  }, [value, width])

  const danger = stage > 1 && value < 0.15
  const almost = stage < MAX_STAGE && value > 0.85
  const colors = danger
    ? [palette.blue[600], palette.blue[400]]
    : almost
      ? [palette.amber[500], palette.yellow[300]]
      : [palette.emerald[600], palette.emerald[400]]

  return (
    <View style={styles.row}>
      <Text style={[styles.end, compact && styles.endCompact, stage <= 1 && { opacity: 0.2 }]}>{getHouse(stage - 1).emoji}</Text>
      <View style={[styles.track, compact && { height: 6 }]}>
        <Animated.View style={{ height: "100%", width: width.interpolate({ inputRange: [0, 1], outputRange: ["3%", "100%"] }) }}>
          <Gradient dir="r" colors={colors} style={styles.fill} />
        </Animated.View>
      </View>
      <Text style={[styles.end, compact && styles.endCompact, stage >= MAX_STAGE && { opacity: 0.2 }]}>{getHouse(stage + 1).emoji}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  end: { fontSize: 14, color: "#ffffff" },
  endCompact: { fontSize: 11 },
  track: { flex: 1, height: 10, borderRadius: 9999, backgroundColor: alpha("#ffffff", 0.08), overflow: "hidden" },
  fill: { flex: 1, borderRadius: 9999 },
})
