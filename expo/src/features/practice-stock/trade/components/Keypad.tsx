import { Pressable, StyleSheet, Text, View } from "react-native"
import { ArrowLeft } from "lucide-react-native"
import { playClickSound } from "@/lib/sound"

interface KeypadProps {
  onInput: (val: string) => void
  onDelete: () => void
}

const KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, "00", 0] as const

/** 수량 입력용 커스텀 키패드 (웹 trade/page.tsx 의 Keypad) */
export default function Keypad({ onInput, onDelete }: KeypadProps) {
  return (
    <View style={styles.grid}>
      {KEYS.map((num) => (
        <Pressable
          key={num}
          onPress={() => {
            playClickSound()
            onInput(num.toString())
          }}
          style={({ pressed }) => [styles.key, pressed && styles.pressed]}
        >
          <Text style={styles.keyText}>{num}</Text>
        </Pressable>
      ))}
      <Pressable
        accessibilityLabel="지우기"
        onPress={() => {
          playClickSound()
          onDelete()
        }}
        style={({ pressed }) => [styles.key, pressed && styles.pressed]}
      >
        <ArrowLeft size={24} color="#ffffff" />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 32, rowGap: 8 },
  key: { width: "33.333%", height: 48, alignItems: "center", justifyContent: "center" },
  pressed: { opacity: 0.6, transform: [{ scale: 0.95 }] },
  keyText: { fontSize: 24, fontWeight: "500", color: "#ffffff" },
})
