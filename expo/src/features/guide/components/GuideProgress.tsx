import { StyleSheet, View } from "react-native"
import { palette } from "@/theme"

/** 상단 진행 표시 막대 */
export function GuideProgress({ total, current }: { total: number; current: number }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[styles.bar, { backgroundColor: index === current ? palette.blue[500] : index < current ? palette.blue[700] : palette.gray[700] }]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  bar: { height: 6, flex: 1, borderRadius: 3 },
})
