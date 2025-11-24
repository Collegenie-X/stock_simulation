"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, TrendingUp, Target, Shield, Brain, Award } from "lucide-react"

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

  const investorTypes = [
    { level: 1, type: "안정 추구형", icon: "🛡️", color: "bg-blue-50 border-blue-200" },
    { level: 2, type: "신중한 투자자", icon: "🎯", color: "bg-green-50 border-green-200" },
    { level: 3, type: "균형 투자자", icon: "⚖️", color: "bg-purple-50 border-purple-200" },
    { level: 4, type: "적극적 투자자", icon: "📈", color: "bg-orange-50 border-orange-200" },
    { level: 5, type: "공격적 투자자", icon: "⚡", color: "bg-red-50 border-red-200" },
    { level: 6, type: "기술적 분석가", icon: "📊", color: "bg-cyan-50 border-cyan-200" },
    { level: 7, type: "가치 투자자", icon: "💎", color: "bg-emerald-50 border-emerald-200" },
    { level: 8, type: "트레이더", icon: "🚀", color: "bg-pink-50 border-pink-200" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 max-w-md mx-auto">
        <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="px-5 pb-32 max-w-md mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4 animate-bounce">🎯</div>
          <h1 className="text-3xl font-bold text-gray-900 text-balance">
            투자 성향 분석으로
            <br />
            성공적인 투자를 시작하세요
          </h1>
          <p className="text-lg text-gray-600">단 8가지 질문으로 당신의 투자 DNA를 분석합니다</p>
        </div>

        {/* Benefits */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 mb-4">왜 투자 성향 분석이 필요한가요?</h2>
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{benefit.title}</h3>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* 8 Types Preview */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-6 border-2 border-purple-100">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500 rounded-2xl mb-3">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">8가지 투자자 유형</h2>
            <p className="text-sm text-gray-600">당신은 어떤 투자자 유형인가요?</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {investorTypes.map((type, index) => (
              <div
                key={index}
                className={`${type.color} rounded-xl p-3 border-2 flex flex-col items-center text-center`}
              >
                <div className="text-2xl mb-1">{type.icon}</div>
                <div className="text-xs font-semibold text-gray-700">{type.type}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-3xl p-6 border-2 border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-500" />
            어떻게 진행되나요?
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-semibold text-gray-900">8가지 질문에 답하기</p>
                <p className="text-sm text-gray-600">정답은 없어요. 솔직하게 답해주세요</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-semibold text-gray-900">투자 성향 확인</p>
                <p className="text-sm text-gray-600">나만의 투자 유형과 추천 전략 받기</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-semibold text-gray-900">맞춤 가이드로 게임 시작</p>
                <p className="text-sm text-gray-600">내 성향에 맞는 팁과 함께 게임 플레이</p>
              </div>
            </div>
          </div>
        </div>

        {/* Time info */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-green-200">
          <div className="flex items-center justify-center gap-2 text-green-900">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold">소요 시간: 약 2-3분</span>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-5 pb-safe-bottom">
        <div className="max-w-md mx-auto">
          <Button
            onClick={() => router.push("/analysis")}
            className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-bold text-lg shadow-lg"
          >
            시작하기
          </Button>
          <button
            onClick={() => {
              router.push("/guide")
            }}
            className="w-full mt-3 text-gray-500 text-sm font-medium hover:text-gray-700"
          >
            건너뛰고 바로 시작하기
          </button>
        </div>
      </div>
    </div>
  )
}
