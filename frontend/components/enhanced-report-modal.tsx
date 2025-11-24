"use client"

import { X, TrendingUp, Award, Target, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from "recharts"

/**
 * 강화된 보고서 모달 (중간/최종)
 * README의 보고서 시스템 구현
 */

interface ReportData {
  type: "weekly" | "final"
  weekNumber?: number
  totalDays: number
  currentDay: number
  initialCash: number
  currentAssets: number
  profitRate: number
  aiRankings: Array<{
    name: string
    profitRate: number
    winRate: number
    avgTradeTime: number
    mdd: number
  }>
  userStats: {
    profitRate: number
    winRate: number
    avgTradeTime: number
    mdd: number
    totalTrades: number
    wins: number
    losses: number
  }
  waveSkills: {
    lowPointCapture: number
    highPointSell: number
    waveAvoidance: number
    thirdWaveRecognition: number
  }
  chartData: Array<{ turn: number; value: number }>
}

export function EnhancedReportModal({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean
  onClose: () => void
  data: ReportData
}) {
  if (!isOpen) return null

  const isWeekly = data.type === "weekly"
  const isProfit = data.profitRate >= 0

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-in fade-in duration-300">
      <div className="bg-[#1E1E1E] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-gray-800 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {isWeekly ? `📊 ${data.weekNumber}주차 중간 리포트` : "🏁 최종 리포트"}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {isWeekly
                  ? `${data.currentDay}일 / ${data.totalDays}일 (${Math.floor((data.currentDay / data.totalDays) * 100)}% 완료)`
                  : "게임 완료 분석 결과"}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* 내용 */}
        <div className="p-6 space-y-6">
          {/* 주요 성과 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">수익률</span>
              </div>
              <div className={cn("text-2xl font-bold", isProfit ? "text-red-500" : "text-blue-500")}>
                {isProfit ? "+" : ""}
                {data.profitRate.toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-gray-400">순수익</span>
              </div>
              <div className={cn("text-2xl font-bold", isProfit ? "text-red-500" : "text-blue-500")}>
                {isProfit ? "+" : ""}
                {(data.currentAssets - data.initialCash).toLocaleString()}원
              </div>
            </div>
          </div>

          {/* 차트 */}
          <div className="bg-gray-800/30 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              자산 흐름도
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData}>
                  <defs>
                    <linearGradient id="reportGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isProfit ? "#ef4444" : "#3b82f6"} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={isProfit ? "#ef4444" : "#3b82f6"} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="turn" hide />
                  <YAxis hide />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={isProfit ? "#ef4444" : "#3b82f6"}
                    strokeWidth={3}
                    fill="url(#reportGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI 비교 */}
          <div className="bg-gray-800/30 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-gray-300 mb-3">🏆 나 vs AI 비교</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-700">
                    <th className="text-left py-2">이름</th>
                    <th className="text-right py-2">수익률</th>
                    <th className="text-right py-2">승률</th>
                    <th className="text-right py-2">평균거래</th>
                    <th className="text-right py-2">MDD</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-blue-500/10 border border-blue-500/30">
                    <td className="py-2 font-bold text-blue-400">나</td>
                    <td className="text-right font-bold text-blue-400">
                      {data.userStats.profitRate >= 0 ? "+" : ""}
                      {data.userStats.profitRate.toFixed(1)}%
                    </td>
                    <td className="text-right text-gray-300">{data.userStats.winRate}%</td>
                    <td className="text-right text-gray-300">{data.userStats.avgTradeTime}분</td>
                    <td className="text-right text-gray-300">{data.userStats.mdd.toFixed(1)}%</td>
                  </tr>
                  {data.aiRankings.map((ai, idx) => (
                    <tr key={idx} className="border-b border-gray-800 last:border-0">
                      <td className="py-2 text-gray-300">{ai.name}</td>
                      <td className="text-right text-gray-300">
                        {ai.profitRate >= 0 ? "+" : ""}
                        {ai.profitRate.toFixed(1)}%
                      </td>
                      <td className="text-right text-gray-400">{ai.winRate}%</td>
                      <td className="text-right text-gray-400">{ai.avgTradeTime}분</td>
                      <td className="text-right text-gray-400">{ai.mdd.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 분석 */}
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-green-400 mb-2">✅ 잘한 점</div>
                  <div className="space-y-1 text-sm text-gray-300">
                    <div>• 수익률이 안정왕 김철수 초과</div>
                    <div>• MDD 관리 우수 ({data.userStats.mdd.toFixed(1)}%)</div>
                    <div>• 승률 {data.userStats.winRate}% (평균 이상)</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-orange-400 mb-2">⚠️ 개선점</div>
                  <div className="space-y-1 text-sm text-gray-300">
                    <div>• 투자 비중 45% → 55% 권장</div>
                    <div>• 3파 상승 포착률 박영희보다 낮음</div>
                    <div>• 의사결정 시간 단축 필요</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 파도 감각 평가 */}
          <div className="bg-gray-800/30 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              🌊 파도 감각 평가
            </h3>
            <div className="space-y-3">
              <WaveSkillBar label="저점 포착" score={data.waveSkills.lowPointCapture} />
              <WaveSkillBar label="고점 매도" score={data.waveSkills.highPointSell} />
              <WaveSkillBar label="B파 회피" score={data.waveSkills.waveAvoidance} />
              <WaveSkillBar label="3파 인식" score={data.waveSkills.thirdWaveRecognition} />
            </div>
          </div>

          {/* 거래 통계 */}
          {!isWeekly && (
            <div className="bg-gray-800/30 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-gray-300 mb-3">📈 거래 내역 분석</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">총 거래</span>
                  <span className="text-white font-bold">
                    {data.userStats.totalTrades}회 ({data.userStats.wins}승 {data.userStats.losses}패)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">최고 수익</span>
                  <span className="text-red-500 font-bold">삼성전자 +18.2% (+182,000원)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">최대 손실</span>
                  <span className="text-blue-500 font-bold">에코프로 -8.5% (-85,000원)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="p-6 border-t border-gray-800">
          <Button
            onClick={onClose}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg"
          >
            {isWeekly ? "다음 주차 시작하기" : "홈으로 돌아가기"}
          </Button>
        </div>
      </div>
    </div>
  )
}

function WaveSkillBar({ label, score }: { label: string; score: number }) {
  const stars = Math.round(score / 20) // 100점 만점 -> 5점 만점
  const grade = score >= 90 ? "S급" : score >= 80 ? "A급" : score >= 70 ? "B급" : score >= 60 ? "C급" : "D급"
  const color = score >= 80 ? "text-yellow-500" : score >= 60 ? "text-blue-500" : "text-gray-500"

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-gray-400">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{score}점</span>
          <span className={cn("text-xs font-bold", color)}>({grade})</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={cn("flex-1 h-2 rounded-full", i < stars ? "bg-yellow-500" : "bg-gray-700")}
          />
        ))}
      </div>
    </div>
  )
}

