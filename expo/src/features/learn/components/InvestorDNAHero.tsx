import React, { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { Target, TrendingUp, Waves, Zap } from "lucide-react-native"
import { INVESTOR_DNA_MAP } from "@/data/legendary-scenarios"
import type { InvestorPersonality } from "@/data/legendary-scenarios"
import { Gradient } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { twGradient } from "../utils/tw"
import { RotatingChevron } from "./RotatingChevron"

interface Props {
  userPersonality: InvestorPersonality
  progress: { crisisGrade?: string; level?: number; waveAccuracy?: number; maxGap?: number; aiGap?: number } | null
}

export function InvestorDNAHero({ userPersonality, progress }: Props) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const myDNA = INVESTOR_DNA_MAP[userPersonality]

  const waveAccuracy = (progress as any)?.waveAccuracy || 45
  const maxGap = (progress as any)?.maxGap || -12.5
  const aiGap = (progress as any)?.aiGap || -3.2

  const accuracyColor = waveAccuracy >= 70 ? palette.green[300] : waveAccuracy >= 50 ? palette.yellow[300] : palette.red[300]
  const aiGapColor = aiGap >= 0 ? palette.green[300] : palette.yellow[300]

  return (
    <Gradient dir="br" colors={twGradient(myDNA.bgGradient)} style={styles.section}>
      {/* 항상 보이는 컴팩트 영역 */}
      <Pressable style={styles.header} onPress={() => setOpen(!open)}>
        <View style={styles.avatar}>
          <Waves size={24} color="#ffffff" />
        </View>
        <View style={styles.headerBody}>
          <Text style={styles.caption}>나의 파도 읽기 리포트</Text>
          <Text style={styles.title}>{myDNA.label} 투자자</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>
              파도 정확도 <Text style={styles.summaryStrong}>{waveAccuracy}%</Text>
            </Text>
            <Text style={styles.summaryText}>
              AI 갭{" "}
              <Text style={[styles.summaryStrong, { color: aiGapColor }]}>
                {aiGap >= 0 ? "+" : ""}
                {aiGap}%p
              </Text>
            </Text>
          </View>
        </View>
        <RotatingChevron rotated={open} size={16} color="#ffffff" opacity={0.6} />
      </Pressable>

      {/* 펼쳐진 상세 영역 - 파도 흐름 리포트 */}
      {open && (
        <View style={styles.detail}>
          {/* 핵심 지표 3개 */}
          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <Waves size={16} color={alpha("#ffffff", 0.7)} style={styles.statIcon} />
              <Text style={styles.statLabel}>파도 정확도</Text>
              <Text style={[styles.statValue, { color: accuracyColor }]}>{waveAccuracy}%</Text>
            </View>
            <View style={styles.statCard}>
              <TrendingUp size={16} color={alpha("#ffffff", 0.7)} style={styles.statIcon} />
              <Text style={styles.statLabel}>최대 갭</Text>
              <Text style={[styles.statValue, { color: maxGap >= 0 ? palette.green[300] : palette.red[300] }]}>
                {maxGap >= 0 ? "+" : ""}
                {maxGap}%
              </Text>
            </View>
            <View style={styles.statCard}>
              <Target size={16} color={alpha("#ffffff", 0.7)} style={styles.statIcon} />
              <Text style={styles.statLabel}>유사 AI 갭</Text>
              <Text style={[styles.statValue, { color: aiGapColor }]}>
                {aiGap >= 0 ? "+" : ""}
                {aiGap}%p
              </Text>
            </View>
          </View>

          {/* 파도 읽기 코멘트 */}
          <View style={styles.comment}>
            <Zap size={16} color={palette.yellow[300]} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.commentTitle}>파도 흐름 코멘트</Text>
              <Text style={styles.commentBody}>
                {waveAccuracy >= 70
                  ? "파도의 흐름을 잘 읽고 있습니다! 상승/하락 전환점을 정확히 포착하고 있어요."
                  : waveAccuracy >= 50
                    ? "파도 읽기가 점점 나아지고 있어요. 전환점에서 조금 더 인내심을 가져보세요."
                    : "파도의 흐름을 읽는 연습이 필요해요. 급등/급락에 휩쓸리지 말고 큰 흐름을 보세요."}
              </Text>
            </View>
          </View>

          {/* 투자 성향 정보 */}
          <View style={styles.traits}>
            {myDNA.traits.map((trait) => (
              <View key={trait} style={styles.trait}>
                <Text style={styles.traitText}>{trait}</Text>
              </View>
            ))}
          </View>

          <Pressable
            onPress={() => router.push("/onboarding")}
            style={({ pressed }) => [styles.retest, pressed && { backgroundColor: alpha("#ffffff", 0.2) }]}
          >
            <Text style={styles.retestText}>🔄 투자 성향 다시 진단하기</Text>
          </Pressable>
        </View>
      )}
    </Gradient>
  )
}

const styles = StyleSheet.create({
  section: { marginTop: 16, borderRadius: 16, overflow: "hidden" },
  header: { width: "100%", flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: alpha("#ffffff", 0.2), alignItems: "center", justifyContent: "center" },
  headerBody: { flex: 1, minWidth: 0 },
  caption: { fontSize: 10, fontWeight: "600", color: alpha("#ffffff", 0.6) },
  title: { fontSize: 16, fontWeight: "700", color: "#ffffff" },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 2 },
  summaryText: { fontSize: 10, color: alpha("#ffffff", 0.7) },
  summaryStrong: { fontWeight: "700", color: "#ffffff" },
  detail: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: alpha("#ffffff", 0.1) },
  statRow: { flexDirection: "row", gap: 8, marginTop: 12, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: alpha("#ffffff", 0.1), borderRadius: 12, padding: 10, alignItems: "center" },
  statIcon: { marginBottom: 4 },
  statLabel: { fontSize: 9, color: alpha("#ffffff", 0.6) },
  statValue: { fontSize: 18, fontWeight: "900" },
  comment: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: alpha("#ffffff", 0.1), borderRadius: 12, padding: 12, marginBottom: 12 },
  commentTitle: { fontSize: 12, fontWeight: "700", color: "#ffffff", marginBottom: 4 },
  commentBody: { fontSize: 11, lineHeight: 18, color: alpha("#ffffff", 0.8) },
  traits: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  trait: { backgroundColor: alpha("#ffffff", 0.15), borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 4 },
  traitText: { fontSize: 10, fontWeight: "700", color: "#ffffff" },
  retest: {
    width: "100%",
    backgroundColor: alpha("#ffffff", 0.1),
    borderWidth: 1,
    borderColor: alpha("#ffffff", 0.2),
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  retestText: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
})
