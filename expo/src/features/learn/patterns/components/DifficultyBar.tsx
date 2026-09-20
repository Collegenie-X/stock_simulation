import React from "react"
import { StyleSheet, Text, View } from "react-native"
import { palette } from "@/theme"

interface Props {
  value: number
  max?: number
  label: string
}

export function DifficultyBar({ value, max = 5, label }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.head}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {value}/{max}
        </Text>
      </View>
      <View style={styles.bars}>
        {Array.from({ length: max }).map((_, i) => (
          <View key={i} style={[styles.bar, { backgroundColor: i < value ? palette.blue[500] : palette.gray[700] }]} />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  head: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  label: { fontSize: 10, color: palette.gray[400] },
  value: { fontSize: 10, fontWeight: "700", color: "#ffffff" },
  bars: { flexDirection: "row", gap: 4 },
  bar: { height: 6, flex: 1, borderRadius: 9999 },
})
