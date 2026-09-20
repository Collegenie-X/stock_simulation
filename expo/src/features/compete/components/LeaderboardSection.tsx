import { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { Info, Trophy } from "lucide-react-native"
import { alpha, palette } from "@/theme"
import { COMPETE_LABELS } from "../config"
import { FilterSelect } from "./leaderboard/FilterSelect"
import { NormalRankCard } from "./leaderboard/NormalRankCard"
import { TopThreeCard } from "./leaderboard/TopThreeCard"
import { getScore, type RankTab, type RankingUser } from "./leaderboard/types"

interface LeaderboardSectionProps {
  rankings: RankingUser[]
}

const L = COMPETE_LABELS.leaderboard

const TABS: { id: RankTab; label: string; desc: string }[] = [
  { id: "weekly", label: L.weeklyTab, desc: L.weeklyDesc },
  { id: "cumulative", label: L.cumulativeTab, desc: L.cumulativeDesc },
]

export function LeaderboardSection({ rankings }: LeaderboardSectionProps) {
  const [filter, setFilter] = useState(0)
  const [rankTab, setRankTab] = useState<RankTab>("weekly")

  // 탭에 따라 정렬
  const sorted = [...rankings].sort((a, b) => getScore(b, rankTab) - getScore(a, rankTab))

  return (
    <View style={{ marginTop: 24 }}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Trophy size={20} color={palette.yellow[500]} />
          <Text style={styles.title}>{L.title}</Text>
        </View>
        <FilterSelect value={filter} options={L.filterLabels} onChange={setFilter} />
      </View>

      {/* 주간 / 누적 탭 */}
      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const active = rankTab === tab.id
          const color = active ? palette.yellow[300] : palette.gray[400]
          return (
            <Pressable
              key={tab.id}
              onPress={() => setRankTab(tab.id)}
              style={[
                styles.tab,
                active
                  ? { backgroundColor: alpha(palette.yellow[500], 0.15), borderColor: alpha(palette.yellow[500], 0.4) }
                  : { backgroundColor: "#252525", borderColor: alpha("#ffffff", 0.05) },
              ]}
            >
              <Text style={{ fontSize: 12, fontWeight: "900", color }}>{tab.label}</Text>
              <Text style={{ fontSize: 10, color, opacity: 0.6, marginTop: 2 }}>{tab.desc}</Text>
            </Pressable>
          )
        })}
      </View>

      {/* 랭킹 기준 안내 */}
      <View style={styles.notice}>
        <Info size={12} color={palette.gray[500]} style={{ marginTop: 2 }} />
        <Text style={styles.noticeText}>
          <Text style={{ color: alpha(palette.yellow[400], 0.8), fontWeight: "700" }}>{L.rankBasis}</Text> · 도전자 점수 = 수익률(50%) + 파도정확도(25%) + 승률(15%) + 일관성(10%)
        </Text>
      </View>

      {/* 랭킹 리스트 */}
      <View style={{ gap: 10 }}>
        {sorted.map((user, idx) =>
          idx < 3 ? <TopThreeCard key={user.userId} user={user} idx={idx} tab={rankTab} /> : <NormalRankCard key={user.userId} user={user} tab={rankTab} />,
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  title: { fontSize: 18, fontWeight: "700", color: "#ffffff" },
  tabRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  tab: { flex: 1, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1 },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 12,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: alpha("#ffffff", 0.05),
  },
  noticeText: { flex: 1, fontSize: 10, lineHeight: 16, color: palette.gray[500] },
})
