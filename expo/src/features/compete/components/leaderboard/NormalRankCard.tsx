import { Pressable, StyleSheet, Text, View } from "react-native"
import { useRouter, type Href } from "expo-router"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"
import { ScoreBar } from "./ScoreBar"
import { getScore, type RankTab, type RankingUser } from "./types"

export function NormalRankCard({ user, tab }: { user: RankingUser; tab: RankTab }) {
  const router = useRouter()
  const score = getScore(user, tab)
  return (
    <Pressable onPress={() => router.push(`/compete/${user.userId}` as Href)} style={({ pressed }) => [styles.card, pressed && { backgroundColor: "#2a2a2a" }]}>
      <View style={styles.row}>
        <View style={styles.left}>
          <View style={styles.rank}>
            <Text style={styles.rankText}>{user.rank}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text numberOfLines={1} style={styles.nickname}>
                {user.nickname}
              </Text>
              {user.badges.map((b, i) => (
                <Text key={i} style={{ fontSize: 14, color: "#ffffff" }}>
                  {b}
                </Text>
              ))}
            </View>
            <Text style={styles.sub}>
              Level {user.level} · {user.waveType}
            </Text>
            {score > 0 && <ScoreBar score={score} />}
          </View>
        </View>
        <View style={{ alignItems: "flex-end", flexShrink: 0, marginLeft: 8 }}>
          <Text style={styles.profit}>+{user.profitRate}%</Text>
          <Text style={styles.sub}>{formatNumber(user.totalAssets)}원</Text>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#252525", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05) },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  left: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  rank: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#333333", alignItems: "center", justifyContent: "center" },
  rankText: { color: palette.gray[400], fontWeight: "700", fontSize: 14 },
  nickname: { fontWeight: "700", color: "#ffffff", fontSize: 14, flexShrink: 1 },
  sub: { fontSize: 12, color: palette.gray[400] },
  profit: { fontSize: 16, fontWeight: "700", color: palette.red[400] },
})
