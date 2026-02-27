'use client';

import { useState } from 'react';
import { Trophy, Eye, Info } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/format';
import { COMPETE_LABELS, RANK_MEDALS, RANK_GRADIENTS, RANKING_RULES } from '../config';

interface RankingUser {
  rank: number;
  userId: string;
  nickname: string;
  profitRate: number;
  totalAssets: number;
  badges: string[];
  level: number;
  style: string;
  portfolio: number;
  trades: number;
  waveType: string;
  weeklyScore?: number;
  cumulativeScore?: number;
  waveAccuracy?: number;
  winRate?: number;
  consistencyWeeks?: number;
}

interface LeaderboardSectionProps {
  rankings: RankingUser[];
}

const L = COMPETE_LABELS.leaderboard;

// 탭 타입
type RankTab = 'weekly' | 'cumulative';

// 탭별 정렬 기준 점수 반환
function getScore(user: RankingUser, tab: RankTab): number {
  return tab === 'weekly' ? (user.weeklyScore ?? 0) : (user.cumulativeScore ?? 0);
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 90 ? 'from-yellow-400 to-orange-400' :
    score >= 80 ? 'from-green-400 to-emerald-500' :
    score >= 70 ? 'from-blue-400 to-indigo-500' :
    'from-gray-500 to-gray-600';
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className={cn('h-full bg-gradient-to-r rounded-full', color)}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-[10px] font-black text-white/70 tabular-nums w-6 text-right">{score}</span>
    </div>
  );
}

function TopThreeCard({ user, idx, tab }: { user: RankingUser; idx: number; tab: RankTab }) {
  const gradient = RANK_GRADIENTS[idx] ?? 'from-gray-500 to-gray-600';
  const score = getScore(user, tab);

  return (
    <Link href={`/compete/${user.userId}`}>
      <div className={`bg-gradient-to-r ${gradient} rounded-2xl p-4 text-white shadow-lg cursor-pointer active:scale-98 transition-transform`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
              {RANK_MEDALS[idx]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-white">{user.nickname}</p>
                <div className="flex gap-1">
                  {user.badges.map((b, i) => (
                    <span key={i} className="text-sm">{b}</span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-white/70">Level {user.level} · {user.style}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-black">+{user.profitRate}%</p>
            <p className="text-xs text-white/70">{formatNumber(user.totalAssets)}원</p>
          </div>
        </div>

        {/* 도전자 점수 바 */}
        <div className="bg-white/10 rounded-xl px-3 py-2 mb-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/70">{L.scoreLabel}</span>
            <span className="text-sm font-black">{score}점</span>
          </div>
          <ScoreBar score={score} />
        </div>

        <div className="w-full bg-white/20 backdrop-blur-sm rounded-xl p-2.5 flex items-center justify-center gap-2 text-sm font-semibold mb-2">
          <Eye className="w-4 h-4" />
          {L.peekStrategy} ({L.peekCost})
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <p className="text-white/70">{L.portfolio}</p>
            <p className="font-bold">{user.portfolio}종목</p>
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <p className="text-white/70">{L.waveType}</p>
            <p className="font-bold leading-tight">{user.waveType}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <p className="text-white/70">{L.trades}</p>
            <p className="font-bold">{user.trades}회</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function NormalRankCard({ user, tab }: { user: RankingUser; tab: RankTab }) {
  const score = getScore(user, tab);
  return (
    <Link href={`/compete/${user.userId}`}>
      <div className="bg-[#252525] rounded-2xl p-4 border border-white/5 cursor-pointer active:bg-[#2a2a2a] transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center text-gray-400 font-bold text-sm">
              {user.rank}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-bold text-white text-sm">{user.nickname}</p>
                {user.badges.map((b, i) => (
                  <span key={i} className="text-sm">{b}</span>
                ))}
              </div>
              <p className="text-xs text-gray-400">Level {user.level} · {user.waveType}</p>
              {score > 0 && <ScoreBar score={score} />}
            </div>
          </div>
          <div className="text-right shrink-0 ml-2">
            <p className="text-base font-bold text-red-400">+{user.profitRate}%</p>
            <p className="text-xs text-gray-400">{formatNumber(user.totalAssets)}원</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function LeaderboardSection({ rankings }: LeaderboardSectionProps) {
  const [filter, setFilter] = useState(0);
  const [rankTab, setRankTab] = useState<RankTab>('weekly');

  // 탭에 따라 정렬
  const sorted = [...rankings].sort((a, b) => getScore(b, rankTab) - getScore(a, rankTab));

  return (
    <section className="mt-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          {L.title}
        </h3>
        <select
          value={filter}
          onChange={(e) => setFilter(Number(e.target.value))}
          className="bg-[#252525] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
        >
          {L.filterLabels.map((label, i) => (
            <option key={i} value={i}>{label}</option>
          ))}
        </select>
      </div>

      {/* 주간 / 누적 탭 */}
      <div className="flex gap-2 mb-3">
        {([
          { id: 'weekly' as RankTab, label: L.weeklyTab, desc: L.weeklyDesc },
          { id: 'cumulative' as RankTab, label: L.cumulativeTab, desc: L.cumulativeDesc },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setRankTab(tab.id)}
            className={cn(
              'flex-1 rounded-xl py-2 px-3 text-left transition-all border',
              rankTab === tab.id
                ? 'bg-yellow-500/15 border-yellow-500/40 text-yellow-300'
                : 'bg-[#252525] border-white/5 text-gray-400 hover:bg-[#2a2a2a]'
            )}
          >
            <p className="text-xs font-black">{tab.label}</p>
            <p className="text-[10px] text-current opacity-60 mt-0.5">{tab.desc}</p>
          </button>
        ))}
      </div>

      {/* 랭킹 기준 안내 */}
      <div className="flex items-start gap-1.5 mb-3 bg-[#1a1a1a] rounded-xl px-3 py-2 border border-white/5">
        <Info className="w-3 h-3 text-gray-500 mt-0.5 shrink-0" />
        <p className="text-[10px] text-gray-500 leading-relaxed">
          <span className="text-yellow-400/80 font-bold">{L.rankBasis}</span> ·{' '}
          도전자 점수 = 수익률(50%) + 파도정확도(25%) + 승률(15%) + 일관성(10%)
        </p>
      </div>

      {/* 랭킹 리스트 */}
      <div className="space-y-[10px]">
        {sorted.map((user, idx) =>
          idx < 3
            ? <TopThreeCard key={user.userId} user={user} idx={idx} tab={rankTab} />
            : <NormalRankCard key={user.userId} user={user} tab={rankTab} />
        )}
      </div>
    </section>
  );
}
