import { useEffect, useRef, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { ChevronRight, Clock, Target, Trophy, Users } from "lucide-react-native"
import { MobileHeader, MobileNav, Screen } from "@/components/layout"
import { Gradient, PressableScale } from "@/components/ui"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"
import { RewardRow } from "../components/challenge/RewardRow"
import { challenges } from "../components/challenge/data"

const BG = [palette.purple[50], palette.pink[50], palette.blue[50]]

const difficultyColors: Record<string, { bg: string; text: string }> = {
  쉬움: { bg: palette.green[100], text: palette.green[700] },
  보통: { bg: palette.yellow[100], text: palette.yellow[700] },
  어려움: { bg: palette.red[100], text: palette.red[700] },
}

export default function ChallengeDetailScreen() {
  const params = useLocalSearchParams<{ challengeId: string }>()
  const router = useRouter()
  const challengeId = params.challengeId as string
  const challenge = challenges[challengeId]
  const [isStarting, setIsStarting] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  if (!challenge) {
    return (
      <View style={{ flex: 1 }}>
        <Gradient dir="br" colors={BG} style={StyleSheet.absoluteFill} />
        <Screen bg="transparent" scroll={false} contentStyle={{ alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: palette.gray[600], fontSize: 16 }}>도전 과제를 찾을 수 없습니다.</Text>
        </Screen>
      </View>
    )
  }

  const handleStart = () => {
    setIsStarting(true)
    timer.current = setTimeout(() => {
      setIsStarting(false)
      router.push("/practice/stock/scenario-1")
    }, 500)
  }

  const diff = difficultyColors[challenge.difficulty]

  return (
    <View style={{ flex: 1 }}>
      <Gradient dir="br" colors={BG} style={StyleSheet.absoluteFill} />
      <Screen
        bg="transparent"
        withHeader
        withNav
        fixed={
          <>
            <MobileHeader title="도전 과제" />
            <MobileNav />
          </>
        }
      >
        <View style={{ paddingHorizontal: 20 }}>
          {/* Challenge Header */}
          <Gradient dir="br" colors={[palette.blue[500], palette.purple[600]]} style={styles.hero}>
            <View style={styles.circleA} />
            <View style={styles.circleB} />

            <View>
              <View style={styles.heroTop}>
                <View style={styles.heroIcon}>
                  <Text style={{ fontSize: 36, color: "#ffffff" }}>{challenge.icon}</Text>
                </View>
                <View style={[styles.diffBadge, { backgroundColor: diff?.bg ?? "transparent" }]}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: diff?.text ?? "#ffffff" }}>{challenge.difficulty}</Text>
                </View>
              </View>
              <Text style={styles.heroTitle}>{challenge.title}</Text>
              <Text style={styles.heroDesc}>{challenge.description}</Text>
            </View>
          </Gradient>

          {/* Stats */}
          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <Users size={24} color={palette.blue[500]} style={{ marginBottom: 8 }} />
              <Text style={styles.statValue}>{formatNumber(challenge.participants)}</Text>
              <Text style={styles.statLabel}>도전 중</Text>
            </View>
            <View style={styles.statCard}>
              <Trophy size={24} color={palette.yellow[500]} style={{ marginBottom: 8 }} />
              <Text style={styles.statValue}>{challenge.completionRate}%</Text>
              <Text style={styles.statLabel}>성공률</Text>
            </View>
            <View style={styles.statCard}>
              <Clock size={24} color={palette.purple[500]} style={{ marginBottom: 8 }} />
              <Text numberOfLines={1} adjustsFontSizeToFit style={styles.statValue}>
                {challenge.timeLimit}
              </Text>
              <Text style={styles.statLabel}>제한시간</Text>
            </View>
          </View>

          {/* Rewards */}
          <View style={styles.panel}>
            <View style={styles.panelTitleRow}>
              <Trophy size={20} color={palette.yellow[500]} />
              <Text style={styles.panelTitle}>보상</Text>
            </View>
            <View style={{ gap: 12 }}>
              <RewardRow emoji="⭐" label="경험치" value={`+${challenge.reward.xp} XP`} bg={palette.blue[50]} iconBg={palette.blue[500]} valueColor={palette.blue[600]} />
              <RewardRow
                emoji="💰"
                label="게임 머니"
                value={`+${formatNumber(challenge.reward.coins)}원`}
                bg={palette.yellow[50]}
                iconBg={palette.yellow[500]}
                valueColor={palette.yellow[600]}
              />
              <RewardRow emoji="🏅" label="뱃지" value={challenge.reward.badge} bg={palette.purple[50]} iconBg={palette.purple[500]} valueColor={palette.purple[600]} />
            </View>
          </View>

          {/* Requirements */}
          <View style={styles.panel}>
            <View style={styles.panelTitleRow}>
              <Target size={20} color={palette.green[500]} />
              <Text style={styles.panelTitle}>달성 조건</Text>
            </View>
            <View style={{ gap: 8 }}>
              {challenge.requirements.map((req, idx) => (
                <View key={idx} style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                  <View style={styles.reqDotWrap}>
                    <View style={styles.reqDot} />
                  </View>
                  <Text style={styles.bodyText}>{req}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Tips */}
          <Gradient dir="br" colors={[palette.blue[50], palette.purple[50]]} style={styles.tips}>
            <Text style={[styles.panelTitle, { marginBottom: 12 }]}>💡 성공 팁</Text>
            <View style={{ gap: 8 }}>
              {challenge.tips.map((tip, idx) => (
                <View key={idx} style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                  <ChevronRight size={16} color={palette.blue[500]} style={{ marginTop: 4 }} />
                  <Text style={[styles.bodyText, { lineHeight: 22 }]}>{tip}</Text>
                </View>
              ))}
            </View>
          </Gradient>

          {/* Start Button */}
          <View style={{ marginTop: 32, marginBottom: 24 }}>
            <PressableScale onPress={handleStart} disabled={isStarting}>
              <Gradient dir="r" colors={[palette.blue[500], palette.purple[600]]} style={styles.startBtn}>
                <Text style={styles.startText}>{isStarting ? "시작 중..." : "도전 시작하기"}</Text>
              </Gradient>
            </PressableScale>
            <Text style={styles.startNote}>언제든 중단하고 나중에 다시 시작할 수 있어요</Text>
          </View>
        </View>
      </Screen>
    </View>
  )
}

const styles = StyleSheet.create({
  hero: { marginTop: 24, borderRadius: 24, padding: 24, overflow: "hidden", boxShadow: "0 20px 25px rgba(0,0,0,0.1)" },
  circleA: { position: "absolute", top: -40, right: -40, width: 128, height: 128, borderRadius: 64, backgroundColor: alpha("#ffffff", 0.1) },
  circleB: { position: "absolute", bottom: -32, left: -32, width: 96, height: 96, borderRadius: 48, backgroundColor: alpha("#ffffff", 0.1) },
  heroTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 },
  heroIcon: { width: 64, height: 64, borderRadius: 16, backgroundColor: alpha("#ffffff", 0.2), alignItems: "center", justifyContent: "center" },
  diffBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9999 },
  heroTitle: { fontSize: 24, fontWeight: "700", color: "#ffffff", marginBottom: 8 },
  heroDesc: { fontSize: 16, lineHeight: 26, color: alpha("#ffffff", 0.9) },
  statRow: { marginTop: 24, flexDirection: "row", gap: 12 },
  statCard: { flex: 1, backgroundColor: "#ffffff", borderRadius: 16, padding: 16, alignItems: "center", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" },
  statValue: { fontSize: 24, fontWeight: "700", color: palette.gray[900] },
  statLabel: { fontSize: 12, color: palette.gray[500], marginTop: 4 },
  panel: { marginTop: 24, backgroundColor: "#ffffff", borderRadius: 16, padding: 20, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" },
  panelTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  panelTitle: { fontSize: 18, fontWeight: "700", color: palette.gray[900] },
  reqDotWrap: { width: 20, height: 20, borderRadius: 10, backgroundColor: palette.green[100], alignItems: "center", justifyContent: "center", marginTop: 2 },
  reqDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.green[500] },
  bodyText: { flex: 1, fontSize: 14, color: palette.gray[700] },
  tips: { marginTop: 24, borderRadius: 16, padding: 20, borderWidth: 2, borderColor: palette.blue[200] },
  startBtn: { height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center", boxShadow: "0 10px 15px rgba(0,0,0,0.1)" },
  startText: { color: "#ffffff", fontSize: 18, fontWeight: "700" },
  startNote: { textAlign: "center", fontSize: 14, color: palette.gray[500], marginTop: 12 },
})
