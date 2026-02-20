'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { INVESTOR_DNA_MAP } from '@/data/legendary-scenarios';
import type { InvestorPersonality } from '@/data/legendary-scenarios';
import { cn } from '@/lib/utils';

interface Props {
  userPersonality: InvestorPersonality;
  progress: { crisisGrade?: string; level?: number } | null;
}

export function InvestorDNAHero({ userPersonality, progress }: Props) {
  const router = useRouter();
  const myDNA = INVESTOR_DNA_MAP[userPersonality];

  return (
    <section
      className={cn(
        'mt-4 rounded-3xl p-6 text-white relative overflow-hidden bg-gradient-to-br',
        myDNA.bgGradient
      )}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-8 -mb-8" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold opacity-70 mb-1">나의 투자 DNA</p>
            <h2 className="text-2xl font-bold">
              {myDNA.emoji} {myDNA.label} 투자자
            </h2>
            <p className="text-sm opacity-80 mt-1">{myDNA.description}</p>
          </div>
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl shrink-0 ml-3">
            🧬
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {myDNA.traits.map((trait) => (
            <span
              key={trait}
              className="text-[10px] bg-white/15 rounded-full px-2.5 py-1 font-bold"
            >
              {trait}
            </span>
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-70">매칭 캐릭터</p>
              <p className="text-sm font-bold">{myDNA.matchedCharacter}</p>
            </div>
            <div>
              <p className="text-xs opacity-70">사고 대처 등급</p>
              <p className="text-sm font-bold">
                {(progress as any)?.crisisGrade || 'D'} 등급
              </p>
            </div>
            <div>
              <p className="text-xs opacity-70">레벨</p>
              <p className="text-sm font-bold">{progress?.level || 1}단계</p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => router.push('/onboarding')}
          variant="outline"
          className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl h-10 text-sm font-bold"
        >
          🔄 투자 성향 다시 진단하기
        </Button>
      </div>
    </section>
  );
}
