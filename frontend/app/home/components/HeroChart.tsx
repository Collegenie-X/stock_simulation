"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Play, TrendingUp } from "lucide-react"

function generateChartData(length: number): number[] {
  const data: number[] = [50]
  let trend = (Math.random() - 0.5) * 2
  let momentum = 0

  for (let i = 1; i < length; i++) {
    const prev = data[i - 1]

    if (Math.random() < 0.08) {
      trend = (Math.random() - 0.5) * 4
    }

    if (Math.random() < 0.12) {
      momentum = (Math.random() - 0.5) * 15
    } else {
      momentum *= 0.7
    }

    const noise = (Math.random() - 0.5) * 8
    const change = trend + momentum + noise

    const meanRevert = (50 - prev) * 0.02
    const next = prev + change + meanRevert

    data.push(Math.max(8, Math.min(92, next)))
  }
  return data
}

function toSvgPath(data: number[], width: number, height: number): string {
  if (data.length < 2) return ""
  const stepX = width / (data.length - 1)
  const points = data.map((v, i) => ({
    x: i * stepX,
    y: height - (v / 100) * height,
  }))

  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const cp1x = points[i - 1].x + stepX * 0.4
    const cp1y = points[i - 1].y
    const cp2x = points[i].x - stepX * 0.4
    const cp2y = points[i].y
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i].x} ${points[i].y}`
  }
  return d
}

interface HeroChartProps {
  onPlay: () => void
  bestReturn?: number
  gamesPlayed?: number
}

export default function HeroChart({ onPlay, bestReturn = 0, gamesPlayed = 0 }: HeroChartProps) {
  const [chartData, setChartData] = useState<number[]>(() => generateChartData(60))
  const [visibleLength, setVisibleLength] = useState(1)
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dataRef = useRef(chartData)

  const animate = useCallback(() => {
    setVisibleLength((prev) => {
      if (prev >= dataRef.current.length) {
        const newData = generateChartData(60)
        dataRef.current = newData
        setChartData(newData)
        return 1
      }
      return prev + 1
    })
    animRef.current = setTimeout(() => animate(), 60)
  }, [])

  useEffect(() => {
    animate()
    return () => {
      if (animRef.current) clearTimeout(animRef.current)
    }
  }, [animate])

  const visible = chartData.slice(0, visibleLength)
  const W = 400
  const H = 200
  const path = toSvgPath(visible, W, H)
  const lastY = visible.length > 0 ? H - (visible[visible.length - 1] / 100) * H : H / 2
  const lastX = ((visible.length - 1) / (chartData.length - 1)) * W
  const isUp = visible.length > 1 && visible[visible.length - 1] > visible[0]
  const strokeColor = isUp ? "#F04452" : "#3182F6"

  const changePercent =
    visible.length > 1
      ? (((visible[visible.length - 1] - visible[0]) / visible[0]) * 100).toFixed(1)
      : "0.0"

  const areaPath = path ? `${path} L ${lastX} ${H} L 0 ${H} Z` : ""

  return (
    <div className="relative overflow-hidden rounded-3xl mx-5">
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] to-[#16162a]" />

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full relative z-[1]"
        preserveAspectRatio="none"
        style={{ height: 220 }}
      >
        <defs>
          <linearGradient id="hero-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.35} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {areaPath && <path d={areaPath} fill="url(#hero-gradient)" />}
        {path && (
          <path
            d={path}
            fill="none"
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#glow)"
          />
        )}
        {visible.length > 1 && (
          <>
            <circle cx={lastX} cy={lastY} r="6" fill={strokeColor} opacity={0.4}>
              <animate attributeName="r" values="6;14;6" dur="1.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0.1;0.5" dur="1.2s" repeatCount="indefinite" />
            </circle>
            <circle cx={lastX} cy={lastY} r="4" fill={strokeColor} />
          </>
        )}
      </svg>

      {/* Live price indicator */}
      {visible.length > 5 && (
        <div className="absolute top-4 right-4 z-[3]">
          <div className={`text-right`}>
            <div className="text-[10px] text-gray-500 flex items-center gap-1 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </div>
            <div className={`text-lg font-black tabular-nums ${isUp ? "text-red-400" : "text-blue-400"}`}>
              {isUp ? "+" : ""}{changePercent}%
            </div>
          </div>
        </div>
      )}

      <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center">
        <div className="text-center mb-4">
          <p className="text-[10px] text-gray-500 mb-1.5 tracking-[0.2em] uppercase font-medium">
            Stock Wave Game
          </p>
          <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
            차트를 읽고,<br />파도를 타라
          </h2>
        </div>

        <button
          onClick={onPlay}
          className="group relative flex items-center gap-2.5 px-9 py-4 rounded-full font-bold text-base transition-all active:scale-95"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-red-500 opacity-90 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-red-500 blur-xl opacity-50 group-hover:opacity-70 transition-opacity animate-pulse" />
          <Play className="w-5 h-5 relative z-10 text-white fill-white" />
          <span className="relative z-10 text-white text-[15px]">지금 도전하기</span>
        </button>

        <div className="flex items-center gap-4 mt-3">
          {gamesPlayed > 0 && (
            <span className="text-[11px] text-gray-400">{gamesPlayed}판 플레이</span>
          )}
          {bestReturn !== 0 && (
            <span className={`text-[11px] font-medium ${bestReturn > 0 ? "text-red-400" : "text-blue-400"}`}>
              <TrendingUp className="w-3 h-3 inline mr-0.5" />
              최고 {bestReturn > 0 ? "+" : ""}{bestReturn.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
