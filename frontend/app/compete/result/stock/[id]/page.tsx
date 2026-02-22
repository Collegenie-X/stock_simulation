'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star, Brain, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import historyData from '@/data/compete-history.json';

// ── Grade Config ─────────────────────────────────────────────

const GRADE_STYLE: Record<string, string> = {
  S: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  A: 'bg-green-500/20 text-green-300 border-green-500/40',
  B: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  C: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  D: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const GRADE_EMOJI: Record<string, string> = {
  S: '🔥',
  A: '😎',
  B: '😊',
  C: '😅',
  D: '😓',
};

function fmtPnl(n: number) { return `${n >= 0 ? '+' : ''}${n.toLocaleString('ko-KR')}원`; }

function StarRow({ count, max = 3, size = 'lg' }: { count: number; max?: number; size?: 'sm' | 'lg' }) {
  return (
    <div className={cn('flex gap-1', size === 'sm' ? 'gap-0.5' : 'gap-2')}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            size === 'lg' ? 'w-10 h-10' : 'w-4 h-4',
            i < count ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700 fill-gray-800'
          )}
          style={size === 'lg' ? { transitionDelay: `${i * 200}ms` } : undefined}
        />
      ))}
    </div>
  );
}

export default function StockPracticeResultPage() {
  const params = useParams();
  const router = useRouter();

  const record = historyData.stockPractice.find((s) => s.id === params.id);

  if (!record) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-4">
        <p className="text-gray-400">기록을 찾을 수 없습니다.</p>
        <button onClick={() => router.back()} className="text-blue-400 text-sm">← 돌아가기</button>
      </div>
    );
  }

  const pct = (record.totalScore / record.maxScore) * 100;
  const avgTurn = (record.totalScore / (record.rounds * 8)).toFixed(2);

  return (
    <div className="min-h-screen bg-black pb-32">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center justify-between h-14 px-4 max-w-md mx-auto">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-gray-300" />
          </button>
          <span className="text-sm font-black text-white">한종목 연습 결과</span>
          <div className="w-8" />
        </div>
      </div>

      <main className="pt-14 px-4 max-w-md mx-auto">

        {/* Hero */}
        <section className="mt-5 text-center">
          <div className="text-7xl mb-3">{record.patternEmoji}</div>
          <div className="flex items-center justify-center gap-2 mb-1">
            {record.stockEmoji && <span className="text-3xl">{record.stockEmoji}</span>}
            <h2 className="text-2xl font-black text-white">{record.patternName}</h2>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            {record.stockName} · {record.rounds}라운드 · {record.date}
          </p>
          {record.isExperiment && (
            <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-300 text-xs px-3 py-1 rounded-full border border-purple-500/30 font-bold mb-4">
              🧪 실험 기록
            </span>
          )}
          <div className="flex justify-center mb-4">
            <StarRow count={record.stars} />
          </div>
        </section>

        {/* 점수 카드 */}
        <section className="bg-[#111] rounded-3xl p-6 border border-white/5 text-center mb-4">
          <p className="text-sm text-gray-500 mb-1">최종 점수</p>
          <p className="text-6xl font-black text-white">
            {record.totalScore}
            <span className="text-xl text-gray-600">/{record.maxScore}</span>
          </p>
          <div className="mt-3 h-3 bg-white/10 rounded-full overflow-hidden mx-4">
            <div
              className={cn(
                'h-full rounded-full bg-gradient-to-r',
                pct >= 85 ? 'from-yellow-400 to-orange-400'
                  : pct >= 70 ? 'from-green-400 to-emerald-500'
                  : pct >= 55 ? 'from-blue-400 to-indigo-500'
                  : 'from-gray-500 to-gray-600'
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className={cn('text-xl font-black px-4 py-1.5 rounded-xl border', GRADE_STYLE[record.grade] ?? GRADE_STYLE.C)}>
              {record.grade}
            </span>
            <span className="text-gray-400 text-sm">턴 평균 {avgTurn}점</span>
          </div>
          <p className="text-sm text-gray-300 mt-3 font-semibold">{record.highlight}</p>
        </section>

        {/* 라운드별 결과 */}
        <section className="bg-[#0f0f0f] rounded-2xl border border-purple-500/20 overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-purple-500/10 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-black text-purple-300">라운드별 결과</span>
          </div>
          <div className="divide-y divide-white/5">
            {record.roundResults.map((r) => {
              const rPct = (r.score / 20) * 100;
              const barColor = rPct >= 80 ? 'bg-green-500' : rPct >= 60 ? 'bg-yellow-500' : rPct >= 40 ? 'bg-blue-500' : 'bg-red-500';
              return (
                <div key={r.round} className="px-4 py-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center text-sm font-black text-gray-400">
                      {r.round}
                    </div>
                    <span className="text-2xl">{r.emoji}</span>
                    <span className={cn('text-sm font-black px-2 py-0.5 rounded-lg border', GRADE_STYLE[r.grade] ?? GRADE_STYLE.C)}>
                      {r.grade}
                    </span>
                    <span className="text-base font-black text-yellow-400">{r.score}점</span>
                    <span className={cn('text-sm font-black ml-auto', r.pnl >= 0 ? 'text-green-400' : 'text-red-400')}>
                      {fmtPnl(r.pnl)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 shrink-0" />
                    <div className="flex-1 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full', barColor)} style={{ width: `${rPct}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-12 text-right">{rPct.toFixed(0)}%</span>
                  </div>
                  {r.round === record.bestRound && (
                    <p className="text-xs text-yellow-400 mt-1.5 ml-10 font-bold">⭐ 베스트 라운드</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* 총합 */}
          <div className="px-4 py-3 border-t border-purple-500/10 bg-[#0a0a15] flex items-center justify-between">
            <span className="text-xs text-gray-500">3라운드 합계</span>
            <span className="text-base font-black text-yellow-400">
              {record.totalScore}<span className="text-gray-600 text-xs">/{record.maxScore}</span>
            </span>
          </div>
        </section>

        {/* 수익률 */}
        {record.profitPct !== undefined && (
          <section className="bg-[#0f0f0f] rounded-2xl border border-white/5 p-4 mb-4">
            <p className="text-sm font-bold text-white mb-3">💰 수익률 요약</p>
            <div className="grid grid-cols-2 gap-3">
              <div className={cn('rounded-xl p-3 text-center border', record.profitPct >= 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20')}>
                <p className="text-xs text-gray-400 mb-1">평균 수익률</p>
                <p className={cn('text-xl font-black', record.profitPct >= 0 ? 'text-green-400' : 'text-red-400')}>
                  {record.profitPct >= 0 ? '+' : ''}{record.profitPct}%
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                <p className="text-xs text-gray-400 mb-1">평균 턴 점수</p>
                <p className="text-xl font-black text-white">{record.avgTurnScore.toFixed(1)}</p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black to-transparent">
        <div className="max-w-md mx-auto flex gap-3">
          <button
            onClick={() => router.back()}
            className="flex-1 h-14 rounded-2xl font-black text-base text-white bg-[#1a1a1a] border border-white/10"
          >
            돌아가기
          </button>
          <button
            onClick={() => router.push(`/learn/patterns`)}
            className="flex-[2] h-14 rounded-2xl font-black text-base text-white bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            다시 연습
          </button>
        </div>
      </div>
    </div>
  );
}
