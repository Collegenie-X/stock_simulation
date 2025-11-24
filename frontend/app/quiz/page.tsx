"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { storage } from "@/lib/storage"

const questions = [
  {
    id: 1,
    question: "투자에서 가장 중요하게 생각하는 것은?",
    options: [
      { text: "안정적인 수익", score: { safe: 3 } },
      { text: "적당한 위험과 수익", score: { balanced: 3 } },
      { text: "높은 수익 기회", score: { aggressive: 3 } },
    ],
  },
  {
    id: 2,
    question: "내 투자금이 10% 하락했다면?",
    options: [
      { text: "즉시 손절하고 빠져나온다", score: { safe: 3 } },
      { text: "상황을 지켜보며 판단한다", score: { balanced: 3 } },
      { text: "추가 매수 기회로 본다", score: { aggressive: 3 } },
    ],
  },
  {
    id: 3,
    question: "투자 결정을 내릴 때 주로 참고하는 것은?",
    options: [
      { text: "기업의 재무제표와 가치", score: { safe: 2, balanced: 1 } },
      { text: "차트와 기술적 지표", score: { balanced: 2, aggressive: 1 } },
      { text: "뉴스와 시장 분위기", score: { aggressive: 3 } },
    ],
  },
  {
    id: 4,
    question: "단기간에 큰 수익을 낼 수 있는 고위험 종목이 있다면?",
    options: [
      { text: "관심 없다. 안정적인 게 좋다", score: { safe: 3 } },
      { text: "일부만 투자해본다", score: { balanced: 3 } },
      { text: "큰 기회라고 생각하고 적극 투자", score: { aggressive: 3 } },
    ],
  },
  {
    id: 5,
    question: "나의 투자 기간은 보통?",
    options: [
      { text: "장기 (1년 이상)", score: { safe: 3 } },
      { text: "중기 (3개월~1년)", score: { balanced: 3 } },
      { text: "단기 (1일~3개월)", score: { aggressive: 3 } },
    ],
  },
  {
    id: 6,
    question: "투자할 때 가장 스트레스 받는 상황은?",
    options: [
      { text: "내 종목이 조금이라도 떨어질 때", score: { safe: 3 } },
      { text: "큰 폭으로 떨어질 때", score: { balanced: 3 } },
      { text: "스트레스를 별로 안 받는다", score: { aggressive: 3 } },
    ],
  },
  {
    id: 7,
    question: "포트폴리오를 구성한다면?",
    options: [
      { text: "안전한 대형주 위주", score: { safe: 3 } },
      { text: "대형주 + 중소형주 믹스", score: { balanced: 3 } },
      { text: "성장 가능성 높은 중소형주", score: { aggressive: 3 } },
    ],
  },
  {
    id: 8,
    question: "투자 공부는 얼마나 하시나요?",
    options: [
      { text: "기본적인 것만 안다", score: { safe: 2, aggressive: 1 } },
      { text: "꾸준히 공부하며 투자한다", score: { balanced: 3 } },
      { text: "전문가 수준으로 분석한다", score: { balanced: 1, aggressive: 2 } },
    ],
  },
]

export default function QuizPage() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [scores, setScores] = useState({ safe: 0, balanced: 0, aggressive: 0 })

  const handleAnswer = (scoreToAdd: { safe?: number; balanced?: number; aggressive?: number }) => {
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

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const question = questions[currentQuestion]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 max-w-md mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="text-sm font-semibold text-gray-600">
            {currentQuestion + 1} / {questions.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 px-5 py-8 max-w-md mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-balance">{question.question}</h2>
          <p className="text-gray-600">가장 가까운 답변을 선택해주세요</p>
        </div>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option.score)}
              className="w-full p-5 bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left font-medium text-gray-900"
            >
              {option.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
