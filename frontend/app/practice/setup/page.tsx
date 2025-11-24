"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Coins, Play } from "lucide-react"
import { storage } from "@/lib/storage"
import { cn } from "@/lib/utils"

export default function GameSetupPage() {
  const router = useRouter()
  const [duration, setDuration] = useState(3)
  const [seedMoney, setSeedMoney] = useState(5000000)

  useEffect(() => {
    const settings = storage.getGameSettings()
    if (settings) {
      setDuration(settings.duration || 3)
      setSeedMoney(settings.initialCash || 5000000)
    }
  }, [])

  const handleStart = () => {
    storage.setGameSettings({
      duration,
      initialCash: seedMoney,
    })
    router.push("/practice/stock/scenario-1")
  }

  const durations = [
    { value: 1, label: "1개월", desc: "빠르게 체험하기" },
    { value: 3, label: "3개월", desc: "기본 코스" },
    { value: 6, label: "6개월", desc: "중급자 코스" },
    { value: 12, label: "1년", desc: "장기 투자 연습" },
  ]

  const moneyOptions = [
    { value: 1000000, label: "100만원" },
    { value: 3000000, label: "300만원" },
    { value: 5000000, label: "500만원" },
    { value: 10000000, label: "1,000만원" },
    { value: 50000000, label: "5,000만원" },
    { value: 100000000, label: "1억원" },
  ]

  return (
    <div className="min-h-screen bg-[#191919] text-white pb-24">
      {/* Header */}
      <div className="pt-safe-top px-5 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">게임 설정</h1>
      </div>

      <div className="px-5 space-y-8 mt-4">
        {/* Duration Selection */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold">투자 기간</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {durations.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDuration(opt.value)}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all",
                  duration === opt.value
                    ? "bg-blue-500/20 border-blue-500 text-blue-400"
                    : "bg-[#222] border-transparent hover:bg-[#2a2a2a] text-gray-400",
                )}
              >
                <div className="font-bold text-lg mb-1">{opt.label}</div>
                <div className="text-xs opacity-70">{opt.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Seed Money Selection */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Coins className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-bold">초기 자본금</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {moneyOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSeedMoney(opt.value)}
                className={cn(
                  "py-3 px-2 rounded-xl border text-center transition-all",
                  seedMoney === opt.value
                    ? "bg-yellow-500/20 border-yellow-500 text-yellow-400"
                    : "bg-[#222] border-transparent hover:bg-[#2a2a2a] text-gray-400",
                )}
              >
                <div className="font-bold text-sm">{opt.label}</div>
              </button>
            ))}
          </div>
          <div className="mt-4 p-4 bg-[#222] rounded-2xl border border-white/5 flex justify-between items-center">
            <span className="text-gray-400">설정된 금액</span>
            <span className="text-xl font-bold text-white">{seedMoney.toLocaleString()}원</span>
          </div>
        </section>
      </div>

      {/* Start Button */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#191919] via-[#191919] to-transparent">
        <button
          onClick={handleStart}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5 fill-current" />
          게임 시작하기
        </button>
      </div>
    </div>
  )
}
