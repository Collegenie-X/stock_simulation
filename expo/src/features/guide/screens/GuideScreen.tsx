/**
 * 가이드 페이지
 * - 다크 테마 모바일 최적화
 * - 투자 전략 안내 및 게임 설정
 */
import { useState } from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { ChevronRight } from "lucide-react-native"
import { Screen } from "@/components/layout"
import { FadeUp } from "@/components/ui"
import { storage } from "@/lib/storage"
import charactersData from "@/data/characters.json"
import { palette } from "@/theme"
import { GameSetup } from "../components/GameSetup"
import { GuideNavigation } from "../components/GuideNavigation"
import { GuideProgress } from "../components/GuideProgress"
import { HowToPlaySlide } from "../components/HowToPlaySlide"
import { InvestStyleSlide } from "../components/InvestStyleSlide"
import { StrategySlide } from "../components/StrategySlide"
import { WaveSlide } from "../components/WaveSlide"
import { getGuideByType } from "../utils/getGuideByType"

export default function GuideScreen() {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showSetup, setShowSetup] = useState(false)
  const [duration, setDuration] = useState(3)
  const [initialCash, setInitialCash] = useState(5000000)

  const userProfile = storage.getUserProfile()
  const investorType: string = userProfile?.investorType || "신중한 기술적 분석가"

  const guideInfo = getGuideByType(investorType)

  const handleRetakeAnalysis = () => {
    router.push("/analysis-intro")
  }

  const slides = [
    {
      title: "당신의 투자 스타일",
      content: <InvestStyleSlide guideInfo={guideInfo} investorType={investorType} onRetakeAnalysis={handleRetakeAnalysis} />,
    },
    {
      title: "게임 방법",
      content: <HowToPlaySlide />,
    },
    {
      title: "파도 이해하기",
      content: <WaveSlide />,
    },
    {
      title: "맞춤 전략",
      content: <StrategySlide guideInfo={guideInfo} investorType={investorType} />,
    },
  ]

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const handleStart = () => {
    setShowSetup(true)
  }

  const confirmStart = () => {
    storage.setGuideComplete()

    // Save game settings
    storage.setGameSettings({
      duration,
      initialCash,
    })

    let characterType: "conservative" | "aggressive" | "balanced" = "balanced"

    if (investorType.includes("보수적") || investorType.includes("안정")) {
      characterType = "conservative"
    } else if (investorType.includes("공격") || investorType.includes("도전")) {
      characterType = "aggressive"
    }

    const characterInfo = charactersData.characters[characterType as keyof typeof charactersData.characters]

    // 웹과 동일한 (부분) 캐릭터 객체를 그대로 저장
    storage.setCharacter({
      type: characterType,
      name: characterInfo.name,
      level: 1,
      exp: 0,
      totalExp: 0,
      hearts: 5,
      streak: 0,
      achievements: [],
    } as any)

    router.push("/practice/stock/scenario-1")
  }

  // 게임 설정 화면
  if (showSetup) {
    return (
      <GameSetup
        duration={duration}
        initialCash={initialCash}
        onDurationChange={setDuration}
        onInitialCashChange={setInitialCash}
        onConfirm={confirmStart}
      />
    )
  }

  // 가이드 슬라이드
  return (
    <Screen bg="#191919" scroll={false}>
      {/* Skip button */}
      <View style={styles.skipRow}>
        <Pressable onPress={handleStart} hitSlop={12} style={styles.skip}>
          <Text style={styles.skipText}>건너뛰기</Text>
          <ChevronRight size={12} color={palette.gray[400]} />
        </Pressable>
      </View>

      {/* Progress indicator */}
      <View style={styles.progress}>
        <GuideProgress total={slides.length} current={currentSlide} />
      </View>

      {/* Content */}
      <ScrollView style={styles.flex1} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <FadeUp key={currentSlide}>{slides[currentSlide].content}</FadeUp>
      </ScrollView>

      {/* Navigation */}
      <GuideNavigation
        isFirst={currentSlide === 0}
        isLast={currentSlide === slides.length - 1}
        onPrev={handlePrev}
        onNext={handleNext}
        onStart={handleStart}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  skipRow: { paddingHorizontal: 20, paddingTop: 24, flexDirection: "row", justifyContent: "flex-end" },
  skip: { flexDirection: "row", alignItems: "center", gap: 4 },
  skipText: { color: palette.gray[400], fontSize: 14, fontWeight: "500" },
  progress: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  content: { paddingHorizontal: 20, paddingVertical: 24 },
})
