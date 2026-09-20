import { Text, View } from "react-native"
import { palette } from "@/theme"

export function EventBullets({ description }: { description: string }) {
  // 웹의 lookbehind 정규식(/(?<=[.!?])\s+|(?<=다\.)\s*|…/)과 동일한 분리 규칙을 lookbehind 없이 구현
  const bullets = description
    .replace(/([.!?])\s+/g, "$1\n")
    .replace(/(다\.|요\.|요!|다!)\s*/g, "$1\n")
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  if (bullets.length <= 1) {
    return <Text style={{ fontSize: 11, color: palette.gray[300], lineHeight: 18 }}>{description}</Text>
  }

  return (
    <View style={{ gap: 4 }}>
      {bullets.map((b, i) => (
        <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", gap: 6 }}>
          <Text style={{ fontSize: 8, color: palette.gray[500], marginTop: 4 }}>●</Text>
          <Text style={{ flex: 1, fontSize: 11, color: palette.gray[300], lineHeight: 15 }}>{b}</Text>
        </View>
      ))}
    </View>
  )
}
