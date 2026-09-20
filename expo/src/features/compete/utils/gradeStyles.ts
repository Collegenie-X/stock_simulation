import { alpha, palette } from "@/theme"

export interface GradeStyle {
  bg: string
  text: string
  border: string
}

/** 웹 GRADE_STYLES (`bg-*-500/20 text-*-300 border-*-500/40`) */
export const GRADE_STYLES: Record<string, GradeStyle> = {
  S: { bg: alpha(palette.yellow[500], 0.2), text: palette.yellow[300], border: alpha(palette.yellow[500], 0.4) },
  A: { bg: alpha(palette.green[500], 0.2), text: palette.green[300], border: alpha(palette.green[500], 0.4) },
  B: { bg: alpha(palette.blue[500], 0.2), text: palette.blue[300], border: alpha(palette.blue[500], 0.4) },
  C: { bg: alpha(palette.orange[500], 0.2), text: palette.orange[300], border: alpha(palette.orange[500], 0.4) },
  D: { bg: alpha(palette.gray[500], 0.2), text: palette.gray[400], border: alpha(palette.gray[500], 0.3) },
}

export function gradeStyle(grade: string): GradeStyle {
  return GRADE_STYLES[grade] ?? GRADE_STYLES.C
}
