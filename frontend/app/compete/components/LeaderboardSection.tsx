'use client';

import { useState } from 'react';
import { Trophy, Eye } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/format';
import { COMPETE_LABELS, RANK_MEDALS, RANK_GRADIENTS } from '../config';

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
}

interface LeaderboardSectionProps {
  rankings: RankingUser[];
}

const L = COMPETE_LABELS.leaderboard;

function TopThreeCard({ user, idx }: { user: RankingUser; idx: number }) {
  const gradient = RANK_GRADIENTS[idx] ?? 'from-gray-500 to-gray-600';

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

function NormalRankCard({ user }: { user: RankingUser }) {
  return (
    <Link href={`/compete/${user.userId}`}>
      <div className="bg-[#252525] rounded-2xl p-4 border border-white/5 cursor-pointer active:bg-[#2a2a2a] transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center text-gray-400 font-bold text-sm">
              {user.rank}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-white text-sm">{user.nickname}</p>
                {user.badges.map((b, i) => (
                  <span key={i} className="text-sm">{b}</span>
                ))}
              </div>
              <p className="text-xs text-gray-400">Level {user.level} · {user.waveType}</p>
            </div>
          </div>
          <div className="text-right">
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

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-4">
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

      <div className="space-y-3">
        {rankings.map((user, idx) =>
          idx < 3
            ? <TopThreeCard key={user.userId} user={user} idx={idx} />
            : <NormalRankCard key={user.userId} user={user} />
        )}
      </div>
    </section>
  );
}
