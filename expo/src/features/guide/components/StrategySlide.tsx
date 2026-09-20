import { StyleSheet, Text, View } from "react-native"
import { Gradient } from "@/components/ui"
import { alpha, palette } from "@/theme"
import type { GuideInfo } from "../utils/getGuideByType"
import { SlideHeading } from "./SlideHeading"

/** 슬라이드 4 — 맞춤 전략 */
export function StrategySlide({ guideInfo, investorType }: { guideInfo: GuideInfo; investorType: string }) {
  return (
    <View>
      <SlideHeading emoji={guideInfo.emoji} title="당신만의 투자 팁" desc={`${investorType}에게 딱 맞는 방법이에요`} />

      <View style={styles.tips}>
        {guideInfo.tips.map((tip, index) => (
          <Gradient key={index} dir="r" colors={[alpha(palette.blue[500], 0.1), alpha(palette.cyan[500], 0.1)]} style={styles.tip}>
            <View style={styles.num}>
              <Text style={styles.numText}>{index + 1}</Text>
            </View>
            <Text style={styles.tipText}>{tip}</Text>
          </Gradient>
        ))}
      </View>

      <Gradient dir="r" colors={[alpha(palette.green[500], 0.1), alpha(palette.emerald[500], 0.1)]} style={styles.goal}>
        <Text style={styles.goalEmoji}>🎯</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.goalTitle}>게임 목표</Text>
          <Text style={styles.goalDesc}>30일 동안 1,000만원을 얼마나 불릴 수 있을까요? 랭킹에 도전해보세요!</Text>
        </View>
      </Gradient>
    </View>
  )
}

const styles = StyleSheet.create({
  tips: { gap: 12, marginBottom: 32 },
  tip: { borderRadius: 16, padding: 16, borderWidth: 1, borderColor: alpha(palette.blue[500], 0.2), flexDirection: "row", alignItems: "flex-start", gap: 12, overflow: "hidden" },
  num: { width: 32, height: 32, borderRadius: 16, backgroundColor: palette.blue[500], alignItems: "center", justifyContent: "center", flexShrink: 0 },
  numText: { color: "#ffffff", fontWeight: "700", fontSize: 16 },
  tipText: { flex: 1, color: palette.gray[200], fontWeight: "600", fontSize: 16, lineHeight: 24, paddingTop: 4 },
  goal: { borderRadius: 16, padding: 20, borderWidth: 1, borderColor: alpha(palette.green[500], 0.2), flexDirection: "row", alignItems: "flex-start", gap: 12, overflow: "hidden" },
  goalEmoji: { fontSize: 30, color: "#ffffff" },
  goalTitle: { fontSize: 16, fontWeight: "700", color: palette.green[400], marginBottom: 4 },
  goalDesc: { fontSize: 14, lineHeight: 20, color: palette.green[300] },
})
