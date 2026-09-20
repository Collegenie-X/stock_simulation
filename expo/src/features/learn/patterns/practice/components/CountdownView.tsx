import React from "react"
import { StyleSheet, Text, View } from "react-native"
import { Screen } from "@/components/layout"
import { GlowOrb } from "@/components/ui"
import { INITIAL_CASH } from "@/data/pattern-practice"
import { alpha, palette } from "@/theme"

interface Props {
  currentRound: number
  totalRounds: number
  countdownVal: number
  isBasicStrategy: boolean
  decisionSecs: number
}

export function CountdownView({ currentRound, totalRounds, countdownVal, isBasicStrategy, decisionSecs }: Props) {
  const accent = isBasicStrategy ? palette.emerald : palette.indigo
  return (
    <Screen bg="#000000" scroll={false} contentStyle={styles.content}>
      <Text style={styles.round}>
        라운드 {currentRound + 1} / {totalRounds}
      </Text>
      <View style={styles.numberWrap}>
        {/* blur-[60px] 글로우 → 반투명 원으로 대체 */}
        <GlowOrb color={accent[500]} size={420} opacity={0.4} />
        <Text style={styles.number}>{countdownVal}</Text>
      </View>
      <Text style={[styles.caption, { color: accent[400] }]}>
        ⏱️ 턴당 {decisionSecs}초 · 💰 {(INITIAL_CASH / 10000).toFixed(0)}만원 시작!
      </Text>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { alignItems: "center", justifyContent: "center" },
  round: { fontSize: 18, fontWeight: "700", color: palette.gray[500], marginBottom: 16 },
  numberWrap: { alignItems: "center", justifyContent: "center", minWidth: 160, height: 160 },
  glow: { position: "absolute", width: 240, height: 240, borderRadius: 120 },
  glowInner: { position: "absolute", width: 160, height: 160, borderRadius: 80 },
  number: { fontSize: 140, lineHeight: 160, fontWeight: "900", color: "#ffffff", textAlign: "center" },
  caption: { fontSize: 16, fontWeight: "700", marginTop: 24, textAlign: "center" },
})
