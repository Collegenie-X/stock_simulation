"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"

type SelectedMode = "quick" | "detailed" | null

interface SceneLaunchProps {
  visible: boolean
}

const TYPES = [
  { emoji: "🧠", name: "분석가", color: "from-cyan-500/30 to-blue-500/30 border-cyan-500/40", desc: "데이터 중심" },
  { emoji: "🔥", name: "도전가", color: "from-red-500/30 to-orange-500/30 border-red-500/40", desc: "공격적 투자" },
  { emoji: "🛡️", name: "안정형", color: "from-green-500/30 to-emerald-500/30 border-green-500/40", desc: "리스크 최소" },
  { emoji: "💖", name: "감성형", color: "from-pink-500/30 to-purple-500/30 border-pink-500/40", desc: "직감 투자" },
  { emoji: "⚙️", name: "전략가", color: "from-yellow-500/30 to-amber-500/30 border-yellow-500/40", desc: "시스템 매매" },
]

export default function SceneLaunch({ visible }: SceneLaunchProps) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [selectedMode, setSelectedMode] = useState<SelectedMode>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!visible) return
    setStep(0)
    setCountdown(null)
    setSelectedMode(null)

    const timers = [
      setTimeout(() => setStep(1), 200),
      setTimeout(() => setStep(2), 600),
      setTimeout(() => setStep(3), 1800),
    ]
    return () => {
      timers.forEach(clearTimeout)
      if (countdownRef.current) clearTimeout(countdownRef.current)
    }
  }, [visible])

  const handleLaunch = (mode: "quick" | "detailed") => {
    setSelectedMode(mode)
    setCountdown(3)
    let count = 3
    const tick = () => {
      count--
      if (count <= 0) {
        router.push(`/analysis?mode=${mode}`)
        return
      }
      setCountdown(count)
      countdownRef.current = setTimeout(tick, 600)
    }
    countdownRef.current = setTimeout(tick, 600)
  }

  if (!visible) return null

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center">
            <div
              key={countdown}
              className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-purple-500 animate-bounceIn"
            >
              {countdown > 0 ? countdown : "GO!"}
            </div>
            <p className="text-gray-400 mt-4 text-sm tracking-widest uppercase">
              {countdown > 0 ? "준비하세요..." : "시작합니다!"}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div
        className={`text-center mb-8 transition-all duration-500 ${
          step >= 1 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"
        }`}
      >
        <h2 className="text-2xl font-black text-white mb-1">당신의 유형은?</h2>
        <p className="text-sm text-gray-500">5가지 투자자 유형 중 하나가 당신입니다</p>
      </div>

      {/* Type cards */}
      <div
        className={`w-full max-w-sm transition-all duration-700 ${
          step >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="grid grid-cols-3 gap-2 mb-3">
          {TYPES.slice(0, 3).map((type, i) => (
            <div
              key={i}
              className={`bg-gradient-to-br ${type.color} rounded-2xl p-3 border flex flex-col items-center text-center transition-all duration-500`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div className="text-3xl mb-1 animate-float" style={{ animationDelay: `${i * 200}ms` }}>
                {type.emoji}
              </div>
              <div className="text-xs font-bold text-white">{type.name}</div>
              <div className="text-[10px] text-gray-400">{type.desc}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {TYPES.slice(3).map((type, i) => (
            <div
              key={i}
              className={`bg-gradient-to-br ${type.color} rounded-2xl p-3 border flex flex-col items-center text-center transition-all duration-500`}
              style={{ transitionDelay: `${(i + 3) * 150}ms` }}
            >
              <div className="text-3xl mb-1 animate-float" style={{ animationDelay: `${(i + 3) * 200}ms` }}>
                {type.emoji}
              </div>
              <div className="text-xs font-bold text-white">{type.name}</div>
              <div className="text-[10px] text-gray-400">{type.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mystery card */}
      <div
        className={`mt-4 w-full max-w-sm transition-all duration-500 ${
          step >= 3 ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
      >
        <div className="bg-white/5 rounded-2xl p-4 border border-dashed border-white/20 text-center">
          <div className="text-3xl mb-1">❓</div>
          <p className="text-sm text-gray-400">
            분석을 완료하면 <span className="text-white font-bold">당신의 유형</span>이 공개됩니다
          </p>
        </div>
      </div>

      {/* Mode selection buttons */}
      <div
        className={`mt-8 w-full max-w-sm flex flex-col gap-3 transition-all duration-700 ${
          step >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Quick mode */}
        <button
          onClick={() => handleLaunch("quick")}
          disabled={countdown !== null}
          className="w-full relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 via-cyan-600 to-emerald-600 rounded-2xl opacity-60 group-hover:opacity-100 blur-sm transition-opacity" />
          <div className="relative flex items-center justify-between h-[72px] bg-gradient-to-r from-emerald-600/90 to-cyan-600/90 rounded-2xl px-5 text-white">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div className="text-left">
                <div className="font-black text-base">간략 측정</div>
                <div className="text-[11px] text-white/70 font-medium">핵심 7문항 · 약 2분</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">추천</span>
              <span className="text-lg">→</span>
            </div>
          </div>
        </button>

        {/* Detailed mode */}
        <button
          onClick={() => handleLaunch("detailed")}
          disabled={countdown !== null}
          className="w-full relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl opacity-50 group-hover:opacity-90 blur-sm transition-opacity" />
          <div className="relative flex items-center justify-between h-[72px] bg-gradient-to-r from-blue-600/90 to-purple-600/90 rounded-2xl px-5 text-white">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔬</span>
              <div className="text-left">
                <div className="font-black text-base">세부 측정</div>
                <div className="text-[11px] text-white/70 font-medium">전체 21문항 · 약 7분 · 시나리오 포함</div>
              </div>
            </div>
            <span className="text-lg">→</span>
          </div>
        </button>

        <p className="text-center text-[11px] text-gray-600 mt-1">
          간략 측정으로도 충분히 정확한 결과를 얻을 수 있어요!
        </p>
      </div>
    </div>
  )
}
