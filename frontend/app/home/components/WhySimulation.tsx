"use client"

const W = 120
const H = 80

// ─── 1) 닮은꼴 AI 대결 — 나 vs AI 페이스오프 ──────────────────────────────────

function AiBattleSvg() {
  // 두 라인 레이스: 파랑(나) vs 빨강(AI) — 비슷한 패턴이지만 끝에 AI가 살짝 앞서며 대결 강조
  const padX = 6
  const padTop = 16
  const padBot = 14
  const innerW = W - padX * 2
  const innerH = H - padTop - padBot
  // 3 계곡 — 변동성 높은 시장. 두 플레이어가 같은 시장에서 다르게 반응
  // me(나): 늦게 사고 빨리 팔며 진폭 크게 휩쓸림
  // ai(AI): 더 빠르게 매수/늦게 매도하며 효율적
  const me = [50, 58, 42, 30, 48, 56, 38, 22, 40, 52, 44, 32, 46, 56, 64, 70]
  const ai = [50, 54, 46, 38, 56, 62, 50, 36, 54, 64, 58, 50, 62, 72, 80, 88]
  const stepX = innerW / (me.length - 1)
  const min = 18
  const max = 92
  const range = max - min
  const ptsMe = me.map((v, i) => ({ x: padX + i * stepX, y: padTop + innerH - ((v - min) / range) * innerH }))
  const ptsAi = ai.map((v, i) => ({ x: padX + i * stepX, y: padTop + innerH - ((v - min) / range) * innerH }))

  const smooth = (pts: { x: number; y: number }[]) => {
    let p = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i]
      const c1x = a.x + (b.x - a.x) * 0.45
      const c2x = b.x - (b.x - a.x) * 0.45
      p += ` C ${c1x} ${a.y}, ${c2x} ${b.y}, ${b.x} ${b.y}`
    }
    return p
  }

  const meEnd = ptsMe[ptsMe.length - 1]
  const aiEnd = ptsAi[ptsAi.length - 1]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      <defs>
        <linearGradient id="ab-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a1230" />
          <stop offset="100%" stopColor="#0f0f17" />
        </linearGradient>
        <linearGradient id="ab-me" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3182F6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3182F6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ab-ai" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F04452" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#F04452" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} rx="8" fill="url(#ab-bg)" />

      {/* dotted grid */}
      {[0.33, 0.66].map((p) => (
        <line key={p} x1={padX} y1={padTop + innerH * p} x2={W - padX} y2={padTop + innerH * p}
          stroke="#ffffff" strokeOpacity="0.06" strokeDasharray="1.5 3" />
      ))}

      {/* HEADER: ME vs AI */}
      <g>
        <circle cx="11" cy="10" r="2.5" fill="#3182F6" />
        <text x="17" y="12" fontSize="6" fill="#93c5fd" fontWeight="900">나</text>
        <text x="55" y="12" fontSize="6" fill="#fbbf24" textAnchor="middle" fontWeight="900">VS</text>
        <circle cx="76" cy="10" r="2.5" fill="#F04452" />
        <text x="82" y="12" fontSize="6" fill="#fca5a5" fontWeight="900">닮은 AI</text>
      </g>

      {/* AREA fills */}
      <path d={`${smooth(ptsMe)} L ${meEnd.x} ${H - padBot} L ${ptsMe[0].x} ${H - padBot} Z`} fill="url(#ab-me)" />
      <path d={`${smooth(ptsAi)} L ${aiEnd.x} ${H - padBot} L ${ptsAi[0].x} ${H - padBot} Z`} fill="url(#ab-ai)" />

      {/* LINES */}
      <path d={smooth(ptsMe)} fill="none" stroke="#3182F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={smooth(ptsAi)} fill="none" stroke="#F04452" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* 3 valleys — mark valleys with subtle vertical guides */}
      {[3, 7, 11].map((i) => (
        <g key={i}>
          <line x1={ptsMe[i].x} y1={padTop} x2={ptsMe[i].x} y2={H - padBot}
            stroke="#ffffff" strokeOpacity="0.08" strokeDasharray="1.5 2" />
          <text x={ptsMe[i].x} y={padTop + 5} fontSize="4.5" fill="#fbbf24" textAnchor="middle" fontWeight="900">
            ▽{i === 3 ? "1" : i === 7 ? "2" : "3"}
          </text>
        </g>
      ))}

      {/* divergence sparkles at valleys */}
      {[3, 7, 11].map((i) => (
        <g key={`s-${i}`}>
          <circle cx={ptsMe[i].x} cy={ptsMe[i].y} r="2" fill="#3182F6" opacity="0.9" stroke="#fff" strokeWidth="0.6" />
          <circle cx={ptsAi[i].x} cy={ptsAi[i].y} r="2" fill="#F04452" opacity="0.9" stroke="#fff" strokeWidth="0.6" />
          <line x1={ptsMe[i].x} y1={ptsMe[i].y} x2={ptsAi[i].x} y2={ptsAi[i].y}
            stroke="#fbbf24" strokeWidth="0.5" strokeDasharray="1 1" opacity="0.6" />
        </g>
      ))}

      {/* END MARKER: 사람 머리 (나) */}
      <g transform={`translate(${meEnd.x - 2} ${meEnd.y})`}>
        <circle r="6" fill="#3182F6" opacity="0.22" className="animate-ping-slow" />
        <circle cx="0" cy="-1" r="3" fill="#3182F6" stroke="#fff" strokeWidth="0.8" />
        {/* tiny face */}
        <circle cx="-1" cy="-1.4" r="0.4" fill="#fff" />
        <circle cx="1" cy="-1.4" r="0.4" fill="#fff" />
        <path d="M-1 0 Q 0 0.6 1 0" stroke="#fff" strokeWidth="0.4" fill="none" strokeLinecap="round" />
        {/* +score */}
        <g transform="translate(-12 6)">
          <rect x="-1" y="-3" width="14" height="6" rx="3" fill="#3182F6" />
          <text x="6" y="1.2" fontSize="4.5" fill="#fff" textAnchor="middle" fontWeight="900">+18%</text>
        </g>
      </g>

      {/* END MARKER: 로봇 머리 (AI) — 우승 트로피 표시 */}
      <g transform={`translate(${aiEnd.x - 2} ${aiEnd.y})`}>
        <circle r="6" fill="#F04452" opacity="0.22" className="animate-ping-slow" />
        {/* robot head box */}
        <rect x="-3.5" y="-4" width="7" height="6.5" rx="1.4" fill="#F04452" stroke="#fff" strokeWidth="0.8" />
        {/* antenna */}
        <line x1="0" y1="-4" x2="0" y2="-6.5" stroke="#fff" strokeWidth="0.6" />
        <circle cx="0" cy="-7" r="0.7" fill="#fbbf24" className="animate-pulse" />
        {/* eyes */}
        <rect x="-2.2" y="-2.5" width="1.2" height="1.2" fill="#fff" />
        <rect x="1" y="-2.5" width="1.2" height="1.2" fill="#fff" />
        {/* mouth */}
        <line x1="-1.5" y1="0.8" x2="1.5" y2="0.8" stroke="#fff" strokeWidth="0.4" />
        {/* +score with crown */}
        <g transform="translate(-10 -10)">
          <text x="3" y="2" fontSize="5">👑</text>
        </g>
        <g transform="translate(-12 6)">
          <rect x="-1" y="-3" width="14" height="6" rx="3" fill="#F04452" />
          <text x="6" y="1.2" fontSize="4.5" fill="#fff" textAnchor="middle" fontWeight="900">+62%</text>
        </g>
      </g>

      {/* finish line */}
      <line x1={W - padX - 1} y1={padTop} x2={W - padX - 1} y2={H - padBot} stroke="#fbbf24" strokeWidth="0.6" strokeDasharray="1.5 1.5" opacity="0.8" />
      <text x={W - padX - 3} y={padTop + 4} fontSize="4" fill="#fbbf24" textAnchor="end" fontWeight="900">FINISH</text>
    </svg>
  )
}

// ─── 2) 핫종목 1년 — 캘린더 + 불꽃 + 종목 티커 ──────────────────────────────

function HotStocksSvg() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      <defs>
        <linearGradient id="hs-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#0f0f17" />
        </linearGradient>
        <linearGradient id="hs-chip" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>
        <radialGradient id="hs-brain" cx="0.5" cy="0.5">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#5b21b6" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} rx="8" fill="url(#hs-bg)" />

      {/* circuit grid background */}
      <g opacity="0.18" stroke="#06b6d4" strokeWidth="0.4" fill="none">
        <path d="M0 20 H 30 V 40 H 60 V 25 H 90 V 50 H 120" />
        <path d="M0 60 H 25 V 75 H 70 V 55 H 100 V 70 H 120" />
        <circle cx="30" cy="20" r="1" fill="#06b6d4" />
        <circle cx="60" cy="40" r="1" fill="#06b6d4" />
        <circle cx="90" cy="25" r="1" fill="#06b6d4" />
        <circle cx="70" cy="55" r="1" fill="#06b6d4" />
      </g>

      {/* LEFT — AI memory chip (반도체) */}
      <g transform="translate(14 18)">
        {/* chip pins */}
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x="-4" y={3 + i * 6} width="4" height="2" fill="#94a3b8" />
            <rect x="22" y={3 + i * 6} width="4" height="2" fill="#94a3b8" />
            <rect x={3 + i * 5} y="-3" width="2" height="3" fill="#94a3b8" />
            <rect x={3 + i * 5} y="22" width="2" height="3" fill="#94a3b8" />
          </g>
        ))}
        <rect x="0" y="0" width="22" height="22" rx="2" fill="url(#hs-chip)" stroke="#0e7490" strokeWidth="0.6" />
        {/* etched AI letters */}
        <text x="11" y="14" fontSize="9" fill="#a5f3fc" textAnchor="middle" fontWeight="900" fontFamily="monospace">AI</text>
        {/* pulse ring */}
        <circle cx="11" cy="11" r="13" fill="none" stroke="#06b6d4" strokeWidth="0.6" opacity="0.5" className="animate-pulse" />
        <text x="11" y="34" fontSize="5" fill="#67e8f9" textAnchor="middle" fontWeight="900">반도체</text>
      </g>

      {/* CENTER — robot head (로봇) */}
      <g transform="translate(60 22)">
        {/* antenna */}
        <line x1="0" y1="-2" x2="0" y2="-7" stroke="#94a3b8" strokeWidth="1" />
        <circle cx="0" cy="-8" r="1.5" fill="#fbbf24" className="animate-pulse" />
        {/* head */}
        <rect x="-9" y="-2" width="18" height="16" rx="3" fill="#475569" stroke="#94a3b8" strokeWidth="0.8" />
        {/* visor */}
        <rect x="-7" y="1" width="14" height="6" rx="1.5" fill="#0f172a" />
        {/* eyes */}
        <circle cx="-3" cy="4" r="1.5" fill="#10B981" className="animate-pulse" />
        <circle cx="3" cy="4" r="1.5" fill="#10B981" className="animate-pulse" />
        {/* mouth grid */}
        <line x1="-4" y1="10" x2="4" y2="10" stroke="#94a3b8" strokeWidth="0.6" />
        <line x1="-2" y1="9" x2="-2" y2="11" stroke="#94a3b8" strokeWidth="0.6" />
        <line x1="0" y1="9" x2="0" y2="11" stroke="#94a3b8" strokeWidth="0.6" />
        <line x1="2" y1="9" x2="2" y2="11" stroke="#94a3b8" strokeWidth="0.6" />
        {/* neck */}
        <rect x="-3" y="14" width="6" height="3" fill="#334155" />
        <text x="0" y="24" fontSize="5" fill="#cbd5e1" textAnchor="middle" fontWeight="900">로봇</text>
      </g>

      {/* RIGHT — AI brain (생성형 AI) */}
      <g transform="translate(102 22)">
        <circle r="11" fill="url(#hs-brain)" />
        {/* brain folds */}
        <path d="M-7 -2 Q -3 -8 0 -4 Q 3 -8 7 -2" stroke="#e9d5ff" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        <path d="M-7 2 Q -3 -2 0 1 Q 3 -2 7 2" stroke="#e9d5ff" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        <path d="M-6 6 Q -2 3 1 5 Q 4 3 6 6" stroke="#e9d5ff" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        {/* synapse pulses */}
        <circle cx="-4" cy="-4" r="1" fill="#fbbf24" className="animate-pulse" />
        <circle cx="5" cy="3" r="0.8" fill="#fbbf24" className="animate-pulse" />
        <text x="0" y="24" fontSize="5" fill="#e9d5ff" textAnchor="middle" fontWeight="900">생성AI</text>
      </g>

      {/* bottom ticker pills */}
      <g fontSize="5" fontWeight="900">
        <rect x="6" y="62" width="34" height="11" rx="3" fill="#10B981" />
        <text x="23" y="69.5" fill="#022c22" textAnchor="middle">에코프로 +312%</text>

        <rect x="44" y="62" width="28" height="11" rx="3" fill="#F04452" />
        <text x="58" y="69.5" fill="#450a0a" textAnchor="middle">SK하이닉스</text>

        <rect x="76" y="62" width="38" height="11" rx="3" fill="#fbbf24" />
        <text x="95" y="69.5" fill="#78350f" textAnchor="middle">레인보우로보틱스</text>
      </g>

      {/* HOT badge top right */}
      <g transform="translate(108 10)">
        <rect x="-12" y="-5" width="14" height="9" rx="4.5" fill="#F04452" />
        <text x="-5" y="1.5" fontSize="5.5" fill="#fff" textAnchor="middle" fontWeight="900">🔥HOT</text>
      </g>
      <text x="6" y="11" fontSize="5" fill="#94a3b8" fontWeight="900" letterSpacing="1">1Y · TRENDING</text>
    </svg>
  )
}

// ─── 3) 큰돈 멘탈 — 1000만 vs 5억, 명상하는 사람 ─────────────────────────────

function BigMoneyMindSvg() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      <defs>
        <linearGradient id="bm-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a0f00" />
          <stop offset="100%" stopColor="#0f0f17" />
        </linearGradient>
        <linearGradient id="gold-bar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="45%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
        <radialGradient id="gold-glow" cx="0.5" cy="0.5">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="heart-pulse" cx="0.5" cy="0.5">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} rx="8" fill="url(#bm-bg)" />

      {/* LEFT — 1000만: 작고 평범한 금화 1개 */}
      <g transform="translate(14 56)">
        <ellipse cx="0" cy="3" rx="7" ry="1.5" fill="#000" opacity="0.45" />
        <circle cx="0" cy="0" r="5.5" fill="url(#gold-bar)" stroke="#92400e" strokeWidth="0.6" />
        <text x="0" y="2" fontSize="6" fill="#78350f" textAnchor="middle" fontWeight="900">₩</text>
        <text x="0" y="14" fontSize="5.5" fill="#94a3b8" textAnchor="middle" fontWeight="900">1,000만</text>
      </g>

      {/* RIGHT — 5억: 거대한 금괴 피라미드 + 후광 */}
      <g transform="translate(88 24)">
        {/* glowing halo (much larger) */}
        <circle cx="14" cy="22" r="26" fill="url(#gold-glow)" />
        {/* sparkle stars */}
        <g fill="#fde68a">
          <path d="M-2 -2 L -1 0 L 1 1 L -1 2 L -2 4 L -3 2 L -5 1 L -3 0 Z" opacity="0.9" className="animate-pulse" />
          <path d="M30 0 L 30.6 1 L 32 1.5 L 30.6 2 L 30 3.2 L 29.4 2 L 28 1.5 L 29.4 1 Z" opacity="0.8" />
          <circle cx="6" cy="-3" r="0.7" />
          <circle cx="26" cy="10" r="0.6" />
        </g>

        {/* base row — 4 bars */}
        {[0, 1, 2, 3].map((i) => (
          <g key={`b-${i}`}>
            <rect x={i * 7} y="36" width="6.5" height="6" rx="0.6" fill="url(#gold-bar)" stroke="#78350f" strokeWidth="0.4" />
          </g>
        ))}
        {/* row 2 — 3 bars */}
        {[0, 1, 2].map((i) => (
          <g key={`r2-${i}`}>
            <rect x={3.5 + i * 7} y="30" width="6.5" height="6" rx="0.6" fill="url(#gold-bar)" stroke="#78350f" strokeWidth="0.4" />
          </g>
        ))}
        {/* row 3 — 2 bars */}
        {[0, 1].map((i) => (
          <g key={`r3-${i}`}>
            <rect x={7 + i * 7} y="24" width="6.5" height="6" rx="0.6" fill="url(#gold-bar)" stroke="#78350f" strokeWidth="0.4" />
          </g>
        ))}
        {/* top — 1 bar */}
        <rect x="10.5" y="18" width="6.5" height="6" rx="0.6" fill="url(#gold-bar)" stroke="#78350f" strokeWidth="0.4" />
        {/* shine highlight */}
        <rect x="11" y="19" width="2" height="3" fill="#fef9c3" opacity="0.8" />

        {/* coins spilled at base */}
        <circle cx="-2" cy="44" r="2.5" fill="url(#gold-bar)" stroke="#78350f" strokeWidth="0.4" />
        <circle cx="32" cy="44" r="2.5" fill="url(#gold-bar)" stroke="#78350f" strokeWidth="0.4" />

        {/* big amount label */}
        <rect x="-1" y="49" width="32" height="11" rx="3" fill="#fbbf24" />
        <text x="15" y="56.5" fontSize="7" fill="#78350f" textAnchor="middle" fontWeight="900">5억</text>

        {/* x50 multiplier badge */}
        <g transform="translate(28 4)">
          <rect x="-7" y="-5" width="14" height="9" rx="4.5" fill="#F04452" />
          <text x="0" y="1.5" fontSize="6" fill="#fff" textAnchor="middle" fontWeight="900">×50</text>
        </g>
      </g>

      {/* CENTER — 흔들리지 않는 감정: 안정된 하트 + EKG 라인 */}
      <g transform="translate(60 38)">
        {/* aura */}
        <circle r="16" fill="url(#heart-pulse)" />
        <circle r="11" fill="none" stroke="#06b6d4" strokeWidth="0.6" opacity="0.4" className="animate-pulse" />

        {/* steady heart shape */}
        <path
          d="M0 6 C -8 0 -8 -8 -4 -8 C -2 -8 0 -6 0 -4 C 0 -6 2 -8 4 -8 C 8 -8 8 0 0 6 Z"
          fill="#06b6d4"
          stroke="#67e8f9"
          strokeWidth="0.8"
        />
        {/* steady pulse EKG line going through */}
        <path
          d="M-14 -1 L -8 -1 L -6 -1 L -4 -4 L -2 2 L 0 -1 L 14 -1"
          fill="none"
          stroke="#fff"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* zen label */}
        <text x="0" y="20" fontSize="5" fill="#67e8f9" textAnchor="middle" fontWeight="900">평정심</text>
      </g>

      {/* deflected emotion arrows (탐욕/공포 → 차단됨) */}
      <g fontSize="6" fontWeight="900">
        {/* greed from gold */}
        <text x="78" y="20" fill="#F04452" opacity="0.85">😱</text>
        <path d="M78 22 Q 70 28 68 32" stroke="#F04452" strokeWidth="0.8" fill="none" strokeDasharray="1.5 1.5" opacity="0.6" />
        {/* fear from small money */}
        <text x="34" y="34" fill="#fbbf24" opacity="0.85">🤑</text>
        <path d="M40 34 Q 48 36 52 38" stroke="#fbbf24" strokeWidth="0.8" fill="none" strokeDasharray="1.5 1.5" opacity="0.6" />
      </g>

      {/* "BLOCKED" indicator on shield ring around heart */}
      <circle cx="60" cy="38" r="14" fill="none" stroke="#06b6d4" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.6" />
    </svg>
  )
}

// ─── 4) 하루 3번 카드 판단 — 즉시 피드백 ─────────────────────────────────────

function DailyCardsSvg() {
  // intraday price path with 3 decision points
  const color = "#10B981"
  // raw price data (24 ticks)
  const data = [42, 40, 38, 36, 34, 33, 32, 34, 38, 44, 50, 54, 58, 62, 60, 64, 70, 74, 76, 80, 82, 85, 86, 84]
  const padX = 8
  const padTop = 18
  const padBot = 16
  const innerW = W - padX * 2
  const innerH = H - padTop - padBot
  const stepX = innerW / (data.length - 1)
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => ({
    x: padX + i * stepX,
    y: padTop + innerH - ((v - min) / range) * innerH,
  }))

  // smooth path
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1]
    const cur = pts[i]
    const cp1x = prev.x + (cur.x - prev.x) * 0.45
    const cp2x = cur.x - (cur.x - prev.x) * 0.45
    d += ` C ${cp1x} ${prev.y}, ${cp2x} ${cur.y}, ${cur.x} ${cur.y}`
  }
  const areaD = `${d} L ${pts[pts.length - 1].x} ${H - padBot} L ${pts[0].x} ${H - padBot} Z`

  // decision points: ▲ 매수 (low/dip), ● 관망 (mid), ▼ 매도 (peak)
  const buyIdx = 6
  const holdIdx = 12
  const sellIdx = 21

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      <defs>
        <linearGradient id="dc-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a1f1a" />
          <stop offset="100%" stopColor="#0f0f17" />
        </linearGradient>
        <linearGradient id="dc-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} rx="8" fill="url(#dc-bg)" />

      {/* dotted grids */}
      {[0.33, 0.66].map((p) => (
        <line
          key={p}
          x1={padX}
          y1={padTop + innerH * p}
          x2={W - padX}
          y2={padTop + innerH * p}
          stroke="#ffffff"
          strokeOpacity="0.06"
          strokeDasharray="1.5 3"
        />
      ))}

      {/* time markers — 아침 / 점심 / 저녁 */}
      {[buyIdx, holdIdx, sellIdx].map((idx) => (
        <line
          key={idx}
          x1={pts[idx].x}
          y1={padTop}
          x2={pts[idx].x}
          y2={H - padBot}
          stroke="#ffffff"
          strokeOpacity="0.12"
          strokeDasharray="2 2"
        />
      ))}

      {/* area + line */}
      <path d={areaD} fill="url(#dc-area)" />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* HEADER: ☀ DAY · 3 decisions */}
      <g transform="translate(8 10)">
        <circle r="2.6" fill="#fbbf24" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const a = (i * Math.PI) / 4
          return (
            <line
              key={i}
              x1={Math.cos(a) * 4}
              y1={Math.sin(a) * 4}
              x2={Math.cos(a) * 5.5}
              y2={Math.sin(a) * 5.5}
              stroke="#fbbf24"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
          )
        })}
      </g>
      <text x="18" y="12" fontSize="6" fill="#fbbf24" fontWeight="900">DAY · 3 DECISIONS</text>

      {/* decision 1: 매수 ▲ at dip → ✓ */}
      <g>
        <circle cx={pts[buyIdx].x} cy={pts[buyIdx].y} r="6" fill="#10B981" opacity="0.22" className="animate-ping-slow" />
        <circle cx={pts[buyIdx].x} cy={pts[buyIdx].y} r="3.2" fill="#10B981" stroke="#fff" strokeWidth="1.2" />
        <text x={pts[buyIdx].x} y={pts[buyIdx].y + 1.5} fontSize="4.5" fill="#fff" textAnchor="middle" fontWeight="900">▲</text>
        {/* badge */}
        <g transform={`translate(${pts[buyIdx].x} ${pts[buyIdx].y + 12})`}>
          <rect x="-9" y="-4" width="18" height="7" rx="3.5" fill="#10B981" />
          <text x="0" y="1.2" fontSize="4.5" fill="#022c22" textAnchor="middle" fontWeight="900">매수 ✓</text>
        </g>
      </g>

      {/* decision 2: 관망 ● at mid */}
      <g>
        <circle cx={pts[holdIdx].x} cy={pts[holdIdx].y} r="3" fill="#94a3b8" stroke="#fff" strokeWidth="1.2" />
        <g transform={`translate(${pts[holdIdx].x} ${pts[holdIdx].y - 10})`}>
          <rect x="-9" y="-4" width="18" height="7" rx="3.5" fill="#475569" />
          <text x="0" y="1.2" fontSize="4.5" fill="#cbd5e1" textAnchor="middle" fontWeight="900">관망 ●</text>
        </g>
      </g>

      {/* decision 3: 매도 ▼ at peak → ✓ */}
      <g>
        <circle cx={pts[sellIdx].x} cy={pts[sellIdx].y} r="6" fill="#F04452" opacity="0.22" className="animate-ping-slow" />
        <circle cx={pts[sellIdx].x} cy={pts[sellIdx].y} r="3.2" fill="#F04452" stroke="#fff" strokeWidth="1.2" />
        <text x={pts[sellIdx].x} y={pts[sellIdx].y + 1.5} fontSize="4.5" fill="#fff" textAnchor="middle" fontWeight="900">▼</text>
        <g transform={`translate(${pts[sellIdx].x - 4} ${pts[sellIdx].y - 10})`}>
          <rect x="-9" y="-4" width="18" height="7" rx="3.5" fill="#F04452" />
          <text x="0" y="1.2" fontSize="4.5" fill="#fff" textAnchor="middle" fontWeight="900">매도 ✓</text>
        </g>
      </g>

      {/* x-axis time labels */}
      <text x={pts[buyIdx].x} y={H - 3} fontSize="4.5" fill="#94a3b8" textAnchor="middle" fontWeight="700">아침</text>
      <text x={pts[holdIdx].x} y={H - 3} fontSize="4.5" fill="#94a3b8" textAnchor="middle" fontWeight="700">점심</text>
      <text x={pts[sellIdx].x} y={H - 3} fontSize="4.5" fill="#94a3b8" textAnchor="middle" fontWeight="700">저녁</text>

      {/* total result chip */}
      <g transform="translate(108 11)">
        <rect x="-22" y="-5" width="22" height="9" rx="4.5" fill="#fbbf24" />
        <text x="-11" y="1.5" fontSize="6" fill="#78350f" textAnchor="middle" fontWeight="900">+12%</text>
      </g>
    </svg>
  )
}

// ─── Card Data ────────────────────────────────────────────────────────────────

const CARDS = [
  {
    Svg: AiBattleSvg,
    color: "#3182F6",
    badge: "01",
    title: "닮은꼴 AI와 대결",
    action: "내 패턴 AI가 짚어줘",
  },
  {
    Svg: HotStocksSvg,
    color: "#F04452",
    badge: "02",
    title: "올해 핫종목 시뮬레이션",
    action: "1년 내 진짜 종목으로",
  },
  {
    Svg: BigMoneyMindSvg,
    color: "#fbbf24",
    badge: "03",
    title: "5억에도 평정심",
    action: "돈 크기에 안 흔들리기",
  },
  {
    Svg: DailyCardsSvg,
    color: "#10B981",
    badge: "04",
    title: "하루 3번 즉답 카드",
    action: "골라→ 바로 결과 피드백",
  },
]

export default function WhySimulation() {
  return (
    <div className="mx-5">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h3 className="text-[11px] font-black text-yellow-400 tracking-[0.2em] uppercase">
            ▸ Why Play
          </h3>
          <p className="text-base font-black text-white mt-0.5">실전 전, 4단계 시뮬레이션</p>
        </div>
        <span className="text-[10px] text-gray-500 font-bold">4 STAGES</span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {CARDS.map((c, i) => {
          const Svg = c.Svg
          return (
            <div
              key={c.title}
              className="relative overflow-hidden bg-[#1e1e2e] rounded-2xl border border-white/8 p-3 active:scale-[0.97] hover:scale-[1.02] transition-transform animate-slideUp"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="relative flex items-center justify-between mb-2">
                <span
                  className="text-[9px] font-black tracking-widest"
                  style={{ color: c.color }}
                >
                  STAGE {c.badge}
                </span>
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: c.color }}
                />
              </div>

              <div className="relative w-full aspect-[3/2] mb-2.5 rounded-lg overflow-hidden">
                <Svg />
              </div>

              <h4 className="relative text-[12px] font-black text-white leading-tight mb-0.5">
                {c.title}
              </h4>
              <p className="relative text-[10px] text-gray-400 font-medium leading-tight">
                {c.action}
              </p>
            </div>
          )
        })}
      </div>

      <div className="mt-3 text-center">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-500 font-bold">
          <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
          지금 바로 시작 가능
        </span>
      </div>
    </div>
  )
}
