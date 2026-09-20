import { useState } from "react"
import { Platform, Share, StyleSheet, Text, View } from "react-native"
import { Check, Copy } from "lucide-react-native"
import { BottomSheet, Gradient, PressableScale } from "@/components/ui"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"
import { COMPETE_LABELS, INVESTMENT_STYLES, WAVE_PATTERN_TYPES } from "../../config"
import type { MyProfile } from "./types"

const L = COMPETE_LABELS.hero

interface ShareSheetProps {
  visible: boolean
  onClose: () => void
  profile: MyProfile
  percentile: string
}

/** 공유 모달 (웹 HeroSection 의 `fixed inset-0` 바텀시트) */
export function ShareSheet({ visible, onClose, profile, percentile }: ShareSheetProps) {
  const [copied, setCopied] = useState(false)

  const styleInfo = INVESTMENT_STYLES[profile.investmentStyle] ?? INVESTMENT_STYLES.aggressive
  const waveInfo = WAVE_PATTERN_TYPES[profile.wavePatternType] ?? WAVE_PATTERN_TYPES.wave3Focus

  // 웹: navigator.clipboard.writeText → 앱: 시스템 공유 시트
  const handleCopy = async (text: string) => {
    await Share.share({ message: text }).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} showHandle={false} style={styles.sheet}>
      <View style={styles.handle} />
      <Text style={styles.title}>{L.shareTitle}</Text>
      <Text style={styles.desc}>{L.shareDesc}</Text>

      {/* 공유 카드 미리보기 */}
      <Gradient dir="br" colors={["#1a1a2e", "#0f3460"]} style={styles.preview}>
        <View style={styles.previewTop}>
          <View>
            <Text style={styles.gray12}>나의 투자 순위</Text>
            <Text style={styles.previewRank}>
              {profile.rank}
              <Text style={{ fontSize: 18, color: palette.gray[400] }}>위</Text>
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.previewProfit}>+{profile.profitRate}%</Text>
            <Text style={styles.gray12}>
              {formatNumber(profile.totalRankUsers)}명 중 상위 {percentile}%
            </Text>
          </View>
        </View>
        <View style={styles.previewTags}>
          <Gradient dir="r" colors={[styleInfo.gradientFrom, styleInfo.gradientTo]} style={styles.styleTag}>
            <Text style={styles.styleTagText}>
              {styleInfo.emoji} {styleInfo.label}
            </Text>
          </Gradient>
          <Text style={styles.gray12}>
            {waveInfo.emoji} {waveInfo.label}
          </Text>
        </View>
      </Gradient>

      {/* 공유 코드 */}
      <View style={styles.codeBox}>
        <View>
          <Text style={[styles.gray12, { marginBottom: 2 }]}>{L.shareCode}</Text>
          <Text style={styles.code}>{profile.shareCode}</Text>
        </View>
        <PressableScale onPress={() => handleCopy(profile.shareCode)} style={styles.copyBtn}>
          {copied ? <Check size={16} color={palette.blue[400]} /> : <Copy size={16} color={palette.blue[400]} />}
          <Text style={styles.copyText}>{copied ? "복사됨" : L.copyCode}</Text>
        </PressableScale>
      </View>

      <PressableScale onPress={() => handleCopy(`https://stocksim.app/compete/me?code=${profile.shareCode}`)}>
        <Gradient dir="r" colors={[palette.blue[500], palette.purple[600]]} style={styles.linkBtn}>
          <Text style={styles.linkText}>🔗 {L.copyLink}</Text>
        </Gradient>
      </PressableScale>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  sheet: { backgroundColor: "#1e1e1e", padding: 24, paddingTop: 24, borderTopWidth: 1, borderTopColor: alpha("#ffffff", 0.1) },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: palette.gray[600], alignSelf: "center", marginBottom: 20 },
  title: { fontSize: 18, fontWeight: "700", color: "#ffffff", marginBottom: 4 },
  desc: { fontSize: 14, color: palette.gray[400], marginBottom: 20 },
  preview: { borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: alpha("#ffffff", 0.1) },
  previewTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  previewRank: { fontSize: 30, fontWeight: "900", color: "#ffffff" },
  previewProfit: { fontSize: 24, fontWeight: "900", color: palette.red[400] },
  previewTags: { flexDirection: "row", alignItems: "center", gap: 8 },
  styleTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999 },
  styleTagText: { fontSize: 12, fontWeight: "700", color: "#ffffff" },
  gray12: { fontSize: 12, color: palette.gray[400] },
  codeBox: {
    backgroundColor: "#252525",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: alpha("#ffffff", 0.05),
  },
  code: { fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }), fontWeight: "700", color: "#ffffff", fontSize: 18 },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: alpha(palette.blue[500], 0.2),
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: alpha(palette.blue[500], 0.3),
  },
  copyText: { fontSize: 14, fontWeight: "600", color: palette.blue[400] },
  linkBtn: { borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  linkText: { color: "#ffffff", fontWeight: "700", fontSize: 16 },
})
