import React from "react"
import { StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Gradient } from "@/components/ui"

/** 하단 고정 CTA 영역 (웹 `fixed bottom-0 p-5 bg-gradient-to-t from-black via-black to-transparent`) */
export function ResultBottomBar({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets()
  return (
    <Gradient dir="t" colors={["#000000", "#000000", "rgba(0,0,0,0)"]} style={[styles.bar, { paddingBottom: 20 + insets.bottom }]}>
      <View style={styles.row}>{children}</View>
    </Gradient>
  )
}

const styles = StyleSheet.create({
  bar: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 20 },
  row: { flexDirection: "row", gap: 12 },
})
