/**
 * 게임 설정의 "누구의 돈인가" — 기본은 캐릭터의 돈. 다른 금액 연습은 접어 둔다.
 */
import type { ReactNode } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { Check, ChevronDown, ChevronUp } from "lucide-react-native"
import { Gradient, PressableScale } from "@/components/ui"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"
import { LABELS, getHouse, type LifeCharacter, type LifeState } from "../config"
import { HouseGauge } from "./HouseGauge"
import { HouseSvg } from "./HouseSvg"

interface LifeSeedSectionProps {
  life: LifeState
  character: LifeCharacter
  useLifeMoney: boolean
  onUseLifeMoney: () => void
  showCustom: boolean
  onToggleCustom: () => void
  /** 접혀 있는 "다른 금액" 선택 영역 */
  children: ReactNode
}

export function LifeSeedSection({ life, character, useLifeMoney, onUseLifeMoney, showCustom, onToggleCustom, children }: LifeSeedSectionProps) {
  return (
    <View>
      <PressableScale onPress={onUseLifeMoney} scaleTo={0.98}>
        <Gradient
          dir="br"
          colors={useLifeMoney ? [alpha(palette.emerald[500], 0.25), alpha(palette.emerald[500], 0.05)] : ["#232323", "#232323"]}
          style={[styles.card, useLifeMoney && styles.cardActive]}
        >
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>
                {character.emoji} {LABELS.seedFromLife(character.name)}
              </Text>
              <Text style={styles.money}>
                {formatNumber(life.assets)}
                <Text style={styles.moneyUnit}>원</Text>
              </Text>
              <Text style={styles.hint}>
                {getHouse(life.houseStage).name} · {LABELS.seedFromLifeHint}
              </Text>
            </View>
            <HouseSvg stage={life.houseStage} width={88} dim={!useLifeMoney} />
            {useLifeMoney && (
              <View style={styles.check}>
                <Check size={14} color="#ffffff" strokeWidth={3} />
              </View>
            )}
          </View>
          <View style={{ marginTop: 10 }}>
            <HouseGauge assets={life.assets} stage={life.houseStage} character={character} compact />
          </View>
        </Gradient>
      </PressableScale>

      <Pressable onPress={onToggleCustom} style={styles.toggle} hitSlop={8}>
        <Text style={[styles.toggleText, !useLifeMoney && { color: palette.yellow[300] }]}>
          {LABELS.seedCustom} <Text style={styles.toggleHint}>· {LABELS.seedCustomHint}</Text>
        </Text>
        {showCustom ? <ChevronUp size={14} color={palette.gray[500]} /> : <ChevronDown size={14} color={palette.gray[500]} />}
      </Pressable>

      {showCustom && <View style={{ marginTop: 12 }}>{children}</View>}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 16, borderWidth: 2, borderColor: "#3a3a3a" },
  cardActive: { borderColor: palette.emerald[500], boxShadow: "0 0 24px rgba(16,185,129,0.35)" },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: { fontSize: 13, fontWeight: "800", color: "#ffffff" },
  money: { fontSize: 26, fontWeight: "900", letterSpacing: -0.5, color: "#ffffff", marginTop: 4, fontVariant: ["tabular-nums"] },
  moneyUnit: { fontSize: 14, fontWeight: "700", color: palette.gray[400] },
  hint: { fontSize: 11, color: palette.gray[400], marginTop: 2 },
  check: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.emerald[500],
  },
  toggle: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 12 },
  toggleText: { fontSize: 12, fontWeight: "700", color: palette.gray[400] },
  toggleHint: { fontWeight: "500", color: palette.gray[600] },
})
