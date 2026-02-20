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
  Eye,
  Zap,
} from 'lucide-react';
import { SignalBadge, DifficultyBar } from './components';

export default function PatternDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [pattern, setPattern] = useState<ChartPattern | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

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

        {/* 설명 */}
        <section className="mt-4">
          <div className="bg-[#252525] rounded-xl p-4 border border-white/5">
            <div className="flex items-start gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <p className="text-xs font-bold text-blue-400">패턴 설명</p>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{pattern.description}</p>
          </div>
        </section>

        {/* 읽는 법 */}
        <section className="mt-3">
          <div className="bg-[#252525] rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-start gap-2 mb-2">
              <Eye className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
              <p className="text-xs font-bold text-purple-400">차트에서 읽는 법</p>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{pattern.howToRead}</p>
          </div>
        </section>

        {/* 핵심 포인트 */}
        <section className="mt-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
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
        </section>

        {/* 매매 팁 */}
        <section className="mt-4">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-yellow-400 mb-1">실전 매매 팁</p>
                <p className="text-xs text-gray-300 leading-relaxed">{pattern.tradingTip}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 실전 예시 */}
        <section className="mt-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-400" />
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
        </section>

        {/* 주의사항 */}
        <section className="mt-4">
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-orange-400 mb-1">주의사항</p>
                <p className="text-xs text-gray-300 leading-relaxed">
                  패턴은 100% 정확하지 않습니다. 반드시 거래량, 이동평균선 등
                  다른 지표와 함께 종합적으로 판단하세요. 하나의 패턴에만 의존하면 위험합니다.
                </p>
              </div>
            </div>
          </div>
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
            onClick={() => router.back()}
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
