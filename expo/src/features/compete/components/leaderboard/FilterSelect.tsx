import { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { Check, ChevronDown } from "lucide-react-native"
import { BottomSheet } from "@/components/ui"
import { alpha, palette } from "@/theme"

interface FilterSelectProps {
  value: number
  options: readonly string[]
  onChange: (index: number) => void
}

/** 웹 <select> 대체 — 버튼 + 바텀시트 옵션 목록 */
export function FilterSelect({ value, options, onChange }: FilterSelectProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={styles.trigger}>
        <Text style={styles.triggerText}>{options[value]}</Text>
        <ChevronDown size={12} color={palette.gray[400]} />
      </Pressable>

      <BottomSheet visible={open} onClose={() => setOpen(false)} style={{ backgroundColor: "#1e1e1e" }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          {options.map((label, i) => (
            <Pressable
              key={i}
              onPress={() => {
                onChange(i)
                setOpen(false)
              }}
              style={({ pressed }) => [styles.option, pressed && { backgroundColor: alpha("#ffffff", 0.05) }]}
            >
              <Text style={[styles.optionText, i === value && { color: palette.yellow[300], fontWeight: "700" }]}>{label}</Text>
              {i === value && <Check size={16} color={palette.yellow[300]} />}
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </>
  )
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#252525",
    borderWidth: 1,
    borderColor: alpha("#ffffff", 0.1),
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  triggerText: { fontSize: 12, color: "#ffffff" },
  option: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, paddingHorizontal: 8, borderRadius: 10 },
  optionText: { fontSize: 14, color: palette.gray[300] },
})
