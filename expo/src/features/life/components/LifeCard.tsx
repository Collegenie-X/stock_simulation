/**
 * 홈의 "나의 삶" 카드 — 캐릭터, 지금 사는 집, 가진 돈.
 * 첫 화면에는 핵심만 두고, 집 단계표는 접어 둔다.
 */
import { useCallback, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { useFocusEffect, useRouter } from "expo-router"
import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react-native"
import { Float, Gradient, PressableScale } from "@/components/ui"
import { formatKRW, formatNumber } from "@/lib/format"
import { storage } from "@/lib/storage"
import { alpha, palette, stockColor } from "@/theme"
import {
  HOUSES,
  LABELS,
  amountToNextStage,
  getHouse,
  getLifeCharacter,
  newLife,
  ownedDecor,
  signedKRW,
  stageForAssets,
  wisdomTitle,
  type LifeCharacter,
  type LifeState,
} from "../config"
import { CharacterPicker } from "./CharacterPicker"
import { HouseGauge } from "./HouseGauge"
import { HouseSvg } from "./HouseSvg"

export default function LifeCard() {
  const router = useRouter()
  const [life, setLife] = useState<LifeState | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [showMore, setShowMore] = useState(false)

  // 한 판을 끝내고 돌아오면 집이 바뀌어 있을 수 있다
  useFocusEffect(
    useCallback(() => {
      const saved = storage.getLife()
      const who = getLifeCharacter(saved?.characterId)
      // 집 단계 표가 바뀌어도 저장된 집이 자산과 어긋나지 않게 맞춘다
      setLife(saved && who ? { ...saved, houseStage: stageForAssets(saved.assets, who) } : saved)
    }, []),
  )

  const handlePick = (picked: LifeCharacter) => {
    if (life?.characterId !== picked.id) {
      const next = newLife(picked, life?.wisdom ?? 0)
      storage.setLife(next)
      setLife(next)
    }
    setShowPicker(false)
  }

  const character = getLifeCharacter(life?.characterId)
  const picker = <CharacterPicker visible={showPicker} currentId={life?.characterId} onClose={() => setShowPicker(false)} onPick={handlePick} />

  // ── 아직 캐릭터가 없을 때 ──
  if (!life || !character) {
    return (
      <View style={styles.wrap}>
        <PressableScale onPress={() => setShowPicker(true)} scaleTo={0.98}>
          <Gradient dir="br" colors={[alpha(palette.emerald[500], 0.18), alpha(palette.blue[500], 0.08)]} style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.emptyTitle}>{LABELS.createCta}</Text>
                <Text style={styles.emptyDesc}>{LABELS.createDesc}</Text>
              </View>
              <Float distance={4}>
                <HouseSvg stage={4} width={96} />
              </Float>
            </View>
            <View style={styles.emptyCta}>
              <Text style={styles.emptyCtaText}>🎒 💍 🏫 🧳 🌿 중에 고르기</Text>
              <ChevronRight size={16} color={palette.emerald[300]} />
            </View>
          </Gradient>
        </PressableScale>
        {picker}
      </View>
    )
  }

  const house = getHouse(life.houseStage)
  const total = life.assets - character.startCash
  const toNext = amountToNextStage(life.assets, life.houseStage, character)
  // 집은 계절이 끝나야 바뀐다 — 지금 돈이 가리키는 집과 다를 수 있다
  const pendingStage = stageForAssets(life.assets, character)
  const last = life.lastSeason

  return (
    <View style={styles.wrap}>
      <Gradient dir="br" colors={[alpha(palette.emerald[500], 0.14), alpha("#ffffff", 0.03)]} style={styles.card}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.who}>
              {character.emoji} {character.name} <Text style={styles.whoSub}>{character.age}세 · {character.moneyType?.name ?? wisdomTitle(life.wisdom)}</Text>
            </Text>
            <Text style={styles.assets}>
              {formatNumber(life.assets)}
              <Text style={styles.assetsUnit}>원</Text>
            </Text>
            {life.seasons > 0 ? (
              <Text style={[styles.delta, { color: stockColor(total) }]}>
                처음보다 {signedKRW(total)} · {life.seasons}계절째
              </Text>
            ) : (
              <Text style={styles.delta}>{character.goal}</Text>
            )}
          </View>
          <View style={{ alignItems: "center" }}>
            <Float distance={3}>
              <HouseSvg stage={life.houseStage} width={104} />
            </Float>
            <View style={styles.houseChip}>
              <Text style={styles.houseLv}>Lv.{life.houseStage}</Text>
              <Text style={styles.houseName}>{house.name}</Text>
            </View>
            {/* 리포트에서 산 꾸미기 */}
            {ownedDecor(life).length > 0 && (
              <Text style={styles.decor} numberOfLines={1}>
                {ownedDecor(life).map((d) => d.emoji).join(" ")}
              </Text>
            )}
          </View>
        </View>

        {/* 집 게이지 — 오른쪽 끝을 넘기면 이사 */}
        <View style={{ marginTop: 12 }}>
          <HouseGauge assets={life.assets} stage={life.houseStage} character={character} />
        </View>

        {last && (
          <Text style={styles.lastSeason}>
            {last.stageAfter > last.stageBefore ? "📦 이사했어요 ↑ " : last.stageAfter < last.stageBefore ? "📦 이사했어요 ↓ " : ""}
            지난 계절 {signedKRW(last.profitAmount)}
            {last.wisdomAfter > last.wisdomBefore ? ` · 📚 +${last.wisdomAfter - last.wisdomBefore}` : ""}
          </Text>
        )}

        <PressableScale onPress={() => router.push("/practice/setup")} scaleTo={0.98}>
          <Gradient dir="r" colors={[palette.emerald[600], palette.emerald[500]]} style={styles.cta}>
            <Text style={styles.ctaText}>{LABELS.startSeason}</Text>
            <ChevronRight size={18} color="#ffffff" />
          </Gradient>
        </PressableScale>

        <Pressable onPress={() => setShowMore((v) => !v)} style={styles.moreBtn} hitSlop={8}>
          <Text style={styles.moreText}>
            {toNext !== null ? `다음 집까지 ${formatKRW(toNext)}` : "가장 넓은 집에 살고 있어요"}
          </Text>
          {showMore ? <ChevronUp size={14} color={palette.gray[500]} /> : <ChevronDown size={14} color={palette.gray[500]} />}
        </Pressable>

        {showMore && (
          <View style={styles.more}>
            <View style={styles.ladder}>
              {HOUSES.map((h) => {
                const here = h.stage === life.houseStage
                return (
                  <View key={h.stage} style={[styles.step, here && styles.stepHere]}>
                    <Text style={[styles.stepEmoji, !here && { opacity: 0.45 }]}>{h.emoji}</Text>
                    {here && <Text style={styles.stepName}>{h.name}</Text>}
                  </View>
                )
              })}
            </View>
            <Text style={styles.moreLine}>−10% 는 {character.name}에게 "{character.minus10}"</Text>
            {character.moneyType && (
              <Text style={styles.moreLine}>
                {character.moneyType.emoji} {character.moneyType.name} — {character.moneyType.ifLost}
              </Text>
            )}
            <Text style={styles.moreLine}>📚 지혜 {life.wisdom} ({wisdomTitle(life.wisdom)}) — 집은 줄어도 지혜는 줄지 않아요</Text>
            {pendingStage !== life.houseStage && <Text style={styles.moreLine}>집은 계절이 끝날 때 바뀌어요</Text>}
            <Pressable onPress={() => setShowPicker(true)} hitSlop={8}>
              <Text style={styles.change}>{LABELS.changeCharacter} →</Text>
            </Pressable>
          </View>
        )}
      </Gradient>
      {picker}
    </View>
  )
}

const styles = StyleSheet.create({
  decor: { fontSize: 14, color: "#ffffff", marginTop: 4, maxWidth: 120, textAlign: "center" },
  wrap: { paddingHorizontal: 20 },
  card: { borderRadius: 24, padding: 16, borderWidth: 1, borderColor: alpha(palette.emerald[400], 0.25), overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "900", letterSpacing: -0.4, color: "#ffffff" },
  emptyDesc: { fontSize: 12, lineHeight: 18, color: palette.gray[400], marginTop: 6 },
  emptyCta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14 },
  emptyCtaText: { fontSize: 13, fontWeight: "700", color: palette.emerald[300] },
  who: { fontSize: 15, fontWeight: "800", color: "#ffffff" },
  whoSub: { fontSize: 11, fontWeight: "600", color: palette.gray[400] },
  assets: { fontSize: 26, fontWeight: "900", letterSpacing: -0.5, color: "#ffffff", marginTop: 8, fontVariant: ["tabular-nums"] },
  assetsUnit: { fontSize: 14, fontWeight: "700", color: palette.gray[400] },
  delta: { fontSize: 12, fontWeight: "600", color: palette.gray[400], marginTop: 2 },
  houseChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    backgroundColor: alpha("#000000", 0.35),
  },
  houseLv: { fontSize: 10, fontWeight: "900", color: palette.yellow[300] },
  houseName: { fontSize: 11, fontWeight: "700", color: "#ffffff" },
  lastSeason: { fontSize: 11, color: palette.gray[400], marginTop: 10 },
  cta: { marginTop: 12, paddingVertical: 14, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
  ctaText: { fontSize: 15, fontWeight: "800", color: "#ffffff" },
  moreBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 6 },
  moreText: { fontSize: 11, color: palette.gray[500] },
  more: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: alpha("#ffffff", 0.08), gap: 8 },
  ladder: { flexDirection: "row", alignItems: "center", gap: 4 },
  step: { flex: 1, alignItems: "center", paddingVertical: 6, borderRadius: 10 },
  stepHere: { flex: 2.4, flexDirection: "row", justifyContent: "center", gap: 4, backgroundColor: alpha(palette.emerald[500], 0.18) },
  stepEmoji: { fontSize: 16, color: "#ffffff" },
  stepName: { fontSize: 10, fontWeight: "800", color: palette.emerald[300] },
  moreLine: { fontSize: 12, lineHeight: 18, color: palette.gray[400] },
  change: { fontSize: 12, fontWeight: "700", color: palette.blue[400], marginTop: 4 },
})
