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
import { ChevronDown, ChevronRight, Zap, BookOpen } from 'lucide-react';
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
        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl shrink-0">📊</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-purple-200 font-semibold">차트 패턴 도감</p>
          <h3 className="text-base font-bold">패턴을 읽는 눈 키우기</h3>
          <p className="text-[11px] text-purple-100/70 mt-0.5">리스트에서 패턴 차트를 미리 확인하세요</p>
        </div>
        <ChevronDown className={cn('w-4 h-4 opacity-60 shrink-0 transition-transform duration-200', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-white/10 space-y-3">
          <div className="mt-3 bg-white/10 rounded-xl p-3 space-y-1.5">
            <p className="text-xs font-bold text-purple-200 mb-2">📈 차트 패턴이란?</p>
            {[
              '주가가 특정 모양(패턴)을 만들면 이후 방향을 예측할 수 있어요',
              '매수 타이밍(↑)과 매도 타이밍(↓)을 잡는 핵심 도구',
              '패턴을 알면 공포에 팔고 욕심에 사는 실수를 줄일 수 있어요',
              '카드를 탭해서 패턴 차트와 핵심 포인트를 확인하세요',
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
          <p className="text-[10px] text-purple-100/60 text-center">0 / {totalCount} 패턴 학습 완료</p>
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
          {/* 핵심 포인트 */}
          <div className="mt-3 space-y-1.5">
            {pattern.keyPoints.map((point, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-indigo-400 text-xs mt-0.5 shrink-0">✦</span>
                <span className="text-[11px] text-gray-300 leading-snug">{point}</span>
              </div>
            ))}
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

          {/* 자세히 보기 버튼 */}
          <button
            onClick={() => router.push(`/learn/patterns/${pattern.id}`)}
            className="w-full flex items-center justify-center gap-1.5 bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl py-2.5 transition-colors active:scale-[0.98]"
          >
            <span>상세 학습 + 실전 연습</span>
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

// ─── Main Tab ────────────────────────────────────────────────────
export function PatternTab() {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filters = [
    { label: '전체', value: 'all', emoji: '📋' },
    ...Object.entries(PATTERN_CATEGORIES).map(([key, val]) => ({
      label: key,
      value: key,
      emoji: val.emoji,
    })),
  ];

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

      {/* 카테고리별 패턴 목록 */}
      <div className="space-y-5">
        {categories.map((category) => (
          <CategorySection key={category} category={category} />
        ))}
      </div>
    </div>
  );
}
