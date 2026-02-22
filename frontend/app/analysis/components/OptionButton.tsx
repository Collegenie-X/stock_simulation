"use client";

import type { PersonalityType } from "../types";
import { PERSONALITY_META } from "../config";

interface OptionButtonProps {
  emoji: string;
  text: string;
  subLabel?: string;
  personalityType?: PersonalityType;
  isSelected: boolean;
  showFeedback: boolean;
  onClick: () => void;
  delay?: number;
}

export default function OptionButton({
  emoji,
  text,
  subLabel,
  personalityType,
  isSelected,
  showFeedback,
  onClick,
  delay = 0,
}: OptionButtonProps) {
  const meta = personalityType ? PERSONALITY_META[personalityType] : null;

  let containerClass =
    "w-full flex items-center gap-3 px-3.5 py-3.5 rounded-2xl border text-left transition-all ";

  if (showFeedback) {
    if (isSelected && meta) {
      containerClass += `${meta.border} ${meta.bg} ${meta.glow} animate-bounceIn`;
    } else {
      containerClass += "border-white/5 bg-transparent opacity-25 scale-[0.97] transition-all duration-500";
    }
  } else {
    containerClass +=
      "border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.08] hover:scale-[1.02] active:scale-[0.97] cursor-pointer animate-glowPulse";
  }

  return (
    <button
      className={containerClass}
      onClick={onClick}
      disabled={showFeedback}
      style={{ animationDelay: showFeedback ? "0ms" : `${delay}ms` }}
    >
      <span className="text-2xl flex-shrink-0 w-10 text-center leading-none">
        {emoji}
      </span>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold leading-snug ${
            showFeedback && isSelected && meta ? meta.text : "text-white/90"
          }`}
        >
          {text}
        </p>
        {subLabel && !showFeedback && (
          <p className="text-[11px] text-white/40 mt-0.5">{subLabel}</p>
        )}
        {showFeedback && isSelected && meta && (
          <p className={`text-[11px] mt-0.5 font-bold ${meta.text} opacity-90`}>
            {meta.emoji} {meta.label}
          </p>
        )}
      </div>

      {!showFeedback && (
        <span className="text-white/15 text-lg flex-shrink-0">›</span>
      )}
    </button>
  );
}
