"use client"

import { useState, useMemo } from "react"
import { TrendingUp, TrendingDown, Sparkles } from "lucide-react"

function generateChallengeData(): number[] {
  const data: number[] = [50]
  for (let i = 1; i < 30; i++) {
    const prev = data[i - 1]
    const change = (Math.random() - 0.48) * 5
    data.push(Math.max(10, Math.min(90, prev + change)))
  }
  return data
}

function toPath(data: number[], w: number, h: number): string {
  if (data.length < 2) return ""
  const stepX = w / (data.length - 1)
  let d = `M 0 ${h - (data[0] / 100) * h}`
  for (let i = 1; i < data.length; i++) {
    const x = i * stepX
    const y = h - (data[i] / 100) * h
    const px = (i - 1) * stepX
    const py = h - (data[i - 1] / 100) * h
    d += ` C ${px + stepX * 0.4} ${py}, ${x - stepX * 0.4} ${y}, ${x} ${y}`
  }
  return d
}

interface ChartChallengeProps {
  onStartQuickGame: () => void
}

export default function ChartChallenge({ onStartQuickGame }: ChartChallengeProps) {
  const [guess, setGuess] = useState<"up" | "down" | null>(null)
  const [revealed, setRevealed] = useState(false)
  const chartData = useMemo(() => generateChallengeData(), [])

  const visibleData = chartData.slice(0, 20)
  const hiddenData = chartData.slice(19)
  const actualDirection = chartData[chartData.length - 1] > chartData[19] ? "up" : "down"

  const W = 280
  const H = 80

  const visiblePath = toPath(visibleData, (W * 19) / 29, H)
  const fullPath = toPath(chartData, W, H)

  const handleGuess = (direction: "up" | "down") => {
    setGuess(direction)
    setTimeout(() => setRevealed(true), 300)
  }

  const isCorrect = guess === actualDirection

  return (
    <div className="mx-5">
      <div className="bg-[#1e1e2e] rounded-2xl p-4 border border-white/5 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">차트 퀴즈</h3>
              <p className="text-[10px] text-gray-500">다음 흐름을 맞춰보세요!</p>
            </div>
          </div>
          {revealed && (
            <div className={`text-xs font-bold px-2.5 py-1 rounded-full ${isCorrect ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
              {isCorrect ? "정답!" : "아쉬워요"}
            </div>
          )}
        </div>

        <div className="relative">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 80 }}>
            <defs>
              <linearGradient id="challenge-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F04452" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#F04452" stopOpacity={0} />
              </linearGradient>
              <clipPath id="visible-clip">
                <rect x="0" y="0" width={(W * 19) / 29} height={H} />
              </clipPath>
              <clipPath id="hidden-clip">
                <rect x={(W * 19) / 29} y="0" width={W - (W * 19) / 29} height={H} />
              </clipPath>
            </defs>

            <path
              d={visiblePath}
              fill="none"
              stroke="#F04452"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {revealed && (
              <path
                d={fullPath}
                fill="none"
                stroke={actualDirection === "up" ? "#F04452" : "#3182F6"}
                strokeWidth="2"
                strokeLinecap="round"
                clipPath="url(#hidden-clip)"
                className="animate-[draw_0.8s_ease-out]"
              />
            )}

            {!revealed && (
              <>
                <line
                  x1={(W * 19) / 29}
                  y1="0"
                  x2={(W * 19) / 29}
                  y2={H}
                  stroke="white"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity={0.3}
                />
                <text
                  x={(W * 19) / 29 + 8}
                  y={14}
                  fill="white"
                  fontSize="10"
                  opacity={0.5}
                >
                  ?
                </text>
              </>
            )}
          </svg>
        </div>

        {!guess ? (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => handleGuess("up")}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm active:scale-95 transition-transform"
            >
              <TrendingUp className="w-4 h-4" />
              상승
            </button>
            <button
              onClick={() => handleGuess("down")}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-sm active:scale-95 transition-transform"
            >
              <TrendingDown className="w-4 h-4" />
              하락
            </button>
          </div>
        ) : (
          <button
            onClick={onStartQuickGame}
            className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 text-orange-400 font-bold text-sm active:scale-95 transition-transform"
          >
            실전에서 도전하기 →
          </button>
        )}
      </div>
    </div>
  )
}
