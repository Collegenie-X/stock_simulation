import { StyleSheet, Text, View } from "react-native"
import { alpha, palette } from "@/theme"
import { formatNumber } from "@/lib/format"
import type { TradeRecord } from "@/features/practice-stock/types"
import type { CompanyProfile } from "./CompanyCard"

interface TradeDetailCardProps {
  trade: TradeRecord & { investmentNote?: string }
  profile?: CompanyProfile
}

export const TradeDetailCard = ({ trade, profile }: TradeDetailCardProps) => {
  const isBuy = trade.action === "buy"
  const hasProfit = !isBuy && trade.profit !== undefined
  // 매도 수익 판단 (수익이면 빨강, 손실이면 파랑)
  const isProfit = (trade.profit ?? 0) >= 0
  const note = trade.investmentNote ?? profile?.investmentThesis

  return (
    <View style={styles.card}>
      {/* 상단 행: 기업 + 액션 + 금액 */}
      <View style={styles.top}>
        {/* 기업 이모지 */}
        <View style={styles.emojiWrap}>
          <Text style={styles.emoji}>{profile?.emoji ?? "📈"}</Text>
        </View>

        {/* 기업명 + 섹터 */}
        <View style={styles.info}>
          <View style={styles.row}>
            <Text style={styles.name} numberOfLines={1}>{trade.stockName}</Text>
            {profile ? <Text style={styles.sub} numberOfLines={1}>{profile.subSector}</Text> : null}
          </View>
          <View style={[styles.row, { gap: 6, marginTop: 2 }]}>
            {/* 매수/매도 배지: 한국 주식 컨벤션 - 매수=빨강, 매도=파랑 */}
            <View style={[styles.badge, { backgroundColor: alpha(isBuy ? palette.red[500] : palette.blue[500], 0.2) }]}>
              <Text style={[styles.badgeText, { color: isBuy ? palette.red[400] : palette.blue[400] }]}>
                {isBuy ? "매수" : "매도"}
              </Text>
            </View>
            <Text style={styles.sub}>
              {trade.quantity}주 × {formatNumber(trade.price)}원
            </Text>
          </View>
        </View>

        {/* 거래 금액 & 수익 표시 */}
        <View style={styles.right}>
          {isBuy ? (
            /* 매수: 지출 금액을 중립 회색으로 표시 (- 기호만) */
            <Text style={styles.amount}>-{formatNumber(trade.totalAmount)}원</Text>
          ) : (
            /* 매도: 수령 금액(회색) + 수익/손실(색상) */
            <>
              <Text style={styles.amount}>+{formatNumber(trade.totalAmount)}원</Text>
              {hasProfit && (
                <Text style={[styles.profit, { color: isProfit ? palette.red[400] : palette.blue[400] }]}>
                  {isProfit ? "+" : "-"}
                  {formatNumber(Math.abs(trade.profit!))}원
                  {trade.profitRate !== undefined && (
                    <Text style={{ color: alpha(isProfit ? palette.red[400] : palette.blue[400], 0.8) }}>
                      {" "}({isProfit ? "+" : ""}{trade.profitRate.toFixed(1)}%)
                    </Text>
                  )}
                </Text>
              )}
            </>
          )}
        </View>
      </View>

      {/* 구분선 + 메모 */}
      <View style={styles.bottom}>
        {!!note && <Text style={styles.note}>📋 {note}</Text>}

        {/* 기업 투자 지표 요약 */}
        {profile && (
          <View style={[styles.row, { gap: 12, marginTop: 8 }]}>
            <View style={[styles.row, { gap: 4 }]}>
              <Text style={styles.metricLabel}>목표가</Text>
              <Text style={styles.metricValue}>{formatNumber(profile.targetPrice)}원</Text>
            </View>
            <Text style={styles.dot}>·</Text>
            <View style={[styles.row, { gap: 4 }]}>
              <Text style={styles.metricLabel}>PER</Text>
              <Text style={styles.metricValue}>{profile.per}</Text>
            </View>
            {profile.dividendYield > 0 && (
              <>
                <Text style={styles.dot}>·</Text>
                <View style={[styles.row, { gap: 4 }]}>
                  <Text style={styles.metricLabel}>배당</Text>
                  <Text style={styles.metricValue}>{profile.dividendYield}%</Text>
                </View>
              </>
            )}
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#252525", borderRadius: 16, padding: 16, marginBottom: 8 },
  top: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  emojiWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: palette.gray[700], alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 18, color: "#ffffff" },
  info: { flex: 1, minWidth: 0 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { fontSize: 14, fontWeight: "700", color: "#ffffff", flexShrink: 1 },
  sub: { fontSize: 12, color: palette.gray[500] },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999 },
  badgeText: { fontSize: 12, fontWeight: "700" },
  right: { alignItems: "flex-end", flexShrink: 0 },
  amount: { fontSize: 14, fontWeight: "700", color: palette.gray[300] },
  profit: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  bottom: { borderTopWidth: 1, borderTopColor: alpha(palette.gray[700], 0.5), paddingTop: 12 },
  note: { fontSize: 12, lineHeight: 19, color: palette.gray[500] },
  metricLabel: { fontSize: 12, color: palette.gray[600] },
  metricValue: { fontSize: 12, fontWeight: "600", color: palette.gray[400] },
  dot: { fontSize: 12, color: palette.gray[700] },
})
