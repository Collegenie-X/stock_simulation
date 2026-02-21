"use client"

import { useMemo } from "react"
import { Zap, Timer, Mountain, ChevronRight } from "lucide-react"
import { storage } from "@/lib/storage"

function generateMiniChart(volatility: number, trend: number): number[] {
  const data: number[] = [50]
  for (let i = 1; i < 20; i++) {
    const prev = data[i - 1]
    const change = (Math.random() - 0.5 + trend * 0.1) * volatility
    data.push(Math.max(10, Math.min(90, prev + change)))
  }
  return data
}

function MiniSvgChart({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null
  const W = 80
  const H = 36
  const stepX = W / (data.length - 1)
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((v, i) => ({
    x: i * stepX,
    y: H - ((v - min) / range) * H * 0.8 - H * 0.1,
  }))

  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const cp1x = points[i - 1].x + stepX * 0.35
    const cp2x = points[i].x - stepX * 0.35
    d += ` C ${cp1x} ${points[i - 1].y}, ${cp2x} ${points[i].y}, ${points[i].x} ${points[i].y}`
  }

  const areaD = `${d} L ${points[points.length - 1].x} ${H} L 0 ${H} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-20 h-9">
      <defs>
        <linearGradient id={`mini-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#mini-${color})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

const MODES = [
  {
    id: "sprint",
    icon: Zap,
    name: "스프린트",
    duration: "약 5분",
    period: "1개월 시뮬레이션",
    decisions: "22번의 매매 판단",
    highlight: "빠른 직감 훈련",
    volatility: 8,
    trend: 0.3,
    color: "#FF6B35",
    gradient: "from-orange-500/20 to-amber-500/20",
    border: "border-orange-500/20",
    settings: { speedMode: "sprint", timerSeconds: 10, simulationMonths: 1, dailyOpportunities: 2 },
  },
  {
    id: "standard",
    icon: Timer,
    name: "스탠다드",
    duration: "약 10분",
    period: "3개월 시뮬레이션",
    decisions: "33번의 매매 판단",
    highlight: "균형 잡힌 전략",
    volatility: 5,
    trend: 0.1,
    color: "#3182F6",
    gradient: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/20",
    settings: { speedMode: "standard", timerSeconds: 15, simulationMonths: 3, dailyOpportunities: 2 },
  },
  {
    id: "marathon",
    icon: Mountain,
    name: "마라톤",
    duration: "약 30분",
    period: "12개월 시뮬레이션",
    decisions: "66번의 매매 판단",
    highlight: "장기 투자 마스터",
    volatility: 3,
    trend: 0.2,
    color: "#8B5CF6",
    gradient: "from-purple-500/20 to-violet-500/20",
    border: "border-purple-500/20",
    settings: { speedMode: "marathon", timerSeconds: 20, simulationMonths: 12, dailyOpportunities: 3 },
  },
] as const

export default function GameModeCards() {
  const charts = useMemo(
    () => MODES.map((m) => generateMiniChart(m.volatility, m.trend)),
    []
  )

  const handleSelect = (mode: (typeof MODES)[number]) => {
    storage.setGameSettings(mode.settings as any)
    window.location.href = "/practice/setup"
  }

  return (
    <div className="px-5">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-gray-400 tracking-wider uppercase">
          시뮬레이션 모드
        </h3>
        <p className="text-[11px] text-gray-600 mt-0.5">
          실전 데이터 기반 · 매 턴마다 매수/매도/관망을 결정하세요
        </p>
      </div>
      <div className="space-y-2.5">
        {MODES.map((mode, i) => {
          const Icon = mode.icon
          return (
            <button
              key={mode.id}
              onClick={() => handleSelect(mode)}
              className={`w-full bg-gradient-to-r ${mode.gradient} rounded-2xl border ${mode.border} p-4 flex items-center justify-between active:scale-[0.98] transition-transform`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${mode.color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color: mode.color }} />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{mode.name}</span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                      style={{ backgroundColor: `${mode.color}20`, color: mode.color }}
                    >
                      {mode.duration}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {mode.period} · {mode.decisions}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: mode.color }}>
                    {mode.highlight}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MiniSvgChart data={charts[i]} color={mode.color} />
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
