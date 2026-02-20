'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  LEGENDARY_SCENARIOS,
  DIFFICULTY_CONFIG,
  CATEGORY_COLORS,
  INVESTOR_DNA_MAP,
  getAIPersonality,
} from '@/data/legendary-scenarios';
import type { InvestorPersonality } from '@/data/legendary-scenarios';
import { ChevronRight, Users, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  userPersonality: InvestorPersonality;
}

export function ScenarioTab({ userPersonality }: Props) {
  const router = useRouter();
  const myDNA = INVESTOR_DNA_MAP[userPersonality];

  return (
    <div className="space-y-4">
      {/* 히어로 배너 - AI 대결 강조 */}
      <div className="bg-gradient-to-br from-yellow-600 to-orange-700 rounded-2xl p-5 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl -mr-5 -mt-5" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-orange-400/20 rounded-full blur-lg -ml-4 -mb-4" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-yellow-200">전설의 10턴</p>
              <h3 className="text-xl font-bold">사고 대처 시뮬레이션</h3>
            </div>
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl">
              🎯
            </div>
          </div>
          <p className="text-sm text-yellow-100 mb-3">
            10턴의 위기 상황에서 나의 대처 능력을 시험하고, 같은 성향의 AI와
            수익률을 비교해보세요
          </p>

          {/* 나 vs AI 대결 프리뷰 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-3">
            <div className="flex items-center justify-center gap-3">
              <div className="text-center">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg mx-auto mb-1">
                  👤
                </div>
                <p className="text-[10px] font-bold">나</p>
                <p className="text-[10px] opacity-70">{myDNA.label}</p>
              </div>
              <Swords className="w-5 h-5 text-yellow-300" />
              <div className="text-center">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg mx-auto mb-1">
                  {myDNA.emoji}
                </div>
                <p className="text-[10px] font-bold">AI {myDNA.label}</p>
                <p className="text-[10px] opacity-70">동일 성향</p>
              </div>
              <span className="text-[10px] opacity-50 mx-1">+</span>
              {Object.entries(INVESTOR_DNA_MAP)
                .filter(([key]) => key !== userPersonality)
                .map(([key, val]) => (
                  <div key={key} className="text-center">
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-sm mx-auto mb-1">
                      {val.emoji}
                    </div>
                    <p className="text-[10px] opacity-60">{val.label}</p>
                  </div>
                ))}
            </div>
          </div>

          {/* 진행 상황 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-3">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-yellow-100">시나리오 진행률</span>
              <span className="font-bold">0 / 10 완료</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: '0%' }}
              />
            </div>
          </div>

          <Button className="w-full bg-white text-orange-600 hover:bg-gray-100 rounded-xl h-11 font-bold">
            시나리오 시작하기
          </Button>
        </div>
      </div>

      {/* 난이도 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { label: '전체', value: 'all' },
          {
            label: '초급',
            value: 'beginner',
            color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          },
          {
            label: '중급',
            value: 'intermediate',
            color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
          },
          {
            label: '고급',
            value: 'advanced',
            color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
          },
          {
            label: '최고급',
            value: 'expert',
            color: 'bg-red-500/20 text-red-400 border-red-500/30',
          },
        ].map((filter) => (
          <button
            key={filter.value}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap shrink-0',
              filter.value === 'all'
                ? 'bg-white/10 text-white border-white/20'
                : filter.color || 'bg-[#252525] text-gray-400 border-white/5'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* 시나리오 리스트 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-gray-400">학습 시나리오</h4>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Users className="w-3.5 h-3.5" />
            <span>AI 대처 비교 포함</span>
          </div>
        </div>

        {LEGENDARY_SCENARIOS.map((scenario) => {
          const diffConfig =
            DIFFICULTY_CONFIG[
              scenario.difficulty as keyof typeof DIFFICULTY_CONFIG
            ];
          const categoryColor =
            CATEGORY_COLORS[scenario.category] ||
            'from-gray-500/20 to-gray-600/20';

          return (
            <div
              key={scenario.id}
              onClick={() => router.push(`/learn/scenarios/${scenario.id}`)}
              className="bg-[#252525] rounded-xl p-4 border border-white/5 touch-feedback cursor-pointer hover:bg-[#2a2a2a] transition-all active:scale-[0.98]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={cn(
                      'w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0',
                      `bg-gradient-to-br ${categoryColor}`
                    )}
                  >
                    {scenario.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-white truncate">
                        {scenario.title}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {scenario.subtitle}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className={cn(
                          'text-[10px] font-bold px-1.5 py-0.5 rounded-md border',
                          diffConfig.bgColor,
                          diffConfig.color,
                          diffConfig.borderColor
                        )}
                      >
                        {diffConfig.label}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {'⭐'.repeat(scenario.difficulty)}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        클리어율 {scenario.stats.avgClearRate}%
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500 shrink-0 ml-2" />
              </div>

              {/* AI 성향별 대결 미리보기 */}
              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-gray-500">
                    성향별 AI 수익률 비교
                  </span>
                  <span className="text-[10px] text-cyan-400 font-bold">
                    나의 성향과 비교
                  </span>
                </div>
                <div className="flex gap-2">
                  {scenario.aiStrategies.map((ai) => {
                    const isMyType =
                      getAIPersonality(ai.type) === userPersonality;
                    return (
                      <div
                        key={ai.name}
                        className={cn(
                          'flex-1 rounded-lg px-2 py-1.5 text-center relative',
                          isMyType
                            ? 'bg-cyan-500/15 border-2 border-cyan-400/40 ring-1 ring-cyan-400/20'
                            : ai.color === 'green'
                              ? 'bg-green-500/10 border border-green-500/20'
                              : ai.color === 'red'
                                ? 'bg-red-500/10 border border-red-500/20'
                                : 'bg-blue-500/10 border border-blue-500/20'
                        )}
                      >
                        {isMyType && (
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                            나의 성향
                          </div>
                        )}
                        <div className="text-sm mt-0.5">{ai.emoji}</div>
                        <div className="text-[9px] text-gray-400 mb-0.5">
                          {ai.type}
                        </div>
                        <div
                          className={cn(
                            'text-[10px] font-bold',
                            ai.returnRate.startsWith('+')
                              ? 'text-green-400'
                              : ai.returnRate.startsWith('-')
                                ? 'text-red-400'
                                : 'text-gray-400'
                          )}
                        >
                          {ai.returnRate}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
