import { Pressable, Text } from "react-native"
import { Screen } from "@/components/layout"
import { palette } from "@/theme"

export function ResultNotFound({ onBack }: { onBack: () => void }) {
  return (
    <Screen bg="#000000" scroll={false} contentStyle={{ alignItems: "center", justifyContent: "center", gap: 16 }}>
      <Text style={{ color: palette.gray[400], fontSize: 16 }}>기록을 찾을 수 없습니다.</Text>
      <Pressable onPress={onBack} hitSlop={8}>
        <Text style={{ color: palette.blue[400], fontSize: 14 }}>← 돌아가기</Text>
      </Pressable>
    </Screen>
  )
}
