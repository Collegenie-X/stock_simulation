"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { storage } from "@/lib/storage"

const onboardingSlides = [
  {
    emoji: "🌊",
    title: "파도를 타라",
    description: "게임처럼 배우는\n투자 교육 플랫폼",
    detail: "엘리엇 파동 이론으로 주식 시장의 파도를 읽어보세요",
  },
  {
    emoji: "📚",
    title: "단계별 학습",
    description: "기초부터 고급까지\n체계적인 커리큘럼",
    detail: "이론 학습 → 퀴즈 → 실전 연습으로 완벽하게",
  },
  {
    emoji: "🎮",
    title: "실시간 시뮬레이션",
    description: "가상 자산으로\n안전하게 연습",
    detail: "실제와 같은 환경에서 12주간 투자 경험",
  },
  {
    emoji: "🏆",
    title: "AI와 경쟁하기",
    description: "AI 멘토와 수익률 대결\n나만의 투자 DNA 발견",
    detail: "100% 무료! 회원가입 없이 바로 시작하세요",
  },
]

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75 && currentSlide < onboardingSlides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
    if (touchStart - touchEnd < -75 && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const handleNext = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      storage.setOnboardingComplete()
      window.location.href = "/analysis-intro"
    }
  }

  const handleSkip = () => {
    storage.setOnboardingComplete()
    window.location.href = "/analysis-intro"
  }

  const slide = onboardingSlides[currentSlide]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#4A6BFF] to-[#6B8FFF] flex flex-col">
      {/* 건너뛰기 버튼 제거 - 투자 성향 테스트 필수 */}
      <div className="p-5 h-14"></div>

      {/* Slides */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-8 pb-20"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="text-center animate-in fade-in duration-500" key={currentSlide}>
          <div className="text-8xl mb-8">{slide.emoji}</div>
          <h1 className="text-3xl font-bold text-white mb-4 whitespace-pre-line">{slide.title}</h1>
          <p className="text-xl text-blue-100 mb-4 whitespace-pre-line leading-relaxed">{slide.description}</p>
          <p className="text-sm text-blue-200/80 leading-relaxed max-w-xs mx-auto">{slide.detail}</p>
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mb-8">
        {onboardingSlides.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all ${index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/30"}`}
          />
        ))}
      </div>

      {/* Next Button */}
      <div className="px-5 pb-8">
        <Button
          className="w-full h-14 bg-white text-[#4A6BFF] hover:bg-gray-50 rounded-2xl text-lg font-bold shadow-lg"
          onClick={handleNext}
        >
          {currentSlide === onboardingSlides.length - 1 ? "시작하기" : "다음"}
          <ChevronRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
