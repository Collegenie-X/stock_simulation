/**
 * 계절 결과 — 집이 바뀌는 순간 (10.3 ~ 10.5)
 * 곡선이 말하던 것을 집이 말한다: 나의 집, 그리고 같은 돈으로 다른 길을 간 집들.
 */
import { useEffect, useRef } from "react"
import { Animated, Easing, StyleSheet, Text, View } from "react-native"
import { BounceIn, FadeUp, Gradient, Pop, Wiggle } from "@/components/ui"
import { formatNumber } from "@/lib/format"
import { alpha, palette, stockColor } from "@/theme"
import {
  LABELS,
  getHouse,
  inLifeUnits,
  pickLine,
  signedKRW,
  stageForAssets,
  wisdomTitle,
  type LifeCharacter,
  type SeasonOutcome,
} from "../config"
import { HouseSvg } from "./HouseSvg"

interface OtherPath {
  emoji: string
  name: string
  /** 같은 시작 금액으로 그 길이 끝낸 총자산 */
  totalValue: number
}

interface SeasonMoveCardProps {
  outcome: SeasonOutcome
  character: LifeCharacter
  initialValue: number
  otherPaths: OtherPath[]
}

const CONFETTI = ["🎉", "✨", "🎊", "⭐", "✨", "🎉"]

export function SeasonMoveCard({ outcome, character, initialValue, otherPaths }: SeasonMoveCardProps) {
  const movedUp = outcome.stageAfter > outcome.stageBefore
  const movedDown = outcome.stageAfter < outcome.stageBefore
  const moved = movedUp || movedDown
  const wisdomGain = outcome.wisdomAfter - outcome.wisdomBefore
  const titleBefore = wisdomTitle(outcome.wisdomBefore)
  const titleAfter = wisdomTitle(outcome.wisdomAfter)
  const units = inLifeUnits(outcome.profitAmount, character)

  // 이삿짐 트럭이 옛집에서 새집으로 달린다
  const truck = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (!moved) return
    Animated.timing(truck, { toValue: 1, duration: 1400, delay: 500, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }).start()
  }, [moved, truck])

  const accent = movedUp ? palette.yellow : movedDown ? palette.blue : palette.emerald
  const banner = movedUp ? "이사! 집이 넓어졌어요" : movedDown ? "이사… 집을 줄였어요" : "이번 계절도 같은 집"

  return (
    <Gradient dir="b" colors={[alpha(accent[500], 0.18), alpha(palette.gray[900], 0.8)]} style={[styles.card, { borderColor: alpha(accent[400], 0.4) }]}>
      {movedUp && (
        <View style={styles.confetti} pointerEvents="none">
          {CONFETTI.map((c, i) => (
            <BounceIn key={i} delay={1700 + i * 90}>
              <Text style={[styles.confettiEmoji, { marginTop: i % 2 ? 10 : 0 }]}>{c}</Text>
            </BounceIn>
          ))}
        </View>
      )}

      <Text style={styles.kicker}>{LABELS.seasonTitle}</Text>
      <Pop delay={200}>
        <Text style={[styles.banner, { color: accent[300] }]}>{banner}</Text>
      </Pop>

      {/* 옛집 → 새집 */}
      <View style={styles.stage}>
        {moved ? (
          <>
            <View style={styles.houseCol}>
              <HouseSvg stage={outcome.stageBefore} width={104} dim />
              <Text style={styles.houseNameDim}>{getHouse(outcome.stageBefore).name}</Text>
            </View>
            <BounceIn delay={1800} style={styles.houseCol}>
              <HouseSvg stage={outcome.stageAfter} width={128} />
              <View style={[styles.lvChip, { backgroundColor: alpha(accent[500], 0.25) }]}>
                <Text style={[styles.lv, { color: accent[300] }]}>
                  Lv.{outcome.stageBefore} → Lv.{outcome.stageAfter}
                </Text>
              </View>
              <Text style={styles.houseName}>{getHouse(outcome.stageAfter).name}</Text>
            </BounceIn>
            <Animated.Text
              style={[
                styles.truck,
                {
                  opacity: truck.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 1, 1, 0] }),
                  transform: [{ translateX: truck.interpolate({ inputRange: [0, 1], outputRange: [0, 150] }) }, { scaleX: -1 }],
                },
              ]}
            >
              🚚
            </Animated.Text>
          </>
        ) : (
          <View style={styles.houseCol}>
            <HouseSvg stage={outcome.stageAfter} width={140} />
            <Text style={styles.houseName}>{getHouse(outcome.stageAfter).name}</Text>
          </View>
        )}
      </View>

      {/* 돈 → 삶의 단위 */}
      <View style={styles.moneyRow}>
        <Text style={[styles.money, { color: stockColor(outcome.profitAmount) }]}>{signedKRW(outcome.profitAmount)}</Text>
        {units && <Text style={styles.units}>= {units}</Text>}
      </View>
      <Text style={styles.assets}>
        {character.emoji} {character.name}의 돈 {formatNumber(outcome.assetsBefore)} → {formatNumber(outcome.assetsAfter)}원
      </Text>

      {!!outcome.eventNet && (
        <Text style={styles.assets}>
          {LABELS.eventNetLine} {signedKRW(outcome.eventNet)} · 매매로 {signedKRW(outcome.profitAmount - outcome.eventNet)}
        </Text>
      )}

      <Text style={styles.quote}>"{pickLine(movedUp ? "moveUp" : movedDown ? "moveDown" : "stay", outcome.assetsAfter)}"</Text>

      {/* 지혜 — 과정으로만 오른다. 줄지 않는다 */}
      <FadeUp delay={moved ? 2200 : 600} style={styles.wisdom}>
        <Wiggle delay={moved ? 2400 : 800}>
          <Text style={styles.wisdomEmoji}>📚</Text>
        </Wiggle>
        <View style={{ flex: 1 }}>
          <Text style={styles.wisdomTitle}>
            지혜 +{wisdomGain}
            {titleAfter !== titleBefore && <Text style={{ color: palette.yellow[300] }}>  {titleBefore} → {titleAfter} 승급!</Text>}
          </Text>
          <Text style={styles.wisdomDesc}>{outcome.message}</Text>
          {(outcome.panicSells > 1 || outcome.overtraded) && (
            <Text style={styles.wisdomHint}>
              {outcome.panicSells > 1 ? `크게 잃고 판 매도 ${outcome.panicSells}번` : ""}
              {outcome.panicSells > 1 && outcome.overtraded ? " · " : ""}
              {outcome.overtraded ? "너무 자주 사고팔았어요" : ""}
            </Text>
          )}
        </View>
      </FadeUp>

      {/* 다른 길들의 집 */}
      {otherPaths.length > 0 && (
        <FadeUp delay={moved ? 2600 : 1000} style={styles.paths}>
          <Text style={styles.pathsTitle}>{LABELS.otherPaths}</Text>
          <View style={styles.pathsRow}>
            <PathHouse emoji={character.emoji} name="나" stage={outcome.stageAfter} mine />
            {otherPaths.map((p) => {
              const assets = Math.max(0, outcome.assetsBefore + (p.totalValue - initialValue))
              return <PathHouse key={p.name} emoji={p.emoji} name={p.name} stage={stageForAssets(assets, character)} />
            })}
          </View>
        </FadeUp>
      )}
    </Gradient>
  )
}

function PathHouse({ emoji, name, stage, mine }: { emoji: string; name: string; stage: number; mine?: boolean }) {
  return (
    <View style={[styles.path, mine && styles.pathMine]}>
      <HouseSvg stage={stage} width={72} dim={!mine} />
      <Text style={styles.pathHouse}>{getHouse(stage).name}</Text>
      <Text style={styles.pathWho} numberOfLines={1}>
        {emoji} {name}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, borderWidth: 1, padding: 16, overflow: "hidden", alignItems: "center" },
  confetti: { position: "absolute", top: 8, left: 0, right: 0, flexDirection: "row", justifyContent: "space-around" },
  confettiEmoji: { fontSize: 20, color: "#ffffff" },
  kicker: { fontSize: 10, fontWeight: "700", color: palette.gray[500] },
  banner: { fontSize: 22, fontWeight: "900", letterSpacing: -0.5, marginTop: 4 },
  stage: { flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 20, marginTop: 16, minHeight: 120 },
  houseCol: { alignItems: "center" },
  houseName: { fontSize: 14, fontWeight: "900", color: "#ffffff", marginTop: 4 },
  houseNameDim: { fontSize: 11, fontWeight: "700", color: palette.gray[500], marginTop: 4 },
  lvChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999, marginTop: 4 },
  lv: { fontSize: 11, fontWeight: "900" },
  truck: { position: "absolute", left: 40, bottom: 18, fontSize: 26, color: "#ffffff" },
  moneyRow: { flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 16 },
  money: { fontSize: 26, fontWeight: "900", letterSpacing: -0.5, fontVariant: ["tabular-nums"] },
  units: { fontSize: 14, fontWeight: "800", color: "#ffffff" },
  assets: { fontSize: 11, color: palette.gray[500], marginTop: 2, fontVariant: ["tabular-nums"] },
  quote: { fontSize: 13, lineHeight: 19, color: palette.gray[300], textAlign: "center", marginTop: 12 },
  wisdom: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
    padding: 12,
    borderRadius: 16,
    backgroundColor: alpha("#000000", 0.3),
  },
  wisdomEmoji: { fontSize: 28, color: "#ffffff" },
  wisdomTitle: { fontSize: 14, fontWeight: "900", color: "#ffffff" },
  wisdomDesc: { fontSize: 12, lineHeight: 17, color: palette.gray[400], marginTop: 2 },
  wisdomHint: { fontSize: 11, color: palette.amber[400], marginTop: 4 },
  paths: { alignSelf: "stretch", marginTop: 16 },
  pathsTitle: { fontSize: 11, fontWeight: "800", color: palette.gray[400], marginBottom: 8 },
  pathsRow: { flexDirection: "row", gap: 8 },
  path: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 14, backgroundColor: alpha("#ffffff", 0.04) },
  pathMine: { backgroundColor: alpha(palette.emerald[500], 0.15), borderWidth: 1, borderColor: alpha(palette.emerald[400], 0.4) },
  pathHouse: { fontSize: 11, fontWeight: "800", color: "#ffffff", marginTop: 4 },
  pathWho: { fontSize: 10, color: palette.gray[500], marginTop: 1 },
})
