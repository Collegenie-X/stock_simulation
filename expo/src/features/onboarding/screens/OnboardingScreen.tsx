import { useCallback, useRef, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { useRouter, type Href } from "expo-router"
import { ChevronRight } from "lucide-react-native"
import { Screen } from "@/components/layout"
import { FadeIn, FadeUp, GlowOrb, Gradient, PressableScale } from "@/components/ui"
import { storage } from "@/lib/storage"
import { alpha, palette } from "@/theme"
import { SlidePreview } from "../components/SlidePreview"
import { SLIDES, LABELS, SWIPE_THRESHOLD, REDIRECT_PATH, ACCENT_THEME } from "../config"

const slides = SLIDES

// ─── 메인 컴포넌트 ──────────────────────────────────────────
export default function OnboardingScreen() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const touchX = useRef(0)
  const touchEndX = useRef(0)

  const handleTouchStart = (x: number) => {
    touchX.current = x
    touchEndX.current = x
  }
  const handleTouchMove = (x: number) => {
    touchEndX.current = x
  }
  const handleTouchEnd = () => {
    if (touchX.current - touchEndX.current > SWIPE_THRESHOLD && current < slides.length - 1) setCurrent((c) => c + 1)
    if (touchX.current - touchEndX.current < -SWIPE_THRESHOLD && current > 0) setCurrent((c) => c - 1)
  }

  const finish = useCallback(() => {
    storage.setOnboardingComplete()
    router.replace(REDIRECT_PATH as Href)
  }, [router])

  const s = slides[current]
  const theme = ACCENT_THEME[s.accent]
  const isLast = current === slides.length - 1

  return (
    <Screen bg="#000000" contentStyle={styles.content}>
      {/* 배경 글로우 (웹의 blur-[120px] → 부드러운 방사형 그라데이션) */}
      <FadeIn key={`glow-${current}`} duration={700} style={styles.glowWrap}>
        <GlowOrb color={theme.glow} size={560} opacity={0.2} style={{ position: "relative" }} />
      </FadeIn>

      {/* 상단 */}
      <View style={styles.top}>
        <Text style={styles.counter}>
          {current + 1} / {slides.length}
        </Text>
        {!isLast && (
          <Pressable onPress={finish} hitSlop={12}>
            <Text style={styles.skip}>{LABELS.skip}</Text>
          </Pressable>
        )}
      </View>

      {/* 슬라이드 */}
      <View
        style={styles.slide}
        onTouchStart={(e) => handleTouchStart(e.nativeEvent.pageX)}
        onTouchMove={(e) => handleTouchMove(e.nativeEvent.pageX)}
        onTouchEnd={handleTouchEnd}
      >
        <View style={styles.slideInner} key={current}>
          <FadeUp duration={400} style={styles.badgeWrap}>
            <Text style={[styles.badge, { color: s.accentColor }]}>{s.badge}</Text>
          </FadeUp>

          <FadeUp duration={400} delay={80}>
            <Text style={styles.title}>{s.title}</Text>
          </FadeUp>

          <FadeUp duration={400} delay={160}>
            <Text style={styles.desc}>{s.desc}</Text>
          </FadeUp>

          <FadeUp duration={500} delay={240}>
            <SlidePreview idx={current} trigger={current} />
          </FadeUp>
        </View>
      </View>

      {/* 인디케이터 */}
      <View style={styles.indicators}>
        {slides.map((_, i) => (
          <Pressable key={i} onPress={() => setCurrent(i)} hitSlop={8}>
            <View style={[styles.indicator, i === current ? [styles.indicatorActive, { backgroundColor: s.accentColor }] : styles.indicatorIdle]} />
          </Pressable>
        ))}
      </View>

      {/* 하단 버튼 — 흰색 대신 슬라이드 색상에 맞춘 그라데이션 */}
      <View style={styles.bottom}>
        <PressableScale scaleTo={0.98} onPress={isLast ? finish : () => setCurrent((c) => c + 1)} style={[styles.ctaShadow, { boxShadow: `0 8px 24px ${alpha(theme.glow, 0.3)}` }]}>
          <Gradient dir="r" colors={theme.button} style={styles.cta}>
            <Text style={[styles.ctaText, { color: theme.buttonText }]}>{isLast ? LABELS.start : LABELS.next}</Text>
            {!isLast && <ChevronRight size={20} color={theme.buttonText} style={{ marginLeft: 4 }} />}
          </Gradient>
        </PressableScale>
        {isLast && <Text style={styles.free}>{LABELS.free}</Text>}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  glowWrap: { position: "absolute", top: 0, left: 0, right: 0, alignItems: "center" },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 20, height: 48 },
  counter: { fontSize: 10, color: palette.gray[700], fontVariant: ["tabular-nums"] },
  skip: { fontSize: 12, color: palette.gray[600] },
  slide: { flex: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  slideInner: { width: "100%", maxWidth: 384, alignSelf: "center" },
  badgeWrap: { marginBottom: 16 },
  badge: { fontSize: 10, fontWeight: "900", letterSpacing: 2 },
  title: { fontSize: 26, lineHeight: 36, fontWeight: "900", color: "#ffffff", marginBottom: 12 },
  desc: { fontSize: 14, lineHeight: 23, color: palette.gray[400], marginBottom: 24 },
  indicators: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 20 },
  indicator: { height: 6, borderRadius: 3 },
  indicatorActive: { width: 32 },
  indicatorIdle: { width: 8, backgroundColor: alpha("#ffffff", 0.12) },
  bottom: { paddingHorizontal: 20, paddingBottom: 32 },
  ctaShadow: { borderRadius: 16 },
  cta: { width: "100%", height: 56, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  ctaText: { fontSize: 18, fontWeight: "900" },
  free: { fontSize: 10, color: palette.gray[700], textAlign: "center", marginTop: 12 },
})
