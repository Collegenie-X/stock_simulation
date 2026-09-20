import { useEffect, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { Float, GlowOrb, ProgressBar, Pulse } from "@/components/ui"
import { storage } from "@/lib/storage"
import { palette } from "@/theme"
import { AnimatedChart } from "./AnimatedChart"

export default function SplashScreen() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 4
      })
    }, 70)

    const timer = setTimeout(() => {
      const done = storage.getOnboardingStatus()
      router.replace(done ? "/home" : "/onboarding")
    }, 2500)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [router])

  return (
    <View style={styles.root}>
      {/* 배경 애니메이션 차트 */}
      <View style={[StyleSheet.absoluteFill, { opacity: 0.3 }]}>
        <AnimatedChart />
      </View>

      {/* 글로우 (웹의 blur-[100px] → 부드러운 방사형 그라데이션) */}
      <Pulse duration={3000} min={0.7} style={styles.glowWrap}>
        <GlowOrb color={palette.green[500]} size={520} opacity={0.22} style={{ position: "relative" }} />
      </Pulse>

      {/* 메인 콘텐츠 */}
      <View style={styles.content}>
        <Float>
          <Text style={styles.emoji}>📈</Text>
        </Float>
        <Text style={styles.title}>파도를 타라</Text>
        <Text style={styles.subtitle}>차트로 배우는 실전 투자</Text>
        <Text style={styles.desc}>AI와 대결하며 성장하는 투자 교육</Text>
      </View>

      {/* 프로그레스 바 */}
      <View style={styles.progress}>
        <ProgressBar value={progress} height={4} trackColor="#1a1a1a" gradient={[palette.green[500], palette.emerald[400]]} />
        <Text style={styles.progressText}>{progress < 100 ? "로딩 중..." : "준비 완료!"}</Text>
      </View>

      <Text style={styles.footer}>v2.0 · 100% 무료 · 회원가입 불필요</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000000", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  glowWrap: { position: "absolute", top: "8%", alignSelf: "center" },
  content: { alignItems: "center", paddingHorizontal: 24 },
  emoji: { fontSize: 90, lineHeight: 110, marginBottom: 24, color: "#ffffff" },
  title: { fontSize: 36, fontWeight: "900", color: "#ffffff", letterSpacing: -0.9, marginBottom: 8 },
  subtitle: { fontSize: 18, fontWeight: "700", color: palette.green[400], marginBottom: 4 },
  desc: { fontSize: 14, color: palette.gray[500] },
  progress: { marginTop: 48, width: 176 },
  progressText: { fontSize: 10, color: palette.gray[600], textAlign: "center", marginTop: 8 },
  footer: { position: "absolute", bottom: 32, fontSize: 10, color: palette.gray[700] },
})
