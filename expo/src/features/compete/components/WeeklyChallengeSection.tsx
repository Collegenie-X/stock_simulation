import { Pressable, StyleSheet, Text, View } from "react-native"
import { useRouter, type Href } from "expo-router"
import { Clock } from "lucide-react-native"
import { Gradient } from "@/components/ui"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"
import { COMPETE_LABELS } from "../config"

interface WeeklyChallenge {
  title: string
  goal: string
  participants: number
  timeRemaining: string
  progressPercent: number
  reward: string
}

interface WeeklyChallengeSectionProps {
  challenge: WeeklyChallenge
}

const L = COMPETE_LABELS.challenge
const ITEMS = L.items

export function WeeklyChallengeSection({ challenge }: WeeklyChallengeSectionProps) {
  const router = useRouter()

  return (
    <>
      {/* 챌린지 배너 */}
      <Gradient dir="br" colors={[palette.yellow[500], palette.orange[600]]} style={styles.banner}>
        <View style={styles.glowA} />
        <View style={styles.glowB} />

        <View>
          <View style={styles.bannerTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerLabel}>이번 주 챌린지</Text>
              <Text style={styles.bannerTitle}>{challenge.title}</Text>
              <Text style={styles.bannerGoal}>
                목표: {challenge.goal} · {formatNumber(challenge.participants)}
                {L.participants}
              </Text>
            </View>
            <View style={styles.trophy}>
              <Text style={{ fontSize: 36, color: "#ffffff" }}>🏆</Text>
            </View>
          </View>

          <View style={[styles.glass, { marginBottom: 12 }]}>
            <View style={styles.timeRow}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Clock size={16} color={palette.yellow[200]} />
                <Text style={{ fontSize: 14, color: palette.yellow[100] }}>{L.timeRemaining}</Text>
              </View>
              <Text style={{ fontWeight: "700", fontSize: 16, color: "#ffffff" }}>{challenge.timeRemaining}</Text>
            </View>
            <View style={styles.track}>
              <View style={{ height: "100%", backgroundColor: "#ffffff", borderRadius: 9999, width: `${Math.max(0, Math.min(100, challenge.progressPercent))}%` }} />
            </View>
          </View>

          <View style={styles.glass}>
            <Text style={{ fontSize: 14, color: palette.yellow[100] }}>
              🎁 이번 주 보상: <Text style={{ fontWeight: "700", color: "#ffffff" }}>{challenge.reward}</Text>
            </Text>
          </View>
        </View>
      </Gradient>

      {/* 챌린지 리스트 */}
      <View style={{ marginTop: 16 }}>
        <Text style={styles.listTitle}>🎯 {L.title}</Text>
        <View style={{ gap: 12 }}>
          {ITEMS.map((item) => {
            const go = () => router.push(`/compete/challenge/${item.id}` as Href)
            return (
              <Pressable key={item.id} onPress={go} style={({ pressed }) => [styles.item, pressed && { backgroundColor: "#2a2a2a" }]}>
                <View style={styles.itemTop}>
                  <View style={styles.itemLeft}>
                    <View style={[styles.itemIcon, { backgroundColor: item.active ? alpha(palette.blue[500], 0.2) : alpha("#ffffff", 0.05) }]}>
                      <Text style={{ fontSize: 24, color: "#ffffff" }}>{item.emoji}</Text>
                    </View>
                    <View style={{ flexShrink: 1 }}>
                      <Text style={{ fontWeight: "700", fontSize: 16, color: "#ffffff" }}>{item.title}</Text>
                      <Text style={{ fontSize: 14, color: palette.gray[400] }}>{item.desc}</Text>
                    </View>
                  </View>
                  <Pressable onPress={go}>
                    {item.active ? (
                      <Gradient dir="r" colors={[palette.blue[500], palette.purple[500]]} style={styles.btn}>
                        <Text style={[styles.btnText, { color: "#ffffff" }]}>{L.challengeBtn}</Text>
                      </Gradient>
                    ) : (
                      <View style={[styles.btn, { borderWidth: 1, borderColor: palette.gray[600] }]}>
                        <Text style={[styles.btnText, { color: palette.gray[300] }]}>{L.challengeBtn}</Text>
                      </View>
                    )}
                  </Pressable>
                </View>
                <View style={styles.metaRow}>
                  <View style={styles.meta}>
                    <Text style={styles.metaLabel}>{L.reward}:</Text>
                    <Text style={styles.metaValue}>{item.reward}</Text>
                  </View>
                  {"progress" in item && !!item.progress && (
                    <View style={styles.meta}>
                      <Text style={styles.metaLabel}>{L.progress}:</Text>
                      <Text style={styles.metaValue}>{item.progress}</Text>
                    </View>
                  )}
                  {"difficulty" in item && !!item.difficulty && (
                    <View style={styles.meta}>
                      <Text style={styles.metaLabel}>{L.difficulty}:</Text>
                      <Text style={[styles.metaValue, { color: palette.yellow[400] }]}>{item.difficulty}</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            )
          })}
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  banner: { marginTop: 24, borderRadius: 24, padding: 24, overflow: "hidden" },
  glowA: { position: "absolute", top: -40, right: -40, width: 128, height: 128, borderRadius: 64, backgroundColor: alpha("#ffffff", 0.08) },
  glowB: { position: "absolute", bottom: -32, left: -32, width: 96, height: 96, borderRadius: 48, backgroundColor: alpha(palette.yellow[300], 0.15) },
  bannerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 12 },
  bannerLabel: { fontSize: 14, fontWeight: "600", color: palette.yellow[100], marginBottom: 4 },
  bannerTitle: { fontSize: 30, fontWeight: "700", color: "#ffffff" },
  bannerGoal: { fontSize: 14, color: palette.yellow[100], marginTop: 4 },
  trophy: { width: 80, height: 80, borderRadius: 40, backgroundColor: alpha("#ffffff", 0.2), alignItems: "center", justifyContent: "center" },
  glass: { backgroundColor: alpha("#ffffff", 0.1), borderRadius: 12, padding: 12 },
  timeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  track: { height: 8, backgroundColor: alpha("#ffffff", 0.2), borderRadius: 9999, overflow: "hidden" },
  listTitle: { fontSize: 18, fontWeight: "700", color: "#ffffff", marginBottom: 12 },
  item: { backgroundColor: "#252525", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05) },
  itemTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 8 },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  itemIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  btn: { height: 32, paddingHorizontal: 12, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  btnText: { fontSize: 14, fontWeight: "500" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 16, flexWrap: "wrap" },
  meta: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaLabel: { fontSize: 12, color: palette.gray[400] },
  metaValue: { fontSize: 12, color: "#ffffff", fontWeight: "700" },
})
