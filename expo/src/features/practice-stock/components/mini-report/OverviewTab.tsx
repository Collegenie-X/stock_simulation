import { type ReactNode } from "react"
import { StyleSheet, Text, View } from "react-native"
import { BadgeDollarSign, BarChart3, Star, Wallet } from "lucide-react-native"
import { alpha, palette } from "@/theme"
import { formatNumber } from "@/lib/format"
import { LABELS } from "@/features/practice-stock/config"
import type { TradeRecord } from "@/features/practice-stock/types"
import { MiniStatCard } from "./MiniStatCard"
import { TradeRow } from "./TradeRow"
import type { MiniAchievement } from "./grade"

export interface MiniReportStats {
  buyCount: number
  sellCount: number
  winRate: number
  totalRealizedProfit: number
  profitTradeCount: number
  lossTradeCount: number
  unrealizedProfit: number
  totalHoldingValue: number
}

interface OverviewTabProps {
  stats: MiniReportStats
  tradeHistory: TradeRecord[]
  achievements: MiniAchievement[]
  cash: number
  userTotalValue: number
  holdingsCount: number
}

function InfoBox({ icon, label, value, valueColor, sub, strong }: {
  icon: ReactNode; label: string; value: string; valueColor: string; sub: string; strong?: boolean
}) {
  return (
    <View style={[styles.infoBox, { backgroundColor: alpha(palette.gray[800], strong ? 0.5 : 0.4) }]}>
      <View style={[styles.infoHeader, { marginBottom: strong ? 6 : 4 }]}>
        {icon}
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={[styles.infoValue, { color: valueColor }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text style={styles.infoSub}>{sub}</Text>
    </View>
  )
}

/** 미니 리포트 — 종합 탭 */
export function OverviewTab({ stats, tradeHistory, achievements, cash, userTotalValue, holdingsCount }: OverviewTabProps) {
  const pnlColor = (v: number) => (v >= 0 ? palette.red[400] : palette.blue[400])

  return (
    <View style={{ gap: 12 }}>
      {/* 통계 그리드 */}
      <View style={{ flexDirection: "row", gap: 6 }}>
        <MiniStatCard label={LABELS.miniReport.totalTrades} value={String(tradeHistory.length)} />
        <MiniStatCard label={LABELS.miniReport.buyLabel} value={String(stats.buyCount)} valueColor={palette.red[400]} />
        <MiniStatCard label={LABELS.miniReport.sellLabel} value={String(stats.sellCount)} valueColor={palette.blue[400]} />
        <MiniStatCard
          label={LABELS.miniReport.winRateLabel}
          value={`${stats.winRate}%`}
          valueColor={stats.winRate >= 50 ? palette.green[400] : palette.orange[400]}
        />
      </View>

      {/* 실현/미실현 수익 */}
      <View style={styles.row}>
        <InfoBox
          strong
          icon={<BadgeDollarSign size={14} color={palette.green[400]} />}
          label={LABELS.miniReport.realizedProfit}
          value={`${stats.totalRealizedProfit >= 0 ? "+" : ""}${formatNumber(stats.totalRealizedProfit)}원`}
          valueColor={pnlColor(stats.totalRealizedProfit)}
          sub={`수익 ${stats.profitTradeCount} / 손실 ${stats.lossTradeCount}`}
        />
        <InfoBox
          strong
          icon={<BarChart3 size={14} color={palette.cyan[400]} />}
          label={LABELS.miniReport.unrealizedProfit}
          value={`${stats.unrealizedProfit >= 0 ? "+" : ""}${formatNumber(stats.unrealizedProfit)}원`}
          valueColor={pnlColor(stats.unrealizedProfit)}
          sub={`${holdingsCount}종목 보유 중`}
        />
      </View>

      {/* 현금 + 주식 자산 */}
      <View style={styles.row}>
        <InfoBox
          icon={<Wallet size={14} color={palette.green[400]} />}
          label={LABELS.miniReport.cashLabel}
          value={`${formatNumber(cash)}원`}
          valueColor="#ffffff"
          sub={userTotalValue > 0 ? `${((cash / userTotalValue) * 100).toFixed(0)}%` : "0%"}
        />
        <InfoBox
          icon={<BarChart3 size={14} color={palette.purple[400]} />}
          label={LABELS.miniReport.stockValueLabel}
          value={`${formatNumber(stats.totalHoldingValue)}원`}
          valueColor="#ffffff"
          sub={userTotalValue > 0 ? `${((stats.totalHoldingValue / userTotalValue) * 100).toFixed(0)}%` : "0%"}
        />
      </View>

      {/* 업적 */}
      <View style={styles.achievements}>
        <View style={styles.achievementsHeader}>
          <Star size={14} color={palette.yellow[400]} />
          <Text style={styles.achievementsTitle}>{LABELS.miniReport.achievementsTitle}</Text>
        </View>
        <View style={{ gap: 6 }}>
          {achievements.map((a, i) => (
            <View key={i} style={styles.achievementRow}>
              <a.Icon size={14} color={a.iconColor} />
              <Text style={styles.achievementText}>{a.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 거래 내역 요약 (최근 3건) */}
      {tradeHistory.length > 0 && (
        <View style={styles.trades}>
          <View style={styles.tradesHeader}>
            <Text style={styles.tradesTitle}>최근 거래</Text>
            <Text style={styles.tradesCount}>총 {tradeHistory.length}건</Text>
          </View>
          <View>
            {tradeHistory.slice(-3).reverse().map((trade, i) => (
              <TradeRow key={trade.id || i} trade={trade} isFirst={i === 0} />
            ))}
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  infoBox: { flex: 1, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: alpha(palette.gray[700], 0.2) },
  infoHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoLabel: { fontSize: 9, fontWeight: "700", color: palette.gray[500] },
  infoValue: { fontSize: 14, fontWeight: "800" },
  infoSub: { fontSize: 9, color: palette.gray[600], marginTop: 2 },
  achievements: {
    backgroundColor: alpha(palette.gray[800], 0.5),
    borderRadius: 16,
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.3),
    padding: 12,
  },
  achievementsHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  achievementsTitle: { fontSize: 11, fontWeight: "700", color: "#ffffff" },
  achievementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: alpha(palette.gray[900], 0.4),
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.2),
  },
  achievementText: { fontSize: 10, fontWeight: "700", color: palette.gray[200] },
  trades: {
    backgroundColor: alpha(palette.gray[800], 0.5),
    borderRadius: 16,
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.3),
    overflow: "hidden",
  },
  tradesHeader: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: alpha(palette.gray[700], 0.3),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tradesTitle: { fontSize: 11, fontWeight: "700", color: palette.gray[300] },
  tradesCount: { fontSize: 9, color: palette.gray[600] },
})
