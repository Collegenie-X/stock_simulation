'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { COMPETE_LABELS, INVESTMENT_STYLES, WAVE_PATTERN_TYPES } from '../config';
import { formatNumber } from '@/lib/format';

interface StockPreference {
  ticker: string;
  name: string;
  tradeCount: number;
  avgReturn: number;
  favoriteReason: string;
  category: string;
  emoji: string;
  totalProfit: number;
}

interface WavePatternStats {
  wave1Capture: number;
  wave3Focus: number;
  wave5Exit: number;
  correctionHandling: number;
  avgHoldDays: number;
  avgBuyTiming: string;
  avgSellTiming: string;
  bestWave: string;
  weakPoint: string;
}

interface DnaResult {
  investmentStyle: string;
  wavePatternType: string;
  wavePatternStats: WavePatternStats;
  challengerScore: number;
  primaryPersonality: string;
  updatedAt: string;
}

interface MyPatternSectionProps {
  investmentStyle: string;
  wavePatternType: string;
  wavePatternStats: WavePatternStats;
  stockPreferences: StockPreference[];
}

const L = COMPETE_LABELS.pattern;

const PERSONALITY_LABEL: Record<string, string> = {
  challenger: '도전가형 ⚡',
  analyst: '분석가형 📊',
  conservative: '안정추구형 🛡️',
  emotional: '감성투자형 🎭',
  systematic: '침착형 🧘',
};

function WaveStatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-gray-400">{label}</span>
        <span className={`text-xs font-bold ${color}`}>{value}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: color.includes('cyan') ? '#06b6d4' : color.includes('blue') ? '#3b82f6' : color.includes('purple') ? '#8b5cf6' : '#f59e0b' }}
        />
      </div>
    </div>
  );
}

export function MyPatternSection({ investmentStyle, wavePatternType, wavePatternStats, stockPreferences }: MyPatternSectionProps) {
  const router = useRouter();
  const [dnaResult, setDnaResult] = useState<DnaResult | null>(null);

  // localStorage에서 최신 분석 결과 읽기
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('compete_dna_result');
      if (raw) setDnaResult(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  // 최신 분석 결과가 있으면 우선 적용
  const activeStyle = dnaResult?.investmentStyle ?? investmentStyle;
  const activeWaveType = dnaResult?.wavePatternType ?? wavePatternType;
  const activeWaveStats = dnaResult?.wavePatternStats ?? wavePatternStats;

  const styleInfo = INVESTMENT_STYLES[activeStyle] ?? INVESTMENT_STYLES.aggressive;
  const waveInfo = WAVE_PATTERN_TYPES[activeWaveType] ?? WAVE_PATTERN_TYPES.wave3Focus;

  const isUpdated = !!dnaResult;
  const updatedDate = dnaResult?.updatedAt
    ? new Date(dnaResult.updatedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
    : null;

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white">{L.title}</h3>
            {isUpdated && (
              <span className="flex items-center gap-1 bg-green-500/20 text-green-300 text-[10px] px-2 py-0.5 rounded-full border border-green-500/30 font-bold">
                <Sparkles className="w-2.5 h-2.5" />
                최신 반영
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400">
            {isUpdated
              ? <span className="text-green-400/80">{PERSONALITY_LABEL[dnaResult!.primaryPersonality] ?? ''} · {updatedDate} 업데이트</span>
              : L.subtitle
            }
          </p>
        </div>
        <button
          onClick={() => router.push('/analysis?mode=detailed&returnTo=compete')}
          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-gray-300 text-xs font-bold px-3 py-2 rounded-xl transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          다시 테스트
        </button>
      </div>

      {/* 스타일 카드 */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* 투자 성향 */}
        <div className={`bg-gradient-to-br ${styleInfo.bgClass} rounded-2xl p-4 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 text-6xl opacity-10 -mr-2 -mt-2 select-none">{styleInfo.emoji}</div>
          <p className="text-xs text-white/70 mb-1">{L.investmentStyle}</p>
          <p className="text-xl font-black text-white">{styleInfo.label}</p>
          <p className="text-xs text-white/70 mt-1">{styleInfo.desc}</p>
          <span className="text-3xl mt-2 block">{styleInfo.emoji}</span>
        </div>

        {/* 파도 패턴 */}
        <div className="bg-[#252525] rounded-2xl p-4 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 text-5xl opacity-10 -mr-1 -mt-1 select-none">{waveInfo.emoji}</div>
          <p className="text-xs text-gray-400 mb-1">{L.wavePattern}</p>
          <p className="text-xl font-black text-white">{waveInfo.label}</p>
          <p className="text-xs text-gray-400 mt-1">{waveInfo.desc}</p>
          <span className="text-3xl mt-2 block">{waveInfo.emoji}</span>
        </div>
      </div>

      {/* 파도 패턴 분석 */}
      <div className="bg-[#252525] rounded-2xl p-4 mb-3 border border-white/5">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">{L.waveStats.wave1}</p>
            <WaveStatBar label="" value={activeWaveStats.wave1Capture} color="text-cyan-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">{L.waveStats.wave3}</p>
            <WaveStatBar label="" value={activeWaveStats.wave3Focus} color="text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">{L.waveStats.wave5}</p>
            <WaveStatBar label="" value={activeWaveStats.wave5Exit} color="text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">{L.waveStats.correction}</p>
            <WaveStatBar label="" value={activeWaveStats.correctionHandling} color="text-yellow-400" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
          <div className="text-center">
            <p className="text-xs text-gray-400">{L.avgHoldDays}</p>
            <p className="text-sm font-bold text-white">{activeWaveStats.avgHoldDays}{L.days}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">{L.bestWave}</p>
            <p className="text-sm font-bold text-cyan-400">{activeWaveStats.bestWave}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">{L.weakPoint}</p>
            <p className="text-sm font-bold text-orange-400 leading-tight">{activeWaveStats.weakPoint}</p>
          </div>
        </div>
      </div>

      {/* 관심 종목 TOP 5 */}
      <div className="bg-[#252525] rounded-2xl p-4 border border-white/5">
        <h4 className="text-sm font-bold text-white mb-3">{L.favoriteStocks}</h4>
        <div className="space-y-2.5">
          {stockPreferences.map((stock, idx) => (
            <div key={stock.ticker} className="flex items-center gap-3 py-[5px]">
              <span className="text-xs text-gray-500 w-4">{idx + 1}</span>
              <span className="text-xl w-6">{stock.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white truncate">{stock.name}</p>
                  <span className="text-xs text-gray-500 shrink-0">{stock.tradeCount}{L.tradeCount}</span>
                </div>
                <p className="text-xs text-gray-400 truncate">{stock.favoriteReason}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-bold ${stock.avgReturn >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
                  {stock.avgReturn >= 0 ? '+' : ''}{stock.avgReturn}%
                </p>
                <p className={`text-xs ${stock.totalProfit >= 0 ? 'text-gray-400' : 'text-gray-500'}`}>
                  {stock.totalProfit >= 0 ? '+' : ''}{formatNumber(stock.totalProfit)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
