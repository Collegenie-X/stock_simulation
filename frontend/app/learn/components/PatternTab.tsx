'use client';

import { useRouter } from 'next/navigation';
import {
  CHART_PATTERNS,
  PATTERN_CATEGORIES,
  SIGNAL_COLORS,
  type PatternCategory,
} from '@/data/chart-patterns';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PatternTab() {
  const router = useRouter();

  return (
    <div className="space-y-4">
      {/* 패턴 히어로 */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl -mr-5 -mt-5" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-purple-200">차트 패턴 도감</p>
              <h3 className="text-xl font-bold">패턴을 읽는 눈</h3>
            </div>
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl">
              📊
            </div>
          </div>
          <p className="text-sm text-purple-100 mb-3">
            차트에서 반복되는 패턴을 인식하면
            위기 상황에서의 대처 속도가 빨라집니다
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex justify-between text-xs">
              <span className="text-purple-200">학습 진행률</span>
              <span className="font-bold">0 / {CHART_PATTERNS.length} 패턴</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden mt-1.5">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: '0%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { label: "전체", value: "all", emoji: "📋" },
          ...Object.entries(PATTERN_CATEGORIES).map(([key, val]) => ({
            label: key,
            value: key,
            emoji: val.emoji,
          })),
        ].map((filter) => (
          <button
            key={filter.value}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap shrink-0 flex items-center gap-1",
              filter.value === "all"
                ? "bg-white/10 text-white border-white/20"
                : "bg-[#252525] text-gray-400 border-white/5"
            )}
          >
            <span>{filter.emoji}</span>
            {filter.label}
          </button>
        ))}
      </div>

      {/* 카테고리별 패턴 리스트 */}
      {(Object.keys(PATTERN_CATEGORIES) as PatternCategory[]).map((category) => {
        const catConfig = PATTERN_CATEGORIES[category];
        const patterns = CHART_PATTERNS.filter(p => p.category === category);
        
        return (
          <div key={category} className="space-y-2">
            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg">{catConfig.emoji}</span>
              <h4 className="text-sm font-bold text-white">{category}</h4>
              <span className="text-[10px] text-gray-500">{patterns.length}개</span>
            </div>
            <p className="text-[10px] text-gray-500 mb-2">{catConfig.description}</p>

            {patterns.map((pattern) => {
              const sigColor = SIGNAL_COLORS[pattern.signal];
              return (
                <div
                  key={pattern.id}
                  onClick={() => router.push(`/learn/patterns/${pattern.id}`)}
                  className="bg-[#252525] rounded-xl p-4 border border-white/5 touch-feedback cursor-pointer hover:bg-[#2a2a2a] transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0",
                        catConfig.bgColor, `border ${catConfig.borderColor}`
                      )}>
                        {pattern.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-bold text-white text-sm truncate">{pattern.name}</p>
                          <span className="text-[10px] text-gray-500 shrink-0">{pattern.nameEn}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded-md border",
                            sigColor.bg, sigColor.color, sigColor.border
                          )}>
                            {pattern.signal === "매수" && "↑"} 
                            {pattern.signal === "매도" && "↓"} 
                            {pattern.signal === "양방향" && "↕"} 
                            {pattern.signal}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            난이도 {'⭐'.repeat(pattern.difficulty)}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            신뢰도 {'🔵'.repeat(pattern.reliability)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500 shrink-0 ml-2" />
                  </div>

                  <p className="text-[10px] text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                    {pattern.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {pattern.keyPoints.slice(0, 2).map((point, idx) => (
                      <span key={idx} className="text-[9px] bg-white/5 text-gray-400 rounded-full px-2 py-0.5">
                        {point}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
