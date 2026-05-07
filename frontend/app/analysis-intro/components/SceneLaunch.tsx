"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"

interface SceneLaunchProps {
  visible: boolean
}

const TYPES = [
  { emoji: "🧠", name: "분석가", color: "from-cyan-500/30 to-blue-600/30",     border: "border-cyan-500/40",   glow: "rgba(34,211,238,0.3)",  desc: "데이터 중심" },
  { emoji: "🔥", name: "도전가", color: "from-red-500/30 to-orange-500/30",    border: "border-red-500/40",    glow: "rgba(249,115,22,0.3)",  desc: "공격적 투자" },
  { emoji: "🛡️", name: "안정형", color: "from-green-500/30 to-emerald-500/30", border: "border-green-500/40",  glow: "rgba(52,211,153,0.3)",  desc: "리스크 최소" },
  { emoji: "💖", name: "감성형", color: "from-pink-500/30 to-purple-500/30",   border: "border-pink-500/40",   glow: "rgba(232,121,249,0.3)", desc: "직감 투자"  },
  { emoji: "⚙️", name: "전략가", color: "from-yellow-500/30 to-amber-500/30",  border: "border-yellow-500/40", glow: "rgba(251,191,36,0.3)",  desc: "시스템 매매" },
]

/* 카드 플립 컴포넌트 */
function TypeCard({ type, delay, visible }: {
  type: typeof TYPES[0]
  delay: number
  visible: boolean
}) {
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    if (!visible) { setFlipped(false); return }
    const t = setTimeout(() => setFlipped(true), delay)
    return () => clearTimeout(t)
  }, [visible, delay])

  return (
    <div className="perspective-500" style={{ perspective: "500px" }}>
      <div
        className="relative w-full transition-all duration-500 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(0deg)" : "rotateY(-90deg)",
          transitionDelay: "0ms",
        }}
      >
        <div
          className={`bg-gradient-to-br ${type.color} rounded-2xl p-3 border ${type.border} flex flex-col items-center text-center`}
          style={{
            boxShadow: flipped ? `0 0 20px ${type.glow}` : "none",
            transition: "box-shadow 0.5s ease",
          }}
        >
          <div className="text-3xl mb-1.5 animate-bounce-slow">{type.emoji}</div>
          <div className="text-xs font-black text-white">{type.name}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">{type.desc}</div>
        </div>
      </div>
    </div>
  )
}

/* 미스터리 카드 */
function MysteryCard({ visible }: { visible: boolean }) {
  const [show, setShow] = useState(false)
  const shimmerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!visible) { setShow(false); return }
    const t = setTimeout(() => setShow(true), 200)
    return () => clearTimeout(t)
  }, [visible])

  return (
    <div
      className={`relative rounded-2xl border border-dashed border-white/20 flex flex-col items-center justify-center text-center overflow-hidden transition-all duration-700 ${
        show ? "opacity-100 scale-100" : "opacity-0 scale-75"
      }`}
      style={{ minHeight: "90px" }}
    >
      {/* 배경 shimmer */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
      <div
        ref={shimmerRef}
        className="absolute inset-0 pointer-events-none animate-mystery-shimmer"
        style={{
          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)",
          backgroundSize: "200% 100%",
        }}
      />

      {/* 심장박동 링 */}
      {show && (
        <>
          <div className="absolute inset-0 rounded-2xl border border-blue-400/20 animate-ping-slow" />
          <div className="absolute inset-0 rounded-2xl border border-purple-400/10 animate-ping-slower" />
        </>
      )}

      <div className="relative z-10 py-2">
        <div className="text-3xl mb-1 animate-pulse">❓</div>
        <div className="text-[11px] font-black text-white/70">나의 유형</div>
        <div className="text-[9px] text-gray-600 mt-0.5">테스트 후 공개</div>
      </div>
    </div>
  )
}

export default function SceneLaunch({ visible }: SceneLaunchProps) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [cardsVisible, setCardsVisible] = useState(false)

  useEffect(() => {
    if (!visible) return
    setStep(0); setCardsVisible(false)
    const timers = [
      setTimeout(() => setStep(1), 200),
      setTimeout(() => { setStep(2); setCardsVisible(true) }, 500),
      setTimeout(() => setStep(3), 1800),
    ]
    return () => timers.forEach(clearTimeout)
  }, [visible])

  const handleLaunch = (mode: "quick" | "detailed") => {
    router.push(`/analysis?mode=${mode}`)
  }

  if (!visible) return null

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pb-6">

      {/* 헤더 */}
      <div
        className={`text-center mb-6 transition-all duration-500 ${
          step >= 1 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"
        }`}
      >
        <p className="text-[11px] font-bold text-blue-400/80 tracking-[0.25em] uppercase mb-2">
          Investor DNA
        </p>
        <h2 className="text-[26px] font-black text-white leading-tight mb-1">
          당신의 유형은?
        </h2>
        <p className="text-sm text-gray-500">5가지 투자자 유형 중 하나가 당신입니다</p>
      </div>

      {/* 타입 카드 그리드 */}
      <div className="w-full max-w-sm">
        {/* 상단 3개 */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          {TYPES.slice(0, 3).map((type, i) => (
            <TypeCard key={i} type={type} delay={i * 140} visible={cardsVisible} />
          ))}
        </div>
        {/* 하단: 2개 + 미스터리 카드 */}
        <div className="grid grid-cols-3 gap-2">
          {TYPES.slice(3).map((type, i) => (
            <TypeCard key={i} type={type} delay={(i + 3) * 140} visible={cardsVisible} />
          ))}
          <MysteryCard visible={cardsVisible} />
        </div>
      </div>

      {/* 모드 선택 버튼 */}
      <div
        className={`mt-6 w-full max-w-sm flex flex-col gap-2.5 transition-all duration-700 ${
          step >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* 간략 측정 */}
        <button onClick={() => handleLaunch("quick")} className="w-full relative group">
          <div className="absolute -inset-[1px] bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 rounded-2xl opacity-0 group-hover:opacity-70 blur-[2px] transition-opacity duration-300 animate-gradient-x" />
          <div className="relative flex items-center justify-between h-[68px] bg-gradient-to-r from-emerald-600/90 to-cyan-600/90 rounded-[14px] px-5 text-white overflow-hidden group-active:scale-[0.98] transition-transform">
            {/* 버튼 내부 shimmer */}
            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="flex items-center gap-3 relative z-10">
              <span className="text-xl">⚡</span>
              <div className="text-left">
                <div className="font-black text-[15px] leading-tight">간략 측정</div>
                <div className="text-[11px] text-white/65 font-medium mt-0.5">핵심 7문항 · 약 2분</div>
              </div>
            </div>
            <div className="flex items-center gap-2 relative z-10">
              <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">추천</span>
              <span className="text-base opacity-70 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </button>

        {/* 세부 측정 */}
        <button onClick={() => handleLaunch("detailed")} className="w-full relative group">
          <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-60 blur-[2px] transition-opacity duration-300" />
          <div className="relative flex items-center justify-between h-[68px] bg-gradient-to-r from-blue-700/90 to-purple-700/90 rounded-[14px] px-5 text-white overflow-hidden group-active:scale-[0.98] transition-transform">
            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="flex items-center gap-3 relative z-10">
              <span className="text-xl">🔬</span>
              <div className="text-left">
                <div className="font-black text-[15px] leading-tight">세부 측정</div>
                <div className="text-[11px] text-white/65 font-medium mt-0.5">전체 21문항 · 약 7분 · 시나리오 포함</div>
              </div>
            </div>
            <span className="text-base opacity-70 group-hover:translate-x-1 transition-transform relative z-10">→</span>
          </div>
        </button>

        <p className="text-center text-[11px] text-gray-600 mt-0.5">
          간략 측정으로도 충분히 정확한 결과를 얻을 수 있어요!
        </p>
      </div>

      <style>{`
        @keyframes pingSlower {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0; transform: scale(1.08); }
        }
        .animate-ping-slow   { animation: pingSlower 1.8s ease-in-out infinite; }
        .animate-ping-slower { animation: pingSlower 2.8s ease-in-out infinite 0.5s; }

        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-slow { animation: bounceSlow 2s ease-in-out infinite; }

        @keyframes mysteryShimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-mystery-shimmer {
          animation: mysteryShimmer 2.5s linear infinite;
          background-size: 200% 100%;
        }

        @keyframes gradientX {
          0%, 100% { background-position: 0% 50%; }
          50%       { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradientX 2s ease infinite;
        }
      `}</style>
    </div>
  )
}
