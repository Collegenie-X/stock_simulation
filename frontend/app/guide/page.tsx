"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Play, Clock, Coins, Check, Settings, RotateCcw } from "lucide-react"
import { storage } from "@/lib/storage"
import { useRouter } from "next/navigation"
import charactersData from "@/data/characters.json"
import { cn } from "@/lib/utils"

/**
 * 가이드 페이지
 * - 다크 테마 모바일 최적화
 * - 투자 전략 안내 및 게임 설정
 */
export default function GuidePage() {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showSetup, setShowSetup] = useState(false)
  const [duration, setDuration] = useState(3)
  const [initialCash, setInitialCash] = useState(5000000)
  const [showSettings, setShowSettings] = useState(false)

  const userProfile = storage.getUserProfile()
  const investorType = userProfile?.investorType || "신중한 기술적 분석가"

  const getGuideByType = () => {
    if (investorType.includes("보수적") || investorType.includes("안정형")) {
      return {
        emoji: "🛡️",
        strategy: "안정적인 파도 타기",
        description: "큰 파도보다는 작고 안정적인 파도를 선택하세요",
        tips: ["급등주보다는 안정적인 종목 위주로 투자", "손절 라인을 미리 정하고 지키기", "하루 수익률 목표: 1-3%"],
      }
    } else if (investorType.includes("공격적") || investorType.includes("도전형")) {
      return {
        emoji: "⚡",
        strategy: "큰 파도 공략하기",
        description: "높은 변동성의 파도를 적극적으로 공략하세요",
        tips: ["급등주와 테마주 적극 활용", "빠른 손절과 익절 실행", "하루 수익률 목표: 5-10%"],
      }
    } else {
      return {
        emoji: "📊",
        strategy: "똑똑한 파도 분석",
        description: "차트를 분석하고 타이밍을 잡아 파도를 타세요",
        tips: ["차트 패턴을 보고 매매 타이밍 결정", "엘리엇 파동 이론 활용하기", "하루 수익률 목표: 3-7%"],
      }
    }
  }

  const guideInfo = getGuideByType()

  const handleRetakeAnalysis = () => {
    router.push("/analysis-intro")
  }

  const slides = [
    {
      title: "당신의 투자 스타일",
      content: (
        <div className="text-center relative">
          <div className="absolute top-0 right-0">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-white/10"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-5 h-5" />
            </Button>
            {showSettings && (
              <div className="absolute right-0 top-10 bg-[#252525] shadow-xl rounded-xl p-2 border border-white/10 w-48 z-50 animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={handleRetakeAnalysis}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 rounded-lg transition-colors text-left"
                >
                  <RotateCcw className="w-4 h-4" />
                  투자 성향 다시 분석하기
                </button>
              </div>
            )}
          </div>

          <div className="text-8xl mb-6 animate-bounce">{guideInfo.emoji}</div>
          <h2 className="text-3xl font-bold text-white mb-4">{investorType}</h2>
          <p className="text-xl text-gray-400 mb-6">당신에게 딱 맞는 투자 방법을 알려드릴게요</p>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-blue-400 mb-3">추천 전략: {guideInfo.strategy}</h3>
            <p className="text-blue-300">{guideInfo.description}</p>
          </div>
        </div>
      ),
    },
    {
      title: "게임 방법",
      content: (
        <div>
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold text-white mb-2">어떻게 게임하나요?</h2>
            <p className="text-gray-400">실제 주식처럼 사고팔며 돈을 벌어보세요</p>
          </div>

          <div className="space-y-4">
            <div className="bg-[#252525] rounded-2xl p-5 border border-white/5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📈</span>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">1. 주식 고르기</h3>
                  <p className="text-sm text-gray-400">50개 이상의 종목 중 마음에 드는 주식을 선택하세요</p>
                </div>
              </div>
            </div>

            <div className="bg-[#252525] rounded-2xl p-5 border border-white/5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">2. 매수하기</h3>
                  <p className="text-sm text-gray-400">1,000만원으로 시작! 원하는 만큼 사세요</p>
                </div>
              </div>
            </div>

            <div className="bg-[#252525] rounded-2xl p-5 border border-white/5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⏰</span>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">3. 다음 날로 이동</h3>
                  <p className="text-sm text-gray-400">버튼을 누르면 하루가 지나고 주가가 변해요</p>
                </div>
              </div>
            </div>

            <div className="bg-[#252525] rounded-2xl p-5 border border-white/5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">4. 매도하기</h3>
                  <p className="text-sm text-gray-400">수익이 나면 팔아서 돈을 벌어보세요!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "파도 이해하기",
      content: (
        <div>
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🌊</div>
            <h2 className="text-2xl font-bold text-white mb-2">주식은 파도처럼 움직여요</h2>
            <p className="text-gray-400">파도의 높낮이를 보고 타이밍을 잡으세요</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-3xl p-6 mb-6">
            <div className="relative h-48">
              <svg viewBox="0 0 400 200" className="w-full h-full">
                {/* Wave path */}
                <defs>
                  <linearGradient id="waveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 150 Q 50 80, 100 100 T 200 80 T 300 120 T 400 100 L 400 200 L 0 200 Z"
                  fill="url(#waveGrad)"
                  stroke="#3B82F6"
                  strokeWidth="3"
                />

                {/* Buy point */}
                <circle cx="100" cy="100" r="8" fill="#10B981" stroke="white" strokeWidth="2" />
                <text x="100" y="90" textAnchor="middle" fill="#10B981" fontSize="12" fontWeight="bold">
                  매수
                </text>

                {/* Sell point */}
                <circle cx="200" cy="80" r="8" fill="#EF4444" stroke="white" strokeWidth="2" />
                <text x="200" y="70" textAnchor="middle" fill="#EF4444" fontSize="12" fontWeight="bold">
                  매도
                </text>
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-[#252525] rounded-xl p-3 text-center border border-white/5">
                <div className="text-2xl mb-1">📉</div>
                <p className="text-xs font-bold text-white">낮을 때 사기</p>
                <p className="text-xs text-gray-400">파도 밑에서 매수</p>
              </div>
              <div className="bg-[#252525] rounded-xl p-3 text-center border border-white/5">
                <div className="text-2xl mb-1">📈</div>
                <p className="text-xs font-bold text-white">높을 때 팔기</p>
                <p className="text-xs text-gray-400">파도 위에서 매도</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4">
            <p className="text-sm text-yellow-400 font-semibold text-center">
              💡 파도를 잘 타면 큰 수익을 얻을 수 있어요!
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "맞춤 전략",
      content: (
        <div>
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{guideInfo.emoji}</div>
            <h2 className="text-2xl font-bold text-white mb-2">당신만의 투자 팁</h2>
            <p className="text-gray-400">{investorType}에게 딱 맞는 방법이에요</p>
          </div>

          <div className="space-y-3 mb-8">
            {guideInfo.tips.map((tip, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl p-4 border border-blue-500/20"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-gray-200 font-semibold pt-1">{tip}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-5 border border-green-500/20">
            <div className="flex items-start gap-3">
              <div className="text-3xl">🎯</div>
              <div>
                <h3 className="font-bold text-green-400 mb-1">게임 목표</h3>
                <p className="text-sm text-green-300">
                  30일 동안 1,000만원을 얼마나 불릴 수 있을까요? 랭킹에 도전해보세요!
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
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

    let characterType = "balanced"

    if (investorType.includes("보수적") || investorType.includes("안정")) {
      characterType = "conservative"
    } else if (investorType.includes("공격") || investorType.includes("도전")) {
      characterType = "aggressive"
    }

    const characterInfo = charactersData.characters[characterType as keyof typeof charactersData.characters]

    storage.setCharacter({
      type: characterType,
      name: characterInfo.name,
      level: 1,
      exp: 0,
      totalExp: 0,
      hearts: 5,
      streak: 0,
      achievements: [],
    })

    router.push("/practice/stock/scenario-1")
  }

  const durations = [
    { value: 1, label: "1개월", time: "20분" },
    { value: 3, label: "3개월", time: "60분" },
    { value: 6, label: "6개월", time: "120분" },
    { value: 12, label: "12개월", time: "240분" },
  ]

  const amounts = [
    { value: 5000000, label: "500만원" },
    { value: 10000000, label: "1,000만원" },
    { value: 50000000, label: "5,000만원" },
    { value: 100000000, label: "1억원" },
    { value: 300000000, label: "3억원" },
    { value: 1000000000, label: "10억원" },
    { value: 5000000000, label: "50억원" },
  ]

  // 게임 설정 화면
  if (showSetup) {
    return (
      <div className="min-h-screen-mobile bg-[#191919] text-white p-6 flex flex-col">
        <div className="flex-1 max-w-md mx-auto w-full">
          <h1 className="text-2xl font-bold mb-2">게임 설정</h1>
          <p className="text-gray-400 mb-8">나에게 맞는 난이도를 선택하세요</p>

          <div className="space-y-8">
            {/* Duration Selection */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-400" />
                <h2 className="font-bold text-lg">기간 선택</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {durations.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDuration(opt.value)}
                    className={cn(
                      "p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden touch-feedback",
                      duration === opt.value
                        ? "bg-blue-500/20 border-blue-500"
                        : "bg-[#252525] border-transparent hover:bg-[#2a2a2a]",
                    )}
                  >
                    <div className="font-bold text-lg mb-1">{opt.label}</div>
                    <div className="text-sm text-gray-400">평균 {opt.time} 소요</div>
                    {duration === opt.value && (
                      <div className="absolute top-3 right-3 bg-blue-500 rounded-full p-1">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Selection */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Coins className="w-5 h-5 text-yellow-400" />
                <h2 className="font-bold text-lg">투자 금액</h2>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {amounts.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setInitialCash(opt.value)}
                    className={cn(
                      "p-3 rounded-xl border-2 text-center transition-all text-sm font-medium touch-feedback",
                      initialCash === opt.value
                        ? "bg-yellow-500/20 border-yellow-500 text-yellow-400"
                        : "bg-[#252525] border-transparent text-gray-400 hover:bg-[#2a2a2a]",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 max-w-md mx-auto w-full pb-safe-bottom">
          <Button
            onClick={confirmStart}
            className="w-full h-14 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-900/20"
          >
            설정 완료하고 시작하기
          </Button>
        </div>
      </div>
    )
  }

  // 가이드 슬라이드
  return (
    <div className="min-h-screen-mobile bg-[#191919] flex flex-col">
      {/* Skip button */}
      <div className="px-5 pt-6 flex justify-end max-w-md mx-auto w-full">
        <button
          onClick={handleStart}
          className="text-gray-400 text-sm font-medium hover:text-white flex items-center gap-1"
        >
          건너뛰기 <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Progress indicator */}
      <div className="px-5 pt-2 pb-4">
        <div className="flex gap-2 max-w-md mx-auto">
          {slides.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all",
                index === currentSlide 
                  ? "bg-blue-500" 
                  : index < currentSlide 
                    ? "bg-blue-700" 
                    : "bg-gray-700"
              )}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-6 max-w-md mx-auto w-full overflow-auto">
        <div className="animate-slide-up">{slides[currentSlide].content}</div>
      </div>

      {/* Navigation */}
      <div className="px-5 py-6 bg-[#191919] border-t border-white/5 pb-safe-bottom">
        <div className="max-w-md mx-auto flex gap-3">
          {currentSlide > 0 && (
            <Button 
              onClick={handlePrev} 
              variant="outline" 
              className="px-8 h-14 rounded-xl border-2 border-gray-600 bg-transparent text-gray-300 hover:bg-white/5"
            >
              <ChevronLeft className="w-5 h-5" />
              이전
            </Button>
          )}

          {currentSlide < slides.length - 1 ? (
            <Button
              onClick={handleNext}
              className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg"
            >
              다음
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleStart}
              className="flex-1 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-900/20"
            >
              <Play className="w-5 h-5 mr-2" />
              게임 시작하기
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
