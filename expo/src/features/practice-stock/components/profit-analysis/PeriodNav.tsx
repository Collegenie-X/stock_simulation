import { Pressable, StyleSheet, Text, View } from "react-native"
import { ChevronLeft, ChevronRight } from "lucide-react-native"
import { palette } from "@/theme"
import { LABELS } from "@/features/practice-stock/config"
import type { ProfitPeriod } from "@/features/practice-stock/types"

interface PeriodNavProps {
  activePeriod: ProfitPeriod
  periodIndex: number
  periodLabel: string
  onChangePeriod: (period: ProfitPeriod) => void
  onPrev: () => void
  onNext: () => void
  canGoPrev: boolean
  canGoNext: boolean
}

export const PeriodNav = ({
  activePeriod,
  periodLabel,
  onChangePeriod,
  onPrev,
  onNext,
  canGoPrev,
  canGoNext,
}: PeriodNavProps) => {
  const periods = LABELS.profitAnalysis.periods

  return (
    <View style={styles.wrap}>
      {/* 기간 탭 */}
      <View style={styles.tabs}>
        {periods.map((period) => {
          const active = activePeriod === period
          return (
            <Pressable
              key={period}
              onPress={() => onChangePeriod(period as ProfitPeriod)}
              style={[styles.tab, active && { backgroundColor: palette.gray[700] }]}
            >
              <Text style={[styles.tabText, { color: active ? "#ffffff" : palette.gray[500] }]}>{period}</Text>
            </Pressable>
          )
        })}
      </View>

      {/* 기간 네비게이터 */}
      <View style={styles.nav}>
        <Pressable onPress={onPrev} disabled={!canGoPrev} hitSlop={8} style={styles.arrow}>
          <ChevronLeft size={20} color={canGoPrev ? palette.gray[300] : palette.gray[700]} />
        </Pressable>
        <Text style={styles.label}>{periodLabel}</Text>
        <Pressable onPress={onNext} disabled={!canGoNext} hitSlop={8} style={styles.arrow}>
          <ChevronRight size={20} color={canGoNext ? palette.gray[300] : palette.gray[700]} />
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { borderBottomWidth: 1, borderBottomColor: palette.gray[800] },
  tabs: { flexDirection: "row", paddingHorizontal: 20, paddingTop: 12, gap: 4 },
  tab: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 9999 },
  tabText: { fontSize: 14, fontWeight: "600" },
  nav: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, paddingVertical: 12 },
  arrow: { padding: 4, borderRadius: 9999 },
  label: { fontSize: 14, fontWeight: "700", color: "#ffffff", minWidth: 120, textAlign: "center" },
})
