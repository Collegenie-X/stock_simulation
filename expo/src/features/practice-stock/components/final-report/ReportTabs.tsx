import { Pressable, StyleSheet, Text, View } from "react-native"
import { alpha, palette } from "@/theme"

interface ReportTabsProps<T extends string> {
  tabs: { key: T; label: string }[]
  active: T
  onChange: (key: T) => void
}

/** 리포트 상단 세그먼트 탭 — 최종·미니 리포트 공용 */
export function ReportTabs<T extends string>({ tabs, active, onChange }: ReportTabsProps<T>) {
  return (
    <View style={styles.wrap}>
      {tabs.map((t) => {
        const isActive = t.key === active
        return (
          <Pressable key={t.key} onPress={() => onChange(t.key)} style={[styles.tab, isActive && { backgroundColor: palette.gray[600] }]}>
            <Text style={[styles.text, { color: isActive ? "#ffffff" : palette.gray[500] }]}>{t.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", backgroundColor: alpha(palette.gray[800], 0.5), borderRadius: 12, padding: 2, gap: 2 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  text: { fontSize: 12, fontWeight: "700" },
})
