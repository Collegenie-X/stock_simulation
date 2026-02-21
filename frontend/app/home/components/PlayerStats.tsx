"use client"

import { Flame, Heart, Swords, Star } from "lucide-react"

interface PlayerStatsProps {
  level: number
  hearts: number
  maxHearts: number
  streak: number
  winRate: number
}

export default function PlayerStats({ level, hearts, maxHearts, streak, winRate }: PlayerStatsProps) {
  return (
    <div className="mx-5 flex items-center gap-2">
      <div className="flex items-center gap-1.5 bg-[#1e1e2e] rounded-xl px-3 py-2 border border-white/5">
        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        <span className="text-xs font-bold text-white">Lv.{level}</span>
      </div>

      <div className="flex items-center gap-1 bg-[#1e1e2e] rounded-xl px-3 py-2 border border-white/5">
        {Array.from({ length: maxHearts }).map((_, i) => (
          <Heart
            key={i}
            className={`w-3.5 h-3.5 ${i < hearts ? "text-red-400 fill-red-400" : "text-gray-700 fill-gray-700"}`}
          />
        ))}
      </div>

      {streak > 0 && (
        <div className="flex items-center gap-1 bg-[#1e1e2e] rounded-xl px-3 py-2 border border-white/5">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-xs font-bold text-orange-400">{streak}</span>
        </div>
      )}

      {winRate > 0 && (
        <div className="flex items-center gap-1 bg-[#1e1e2e] rounded-xl px-3 py-2 border border-white/5 ml-auto">
          <Swords className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400">{winRate}%</span>
        </div>
      )}
    </div>
  )
}
