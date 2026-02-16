"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { storage } from "@/lib/storage"

export default function FlashPage() {
  const router = useRouter()

  useEffect(() => {
    // 2초 후 자동 전환
    const timer = setTimeout(() => {
      // 온보딩 완료 여부 확인
      const onboardingComplete = storage.getOnboardingStatus()
      
      if (onboardingComplete) {
        // 이미 온보딩을 완료한 사용자 -> 홈으로
        router.push("/home")
      } else {
        // 처음 방문한 사용자 -> 온보딩으로
        router.push("/onboarding")
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4A6BFF] via-[#6B8FFF] to-[#8BA5FF] flex flex-col items-center justify-center p-5">
      {/* 메인 로고/아이콘 */}
      <div className="animate-bounce mb-8">
        <div className="text-9xl filter drop-shadow-2xl">🏄</div>
      </div>

      {/* 앱 이름 */}
      <div className="text-center space-y-4 animate-fade-in">
        <h1 className="text-4xl font-bold text-white mb-2">파도를 타라</h1>
        <p className="text-xl text-blue-100">게임처럼 배우는 투자 교육</p>
      </div>

      {/* 로딩 인디케이터 */}
      <div className="mt-12 animate-pulse">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>

      {/* 버전 정보 */}
      <div className="absolute bottom-10 text-center">
        <p className="text-sm text-blue-200">Version 1.0.0</p>
        <p className="text-xs text-blue-300 mt-2">100% 무료 · 회원가입 불필요</p>
      </div>
    </div>
  )
}
