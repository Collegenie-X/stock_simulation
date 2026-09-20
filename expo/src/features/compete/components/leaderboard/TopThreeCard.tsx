import { StyleSheet, Text, View } from "react-native"
import { useRouter, type Href } from "expo-router"
import { Eye } from "lucide-react-native"
import { Gradient, PressableScale } from "@/components/ui"
import { formatNumber } from "@/lib/format"
import { alpha } from "@/theme"
import { COMPETE_LABELS, RANK_GRADIENTS, RANK_MEDALS } from "../../config"
import { twGradient } from "../../utils/tw"
import { ScoreBar } from "./ScoreBar"
import { getScore, type RankTab, type RankingUser } from "./types"

const L = COMPETE_LABELS.leaderboard

export function TopThreeCard({ user, idx, tab }: { user: RankingUser; idx: number; tab: RankTab }) {
  const router = useRouter()
  const gradient = RANK_GRADIENTS[idx] ?? "from-gray-500 to-gray-600"
  const score = getScore(user, tab)

  return (
    <PressableScale scaleTo={0.98} onPress={() => router.push(`/compete/${user.userId}` as Href)}>
      <Gradient dir="r" colors={twGradient(gradient)} style={styles.card}>
        <View style={styles.top}>
          <View style={styles.left}>
            <View style={styles.medal}>
              <Text style={{ fontSize: 24, color: "#ffffff" }}>{RANK_MEDALS[idx]}</Text>
            </View>
            <View style={{ flexShrink: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text numberOfLines={1} style={styles.nickname}>
                  {user.nickname}
                </Text>
                <View style={{ flexDirection: "row", gap: 4 }}>
                  {user.badges.map((b, i) => (
                    <Text key={i} style={{ fontSize: 14, color: "#ffffff" }}>
                      {b}
                    </Text>
                  ))}
                </View>
              </View>
              <Text style={styles.sub}>
                Level {user.level} · {user.style}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.profit}>+{user.profitRate}%</Text>
            <Text style={styles.sub}>{formatNumber(user.totalAssets)}원</Text>
          </View>
        </View>

        {/* 도전자 점수 바 */}
        <View style={styles.scoreBox}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={styles.sub}>{L.scoreLabel}</Text>
            <Text style={{ fontSize: 14, fontWeight: "900", color: "#ffffff" }}>{score}점</Text>
          </View>
          <ScoreBar score={score} />
        </View>

        <View style={styles.peek}>
          <Eye size={16} color="#ffffff" />
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#ffffff" }}>
            {L.peekStrategy} ({L.peekCost})
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={styles.cell}>
            <Text style={styles.sub}>{L.portfolio}</Text>
            <Text style={styles.cellValue}>{user.portfolio}종목</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.sub}>{L.waveType}</Text>
            <Text style={[styles.cellValue, { lineHeight: 15, textAlign: "center" }]}>{user.waveType}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.sub}>{L.trades}</Text>
            <Text style={styles.cellValue}>{user.trades}회</Text>
          </View>
        </View>
      </Gradient>
    </PressableScale>
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, boxShadow: "0 10px 15px rgba(0,0,0,0.2)" },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 8 },
  left: { flexDirection: "row", alignItems: "center", gap: 12, flexShrink: 1 },
  medal: { width: 48, height: 48, borderRadius: 24, backgroundColor: alpha("#ffffff", 0.2), alignItems: "center", justifyContent: "center" },
  nickname: { fontWeight: "700", fontSize: 16, color: "#ffffff", flexShrink: 1 },
  sub: { fontSize: 12, color: alpha("#ffffff", 0.7) },
  profit: { fontSize: 20, fontWeight: "900", color: "#ffffff" },
  scoreBox: { backgroundColor: alpha("#ffffff", 0.1), borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8 },
  peek: {
    backgroundColor: alpha("#ffffff", 0.2),
    borderRadius: 12,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 8,
  },
  cell: { flex: 1, backgroundColor: alpha("#ffffff", 0.1), borderRadius: 8, padding: 8, alignItems: "center" },
  cellValue: { fontSize: 12, fontWeight: "700", color: "#ffffff" },
})
