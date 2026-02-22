// ─── 색상 매핑 ───────────────────────────────────────────
export const ACCENT_COLORS: Record<string, {
  textClass: string
  glowClass: string
  stroke: string
  fill: string
}> = {
  green: {
    textClass: "text-green-400",
    glowClass: "bg-green-500/10",
    stroke: "#22c55e",
    fill: "rgba(34,197,94,0.15)",
  },
  yellow: {
    textClass: "text-yellow-400",
    glowClass: "bg-yellow-500/8",
    stroke: "#eab308",
    fill: "rgba(234,179,8,0.12)",
  },
  cyan: {
    textClass: "text-cyan-400",
    glowClass: "bg-cyan-500/8",
    stroke: "#06b6d4",
    fill: "rgba(6,182,212,0.12)",
  },
  indigo: {
    textClass: "text-indigo-400",
    glowClass: "bg-indigo-500/8",
    stroke: "#6366f1",
    fill: "rgba(99,102,241,0.12)",
  },
}

// ─── 미니 차트 경로 (슬라이드별) ─────────────────────────────
export const CHART_PATHS = [
  "M0,70 L30,65 60,58 90,62 120,50 150,40 180,35 210,42 240,30 270,22 300,18",
  "M0,30 L30,28 60,25 90,22 120,45 150,70 180,60 210,50 240,55 270,40 300,35",
  "M0,65 L30,60 60,50 90,55 120,40 150,35 180,45 210,30 240,20 270,25 300,15",
  "M0,50 L30,45 60,55 90,40 120,35 150,50 180,30 210,25 240,35 270,20 300,10",
]

// ─── 프리뷰 카드 색상 매핑 (choices 용) ──────────────────────
export const CHOICE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  green:  { bg: "bg-green-500/20",  border: "border-green-500/40",  text: "text-green-400" },
  red:    { bg: "bg-red-500/20",    border: "border-red-500/30",    text: "text-red-400" },
  yellow: { bg: "bg-yellow-500/20", border: "border-yellow-500/30", text: "text-yellow-400" },
  blue:   { bg: "bg-blue-500/20",   border: "border-blue-500/30",   text: "text-blue-400" },
  white:  { bg: "bg-white/5",       border: "border-white/10",      text: "text-gray-400" },
}

// ─── 라벨 ────────────────────────────────────────────────
export const LABELS = {
  skip: "건너뛰기",
  next: "다음",
  start: "시작하기",
  free: "100% 무료 · 회원가입 없이 바로 시작",
} as const

// ─── 스와이프 설정 ──────────────────────────────────────────
export const SWIPE_THRESHOLD = 75
export const REDIRECT_PATH = "/analysis-intro"
