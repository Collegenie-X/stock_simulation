import onboardingData from "./data.json"
import { alpha, palette } from "@/theme"

// 웹의 Tailwind 클래스(textClass / glowClass)를 RN 색상 값으로 대체
export const ACCENT_COLORS: Record<string, {
  textColor: string
  glowColor: string
}> = {
  green: {
    textColor: palette.green[400], // text-green-400
    glowColor: alpha(palette.green[500], 0.1), // bg-green-500/10
  },
  yellow: {
    textColor: palette.yellow[400],
    glowColor: alpha(palette.yellow[500], 0.08),
  },
  cyan: {
    textColor: palette.cyan[400],
    glowColor: alpha(palette.cyan[500], 0.08),
  },
  indigo: {
    textColor: palette.indigo[400],
    glowColor: alpha(palette.indigo[500], 0.08),
  },
}

/** 슬라이드 accent 별 테마 (글로우 · 텍스트 · CTA 버튼 그라데이션) */
export const ACCENT_THEME: Record<string, {
  text: string
  glow: string
  glow2: string
  button: readonly [string, string, ...string[]]
  buttonText: string
}> = {
  green: { text: palette.green[400], glow: palette.green[500], glow2: palette.emerald[400], button: [palette.green[400], palette.emerald[500], palette.teal[500]], buttonText: "#03140a" },
  yellow: { text: palette.yellow[400], glow: palette.amber[500], glow2: palette.orange[500], button: [palette.yellow[300], palette.amber[400], palette.orange[500]], buttonText: "#1a1000" },
  cyan: { text: palette.cyan[400], glow: palette.cyan[500], glow2: palette.blue[500], button: [palette.cyan[300], palette.sky[400], palette.blue[500]], buttonText: "#00131a" },
  indigo: { text: palette.indigo[300], glow: palette.indigo[500], glow2: palette.purple[500], button: [palette.indigo[400], palette.violet[500], palette.fuchsia[500]], buttonText: "#ffffff" },
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
  accentColor: ACCENT_COLORS[slide.accent as keyof typeof ACCENT_COLORS].textColor,
  glowColor: ACCENT_COLORS[slide.accent as keyof typeof ACCENT_COLORS].glowColor,
  badge: slide.badge,
  title: slide.title,
  desc: slide.desc,
}))
