"use client";

import type { ChartQuestion, ChartOption, PersonalityType } from "../types";
import { PERSONALITY_META, LABELS } from "../config";
import AnimatedMiniChart from "./AnimatedMiniChart";
import OptionButton from "./OptionButton";

interface ChartCardProps {
  question: ChartQuestion;
  selected: number | null;
  showFeedback: boolean;
  feedbackType: PersonalityType | null;
  feedbackInsight: string;
  trigger: number;
  onSelect: (index: number, option: ChartOption) => void;
}

function formatPrice(v: number) {
  return v.toLocaleString("ko-KR") + "원";
}

export default function ChartCard({
  question,
  selected,
  showFeedback,
  feedbackType,
  feedbackInsight,
  trigger,
  onSelect,
}: ChartCardProps) {
  const meta = feedbackType ? PERSONALITY_META[feedbackType] : null;
  const isUp = question.change?.startsWith("+");
  const isDown = question.change?.startsWith("-");

  return (
    <div className="flex flex-col gap-3 px-4 pb-4 animate-slideUp">
      {/* scenario title */}
      <div className="flex items-center gap-2 px-1">
        <span className="text-base font-black text-white/90">{question.title}</span>
      </div>

      {/* animated chart */}
      <div
        className="relative rounded-2xl overflow-hidden border border-white/8"
        style={{ background: "#0a0a0a", height: "10rem" }}
      >
        <AnimatedMiniChart
          variant={question.chartVariant}
          accent={question.chartAccent}
          trigger={trigger}
        />

        <div className="absolute top-2.5 left-3">
          <p className="text-sm font-bold text-white/90 drop-shadow">{question.stock}</p>
          <p className="text-[11px] text-white/45">{question.sector}</p>
        </div>
        <div className="absolute top-2.5 right-3 text-right">
          <p className="text-base font-black text-white drop-shadow">{formatPrice(question.currentPrice)}</p>
          {question.change && (
            <p
              className={`text-xs font-bold ${
                isUp ? "text-emerald-400" : isDown ? "text-red-400" : "text-white/50"
              }`}
            >
              {question.change}
            </p>
          )}
        </div>

        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
          <p className="text-[10px] text-white/55">{question.situation}</p>
        </div>
      </div>

      {/* info pills */}
      <div className="flex flex-wrap gap-1.5">
        {question.volume && (
          <span className="text-[10px] text-white/55 bg-white/5 border border-white/8 rounded-full px-2.5 py-1">
            거래량 {question.volume}
          </span>
        )}
        {question.news && (
          <span className="text-[10px] text-blue-300/80 bg-blue-500/10 border border-blue-500/20 rounded-full px-2.5 py-1">
            📰 {question.news}
          </span>
        )}
        {question.aiWarning && (
          <span className="text-[10px] text-yellow-300/80 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-2.5 py-1 animate-pulse">
            🤖 {question.aiWarning}
          </span>
        )}
      </div>

      {/* question */}
      <div className="rounded-2xl bg-white/[0.04] border border-white/8 px-4 py-3 text-center">
        <p className="text-sm font-bold text-white/90 leading-relaxed whitespace-pre-line">
          {question.question}
        </p>
      </div>

      {/* options */}
      <div className="flex flex-col gap-2">
        {question.options.map((opt, i) => (
          <OptionButton
            key={i}
            emoji={opt.emoji}
            text={opt.text}
            subLabel={!showFeedback ? opt.emotion : undefined}
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
