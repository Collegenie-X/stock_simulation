import { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { RotateCcw, Settings } from "lucide-react-native"
import { Button, Float, Pop } from "@/components/ui"
import { alpha, palette } from "@/theme"
import type { GuideInfo } from "../utils/getGuideByType"

interface Props {
  guideInfo: GuideInfo
  investorType: string
  onRetakeAnalysis: () => void
}

/** 슬라이드 1 — 당신의 투자 스타일 */
export function InvestStyleSlide({ guideInfo, investorType, onRetakeAnalysis }: Props) {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <View style={styles.root}>
      <Float duration={1000} distance={20} style={styles.emojiWrap}>
        <Text style={styles.emoji}>{guideInfo.emoji}</Text>
      </Float>
      <Text style={styles.type}>{investorType}</Text>
      <Text style={styles.lead}>당신에게 딱 맞는 투자 방법을 알려드릴게요</Text>
      <View style={styles.box}>
        <Text style={styles.boxTitle}>추천 전략: {guideInfo.strategy}</Text>
        <Text style={styles.boxDesc}>{guideInfo.description}</Text>
      </View>

      <View style={styles.settings}>
        <Button variant="ghost" size="icon" onPress={() => setShowSettings(!showSettings)} accessibilityLabel="설정">
          <Settings size={20} color={palette.gray[400]} />
        </Button>
        {showSettings && (
          <Pop duration={200} style={styles.menu}>
            <Pressable onPress={onRetakeAnalysis} style={({ pressed }) => [styles.menuItem, pressed && { backgroundColor: alpha("#ffffff", 0.1) }]}>
              <RotateCcw size={16} color={palette.gray[300]} />
              <Text style={styles.menuText}>투자 성향 다시 분석하기</Text>
            </Pressable>
          </Pop>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { alignItems: "center" },
  settings: { position: "absolute", top: 0, right: 0, alignItems: "flex-end", zIndex: 50 },
  menu: {
    position: "absolute",
    right: 0,
    top: 40,
    backgroundColor: "#252525",
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: alpha("#ffffff", 0.1),
    width: 192,
    boxShadow: "0 20px 25px rgba(0,0,0,0.3)",
  },
  menuItem: { width: "100%", flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  menuText: { fontSize: 14, color: palette.gray[300] },
  emojiWrap: { marginTop: 20, marginBottom: 24 },
  emoji: { fontSize: 96, lineHeight: 112, color: "#ffffff", textAlign: "center" },
  type: { fontSize: 30, lineHeight: 36, fontWeight: "700", color: "#ffffff", marginBottom: 16, textAlign: "center" },
  lead: { fontSize: 20, lineHeight: 28, color: palette.gray[400], marginBottom: 24, textAlign: "center" },
  box: { alignSelf: "stretch", backgroundColor: alpha(palette.blue[500], 0.1), borderWidth: 1, borderColor: alpha(palette.blue[500], 0.3), borderRadius: 16, padding: 24 },
  boxTitle: { fontSize: 20, lineHeight: 28, fontWeight: "700", color: palette.blue[400], marginBottom: 12, textAlign: "center" },
  boxDesc: { fontSize: 16, lineHeight: 24, color: palette.blue[300], textAlign: "center" },
})
