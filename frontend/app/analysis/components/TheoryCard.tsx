"use client";

import type { TheoryQuestion, TheoryOption, PersonalityType } from "../types";
import { PERSONALITY_META, LABELS } from "../config";
import AnimatedMiniChart from "./AnimatedMiniChart";
import OptionButton from "./OptionButton";

interface TheoryCardProps {
  question: TheoryQuestion;
  selected: number | null;
  showFeedback: boolean;
  feedbackType: PersonalityType | null;
  feedbackInsight: string;
  chartTrigger: number;
  onSelect: (index: number, option: TheoryOption) => void;
}

export default function TheoryCard({
  question,
  selected,
  showFeedback,
  feedbackType,
  feedbackInsight,
  chartTrigger,
  onSelect,
}: TheoryCardProps) {
  const meta = feedbackType ? PERSONALITY_META[feedbackType] : null;

  return (
    <div className="flex flex-col gap-3 px-4 pb-4 animate-slideUp">
      {/* animated chart background visual */}
      <div
        className="relative rounded-2xl overflow-hidden border border-white/8"
        style={{ background: "#0a0a0a", height: "8rem" }}
      >
        <AnimatedMiniChart
          variant={question.chartVariant}
          accent={question.chartAccent}
          trigger={chartTrigger}
        />
        {/* question overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-center justify-end pb-3 px-4">
          <p className="text-sm font-bold text-white/95 leading-relaxed whitespace-pre-line text-center drop-shadow-lg">
            {question.question}
          </p>
        </div>
      </div>

      {/* options */}
      <div className="flex flex-col gap-2">
        {question.options.map((opt, i) => (
          <OptionButton
            key={i}
            emoji={opt.emoji}
            text={opt.text}
            personalityType={opt.personalityType}
            isSelected={selected === i}
            showFeedback={showFeedback}
            onClick={() => onSelect(i, opt)}
            delay={i * 80}
          />
        ))}
      </div>

      {/* personality feedback card */}
      {showFeedback && meta && (
        <div
          className={`rounded-2xl border ${meta.border} ${meta.bg} ${meta.glow} px-4 py-4 flex flex-col gap-2 animate-bounceIn`}
        >
          <div className="flex items-center gap-2">
            <span className="text-3xl">{meta.emoji}</span>
            <div>
              <p className={`text-sm font-black ${meta.text}`}>{meta.label}</p>
              <p className="text-[11px] text-white/40">{LABELS.feedbackTitle}</p>
            </div>
          </div>
          <p className="text-sm text-white/75 leading-relaxed">{feedbackInsight}</p>
        </div>
      )}
    </div>
  );
}
