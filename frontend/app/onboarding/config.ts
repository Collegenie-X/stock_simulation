import onboardingData from './data.json';

export const ACCENT_COLORS: Record<string, {
  textClass: string
  glowClass: string
}> = {
  green: {
    textClass: "text-green-400",
    glowClass: "bg-green-500/10",
  },
  yellow: {
    textClass: "text-yellow-400",
    glowClass: "bg-yellow-500/8",
  },
  cyan: {
    textClass: "text-cyan-400",
    glowClass: "bg-cyan-500/8",
  },
  indigo: {
    textClass: "text-indigo-400",
    glowClass: "bg-indigo-500/8",
  },
}

export const LABELS = {
  skip: "건너뛰기",
  next: "다음",
  start: "시작하기",
  free: "100% 무료 · 회원가입 없이 바로 시작",
} as const

export const SWIPE_THRESHOLD = 75
export const REDIRECT_PATH = "/analysis-intro"

export const SLIDES = onboardingData.slides.map(slide => ({
  accent: slide.accent as keyof typeof ACCENT_COLORS,
  accentClass: ACCENT_COLORS[slide.accent as keyof typeof ACCENT_COLORS].textClass,
  glowClass: ACCENT_COLORS[slide.accent as keyof typeof ACCENT_COLORS].glowClass,
  badge: slide.badge,
  title: slide.title,
  desc: slide.desc,
}))
