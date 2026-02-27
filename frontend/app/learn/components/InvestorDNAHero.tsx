'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { INVESTOR_DNA_MAP } from '@/data/legendary-scenarios';
import type { InvestorPersonality } from '@/data/legendary-scenarios';
import { ChevronDown, Waves, TrendingUp, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  userPersonality: InvestorPersonality;
  progress: { crisisGrade?: string; level?: number; waveAccuracy?: number; maxGap?: number; aiGap?: number } | null;
}

export function InvestorDNAHero({ userPersonality, progress }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const myDNA = INVESTOR_DNA_MAP[userPersonality];

  const waveAccuracy = (progress as any)?.waveAccuracy || 45;
  const maxGap = (progress as any)?.maxGap || -12.5;
  const aiGap = (progress as any)?.aiGap || -3.2;

  return (
    <section
      className={cn(
        'mt-4 rounded-2xl text-white overflow-hidden bg-gradient-to-br',
        myDNA.bgGradient
      )}
    >
      {/* 항상 보이는 컴팩트 영역 */}
      <button
        className="w-full flex items-center gap-3 p-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl shrink-0">
          <Waves className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] opacity-60 font-semibold">나의 파도 읽기 리포트</p>
          <p className="text-base font-bold">{myDNA.label} 투자자</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[10px] opacity-70">파도 정확도 <span className="font-bold opacity-100">{waveAccuracy}%</span></span>
            <span className="text-[10px] opacity-70">AI 갭 <span className={cn('font-bold opacity-100', aiGap >= 0 ? 'text-green-300' : 'text-yellow-300')}>{aiGap >= 0 ? '+' : ''}{aiGap}%p</span></span>
          </div>
        </div>
        <ChevronDown
          className={cn('w-4 h-4 opacity-60 shrink-0 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {/* 펼쳐진 상세 영역 - 파도 흐름 리포트 */}
      {open && (
        <div className="px-4 pb-4 border-t border-white/10">
          {/* 핵심 지표 3개 */}
          <div className="grid grid-cols-3 gap-2 mt-3 mb-3">
            <div className="bg-white/10 rounded-xl p-2.5 text-center">
              <Waves className="w-4 h-4 mx-auto mb-1 opacity-70" />
              <p className="text-[9px] opacity-60">파도 정확도</p>
              <p className={cn(
                'text-lg font-black',
                waveAccuracy >= 70 ? 'text-green-300' : waveAccuracy >= 50 ? 'text-yellow-300' : 'text-red-300'
              )}>{waveAccuracy}%</p>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5 text-center">
              <TrendingUp className="w-4 h-4 mx-auto mb-1 opacity-70" />
              <p className="text-[9px] opacity-60">최대 갭</p>
              <p className={cn(
                'text-lg font-black',
                maxGap >= 0 ? 'text-green-300' : 'text-red-300'
              )}>{maxGap >= 0 ? '+' : ''}{maxGap}%</p>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5 text-center">
              <Target className="w-4 h-4 mx-auto mb-1 opacity-70" />
              <p className="text-[9px] opacity-60">유사 AI 갭</p>
              <p className={cn(
                'text-lg font-black',
                aiGap >= 0 ? 'text-green-300' : 'text-yellow-300'
              )}>{aiGap >= 0 ? '+' : ''}{aiGap}%p</p>
            </div>
          </div>

          {/* 파도 읽기 코멘트 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-3">
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-yellow-300 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold mb-1">파도 흐름 코멘트</p>
                <p className="text-[11px] opacity-80 leading-relaxed">
                  {waveAccuracy >= 70 
                    ? '파도의 흐름을 잘 읽고 있습니다! 상승/하락 전환점을 정확히 포착하고 있어요.'
                    : waveAccuracy >= 50
                    ? '파도 읽기가 점점 나아지고 있어요. 전환점에서 조금 더 인내심을 가져보세요.'
                    : '파도의 흐름을 읽는 연습이 필요해요. 급등/급락에 휩쓸리지 말고 큰 흐름을 보세요.'}
                </p>
              </div>
            </div>
          </div>

          {/* 투자 성향 정보 */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {myDNA.traits.map((trait) => (
              <span key={trait} className="text-[10px] bg-white/15 rounded-full px-2.5 py-1 font-bold">
                {trait}
              </span>
            ))}
          </div>

          <button
            onClick={() => router.push('/onboarding')}
            className="w-full bg-white/10 border border-white/20 text-white hover:bg-white/20 rounded-xl py-2.5 text-sm font-bold transition-colors text-center"
          >
            🔄 투자 성향 다시 진단하기
          </button>
        </div>
      )}
    </section>
  );
}
