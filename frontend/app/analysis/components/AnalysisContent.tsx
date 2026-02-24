"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type {
  AnyQuestion,
  AssessmentMode,
  TheoryQuestion,
  ChartQuestion,
  TheoryOption,
  ChartOption,
  AbilityScores,
  PersonalityScores,
  PersonalityType,
} from "../types";
import {
  FEEDBACK_AUTO_ADVANCE_MS,
  RESULT_DELAY_MS,
  LABELS,
  POINTS_PER_SELECTION,
  QUICK_QUESTION_IDS,
  ASSESSMENT_MODE_CONFIG,
} from "../config";
import questionsData from "@/data/analysis-questions.json";
import QuestionHeader from "./QuestionHeader";
import TheoryCard from "./TheoryCard";
import ChartCard from "./ChartCard";
import ResultScreen from "./ResultScreen";
import { ParticleBurst, ScorePop, ScreenFlash, FeedbackTimer } from "./GameEffects";

function isChartQuestion(q: AnyQuestion): q is ChartQuestion {
  return "title" in q;
}

const ALL_QUESTIONS: AnyQuestion[] = [
  ...questionsData.theory,
  ...questionsData.chart,
] as AnyQuestion[];

const INITIAL_ABILITIES: AbilityScores = {
  riskTolerance: 0,
  analysis: 0,
  emotionControl: 0,
  coping: 0,
  infoJudgment: 0,
};

const INITIAL_PERSONALITY: PersonalityScores = {
  analyst: 0,
  challenger: 0,
  conservative: 0,
  emotional: 0,
  systematic: 0,
};

type Phase = "intro" | "quiz" | "result";

export default function AnalysisContent() {
  const searchParams = useSearchParams();
  const mode: AssessmentMode = searchParams.get("mode") === "quick" ? "quick" : "detailed";
  const modeConfig = ASSESSMENT_MODE_CONFIG[mode];

  const allQuestions = useMemo(() => {
    if (mode === "quick") {
      return ALL_QUESTIONS.filter((q) => QUICK_QUESTION_IDS.includes(q.id));
    }
    return ALL_QUESTIONS;
  }, [mode]);

  const theoryCount = useMemo(
    () => allQuestions.filter((q) => !isChartQuestion(q)).length,
    [allQuestions]
  );

  const [phase, setPhase] = useState<Phase>("intro");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<PersonalityType | null>(null);
  const [feedbackInsight, setFeedbackInsight] = useState("");
  const [abilities, setAbilities] = useState<AbilityScores>(INITIAL_ABILITIES);
  const [personalityScores, setPersonalityScores] = useState<PersonalityScores>(INITIAL_PERSONALITY);
  const [showResult, setShowResult] = useState(false);
  const [chartTrigger, setChartTrigger] = useState(0);

  const [particleTrigger, setParticleTrigger] = useState(0);
  const [showScorePop, setShowScorePop] = useState(false);
  const [canAdvance, setCanAdvance] = useState(false);

  const currentQ = allQuestions[currentIdx];
  const total = allQuestions.length;
  const isChart = currentQ ? isChartQuestion(currentQ) : false;

  useEffect(() => {
    setChartTrigger((t) => t + 1);
    setSelected(null);
    setShowFeedback(false);
    setFeedbackType(null);
    setFeedbackInsight("");
    setShowScorePop(false);
    setCanAdvance(false);
  }, [currentIdx]);

  const advanceToNext = useCallback(() => {
    const next = currentIdx + 1;
    if (next >= total) {
      setPhase("result");
      setTimeout(() => setShowResult(true), RESULT_DELAY_MS);
    } else {
      setCurrentIdx(next);
    }
  }, [currentIdx, total]);

  const handleSelect = useCallback(
    (index: number, option: TheoryOption | ChartOption) => {
      if (showFeedback) return;
      setSelected(index);
      setShowFeedback(true);
      setFeedbackType(option.personalityType);
      setFeedbackInsight(option.insight);

      setParticleTrigger((t) => t + 1);
      setShowScorePop(true);
      setTimeout(() => setShowScorePop(false), 2000);

      setPersonalityScores((prev) => ({
        ...prev,
        [option.personalityType]: prev[option.personalityType] + POINTS_PER_SELECTION,
      }));

      setAbilities((prev) => {
        const next = { ...prev };
        for (const [k, v] of Object.entries(option.abilities)) {
          const key = k as keyof AbilityScores;
          next[key] = (next[key] ?? 0) + (v ?? 0);
        }
        return next;
      });

      setCanAdvance(true);
    },
    [showFeedback]
  );

  useEffect(() => {
    if (!canAdvance) return;
    const t = setTimeout(advanceToNext, FEEDBACK_AUTO_ADVANCE_MS);
    return () => clearTimeout(t);
  }, [canAdvance, advanceToNext]);

  const handleSkipFeedback = useCallback(() => {
    if (canAdvance) {
      setCanAdvance(false);
      advanceToNext();
    }
  }, [canAdvance, advanceToNext]);

  if (phase === "intro") {
    return (
      <main className="min-h-screen bg-black flex flex-col items-center justify-center px-5 py-12 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-indigo-600/20 blur-3xl" />

        <div className="w-full max-w-sm flex flex-col items-center gap-6 animate-fadeUp relative z-10">
          <div className="text-7xl animate-float">🎮</div>

          <div className="text-center">
            <h1 className="text-2xl font-black text-white mb-2">{LABELS.pageTitle}</h1>
            <p className="text-white/45 text-sm">{modeConfig.subtitle}</p>
            {mode === "quick" && (
              <span className="inline-block mt-2 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                ⚡ 간략 측정
              </span>
            )}
            {mode === "detailed" && (
              <span className="inline-block mt-2 text-[11px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-full">
                🔬 세부 측정
              </span>
            )}
          </div>

          <div className="w-full rounded-2xl bg-white/[0.04] border border-white/8 p-4 flex flex-col gap-4">
            {[
              { emoji: "🎭", text: "다양한 상황에서 네 감정을 솔직하게 골라봐!", delay: 0 },
              { emoji: "📈", text: "실전 차트를 보면서 네 반응을 체크해!", delay: 100 },
              { emoji: "🎯", text: "정답은 없어! 네 성향을 발견하는 게 목표야", delay: 200 },
              { emoji: "🏆", text: "선택할 때마다 점수와 특수효과가 빵빵!", delay: 300 },
            ].map(({ emoji, text, delay }) => (
              <div
                key={text}
                className="flex items-start gap-3 animate-slideUp"
                style={{ animationDelay: `${delay}ms` }}
              >
                <span className="text-xl flex-shrink-0">{emoji}</span>
                <p className="text-white/65 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setPhase("quiz")}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-base shadow-[0_0_32px_rgba(99,102,241,0.45)] hover:shadow-[0_0_44px_rgba(99,102,241,0.65)] hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {LABELS.startCta}
          </button>

          <p className="text-white/20 text-xs text-center">
            답변은 저장되지 않아. 편하게 골라!
          </p>
        </div>
      </main>
    );
  }

  if (phase === "result") {
    return (
      <main className="min-h-screen bg-black overflow-y-auto relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-purple-600/15 blur-3xl" />
        <div className="w-full max-w-sm mx-auto pt-4 relative z-10">
          {showResult ? (
            <ResultScreen
              personalityScores={personalityScores}
              abilities={abilities}
              totalQuestions={total}
              mode={mode}
            />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
              <div className="text-6xl animate-bounceIn">🔮</div>
              <p className="text-white/50 text-sm animate-pulse">너의 성향을 분석하는 중...</p>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black overflow-y-auto relative">
      <ScreenFlash personalityType={feedbackType} trigger={particleTrigger} />
      <ParticleBurst personalityType={feedbackType} trigger={particleTrigger} />
      <ScorePop show={showScorePop} personalityType={feedbackType} />

      <div className="w-full max-w-sm mx-auto flex flex-col relative z-10">
        <QuestionHeader
          current={currentIdx + 1}
          total={total}
          score={Object.values(personalityScores).reduce((a, b) => a + b, 0)}
          isChart={isChart}
        />

        {currentIdx === theoryCount && theoryCount > 0 && (
          <div className="mx-4 my-3 flex items-center gap-2 animate-fadeUp">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            <span className="text-xs text-emerald-400/70 font-bold px-3">📈 실전 차트 구간!</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
          </div>
        )}

        {!isChart && (currentQ as TheoryQuestion).scenarioGroup && (
          <div className="mx-4 mb-2 animate-fadeUp">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20">
              <span className="text-sm">📖</span>
              <span className="text-xs font-bold text-red-300">
                시나리오 {(currentQ as TheoryQuestion).scenarioStep}/{(currentQ as TheoryQuestion).scenarioTotal}
              </span>
              <span className="text-xs text-white/40">|</span>
              <span className="text-xs text-white/50">{(currentQ as TheoryQuestion).scenarioTitle}</span>
            </div>
          </div>
        )}

        {isChart ? (
          <ChartCard
            question={currentQ as ChartQuestion}
            selected={selected}
            showFeedback={showFeedback}
            feedbackType={feedbackType}
            feedbackInsight={feedbackInsight}
            trigger={chartTrigger}
            onSelect={(i, opt) => handleSelect(i, opt as ChartOption)}
          />
        ) : (
          <TheoryCard
            question={currentQ as TheoryQuestion}
            selected={selected}
            showFeedback={showFeedback}
            feedbackType={feedbackType}
            feedbackInsight={feedbackInsight}
            chartTrigger={chartTrigger}
            onSelect={(i, opt) => handleSelect(i, opt as TheoryOption)}
          />
        )}

        <FeedbackTimer
          show={showFeedback && canAdvance}
          durationMs={FEEDBACK_AUTO_ADVANCE_MS}
          personalityType={feedbackType}
          onSkip={handleSkipFeedback}
        />
      </div>
    </main>
  );
}
