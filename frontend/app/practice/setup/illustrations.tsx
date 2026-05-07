"use client"

import { cn } from "@/lib/utils"

// ============================================================
// Speed Mode scene illustrations
// ============================================================

export function SprintScene({ active = false, className }: { active?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={cn("w-full h-full", className)} fill="none">
      <defs>
        <radialGradient id="sprint-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fb923c" stopOpacity={active ? 0.5 : 0.25} />
          <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sprint-bolt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      {/* Glow background */}
      <circle cx="40" cy="36" r="32" fill="url(#sprint-bg)" />
      {/* Speed lines */}
      <g opacity={active ? 1 : 0.5}>
        <line x1="8" y1="22" x2="22" y2="22" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" opacity="0.7">
          {active && <animate attributeName="x1" values="8;14;8" dur="0.6s" repeatCount="indefinite" />}
        </line>
        <line x1="6" y1="40" x2="26" y2="40" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round">
          {active && <animate attributeName="x1" values="6;16;6" dur="0.5s" repeatCount="indefinite" />}
        </line>
        <line x1="10" y1="56" x2="22" y2="56" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" opacity="0.7">
          {active && <animate attributeName="x1" values="10;18;10" dur="0.7s" repeatCount="indefinite" />}
        </line>
      </g>
      {/* Lightning bolt */}
      <path
        d="M48 12 L34 42 L44 42 L36 68 L60 34 L48 34 L56 12 Z"
        fill="url(#sprint-bolt)"
        stroke="#fff7ed"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Sparkles */}
      {active && (
        <>
          <circle cx="62" cy="20" r="1.5" fill="#fde047">
            <animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="68" cy="50" r="1.2" fill="#fb923c">
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0.3s" />
          </circle>
        </>
      )}
    </svg>
  )
}

export function StandardScene({ active = false, className }: { active?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={cn("w-full h-full", className)} fill="none">
      <defs>
        <radialGradient id="std-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity={active ? 0.5 : 0.25} />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="std-sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#facc15" />
        </linearGradient>
        <linearGradient id="std-building" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#1e40af" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="36" r="32" fill="url(#std-bg)" />
      {/* Sun */}
      <circle cx="58" cy="22" r="8" fill="url(#std-sun)">
        {active && <animate attributeName="r" values="8;9;8" dur="2s" repeatCount="indefinite" />}
      </circle>
      <g stroke="#fde047" strokeWidth="1.5" strokeLinecap="round" opacity="0.7">
        <line x1="58" y1="8" x2="58" y2="11" />
        <line x1="46" y1="22" x2="49" y2="22" />
        <line x1="49" y1="13" x2="51" y2="15" />
        <line x1="68" y1="13" x2="66" y2="15" />
      </g>
      {/* Buildings */}
      <rect x="14" y="38" width="14" height="28" rx="1.5" fill="url(#std-building)" />
      <rect x="30" y="30" width="16" height="36" rx="1.5" fill="url(#std-building)" />
      <rect x="48" y="42" width="12" height="24" rx="1.5" fill="url(#std-building)" />
      {/* Windows */}
      <g fill="#fef3c7" opacity="0.85">
        <rect x="17" y="42" width="2.5" height="2.5" />
        <rect x="22" y="42" width="2.5" height="2.5" />
        <rect x="17" y="48" width="2.5" height="2.5" />
        <rect x="22" y="48" width="2.5" height="2.5" />
        <rect x="33" y="34" width="2.5" height="2.5" />
        <rect x="38" y="34" width="2.5" height="2.5" />
        <rect x="33" y="40" width="2.5" height="2.5" />
        <rect x="38" y="40" width="2.5" height="2.5" />
        <rect x="33" y="46" width="2.5" height="2.5" />
        <rect x="38" y="46" width="2.5" height="2.5" />
        <rect x="51" y="46" width="2" height="2" />
        <rect x="55" y="46" width="2" height="2" />
        <rect x="51" y="52" width="2" height="2" />
        <rect x="55" y="52" width="2" height="2" />
      </g>
      {/* Ground */}
      <rect x="6" y="66" width="68" height="2" rx="1" fill="#1e3a8a" />
    </svg>
  )
}

export function MarathonScene({ active = false, className }: { active?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={cn("w-full h-full", className)} fill="none">
      <defs>
        <radialGradient id="mar-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity={active ? 0.5 : 0.25} />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mar-mtn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#6b21a8" />
        </linearGradient>
        <linearGradient id="mar-mtn2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#5b21b6" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="36" r="32" fill="url(#mar-bg)" />
      {/* Moon */}
      <circle cx="60" cy="20" r="6" fill="#fef3c7" opacity="0.9" />
      <circle cx="62" cy="18" r="4" fill="#1e1b4b" opacity="0.5" />
      {/* Stars */}
      <g fill="#fde047">
        <circle cx="14" cy="14" r="0.8">
          {active && <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />}
        </circle>
        <circle cx="26" cy="20" r="0.6">
          {active && <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />}
        </circle>
        <circle cx="44" cy="10" r="0.7">
          {active && <animate attributeName="opacity" values="0.3;1;0.3" dur="2.5s" repeatCount="indefinite" />}
        </circle>
      </g>
      {/* Back mountain */}
      <path d="M2 66 L22 38 L40 56 L52 44 L78 66 Z" fill="url(#mar-mtn2)" opacity="0.7" />
      {/* Front mountain */}
      <path d="M-2 68 L18 44 L34 60 L48 40 L66 58 L82 68 Z" fill="url(#mar-mtn)" />
      {/* Snow caps */}
      <path d="M14 50 L18 44 L22 50 L20 51 L18 49 Z" fill="#fff" opacity="0.85" />
      <path d="M44 46 L48 40 L52 46 L50 47 L48 45 Z" fill="#fff" opacity="0.85" />
      {/* Flag on peak */}
      <line x1="48" y1="40" x2="48" y2="30" stroke="#fef3c7" strokeWidth="1" strokeLinecap="round" />
      <path d="M48 30 L56 32 L48 35 Z" fill="#ef4444">
        {active && <animate attributeName="d" values="M48 30 L56 32 L48 35 Z;M48 30 L56 31 L48 36 Z;M48 30 L56 32 L48 35 Z" dur="1.5s" repeatCount="indefinite" />}
      </path>
      {/* Ground */}
      <rect x="0" y="66" width="80" height="2" fill="#312e81" />
    </svg>
  )
}

// ============================================================
// Coin stack illustrations for money tiers
// ============================================================

export function CoinStack({
  size = "small",
  active = false,
  premium = false,
  className,
}: {
  size?: "small" | "medium" | "large"
  active?: boolean
  premium?: boolean
  className?: string
}) {
  const stroke = premium ? "#a855f7" : "#eab308"
  const main = premium
    ? { top: "#e9d5ff", mid: "#c084fc", bot: "#7e22ce" }
    : { top: "#fef08a", mid: "#facc15", bot: "#a16207" }
  const layers = size === "small" ? 1 : size === "medium" ? 2 : 3

  return (
    <svg viewBox="0 0 48 36" className={cn("w-full h-full", className)} fill="none">
      <defs>
        <linearGradient id={`coin-${size}-${premium}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={main.top} />
          <stop offset="50%" stopColor={main.mid} />
          <stop offset="100%" stopColor={main.bot} />
        </linearGradient>
      </defs>
      {layers >= 3 && (
        <g transform="translate(0, 18)">
          <ellipse cx="24" cy="6" rx="16" ry="4" fill={main.bot} />
          <rect x="8" y="2" width="32" height="6" fill={`url(#coin-${size}-${premium})`} />
          <ellipse cx="24" cy="2" rx="16" ry="4" fill={`url(#coin-${size}-${premium})`} stroke={stroke} strokeWidth="0.8" />
        </g>
      )}
      {layers >= 2 && (
        <g transform="translate(0, 10)">
          <ellipse cx="24" cy="6" rx="14" ry="3.5" fill={main.bot} />
          <rect x="10" y="2.5" width="28" height="5" fill={`url(#coin-${size}-${premium})`} />
          <ellipse cx="24" cy="2.5" rx="14" ry="3.5" fill={`url(#coin-${size}-${premium})`} stroke={stroke} strokeWidth="0.8" />
        </g>
      )}
      <g transform={`translate(0, ${layers >= 2 ? 2 : 12})`}>
        <ellipse cx="24" cy="6" rx="12" ry="3" fill={main.bot} />
        <rect x="12" y="3" width="24" height="4" fill={`url(#coin-${size}-${premium})`} />
        <ellipse cx="24" cy="3" rx="12" ry="3" fill={`url(#coin-${size}-${premium})`} stroke={stroke} strokeWidth="0.8" />
        <text x="24" y="5" textAnchor="middle" fontSize="4" fontWeight="900" fill={premium ? "#581c87" : "#713f12"}>₩</text>
      </g>
      {active && (
        <>
          <circle cx="6" cy="4" r="1" fill={stroke}>
            <animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="42" cy="6" r="1.2" fill={stroke}>
            <animate attributeName="opacity" values="1;0;1" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </>
      )}
    </svg>
  )
}

// ============================================================
// Daily opportunity scene (sun/moon arc)
// ============================================================

export function DayCycleScene({
  count,
  active = false,
}: {
  count: 1 | 2
  active?: boolean
}) {
  return (
    <svg viewBox="0 0 100 40" className="w-full h-10" fill="none">
      <defs>
        <linearGradient id={`sky-${count}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="50%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>
      </defs>
      {/* Arc path */}
      <path
        d="M5 35 Q 50 -5 95 35"
        stroke={active ? "#10b981" : "#475569"}
        strokeWidth="1"
        strokeDasharray="2 3"
        fill="none"
        opacity="0.6"
      />
      {count === 1 ? (
        <>
          {/* Single Moon (저녁 한 번) */}
          <g transform="translate(50, 18)">
            <circle r="7" fill="#e0e7ff">
              {active && <animate attributeName="r" values="7;7.8;7" dur="2.4s" repeatCount="indefinite" />}
            </circle>
            <circle cx="2" cy="-2" r="4.5" fill="#1e1b4b" opacity="0.6" />
            {/* Soft glow */}
            <circle r="10" fill="#a5b4fc" opacity={active ? 0.18 : 0.08} />
          </g>
        </>
      ) : (
        <>
          {/* Sun */}
          <g transform="translate(20, 18)">
            <circle r="6" fill="#fde047">
              {active && <animate attributeName="r" values="6;6.8;6" dur="2s" repeatCount="indefinite" />}
            </circle>
            <g stroke="#fde047" strokeWidth="1.2" strokeLinecap="round" opacity="0.7">
              <line x1="0" y1="-9" x2="0" y2="-7" />
              <line x1="-9" y1="0" x2="-7" y2="0" />
              <line x1="9" y1="0" x2="7" y2="0" />
              <line x1="0" y1="9" x2="0" y2="7" />
            </g>
          </g>
          {/* Moon */}
          <g transform="translate(80, 18)">
            <circle r="5.5" fill="#e0e7ff" />
            <circle cx="1.5" cy="-1.5" r="3.5" fill="#1e1b4b" opacity="0.6" />
          </g>
        </>
      )}
      {active && (
        <>
          <circle cx="40" cy="6" r="0.8" fill="#fff">
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="65" cy="4" r="0.6" fill="#fff">
            <animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite" />
          </circle>
        </>
      )}
    </svg>
  )
}
