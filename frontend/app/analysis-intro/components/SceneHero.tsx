"use client"

import { useEffect, useState } from "react"

interface SceneHeroProps {
  visible: boolean
  onComplete: () => void
}

export default function SceneHero({ visible, onComplete }: SceneHeroProps) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!visible) return
    setStep(0)
    const timers = [
      setTimeout(() => setStep(1), 300),
      setTimeout(() => setStep(2), 800),
      setTimeout(() => setStep(3), 1400),
      setTimeout(() => setStep(4), 2200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [visible])

  if (!visible) return null

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
      {/* Glitch title */}
      <div
        className={`transition-all duration-700 ${
          step >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-150"
        }`}
      >
        <div className="relative mb-2">
          <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 tracking-tight">
            DNA
          </span>
          {step >= 1 && (
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl rounded-full animate-pulse" />
          )}
        </div>
      </div>

      <div
        className={`transition-all duration-500 delay-100 ${
          step >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <h1 className="text-2xl font-bold text-white text-center mb-1">
          투자 성향 분석
        </h1>
        <p className="text-sm text-gray-400 text-center tracking-widest uppercase">
          Investor DNA Analysis
        </p>
      </div>

      {/* Animated scanning line */}
      <div
        className={`w-48 h-[2px] my-8 overflow-hidden rounded transition-all duration-500 ${
          step >= 3 ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="h-full bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-scan" />
      </div>

      {/* Stats preview */}
      <div
        className={`flex gap-6 transition-all duration-500 ${
          step >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {[
          { label: "문항", value: "7~21", icon: "🎮" },
          { label: "유형", value: "5", icon: "🧬" },
          { label: "능력", value: "5", icon: "⚡" },
        ].map((stat, i) => (
          <div key={i} className="text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-xl font-black text-white">{stat.value}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tap prompt */}
      <button
        onClick={onComplete}
        className={`absolute bottom-32 left-0 right-0 text-center transition-all duration-500 ${
          step >= 4 ? "opacity-100" : "opacity-0"
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
