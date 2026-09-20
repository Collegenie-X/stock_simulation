import { View } from "react-native"
import { Star } from "lucide-react-native"
import { palette } from "@/theme"

export function StarRow({ count, max = 3 }: { count: number; max?: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} size={14} color={i < count ? palette.yellow[400] : palette.gray[700]} fill={i < count ? palette.yellow[400] : "none"} />
      ))}
    </View>
  )
}
