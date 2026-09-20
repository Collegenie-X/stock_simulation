import { StyleSheet, Text, View } from "react-native"
import { ChevronLeft, ChevronRight, Play } from "lucide-react-native"
import { Gradient, PressableScale } from "@/components/ui"
import { alpha, palette } from "@/theme"

interface Props {
  isFirst: boolean
  isLast: boolean
  onPrev: () => void
  onNext: () => void
  onStart: () => void
}

/** 하단 이전/다음/시작 버튼 */
export function GuideNavigation({ isFirst, isLast, onPrev, onNext, onStart }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.row}>
        {!isFirst && (
          <PressableScale onPress={onPrev} scaleTo={0.98} style={styles.prev}>
            <ChevronLeft size={20} color={palette.gray[300]} />
            <Text style={styles.prevText}>이전</Text>
          </PressableScale>
        )}

        {!isLast ? (
          <PressableScale onPress={onNext} scaleTo={0.98} style={[styles.main, { backgroundColor: palette.blue[600] }]}>
            <Text style={styles.mainText}>다음</Text>
            <ChevronRight size={20} color="#ffffff" style={{ marginLeft: 8 }} />
          </PressableScale>
        ) : (
          <PressableScale onPress={onStart} scaleTo={0.98} style={styles.startWrap}>
            <Gradient dir="r" colors={[palette.blue[500], palette.cyan[500]]} style={styles.start}>
              <Play size={20} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.mainText}>게임 시작하기</Text>
            </Gradient>
          </PressableScale>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: 20, paddingVertical: 24, backgroundColor: "#191919", borderTopWidth: 1, borderTopColor: alpha("#ffffff", 0.05) },
  row: { flexDirection: "row", gap: 12 },
  prev: {
    paddingHorizontal: 32,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: palette.gray[600],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  prevText: { color: palette.gray[300], fontSize: 14, fontWeight: "500" },
  main: { flex: 1, height: 56, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  mainText: { color: "#ffffff", fontWeight: "700", fontSize: 18 },
  startWrap: { flex: 1, borderRadius: 12, overflow: "hidden", boxShadow: "0 10px 15px rgba(30,58,138,0.2)" },
  start: { height: 56, flexDirection: "row", alignItems: "center", justifyContent: "center" },
})
