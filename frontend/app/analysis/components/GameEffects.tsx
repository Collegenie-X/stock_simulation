"use client";

import { useEffect, useState, useRef } from "react";
import type { PersonalityType } from "../types";
import { PERSONALITY_META, PARTICLE_EMOJIS, SCORE_MESSAGES } from "../config";

// ─── Particle Burst ────────────────────────────────────────────────────────────

interface Particle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  rotation: number;
  opacity: number;
}

export function ParticleBurst({ personalityType, trigger }: { personalityType: PersonalityType | null; trigger: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    if (!personalityType || trigger === 0) return;

    const emojis = PARTICLE_EMOJIS[personalityType];
    const newParticles: Particle[] = [];
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12 + (Math.random() - 0.5) * 0.5;
      const speed = 60 + Math.random() * 100;
      newParticles.push({
        id: ++idRef.current,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        x: 50,
        y: 50,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        scale: 0.6 + Math.random() * 0.8,
        rotation: Math.random() * 360,
        opacity: 1,
      });
    }
    setParticles(newParticles);

    const timer = setTimeout(() => setParticles([]), 1500);
    return () => clearTimeout(timer);
  }, [personalityType, trigger]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-particleBurst"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: `translate(${p.vx}px, ${p.vy}px) scale(${p.scale}) rotate(${p.rotation}deg)`,
            fontSize: `${20 + p.scale * 10}px`,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
}

// ─── Score Pop ──────────────────────────────────────────────────────────────────

export function ScorePop({ show, personalityType }: { show: boolean; personalityType: PersonalityType | null }) {
  if (!show || !personalityType) return null;

  const meta = PERSONALITY_META[personalityType];
  const msg = SCORE_MESSAGES[Math.floor(Math.random() * SCORE_MESSAGES.length)];

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-scorePop">
      <div
        className={`px-5 py-2.5 rounded-full border ${meta.border} ${meta.bg} ${meta.glow} flex items-center gap-2`}
      >
        <span className="text-xl">{meta.emoji}</span>
        <span className={`text-sm font-bold ${meta.text}`}>+10</span>
        <span className="text-xs text-white/60">{msg}</span>
      </div>
    </div>
  );
}

// ─── Feedback Timer Bar ─────────────────────────────────────────────────────────

export function FeedbackTimer({
  show,
  durationMs,
  personalityType,
  onSkip,
}: {
  show: boolean;
  durationMs: number;
  personalityType: PersonalityType | null;
  onSkip: () => void;
}) {
  const meta = personalityType ? PERSONALITY_META[personalityType] : null;

  if (!show || !meta) return null;

  return (
    <div className="px-4 pb-2 animate-fadeUp">
      <button
        onClick={onSkip}
        className={`w-full py-3 rounded-2xl border ${meta.border} ${meta.bg} text-sm font-bold ${meta.text} hover:brightness-110 active:scale-[0.98] transition-all relative overflow-hidden`}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-r ${meta.accent} opacity-20`}
          style={{
            animation: `shrinkWidth ${durationMs}ms linear forwards`,
          }}
        />
        <span className="relative z-10">다음으로 →</span>
      </button>
    </div>
  );
}

// ─── Screen Flash ───────────────────────────────────────────────────────────────

export function ScreenFlash({ personalityType, trigger }: { personalityType: PersonalityType | null; trigger: number }) {
  const [show, setShow] = useState(false);
  const meta = personalityType ? PERSONALITY_META[personalityType] : null;

  useEffect(() => {
    if (!personalityType || trigger === 0) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 400);
    return () => clearTimeout(t);
  }, [personalityType, trigger]);

  if (!show || !meta) return null;

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-40 bg-gradient-to-b ${meta.accent} animate-screenFlash`}
    />
  );
}
