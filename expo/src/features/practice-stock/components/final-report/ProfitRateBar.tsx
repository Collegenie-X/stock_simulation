import { StyleSheet, View } from "react-native"
import { ChevronRight } from "lucide-react-native"
import { ProgressBar } from "@/components/ui"
import { alpha, palette } from "@/theme"

/** 종목 카드 하단 미니 수익률 바 + 이동 화살표 */
export function ProfitRateBar({ percent, isProfit }: { percent: number; isProfit: boolean }) {
  return (
    <View style={styles.row}>
      <ProgressBar
        value={percent}
        height={6}
        color={isProfit ? palette.red[400] : palette.blue[400]}
        trackColor={alpha(palette.gray[700], 0.3)}
        style={{ flex: 1 }}
      />
      <ChevronRight size={14} color={palette.gray[600]} />
    </View>
  )
}

const styles = StyleSheet.create({
  row: { marginTop: 10, flexDirection: "row", alignItems: "center", gap: 8 },
})
