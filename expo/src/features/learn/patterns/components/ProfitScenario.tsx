import React from "react"
import { StyleSheet, Text, View } from "react-native"
import { DollarSign, ShieldAlert, TrendingUp } from "lucide-react-native"
import { type ProfitScenario as ProfitScenarioType } from "@/data/chart-patterns"
import { Gradient } from "@/components/ui"
import { formatKRW, formatPrice } from "@/lib/format"
import { alpha, palette } from "@/theme"

interface ProfitScenarioProps {
  scenario: ProfitScenarioType
}

export function ProfitScenario({ scenario }: ProfitScenarioProps) {
  const { stock, entryPrice, shares, targetPrice, stopLoss, entryNote, signalType } = scenario

  const investAmount = entryPrice * shares
  const isBuy = signalType === "buy"

  const profit = isBuy ? (targetPrice - entryPrice) * shares : (entryPrice - targetPrice) * shares
  const loss = isBuy ? (entryPrice - stopLoss) * shares : (stopLoss - entryPrice) * shares

  const profitPct = isBuy ? ((targetPrice - entryPrice) / entryPrice) * 100 : ((entryPrice - targetPrice) / entryPrice) * 100
  const lossPct = isBuy ? ((entryPrice - stopLoss) / entryPrice) * 100 : ((stopLoss - entryPrice) / entryPrice) * 100

  const riskReward = loss > 0 ? (profit / loss).toFixed(1) : "-"

  const rewardBarWidth = Math.min((profit / (profit + loss)) * 100, 100)

  const targetColor = isBuy ? palette.green[400] : palette.red[400]
  const targetBase = isBuy ? palette.green[500] : palette.red[500]
  const rr = Number(riskReward)
  const rrColor = rr >= 2 ? palette.green : rr >= 1.5 ? palette.yellow : palette.red
  const adviceColor = rr >= 2 ? palette.green : palette.yellow

  return (
    <View style={{ gap: 12 }}>
      {/* 매매 진입 정보 */}
      <View style={[styles.panel, { borderColor: alpha(palette.indigo[500], 0.2) }]}>
        <View style={styles.panelHead}>
          <DollarSign size={16} color={palette.indigo[400]} />
          <Text style={styles.panelTitle}>투자 시나리오 — {stock}</Text>
        </View>

        {/* 진입 조건 */}
        <View style={styles.entry}>
          <Text style={styles.tiny}>진입 조건</Text>
          <Text style={styles.entryText}>{entryNote}</Text>
        </View>

        {/* 3열 정보 */}
        <View style={styles.grid3}>
          <View style={styles.cell}>
            <Text style={styles.tiny}>{isBuy ? "매수가" : "매도가"}</Text>
            <Text style={styles.cellValue}>{formatPrice(entryPrice)}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.tiny}>수량</Text>
            <Text style={styles.cellValue}>{shares}주</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.tiny}>투자금</Text>
            <Text style={styles.cellValue}>{formatKRW(investAmount)}</Text>
          </View>
        </View>

        {/* 목표가 & 손절가 */}
        <View style={styles.grid2}>
          <View style={[styles.outcome, { backgroundColor: alpha(targetBase, 0.1), borderColor: alpha(targetBase, 0.3) }]}>
            <View style={styles.outcomeHead}>
              <TrendingUp size={12} color={targetColor} />
              <Text style={[styles.outcomeLabel, { color: targetColor }]}>목표가 달성 시</Text>
            </View>
            <Text style={[styles.outcomeValue, { color: targetColor }]}>+{formatKRW(profit)}</Text>
            <Text style={[styles.outcomeSub, { color: targetColor }]}>
              {formatPrice(targetPrice)} (+{profitPct.toFixed(1)}%)
            </Text>
          </View>

          <View style={[styles.outcome, { backgroundColor: alpha(palette.red[500], 0.05), borderColor: alpha(palette.red[900], 0.3) }]}>
            <View style={styles.outcomeHead}>
              <ShieldAlert size={12} color={alpha(palette.red[400], 0.7)} />
              <Text style={[styles.outcomeLabel, { color: alpha(palette.red[400], 0.7) }]}>손절가 도달 시</Text>
            </View>
            <Text style={[styles.outcomeValue, { color: alpha(palette.red[400], 0.8) }]}>-{formatKRW(loss)}</Text>
            <Text style={[styles.outcomeSub, { color: alpha(palette.red[400], 0.7) }]}>
              {formatPrice(stopLoss)} (-{lossPct.toFixed(1)}%)
            </Text>
          </View>
        </View>
      </View>

      {/* 리스크/리워드 비율 */}
      <View style={styles.panel}>
        <View style={styles.rrHead}>
          <Text style={styles.rrLabel}>리스크 대비 수익 비율</Text>
          <View style={[styles.rrPill, { backgroundColor: alpha(rrColor[500], 0.15) }]}>
            <Text style={[styles.rrPillText, { color: rrColor[400] }]}>1 : {riskReward}</Text>
          </View>
        </View>

        {/* 바 시각화 */}
        <View style={styles.rrTrack}>
          <Gradient
            dir="r"
            colors={[palette.green[600], palette.green[400]]}
            style={{ height: "100%", borderRadius: 9999, width: `${isFinite(rewardBarWidth) ? Math.max(0, rewardBarWidth) : 0}%` }}
          />
        </View>
        <View style={styles.rrFoot}>
          <Text style={[styles.tinyPlain, { color: palette.red[400] }]}>손실 {lossPct.toFixed(1)}%</Text>
          <Text style={[styles.tinyPlain, { color: targetColor }]}>수익 {profitPct.toFixed(1)}%</Text>
        </View>

        {/* 조언 */}
        <View style={[styles.advice, { backgroundColor: alpha(adviceColor[500], 0.05), borderColor: alpha(adviceColor[500], 0.15) }]}>
          <Text style={[styles.adviceText, { color: adviceColor[400] }]}>
            {rr >= 2
              ? `✅ 리스크 1에 수익 ${riskReward}! 좋은 비율이에요. 손절가를 지키면 기댓값이 플러스예요.`
              : `⚠️ 리스크 1에 수익 ${riskReward}. 손절가를 반드시 지켜야 해요.`}
          </Text>
        </View>
      </View>

      {/* 실제 사례 해설 */}
      <View style={[styles.panel, { padding: 14 }]}>
        <Text style={[styles.tiny, { marginBottom: 8 }]}>📖 어떻게 수익이 나는 걸까요?</Text>
        <View style={{ gap: 6 }}>
          <View style={styles.explainRow}>
            <Text style={[styles.explainNo, { color: palette.indigo[400] }]}>①</Text>
            <Text style={styles.explainText}>
              {isBuy
                ? `패턴 완성 시 ${formatPrice(entryPrice)}에 ${shares}주 매수 → 투자금 ${formatKRW(investAmount)}`
                : `패턴 완성 시 ${formatPrice(entryPrice)}에 ${shares}주 매도 → 투자금 ${formatKRW(investAmount)}`}
            </Text>
          </View>
          <View style={styles.explainRow}>
            <Text style={[styles.explainNo, { color: palette.indigo[400] }]}>②</Text>
            <Text style={styles.explainText}>
              {isBuy
                ? `목표가 ${formatPrice(targetPrice)} 도달 시 매도 → 수익 +${formatKRW(profit)}`
                : `목표가 ${formatPrice(targetPrice)} 도달 시 매수 → 수익 +${formatKRW(profit)}`}
            </Text>
          </View>
          <View style={styles.explainRow}>
            <Text style={[styles.explainNo, { color: palette.red[400] }]}>③</Text>
            <Text style={styles.explainText}>
              반대로 가면 손절가 {formatPrice(stopLoss)} 에서 손절 → 최대 손실 -{formatKRW(loss)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  panel: { backgroundColor: "#1a1a2e", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05) },
  panelHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  panelTitle: { fontSize: 12, fontWeight: "700", color: palette.indigo[400], flexShrink: 1 },
  entry: { backgroundColor: alpha("#000000", 0.3), borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12 },
  tiny: { fontSize: 9, color: palette.gray[500], marginBottom: 2 },
  tinyPlain: { fontSize: 9 },
  entryText: { fontSize: 12, fontWeight: "500", color: "#ffffff" },
  grid3: { flexDirection: "row", gap: 8, marginBottom: 12 },
  cell: { flex: 1, backgroundColor: alpha("#000000", 0.2), borderRadius: 8, padding: 8, alignItems: "center" },
  cellValue: { fontSize: 12, fontWeight: "700", color: "#ffffff" },
  grid2: { flexDirection: "row", gap: 8 },
  outcome: { flex: 1, borderRadius: 12, padding: 12, borderWidth: 1 },
  outcomeHead: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 6 },
  outcomeLabel: { fontSize: 9, fontWeight: "700" },
  outcomeValue: { fontSize: 14, fontWeight: "700" },
  outcomeSub: { fontSize: 10, marginTop: 2 },
  rrHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  rrLabel: { fontSize: 10, color: palette.gray[400] },
  rrPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999 },
  rrPillText: { fontSize: 12, fontWeight: "700" },
  rrTrack: { height: 12, borderRadius: 9999, overflow: "hidden", backgroundColor: alpha(palette.red[900], 0.3), flexDirection: "row" },
  rrFoot: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  advice: { marginTop: 12, borderRadius: 8, padding: 10, borderWidth: 1 },
  adviceText: { fontSize: 10, lineHeight: 16 },
  explainRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  explainNo: { fontSize: 10, marginTop: 1 },
  explainText: { flex: 1, fontSize: 10, lineHeight: 14, color: palette.gray[300] },
})
