'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Waves, Brain, Star, RotateCcw, Zap } from 'lucide-react';
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

function fmtPnl(n: number) { return `${n >= 0 ? '+' : ''}${n.toLocaleString('ko-KR')}원`; }

function StarRow({ count, max = 3, size = 'lg' }: { count: number; max?: number; size?: 'sm' | 'lg' }) {
  return (
    <div className={cn('flex', size === 'lg' ? 'gap-2' : 'gap-0.5')}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            size === 'lg' ? 'w-10 h-10' : 'w-4 h-4',
            i < count ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700 fill-gray-800'
          )}
        />
      ))}
    </div>
  );
}

function WaveAccuracyBar({ label, value, color }: { label: string; value: number; color: string }) {
  const barColors: Record<string, string> = {
    cyan: 'bg-cyan-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
  };
  const textColors: Record<string, string> = {
    cyan: 'text-cyan-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    yellow: 'text-yellow-400',
  };
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-gray-400">{label}</span>
        <span className={cn('text-xs font-bold', textColors[color] ?? 'text-white')}>{value}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', barColors[color] ?? 'bg-white')}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function WavePracticeResultPage() {
  const params = useParams();
  const router = useRouter();

  const record = historyData.wavePractice.find((s) => s.id === params.id);

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
          <span className="text-sm font-black text-white">파도 연습 결과</span>
          <div className="w-8" />
        </div>
      </div>

      <main className="pt-14 px-4 max-w-md mx-auto">

        {/* Hero */}
        <section className="mt-5 text-center">
          <div className="text-7xl mb-3 animate-pulse">{record.patternEmoji}</div>
          <h2 className="text-2xl font-black text-white mb-1">{record.patternName}</h2>
          <p className="text-gray-400 text-sm mb-4">
            {record.rounds}라운드 · {record.date}
          </p>
          {record.isExperiment && (
            <span className="inline-flex items-center gap-1 bg-cyan-500/20 text-cyan-300 text-xs px-3 py-1 rounded-full border border-cyan-500/30 font-bold mb-4">
              🧪 실험 기록
            </span>
          )}
          <div className="flex justify-center mb-4">
            <StarRow count={record.stars} />
          </div>
        </section>

        {/* 점수 카드 */}
        <section className="bg-gradient-to-br from-[#0a1319] to-[#0d1a22] rounded-3xl p-6 border border-cyan-500/20 text-center mb-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 text-8xl opacity-5 -mr-4 -mt-4 select-none">🌊</div>
          <div className="relative z-10">
            <p className="text-sm text-gray-500 mb-1">최종 점수</p>
            <p className="text-6xl font-black text-white">
              {record.totalScore}
              <span className="text-xl text-gray-600">/{record.maxScore}</span>
            </p>
            <div className="mt-3 h-3 bg-white/10 rounded-full overflow-hidden mx-4">
              <div
                className={cn(
                  'h-full rounded-full bg-gradient-to-r',
                  pct >= 85 ? 'from-cyan-400 to-blue-400'
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
            <p className="text-sm text-cyan-300 mt-3 font-semibold">{record.highlight}</p>
          </div>
        </section>

        {/* 파도 정확도 분석 */}
        <section className="bg-[#0f0f0f] rounded-2xl border border-cyan-500/20 p-4 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Waves className="w-5 h-5 text-cyan-400" />
            <p className="text-sm font-bold text-white">파동 정확도 분석</p>
          </div>
          <div className="space-y-3">
            {record.wave3Accuracy !== undefined && (
              <WaveAccuracyBar label="3파 집중도" value={record.wave3Accuracy} color="cyan" />
            )}
            {record.correctionAccuracy !== undefined && (
              <WaveAccuracyBar label="조정파 대응" value={record.correctionAccuracy} color="blue" />
            )}
            <WaveAccuracyBar label="전체 점수율" value={Math.round(pct)} color="purple" />
          </div>

          <div className="mt-4 bg-black/30 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-bold text-yellow-400">파동 분석 코멘트</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {record.wave3Accuracy !== undefined && record.wave3Accuracy >= 90
                ? '3파 포착 능력이 탁월합니다. 엘리엇 파동의 핵심을 정확히 이해하고 있어요.'
                : record.wave3Accuracy !== undefined && record.wave3Accuracy >= 75
                ? '3파 감지는 좋지만 조정파 대응을 더 연습하면 수익이 크게 늘 거예요.'
                : '파동 패턴을 꾸준히 연습하면 타이밍 정확도가 올라갑니다.'}
            </p>
          </div>
        </section>

        {/* 라운드별 결과 */}
        <section className="bg-[#0f0f0f] rounded-2xl border border-white/5 overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-black text-cyan-300">라운드별 결과</span>
          </div>
          <div className="divide-y divide-white/5">
            {record.roundResults.map((r) => {
              const rPct = (r.score / 20) * 100;
              const barColor = rPct >= 80 ? 'bg-cyan-500' : rPct >= 60 ? 'bg-blue-500' : rPct >= 40 ? 'bg-yellow-500' : 'bg-red-500';
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
                    <p className="text-xs text-cyan-400 mt-1.5 ml-10 font-bold">🌊 베스트 라운드</p>
                  )}
                </div>
              );
            })}
          </div>
          <div className="px-4 py-3 border-t border-white/5 bg-[#0a0a0f] flex items-center justify-between">
            <span className="text-xs text-gray-500">3라운드 합계</span>
            <span className="text-base font-black text-cyan-400">
              {record.totalScore}<span className="text-gray-600 text-xs">/{record.maxScore}</span>
            </span>
          </div>
        </section>

        {/* 평균 턴 점수 */}
        <section className="bg-[#0f0f0f] rounded-2xl border border-white/5 p-4 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
              <p className="text-xs text-gray-400 mb-1">평균 턴 점수</p>
              <p className="text-xl font-black text-white">{record.avgTurnScore.toFixed(1)}</p>
            </div>
            <div className="bg-cyan-500/10 rounded-xl p-3 text-center border border-cyan-500/20">
              <p className="text-xs text-gray-400 mb-1">베스트 라운드</p>
              <p className="text-xl font-black text-cyan-400">R{record.bestRound}</p>
            </div>
          </div>
        </section>
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
            className="flex-[2] h-14 rounded-2xl font-black text-base text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            다시 도전
          </button>
        </div>
      </div>
    </div>
  );
}
