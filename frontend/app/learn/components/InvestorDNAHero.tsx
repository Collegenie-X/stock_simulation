'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { INVESTOR_DNA_MAP } from '@/data/legendary-scenarios';
import type { InvestorPersonality } from '@/data/legendary-scenarios';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  userPersonality: InvestorPersonality;
  progress: { crisisGrade?: string; level?: number } | null;
}

export function InvestorDNAHero({ userPersonality, progress }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const myDNA = INVESTOR_DNA_MAP[userPersonality];

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
          {myDNA.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] opacity-60 font-semibold">나의 투자 DNA</p>
          <p className="text-base font-bold">{myDNA.label} 투자자</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[10px] opacity-70">사고등급 <span className="font-bold opacity-100">{(progress as any)?.crisisGrade || 'D'}</span></span>
            <span className="text-[10px] opacity-70">레벨 <span className="font-bold opacity-100">{progress?.level || 1}</span></span>
          </div>
        </div>
        <ChevronDown
          className={cn('w-4 h-4 opacity-60 shrink-0 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {/* 펼쳐진 상세 영역 */}
      {open && (
        <div className="px-4 pb-4 border-t border-white/10">
          <p className="text-xs opacity-75 mt-3 mb-2">{myDNA.description}</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {myDNA.traits.map((trait) => (
              <span key={trait} className="text-[10px] bg-white/15 rounded-full px-2.5 py-1 font-bold">
                {trait}
              </span>
            ))}
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] opacity-60">매칭 캐릭터</p>
                <p className="text-sm font-bold">{myDNA.matchedCharacter}</p>
              </div>
              <div>
                <p className="text-[10px] opacity-60">사고 대처 등급</p>
                <p className="text-sm font-bold">{(progress as any)?.crisisGrade || 'D'} 등급</p>
              </div>
              <div>
                <p className="text-[10px] opacity-60">레벨</p>
                <p className="text-sm font-bold">{progress?.level || 1}단계</p>
              </div>
            </div>
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
