"use client"

import { useMemo } from "react"
import { storage } from "@/lib/storage"

// ─── Animated Mini Chart with moving dot ──────────────────────────────────────

function generateChart(volatility: number, trend: number): number[] {
  const data: number[] = [50]
  for (let i = 1; i < 24; i++) {
    const prev = data[i - 1]
    const change = (Math.random() - 0.5 + trend * 0.1) * volatility
    data.push(Math.max(8, Math.min(92, prev + change)))
  }
  return data
}

function LiveChart({ data, color, glow }: { data: number[]; color: string; glow: string }) {
  const W = 120
  const H = 60
  const stepX = W / (data.length - 1)
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => ({ x: i * stepX, y: H - ((v - min) / range) * H * 0.85 - H * 0.075 }))

  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const cp1x = pts[i - 1].x + stepX * 0.4
    const cp2x = pts[i].x - stepX * 0.4
    d += ` C ${cp1x} ${pts[i - 1].y}, ${cp2x} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`
  }
  const last = pts[pts.length - 1]
  const areaD = `${d} L ${last.x} ${H} L 0 ${H} Z`
  const gid = `lc-${color.replace("#", "")}`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="0" y1={H * 0.5} x2={W} y2={H * 0.5} stroke={color} strokeOpacity="0.1" strokeDasharray="2 3" />
      <path d={areaD} fill={`url(#${gid})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 6px ${glow})` }} />
      <circle cx={last.x} cy={last.y} r="6" fill={color} opacity="0.25" className="animate-ping-slow" />
      <circle cx={last.x} cy={last.y} r="2.8" fill="#fff" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

// ─── Mode Mascot SVGs ─────────────────────────────────────────────────────────

function SprintIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full">
      <circle cx="24" cy="24" r="22" fill={`${color}22`} stroke={`${color}55`} strokeWidth="1" />
      <path
        d="M26 8 L13 27 H22 L20 40 L35 19 H26 L28 8 Z"
        fill={color}
        className="animate-flameJitter"
        style={{ transformOrigin: "24px 24px", filter: `drop-shadow(0 0 8px ${color})` }}
      />
    </svg>
  )
}

function StandardIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full">
      <circle cx="24" cy="24" r="22" fill={`${color}22`} stroke={`${color}55`} strokeWidth="1" />
      <circle cx="24" cy="24" r="14" fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.6" />
      <line x1="24" y1="24" x2="24" y2="13" stroke={color} strokeWidth="2.5" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="6s" repeatCount="indefinite" />
      </line>
      <line x1="24" y1="24" x2="32" y2="24" stroke={color} strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7">
        <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="2s" repeatCount="indefinite" />
      </line>
      <circle cx="24" cy="24" r="2.5" fill={color} />
    </svg>
  )
}

function MarathonIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full">
      <circle cx="24" cy="24" r="22" fill={`${color}22`} stroke={`${color}55`} strokeWidth="1" />
      <path d="M8 36 L18 20 L24 28 L32 14 L40 36 Z" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <path d="M30 16 L32 14 L34 16 L32 18 Z" fill="#fff" />
      <circle cx="32" cy="14" r="3" fill="none" stroke="#fff" strokeWidth="1" className="animate-ping-slow" />
    </svg>
  )
}

// ─── Modes ────────────────────────────────────────────────────────────────────

const MODES = [
  {
    id: "sprint",
    Icon: SprintIcon,
    name: "스프린트",
    action: "5분 즉석 단타",
    chip: "1M · 22턴",
    duration: "5분",
    color: "#FF6B35",
    glow: "rgba(255,107,53,0.45)",
    accent: "from-orange-600/30 via-amber-500/15 to-transparent",
    border: "border-orange-500/40",
    chipBg: "bg-orange-500/15 text-orange-300 border-orange-500/40",
    volatility: 9,
    trend: 0.4,
    settings: { speedMode: "sprint", timerSeconds: 10, simulationMonths: 1, dailyOpportunities: 2 },
  },
  {
    id: "standard",
    Icon: StandardIcon,
    name: "스탠다드",
    action: "10분 균형 매매",
    chip: "3M · 33턴",
    duration: "10분",
    color: "#3182F6",
    glow: "rgba(49,130,246,0.45)",
    accent: "from-blue-600/30 via-cyan-500/15 to-transparent",
    border: "border-blue-500/40",
    chipBg: "bg-blue-500/15 text-blue-300 border-blue-500/40",
    volatility: 5,
    trend: 0.15,
    settings: { speedMode: "standard", timerSeconds: 15, simulationMonths: 3, dailyOpportunities: 2 },
  },
  {
    id: "marathon",
    Icon: MarathonIcon,
    name: "마라톤",
    action: "15분 장기 정복",
    chip: "6M · 44턴",
    duration: "15분",
    color: "#8B5CF6",
    glow: "rgba(139,92,246,0.45)",
    accent: "from-purple-600/30 via-violet-500/15 to-transparent",
    border: "border-purple-500/40",
    chipBg: "bg-purple-500/15 text-purple-300 border-purple-500/40",
    volatility: 3,
    trend: 0.25,
    settings: { speedMode: "marathon", timerSeconds: 20, simulationMonths: 6, dailyOpportunities: 2 },
  },
] as const

export default function GameModeCards() {
  const charts = useMemo(() => MODES.map((m) => generateChart(m.volatility, m.trend)), [])

  const handleSelect = (mode: (typeof MODES)[number]) => {
    storage.setGameSettings(mode.settings as any)
    window.location.href = "/practice/setup"
  }

  return (
    <div className="px-5">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h3 className="text-[11px] font-black text-cyan-400 tracking-[0.2em] uppercase">
            ▸ Choose Mode
          </h3>
          <p className="text-base font-black text-white mt-0.5">난이도 골라서 출발</p>
        </div>
        <span className="text-[10px] text-gray-500 font-bold">3 MODES</span>
      </div>

      <div className="space-y-2.5">
        {MODES.map((mode, i) => {
          const Icon = mode.Icon
          return (
            <button
              key={mode.id}
              onClick={() => handleSelect(mode)}
              className={`relative w-full overflow-hidden rounded-2xl border ${mode.border} bg-[#1e1e2e] p-3.5 flex items-center gap-3 active:scale-[0.98] hover:scale-[1.01] transition-transform animate-slideUp`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* gradient bg */}
              <div className={`absolute inset-0 bg-gradient-to-r ${mode.accent} pointer-events-none`} />

              {/* mascot */}
              <div className="relative w-14 h-14 flex-shrink-0">
                <Icon color={mode.color} />
              </div>

              {/* text + chips */}
              <div className="relative flex-1 min-w-0 text-left">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-black text-white text-base leading-none">{mode.name}</span>
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border ${mode.chipBg}`}
                  >
                    ⏱ {mode.duration}
                  </span>
                </div>
                <p className="text-[13px] font-bold mt-1 leading-tight" style={{ color: mode.color }}>
                  {mode.action}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[9px] text-gray-500 font-bold">🎯 {mode.chip}</span>
                </div>
              </div>

              {/* live chart */}
              <div className="relative w-20 h-12 flex-shrink-0">
                <LiveChart data={charts[i]} color={mode.color} glow={mode.glow} />
              </div>

              {/* CTA arrow */}
              <div
                className="relative w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm"
                style={{
                  backgroundColor: `${mode.color}25`,
                  color: mode.color,
                  boxShadow: `0 0 12px ${mode.glow}`,
                }}
              >
                ▶
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
