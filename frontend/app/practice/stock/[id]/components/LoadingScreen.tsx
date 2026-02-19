"use client"

interface LoadingScreenProps {
  reason?: string
}

export const LoadingScreen = ({ reason }: LoadingScreenProps) => (
  <div className="min-h-screen bg-[#191919] flex flex-col items-center justify-center text-white">
    <div className="flex flex-col items-center gap-4 animate-pulse">
      <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      <div className="text-xl font-bold text-gray-300">게임 로딩 중...</div>
      {reason && <div className="text-sm text-gray-500">{reason}</div>}
    </div>
  </div>
)
