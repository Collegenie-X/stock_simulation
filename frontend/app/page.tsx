"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { storage } from "@/lib/storage"

// ─── 애니메이션 차트 (캔버스 기반, 실시간 드로잉) ────────────
function AnimatedChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const W = 400
    const H = 300
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = `${W}px`
    canvas.style.height = `${H}px`

    const points = [
      10, 45, 40, 55, 38, 60, 50, 42, 35, 55, 65,
      58, 50, 62, 70, 68, 55, 75, 80, 72, 85, 78,
      90, 82, 75, 88, 95, 90, 80, 92,
    ]
    const totalPts = points.length
    const xStep = W / (totalPts - 1)
    const norm = (v: number) => H - (v / 100) * H * 0.8 - H * 0.1

    let drawn = 0
    let raf: number

    function draw() {
      if (drawn >= totalPts) return
      drawn += 0.3

      ctx!.clearRect(0, 0, W, H)

      const count = Math.min(Math.floor(drawn), totalPts)
      if (count < 2) { raf = requestAnimationFrame(draw); return }

      // 영역 채우기
      const grad = ctx!.createLinearGradient(0, 0, 0, H)
      grad.addColorStop(0, "rgba(34,197,94,0.25)")
      grad.addColorStop(1, "rgba(34,197,94,0)")
      ctx!.beginPath()
      ctx!.moveTo(0, norm(points[0]))
      for (let i = 1; i < count; i++) ctx!.lineTo(i * xStep, norm(points[i]))
      ctx!.lineTo((count - 1) * xStep, H)
      ctx!.lineTo(0, H)
      ctx!.closePath()
      ctx!.fillStyle = grad
      ctx!.fill()

      // 라인
      ctx!.beginPath()
      ctx!.moveTo(0, norm(points[0]))
      for (let i = 1; i < count; i++) ctx!.lineTo(i * xStep, norm(points[i]))
      ctx!.strokeStyle = "#22c55e"
      ctx!.lineWidth = 2.5
      ctx!.lineJoin = "round"
      ctx!.lineCap = "round"
      ctx!.stroke()

      // 끝점 원
      const lastX = (count - 1) * xStep
      const lastY = norm(points[count - 1])
      ctx!.beginPath()
      ctx!.arc(lastX, lastY, 4, 0, Math.PI * 2)
      ctx!.fillStyle = "#22c55e"
      ctx!.fill()
      ctx!.beginPath()
      ctx!.arc(lastX, lastY, 8, 0, Math.PI * 2)
      ctx!.fillStyle = "rgba(34,197,94,0.2)"
      ctx!.fill()

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  return <canvas ref={canvasRef} className="w-full h-full" />
}

// ─── 메인 ──────────────────────────────────────────────────
export default function FlashPage() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(interval); return 100 }
        return prev + 4
      })
    }, 70)

    const timer = setTimeout(() => {
      const done = storage.getOnboardingStatus()
      router.push(done ? "/home" : "/onboarding")
    }, 2500)

    return () => { clearInterval(interval); clearTimeout(timer) }
  }, [router])

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* 배경 애니메이션 차트 */}
      <div className="absolute inset-0 opacity-20">
        <AnimatedChart />
      </div>

      {/* 글로우 */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] bg-green-500/12 rounded-full blur-[100px] animate-pulse-slow" />

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 text-center px-6">
        <div className="mb-6">
          <div className="text-[90px] leading-none animate-float">📈</div>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight mb-2">파도를 타라</h1>
        <p className="text-lg font-bold text-green-400 mb-1">차트로 배우는 실전 투자</p>
        <p className="text-sm text-gray-500">AI와 대결하며 성장하는 투자 교육</p>
      </div>

      {/* 프로그레스 바 */}
      <div className="relative z-10 mt-12 w-44">
        <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-[10px] text-gray-600 text-center mt-2">{progress < 100 ? '로딩 중...' : '준비 완료!'}</p>
      </div>

      {/* 하단 */}
      <div className="absolute bottom-8 text-center z-10">
        <p className="text-[10px] text-gray-700">v2.0 · 100% 무료 · 회원가입 불필요</p>
      </div>

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .animate-float { animation: float 2.5s ease-in-out infinite; }
        @keyframes pulseSlow { 0%,100%{opacity:0.7} 50%{opacity:1} }
        .animate-pulse-slow { animation: pulseSlow 3s ease-in-out infinite; }
      `}</style>
    </div>
  )
}
