'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CHART_PATTERNS,
  PATTERN_CATEGORIES,
  SIGNAL_COLORS,
  type PatternCategory,
  type ChartPattern,
} from '@/data/chart-patterns';
import { BASIC_STRATEGIES } from '@/data/pattern-practice';
import { ChevronDown, ChevronRight, Zap, BookOpen, Waves, TrendingUp, Target, Brain, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MiniPatternChart } from './MiniPatternChart';

const SIGNAL_LABEL: Record<string, string> = {
  매수: '↑ 매수',
  매도: '↓ 매도',
  양방향: '↕ 양방향',
};

// ─── Hero Section ────────────────────────────────────────────────
function PatternHero({ totalCount }: { totalCount: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-gradient-to-r from-indigo-600/80 to-purple-700/80 rounded-2xl border border-indigo-500/30 text-white overflow-hidden">
      <button className="w-full flex items-center gap-4 p-4 text-left" onClick={() => setOpen(!open)}>
        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0">
          <Waves className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-purple-200 font-semibold">파도 패턴 연습</p>
          <h3 className="text-base font-bold">파도 흐름 읽는 눈 키우기</h3>
          <p className="text-[11px] text-purple-100/70 mt-0.5">패턴으로 파도의 전환점을 포착하세요</p>
        </div>
        <ChevronDown className={cn('w-4 h-4 opacity-60 shrink-0 transition-transform duration-200', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-white/10 space-y-3">
          <div className="mt-3 bg-white/10 rounded-xl p-3 space-y-1.5">
            <p className="text-xs font-bold text-purple-200 mb-2">🌊 파도 패턴이란?</p>
            {[
              '주가의 파도는 특정 모양(패턴)을 만들며 흘러가요',
              '패턴을 읽으면 파도의 전환점을 미리 알 수 있어요',
              '상승 파도(↑)와 하락 파도(↓)의 신호를 구분하세요',
              '패턴 연습으로 AI와의 갭을 줄여나가세요',
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-purple-300 text-xs shrink-0 mt-0.5">0{i + 1}</span>
                <span className="text-[11px] text-purple-100 leading-snug">{text}</span>
              </div>
            ))}
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: '0%' }} />
          </div>
          <p className="text-[10px] text-purple-100/60 text-center">0 / {totalCount} 패턴 연습 완료</p>
        </div>
      )}
    </div>
  );
}

// ─── Pattern Card ────────────────────────────────────────────────
function PatternCard({ pattern, catConfig }: { pattern: ChartPattern; catConfig: { emoji: string; color: string; bgColor: string; borderColor: string } }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const sigColor = SIGNAL_COLORS[pattern.signal];

  return (
    <div className={cn('rounded-2xl border transition-all duration-200', open ? 'bg-[#1e1e2e] border-indigo-500/30' : 'bg-[#252525] border-white/5 hover:border-white/10')}>
      {/* 접힌 상태 */}
      <div className="w-full flex items-center gap-3 p-3.5">
        {/* 클릭 가능한 카드 본체 영역 */}
        <div
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
          onClick={() => router.push(`/learn/patterns/${pattern.id}`)}
        >
          {/* 미니 차트 */}
          <div className="shrink-0 rounded-xl overflow-hidden border border-white/5">
            <MiniPatternChart chartData={pattern.chartData} signal={pattern.signal} />
          </div>

          {/* 텍스트 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-sm">{pattern.emoji}</span>
              <p className="font-bold text-white text-sm truncate">{pattern.name}</p>
            </div>
            {/* 간단 설명 한 줄 */}
            <p className="text-[10px] text-gray-400 mb-1.5 line-clamp-1 leading-snug">
              {pattern.description}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-md border', sigColor.bg, sigColor.color, sigColor.border)}>
                {SIGNAL_LABEL[pattern.signal]}
              </span>
              <span className="text-[10px] text-yellow-400">{'⭐'.repeat(pattern.difficulty)}</span>
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
        <div className="px-4 pb-4 border-t border-white/5 mt-0 space-y-3">
          {/* 파도 흐름 분석 */}
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            <div className="bg-cyan-500/10 rounded-xl p-2 text-center border border-cyan-500/20">
              <Waves className="w-3 h-3 mx-auto mb-0.5 text-cyan-400" />
              <p className="text-[8px] text-gray-500">파도 유형</p>
              <p className="text-[10px] font-bold text-cyan-300">
                {pattern.signal === '매수' ? '상승 파도' : pattern.signal === '매도' ? '하락 파도' : '전환 파도'}
              </p>
            </div>
            <div className="bg-purple-500/10 rounded-xl p-2 text-center border border-purple-500/20">
              <TrendingUp className="w-3 h-3 mx-auto mb-0.5 text-purple-400" />
              <p className="text-[8px] text-gray-500">난이도</p>
              <p className="text-[10px] font-bold text-purple-300">{'⭐'.repeat(pattern.difficulty)}</p>
            </div>
            <div className="bg-yellow-500/10 rounded-xl p-2 text-center border border-yellow-500/20">
              <Target className="w-3 h-3 mx-auto mb-0.5 text-yellow-400" />
              <p className="text-[8px] text-gray-500">정확도 목표</p>
              <p className="text-[10px] font-bold text-yellow-300">{70 + pattern.difficulty * 5}%</p>
            </div>
          </div>

          {/* 핵심 포인트 */}
          <div className="space-y-1.5">
            {pattern.keyPoints.map((point, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-indigo-400 text-xs mt-0.5 shrink-0">✦</span>
                <span className="text-[11px] text-gray-300 leading-snug">{point}</span>
              </div>
            ))}
          </div>

          {/* 파도 읽기 코멘트 */}
          <div className="bg-cyan-500/8 border border-cyan-500/20 rounded-xl p-2.5 flex items-start gap-2">
            <Waves className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-cyan-300 mb-0.5">파도 읽기 포인트</p>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                이 패턴이 나타나면 파도의 {pattern.signal === '매수' ? '상승 전환' : pattern.signal === '매도' ? '하락 전환' : '방향 전환'}을 
                예상할 수 있어요. 거래량 증가와 함께 나타나면 신뢰도가 높아요.
              </p>
            </div>
          </div>

          {/* 매매 팁 */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-2.5 flex items-start gap-2">
            <Zap className="w-3.5 h-3.5 text-yellow-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-yellow-300 leading-snug">{pattern.tradingTip}</p>
          </div>

          {/* 실전 예시 */}
          <div className="bg-white/5 border border-white/8 rounded-xl p-2.5">
            <p className="text-[10px] font-bold text-gray-400 mb-1.5 flex items-center gap-1">
              <BookOpen className="w-2.5 h-2.5" /> 실전 예시
            </p>
            <p className="text-[10px] text-gray-500 leading-snug">
              <span className="text-gray-300 font-semibold">상황:</span> {pattern.example.situation}
            </p>
            <p className="text-[10px] text-gray-500 leading-snug mt-1">
              <span className="text-green-400 font-semibold">대응:</span> {pattern.example.action}
            </p>
          </div>

          {/* 연습 버튼 */}
          <button
            onClick={() => router.push(`/learn/patterns/${pattern.id}`)}
            className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl py-2.5 transition-colors active:scale-[0.98]"
          >
            <Waves className="w-3.5 h-3.5" />
            <span>파도 패턴 연습하기</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Category Section ────────────────────────────────────────────
function CategorySection({ category }: { category: PatternCategory }) {
  const [collapsed, setCollapsed] = useState(false);
  const catConfig = PATTERN_CATEGORIES[category];
  const patterns = CHART_PATTERNS.filter((p) => p.category === category);

  return (
    <div className="space-y-2">
      <button onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center gap-2 py-1.5">
        <span className="text-lg">{catConfig.emoji}</span>
        <h4 className="text-sm font-bold text-white flex-1 text-left">{category}</h4>
        <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{patterns.length}개</span>
        <ChevronDown className={cn('w-3.5 h-3.5 text-gray-500 transition-transform duration-200', collapsed && '-rotate-90')} />
      </button>

      {!collapsed && (
        <div className="space-y-2">
          {patterns.map((pattern) => (
            <PatternCard key={pattern.id} pattern={pattern} catConfig={catConfig} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Basic Strategy Card ─────────────────────────────────────────
function BasicStrategyCard({ strategy }: { strategy: typeof BASIC_STRATEGIES[number] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <div className={cn(
      'rounded-2xl border transition-all duration-200',
      open ? 'bg-[#1a1a2e] border-emerald-500/30' : 'bg-[#252525] border-white/5 hover:border-white/10'
    )}>
      <div className="w-full flex items-center gap-3 p-3.5">
        <div
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
            <span className="text-xl">{strategy.emoji}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="font-bold text-white text-sm truncate">{strategy.name}</p>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shrink-0">
                {strategy.category}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 line-clamp-1 leading-snug">{strategy.description}</p>
            <p className="text-[10px] text-emerald-400/70 mt-0.5">{strategy.scenarios.length}개 시나리오 · 10턴</p>
          </div>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="shrink-0 p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <ChevronDown className={cn('w-4 h-4 text-gray-500 transition-transform duration-200', open && 'rotate-180')} />
        </button>
      </div>

      {open && (
        <div className="px-4 pb-4 border-t border-white/5 space-y-3">
          {/* 핵심 학습 */}
          <div className="mt-3 bg-emerald-500/8 border border-emerald-500/20 rounded-xl p-3 flex items-start gap-2">
            <Brain className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-emerald-300 mb-0.5">핵심 학습</p>
              <p className="text-[10px] text-gray-300 leading-relaxed">{strategy.keyLesson}</p>
            </div>
          </div>

          {/* 파동 패턴 */}
          <div className="bg-cyan-500/8 border border-cyan-500/20 rounded-xl p-3 flex items-start gap-2">
            <Waves className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-cyan-300 mb-0.5">파동 흐름</p>
              <p className="text-[10px] text-gray-300 leading-relaxed">{strategy.wavePattern}</p>
            </div>
          </div>

          {/* 시나리오 목록 */}
          <div className="space-y-2">
            {strategy.scenarios.map((scenario, idx) => (
              <div key={scenario.id} className="bg-[#1e1e1e] rounded-xl p-3 border border-white/5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black flex items-center justify-center shrink-0">{idx + 1}</span>
                  <p className="text-xs font-bold text-white truncate">{scenario.title}</p>
                  <span className={cn(
                    'text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0',
                    scenario.signal === 'buy'
                      ? 'bg-green-500/15 text-green-400 border border-green-500/25'
                      : 'bg-red-500/15 text-red-400 border border-red-500/25'
                  )}>
                    {scenario.signal === 'buy' ? '↑ 매수' : '↓ 매도'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 leading-snug pl-7">{scenario.theme}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push(`/learn/patterns/${strategy.id}`)}
            className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl py-2.5 transition-colors active:scale-[0.98]"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>전략 연습하기</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Basic Strategy Section ──────────────────────────────────────
function BasicStrategySection() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="space-y-2">
      <button onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center gap-2 py-1.5">
        <span className="text-lg">🧠</span>
        <h4 className="text-sm font-bold text-white flex-1 text-left">기본 전략</h4>
        <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{BASIC_STRATEGIES.length}개</span>
        <ChevronDown className={cn('w-3.5 h-3.5 text-gray-500 transition-transform duration-200', collapsed && '-rotate-90')} />
      </button>
      {!collapsed && (
        <div className="space-y-2">
          <p className="text-[10px] text-gray-500 px-1 leading-relaxed">
            처분효과·그라데이션 등 실전 투자 심리와 분할매매 전략을 10턴으로 연습해요
          </p>
          {BASIC_STRATEGIES.map((strategy) => (
            <BasicStrategyCard key={strategy.id} strategy={strategy} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab Section Header ──────────────────────────────────────────
function SectionDivider({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex-1 h-px bg-white/8" />
      <div className="text-center">
        <p className="text-[11px] font-black text-gray-400 tracking-widest uppercase">{label}</p>
        <p className="text-[9px] text-gray-600 mt-0.5">{sub}</p>
      </div>
      <div className="flex-1 h-px bg-white/8" />
    </div>
  );
}

// ─── Main Tab ────────────────────────────────────────────────────
export function PatternTab() {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filters = [
    { label: '전체', value: 'all', emoji: '📋' },
    { label: '기본 전략', value: 'basic', emoji: '🧠' },
    ...Object.entries(PATTERN_CATEGORIES).map(([key, val]) => ({
      label: key,
      value: key,
      emoji: val.emoji,
    })),
  ];

  const showBasic = activeFilter === 'all' || activeFilter === 'basic';
  const showPatterns = activeFilter === 'all' || activeFilter !== 'basic';

  const categories = (Object.keys(PATTERN_CATEGORIES) as PatternCategory[]).filter(
    (cat) => activeFilter === 'all' || activeFilter === cat
  );

  return (
    <div className="space-y-4">
      <PatternHero totalCount={CHART_PATTERNS.length} />

      {/* 카테고리 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap shrink-0 flex items-center gap-1 transition-all',
              activeFilter === filter.value
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-[#252525] text-gray-400 border-white/5 hover:border-white/15'
            )}
          >
            <span>{filter.emoji}</span>
            {filter.label}
          </button>
        ))}
      </div>

      {/* 기본 전략 섹션 */}
      {showBasic && (
        <>
          <SectionDivider label="기본 전략" sub="행동심리 · 분할매매 · 10턴 연습" />
          <BasicStrategySection />
        </>
      )}

      {/* 차트 패턴 섹션 */}
      {showPatterns && (
        <>
          {showBasic && (
            <SectionDivider label="차트 패턴" sub="추세 반전 · 추세 지속 · 캔들스틱" />
          )}
          <div className="space-y-5">
            {categories.map((category) => (
              <CategorySection key={category} category={category} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
