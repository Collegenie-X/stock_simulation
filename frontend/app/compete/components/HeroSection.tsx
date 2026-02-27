'use client';

import { useState } from 'react';
import { Share2, Copy, Check, Zap, Info } from 'lucide-react';
import { COMPETE_LABELS, INVESTMENT_STYLES, WAVE_PATTERN_TYPES, RANKING_RULES } from '../config';
import { formatNumber } from '@/lib/format';

interface MyProfile {
  nickname: string;
  rank: number;
  totalRankUsers: number;
  level: number;
  levelName: string;
  totalAssets: number;
  profitRate: number;
  winRate: number;
  totalTrades: number;
  investmentStyle: string;
  wavePatternType: string;
  challengerScore: number;
  badges: string[];
  shareCode: string;
  aiMentors: {
    conservative: { name: string; emoji: string; label: string; profitRate: number };
    aggressive: { name: string; emoji: string; label: string; profitRate: number };
  };
}

interface HeroSectionProps {
  profile: MyProfile;
}

const L = COMPETE_LABELS.hero;

export function HeroSection({ profile }: HeroSectionProps) {
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

  const styleInfo = INVESTMENT_STYLES[profile.investmentStyle] ?? INVESTMENT_STYLES.aggressive;
  const waveInfo = WAVE_PATTERN_TYPES[profile.wavePatternType] ?? WAVE_PATTERN_TYPES.wave3Focus;
  const percentile = (((profile.totalRankUsers - profile.rank) / profile.totalRankUsers) * 100).toFixed(1);
  const bestHistoryRank = 15;

  const isBeatConservative = profile.profitRate > profile.aiMentors.conservative.profitRate;
  const isBeatAggressive = profile.profitRate > profile.aiMentors.aggressive.profitRate;

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* 도전자 카드 */}
      <section className="mt-4 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-3xl p-6 relative overflow-hidden border border-white/10 shadow-2xl">
        {/* 배경 장식 */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -ml-12 -mb-12" />
        <div className="absolute top-1/2 right-8 text-7xl opacity-5 select-none">⚡</div>

        <div className="relative z-10">
          {/* 상단: 닉네임 + 배지 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${styleInfo.bgClass} flex items-center justify-center text-2xl shadow-lg`}>
                {styleInfo.emoji}
              </div>
              <div>
                <p className="font-bold text-white text-lg">{profile.nickname}</p>
                <p className="text-xs text-gray-400">Level {profile.level} · {profile.levelName}</p>
              </div>
            </div>
            <div className="flex gap-1">
              {profile.badges.map((badge, i) => (
                <span key={i} className="text-xl">{badge}</span>
              ))}
            </div>
          </div>

          {/* 순위 하이라이트 */}
          <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/10">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">{L.myRank}</p>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-black text-white">{profile.rank}</span>
                  <span className="text-lg text-gray-400 mb-1">{L.rankUnit}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {profile.totalRankUsers.toLocaleString()}{L.totalUsers} ·{' '}
                  <span className="text-yellow-400 font-bold">{L.topPercent} {percentile}%</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-red-400">+{profile.profitRate}%</p>
                <p className="text-xs text-gray-400 mt-1">{formatNumber(profile.totalAssets)}원</p>
              </div>
            </div>
          </div>

          {/* 도전자 스코어 + 스탯 */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="bg-white/5 rounded-xl p-2.5 text-center border border-white/5">
              <p className="text-xs text-gray-400 mb-1">{L.winRate}</p>
              <p className="text-sm font-bold text-green-400">{profile.winRate}%</p>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 text-center border border-white/5">
              <p className="text-xs text-gray-400 mb-1">{L.totalTrades}</p>
              <p className="text-sm font-bold text-white">{profile.totalTrades}회</p>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 text-center border border-white/5">
              <p className="text-xs text-gray-400 mb-1">{L.bestRank}</p>
              <p className="text-sm font-bold text-yellow-400">{bestHistoryRank}위</p>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 text-center border border-white/5">
              <p className="text-xs text-gray-400 mb-1">스타일</p>
              <p className="text-sm font-bold" style={{ color: styleInfo.gradientFrom }}>{waveInfo.emoji}</p>
            </div>
          </div>

          {/* 도전자 점수 바 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-bold text-white">{L.challengerSpirit}</span>
              </div>
              <span className="text-sm font-black text-yellow-400">{profile.challengerScore} / 100</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000"
                style={{ width: `${profile.challengerScore}%` }}
              />
            </div>

            {/* 점수 구성 분해 */}
            <div className="grid grid-cols-4 gap-1 mt-2">
              {[
                { label: '수익률', pct: '50%', color: 'text-red-400' },
                { label: '파도정확도', pct: '25%', color: 'text-cyan-400' },
                { label: '승률', pct: '15%', color: 'text-green-400' },
                { label: '일관성', pct: '10%', color: 'text-yellow-400' },
              ].map((item) => (
                <div key={item.label} className="bg-white/5 rounded-lg px-1.5 py-1 text-center">
                  <p className={`text-[10px] font-black ${item.color}`}>{item.pct}</p>
                  <p className="text-[9px] text-gray-500 leading-tight">{item.label}</p>
                </div>
              ))}
            </div>

            {/* 랭킹 기준 안내 */}
            <div className="flex items-start gap-1.5 mt-2">
              <Info className="w-3 h-3 text-gray-500 mt-0.5 shrink-0" />
              <p className="text-[10px] text-gray-500 leading-relaxed">
                <span className="text-yellow-400/80 font-bold">실전 시뮬레이션</span>만 글로벌 랭킹에 반영 · 매주 동일 시나리오 공정 비교
              </p>
            </div>
          </div>

          {/* AI 멘토 비교 */}
          <div className="bg-[#0d0d1a] rounded-xl p-3 mb-4 border border-white/5">
            <p className="text-xs text-gray-400 mb-2 font-semibold">{L.vsAI}</p>
            <div className="grid grid-cols-2 gap-2">
              <div className={`rounded-lg p-2.5 ${isBeatConservative ? 'bg-green-500/20 border border-green-500/30' : 'bg-white/5 border border-white/5'}`}>
                <div className="flex items-center gap-1 mb-1">
                  <span>{profile.aiMentors.conservative.emoji}</span>
                  <span className="text-xs text-gray-300">{profile.aiMentors.conservative.name}</span>
                </div>
                <p className="text-sm font-bold text-white">+{profile.aiMentors.conservative.profitRate}%</p>
                {isBeatConservative && (
                  <p className="text-xs text-green-400 font-bold mt-0.5">{L.aiBeaten} ✓</p>
                )}
              </div>
              <div className={`rounded-lg p-2.5 ${isBeatAggressive ? 'bg-green-500/20 border border-green-500/30' : 'bg-white/5 border border-white/5'}`}>
                <div className="flex items-center gap-1 mb-1">
                  <span>{profile.aiMentors.aggressive.emoji}</span>
                  <span className="text-xs text-gray-300">{profile.aiMentors.aggressive.name}</span>
                </div>
                <p className="text-sm font-bold text-white">+{profile.aiMentors.aggressive.profitRate}%</p>
                {isBeatAggressive ? (
                  <p className="text-xs text-green-400 font-bold mt-0.5">{L.aiBeaten} ✓</p>
                ) : (
                  <p className="text-xs text-orange-400 mt-0.5">
                    {(profile.aiMentors.aggressive.profitRate - profile.profitRate).toFixed(1)}% {L.aiBehind}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 공유 버튼 */}
          <button
            onClick={() => setShowShare(true)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl py-3 font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
          >
            <Share2 className="w-4 h-4" />
            {L.shareBtn}
          </button>
        </div>
      </section>

      {/* 공유 모달 */}
      {showShare && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end"
          onClick={() => setShowShare(false)}
        >
          <div
            className="w-full max-w-md mx-auto bg-[#1e1e1e] rounded-t-3xl p-6 pb-10 border-t border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-5" />
            <h3 className="text-lg font-bold text-white mb-1">{L.shareTitle}</h3>
            <p className="text-sm text-gray-400 mb-5">{L.shareDesc}</p>

            {/* 공유 카드 미리보기 */}
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f3460] rounded-2xl p-5 mb-5 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400">나의 투자 순위</p>
                  <p className="text-3xl font-black text-white">{profile.rank}<span className="text-lg text-gray-400">위</span></p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-red-400">+{profile.profitRate}%</p>
                  <p className="text-xs text-gray-400">{profile.totalRankUsers.toLocaleString()}명 중 상위 {percentile}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${styleInfo.bgClass} text-white font-bold`}>
                  {styleInfo.emoji} {styleInfo.label}
                </span>
                <span className="text-xs text-gray-400">{waveInfo.emoji} {waveInfo.label}</span>
              </div>
            </div>

            {/* 공유 코드 */}
            <div className="bg-[#252525] rounded-xl p-3 mb-4 flex items-center justify-between border border-white/5">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">{L.shareCode}</p>
                <p className="font-mono font-bold text-white text-lg">{profile.shareCode}</p>
              </div>
              <button
                onClick={() => handleCopy(profile.shareCode)}
                className="flex items-center gap-1 bg-blue-500/20 text-blue-400 px-3 py-2 rounded-lg text-sm font-semibold border border-blue-500/30"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? '복사됨' : L.copyCode}
              </button>
            </div>

            <button
              onClick={() => handleCopy(`https://stocksim.app/compete/me?code=${profile.shareCode}`)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl py-3 font-bold"
            >
              🔗 {L.copyLink}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
