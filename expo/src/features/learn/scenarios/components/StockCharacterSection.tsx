import { useEffect, useMemo, useRef, useState } from "react"
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native"
import Svg, { Path } from "react-native-svg"
import { ChevronDown, Sparkles } from "lucide-react-native"
import type { LegendaryScenario } from "@/data/legendary-scenarios"
import { getScenarioStockType, type SimilarStock } from "@/data/scenario-stock-types"
import { FadeUp, Float, Ping, Pop, PressableScale } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { twColor } from "../utils/tw"
import { buildPrices, getStockPersonality, seededSeries, type PersonalityStat } from "../utils/personality"

const TALK_INTERVAL = 3200

// ── 성격 게이지 (등장 시 차오름) ─────────────────────────────────
function StatGauge({ stat, index }: { stat: PersonalityStat; index: number }) {
  const v = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const anim = Animated.timing(v, { toValue: stat.value, duration: 900, delay: 150 + index * 120, easing: Easing.out(Easing.cubic), useNativeDriver: false })
    anim.start()
    return () => anim.stop()
  }, [v, stat.value, index])

  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>
        {stat.emoji} {stat.label}
      </Text>
      <View style={styles.statTrack}>
        <Animated.View style={{ height: "100%", borderRadius: 9999, backgroundColor: stat.color, width: v.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }) }} />
      </View>
      <Text style={[styles.statComment, { color: stat.color }]}>{stat.comment}</Text>
    </View>
  )
}

// ── 닮은꼴 친구 뱃지 (미니 그래프 포함) ──────────────────────────
function FriendBadge({ stock, prices, color, selected, onPress }: { stock: SimilarStock; prices: number[]; color: string; selected: boolean; onPress: () => void }) {
  // 같은 유형 = 닮은 움직임. 이름 시드로 살짝씩 다른 모양을 만든 "예시" 그래프
  const d = useMemo(() => {
    const noise = seededSeries(stock.name, prices.length)
    const pts = prices.map((p, i) => p * (1 + (noise[i] - 0.5) * 0.08))
    const min = Math.min(...pts)
    const range = Math.max(...pts) - min || 1
    const W = 64
    const H = 22
    return pts.map((p, i) => `${i === 0 ? "M" : "L"}${((i / (pts.length - 1)) * W).toFixed(1)},${(H - 2 - ((p - min) / range) * (H - 4)).toFixed(1)}`).join(" ")
  }, [stock.name, prices])

  return (
    <PressableScale scaleTo={0.94} onPress={onPress} style={[styles.friend, selected && { borderColor: color, backgroundColor: alpha(color, 0.12) }]}>
      <View style={[styles.medal, { borderColor: selected ? color : alpha("#ffffff", 0.15) }]}>
        <Text style={{ fontSize: 22, color: "#ffffff" }}>{stock.emoji}</Text>
      </View>
      <Text numberOfLines={1} style={styles.friendName}>
        {stock.name}
      </Text>
      <Svg width={64} height={22} viewBox="0 0 64 22">
        <Path d={d} fill="none" stroke={selected ? color : palette.gray[500]} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </PressableScale>
  )
}

// ── 주식 캐릭터 카드 ─────────────────────────────────────────────
export function StockCharacterSection({ scenario }: { scenario: LegendaryScenario }) {
  const stockType = getScenarioStockType(scenario.id)
  const personality = useMemo(() => getStockPersonality(scenario), [scenario])
  const prices = useMemo(() => buildPrices(scenario.events), [scenario])
  const [talkIdx, setTalkIdx] = useState(0)
  const [open, setOpen] = useState(false)
  const [friend, setFriend] = useState<number | null>(null)

  // 캐릭터 대사: 한 번에 하나씩만 돌아가며 보여줌
  const lines = useMemo(() => (stockType ? [personality.catchphrase, ...stockType.characteristics] : []), [stockType, personality])

  useEffect(() => {
    if (lines.length < 2) return
    const t = setInterval(() => setTalkIdx((i) => (i + 1) % lines.length), TALK_INTERVAL)
    return () => clearInterval(t)
  }, [lines.length, talkIdx])

  if (!stockType) return null
  const typeColor = twColor(stockType.stockTypeColor, "text")

  // "A → B → C" 문장은 흐름 칩으로, 나머지는 한 줄 설명으로
  const sentences = stockType.whyItMoves.replace(/([.!?])\s+/g, "$1\n").split("\n").filter(Boolean)
  const flow = sentences.find((s) => s.includes("→"))
  const flowSteps = flow ? flow.replace(/[.!?]$/, "").split("→").map((s) => s.trim()) : []
  const notes = sentences.filter((s) => s !== flow)
  const selectedFriend = friend !== null ? stockType.similarStocks[friend] : null

  return (
    <View style={[styles.card, { backgroundColor: twColor(stockType.stockTypeBg, "bg"), borderColor: twColor(stockType.stockTypeBorder, "border") }]}>
      {/* 캐릭터 + 말풍선 */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={styles.avatarWrap}>
          <Ping style={[styles.avatarRing, { borderColor: typeColor }]} duration={2200} scaleTo={1.35} />
          <Float duration={1800} distance={5}>
            <View style={[styles.avatar, { borderColor: typeColor, backgroundColor: alpha(typeColor, 0.15) }]}>
              <Text style={{ fontSize: 30, color: "#ffffff" }}>{stockType.stockTypeEmoji}</Text>
            </View>
          </Float>
          <View style={[styles.avatarTag, { backgroundColor: typeColor }]}>
            <Text style={{ fontSize: 8, fontWeight: "900", color: "#111111" }}>Lv.{scenario.difficulty}</Text>
          </View>
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 15, fontWeight: "900", color: typeColor }}>{stockType.stockType}</Text>
          <View style={styles.personaBadge}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: "#ffffff" }}>
              {personality.emoji} {personality.title}
            </Text>
          </View>
        </View>
      </View>

      <Pressable onPress={() => setTalkIdx((i) => (i + 1) % lines.length)} style={styles.bubble}>
        <FadeUp key={talkIdx} duration={300} distance={6}>
          <Text style={styles.bubbleText}>“{lines[talkIdx]}”</Text>
        </FadeUp>
        <View style={styles.dots}>
          {lines.map((_, i) => (
            <View key={i} style={[styles.dot, i === talkIdx && { backgroundColor: typeColor, width: 12 }]} />
          ))}
        </View>
      </Pressable>

      {/* 성격 게이지 */}
      <View style={{ gap: 8, marginTop: 14 }}>
        {personality.stats.map((s, i) => (
          <StatGauge key={s.key} stat={s} index={i} />
        ))}
      </View>

      {/* 자세히 보기 */}
      <Pressable onPress={() => setOpen(!open)} style={styles.moreBtn}>
        <Text style={{ fontSize: 11, fontWeight: "700", color: typeColor }}>{open ? "접기" : "더 알아보기 · 비슷한 주식 보기"}</Text>
        <View style={open ? { transform: [{ rotate: "180deg" }] } : undefined}>
          <ChevronDown size={14} color={typeColor} />
        </View>
      </Pressable>

      {open && (
        <FadeUp duration={300} distance={8} style={{ gap: 10, marginTop: 10 }}>
          <Text style={{ fontSize: 11, color: palette.gray[400] }}>“{stockType.tagline}”</Text>
          {flowSteps.length > 1 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 4 }}>
              {flowSteps.map((step, i) => (
                <Pop key={step} delay={i * 140} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <View style={[styles.flowChip, { borderColor: alpha(typeColor, 0.4) }]}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: "#ffffff" }}>{step}</Text>
                  </View>
                  {i < flowSteps.length - 1 && <Text style={{ fontSize: 12, color: typeColor }}>▶</Text>}
                </Pop>
              ))}
            </View>
          )}
          {notes.map((n) => (
            <Text key={n} style={styles.note}>
              {n}
            </Text>
          ))}

          {/* 닮은꼴 친구들 */}
          <View style={styles.friendsHead}>
            <Sparkles size={12} color={palette.yellow[400]} />
            <Text style={{ flex: 1, fontSize: 11, fontWeight: "700", color: palette.gray[300] }}>비슷한 주식 친구들</Text>
            <Text style={{ fontSize: 9, color: palette.gray[500] }}>눌러보세요 · 그래프는 예시</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {stockType.similarStocks.map((s, i) => (
              <FriendBadge key={s.name} stock={s} prices={prices} color={typeColor} selected={friend === i} onPress={() => setFriend(friend === i ? null : i)} />
            ))}
          </View>
          {selectedFriend && (
            <Pop key={selectedFriend.name} style={styles.friendDetail}>
              <Text style={{ fontSize: 18, color: "#ffffff" }}>{selectedFriend.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#ffffff" }}>{selectedFriend.name}</Text>
                <Text style={{ fontSize: 11, color: palette.gray[300], lineHeight: 16, marginTop: 2 }}>{selectedFriend.reason}</Text>
              </View>
            </Pop>
          )}
        </FadeUp>
      )}

    </View>
  )
}

const styles = StyleSheet.create({
  card: { marginTop: 16, borderRadius: 20, borderWidth: 1, padding: 16 },
  avatarWrap: { width: 68, height: 72, alignItems: "center", justifyContent: "center" },
  avatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  avatarRing: { position: "absolute", width: 60, height: 60, borderRadius: 30, borderWidth: 2 },
  avatarTag: { position: "absolute", bottom: 0, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 9999 },
  personaBadge: { alignSelf: "flex-start", marginTop: 6, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999, backgroundColor: alpha("#000000", 0.35), borderWidth: 1, borderColor: alpha("#ffffff", 0.12) },
  bubble: { marginTop: 12, backgroundColor: alpha("#000000", 0.3), borderRadius: 14, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 8, minHeight: 58 },
  bubbleText: { fontSize: 13, fontWeight: "700", color: "#ffffff", lineHeight: 19 },
  dots: { flexDirection: "row", gap: 4, marginTop: 8 },
  dot: { width: 5, height: 5, borderRadius: 9999, backgroundColor: alpha("#ffffff", 0.2) },
  statRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statLabel: { width: 62, fontSize: 11, fontWeight: "700", color: palette.gray[300] },
  statTrack: { flex: 1, height: 8, borderRadius: 9999, backgroundColor: alpha("#000000", 0.35), overflow: "hidden" },
  statComment: { width: 66, fontSize: 10, fontWeight: "700", textAlign: "right" },
  moreBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: alpha("#000000", 0.2) },
  flowChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, backgroundColor: alpha("#000000", 0.3) },
  note: { fontSize: 11, color: palette.gray[300], lineHeight: 17 },
  friendsHead: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6, marginBottom: -2 },
  friend: { flex: 1, alignItems: "center", gap: 4, paddingVertical: 10, borderRadius: 14, borderWidth: 1, borderColor: alpha("#ffffff", 0.08), backgroundColor: alpha("#ffffff", 0.04) },
  medal: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: "center", justifyContent: "center", backgroundColor: alpha("#000000", 0.3) },
  friendName: { fontSize: 11, fontWeight: "700", color: "#ffffff" },
  friendDetail: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8, padding: 10, borderRadius: 12, backgroundColor: alpha("#000000", 0.3) },
})
