/**
 * 패턴/전략 상세 하단 고정 버튼 (웹 page.tsx 의 `fixed bottom-0 … bg-gradient-to-t` 영역)
 */
import React from "react"
import { StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Gradient, PressableScale } from "@/components/ui"
import { alpha } from "@/theme"

interface Props {
  onList: () => void
  onPractice: () => void
  practiceLabel: string
  practiceIcon: React.ReactNode
  practiceColors: readonly string[]
}

export function DetailBottomBar({ onList, onPractice, practiceLabel, practiceIcon, practiceColors }: Props) {
  const insets = useSafeAreaInsets()
  return (
    <Gradient dir="t" colors={["#191919", "#191919", "rgba(25,25,25,0)"]} style={[styles.root, { paddingBottom: 16 + insets.bottom }]}>
      <View style={styles.row}>
        <PressableScale scaleTo={0.98} onPress={onList} style={styles.listBtn}>
          <Text style={styles.listText}>목록으로</Text>
        </PressableScale>
        <PressableScale scaleTo={0.98} onPress={onPractice} style={{ flex: 2 }}>
          <Gradient dir="r" colors={practiceColors} style={styles.practiceBtn}>
            {practiceIcon}
            <Text style={styles.practiceText}>{practiceLabel}</Text>
          </Gradient>
        </PressableScale>
      </View>
    </Gradient>
  )
}

const styles = StyleSheet.create({
  root: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 16 },
  row: { flexDirection: "row", gap: 12 },
  listBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#252525",
    borderWidth: 1,
    borderColor: alpha("#ffffff", 0.1),
    alignItems: "center",
    justifyContent: "center",
  },
  listText: { fontSize: 14, fontWeight: "500", color: "#ffffff" },
  practiceBtn: { height: 48, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  practiceText: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
})
