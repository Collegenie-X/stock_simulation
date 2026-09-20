import { StyleSheet, Text, View } from "react-native"
import { BarChart3, Calendar, Target, Wallet } from "lucide-react-native"
import { alpha, palette } from "@/theme"
import { formatNumber } from "@/lib/format"
import { LABELS } from "@/features/practice-stock/config"
import type { DecisionTimelineEntry, FinalGameReportTradeRecord } from "@/features/practice-stock/types"
import { AchievementsCard } from "./AchievementsCard"
import { DecisionTimelineSection } from "./DecisionTimelineSection"
import { FinalRanking } from "./FinalRanking"
import { StatCard } from "./StatCard"
import { rateColor } from "./colors"
import type { FinalAchievement } from "./achievements"

export interface FinalReportStats {
  winRate: number
  holdingsCount: number
  buyCount: number
  sellCount: number
  totalRealizedProfit: number
  bestTrade: FinalGameReportTradeRecord | null
  worstTrade: FinalGameReportTradeRecord | null
  achievements: FinalAchievement[]
}

interface OverviewTabProps {
  stats: FinalReportStats
  totalDays: number
  tradeCount: number
  decisionTimeline: DecisionTimelineEntry[]
  userProfitRate: number
  userTotalValue: number
  initialValue: number
  aiSimilarName: string
  aiSimilarEmoji: string
  aiSimilarProfitRate: number
  aiSimilarTotalValue: number
  aiBestName: string
  aiBestEmoji: string
  aiBestProfitRate: number
  aiBestTotalValue: number
}

/** 최종 리포트 — 종합 탭 */
export function OverviewTab({
  stats, totalDays, tradeCount, decisionTimeline,
  userProfitRate, userTotalValue, initialValue,
  aiSimilarName, aiSimilarEmoji, aiSimilarProfitRate, aiSimilarTotalValue,
  aiBestName, aiBestEmoji, aiBestProfitRate, aiBestTotalValue,
}: OverviewTabProps) {
  return (
    <View style={{ gap: 12 }}>
      {/* 통계 그리드 */}
      <View style={styles.grid2}>
        <StatCard label={LABELS.finalReport.totalDays} value={`${totalDays}일`} icon={<Calendar size={14} color={palette.cyan[400]} />} />
        <StatCard label={LABELS.finalReport.totalTrades} value={`${tradeCount}회`} icon={<BarChart3 size={14} color={palette.green[400]} />} />
        <StatCard label={LABELS.finalReport.winRate} value={`${stats.winRate}%`} icon={<Target size={14} color={palette.yellow[400]} />} />
        <StatCard label={LABELS.finalReport.holdingStocks} value={`${stats.holdingsCount}종목`} icon={<Wallet size={14} color={palette.purple[400]} />} />
      </View>

      {/* 매수/매도/실현수익 */}
      <View style={styles.row}>
        <View style={styles.countBox}>
          <Text style={styles.boxLabel}>{LABELS.finalReport.buyCount}</Text>
          <Text style={[styles.countValue, { color: palette.red[400] }]}>{stats.buyCount}</Text>
        </View>
        <View style={styles.countBox}>
          <Text style={styles.boxLabel}>{LABELS.finalReport.sellCount}</Text>
          <Text style={[styles.countValue, { color: palette.blue[400] }]}>{stats.sellCount}</Text>
        </View>
        <View style={styles.countBox}>
          <Text style={styles.boxLabel}>{LABELS.finalReport.realizedProfit}</Text>
          <Text style={[styles.realized, { color: rateColor(stats.totalRealizedProfit) }]} numberOfLines={1} adjustsFontSizeToFit>
            {stats.totalRealizedProfit >= 0 ? "+" : ""}{formatNumber(stats.totalRealizedProfit)}
          </Text>
        </View>
      </View>

      {/* 최고/최악 거래 */}
      {(stats.bestTrade || stats.worstTrade) && (
        <View style={styles.row}>
          {stats.bestTrade && (
            <View style={[styles.tradeBox, { backgroundColor: alpha(palette.red[500], 0.05), borderColor: alpha(palette.red[500], 0.15) }]}>
              <Text style={styles.boxLabel}>{LABELS.finalReport.bestTrade}</Text>
              <Text style={styles.tradeName} numberOfLines={1}>{stats.bestTrade.stockName}</Text>
              <Text style={[styles.tradeProfit, { color: palette.red[400] }]}>+{formatNumber(stats.bestTrade.profit ?? 0)}원</Text>
            </View>
          )}
          {stats.worstTrade && (
            <View style={[styles.tradeBox, { backgroundColor: alpha(palette.blue[500], 0.05), borderColor: alpha(palette.blue[500], 0.15) }]}>
              <Text style={styles.boxLabel}>{LABELS.finalReport.worstTrade}</Text>
              <Text style={styles.tradeName} numberOfLines={1}>{stats.worstTrade.stockName}</Text>
              <Text style={[styles.tradeProfit, { color: palette.blue[400] }]}>{formatNumber(stats.worstTrade.profit ?? 0)}원</Text>
            </View>
          )}
        </View>
      )}

      {/* 업적 */}
      <AchievementsCard achievements={stats.achievements} />

      {/* 선택 타임라인 — 매 결정마다 나/균형형/공격형 선택과 결과 */}
      {decisionTimeline.length > 0 && (
        <DecisionTimelineSection
          entries={decisionTimeline}
          aiSimilarName={aiSimilarName}
          aiSimilarEmoji={aiSimilarEmoji}
          aiBestName={aiBestName}
          aiBestEmoji={aiBestEmoji}
        />
      )}

      {/* 최종 순위 */}
      <FinalRanking
        userRate={userProfitRate} userValue={userTotalValue}
        simRate={aiSimilarProfitRate} simValue={aiSimilarTotalValue} simName={aiSimilarName} simEmoji={aiSimilarEmoji}
        bestRate={aiBestProfitRate} bestValue={aiBestTotalValue} bestName={aiBestName} bestEmoji={aiBestEmoji}
        initialValue={initialValue}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  grid2: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  row: { flexDirection: "row", gap: 8 },
  countBox: {
    flex: 1,
    backgroundColor: alpha(palette.gray[800], 0.4),
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.2),
  },
  boxLabel: { fontSize: 9, color: palette.gray[500], marginBottom: 4 },
  countValue: { fontSize: 18, fontWeight: "800" },
  realized: { fontSize: 14, lineHeight: 25, fontWeight: "800" },
  tradeBox: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 12 },
  tradeName: { fontSize: 12, fontWeight: "700", color: "#ffffff" },
  tradeProfit: { fontSize: 14, fontWeight: "800", marginTop: 2 },
})
