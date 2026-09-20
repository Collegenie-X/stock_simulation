import { View } from "react-native"
import { Star } from "lucide-react-native"
import { palette } from "@/theme"

export function DifficultyStars({ level }: { level: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          size={12}
          color={i <= level ? palette.yellow[400] : palette.gray[600]}
          fill={i <= level ? palette.yellow[400] : "none"}
        />
      ))}
    </View>
  )
}
