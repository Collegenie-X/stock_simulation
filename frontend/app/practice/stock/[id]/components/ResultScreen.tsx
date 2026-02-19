"use client"

import { Button } from "@/components/ui/button"

interface ResultScreenProps {
  profitRate: number
  onGoHome: () => void
}

export const ResultScreen = ({ profitRate, onGoHome }: ResultScreenProps) => (
  <div className="min-h-screen bg-[#191919] flex flex-col items-center justify-center p-6 text-center text-white">
    <div
      className={`w-32 h-32 rounded-full flex items-center justify-center text-7xl mb-6 shadow-2xl ${
        profitRate > 0 ? "bg-red-500/20 animate-bounce" : "bg-blue-500/20"
      }`}
    >
      {profitRate > 0 ? "🏆" : "💪"}
    </div>
    <h2 className="text-3xl font-bold mb-2">게임 종료!</h2>
    <p className="text-gray-400 font-medium mb-8">
      최종 수익률:{" "}
      <span className={profitRate > 0 ? "text-red-500" : "text-blue-500"}>{profitRate}%</span>
    </p>
    <Button
      className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-2xl"
      onClick={onGoHome}
    >
      홈으로 돌아가기
    </Button>
  </div>
)
