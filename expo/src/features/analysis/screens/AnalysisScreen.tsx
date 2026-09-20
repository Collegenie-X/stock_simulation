import { Suspense } from "react"
import { StyleSheet, Text, View } from "react-native"
import { useLocalSearchParams } from "expo-router"
import { Pulse } from "@/components/ui"
import { alpha } from "@/theme"
import AnalysisContent from "../components/AnalysisContent"

export default function AnalysisScreen() {
  // 웹의 "다시 해볼래!"(window.location.href 전체 새로고침)를 대체: retry 파라미터가 바뀌면 상태를 초기화
  const { retry } = useLocalSearchParams<{ retry?: string }>()
  return (
    <Suspense
      fallback={
        <View style={styles.fallback}>
          <Pulse>
            <Text style={styles.emoji}>🎮</Text>
          </Pulse>
          <Text style={styles.text}>로딩 중...</Text>
        </View>
      }
    >
      <AnalysisContent key={typeof retry === "string" ? retry : "initial"} />
    </Suspense>
  )
}

const styles = StyleSheet.create({
  fallback: { flex: 1, backgroundColor: "#000000", alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 60, color: "#ffffff" },
  text: { color: alpha("#ffffff", 0.5), fontSize: 14, marginTop: 16 },
})
