"use client"

import { useState } from "react"
import { X, Lightbulb, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * 힌트 모달 컴포넌트
 * README의 AI 힌트 시스템 구현
 */

interface HintData {
  stockName: string
  currentPrice: number
  volume: number
  volumeChange: number
  supportLevel: number
  resistanceLevel: number
  rsi: number
  pattern: string
  confidence: number
}

export function HintModal({
  isOpen,
  onClose,
  hintLevel = 1,
  stockData,
  onUsePoints,
}: {
  isOpen: boolean
  onClose: () => void
  hintLevel: 1 | 2
  stockData: HintData
  onUsePoints: (points: number) => void
}) {
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleUseHint = () => {
    const cost = hintLevel === 1 ? 300 : 500
    setIsLoading(true)
    setTimeout(() => {
      onUsePoints(cost)
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-in fade-in duration-300">
      <div className="bg-[#1E1E1E] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-gray-800 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-white">
                {hintLevel === 1 ? "💡 AI 간단 힌트" : "💡💡 AI 심층 분석"}
              </h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <p className="text-sm text-gray-400">
            {hintLevel === 1 ? "빠른 조언과 추천 전략" : "10단계 분석 + 기대값 계산"}
          </p>
        </div>

        {/* 내용 */}
        <div className="p-6 space-y-6">
          {/* 종목 정보 */}
          <div className="bg-gray-800/50 rounded-2xl p-4">
            <div className="text-sm text-gray-400 mb-1">분석 종목</div>
            <div className="text-xl font-bold text-white">{stockData.stockName}</div>
            <div className="text-2xl font-bold text-white mt-2">{stockData.currentPrice.toLocaleString()}원</div>
          </div>

          {hintLevel === 1 ? (
            // 1단계: 간단 힌트
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🤖</div>
                  <div>
                    <div className="font-bold text-blue-400 mb-2">AI 조언</div>
                    <div className="text-sm text-gray-300">
                      거래량이 평소보다 {stockData.volumeChange}% 증가했어요.
                      <br />
                      {stockData.pattern} 신호입니다.
                      <br />
                      하지만 지지선({stockData.supportLevel.toLocaleString()}원)까지 조정이 올 가능성도 40% 있습니다.
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-bold text-gray-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  추천 전략
                </div>
                <div className="bg-gray-800/50 rounded-xl p-3 space-y-2 text-sm text-gray-300">
                  <div className="flex items-center justify-between">
                    <span>• 1차 매수: 50%</span>
                    <span className="text-xs text-gray-500">(현재가)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• 2차 매수: 30%</span>
                    <span className="text-xs text-gray-500">({stockData.supportLevel.toLocaleString()}원 도달 시)</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // 2단계: 상세 분석
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-bold text-gray-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  📊 10단계 분석 과정
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 space-y-2 text-sm">
                  <AnalysisItem step={1} label="현재 패턴" value={`${stockData.pattern} (${stockData.confidence}%)`} />
                  <AnalysisItem step={2} label="지지선" value={`${stockData.supportLevel.toLocaleString()}원 (⭐⭐⭐⭐⭐)`} />
                  <AnalysisItem step={3} label="저항선" value={`${stockData.resistanceLevel.toLocaleString()}원`} />
                  <AnalysisItem step={4} label="거래량" value={`+${stockData.volumeChange}% (강한 매수세)`} />
                  <AnalysisItem step={5} label="RSI" value={`${stockData.rsi} (중립, 과매수 아님)`} />
                  <AnalysisItem step={6} label="MACD" value="골든크로스 형성" />
                  <AnalysisItem step={7} label="이동평균" value="5일선 > 20일선 (상승)" />
                  <AnalysisItem step={8} label="볼린저밴드" value="중심선 돌파" />
                  <AnalysisItem step={9} label="뉴스" value="호재 없음 (기술적 상승)" />
                  <AnalysisItem step={10} label="AI 확신도" value={`${stockData.confidence}%`} isLast />
                </div>
              </div>

              {/* 시나리오 분석 */}
              <div className="space-y-3">
                <div className="text-sm font-bold text-gray-300">🎯 최적 전략</div>
                
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3">
                  <div className="text-sm font-bold text-green-400 mb-1">시나리오 A (60% 확률)</div>
                  <div className="text-xs text-gray-300">
                    {stockData.currentPrice.toLocaleString()}원 → {stockData.resistanceLevel.toLocaleString()}원 (+
                    {(((stockData.resistanceLevel - stockData.currentPrice) / stockData.currentPrice) * 100).toFixed(1)}
                    %)
                  </div>
                  <div className="text-xs text-gray-400 mt-1">→ 전략: 즉시 50% 매수</div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                  <div className="text-sm font-bold text-blue-400 mb-1">시나리오 B (40% 확률)</div>
                  <div className="text-xs text-gray-300">
                    {stockData.currentPrice.toLocaleString()}원 → {stockData.supportLevel.toLocaleString()}원 →{" "}
                    {(stockData.resistanceLevel + 1000).toLocaleString()}원
                  </div>
                  <div className="text-xs text-gray-400 mt-1">→ 전략: 1차 30%, 2차 조정 시 40%</div>
                </div>
              </div>

              {/* 기대값 */}
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4">
                <div className="text-sm font-bold text-yellow-400 mb-2">💰 기대값 계산</div>
                <div className="text-xs text-gray-300 mb-2">
                  (60% × +4.2%) + (40% × +5.9%) = +4.9%
                </div>
                <div className="text-sm font-bold text-green-400">→ 플러스 기대값! 진입 권장</div>
              </div>

              {/* 리스크 */}
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-red-400">⚠️ 리스크</div>
                  <div className="text-xs text-gray-300 mt-1">
                    손절: {stockData.supportLevel.toLocaleString()}원 이탈 시 -5%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="p-6 border-t border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">사용 비용</span>
            <span className="text-lg font-bold text-yellow-500">{hintLevel === 1 ? "300" : "500"} 포인트</span>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 h-12 bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
            >
              취소
            </Button>
            <Button
              onClick={handleUseHint}
              disabled={isLoading}
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? "적용 중..." : "전략 사용하기"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AnalysisItem({
  step,
  label,
  value,
  isLast = false,
}: {
  step: number
  label: string
  value: string
  isLast?: boolean
}) {
  return (
    <div className={cn("flex items-center gap-3 py-1", !isLast && "border-b border-gray-700/30")}>
      <div className="text-xs font-bold text-gray-500 w-4">{step}.</div>
      <div className="text-xs text-gray-400 flex-1">{label}:</div>
      <div className="text-xs font-medium text-gray-200">{value}</div>
    </div>
  )
}

