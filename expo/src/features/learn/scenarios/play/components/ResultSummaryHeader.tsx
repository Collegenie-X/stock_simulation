import { StyleSheet, Text, View } from "react-native"
import { Flame, Trophy } from "lucide-react-native"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"

const GRADE_COLOR: Record<string, string> = {
  S: palette.yellow[400],
  A: palette.green[400],
  B: palette.cyan[400],
  C: palette.gray[400],
}

interface Props {
  subtitle: string
  profitMsg: { emoji: string; title: string; message: string }
  initTotal: number
  total: number
  rate: number
  gradeLabel: string
  gradeTitle: string
  totalScore: number
  score: number
  profitBonus: number
  bestCombo: number
  beaten: number
  aiCount: number
}

/** 상단 결과 헤더 - 다크 테마 통일 */
export function ResultSummaryHeader({ subtitle, profitMsg, initTotal, total, rate, gradeLabel, gradeTitle, totalScore, score, profitBonus, bestCombo, beaten, aiCount }: Props) {
  const rateColor = rate >= 0 ? palette.red[400] : palette.blue[400]
  return (
    <View style={styles.wrap}>
      <Text style={{ fontSize: 12, color: palette.gray[500], marginBottom: 12 }}>{subtitle}</Text>

      {/* Profit message */}
      <View style={styles.profit}>
        <Text style={{ fontSize: 24, color: "#ffffff" }}>{profitMsg.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#ffffff" }}>{profitMsg.title}</Text>
          <Text style={{ fontSize: 10, color: palette.gray[400] }}>{profitMsg.message}</Text>
        </View>
      </View>

      {/* 총 자산 */}
      <View style={styles.totalRow}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, color: palette.gray[500], marginBottom: 4 }}>시작 {formatNumber(initTotal)}원 →</Text>
          <Text style={{ fontSize: 30, fontWeight: "900", color: "#ffffff" }}>{formatNumber(Math.round(total))}원</Text>
          <Text style={{ fontSize: 18, fontWeight: "700", marginTop: 4, color: rateColor }}>
            {rate >= 0 ? "+" : ""}
            {rate.toFixed(2)}%
            <Text style={{ fontSize: 12, color: palette.gray[500], fontWeight: "700" }}>
              {"  "}({rate >= 0 ? "+" : ""}
              {formatNumber(Math.round(total - initTotal))}원)
            </Text>
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 36, fontWeight: "900", color: GRADE_COLOR[gradeLabel] ?? palette.gray[500] }}>{gradeLabel}</Text>
          <Text style={{ fontSize: 10, color: palette.gray[500] }}>{gradeTitle}</Text>
        </View>
      </View>

      {/* 점수 카드 */}
      <View style={styles.scoreCard}>
        <View style={styles.scoreTop}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Trophy size={16} color={palette.yellow[500]} />
            <Text style={{ fontSize: 12, fontWeight: "700", color: palette.gray[400] }}>최종 점수</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: "900", color: "#ffffff" }}>
            {totalScore}
            <Text style={{ fontSize: 12, color: palette.gray[500] }}> 점</Text>
          </Text>
        </View>
        <View style={styles.scoreGrid}>
          <View style={{ flex: 1 }}>
            <Text style={styles.tiny}>판단 점수</Text>
            <Text style={styles.val}>{score}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tiny}>수익 보너스</Text>
            <Text style={[styles.val, { color: profitBonus >= 0 ? palette.red[400] : palette.blue[400] }]}>
              {profitBonus >= 0 ? "+" : ""}
              {profitBonus}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tiny}>최고 콤보</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
              <Flame size={12} color={palette.orange[400]} />
              <Text style={styles.val}>{bestCombo}</Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tiny}>AI 격파</Text>
            <Text style={styles.val}>
              {beaten}/{aiCount}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 24, backgroundColor: "#1a1a1a", borderBottomWidth: 1, borderBottomColor: alpha("#ffffff", 0.05) },
  profit: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16, backgroundColor: "#252525", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: alpha("#ffffff", 0.05) },
  totalRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16 },
  scoreCard: { backgroundColor: "#252525", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05) },
  scoreTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  scoreGrid: { flexDirection: "row", gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: alpha("#ffffff", 0.05) },
  tiny: { fontSize: 9, color: palette.gray[500] },
  val: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
})
