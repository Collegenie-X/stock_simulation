'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LEGENDARY_SCENARIOS,
  DIFFICULTY_CONFIG,
  CATEGORY_COLORS,
  INVESTOR_DNA_MAP,
  getAIPersonality,
} from '@/data/legendary-scenarios';
import type { InvestorPersonality } from '@/data/legendary-scenarios';
import { getScenarioStockType } from '@/data/scenario-stock-types';
import { ChevronDown, Swords, Trophy, Users, Info, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Hero Section ────────────────────────────────────────────────
function ScenarioHero({ myDNA }: { myDNA: { emoji: string; label: string } }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-gradient-to-r from-yellow-600/80 to-orange-700/80 rounded-2xl border border-yellow-500/30 text-white overflow-hidden">
      <button className="w-full flex items-center gap-4 p-4 text-left" onClick={() => setOpen(!open)}>
        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl shrink-0">🎯</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-yellow-200 font-semibold">전설의 10턴</p>
          <h3 className="text-base font-bold">사고 대처 시뮬레이션</h3>
          <p className="text-[11px] text-yellow-100/70 mt-0.5">종목 특성을 파악해 대처 능력을 키우세요</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-sm">👤</div>
          <Swords className="w-3 h-3 text-yellow-300" />
          <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-sm">{myDNA.emoji}</div>
        </div>
        <ChevronDown className={cn('w-4 h-4 opacity-60 shrink-0 transition-transform duration-200', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-white/10 space-y-3">
          <div className="mt-3 bg-white/10 rounded-xl p-3 space-y-1.5">
            <p className="text-xs font-bold text-yellow-200 mb-2">📚 이렇게 배워요</p>
            {[
              '각 종목이 가진 고유 특성(사이클/규제/테마)을 파악',
              '같은 특성의 유사 종목들도 함께 확인',
              '위기 상황에서 나만의 대처 전략을 연습',
              '동일 성향 AI와 수익률을 비교하며 성장',
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-yellow-300 text-xs shrink-0 mt-0.5">0{i + 1}</span>
                <span className="text-[11px] text-yellow-100 leading-snug">{text}</span>
              </div>
            ))}
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: '0%' }} />
          </div>
          <p className="text-[10px] text-yellow-100/60 text-center">0 / {LEGENDARY_SCENARIOS.length} 시나리오 완료</p>
        </div>
      )}
    </div>
  );
}

// ─── Scenario Card ────────────────────────────────────────────────
interface ScenarioCardProps {
  scenario: (typeof LEGENDARY_SCENARIOS)[number];
  userPersonality: InvestorPersonality;
}

function ScenarioCard({ scenario, userPersonality }: ScenarioCardProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const diffConfig = DIFFICULTY_CONFIG[scenario.difficulty as keyof typeof DIFFICULTY_CONFIG];
  const categoryColor = CATEGORY_COLORS[scenario.category] || 'from-gray-500/20 to-gray-600/20';
  const stockType = getScenarioStockType(scenario.id);

  return (
    <div className={cn('rounded-2xl border transition-all duration-200', open ? 'bg-[#1e1e16] border-yellow-500/30' : 'bg-[#252525] border-white/5 hover:border-white/10')}>
      {/* 접힌 상태 */}
      <div className="w-full flex items-center gap-3 p-3.5">
        {/* 클릭 가능한 카드 본체 영역 */}
        <div
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
          onClick={() => router.push(`/learn/scenarios/${scenario.id}`)}
        >
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-gradient-to-br', categoryColor)}>
            {scenario.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
              <p className="font-bold text-white text-sm">{scenario.title}</p>
            </div>
            {/* 종목 유형 배지 */}
            {stockType && (
              <div className="flex items-center gap-1.5 mb-1">
                <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-md border flex items-center gap-0.5', stockType.stockTypeBg, stockType.stockTypeColor, stockType.stockTypeBorder)}>
                  {stockType.stockTypeEmoji} {stockType.stockType}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-md border', diffConfig.bgColor, diffConfig.color, diffConfig.borderColor)}>
                {diffConfig.label}
              </span>
              <span className="text-[10px] text-yellow-400">{'⭐'.repeat(scenario.difficulty)}</span>
              <span className="text-[10px] text-gray-500">클리어 {scenario.stats.avgClearRate}%</span>
            </div>
          </div>
        </div>

        {/* 펼치기 버튼 (독립적) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
          }}
          className="shrink-0 p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <ChevronDown className={cn('w-4 h-4 text-gray-500 transition-transform duration-200', open && 'rotate-180')} />
        </button>
      </div>

      {/* 펼쳐진 상태 */}
      {open && (
        <div className="px-4 pb-4 border-t border-white/5 space-y-3">
          {/* 핵심 특성 설명 */}
          {stockType && (
            <div className={cn('mt-3 rounded-xl p-3 border', stockType.stockTypeBg, stockType.stockTypeBorder)}>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-base">{stockType.stockTypeEmoji}</span>
                <p className={cn('text-xs font-bold', stockType.stockTypeColor)}>{stockType.stockType}</p>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed mb-2">"{stockType.tagline}"</p>
              <div className="space-y-1">
                {stockType.characteristics.map((c, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className={cn('text-[10px] shrink-0 mt-0.5', stockType.stockTypeColor)}>✦</span>
                    <span className="text-[10px] text-gray-400 leading-snug">{c}</span>
                  </div>
                ))}
              </div>
              {/* 왜 움직이나 */}
              <div className="mt-2 bg-black/20 rounded-lg p-2">
                <p className="text-[10px] font-bold text-gray-400 mb-1 flex items-center gap-1">
                  <Info className="w-2.5 h-2.5" /> 이 종목이 움직이는 이유
                </p>
                <p className="text-[10px] text-gray-300 leading-relaxed">{stockType.whyItMoves}</p>
              </div>
            </div>
          )}

          {/* 유사 종목 */}
          {stockType && (
            <div>
              <p className="text-[10px] font-bold text-gray-500 mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-400" /> 비슷한 특성의 주식들
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {stockType.similarStocks.map((s) => (
                  <div key={s.name} className="bg-white/5 border border-white/8 rounded-xl p-2 text-center">
                    <div className="text-lg mb-0.5">{s.emoji}</div>
                    <p className="text-[10px] font-bold text-white">{s.name}</p>
                    <p className="text-[9px] text-gray-500 mt-0.5 leading-snug">{s.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI 수익률 비교 */}
          <div>
            <p className="text-[10px] font-bold text-gray-500 mb-2 flex items-center gap-1">
              <Users className="w-3 h-3" /> 성향별 AI 수익률 비교
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {scenario.aiStrategies.map((ai) => {
                const isMyType = getAIPersonality(ai.type) === userPersonality;
                return (
                  <div
                    key={ai.name}
                    className={cn(
                      'rounded-xl px-2 py-2 text-center relative',
                      isMyType ? 'bg-cyan-500/15 border-2 border-cyan-400/40'
                        : ai.color === 'green' ? 'bg-green-500/10 border border-green-500/20'
                        : ai.color === 'red' ? 'bg-red-500/10 border border-red-500/20'
                        : 'bg-blue-500/10 border border-blue-500/20'
                    )}
                  >
                    {isMyType && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">나</div>
                    )}
                    <div className="text-sm">{ai.emoji}</div>
                    <div className="text-[9px] text-gray-400 mt-0.5">{ai.type}</div>
                    <div className={cn('text-[11px] font-bold mt-0.5', ai.returnRate.startsWith('+') ? 'text-green-400' : ai.returnRate.startsWith('-') ? 'text-red-400' : 'text-gray-400')}>
                      {ai.returnRate}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 도전 버튼 */}
          <button
            onClick={() => router.push(`/learn/scenarios/${scenario.id}`)}
            className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white text-xs font-bold rounded-xl py-2.5 transition-all active:scale-[0.98]"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>도전하기</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Tab ────────────────────────────────────────────────────
interface Props {
  userPersonality: InvestorPersonality;
}

export function ScenarioTab({ userPersonality }: Props) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const myDNA = INVESTOR_DNA_MAP[userPersonality];

  const diffFilters = [
    { label: '전체', value: 'all' },
    { label: '초급', value: 2, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { label: '중급', value: 3, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    { label: '고급', value: 4, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    { label: '최고급', value: 5, color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  ];

  const filtered = LEGENDARY_SCENARIOS.filter(
    (s) => activeFilter === 'all' || s.difficulty === Number(activeFilter)
  );

  return (
    <div className="space-y-4">
      <ScenarioHero myDNA={myDNA} />

      {/* 난이도 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {diffFilters.map((f) => (
          <button
            key={String(f.value)}
            onClick={() => setActiveFilter(String(f.value))}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap shrink-0 transition-all',
              String(activeFilter) === String(f.value)
                ? f.value === 'all' ? 'bg-white/20 text-white border-white/30' : (f.color || '') + ' opacity-100'
                : 'bg-[#252525] text-gray-500 border-white/5'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 시나리오 목록 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-xs font-bold text-gray-500">
            <Trophy className="w-3 h-3 inline mr-1 text-yellow-500" />
            학습 시나리오 {filtered.length}개
          </h4>
          <span className="text-[10px] text-gray-600">탭하여 펼치기</span>
        </div>
        {filtered.map((scenario) => (
          <ScenarioCard key={scenario.id} scenario={scenario} userPersonality={userPersonality} />
        ))}
      </div>
    </div>
  );
}
