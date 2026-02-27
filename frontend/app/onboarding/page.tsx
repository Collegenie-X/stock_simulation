"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { storage } from "@/lib/storage"
import { ChartTrainingPreview } from "./components/ChartTrainingPreview"
import { EventScenarioPreview } from "./components/EventScenarioPreview"
import { RealDataPreview } from "./components/RealDataPreview"
import { AIBattlePreview } from "./components/AIBattlePreview"
import { SLIDES, LABELS, SWIPE_THRESHOLD, REDIRECT_PATH } from "./config"

const slides = SLIDES

function SlidePreview({ idx, trigger }: { idx: number; trigger: number }) {
  if (idx === 0) return <ChartTrainingPreview trigger={trigger} />
  if (idx === 1) return <EventScenarioPreview trigger={trigger} />
  if (idx === 2) return <RealDataPreview trigger={trigger} />
  return <AIBattlePreview />
}

// ─── 메인 컴포넌트 ──────────────────────────────────────────
export default function OnboardingPage() {
  const [current, setCurrent] = useState(0)
  const [touchX, setTouchX] = useState(0)
  const [touchEndX, setTouchEndX] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => setTouchX(e.targetTouches[0].clientX)
  const handleTouchMove = (e: React.TouchEvent) => setTouchEndX(e.targetTouches[0].clientX)
  const handleTouchEnd = () => {
    if (touchX - touchEndX > SWIPE_THRESHOLD && current < slides.length - 1) setCurrent(c => c + 1)
    if (touchX - touchEndX < -SWIPE_THRESHOLD && current > 0) setCurrent(c => c - 1)
  }

  const finish = useCallback(() => {
    storage.setOnboardingComplete()
    window.location.href = REDIRECT_PATH
  }, [])

  const s = slides[current]

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* 배경 글로우 */}
      <div className={`absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] ${s.glowClass} rounded-full blur-[120px] transition-all duration-700`} />

      {/* 상단 */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-5 h-12">
        <span className="text-[10px] text-gray-700 tabular-nums">{current + 1} / {slides.length}</span>
        {current < slides.length - 1 && (
          <button onClick={finish} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
            {LABELS.skip}
          </button>
        )}
      </div>

      {/* 슬라이드 */}
      <div
        className="flex-1 flex flex-col px-6 pt-4 pb-4 relative z-10"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-full max-w-sm mx-auto" key={current}>
          {/* 뱃지 */}
          <div className="mb-4 animate-ob-up">
            <span className={`text-[10px] font-black tracking-[0.2em] ${s.accentClass}`}>
              {s.badge}
            </span>
          </div>

          {/* 타이틀 */}
          <h1 className="text-[26px] font-black text-white leading-snug whitespace-pre-line mb-3 animate-ob-up2">
            {s.title}
          </h1>

          {/* 설명 */}
          <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line mb-6 animate-ob-up3">
            {s.desc}
          </p>

          {/* 실전 화면 미리보기 */}
          <div className="animate-ob-up4">
            <SlidePreview idx={current} trigger={current} />
          </div>
        </div>
      </div>

      {/* 인디케이터 */}
      <div className="relative z-10 flex justify-center gap-2 mb-5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "w-8 bg-white" : "w-2 bg-white/12 hover:bg-white/20"
            }`}
          />
        ))}
      </div>

      {/* 하단 버튼 */}
      <div className="relative z-10 px-5 pb-8">
        <Button
          className="w-full h-14 bg-white text-black hover:bg-gray-100 rounded-2xl text-lg font-black shadow-lg shadow-white/5 transition-all active:scale-[0.98]"
          onClick={current === slides.length - 1 ? finish : () => setCurrent(c => c + 1)}
        >
          {current === slides.length - 1 ? LABELS.start : LABELS.next}
          {current < slides.length - 1 && <ChevronRight className="ml-1 w-5 h-5" />}
        </Button>
        {current === slides.length - 1 && (
          <p className="text-[10px] text-gray-700 text-center mt-3">{LABELS.free}</p>
        )}
      </div>

      <style>{`
        @keyframes obUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-ob-up  { animation: obUp 0.4s ease-out forwards; }
        .animate-ob-up2 { animation: obUp 0.4s ease-out 0.08s forwards; opacity: 0; }
        .animate-ob-up3 { animation: obUp 0.4s ease-out 0.16s forwards; opacity: 0; }
        .animate-ob-up4 { animation: obUp 0.5s ease-out 0.24s forwards; opacity: 0; }
      `}</style>
    </div>
  )
}
