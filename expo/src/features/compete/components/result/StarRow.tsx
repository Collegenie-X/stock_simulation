import { View } from "react-native"
import { Star } from "lucide-react-native"
import { palette } from "@/theme"

export function StarRow({ count, max = 3, size = "lg" }: { count: number; max?: number; size?: "sm" | "lg" }) {
  const px = size === "lg" ? 40 : 16
  return (
    <View style={{ flexDirection: "row", gap: size === "lg" ? 8 : 2 }}>
      {Array.from({ length: max }).map((_, i) => {
        const on = i < count
        return <Star key={i} size={px} color={on ? palette.yellow[400] : palette.gray[700]} fill={on ? palette.yellow[400] : palette.gray[800]} />
      })}
    </View>
  )
}
