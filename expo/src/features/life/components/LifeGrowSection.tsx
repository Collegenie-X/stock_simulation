/**
 * 삶 키우기 — 월간·최종 리포트에서 번 돈으로 집을 넓히고 방을 꾸민다.
 * 집은 돈을 따라 열리고(이사하기), 꾸미기는 직접 사고판다. 첫 화면엔 집과 내 방만, 상점은 접어 둔다.
 */
import { useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { BounceIn, Gradient, Heartbeat, Pop, PressableScale } from "@/components/ui"
import { Fold } from "@/features/practice-stock/components/report/Fold"
import { formatKRW } from "@/lib/format"
import { storage } from "@/lib/storage"
import { alpha, palette } from "@/theme"
import {
  DECOR_ITEMS,
  LABELS,
  amountToNextStage,
  decorPrice,
  decorResellPrice,
  getHouse,
  moveUp,
  ownedDecor,
  stageForAssets,
  tradeDecor,
  type DecorItem,
  type LifeCharacter,
  type LifeState,
} from "../config"
import { HouseGauge } from "./HouseGauge"
import { HouseSvg } from "./HouseSvg"

interface LifeGrowSectionProps {
  character: LifeCharacter
  day: number
  /**
   * 판이 진행 중일 때만 넘긴다 — 게임 현금으로 사고, 쓴(−)·돌려받은(+) 돈을 게임에 반영한다.
   * 없으면 정산이 끝난 뒤라서 캐릭터의 돈으로 산다.
   */
  season?: {
    cash: number
    /** 지금 이 순간의 전 재산 (집 단계를 가늠하는 돈) */
    assets: number
    onCashChange: (amount: number) => void
  }
}

const GROUPS: DecorItem["group"][] = ["room", "joy"]

export function LifeGrowSection({ character, day, season }: LifeGrowSectionProps) {
  const [life, setLife] = useState<LifeState | null>(() => storage.getLife())
  const [lastLine, setLastLine] = useState<string | null>(null)
  if (!life) return null

  const inSeason = !!season
  const nowCash = season ? season.cash : life.assets
  const nowAssets = season ? season.assets : life.assets
  const stage = life.houseStage
  const reachable = stageForAssets(nowAssets, character)
  const canMove = reachable > stage
  const toNext = amountToNextStage(nowAssets, stage, character)
  const mine = ownedDecor(life)

  const save = (next: LifeState) => {
    storage.setLife(next)
    setLife(next)
  }

  const trade = (item: DecorItem, amount: number) => {
    save(tradeDecor(life, item, amount, { inSeason, day }))
    setLastLine(amount < 0 ? `${item.emoji} ${item.line}` : `${item.emoji} ${item.name}을(를) 되팔았어요`)
    season?.onCashChange(amount)
  }

  const handleMove = () => {
    save(moveUp(life, reachable))
    setLastLine(`🚚 ${LABELS.growMoved(getHouse(reachable).name)}`)
  }

  return (
    <Gradient dir="b" colors={[alpha(palette.emerald[500], 0.16), alpha(palette.gray[900], 0.8)]} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>🏡 {LABELS.growTitle}</Text>
        <Text style={styles.cash}>💵 {formatKRW(nowCash)}</Text>
      </View>
      <Text style={styles.hint}>{LABELS.growHint}</Text>

      {/* 집 + 내 방 */}
      <View style={styles.houseRow}>
        <Pop key={stage}>
          <HouseSvg stage={stage} width={116} />
        </Pop>
        <View style={{ flex: 1 }}>
          <Text style={styles.houseName}>
            Lv.{stage} {getHouse(stage).name}
          </Text>
          <HouseGauge assets={nowAssets} stage={stage} character={character} compact />
          <Text style={styles.toNext}>
            {canMove ? LABELS.growMoveReady(getHouse(reachable).name) : toNext ? `다음 집까지 ${formatKRW(toNext)}` : "가장 넓은 집이에요"}
          </Text>
        </View>
      </View>

      {canMove && (
        <Heartbeat>
          <PressableScale onPress={handleMove} scaleTo={0.97}>
            <Gradient dir="r" colors={[palette.amber[500], palette.yellow[400]]} style={styles.moveBtn}>
              <Text style={styles.moveText}>
                🚚 {LABELS.growMove} · Lv.{stage} → Lv.{reachable}
              </Text>
            </Gradient>
          </PressableScale>
        </Heartbeat>
      )}

      <View style={styles.shelf}>
        <Text style={styles.shelfLabel}>{LABELS.growMine}</Text>
        {mine.length === 0 ? (
          <Text style={styles.shelfEmpty}>{LABELS.growEmpty}</Text>
        ) : (
          <View style={styles.shelfRow}>
            {mine.map((d) => (
              <BounceIn key={d.id}>
                <Text style={styles.shelfEmoji}>{d.emoji}</Text>
              </BounceIn>
            ))}
          </View>
        )}
      </View>
      {!!lastLine && (
        <Pop key={lastLine}>
          <Text style={styles.line}>{lastLine}</Text>
        </Pop>
      )}

      {/* 상점 — 접어 둔다 */}
      <View style={{ marginTop: 12 }}>
        <Fold emoji="🛍️" title={LABELS.growShop} badge={`${mine.length}/${DECOR_ITEMS.length}`} badgeColor={palette.emerald[300]}>
          {inSeason && <Text style={styles.shopHint}>{LABELS.growCashOnly}</Text>}
          {GROUPS.map((group) => (
            <View key={group} style={{ marginTop: 8 }}>
              <Text style={styles.groupTitle}>{LABELS.growGroups[group]}</Text>
              <View style={styles.grid}>
                {DECOR_ITEMS.filter((d) => d.group === group).map((item) => (
                  <ItemTile
                    key={item.id}
                    item={item}
                    price={decorPrice(item, character)}
                    resell={decorResellPrice(item, character)}
                    owned={mine.some((d) => d.id === item.id)}
                    locked={stage < item.minStage}
                    noCash={decorPrice(item, character) > nowCash}
                    shrinks={stageForAssets(nowAssets - decorPrice(item, character), character) < stage}
                    onTrade={trade}
                  />
                ))}
              </View>
            </View>
          ))}
        </Fold>
      </View>
    </Gradient>
  )
}

interface ItemTileProps {
  item: DecorItem
  price: number
  resell: number
  owned: boolean
  locked: boolean
  noCash: boolean
  /** 사면 집 단계가 내려간다 — 집을 지키는 선에서만 산다 */
  shrinks: boolean
  onTrade: (item: DecorItem, amount: number) => void
}

function ItemTile({ item, price, resell, owned, locked, noCash, shrinks, onTrade }: ItemTileProps) {
  const blocked = locked ? LABELS.growLocked(getHouse(item.minStage).name) : noCash ? LABELS.growNoCash : shrinks ? LABELS.growKeepHouse : null

  return (
    <View style={[styles.tile, owned && styles.tileOwned, !owned && !!blocked && { opacity: 0.55 }]}>
      <Text style={styles.tileEmoji}>{locked && !owned ? "🔒" : item.emoji}</Text>
      <Text style={styles.tileName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.tilePrice}>{formatKRW(price)}</Text>
      {owned ? (
        <PressableScale onPress={() => onTrade(item, resell)} style={[styles.tileBtn, styles.sellBtn]}>
          <Text style={[styles.tileBtnText, { color: palette.gray[300] }]}>{LABELS.growSell} +{formatKRW(resell)}</Text>
        </PressableScale>
      ) : blocked ? (
        <View style={[styles.tileBtn, styles.blockedBtn]}>
          <Text style={[styles.tileBtnText, { color: palette.gray[500] }]}>{blocked}</Text>
        </View>
      ) : (
        <PressableScale onPress={() => onTrade(item, -price)} style={[styles.tileBtn, styles.buyBtn]}>
          <Text style={[styles.tileBtnText, { color: "#052e16" }]}>{LABELS.growBuy}</Text>
        </PressableScale>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, borderWidth: 1, borderColor: alpha(palette.emerald[400], 0.35), padding: 16, overflow: "hidden" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 16, fontWeight: "900", color: "#ffffff" },
  cash: { fontSize: 13, fontWeight: "900", color: palette.emerald[300], fontVariant: ["tabular-nums"] },
  hint: { fontSize: 11, color: palette.gray[400], marginTop: 2 },
  houseRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12 },
  houseName: { fontSize: 15, fontWeight: "900", color: "#ffffff", marginBottom: 6 },
  toNext: { fontSize: 11, fontWeight: "700", color: palette.gray[400], marginTop: 6 },
  moveBtn: { marginTop: 12, paddingVertical: 14, borderRadius: 16, alignItems: "center" },
  moveText: { fontSize: 14, fontWeight: "900", color: "#422006" },
  shelf: { marginTop: 12, padding: 10, borderRadius: 14, backgroundColor: alpha("#000000", 0.3), minHeight: 56 },
  shelfLabel: { fontSize: 10, fontWeight: "800", color: palette.gray[500], marginBottom: 4 },
  shelfEmpty: { fontSize: 12, color: palette.gray[600] },
  shelfRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  shelfEmoji: { fontSize: 24, color: "#ffffff" },
  line: { fontSize: 12, fontWeight: "700", color: palette.emerald[300], textAlign: "center", marginTop: 8 },
  shopHint: { fontSize: 11, color: palette.gray[400] },
  groupTitle: { fontSize: 11, fontWeight: "800", color: palette.gray[300], marginBottom: 6 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tile: {
    width: "31.5%",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 14,
    backgroundColor: alpha("#ffffff", 0.04),
    borderWidth: 1,
    borderColor: alpha("#ffffff", 0.06),
  },
  tileOwned: { backgroundColor: alpha(palette.emerald[500], 0.12), borderColor: alpha(palette.emerald[400], 0.4) },
  tileEmoji: { fontSize: 26, color: "#ffffff" },
  tileName: { fontSize: 11, fontWeight: "800", color: "#ffffff", marginTop: 4 },
  tilePrice: { fontSize: 10, color: palette.gray[400], marginTop: 1, fontVariant: ["tabular-nums"] },
  tileBtn: { alignSelf: "stretch", marginTop: 6, marginHorizontal: 4, paddingVertical: 6, borderRadius: 9999, alignItems: "center" },
  tileBtnText: { fontSize: 10, fontWeight: "900" },
  buyBtn: { backgroundColor: palette.emerald[400] },
  sellBtn: { backgroundColor: alpha("#ffffff", 0.08) },
  blockedBtn: { backgroundColor: alpha("#000000", 0.25) },
})
