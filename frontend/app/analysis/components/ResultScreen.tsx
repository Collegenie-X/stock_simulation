"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AbilityScores, AssessmentMode, PersonalityScores, PersonalityType } from "../types";
import { ABILITY_META, PERSONALITY_META, LABELS } from "../config";
import PersonalityCharacter from "./PersonalityCharacter";

interface ResultScreenProps {
  personalityScores: PersonalityScores;
  abilities: AbilityScores;
  totalQuestions: number;
  mode?: AssessmentMode;
}

function getDominantTypes(scores: PersonalityScores): [PersonalityType, PersonalityType | null] {
  const sorted = (Object.keys(scores) as PersonalityType[]).sort((a, b) => scores[b] - scores[a]);
  const primary = sorted[0];
  const secondary = scores[sorted[1]] > 0 ? sorted[1] : null;
  return [primary, secondary];
}

function toInvestmentStyle(p: PersonalityType): string {
  if (p === "challenger") return "aggressive";
  if (p === "conservative") return "conservative";
  return "moderate";
}

function toWavePattern(p: PersonalityType): string {
  if (p === "challenger" || p === "emotional") return "wave3Focus";
  if (p === "analyst") return "correction";
  if (p === "systematic") return "earlyEntry";
  return "topCapture";
}

function toChallengerScore(scores: PersonalityScores): number {
  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  return Math.min(95, Math.round(30 + (scores.challenger / total) * 130));
}

function toWaveStats(p: PersonalityType) {
  const base = {
    challenger:   { wave1Capture: 78, wave3Focus: 95, wave5Exit: 72, correctionHandling: 55, avgHoldDays: 2.8, avgBuyTiming: "상승 초기", avgSellTiming: "고점 근처", bestWave: "3파", weakPoint: "조정파 대응" },
    analyst:      { wave1Capture: 85, wave3Focus: 80, wave5Exit: 88, correctionHandling: 90, avgHoldDays: 4.5, avgBuyTiming: "조정 완료 후", avgSellTiming: "목표가 도달", bestWave: "조정파", weakPoint: "5파 조기 이탈" },
    systematic:   { wave1Capture: 92, wave3Focus: 82, wave5Exit: 78, correctionHandling: 85, avgHoldDays: 5.1, avgBuyTiming: "1파 시작", avgSellTiming: "계획 목표가", bestWave: "1파", weakPoint: "변동성 대응" },
    conservative: { wave1Capture: 70, wave3Focus: 65, wave5Exit: 92, correctionHandling: 80, avgHoldDays: 6.2, avgBuyTiming: "안전 확인 후", avgSellTiming: "5파 꼭대기", bestWave: "5파 탈출", weakPoint: "초기 진입 망설임" },
    emotional:    { wave1Capture: 82, wave3Focus: 88, wave5Exit: 65, correctionHandling: 62, avgHoldDays: 3.1, avgBuyTiming: "감각적 타이밍", avgSellTiming: "고점 근처", bestWave: "3파", weakPoint: "데이터 검증 부족" },
  };
  return base[p] ?? base.challenger;
}

// ==word== 형광펜 파서
function Highlighted({ text, highlightClass }: { text: string; highlightClass: string }) {
  const parts = text.split(/(==.+?==)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("==") && p.endsWith("==") ? (
          <mark key={i} className={`${highlightClass} text-slate-900 font-black px-0.5 rounded-sm not-italic`}>
            {p.slice(2, -2)}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

// 점수 → 랭크
function toRank(score: number): { label: string; color: string } {
  if (score >= 90) return { label: "S", color: "text-yellow-300 bg-yellow-400/20 border-yellow-400/60" };
  if (score >= 70) return { label: "A", color: "text-cyan-300 bg-cyan-400/20 border-cyan-400/60" };
  if (score >= 50) return { label: "B", color: "text-green-300 bg-green-400/20 border-green-400/60" };
  return { label: "C", color: "text-white/50 bg-white/5 border-white/20" };
}

export default function ResultScreen({ personalityScores, abilities, totalQuestions, mode = "detailed" }: ResultScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const [primary, secondary] = getDominantTypes(personalityScores);
  const primaryMeta = PERSONALITY_META[primary];
  const secondaryMeta = secondary ? PERSONALITY_META[secondary] : null;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dnaResult = {
      primaryPersonality: primary,
      secondaryPersonality: secondary,
      personalityScores,
      abilities,
      investmentStyle: toInvestmentStyle(primary),
      wavePatternType: toWavePattern(primary),
      challengerScore: toChallengerScore(personalityScores),
      wavePatternStats: toWaveStats(primary),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem("compete_dna_result", JSON.stringify(dnaResult));
  }, [primary, secondary, personalityScores, abilities]);

  const maxAbility = Math.max(...Object.values(abilities), 1);
  const sortedAbilities = (Object.keys(abilities) as (keyof AbilityScores)[]).sort((a, b) => abilities[b] - abilities[a]);
  const maxPersonality = Math.max(...Object.values(personalityScores), 1);
  const personalityTypes = (Object.keys(personalityScores) as PersonalityType[]).sort((a, b) => personalityScores[b] - personalityScores[a]);
  const totalScore = Object.values(personalityScores).reduce((a, b) => a + b, 0);
  const rank = toRank(totalScore);

  const [activeBubble, setActiveBubble] = useState<string | null>(null);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showBubble = (id: string) => {
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    setActiveBubble(id);
    bubbleTimer.current = setTimeout(() => setActiveBubble(null), 1800);
  };
  useEffect(() => () => { if (bubbleTimer.current) clearTimeout(bubbleTimer.current); }, []);

  return (
    <div className="flex flex-col gap-5 px-4 pb-10 pt-2">

      {/* ── HERO CARD ── */}
      <div className={`relative rounded-3xl border-2 ${primaryMeta.border} overflow-hidden animate-bounceIn`}>
        {/* gradient bg */}
        <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60`} />
        <div className={`absolute inset-0 ${primaryMeta.bg}`} />
        {/* glow blob */}
        <div className={`absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-40 bg-gradient-to-r ${primaryMeta.accent}`} />

        <div className="relative z-10 flex flex-col items-center pt-5 pb-6 px-5">
          {/* catchphrase bubble */}
          <div className="relative mb-2 animate-float">
            <div className="px-4 py-1.5 rounded-2xl bg-white text-slate-900 text-sm font-extrabold shadow-xl">
              {primaryMeta.catchphrase}
              <span className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 bg-white rotate-45" />
            </div>
          </div>

          {/* character */}
          <PersonalityCharacter type={primary} size={170} className="animate-float" />

          {/* rank badge */}
          <div className={`absolute top-4 right-4 w-11 h-11 rounded-2xl border-2 flex items-center justify-center font-black text-2xl ${rank.color}`}>
            {rank.label}
          </div>

          {/* title */}
          <p className={`text-xs font-bold ${primaryMeta.text} mt-1 tracking-widest uppercase opacity-70`}>{LABELS.resultTitle}</p>
          <h2 className="text-4xl font-black text-white mt-0.5 mb-2 drop-shadow-lg">{primaryMeta.label}</h2>
          <p className="text-white/65 text-sm leading-relaxed text-center max-w-xs">{primaryMeta.desc}</p>

          {/* score pills */}
          <div className="mt-4 flex gap-3">
            <div className={`flex flex-col items-center px-5 py-2.5 rounded-2xl bg-black/30 border ${primaryMeta.border}`}>
              <span className="text-[10px] text-white/45 font-bold tracking-wider">SCORE</span>
              <span className="text-2xl font-black text-white leading-none mt-0.5">{totalScore}</span>
            </div>
            <div className="flex flex-col items-center px-5 py-2.5 rounded-2xl bg-black/30 border border-white/10">
              <span className="text-[10px] text-white/45 font-bold tracking-wider">문항</span>
              <span className="text-2xl font-black text-white leading-none mt-0.5">{totalQuestions}</span>
            </div>
          </div>

          {/* secondary badge */}
          {secondary && secondaryMeta && (
            <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${secondaryMeta.border} bg-black/30`}>
              <span className="text-xl">{secondaryMeta.emoji}</span>
              <span className={`text-xs font-black ${secondaryMeta.text}`}>
                {LABELS.secondaryLabel}  {secondaryMeta.label}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── 성향 분포 ── */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 animate-slideUp" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📊</span>
          <span className="text-sm font-black text-white">성향 분포</span>
        </div>
        <div className="flex flex-col gap-4">
          {personalityTypes.map((type) => {
            const m = PERSONALITY_META[type];
            const pct = Math.round((personalityScores[type] / maxPersonality) * 100);
            const isPrimary = type === primary;
            const bubbleId = `p-${type}`;
            const open = activeBubble === bubbleId;
            return (
              <button
                type="button"
                key={type}
                onClick={() => showBubble(bubbleId)}
                className="relative text-left active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-3xl ${isPrimary ? "" : "opacity-50"}`}>{m.emoji}</span>
                  <span className={`text-sm font-black ${isPrimary ? m.text : "text-white/45"}`}>{m.label}</span>
                  {isPrimary && (
                    <span className={`text-[9px] font-black ${m.text} ${m.bg} px-2 py-0.5 rounded-full border ${m.border}`}>주요</span>
                  )}
                  <span className="ml-auto flex items-center gap-2">
                    {!open && (
                      <span className={`text-base animate-pulse ${isPrimary ? m.text : "text-white/30"}`}>💬</span>
                    )}
                    <span className={`text-base font-black ${isPrimary ? "text-white" : "text-white/40"}`}>
                      {personalityScores[type]}
                    </span>
                  </span>
                </div>
                <div className={`h-3 rounded-full bg-white/5 overflow-hidden`}>
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${m.accent} ${isPrimary ? "shadow-[0_0_8px_rgba(255,255,255,0.3)]" : ""}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {open && (
                  <div className="absolute -top-3 right-1 z-10 flex items-end gap-1 animate-bounceIn pointer-events-none">
                    <span className="text-xs font-extrabold text-slate-900 bg-white px-3 py-1.5 rounded-xl rounded-br-sm shadow-lg whitespace-nowrap">
                      {m.judge}
                    </span>
                    <PersonalityCharacter type={type} size={40} className="-mb-1" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 능력치 ── */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 animate-slideUp" style={{ animationDelay: "400ms" }}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">⚔️</span>
          <span className="text-sm font-black text-white">능력치</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {sortedAbilities.map((key, idx) => {
            const meta = ABILITY_META[key];
            const pct = Math.round((abilities[key] / maxAbility) * 100);
            const bubbleId = `a-${key}`;
            const open = activeBubble === bubbleId;
            const isTop = idx === 0;
            return (
              <button
                type="button"
                key={key}
                onClick={() => showBubble(bubbleId)}
                className={`relative flex flex-col items-center p-3 rounded-2xl border transition-transform active:scale-[0.97] ${isTop ? "border-yellow-400/50 bg-yellow-400/8" : "border-white/8 bg-white/[0.02]"}`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  {!open && (
                    <span className={`text-xs animate-pulse ${isTop ? "text-yellow-400/70" : "text-white/25"}`}>💬</span>
                  )}
                  {isTop && (
                    <span className="ml-auto text-[9px] font-black text-yellow-400 bg-yellow-400/15 px-1.5 py-0.5 rounded-full">MAX</span>
                  )}
                </div>
                <span className="text-4xl mb-1">{meta.emoji}</span>
                <span className={`text-3xl font-black ${isTop ? "text-yellow-300" : "text-white/80"}`}>{abilities[key]}</span>
                <span className={`text-[10px] font-bold mt-0.5 ${isTop ? "text-yellow-400/80" : "text-white/40"}`}>{meta.label}</span>
                <div className="w-full h-1.5 rounded-full bg-white/5 mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${meta.bar} transition-all duration-1000 ease-out`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {open && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 flex items-end gap-1 animate-bounceIn pointer-events-none">
                    <span className="text-xs font-extrabold text-slate-900 bg-white px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap">
                      {meta.oneLiner}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 분석 리포트 ── */}
      {(() => {
        const hlMap: Record<PersonalityType, string> = {
          analyst: "bg-cyan-300",
          challenger: "bg-orange-400",
          conservative: "bg-green-300",
          emotional: "bg-purple-300",
          systematic: "bg-teal-300",
        };
        const hl = hlMap[primary];
        const now = new Date();
        const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
        const reportId = `INV-${String(totalScore).padStart(4, "0")}-${primary.slice(0, 3).toUpperCase()}`;
        return (
          <div className="animate-slideUp" style={{ animationDelay: "550ms" }}>
            {/* report shell */}
            <div className={`rounded-t-2xl border-x border-t ${primaryMeta.border} bg-gradient-to-b from-white/[0.06] to-white/[0.02] px-5 pt-4 pb-3`}>
              {/* report header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[9px] tracking-[0.25em] font-black text-white/35 uppercase">Investment Profile Report</p>
                  <p className={`text-base font-black mt-0.5 ${primaryMeta.text}`}>{primaryMeta.label} 투자자 분석</p>
                </div>
                <div className={`flex flex-col items-end gap-0.5`}>
                  <span className={`text-[9px] font-black tracking-widest px-2 py-0.5 rounded border ${primaryMeta.border} ${primaryMeta.text} ${primaryMeta.bg}`}>
                    {reportId}
                  </span>
                  <span className="text-[9px] text-white/30 font-mono">{dateStr}</span>
                </div>
              </div>
              <div className={`h-px w-full bg-gradient-to-r ${primaryMeta.accent} opacity-40`} />
            </div>

            {/* report body */}
            <div className={`border-x ${primaryMeta.border} bg-white/[0.015] px-5 py-4`}>
              <ol className="flex flex-col gap-4">
                {primaryMeta.analysis.map((item, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className={`flex-shrink-0 font-mono text-[10px] font-black ${primaryMeta.text} opacity-60 mt-0.5 w-5 text-right`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className={`w-px self-stretch ${primaryMeta.bg} border-l ${primaryMeta.border} opacity-50`} />
                    <p className="text-sm text-white/70 leading-relaxed tracking-tight">
                      <Highlighted text={item} highlightClass={hl} />
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            {/* report footer */}
            <div className={`rounded-b-2xl border-x border-b ${primaryMeta.border} bg-white/[0.02] px-5 py-3 flex items-center justify-between`}>
              <span className="text-[9px] text-white/25 font-mono tracking-wider">CONFIDENTIAL · FOR INTERNAL USE ONLY</span>
              <span className={`text-[9px] font-black ${primaryMeta.text} opacity-50`}>✦ {primaryMeta.label}</span>
            </div>
          </div>
        );
      })()}

      {/* ── 다음 미션 ── */}
      <div className={`rounded-2xl border-2 ${primaryMeta.border} ${primaryMeta.bg} p-4 animate-slideUp`} style={{ animationDelay: "600ms" }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🎯</span>
          <span className="text-sm font-black text-white">{LABELS.tipsTitle}</span>
        </div>
        <div className="flex flex-col gap-2">
          {primaryMeta.tips.map((tip, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-black/20 border ${primaryMeta.border}`}>
              <span className={`text-lg font-black ${primaryMeta.text}`}>{i + 1}</span>
              <span className="text-sm font-bold text-white/90">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* quick mode → upgrade */}
      {mode === "quick" && (
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 animate-slideUp" style={{ animationDelay: "800ms" }}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🔬</span>
            <p className="text-sm font-black text-white">정밀 측정 GO</p>
          </div>
          <button
            onClick={() => router.push("/analysis?mode=detailed")}
            className="w-full py-3 rounded-xl bg-white/10 border border-white/15 text-white/80 text-sm font-black hover:bg-white/15 active:scale-[0.98] transition-all"
          >
            시뮬레이션 시작하기 →
          </button>
        </div>
      )}

      {/* compete 반환 버튼 */}
      {returnTo === "compete" && (
        <div
          className="rounded-2xl bg-gradient-to-r from-yellow-500/15 to-orange-500/15 border-2 border-yellow-500/40 p-4 animate-slideUp"
          style={{ animationDelay: mode === "quick" ? "900ms" : "700ms" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🏆</span>
            <div>
              <p className="text-sm font-black text-yellow-300">경쟁 페이지에 반영 완료!</p>
              <p className="text-xs text-white/50">투자 DNA 업데이트됨</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/compete")}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-black hover:scale-[1.01] active:scale-[0.98] transition-all shadow-lg shadow-yellow-500/25"
          >
            경쟁 페이지로 돌아가기 →
          </button>
        </div>
      )}

      {/* action buttons */}
      <div className="flex flex-col gap-2 mt-1 animate-slideUp" style={{ animationDelay: mode === "quick" ? "1000ms" : "800ms" }}>
        {returnTo !== "compete" && (
          <button
            onClick={() => router.push("/home")}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 border border-blue-500/30 text-white font-black text-base hover:scale-[1.01] active:scale-[0.98] transition-all shadow-lg shadow-blue-500/30"
          >
            {LABELS.startGameBtn}
          </button>
        )}
        <button
          onClick={() => { window.location.href = `/analysis?mode=${mode}`; }}
          className="w-full py-3 rounded-2xl border border-white/8 text-white/40 text-sm font-semibold hover:text-white/60 active:scale-[0.98] transition-all"
        >
          {LABELS.retryBtn}
        </button>
      </div>
    </div>
  );
}
