"use client"

import type React from "react"
import { useState, useCallback, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { storage } from "@/lib/storage"

// ─── 캔버스 기반 애니메이션 차트 ─────────────────────────────
const CHART_DATA: number[][] = [
  [30, 35, 28, 38, 45, 42, 50, 48, 55, 58, 52, 60, 65, 62, 70, 75],
  [70, 68, 65, 60, 40, 25, 30, 42, 38, 45, 50, 48, 55, 60, 58, 65],
  [35, 40, 50, 45, 55, 60, 52, 65, 70, 68, 75, 72, 80, 78, 82, 88],
  [50, 55, 48, 58, 62, 55, 68, 72, 65, 75, 78, 70, 82, 85, 80, 90],
]
const CHART_COLORS: Record<string, { stroke: string; fill1: string; fill2: string; dot: string }> = {
  green:  { stroke: "#22c55e", fill1: "rgba(34,197,94,0.3)",  fill2: "rgba(34,197,94,0)", dot: "rgba(34,197,94,0.25)" },
  yellow: { stroke: "#eab308", fill1: "rgba(234,179,8,0.25)", fill2: "rgba(234,179,8,0)", dot: "rgba(234,179,8,0.2)" },
  cyan:   { stroke: "#06b6d4", fill1: "rgba(6,182,212,0.25)", fill2: "rgba(6,182,212,0)", dot: "rgba(6,182,212,0.2)" },
  indigo: { stroke: "#6366f1", fill1: "rgba(99,102,241,0.25)",fill2: "rgba(99,102,241,0)",dot: "rgba(99,102,241,0.2)" },
}

function AnimatedMiniChart({ variant, accent, trigger }: { variant: number; accent: string; trigger: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const W = 300
    const H = 90
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = "100%"
    canvas.style.height = "100%"

    const pts = CHART_DATA[variant % CHART_DATA.length]
    const total = pts.length
    const xStep = W / (total - 1)
    const norm = (v: number) => H - (v / 100) * H * 0.85 - H * 0.05
    const colors = CHART_COLORS[accent] ?? CHART_COLORS.green

    let drawn = 0
    let raf: number

    function frame() {
      drawn += 0.25
      ctx!.clearRect(0, 0, W, H)
      const count = Math.min(Math.floor(drawn), total)
      if (count < 2) { raf = requestAnimationFrame(frame); return }

      const grad = ctx!.createLinearGradient(0, 0, 0, H)
      grad.addColorStop(0, colors.fill1)
      grad.addColorStop(1, colors.fill2)
      ctx!.beginPath()
      ctx!.moveTo(0, norm(pts[0]))
      for (let i = 1; i < count; i++) ctx!.lineTo(i * xStep, norm(pts[i]))
      ctx!.lineTo((count - 1) * xStep, H)
      ctx!.lineTo(0, H)
      ctx!.closePath()
      ctx!.fillStyle = grad
      ctx!.fill()

      ctx!.beginPath()
      ctx!.moveTo(0, norm(pts[0]))
      for (let i = 1; i < count; i++) ctx!.lineTo(i * xStep, norm(pts[i]))
      ctx!.strokeStyle = colors.stroke
      ctx!.lineWidth = 2
      ctx!.lineJoin = "round"
      ctx!.lineCap = "round"
      ctx!.stroke()

      const lx = (count - 1) * xStep
      const ly = norm(pts[count - 1])
      ctx!.beginPath(); ctx!.arc(lx, ly, 3, 0, Math.PI * 2); ctx!.fillStyle = colors.stroke; ctx!.fill()
      ctx!.beginPath(); ctx!.arc(lx, ly, 7, 0, Math.PI * 2); ctx!.fillStyle = colors.dot; ctx!.fill()

      if (drawn < total) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [variant, accent, trigger])

  return <canvas ref={canvasRef} className="w-full h-full" />
}

// ─── 슬라이드별 "실전 화면" 미리보기 ────────────────────────
function SlidePreview({ idx, trigger }: { idx: number; trigger: number }) {
  if (idx === 0) {
    return (
      <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden">
        <div className="h-32 p-2"><AnimatedMiniChart variant={0} accent="green" trigger={trigger} /></div>
        <div className="px-3 pb-3 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-600">현재가</p>
              <p className="text-sm font-black text-white">56,200원</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-600">손익</p>
              <p className="text-sm font-black text-green-400">+3,200원</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <div className="h-8 rounded-lg bg-green-500/20 border border-green-500/40 flex items-center justify-center">
              <span className="text-[10px] font-black text-green-400">살래</span>
            </div>
            <div className="h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center">
              <span className="text-[10px] font-black text-red-400">팔래</span>
            </div>
            <div className="h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <span className="text-[10px] font-black text-gray-400">기다릴게</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (idx === 1) {
    // 이벤트 시나리오 화면 미리보기
    return (
      <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden">
        <div className="h-24 p-2"><AnimatedMiniChart variant={1} accent="yellow" trigger={trigger} /></div>
        <div className="px-3 pb-3 space-y-2">
          <div className="bg-red-500/15 border border-red-500/30 rounded-xl px-3 py-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">🚨</span>
              <span className="text-[10px] font-black text-red-400">긴급 뉴스</span>
            </div>
            <p className="text-[10px] text-gray-300 leading-snug">
              &quot;A사 실적 쇼크, 예상치 40% 하회&quot;
            </p>
          </div>
          <div className="flex gap-1.5">
            <div className="flex-1 h-9 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center gap-1">
              <span className="text-[10px] font-black text-red-400">즉시 매도</span>
            </div>
            <div className="flex-1 h-9 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center gap-1">
              <span className="text-[10px] font-black text-yellow-400">일부 매도</span>
            </div>
            <div className="flex-1 h-9 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center gap-1">
              <span className="text-[10px] font-black text-blue-400">홀딩</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (idx === 2) {
    // 실전 종목 데이터 미리보기
    return (
      <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden">
        <div className="h-28 p-2"><AnimatedMiniChart variant={2} accent="cyan" trigger={trigger} /></div>
        <div className="px-3 pb-3 space-y-1.5">
          {[
            { name: "레인보우로보틱스", pct: "+18.5%", color: "text-green-400" },
            { name: "두산로보틱스", pct: "+12.3%", color: "text-green-400" },
            { name: "엔비디아(NVDA)", pct: "+45.2%", color: "text-green-400" },
          ].map((s) => (
            <div key={s.name} className="flex items-center justify-between py-1 px-1">
              <span className="text-[10px] text-gray-300 font-bold">{s.name}</span>
              <span className={`text-[10px] font-black ${s.color}`}>{s.pct}</span>
            </div>
          ))}
          <p className="text-[9px] text-gray-600 text-center pt-1">실제 1년 데이터 기반 시뮬레이션</p>
        </div>
      </div>
    )
  }

  // idx === 3: AI 대결 미리보기
  return (
    <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden">
      <div className="h-20 p-2"><AnimatedMiniChart variant={3} accent="indigo" trigger={trigger} /></div>
      <div className="px-3 pb-3 space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex-1 text-center">
            <div className="text-xl mb-0.5">🧑</div>
            <p className="text-[10px] font-black text-white">나</p>
            <p className="text-sm font-black text-green-400">+8.2%</p>
          </div>
          <div className="text-lg font-black text-gray-600">VS</div>
          <div className="flex-1 text-center">
            <div className="text-xl mb-0.5">🤖</div>
            <p className="text-[10px] font-black text-indigo-300">AI 멘토</p>
            <p className="text-sm font-black text-indigo-400">+11.5%</p>
          </div>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-2.5 py-1.5">
          <p className="text-[9px] text-indigo-300 leading-snug">
            💬 &quot;3턴에서 매도 타이밍을 놓쳤어요. 저항선 근처에서 일부 매도가 더 좋았을 거예요&quot;
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── 슬라이드 데이터 ────────────────────────────────────────
const slides = [
  {
    accent: "green" as const,
    accentClass: "text-green-400",
    glowClass: "bg-green-500/10",
    badge: "CHART TRAINING",
    title: "차트로 읽는\n시장의 흐름",
    desc: "실전과 동일한 차트를 보며\n매수·매도 타이밍을 직접 판단하세요",
  },
  {
    accent: "yellow" as const,
    accentClass: "text-yellow-400",
    glowClass: "bg-yellow-500/8",
    badge: "EVENT SCENARIO",
    title: "돌발 이벤트!\n당신의 판단은?",
    desc: "급등, 폭락, 실적 발표 —\n상황별 대응 능력을 훈련합니다",
  },
  {
    accent: "cyan" as const,
    accentClass: "text-cyan-400",
    glowClass: "bg-cyan-500/8",
    badge: "REAL DATA",
    title: "AI·로봇주\n실전 데이터로 연습",
    desc: "가장 핫한 테마주의 실제 1년 데이터로\n주식 파동의 흐름을 타는 연습",
  },
  {
    accent: "indigo" as const,
    accentClass: "text-indigo-400",
    glowClass: "bg-indigo-500/8",
    badge: "AI BATTLE",
    title: "나와 비슷한 AI와\n대결하며 배우기",
    desc: "투자 DNA를 분석하고\nAI 코멘트와 비교하며 실력 향상",
  },
]

// ─── 메인 컴포넌트 ──────────────────────────────────────────
export default function OnboardingPage() {
  const [current, setCurrent] = useState(0)
  const [touchX, setTouchX] = useState(0)
  const [touchEndX, setTouchEndX] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => setTouchX(e.targetTouches[0].clientX)
  const handleTouchMove = (e: React.TouchEvent) => setTouchEndX(e.targetTouches[0].clientX)
  const handleTouchEnd = () => {
    if (touchX - touchEndX > 75 && current < slides.length - 1) setCurrent(c => c + 1)
    if (touchX - touchEndX < -75 && current > 0) setCurrent(c => c - 1)
  }

  const finish = useCallback(() => {
    storage.setOnboardingComplete()
    window.location.href = "/analysis-intro"
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
            건너뛰기
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
          {current === slides.length - 1 ? "시작하기" : "다음"}
          {current < slides.length - 1 && <ChevronRight className="ml-1 w-5 h-5" />}
        </Button>
        {current === slides.length - 1 && (
          <p className="text-[10px] text-gray-700 text-center mt-3">100% 무료 · 회원가입 없이 바로 시작</p>
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
