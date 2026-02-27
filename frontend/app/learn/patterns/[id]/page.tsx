'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MobileHeader } from '@/components/mobile-header';
import { Button } from '@/components/ui/button';
import {
  CHART_PATTERNS,
  PATTERN_CATEGORIES,
  type ChartPattern,
} from '@/data/chart-patterns';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Target,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  BarChart2,
  ListOrdered,
  Coins,
} from 'lucide-react';
import {
  SignalBadge,
  DifficultyBar,
  PatternChartSVG,
  PatternSteps,
  ProfitScenario,
} from './components';

type TabId = 'chart' | 'steps' | 'profit';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'chart',  label: '차트 분석',  icon: <BarChart2 className="w-3.5 h-3.5" /> },
  { id: 'steps',  label: '단계별 설명', icon: <ListOrdered className="w-3.5 h-3.5" /> },
  { id: 'profit', label: '수익 계산',   icon: <Coins className="w-3.5 h-3.5" /> },
];

export default function PatternDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [pattern, setPattern] = useState<ChartPattern | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TabId>('chart');

  useEffect(() => {
    const found = CHART_PATTERNS.find(p => p.id === params.id);
    setPattern(found || null);
    if (found) {
      setCurrentIndex(CHART_PATTERNS.findIndex(p => p.id === found.id));
    }
  }, [params.id]);

  if (!pattern) {
    return (
      <div className="min-h-screen bg-[#191919] flex items-center justify-center">
        <div className="animate-pulse text-4xl">📊</div>
      </div>
    );
  }

  const catConfig = PATTERN_CATEGORIES[pattern.category];
  const prevPattern = currentIndex > 0 ? CHART_PATTERNS[currentIndex - 1] : null;
  const nextPattern = currentIndex < CHART_PATTERNS.length - 1 ? CHART_PATTERNS[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-[#191919] pb-32">
      <MobileHeader title={pattern.name} showBack showSettings />

      <main className="pt-16 px-5 max-w-md mx-auto">
        {/* 히어로 */}
        <section className="mt-4 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/20 border border-white/30"
              )}>
                {catConfig.emoji} {pattern.category}
              </span>
              <SignalBadge signal={pattern.signal} />
            </div>

            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-2xl font-bold">{pattern.emoji} {pattern.name}</h2>
                <p className="text-sm opacity-70 mt-0.5">{pattern.nameEn}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <DifficultyBar value={pattern.difficulty} label="난이도" />
              <DifficultyBar value={pattern.reliability} label="신뢰도" />
            </div>
          </div>
        </section>

        {/* 한줄 설명 */}
        <section className="mt-3">
          <div className="bg-[#252525] rounded-xl p-3.5 border border-white/5 flex items-start gap-2">
            <BookOpen className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-300 leading-relaxed">{pattern.description}</p>
          </div>
        </section>

        {/* 탭 */}
        <section className="mt-4">
          <div className="grid grid-cols-3 gap-1.5 bg-[#1a1a1a] rounded-xl p-1 border border-white/5">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-300',
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* 탭 컨텐츠 */}
        <section className="mt-4">

          {/* ── 탭 1: 차트 분석 ── */}
          {activeTab === 'chart' && (
            <div className="space-y-4">
              {/* SVG 차트 */}
              <PatternChartSVG
                chartData={pattern.chartData}
                signal={pattern.signal}
                patternName={pattern.name}
              />

              {/* 차트에서 읽는 법 */}
              <div className="bg-[#252525] rounded-xl p-4 border border-purple-500/20">
                <p className="text-[10px] font-bold text-purple-400 mb-2">📖 차트에서 읽는 법</p>
                <p className="text-xs text-gray-300 leading-relaxed">{pattern.howToRead}</p>
              </div>

              {/* 핵심 포인트 */}
              <div>
                <h3 className="text-sm font-bold text-white mb-2.5 flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-400" />
                  핵심 포인트
                </h3>
                <div className="space-y-2">
                  {pattern.keyPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-[#252525] rounded-xl p-3 border border-white/5">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-[10px] font-bold text-green-400 shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-gray-300">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 매매 팁 */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-yellow-400 mb-1">실전 매매 팁</p>
                    <p className="text-xs text-gray-300 leading-relaxed">{pattern.tradingTip}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── 탭 2: 단계별 설명 ── */}
          {activeTab === 'steps' && (
            <div className="space-y-4">
              <div className="bg-[#252525] rounded-xl p-3 border border-white/5 flex items-start gap-2">
                <span className="text-lg shrink-0">🎬</span>
                <div>
                  <p className="text-xs font-bold text-white mb-0.5">실전 상황별 흐름</p>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    패턴이 만들어지는 과정을 단계별로 따라가 보세요. 각 상황에서 어떻게 대응해야 하는지 알 수 있어요.
                  </p>
                </div>
              </div>

              <PatternSteps steps={pattern.steps} signal={pattern.signal} />

              {/* 실전 예시 */}
              <div>
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <span className="text-base">⚡</span>
                  실전 예시
                </h3>
                <div className="bg-[#252525] rounded-xl p-4 border border-orange-500/20 space-y-3">
                  <div>
                    <p className="text-[10px] font-bold text-orange-400 mb-1">상황</p>
                    <p className="text-xs text-gray-300">{pattern.example.situation}</p>
                  </div>
                  <div className="h-px bg-white/5" />
                  <div>
                    <p className="text-[10px] font-bold text-blue-400 mb-1">행동</p>
                    <p className="text-xs text-gray-300">{pattern.example.action}</p>
                  </div>
                  <div className="h-px bg-white/5" />
                  <div>
                    <p className="text-[10px] font-bold text-green-400 mb-1">결과</p>
                    <p className="text-xs text-gray-300 font-bold">{pattern.example.result}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── 탭 3: 수익 계산 ── */}
          {activeTab === 'profit' && (
            <div className="space-y-4">
              <div className="bg-[#252525] rounded-xl p-3 border border-white/5 flex items-start gap-2">
                <span className="text-lg shrink-0">💰</span>
                <div>
                  <p className="text-xs font-bold text-white mb-0.5">돈으로 보는 수익 구조</p>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    실제 투자했을 때 얼마를 벌고, 얼마를 잃을 수 있는지 구체적인 금액으로 알아봐요.
                  </p>
                </div>
              </div>

              <ProfitScenario scenario={pattern.profitScenario} />

              {/* 주의사항 */}
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-orange-400 mb-1">⚠️ 꼭 기억하세요!</p>
                    <div className="text-xs text-gray-300 space-y-1">
                      <p>• 이 수익은 <span className="text-white font-bold">예시이며 보장되지 않아요</span></p>
                      <p>• 손절가를 <span className="text-white font-bold">반드시</span> 지켜야 해요</p>
                      <p>• 한 종목에 전부 투자하면 위험해요!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 이전/다음 패턴 네비게이션 */}
        <section className="mt-6 flex gap-3">
          {prevPattern ? (
            <button
              onClick={() => router.push(`/learn/patterns/${prevPattern.id}`)}
              className="flex-1 bg-[#252525] rounded-xl p-3 border border-white/5 text-left hover:bg-[#2a2a2a] transition-all"
            >
              <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-1">
                <ChevronLeft className="w-3 h-3" /> 이전 패턴
              </div>
              <p className="text-xs font-bold text-white truncate">{prevPattern.emoji} {prevPattern.name}</p>
            </button>
          ) : <div className="flex-1" />}

          {nextPattern ? (
            <button
              onClick={() => router.push(`/learn/patterns/${nextPattern.id}`)}
              className="flex-1 bg-[#252525] rounded-xl p-3 border border-white/5 text-right hover:bg-[#2a2a2a] transition-all"
            >
              <div className="flex items-center justify-end gap-1 text-[10px] text-gray-500 mb-1">
                다음 패턴 <ChevronRight className="w-3 h-3" />
              </div>
              <p className="text-xs font-bold text-white truncate">{nextPattern.emoji} {nextPattern.name}</p>
            </button>
          ) : <div className="flex-1" />}
        </section>
      </main>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#191919] via-[#191919] to-transparent">
        <div className="max-w-md mx-auto flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/learn?tab=patterns')}
            className="flex-1 h-12 rounded-xl bg-[#252525] border-white/10 text-white hover:bg-[#333]"
          >
            목록으로
          </Button>
          <Button
            onClick={() => router.push(`/learn/patterns/${pattern.id}/practice`)}
            className="flex-[2] h-12 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            패턴 연습하기
          </Button>
        </div>
      </div>
    </div>
  );
}
