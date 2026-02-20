"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, TrendingUp, Target, Shield, Brain, Award } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * 분석 소개 페이지
 * - 다크 테마 모바일 최적화
 * - 투자 성향 분석 안내
 */
export default function AnalysisIntroPage() {
  const router = useRouter()

  const benefits = [
    {
      icon: Target,
      title: "맞춤형 투자 전략",
      description: "당신의 성향에 딱 맞는 투자 방법을 알려드려요",
    },
    {
      icon: TrendingUp,
      title: "수익률 향상",
      description: "자신에게 맞는 전략으로 더 나은 결과를 만들어요",
    },
    {
      icon: Shield,
      title: "리스크 관리",
      description: "감당할 수 있는 위험 수준을 파악해요",
    },
  ]

  const abilityChecks = [
    { icon: "🎲", label: "리스크 감수도", description: "위험을 감당하는 성향" },
    { icon: "📊", label: "분석력", description: "데이터 기반 판단 능력" },
    { icon: "🧘", label: "감정 통제", description: "패닉/탐욕 통제 능력" },
    { icon: "⚡", label: "대처 능력", description: "돌발 상황 대응력" },
    { icon: "🔍", label: "정보 판별", description: "뉴스/루머 판별 능력" },
  ]

  const investorTypes = [
    { level: 1, type: "안정 추구형", icon: "🛡️", color: "from-blue-500/20 to-blue-600/20 border-blue-500/30" },
    { level: 2, type: "신중한 투자자", icon: "🎯", color: "from-green-500/20 to-green-600/20 border-green-500/30" },
    { level: 3, type: "균형 투자자", icon: "⚖️", color: "from-purple-500/20 to-purple-600/20 border-purple-500/30" },
    { level: 4, type: "적극적 투자자", icon: "📈", color: "from-orange-500/20 to-orange-600/20 border-orange-500/30" },
    { level: 5, type: "공격적 투자자", icon: "⚡", color: "from-red-500/20 to-red-600/20 border-red-500/30" },
    { level: 6, type: "기술적 분석가", icon: "📊", color: "from-cyan-500/20 to-cyan-600/20 border-cyan-500/30" },
    { level: 7, type: "가치 투자자", icon: "💎", color: "from-emerald-500/20 to-emerald-600/20 border-emerald-500/30" },
    { level: 8, type: "트레이더", icon: "🚀", color: "from-pink-500/20 to-pink-600/20 border-pink-500/30" },
  ]

  return (
    <div className="min-h-screen-mobile bg-[#191919]">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 max-w-md mx-auto">
        <button 
          onClick={() => router.back()} 
          className="text-gray-400 hover:text-white mb-4 touch-feedback"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="px-5 pb-32 max-w-md mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4 animate-bounce">🎯</div>
          <h1 className="text-3xl font-bold text-white text-balance">
            투자 성향 분석으로
            <br />
            성공적인 투자를 시작하세요
          </h1>
          <p className="text-lg text-gray-400">12가지 심층 질문으로 당신의 투자 DNA를 분석합니다</p>
        </div>

        {/* Benefits */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white mb-4">왜 투자 성향 분석이 필요한가요?</h2>
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <div
                key={index}
                className="bg-[#252525] rounded-2xl p-5 border border-white/5 transition-all touch-feedback"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1">{benefit.title}</h3>
                    <p className="text-sm text-gray-400">{benefit.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* 5대 능력 체크 */}
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl p-6 border border-blue-500/20">
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-3">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">5대 투자 능력 체크</h2>
            <p className="text-sm text-gray-400">12문항으로 5가지 핵심 역량을 진단합니다</p>
          </div>

          <div className="space-y-2">
            {abilityChecks.map((check, index) => (
              <div
                key={index}
                className="bg-white/5 rounded-xl p-3 border border-white/10 flex items-center gap-3"
              >
                <div className="text-2xl">{check.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{check.label}</p>
                  <p className="text-xs text-gray-400">{check.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 8 Types Preview */}
        <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-3xl p-6 border border-purple-500/20">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500 rounded-2xl mb-3">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">8가지 투자자 유형</h2>
            <p className="text-sm text-gray-400">당신은 어떤 투자자 유형인가요?</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {investorTypes.map((type, index) => (
              <div
                key={index}
                className={cn(
                  "bg-gradient-to-br rounded-xl p-3 border flex flex-col items-center text-center",
                  type.color
                )}
              >
                <div className="text-2xl mb-1">{type.icon}</div>
                <div className="text-xs font-semibold text-gray-200">{type.type}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-[#252525] rounded-3xl p-6 border border-white/5">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-400" />
            어떻게 진행되나요?
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-semibold text-white">12가지 질문에 답하기</p>
                <p className="text-sm text-gray-400">이론 7문항 + 실전 차트 5문항, 솔직하게 답해주세요</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-semibold text-white">투자 성향 확인</p>
                <p className="text-sm text-gray-400">나만의 투자 유형과 추천 전략 받기</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-semibold text-white">맞춤 가이드로 게임 시작</p>
                <p className="text-sm text-gray-400">내 성향에 맞는 팁과 함께 게임 플레이</p>
              </div>
            </div>
          </div>
        </div>

        {/* Time info */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-4 border border-green-500/30">
          <div className="flex items-center justify-center gap-2 text-green-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold">소요 시간: 약 3-5분</span>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#191919] border-t border-white/5 p-5 pb-safe-bottom">
        <div className="max-w-md mx-auto">
          <Button
            onClick={() => router.push("/analysis")}
            className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-bold text-lg shadow-lg"
          >
            투자 성향 테스트 시작하기
          </Button>
        </div>
      </div>
    </div>
  )
}
