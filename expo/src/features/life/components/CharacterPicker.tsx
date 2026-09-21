/**
 * 캐릭터 고르기 — 나이와 돈의 성격이 다르면 같은 −10%의 뜻이 다르다 (10.2)
 */
import { useState } from "react"
import { ScrollView, StyleSheet, Text, View } from "react-native"
import { BottomSheet, Gradient, PressableScale } from "@/components/ui"
import { formatKRW } from "@/lib/format"
import { alpha, palette } from "@/theme"
import { DEFAULT_MONEY_TYPE, LABELS, LIFE_CHARACTERS, MONEY_TYPES, getHouse, withMoneyType, type LifeCharacter } from "../config"
import { HouseSvg } from "./HouseSvg"

interface CharacterPickerProps {
  visible: boolean
  currentId?: string | null
  onClose: () => void
  onPick: (character: LifeCharacter) => void
}

export function CharacterPicker({ visible, currentId, onClose, onPick }: CharacterPickerProps) {
  const [currentBaseId, currentTypeId] = (currentId ?? "").split(":")
  const [selectedId, setSelectedId] = useState(currentBaseId || LIFE_CHARACTERS[1].id)
  const [typeId, setTypeId] = useState(currentTypeId || DEFAULT_MONEY_TYPE.id)
  const base = LIFE_CHARACTERS.find((c) => c.id === selectedId) ?? LIFE_CHARACTERS[0]
  const moneyType = MONEY_TYPES.find((t) => t.id === typeId) ?? DEFAULT_MONEY_TYPE
  const selected = withMoneyType(base, moneyType)
  const isReplacing = !!currentId && currentId !== selected.id

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>{LABELS.createTitle}</Text>
        <Text style={styles.hint}>{LABELS.createHint}</Text>

        {/* 나이 고르기 */}
        <Text style={styles.step}>① {LABELS.pickAge}</Text>
        <View style={styles.ageRow}>
          {LIFE_CHARACTERS.map((c) => {
            const active = c.id === base.id
            return (
              <PressableScale
                key={c.id}
                onPress={() => setSelectedId(c.id)}
                style={[styles.ageChip, active && styles.ageChipActive]}
                accessibilityLabel={`${c.age}세 ${c.name}`}
              >
                <Text style={styles.ageEmoji}>{c.emoji}</Text>
                <Text style={[styles.ageText, active && { color: "#ffffff" }]}>{c.age}세</Text>
              </PressableScale>
            )
          })}
        </View>

        {/* 돈의 성격 고르기 */}
        <Text style={styles.step}>② {LABELS.pickMoneyType}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeRow} style={styles.typeScroll}>
          {MONEY_TYPES.map((t) => {
            const active = t.id === moneyType.id
            return (
              <PressableScale
                key={t.id}
                onPress={() => setTypeId(t.id)}
                style={[styles.typeChip, active && styles.ageChipActive]}
                accessibilityLabel={t.name}
              >
                <Text style={styles.typeEmoji}>{t.emoji}</Text>
                <Text style={[styles.typeText, active && { color: "#ffffff" }]}>{t.name}</Text>
              </PressableScale>
            )
          })}
        </ScrollView>
        <Text style={styles.typeDesc}>{moneyType.desc}</Text>

        {/* 고른 사람 */}
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>
                {selected.name} <Text style={styles.age}>{selected.age}세</Text>
              </Text>
              <Text style={styles.scene}>{selected.scene}</Text>
              <Text style={styles.cash}>{formatKRW(selected.startCash)}</Text>
              <Text style={styles.houseName}>{getHouse(selected.startStage).name}에서 시작</Text>
            </View>
            <HouseSvg stage={selected.startStage} width={108} />
          </View>

          <View style={styles.facts}>
            <Fact label="이 돈의 목적" value={selected.goal} />
            <Fact label="−10% 는" value={selected.minus10} strong />
            <Fact label="잃으면" value={moneyType.ifLost} />
            <Fact label="다시 벌 시간" value={selected.recover} />
          </View>
        </View>

        {isReplacing && <Text style={styles.warning}>{LABELS.resetWarning}</Text>}

        <PressableScale onPress={() => onPick(selected)} scaleTo={0.98}>
          <Gradient dir="r" colors={[palette.emerald[600], palette.emerald[500]]} style={styles.cta}>
            <Text style={styles.ctaText}>{LABELS.confirmPick(selected.name)}</Text>
          </Gradient>
        </PressableScale>
      </ScrollView>
    </BottomSheet>
  )
}

function Fact({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={[styles.factValue, strong && { color: palette.blue[300] }]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  title: { fontSize: 20, fontWeight: "900", letterSpacing: -0.4, color: "#ffffff" },
  hint: { fontSize: 12, color: palette.gray[400], marginTop: 4, marginBottom: 16 },
  step: { fontSize: 12, fontWeight: "800", color: palette.gray[300], marginBottom: 8 },
  ageRow: { flexDirection: "row", gap: 6, marginBottom: 16 },
  ageChip: {
    flex: 1,
    alignItems: "center",
    gap: 2,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: alpha("#ffffff", 0.04),
    borderWidth: 1,
    borderColor: "transparent",
  },
  ageChipActive: { backgroundColor: alpha(palette.emerald[500], 0.15), borderColor: alpha(palette.emerald[400], 0.6) },
  ageEmoji: { fontSize: 22, color: "#ffffff" },
  ageText: { fontSize: 11, fontWeight: "700", color: palette.gray[500] },
  typeScroll: { marginHorizontal: -20 },
  typeRow: { gap: 6, paddingHorizontal: 20 },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: alpha("#ffffff", 0.04),
    borderWidth: 1,
    borderColor: "transparent",
  },
  typeEmoji: { fontSize: 16, color: "#ffffff" },
  typeText: { fontSize: 13, fontWeight: "700", color: palette.gray[400] },
  typeDesc: { fontSize: 12, color: palette.gray[400], marginTop: 8, marginBottom: 12 },
  card: { borderRadius: 20, padding: 16, backgroundColor: alpha("#ffffff", 0.05), borderWidth: 1, borderColor: alpha("#ffffff", 0.08) },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  name: { fontSize: 18, fontWeight: "900", color: "#ffffff" },
  age: { fontSize: 13, fontWeight: "700", color: palette.gray[400] },
  scene: { fontSize: 12, color: palette.gray[400], marginTop: 2 },
  cash: { fontSize: 24, fontWeight: "900", letterSpacing: -0.4, color: "#ffffff", marginTop: 10, fontVariant: ["tabular-nums"] },
  houseName: { fontSize: 11, color: palette.gray[500], marginTop: 2 },
  facts: { marginTop: 14, gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: alpha("#ffffff", 0.08) },
  fact: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  factLabel: { fontSize: 12, color: palette.gray[500] },
  factValue: { fontSize: 13, fontWeight: "700", color: "#ffffff", flexShrink: 1, textAlign: "right" },
  warning: { fontSize: 11, lineHeight: 16, color: palette.amber[400], marginTop: 12 },
  cta: { marginTop: 16, paddingVertical: 16, borderRadius: 16, alignItems: "center" },
  ctaText: { fontSize: 15, fontWeight: "800", color: "#ffffff" },
})
