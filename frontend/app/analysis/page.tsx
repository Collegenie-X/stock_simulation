"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ChevronRight, Zap, TrendingUp } from "lucide-react"
import { storage } from "@/lib/storage"

const analysisData = {
  theory: [
    {
      id: 1,
      category: "risk_tolerance",
      question: "보유 주식이 -10% 하락했습니다. 어떻게 하시겠습니까?",
      options: [
        { text: "즉시 손절한다", score: 10, type: "리스크 회피형", emoji: "😰" },
        { text: "추가 매수를 고려한다", score: 30, type: "공격형", emoji: "💪" },
        { text: "분석 후 결정한다 ⭐", score: 20, type: "신중형", emoji: "🤔", best: true },
        { text: "그냥 기다린다", score: 15, type: "장기 투자형", emoji: "😌" },
      ],
    },
    {
      id: 2,
      category: "analysis_style",
      question: "투자 결정을 내릴 때 가장 중요한 요소는?",
      options: [
        { text: "빠른 직감 (감각형)", score: 10, type: "분석력", emoji: "⚡" },
        { text: "차트 패턴 분석 (기술적) ⭐", score: 30, type: "분석력", emoji: "📊", best: true },
        { text: "뉴스와 재무제표 (기본적)", score: 25, type: "분석력", emoji: "📰" },
        { text: "전문가 의견 (추종형)", score: 15, type: "분석력", emoji: "👨‍🏫" },
      ],
    },
    {
      id: 3,
      category: "period",
      question: "선호하는 투자 기간은?",
      options: [
        { text: "당일~1주 (단타형)", score: 30, type: "거래빈도", emoji: "🏃" },
        { text: "1주~1개월 (스윙형) ⭐", score: 20, type: "거래빈도", emoji: "🏄", best: true },
        { text: "1개월~3개월 (중기형)", score: 15, type: "거래빈도", emoji: "🚶" },
        { text: "3개월 이상 (장기형)", score: 10, type: "거래빈도", emoji: "🧘" },
      ],
    },
    {
      id: 4,
      category: "return_risk",
      question: "예상 수익률과 리스크 선호는?",
      options: [
        { text: "연 5~10% / 낮은 리스크", score: 10, type: "리스크", emoji: "🛡️" },
        { text: "연 10~30% / 중간 리스크 ⭐", score: 20, type: "리스크", emoji: "⚖️", best: true },
        { text: "연 30~100% / 높은 리스크", score: 30, type: "리스크", emoji: "🎲" },
        { text: "연 100%+ / 매우 높은 리스크", score: 40, type: "리스크", emoji: "🚀" },
      ],
    },
    {
      id: 5,
      category: "failure_response",
      question: "투자 실패 시 어떻게 대응하나요?",
      options: [
        { text: "바로 분석해서 원인 찾기 ⭐", score: 30, type: "학습력", emoji: "🔍", best: true },
        { text: "잠시 쉬었다가 다시", score: 20, type: "학습력", emoji: "☕" },
        { text: "전략을 완전히 바꾼다", score: 15, type: "학습력", emoji: "🔄" },
        { text: "더 신중하게 움직인다", score: 25, type: "학습력", emoji: "🐢" },
      ],
    },
  ],
  chart: [
    {
      id: 6,
      title: "급등주 포착",
      stock: "에코프로",
      situation: "3일간 +25% 급등 후 현재 시점",
      currentPrice: 195000,
      change: "+28%",
      volume: "+380%",
      news: "정부 2차전지 지원 발표",
      question: "당신의 선택은?",
      options: [
        { text: "지금 즉시 매수!", emotion: "욕심 80%", result: "-15%", score: 10, emoji: "🤑" },
        { text: "조정 올 때까지 대기 ⭐", emotion: "이성 70%", result: "+8%", score: 30, emoji: "🧠", best: true },
        { text: "절반만 매수", emotion: "균형 50%", result: "+2%", score: 20, emoji: "⚖️" },
        { text: "매수 안 함", emotion: "두려움 80%", result: "0%", score: 15, emoji: "😨" },
      ],
    },
    {
      id: 7,
      title: "하락장 대응",
      stock: "삼성바이오",
      situation: "850,000원에 매수 후 현재 -8% 손실",
      currentPrice: 782000,
      question: "당신의 감정과 선택은?",
      options: [
        { text: "즉시 손절!", emotion: "공포 90%", result: "-8%", score: 10, emoji: "😱" },
        { text: "물타기", emotion: "억울함 60%", result: "-15%", score: 5, emoji: "😤" },
        { text: "기다리며 분석 ⭐", emotion: "침착 70%", result: "+3%", score: 30, emoji: "😌", best: true },
        { text: "그냥 기다림", emotion: "무기력 60%", result: "-18%", score: 15, emoji: "😐" },
      ],
    },
    {
      id: 8,
      title: "B파 함정 회피",
      stock: "셀트리온",
      situation: "하락 후 반등 시작, B파 의심 구간",
      currentPrice: 168000,
      change: "+5%",
      volume: "-20%",
      aiWarning: "거래량 부족. B파 함정 가능성 80%",
      question: "당신의 감정과 선택은?",
      options: [
        { text: "매수! (반등 기회)", emotion: "탐욕 80%", result: "-12%", score: 5, emoji: "🤑" },
        { text: "저항선 돌파 확인 후", emotion: "신중 60%", result: "0%", score: 25, emoji: "🤔" },
        { text: "진입 안 함 ⭐", emotion: "이성 90%", result: "0%", score: 30, emoji: "🧠", best: true },
        { text: "소량만 매수", emotion: "반신반의", result: "-12%", score: 15, emoji: "😅" },
      ],
    },
  ],
}

export default function AnalysisPage() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [totalScore, setTotalScore] = useState(0)
  const [showResult, setShowResult] = useState(false)

  const allQuestions = [...analysisData.theory, ...analysisData.chart]
  const currentQuestion = allQuestions[currentIndex]
  const isTheory = currentIndex < analysisData.theory.length
  const progressPercent = (currentIndex / allQuestions.length) * 100

  const handleAnswer = (optionIndex: number) => {
    const option = currentQuestion.options[optionIndex]
    const score = (option as any).score

    setSelectedOption(optionIndex)
    setShowFeedback(true)
    setTotalScore(totalScore + score)
    setAnswers([...answers, score])

    setTimeout(() => {
      if (currentIndex < allQuestions.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setSelectedOption(null)
        setShowFeedback(false)
      } else {
        const avgScore = Math.round((totalScore + score) / allQuestions.length)
        let investorType = "신중한 기술적 분석가"
        if (avgScore < 15) investorType = "보수적 안정형 투자자"
        else if (avgScore > 25) investorType = "공격적 도전형 투자자"

        storage.saveUserProfile({
          investorType,
          analysisScore: avgScore,
          completedAt: new Date().toISOString(),
        })
        storage.setOnboardingComplete()
        storage.setGuideComplete()

        console.log("[v0] Analysis complete, profile saved:", storage.getUserProfile())
        console.log("[v0] Onboarding status:", storage.getOnboardingStatus())
        console.log("[v0] Guide complete status:", storage.getGuideComplete())

        setTimeout(() => {
          setShowResult(true)
        }, 1000)
      }
    }, 1500)
  }

  if (showResult) {
    const avgScore = Math.round(totalScore / allQuestions.length)

    let investorType = "신중한 기술적 분석가"
    let description = "차트 분석 능력이 우수하며, 이성적인 판단이 가능합니다."
    let emoji = "📊"

    if (avgScore < 15) {
      investorType = "보수적 안정형 투자자"
      description = "리스크를 최소화하며 안정적인 투자를 선호합니다."
      emoji = "🛡️"
    } else if (avgScore > 25) {
      investorType = "공격적 도전형 투자자"
      description = "높은 수익을 위해 적극적인 투자를 추구합니다."
      emoji = "⚡"
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#4A6BFF] to-[#6B8FFF] px-5 py-8 flex flex-col items-center justify-center">
        <div className="max-w-md w-full animate-in zoom-in duration-500">
          <div className="text-center mb-8">
            <div className="text-8xl mb-6 animate-bounce">{emoji}</div>
            <div className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-300" />
              <span className="text-white font-bold text-lg">{totalScore} 점</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">분석 완료!</h1>
            <p className="text-blue-100 text-lg">당신은...</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-2xl mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">{investorType}</h2>
            <p className="text-gray-600 text-center leading-relaxed mb-6">{description}</p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">리스크 감수</span>
                  <span className="font-bold text-gray-900">{Math.min(avgScore * 4, 100)}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#4A6BFF] to-[#6B8FFF] rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(avgScore * 4, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">분석 선호도</span>
                  <span className="font-bold text-gray-900">85%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00C853] to-[#00E676] rounded-full transition-all duration-1000 delay-200"
                    style={{ width: "85%" }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">감정 통제</span>
                  <span className="font-bold text-gray-900">65%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#FFD93D] to-[#FFC107] rounded-full transition-all duration-1000 delay-300"
                    style={{ width: "65%" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            className="w-full h-16 bg-white hover:bg-gray-50 text-[#4A6BFF] rounded-2xl text-xl font-bold shadow-2xl"
            onClick={() => {
              storage.setGuideComplete()
              console.log("[v0] Final guide status before navigation:", storage.getGuideComplete())
              console.log("[v0] Navigating to home...")
              router.push("/")
            }}
          >
            홈으로 이동
            <ChevronRight className="ml-2 w-6 h-6" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#4A6BFF] to-[#6B8FFF] flex flex-col">
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 px-5 py-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">{isTheory ? "🧠" : "📈"}</span>
              </div>
              <div>
                <p className="text-xs text-blue-100">{isTheory ? "투자 성향 분석" : "실전 차트 테스트"}</p>
                <p className="text-sm font-bold text-white">
                  {currentIndex + 1} / {allQuestions.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span className="text-white font-bold">{totalScore}</span>
            </div>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 px-5 py-6 max-w-md mx-auto w-full">
        {isTheory ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 mb-6 border border-white/50">
              <h2 className="text-2xl font-bold text-white leading-relaxed text-center">{currentQuestion.question}</h2>
            </div>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedOption === index
                const isBest = (option as any).best
                const showResult = showFeedback && isSelected

                return (
                  <button
                    key={index}
                    onClick={() => !showFeedback && handleAnswer(index)}
                    disabled={showFeedback}
                    className={`
                      w-full p-5 rounded-2xl text-left transition-all duration-300 transform
                      ${showFeedback ? "cursor-not-allowed" : "active:scale-95 hover:scale-102"}
                      ${
                        isSelected && showResult
                          ? isBest
                            ? "bg-green-500 border-2 border-green-400 shadow-lg shadow-green-500/50"
                            : "bg-blue-500 border-2 border-blue-400 shadow-lg shadow-blue-500/50"
                          : "bg-white/90 backdrop-blur-sm border-2 border-white/50 hover:bg-white hover:border-white"
                      }
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{(option as any).emoji}</div>
                      <div className="flex-1">
                        <p className={`font-bold text-lg mb-1 ${showResult ? "text-white" : "text-gray-900"}`}>
                          {option.text}
                        </p>
                        <p className={`text-sm ${showResult ? "text-white/80" : "text-gray-600"}`}>
                          {(option as any).type}
                        </p>
                        {showResult && (
                          <div className="mt-2 flex items-center gap-2">
                            {isBest ? (
                              <>
                                <CheckCircle2 className="w-5 h-5 text-white" />
                                <span className="text-white font-bold">최고의 선택!</span>
                              </>
                            ) : (
                              <span className="text-white font-bold">+{(option as any).score}점</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white rounded-3xl p-6 mb-4 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{(currentQuestion as any).title}</h3>
                  <p className="text-sm text-gray-600">{(currentQuestion as any).stock}</p>
                </div>
                <div className="text-4xl">📊</div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-sm text-gray-600">현재가</span>
                  <span className="text-3xl font-bold text-gray-900">
                    {(currentQuestion as any).currentPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-red-600" />
                    <span className="text-gray-600">등락:</span>
                    <span className="font-bold text-red-600">{(currentQuestion as any).change}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-600">거래량:</span>
                    <span className="font-bold text-blue-600">{(currentQuestion as any).volume}</span>
                  </div>
                </div>
              </div>

              {(currentQuestion as any).aiWarning && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3 mb-4">
                  <p className="text-sm font-semibold text-yellow-800">⚠️ {(currentQuestion as any).aiWarning}</p>
                </div>
              )}

              <p className="text-gray-600 text-sm">{(currentQuestion as any).situation}</p>
            </div>

            <h2 className="text-xl font-bold text-white mb-4 text-center">{currentQuestion.question}</h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedOption === index
                const isBest = (option as any).best
                const showResult = showFeedback && isSelected

                return (
                  <button
                    key={index}
                    onClick={() => !showFeedback && handleAnswer(index)}
                    disabled={showFeedback}
                    className={`
                      w-full p-5 rounded-2xl text-left transition-all duration-300 transform
                      ${showFeedback ? "cursor-not-allowed" : "active:scale-95 hover:scale-102"}
                      ${
                        isSelected && showResult
                          ? isBest
                            ? "bg-green-500 border-2 border-green-400 shadow-lg shadow-green-500/50"
                            : "bg-blue-500 border-2 border-blue-400 shadow-lg shadow-blue-500/50"
                          : "bg-white/90 backdrop-blur-sm border-2 border-white/50 hover:bg-white hover:border-white"
                      }
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{(option as any).emoji}</div>
                      <div className="flex-1">
                        <p className={`font-bold text-lg mb-2 ${showResult ? "text-white" : "text-gray-900"}`}>
                          {option.text}
                        </p>
                        <div
                          className={`flex items-center gap-3 text-sm ${showResult ? "text-white/80" : "text-gray-600"}`}
                        >
                          <span>{(option as any).emotion}</span>
                          <span>•</span>
                          <span>예상: {(option as any).result}</span>
                        </div>
                        {showResult && (
                          <div className="mt-3 flex items-center gap-2">
                            {isBest ? (
                              <>
                                <CheckCircle2 className="w-5 h-5 text-white" />
                                <span className="text-white font-bold">완벽한 판단!</span>
                              </>
                            ) : (
                              <span className="text-white font-bold">+{(option as any).score}점</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
