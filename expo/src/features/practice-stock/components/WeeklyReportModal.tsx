import { StyleSheet, Text, View } from "react-native"
import { SeriesChart } from "@/components/charts"
import { Button, CenterModal } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { LABELS } from "@/features/practice-stock/config"
import type { WeeklyReportModalProps } from "@/features/practice-stock/types"

export const WeeklyReportModal = ({
  isOpen,
  onClose,
  weekNumber,
  weeklyReturn,
  totalReturn,
  chartData,
}: WeeklyReportModalProps) => {
  if (!isOpen) return null

  const isProfit = weeklyReturn >= 0
  const chartColor = isProfit ? "#ef4444" : "#3b82f6"

  return (
    <CenterModal visible onClose={onClose} dismissable={false} backdropColor="rgba(0,0,0,0.85)" style={styles.dialog}>
      <View style={styles.content}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{LABELS.weeklyReport.title}</Text>
            <Text style={styles.week}>
              {weekNumber}{LABELS.weeklyReport.weekLabel}
            </Text>
          </View>
          <View style={[styles.emojiWrap, { backgroundColor: alpha(isProfit ? palette.red[500] : palette.blue[500], 0.2) }]}>
            <Text style={styles.emoji}>{isProfit ? "🔥" : "💧"}</Text>
          </View>
        </View>

        {/* 수익률 카드 */}
        <View style={styles.cards}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>{LABELS.weeklyReport.weeklyReturn}</Text>
            <Text style={[styles.cardValue, { color: isProfit ? palette.red[500] : palette.blue[500] }]}>
              {isProfit ? "+" : ""}
              {weeklyReturn}%
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>{LABELS.weeklyReport.totalReturn}</Text>
            <Text style={[styles.cardValue, { color: totalReturn >= 0 ? palette.red[500] : palette.blue[500] }]}>
              {totalReturn >= 0 ? "+" : ""}
              {totalReturn}%
            </Text>
          </View>
        </View>

        {/* 자산 흐름도 */}
        <View style={{ marginBottom: 24 }}>
          <Text style={styles.chartTitle}>{LABELS.weeklyReport.chartTitle}</Text>
          <View style={styles.chartBox}>
            <SeriesChart
              data={chartData}
              height={174}
              series={[{ key: "value", type: "area", color: chartColor, strokeWidth: 3, fillOpacity: 0.3 }]}
              margin={{ top: 6, right: 4, bottom: 4, left: 4 }}
            />
          </View>
        </View>

        <Button onPress={onClose} style={styles.button} textStyle={styles.buttonText}>
          {LABELS.actions.nextWeek}
        </Button>
      </View>
    </CenterModal>
  )
}

const styles = StyleSheet.create({
  dialog: { backgroundColor: "#1E1E1E", maxWidth: 448, borderRadius: 24, borderWidth: 1, borderColor: palette.gray[800] },
  content: { padding: 24 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "700", color: "#ffffff" },
  week: { fontSize: 14, color: palette.gray[400] },
  emojiWrap: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 24, color: "#ffffff" },
  cards: { flexDirection: "row", gap: 16, marginBottom: 24 },
  card: { flex: 1, backgroundColor: alpha(palette.gray[800], 0.5), borderRadius: 16, padding: 16 },
  cardLabel: { fontSize: 12, color: palette.gray[400], marginBottom: 4 },
  cardValue: { fontSize: 20, fontWeight: "700" },
  chartTitle: { fontSize: 14, fontWeight: "700", color: palette.gray[300], marginBottom: 12 },
  chartBox: {
    height: 192,
    backgroundColor: alpha(palette.gray[800], 0.3),
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: alpha(palette.gray[800], 0.5),
  },
  button: { width: "100%", height: 56, backgroundColor: palette.blue[600], borderRadius: 16 },
  buttonText: { fontSize: 18, fontWeight: "700", color: "#ffffff" },
})
