"use client"

import { useEffect, useState, useCallback, useRef } from "react"

interface SceneAbilitiesProps {
  visible: boolean
  onComplete: () => void
}

const ABILITIES = [
  { icon: "🎲", label: "리스크 감수도", value: 78, color: "from-red-500 to-orange-400",    bar: "#f97316", delay: 0   },
  { icon: "📊", label: "분석력",         value: 85, color: "from-blue-500 to-cyan-400",     bar: "#22d3ee", delay: 220 },
  { icon: "🧘", label: "감정 통제",      value: 62, color: "from-purple-500 to-pink-400",   bar: "#e879f9", delay: 440 },
  { icon: "⚡", label: "대처 능력",      value: 91, color: "from-yellow-400 to-amber-400",  bar: "#fbbf24", delay: 660 },
  { icon: "🔍", label: "정보 판별",      value: 73, color: "from-green-500 to-emerald-400", bar: "#34d399", delay: 880 },
]

/* 슬롯머신 스타일 숫자 카운터 */
function SlotNumber({ target, active }: { target: number; active: boolean }) {
  const [display, setDisplay] = useState("--")
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!active) { setDisplay("--"); return }
    const start = performance.now()
    const spin = (now: number) => {
      const elapsed = now - start
      if (elapsed < 500) {
        // 빠르게 랜덤 숫자 spin
        setDisplay(String(Math.floor(Math.random() * 99 + 1)).padStart(2, "0"))
        rafRef.current = requestAnimationFrame(spin)
      } else {
        // 슬로우 다운 후 정착
        const t = Math.min((elapsed - 500) / 400, 1)
        const ease = 1 - Math.pow(1 - t, 2)
        const cur = Math.round(ease * target)
        setDisplay(String(cur))
        if (t < 1) rafRef.current = requestAnimationFrame(spin)
        else setDisplay(String(target))
      }
    }
    rafRef.current = requestAnimationFrame(spin)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active, target])

  return (
    <span className={`text-sm font-mono font-black tabular-nums w-8 text-right transition-colors duration-300 ${
      active || display !== "--" ? "text-white" : "text-gray-700"
    }`}>
      {display}
    </span>
  )
}

/* 개별 능력 바 */
function AbilityBar({
  ability, barWidth, active, scanned, idx,
}: {
  ability: typeof ABILITIES[0]
  barWidth: number
  active: boolean
  scanned: boolean
  idx: number
}) {
  return (
    <div
      className={`relative rounded-2xl p-3.5 border transition-all duration-400 ${
        active   ? "bg-white/8 border-blue-400/60 scale-[1.02]" :
        scanned  ? "bg-white/5 border-white/10 scale-100" :
                   "bg-white/3 border-white/5  scale-100"
      }`}
      style={{ transitionDelay: `${idx * 30}ms` }}
    >
      {/* 스캔 중 가로 광선 */}
      {active && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div
            className="absolute left-0 right-0 h-[1px] animate-scan-beam"
            style={{ background: `linear-gradient(90deg, transparent, ${ability.bar}, transparent)` }}
          />
        </div>
      )}

      <div className="flex items-center gap-3 mb-2.5">
        <span className="text-xl">{ability.icon}</span>
        <span className="text-sm font-bold text-white flex-1">{ability.label}</span>
        <SlotNumber target={ability.value} active={active || scanned} />
      </div>

      <div className="h-2 bg-white/8 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${ability.color} transition-all duration-700 ease-out relative`}
          style={{ width: `${barWidth}%` }}
        >
          {/* 바 끝 반짝임 */}
          {(active || scanned) && barWidth > 0 && (
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/40 blur-sm" />
          )}
        </div>
      </div>
    </div>
  )
}

export default function SceneAbilities({ visible, onComplete }: SceneAbilitiesProps) {
  const [step, setStep] = useState(0)
  const [scanIndex, setScanIndex] = useState(-1)
  const [barWidths, setBarWidths] = useState<number[]>(new Array(5).fill(0))
  const [done, setDone] = useState(false)
  const [flashDone, setFlashDone] = useState(false)

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
    const last = ABILITIES[ABILITIES.length - 1].delay + 1100
    setTimeout(() => {
      setScanIndex(ABILITIES.length) // 모두 완료
      setDone(true)
      setFlashDone(true)
      setTimeout(() => setFlashDone(false), 600)
      setTimeout(() => setStep(3), 700)
    }, last)
  }, [])

  useEffect(() => {
    if (!visible) return
    setStep(0); setScanIndex(-1)
    setBarWidths(new Array(5).fill(0))
    setDone(false); setFlashDone(false)

    const t1 = setTimeout(() => setStep(1), 200)
    const t2 = setTimeout(() => { setStep(2); animateBars() }, 700)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [visible, animateBars])

  if (!visible) return null

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">

      {/* 완료 플래시 오버레이 */}
      <div
        className={`fixed inset-0 pointer-events-none z-50 transition-opacity duration-300 ${
          flashDone ? "opacity-100" : "opacity-0"
        }`}
        style={{ background: "radial-gradient(ellipse at center, rgba(59,130,246,0.18) 0%, transparent 70%)" }}
      />

      {/* 헤더 */}
      <div
        className={`text-center mb-6 transition-all duration-500 ${
          step >= 1 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"
        }`}
      >
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-4 transition-all duration-700 ${
          done
            ? "bg-green-500/15 border-green-500/40 shadow-[0_0_20px_rgba(74,222,128,0.2)]"
            : "bg-blue-500/15 border-blue-500/30"
        }`}>
          {done ? (
            <span className="text-green-400 text-xs">✓</span>
          ) : (
            <div className={`w-2 h-2 rounded-full ${step >= 2 ? "bg-blue-400 animate-ping" : "bg-yellow-400 animate-pulse"}`} />
          )}
          <span className={`text-xs font-bold tracking-wider uppercase transition-colors duration-500 ${
            done ? "text-green-300" : "text-blue-300"
          }`}>
            {done ? "Analysis Complete" : step >= 2 ? "Scanning DNA..." : "Initializing"}
          </span>
        </div>
        <h2 className="text-2xl font-black text-white mb-1">5대 투자 능력</h2>
        <p className="text-sm text-gray-500">분석 후 당신의 실제 수치를 확인하세요</p>
      </div>

      {/* 능력 바 목록 */}
      <div className="w-full max-w-sm space-y-2.5">
        {ABILITIES.map((ability, i) => (
          <div
            key={i}
            className="transition-all duration-500"
            style={{
              opacity: step >= 2 ? 1 : 0,
              transform: step >= 2 ? "translateX(0)" : "translateX(-20px)",
              transitionDelay: `${i * 80}ms`,
            }}
          >
            <AbilityBar
              ability={ability}
              barWidth={barWidths[i]}
              active={scanIndex === i}
              scanned={scanIndex > i}
              idx={i}
            />
          </div>
        ))}
      </div>

      {/* 완료 메시지 */}
      <div
        className={`mt-5 transition-all duration-600 ${
          done ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-3 scale-95"
        }`}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/25">
          <span className="text-green-400 text-sm">🔒</span>
          <p className="text-xs text-green-300 font-medium">실제 수치는 테스트 완료 후 공개됩니다</p>
        </div>
      </div>

      {/* 탭 버튼 */}
      <button
        onClick={onComplete}
        className={`absolute bottom-28 left-0 right-0 text-center transition-all duration-500 ${
          step >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/15 bg-white/6 backdrop-blur-sm hover:bg-white/12 active:scale-95 transition-all">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          <span className="text-sm text-gray-300">탭하여 계속</span>
        </div>
      </button>

      <style>{`
        @keyframes scanBeam {
          0%   { top: 0%;   opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-beam {
          animation: scanBeam 0.9s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
