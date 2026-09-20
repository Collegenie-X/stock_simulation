import { StyleSheet, Text, View } from "react-native"
import { Bot, Minus, Swords, TrendingDown, TrendingUp } from "lucide-react-native"
import { alpha, palette } from "@/theme"
import { formatNumber } from "@/lib/format"
import type { AIAction } from "@/features/practice-stock/hooks/useAICompetitor"

export interface AIHoldingListItem {
  id: string
  name: string
  qty: number
  price: number
  avg: number
  profitPct: number
  evalAmount: number
}

interface AICompareTabProps {
  aiName: string
  aiMotto: string
  aiTotalValue: number
  aiProfitRate: number
  aiTodayActions: AIAction[]
  aiTotalTrades: number
  aiHoldingsList: AIHoldingListItem[]
  userTotalValue: number
  userProfitRate: number
  initialValue: number
  styleInfo: { label: string; color: string; bg: string }
}

/** 수익 분석 모달의 "AI 비교" 탭 */
export const AICompareTab = ({
  aiName,
  aiMotto,
  aiTotalValue,
  aiProfitRate,
  aiTodayActions,
  aiTotalTrades,
  aiHoldingsList,
  userTotalValue,
  userProfitRate,
  initialValue,
  styleInfo,
}: AICompareTabProps) => {
  const userWinning = userProfitRate >= aiProfitRate
  const isAiProfit = aiProfitRate >= 0
  const isUserProfit = userProfitRate >= 0
  const userColor = isUserProfit ? palette.red[400] : palette.blue[400]
  const aiColor = isAiProfit ? palette.red[400] : palette.blue[400]
  const tradeActions = aiTodayActions.filter((a) => a.type !== "hold")

  return (
    <View style={{ paddingBottom: 32 }}>
      {/* VS 카드 */}
      <View style={styles.vsCard}>
        <View style={{ flexDirection: "row" }}>
          {/* 나 */}
          <View style={[styles.vsCol, userWinning && { backgroundColor: alpha(palette.blue[500], 0.05) }]}>
            <Text style={styles.vsLabel}>나의 성과</Text>
            <Text style={[styles.vsRate, { color: userColor }]}>
              {isUserProfit ? "+" : ""}{userProfitRate}%
            </Text>
            <Text style={styles.vsValue}>{formatNumber(userTotalValue)}원</Text>
            {userWinning && (
              <View style={[styles.winBadge, { backgroundColor: alpha(palette.yellow[500], 0.1) }]}>
                <Text style={[styles.winText, { color: palette.yellow[400] }]}>승리 중</Text>
              </View>
            )}
          </View>

          {/* AI */}
          <View style={[styles.vsCol, styles.vsColRight, !userWinning && { backgroundColor: alpha(palette.purple[500], 0.05) }]}>
            <View style={styles.aiLabelRow}>
              <Bot size={12} color={palette.gray[500]} />
              <Text style={[styles.vsLabel, { marginBottom: 0 }]} numberOfLines={1}>🤖 {aiName}</Text>
            </View>
            <Text style={[styles.vsRate, { color: aiColor }]}>
              {isAiProfit ? "+" : ""}{aiProfitRate.toFixed(1)}%
            </Text>
            <Text style={styles.vsValue}>{formatNumber(aiTotalValue)}원</Text>
            {!userWinning && userProfitRate !== aiProfitRate && (
              <View style={[styles.winBadge, { backgroundColor: alpha(palette.purple[500], 0.1) }]}>
                <Text style={[styles.winText, { color: palette.purple[400] }]}>승리 중</Text>
              </View>
            )}
          </View>
        </View>

        {/* 원금 대비 수익금 비교 */}
        <View style={styles.vsFooter}>
          <Text style={styles.footerLabel}>
            나의 수익금{" "}
            <Text style={{ fontWeight: "700", color: userColor }}>
              {isUserProfit ? "+" : ""}{formatNumber(userTotalValue - initialValue)}원
            </Text>
          </Text>
          <Text style={styles.footerLabel}>
            AI 수익금{" "}
            <Text style={{ fontWeight: "700", color: aiColor }}>
              {isAiProfit ? "+" : ""}{formatNumber(aiTotalValue - initialValue)}원
            </Text>
          </Text>
        </View>
      </View>

      {/* AI 전략 정보 */}
      <View style={styles.strategyCard}>
        <View style={styles.strategyHeader}>
          <Bot size={16} color={palette.purple[400]} />
          <Text style={styles.strategyTitle}>AI 투자 전략</Text>
          <View style={[styles.styleBadge, { backgroundColor: styleInfo.bg }]}>
            <Text style={[styles.styleBadgeText, { color: styleInfo.color }]}>{styleInfo.label}</Text>
          </View>
        </View>
        {!!aiMotto && <Text style={styles.motto}>"{aiMotto}"</Text>}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>총 거래 횟수</Text>
            <Text style={styles.statValue}>{aiTotalTrades}회</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>보유 종목 수</Text>
            <Text style={styles.statValue}>{aiHoldingsList.length}종목</Text>
          </View>
        </View>
      </View>

      {/* AI 보유 포트폴리오 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Bot size={14} color={palette.purple[400]} />
          <Text style={styles.sectionTitle}>🤖 AI 보유 포트폴리오</Text>
        </View>

        {aiHoldingsList.length === 0 ? (
          <Text style={styles.emptyText}>AI가 아직 매수한 종목이 없습니다.</Text>
        ) : (
          <View style={{ gap: 8 }}>
            {aiHoldingsList.map((item) => {
              const isProfit = item.profitPct >= 0
              const c = isProfit ? palette.red[400] : palette.blue[400]
              return (
                <View key={item.id} style={styles.holdingCard}>
                  <View style={styles.holdingLeft}>
                    <View style={styles.holdingIcon}>
                      <Bot size={14} color={palette.purple[400]} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.holdingName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.holdingSub}>
                        {item.qty}주 · 평균 {formatNumber(Math.round(item.avg))}원
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: "flex-end", flexShrink: 0 }}>
                    <Text style={styles.holdingName}>{formatNumber(item.evalAmount)}원</Text>
                    <View style={styles.holdingRateRow}>
                      {isProfit ? (
                        <TrendingUp size={12} color={c} />
                      ) : item.profitPct === 0 ? (
                        <Minus size={12} color={c} />
                      ) : (
                        <TrendingDown size={12} color={c} />
                      )}
                      <Text style={[styles.holdingRate, { color: c }]}>
                        {isProfit ? "+" : ""}{item.profitPct.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                </View>
              )
            })}
          </View>
        )}
      </View>

      {/* AI 최근 거래 내역 */}
      {aiTodayActions.length > 0 && aiTodayActions[0].type !== "hold" && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Swords size={14} color={palette.yellow[500]} />
            <Text style={styles.sectionTitle}>AI 최근 거래</Text>
          </View>
          <View style={{ gap: 6 }}>
            {tradeActions.map((a, i) => {
              const isBuy = a.type === "buy"
              const base = isBuy ? palette.red[500] : palette.blue[500]
              return (
                <View key={i} style={[styles.actionRow, { backgroundColor: alpha(base, 0.1), borderColor: alpha(base, 0.2) }]}>
                  <View style={[styles.actionBadge, { backgroundColor: alpha(base, 0.2) }]}>
                    <Text style={[styles.actionBadgeText, { color: isBuy ? palette.red[400] : palette.blue[400] }]}>
                      {isBuy ? "매수" : "매도"}
                    </Text>
                  </View>
                  <Text style={styles.actionName} numberOfLines={1}>{a.stockName}</Text>
                  <Text style={styles.actionQty}>{a.quantity}주</Text>
                  <Text style={styles.actionPrice}>@{formatNumber(a.price)}원</Text>
                </View>
              )
            })}
          </View>
          {/* 거래 근거 */}
          <View style={styles.reasonBox}>
            <Text style={[styles.statLabel, { marginBottom: 6 }]}>AI 판단 근거</Text>
            <View style={{ gap: 4 }}>
              {tradeActions.slice(0, 3).map((a, i) => (
                <View key={i} style={styles.reasonRow}>
                  <View style={styles.reasonDot} />
                  <Text style={styles.reasonText}>{a.reason}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  vsCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: alpha(palette.gray[800], 0.6),
    borderRadius: 16,
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.4),
    overflow: "hidden",
  },
  vsCol: { flex: 1, padding: 16, alignItems: "center" },
  vsColRight: { borderLeftWidth: 1, borderLeftColor: alpha(palette.gray[700], 0.4) },
  vsLabel: { fontSize: 10, fontWeight: "700", color: palette.gray[500], marginBottom: 4 },
  aiLabelRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 4 },
  vsRate: { fontSize: 24, fontWeight: "800" },
  vsValue: { fontSize: 11, color: palette.gray[400], marginTop: 4 },
  winBadge: { marginTop: 8, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999 },
  winText: { fontSize: 10, fontWeight: "700" },
  vsFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: alpha(palette.gray[900], 0.5),
    borderTopWidth: 1,
    borderTopColor: alpha(palette.gray[700], 0.3),
  },
  footerLabel: { fontSize: 12, color: palette.gray[500] },
  strategyCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: alpha(palette.gray[800], 0.4),
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.3),
  },
  strategyHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  strategyTitle: { fontSize: 12, fontWeight: "700", color: "#ffffff" },
  styleBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999 },
  styleBadgeText: { fontSize: 10, fontWeight: "700" },
  motto: { fontSize: 11, fontStyle: "italic", color: palette.gray[400], marginBottom: 12 },
  statBox: { flex: 1, backgroundColor: alpha(palette.gray[900], 0.5), borderRadius: 12, padding: 12, alignItems: "center" },
  statLabel: { fontSize: 10, color: palette.gray[500], marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: "700", color: "#ffffff" },
  section: { marginHorizontal: 20, marginTop: 16 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: palette.gray[400] },
  emptyText: { textAlign: "center", paddingVertical: 32, fontSize: 14, color: palette.gray[500] },
  holdingCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: alpha(palette.gray[800], 0.5),
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: alpha(palette.gray[700], 0.3),
  },
  holdingLeft: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1, minWidth: 0 },
  holdingIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: alpha(palette.purple[500], 0.15),
    alignItems: "center",
    justifyContent: "center",
  },
  holdingName: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  holdingSub: { fontSize: 10, color: palette.gray[500] },
  holdingRateRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 2 },
  holdingRate: { fontSize: 11, fontWeight: "700" },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1 },
  actionBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  actionBadgeText: { fontSize: 10, fontWeight: "700" },
  actionName: { flex: 1, fontSize: 11, fontWeight: "500", color: palette.gray[300] },
  actionQty: { fontSize: 10, color: palette.gray[400] },
  actionPrice: { fontSize: 10, color: palette.gray[500] },
  reasonBox: { marginTop: 12, backgroundColor: alpha(palette.gray[800], 0.3), borderRadius: 12, padding: 12 },
  reasonRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  reasonDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: palette.purple[400], marginTop: 6 },
  reasonText: { flex: 1, fontSize: 11, color: palette.gray[400] },
})
