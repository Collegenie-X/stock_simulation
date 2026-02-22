"use client"

import { useEffect, useState, useCallback } from "react"

interface SceneAbilitiesProps {
  visible: boolean
  onComplete: () => void
}

const ABILITIES = [
  { icon: "🎲", label: "리스크 감수도", value: 78, color: "from-red-500 to-orange-500", delay: 0 },
  { icon: "📊", label: "분석력", value: 85, color: "from-blue-500 to-cyan-500", delay: 200 },
  { icon: "🧘", label: "감정 통제", value: 62, color: "from-purple-500 to-pink-500", delay: 400 },
  { icon: "⚡", label: "대처 능력", value: 91, color: "from-yellow-500 to-amber-500", delay: 600 },
  { icon: "🔍", label: "정보 판별", value: 73, color: "from-green-500 to-emerald-500", delay: 800 },
]

export default function SceneAbilities({ visible, onComplete }: SceneAbilitiesProps) {
  const [step, setStep] = useState(0)
  const [scanIndex, setScanIndex] = useState(-1)
  const [barWidths, setBarWidths] = useState<number[]>(new Array(5).fill(0))

  const animateBars = useCallback(() => {
    ABILITIES.forEach((ability, i) => {
      setTimeout(() => {
        setScanIndex(i)
        setBarWidths(prev => {
          const next = [...prev]
          next[i] = ability.value
          return next
        })
      }, ability.delay)
    })
  }, [])

  useEffect(() => {
    if (!visible) return
    setStep(0)
    setScanIndex(-1)
    setBarWidths(new Array(5).fill(0))

    const timers = [
      setTimeout(() => setStep(1), 200),
      setTimeout(() => {
        setStep(2)
        animateBars()
      }, 600),
      setTimeout(() => setStep(3), 2000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [visible, animateBars])

  if (!visible) return null

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
      {/* Header */}
      <div
        className={`text-center mb-8 transition-all duration-500 ${
          step >= 1 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"
        }`}
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 mb-4">
          <div className={`w-2 h-2 rounded-full ${step >= 2 ? "bg-green-400 animate-pulse" : "bg-yellow-400 animate-ping-slow"}`} />
          <span className="text-xs font-bold text-blue-300 tracking-wider uppercase">
            {step >= 2 ? "Scanning..." : "Initializing"}
          </span>
        </div>
        <h2 className="text-2xl font-black text-white mb-1">5대 투자 능력</h2>
        <p className="text-sm text-gray-500">분석 후 당신의 실제 수치를 확인하세요</p>
      </div>

      {/* Ability bars */}
      <div className="w-full max-w-sm space-y-3">
        {ABILITIES.map((ability, i) => {
          const isScanning = scanIndex === i
          const isScanned = scanIndex > i
          return (
            <div
              key={i}
              className={`relative bg-white/5 rounded-xl p-3 border transition-all duration-500 ${
                step >= 2 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
              } ${isScanning ? "border-blue-500/50 bg-blue-500/5" : isScanned ? "border-white/10" : "border-white/5"}`}
              style={{ transitionDelay: `${ability.delay}ms` }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg">{ability.icon}</span>
                <span className="text-sm font-bold text-white flex-1">{ability.label}</span>
                <span
                  className={`text-xs font-mono font-bold transition-all duration-300 ${
                    barWidths[i] > 0 ? "text-white opacity-100" : "text-gray-600 opacity-50"
                  }`}
                >
                  {barWidths[i] > 0 ? "??" : "--"}
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${ability.color} transition-all duration-700 ease-out`}
                  style={{ width: `${barWidths[i]}%` }}
                />
              </div>
              {isScanning && (
                <div className="absolute inset-0 rounded-xl border-2 border-blue-400/30 animate-pulse pointer-events-none" />
              )}
            </div>
          )
        })}
      </div>

      {/* Locked overlay hint */}
      <div
        className={`mt-6 text-center transition-all duration-500 ${
          step >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <p className="text-xs text-gray-500 mb-1">🔒 실제 수치는 테스트 완료 후 공개됩니다</p>
      </div>

      {/* Tap prompt */}
      <button
        onClick={onComplete}
        className={`absolute bottom-32 left-0 right-0 text-center transition-all duration-500 ${
          step >= 3 ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          <span className="text-sm text-gray-300">탭하여 계속</span>
        </div>
      </button>
    </div>
  )
}
