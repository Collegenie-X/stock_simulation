"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AbilityScores, AssessmentMode, PersonalityScores, PersonalityType } from "../types";
import { ABILITY_META, PERSONALITY_META, LABELS } from "../config";

interface ResultScreenProps {
  personalityScores: PersonalityScores;
  abilities: AbilityScores;
  totalQuestions: number;
  mode?: AssessmentMode;
}

function getDominantTypes(scores: PersonalityScores): [PersonalityType, PersonalityType | null] {
  const sorted = (Object.keys(scores) as PersonalityType[]).sort(
    (a, b) => scores[b] - scores[a]
  );
  const primary = sorted[0];
  const secondary = scores[sorted[1]] > 0 ? sorted[1] : null;
  return [primary, secondary];
}

// 성향 → 투자 스타일 변환
function toInvestmentStyle(p: PersonalityType): string {
  if (p === "challenger") return "aggressive";
  if (p === "conservative") return "conservative";
  return "moderate";
}

// 성향 → 파동 패턴 변환
function toWavePattern(p: PersonalityType): string {
  if (p === "challenger" || p === "emotional") return "wave3Focus";
  if (p === "analyst") return "correction";
  if (p === "systematic") return "earlyEntry";
  return "topCapture";
}

// 성향 점수 → 도전자 점수 (0~100)
function toChallengerScore(scores: PersonalityScores): number {
  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  return Math.min(95, Math.round(30 + (scores.challenger / total) * 130));
}

// 성향 → 파동 스탯 기본값
function toWaveStats(p: PersonalityType) {
  const base = {
    challenger:  { wave1Capture: 78, wave3Focus: 95, wave5Exit: 72, correctionHandling: 55, avgHoldDays: 2.8, avgBuyTiming: "상승 초기", avgSellTiming: "고점 근처", bestWave: "3파", weakPoint: "조정파 대응" },
    analyst:     { wave1Capture: 85, wave3Focus: 80, wave5Exit: 88, correctionHandling: 90, avgHoldDays: 4.5, avgBuyTiming: "조정 완료 후", avgSellTiming: "목표가 도달", bestWave: "조정파", weakPoint: "5파 조기 이탈" },
    systematic:  { wave1Capture: 92, wave3Focus: 82, wave5Exit: 78, correctionHandling: 85, avgHoldDays: 5.1, avgBuyTiming: "1파 시작", avgSellTiming: "계획 목표가", bestWave: "1파", weakPoint: "변동성 대응" },
    conservative:{ wave1Capture: 70, wave3Focus: 65, wave5Exit: 92, correctionHandling: 80, avgHoldDays: 6.2, avgBuyTiming: "안전 확인 후", avgSellTiming: "5파 꼭대기", bestWave: "5파 탈출", weakPoint: "초기 진입 망설임" },
    emotional:   { wave1Capture: 82, wave3Focus: 88, wave5Exit: 65, correctionHandling: 62, avgHoldDays: 3.1, avgBuyTiming: "감각적 타이밍", avgSellTiming: "고점 근처", bestWave: "3파", weakPoint: "데이터 검증 부족" },
  };
  return base[p] ?? base.challenger;
}

export default function ResultScreen({ personalityScores, abilities, totalQuestions, mode = "detailed" }: ResultScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const [primary, secondary] = getDominantTypes(personalityScores);
  const primaryMeta = PERSONALITY_META[primary];
  const secondaryMeta = secondary ? PERSONALITY_META[secondary] : null;

  // 결과를 localStorage에 저장 (compete DNA 업데이트용)
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
  const sortedAbilities = (Object.keys(abilities) as (keyof AbilityScores)[]).sort(
    (a, b) => abilities[b] - abilities[a]
  );

  const maxPersonality = Math.max(...Object.values(personalityScores), 1);
  const personalityTypes = (Object.keys(personalityScores) as PersonalityType[]).sort(
    (a, b) => personalityScores[b] - personalityScores[a]
  );

  const totalScore = Object.values(personalityScores).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-4 px-4 pb-10 pt-2">
      {/* main profile card */}
      <div
        className={`rounded-3xl border ${primaryMeta.border} ${primaryMeta.bg} ${primaryMeta.glow} p-6 text-center animate-bounceIn`}
      >
        <div className="text-7xl mb-3 animate-float">{primaryMeta.emoji}</div>
        <p className="text-white/35 text-xs mb-1">{LABELS.resultTitle}</p>
        <h2 className="text-3xl font-black text-white mb-2">{primaryMeta.label}</h2>
        <p className="text-white/70 text-sm leading-relaxed">{primaryMeta.desc}</p>

        <div className="mt-4 flex justify-center gap-3">
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center">
            <p className="text-white/40 text-[10px]">총 점수</p>
            <p className="text-white font-black text-lg">{totalScore}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center">
            <p className="text-white/40 text-[10px]">문항 수</p>
            <p className="text-white font-black text-lg">{totalQuestions}</p>
          </div>
        </div>

        {secondary && secondaryMeta && (
          <div className={`mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border ${secondaryMeta.border} ${secondaryMeta.bg}`}>
            <span className="text-base">{secondaryMeta.emoji}</span>
            <span className={`text-xs font-bold ${secondaryMeta.text}`}>
              {LABELS.secondaryLabel}: {secondaryMeta.label}
            </span>
          </div>
        )}
      </div>

      {/* personality distribution */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/8 p-4 animate-slideUp" style={{ animationDelay: "200ms" }}>
        <p className="text-white/45 text-xs mb-3 font-bold">📊 성향 분포</p>
        <div className="flex flex-col gap-3">
          {personalityTypes.map((type) => {
            const m = PERSONALITY_META[type];
            const pct = Math.round((personalityScores[type] / maxPersonality) * 100);
            const isPrimary = type === primary;
            return (
              <div key={type}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs flex items-center gap-1.5 ${isPrimary ? m.text : "text-white/50"}`}>
                    <span className="text-base">{m.emoji}</span>
                    <span className="font-semibold">{m.label}</span>
                    {isPrimary && (
                      <span className={`text-[9px] font-black ${m.text} ${m.bg} px-1.5 py-0.5 rounded-full border ${m.border}`}>
                        주요
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-white/45 font-bold">{personalityScores[type]}점</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${m.accent}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ability */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/8 p-4 animate-slideUp" style={{ animationDelay: "400ms" }}>
        <p className="text-white/45 text-xs mb-3 font-bold">{LABELS.abilityTitle}</p>
        <div className="flex flex-col gap-3">
          {sortedAbilities.map((key, idx) => {
            const meta = ABILITY_META[key];
            const pct = Math.round((abilities[key] / maxAbility) * 100);
            return (
              <div key={key}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-white/65 flex items-center gap-1.5">
                    <span className="text-base">{meta.emoji}</span>
                    <span className="font-semibold">{meta.label}</span>
                    {idx === 0 && (
                      <span className="text-[9px] text-yellow-400 bg-yellow-500/15 px-1.5 py-0.5 rounded-full font-black">
                        최고
                      </span>
                    )}
                  </span>
                  <span className="text-xs font-bold text-white/55">{abilities[key]}</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${meta.bar}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* tips */}
      <div
        className={`rounded-2xl border ${primaryMeta.border} ${primaryMeta.bg} p-4 animate-slideUp`}
        style={{ animationDelay: "600ms" }}
      >
        <p className="text-white/45 text-xs mb-3 font-bold">{LABELS.tipsTitle}</p>
        <ul className="flex flex-col gap-3">
          {primaryMeta.tips.map((tip, i) => (
            <li key={i} className="flex gap-2 text-sm text-white/75 leading-relaxed">
              <span className={`flex-shrink-0 font-black ${primaryMeta.text}`}>{i + 1}.</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* quick mode → upgrade prompt */}
      {mode === "quick" && (
        <div className="rounded-2xl bg-white/[0.03] border border-white/8 p-4 animate-slideUp" style={{ animationDelay: "800ms" }}>
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">🔬</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-white mb-1">더 정확한 결과를 원한다면?</p>
              <p className="text-xs text-white/50 leading-relaxed mb-3">
                세부 측정(21문항)은 시나리오 기반 분석과 더 많은 차트 반응을 포함해서 정밀한 성향을 파악해요.
              </p>
              <button
                onClick={() => router.push("/analysis?mode=detailed")}
                className="w-full py-2.5 rounded-xl bg-white/10 border border-white/15 text-white/70 text-sm font-semibold hover:bg-white/15 hover:text-white/85 active:scale-[0.98] transition-all"
              >
                세부 측정 해보기 →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* compete 반환 버튼 */}
      {returnTo === "compete" && (
        <div
          className="rounded-2xl bg-gradient-to-r from-yellow-500/15 to-orange-500/15 border border-yellow-500/30 p-4 animate-slideUp"
          style={{ animationDelay: mode === "quick" ? "900ms" : "700ms" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🏆</span>
            <div>
              <p className="text-sm font-black text-yellow-300">경쟁 페이지에 반영 완료!</p>
              <p className="text-xs text-white/50">투자 DNA가 새 결과로 업데이트됐어요</p>
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
      <div className="flex flex-col gap-2 mt-2 animate-slideUp" style={{ animationDelay: mode === "quick" ? "1000ms" : "800ms" }}>
        {returnTo !== "compete" && (
          <button
            onClick={() => router.push("/home")}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 border border-blue-500/30 text-white text-sm font-bold hover:scale-[1.01] active:scale-[0.98] transition-all shadow-lg shadow-blue-500/25"
          >
            {LABELS.startGameBtn}
          </button>
        )}
        <button
          onClick={() => window.location.reload()}
          className="w-full py-3 rounded-2xl border border-white/8 text-white/40 text-sm font-semibold hover:text-white/60 active:scale-[0.98] transition-all"
        >
          {LABELS.retryBtn}
        </button>
      </div>
    </div>
  );
}
