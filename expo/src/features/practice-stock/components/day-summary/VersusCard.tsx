import { type ReactNode } from "react"
import { StyleSheet, Text, View } from "react-native"
import { ArrowDownRight, ArrowUpRight, Minus, Swords, User } from "lucide-react-native"
import { Gradient } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { formatNumber } from "@/lib/format"
import { rateColor } from "./helpers"

interface VersusCardProps {
  profitRate: number
  totalValue: number
  profitAmount: number
  holdingsCount: number
  totalDecisions: number
  aiName: string
  aiEmoji: string
  aiProfitRate: number
  aiTotalValue: number
  aiProfitAmount: number
  aiHoldingsCount: number
  aiTotalTrades: number
}

function Side({ win, winSide, accent, highlight, highlightDir, avatar, name, rate, rateText, value, amount, holdings, trades, right }: {
  win: boolean; winSide: "left" | "right"; accent: string; highlight: boolean; highlightDir: "br" | "bl"
  avatar: ReactNode; name: string; rate: number; rateText: string; value: number; amount: number
  holdings: number; trades: number; right?: boolean
}) {
  const isProfit = rate >= 0
  const c = rateColor(isProfit)
  return (
    <View style={[styles.side, right && styles.sideRight]}>
      {highlight && <Gradient dir={highlightDir} colors={[alpha(accent, 0.05), "transparent"]} style={StyleSheet.absoluteFill} />}
      {win && (
        <View style={[styles.win, winSide === "left" ? { left: 8 } : { right: 8 }, { backgroundColor: alpha(accent, 0.2) }]}>
          <Text style={[styles.winText, { color: winSide === "left" ? palette.yellow[400] : palette.purple[400] }]}>WIN</Text>
        </View>
      )}
      <View style={{ alignItems: "center" }}>
        {avatar}
        <Text style={[styles.name, { color: right ? palette.purple[400] : palette.blue[400] }]} numberOfLines={1}>{name}</Text>
        <Text style={[styles.rate, { color: c }]}>{rateText}</Text>
        <Text style={styles.value}>{formatNumber(value)}원</Text>
        <Text style={[styles.amount, { color: alpha(c, 0.7) }]}>
          {isProfit ? "+" : ""}{formatNumber(amount)}원
        </Text>
      </View>
      <View style={{ marginTop: 12, gap: 6 }}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>보유 종목</Text>
          <Text style={styles.statValue}>{holdings}개</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>총 거래</Text>
          <Text style={styles.statValue}>{trades}회</Text>
        </View>
      </View>
    </View>
  )
}

// ── VS 대결 카드 (유사 AI) ──
export function VersusCard({
  profitRate, totalValue, profitAmount, holdingsCount, totalDecisions,
  aiName, aiEmoji, aiProfitRate, aiTotalValue, aiProfitAmount, aiHoldingsCount, aiTotalTrades,
}: VersusCardProps) {
  const userWinningSimilar = profitRate >= aiProfitRate
  const diffSimilar = Math.abs(profitRate - aiProfitRate).toFixed(1)

  return (
    <Gradient dir="b" colors={[alpha(palette.gray[800], 0.8), alpha(palette.gray[900], 0.8)]} style={styles.card}>
      <View>
        <View style={{ flexDirection: "row" }}>
          {/* 나 (왼쪽) */}
          <Side
            win={userWinningSimilar} winSide="left" accent={palette.yellow[500]}
            highlight={userWinningSimilar} highlightDir="br"
            avatar={
              <View style={[styles.avatar, { backgroundColor: alpha(palette.blue[500], 0.2), borderColor: alpha(palette.blue[500], 0.4) }]}>
                <User size={24} color={palette.blue[400]} />
              </View>
            }
            name="나" rate={profitRate} rateText={`${profitRate >= 0 ? "+" : ""}${profitRate}%`}
            value={totalValue} amount={profitAmount} holdings={holdingsCount} trades={totalDecisions}
          />
          {/* 유사 AI (오른쪽) */}
          <Side
            right
            win={!userWinningSimilar && profitRate !== aiProfitRate} winSide="right" accent={palette.purple[500]}
            highlight={!userWinningSimilar} highlightDir="bl"
            avatar={
              <View style={[styles.avatar, { backgroundColor: alpha(palette.purple[500], 0.2), borderColor: alpha(palette.purple[500], 0.4) }]}>
                <Text style={styles.avatarEmoji}>{aiEmoji}</Text>
              </View>
            }
            name={aiName} rate={aiProfitRate} rateText={`${aiProfitRate >= 0 ? "+" : ""}${aiProfitRate.toFixed(1)}%`}
            value={aiTotalValue} amount={aiProfitAmount} holdings={aiHoldingsCount} trades={aiTotalTrades}
          />
        </View>

        {/* 중앙 VS 아이콘 */}
        <View pointerEvents="none" style={styles.vsWrap}>
          <Gradient dir="br" colors={[palette.yellow[500], palette.orange[500]]} style={styles.vs}>
            <Swords size={20} color="#ffffff" />
          </Gradient>
        </View>
      </View>

      {/* 차이 바 */}
      <View style={styles.diffBar}>
        {userWinningSimilar ? (
          <>
            <ArrowUpRight size={14} color={palette.yellow[400]} />
            <Text style={[styles.diffText, { color: palette.yellow[400] }]}>+{diffSimilar}%p 앞서는 중</Text>
          </>
        ) : profitRate === aiProfitRate ? (
          <>
            <Minus size={14} color={palette.gray[400]} />
            <Text style={[styles.diffText, { color: palette.gray[400] }]}>동률</Text>
          </>
        ) : (
          <>
            <ArrowDownRight size={14} color={palette.purple[400]} />
            <Text style={[styles.diffText, { color: palette.purple[400] }]}>-{diffSimilar}%p 뒤처지는 중</Text>
          </>
        )}
      </View>
    </Gradient>
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, borderWidth: 1, borderColor: alpha(palette.gray[700], 0.5), overflow: "hidden", marginBottom: 12 },
  side: { flex: 1, padding: 16 },
  sideRight: { borderLeftWidth: 1, borderLeftColor: alpha(palette.gray[700], 0.5) },
  win: { position: "absolute", top: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999, zIndex: 1 },
  winText: { fontSize: 10, fontWeight: "800" },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 8, borderWidth: 2 },
  avatarEmoji: { fontSize: 20, color: "#ffffff" },
  name: { fontSize: 12, fontWeight: "700", marginBottom: 2 },
  rate: { fontSize: 24, fontWeight: "800" },
  value: { fontSize: 11, color: palette.gray[400], marginTop: 4 },
  amount: { fontSize: 10, fontWeight: "600", marginTop: 2 },
  statRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  statLabel: { fontSize: 10, color: palette.gray[500] },
  statValue: { fontSize: 10, fontWeight: "700", color: palette.gray[300] },
  vsWrap: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center" },
  vs: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: palette.gray[900],
    boxShadow: "0 10px 15px rgba(249,115,22,0.4)",
  },
  diffBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: alpha(palette.gray[900], 0.6),
    borderTopWidth: 1,
    borderTopColor: alpha(palette.gray[700], 0.4),
  },
  diffText: { fontSize: 12, fontWeight: "700" },
})
