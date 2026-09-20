/**
 * 퀴즈 페이지
 * - 다크 테마 모바일 최적화
 * - 투자 성향 퀴즈
 */
import { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { ArrowLeft } from "lucide-react-native"
import { Screen } from "@/components/layout"
import { ProgressBar } from "@/components/ui"
import { storage } from "@/lib/storage"
import { palette } from "@/theme"
import { QuizOption } from "../components/QuizOption"
import { questions, type QuizScore } from "../questions"

export default function QuizScreen() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [scores, setScores] = useState({ safe: 0, balanced: 0, aggressive: 0 })

  const handleAnswer = (scoreToAdd: QuizScore) => {
    const newScores = { ...scores }
    if (scoreToAdd.safe) newScores.safe += scoreToAdd.safe
    if (scoreToAdd.balanced) newScores.balanced += scoreToAdd.balanced
    if (scoreToAdd.aggressive) newScores.aggressive += scoreToAdd.aggressive

    setScores(newScores)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Calculate result
      const maxScore = Math.max(newScores.safe, newScores.balanced, newScores.aggressive)
      let investorType = "균형잡힌 투자자"

      if (newScores.safe === maxScore) {
        investorType = "안정 추구형 신중한 투자자"
      } else if (newScores.aggressive === maxScore) {
        investorType = "공격적인 성장 투자자"
      } else {
        investorType = "균형잡힌 기술적 분석가"
      }

      // Save to storage
      storage.setUserProfile({
        investorType,
        analysisDate: new Date().toISOString(),
        scores: newScores,
      })

      // Go to guide
      router.push("/guide")
    }
  }

  const handleBack = () => {
    if (router.canGoBack()) router.back()
    else router.replace("/home")
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const question = questions[currentQuestion]

  return (
    <Screen bg="#191919">
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={handleBack} hitSlop={12} accessibilityLabel="뒤로가기" style={({ pressed }) => pressed && { opacity: 0.6 }}>
            <ArrowLeft size={24} color={palette.gray[400]} />
          </Pressable>
          <Text style={styles.counter}>
            {currentQuestion + 1} / {questions.length}
          </Text>
        </View>

        {/* Progress bar */}
        <ProgressBar value={progress} height={8} trackColor={palette.gray[700]} gradient={[palette.blue[500], palette.purple[500]]} />
      </View>

      {/* Question */}
      <View style={styles.body}>
        <View style={styles.questionBox}>
          <Text style={styles.question}>{question.question}</Text>
          <Text style={styles.hint}>가장 가까운 답변을 선택해주세요</Text>
        </View>

        <View style={styles.options}>
          {question.options.map((option, index) => (
            <QuizOption key={`${question.id}-${index}`} text={option.text} onPress={() => handleAnswer(option.score)} />
          ))}
        </View>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  counter: { fontSize: 14, fontWeight: "600", color: palette.gray[400] },
  body: { flex: 1, paddingHorizontal: 20, paddingVertical: 32 },
  questionBox: { marginBottom: 32 },
  question: { fontSize: 24, lineHeight: 32, fontWeight: "700", color: "#ffffff", marginBottom: 8 },
  hint: { fontSize: 16, color: palette.gray[400] },
  options: { gap: 12 },
})
