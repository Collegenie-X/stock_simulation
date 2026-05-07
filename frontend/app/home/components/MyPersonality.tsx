"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PERSONALITY_META } from "@/app/analysis/config";
import type { PersonalityType } from "@/app/analysis/types";
import PersonalityCharacter from "@/app/analysis/components/PersonalityCharacter";

interface DnaResult {
  primaryPersonality: PersonalityType;
  secondaryPersonality: PersonalityType | null;
  challengerScore: number;
}

export default function MyPersonality() {
  const router = useRouter();
  const [dna, setDna] = useState<DnaResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("compete_dna_result");
      if (raw) setDna(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  // 측정 안 했을 때 — 측정 유도 카드
  if (!dna) {
    return (
      <div className="px-5">
        <button
          onClick={() => router.push("/analysis")}
          className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/10 active:scale-[0.99] transition-transform"
        >
          <span className="text-3xl">🧬</span>
          <div className="flex-1 text-left">
            <p className="text-sm font-black text-white">투자 성향 측정하기</p>
            <p className="text-[11px] text-white/45 font-semibold">2분 만에 내 스타일 찾기</p>
          </div>
          <span className="text-white/40 text-lg">→</span>
        </button>
      </div>
    );
  }

  const m = PERSONALITY_META[dna.primaryPersonality];
  const sec = dna.secondaryPersonality ? PERSONALITY_META[dna.secondaryPersonality] : null;

  return (
    <div className="px-5">
      <button
        onClick={() => router.push("/analysis?view=report")}
        className={`relative w-full flex items-center gap-3 p-3 pr-4 rounded-2xl border ${m.border} ${m.bg} overflow-hidden active:scale-[0.99] transition-transform`}
      >
        {/* glow */}
        <div className={`absolute -left-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-r ${m.accent} opacity-25 blur-2xl pointer-events-none`} />

        {/* character */}
        <div className="relative flex-shrink-0">
          <PersonalityCharacter type={dna.primaryPersonality} size={56} />
        </div>

        {/* info */}
        <div className="relative flex-1 text-left min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`text-[9px] font-black tracking-widest ${m.text} opacity-70`}>MY DNA</span>
            <span className="text-[9px] font-black text-white/30">·</span>
            <span className="text-[9px] font-mono text-white/35">{dna.challengerScore}</span>
          </div>
          <p className={`text-base font-black ${m.text} leading-tight truncate`}>{m.label}</p>
          <p className="text-[11px] text-white/55 font-semibold truncate">
            {m.catchphrase}
            {sec && <span className="text-white/30"> · 보조 {sec.label}</span>}
          </p>
        </div>

        <span className="relative text-white/40 text-lg flex-shrink-0">→</span>
      </button>
    </div>
  );
}
