/**
 * 게임 화면 위쪽의 "삶" 띠 — 숫자 대신 한 사람이 흔들린다.
 * 지금 손익을 삶의 단위(월세 몇 달치)로 바꿔 부르고, 이대로 끝나면 집이 어떻게 되는지 게이지로 보여준다.
 * 집 자체는 계절이 끝날 때만 바뀐다.
 */
import { useEffect, useMemo, useRef, useState } from "react"
import { Animated, StyleSheet, Text, View } from "react-native"
import { Pulse, Shake } from "@/components/ui"
import { storage } from "@/lib/storage"
import { alpha, palette, stockColor } from "@/theme"
import { getHouse, getLifeCharacter, inLifeUnits, lineTagFor, moodEmoji, pickLine, signedKRW, stageForAssets } from "../config"
import { HouseGauge } from "./HouseGauge"

interface LifeStripProps {
  isLifeSeason: boolean
  totalValue: number
  initialValue: number
  profitRate: number
  currentDay: number
}

export function LifeStrip({ isLifeSeason, totalValue, initialValue, profitRate, currentDay }: LifeStripProps) {
  const life = useMemo(() => (isLifeSeason ? storage.getLife() : null), [isLifeSeason])
  const character = getLifeCharacter(life?.characterId)

  // 자산이 움직이면 얼굴이 튄다. 떨어질 때는 몸도 떤다.
  const prev = useRef(totalValue)
  const [dropCount, setDropCount] = useState(0)
  const bounce = useRef(new Animated.Value(1)).current
  useEffect(() => {
    if (totalValue === prev.current) return
    if (totalValue < prev.current) setDropCount((n) => n + 1)
    prev.current = totalValue
    bounce.setValue(1.35)
    Animated.spring(bounce, { toValue: 1, friction: 4, useNativeDriver: true }).start()
  }, [totalValue, bounce])

  if (!life || !character) return null

  const profit = Math.round(totalValue - initialValue)
  const projected = Math.max(0, life.assets + profit)
  const projectedStage = stageForAssets(projected, character)
  const units = inLifeUnits(profit, character)
  const movingUp = projectedStage > life.houseStage
  const movingDown = projectedStage < life.houseStage

  return (
    <View style={styles.root}>
      <Shake trigger={dropCount} distance={4}>
        <Animated.View style={[styles.face, { transform: [{ scale: bounce }] }]}>
          <Text style={styles.faceEmoji}>{moodEmoji(profitRate)}</Text>
          <Text style={styles.faceBadge}>{character.emoji}</Text>
        </Animated.View>
      </Shake>

      <View style={styles.body}>
        <View style={styles.topLine}>
          <Text style={[styles.amount, { color: stockColor(profit) }]} numberOfLines={1}>
            {signedKRW(profit)}
            {units && <Text style={styles.units}> = {units}</Text>}
          </Text>
          {movingUp && (
            <Pulse min={0.6} duration={1200}>
              <Text style={[styles.alert, styles.alertUp]}>🎉 {getHouse(projectedStage).name} 각</Text>
            </Pulse>
          )}
          {movingDown && (
            <Pulse min={0.6} duration={900}>
              <Text style={[styles.alert, styles.alertDown]}>⚠️ {getHouse(projectedStage).name} 위기</Text>
            </Pulse>
          )}
        </View>
        <HouseGauge assets={projected} stage={life.houseStage} character={character} compact />
        <Text style={styles.line} numberOfLines={1}>
          "{pickLine(lineTagFor(profitRate), currentDay)}"
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#15151c",
    borderBottomWidth: 1,
    borderBottomColor: alpha(palette.gray[800], 0.6),
  },
  face: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: alpha("#ffffff", 0.06),
    borderWidth: 1,
    borderColor: alpha("#ffffff", 0.1),
  },
  faceEmoji: { fontSize: 24, color: "#ffffff" },
  faceBadge: { position: "absolute", right: -4, bottom: -4, fontSize: 14, color: "#ffffff" },
  body: { flex: 1, minWidth: 0, gap: 4 },
  topLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  amount: { flexShrink: 1, fontSize: 13, fontWeight: "800", fontVariant: ["tabular-nums"] },
  units: { fontSize: 12, fontWeight: "700", color: "#ffffff" },
  alert: { fontSize: 10, fontWeight: "800", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999, overflow: "hidden" },
  alertUp: { color: palette.yellow[300], backgroundColor: alpha(palette.yellow[500], 0.15) },
  alertDown: { color: palette.blue[300], backgroundColor: alpha(palette.blue[500], 0.18) },
  line: { fontSize: 11, color: palette.gray[500] },
})
