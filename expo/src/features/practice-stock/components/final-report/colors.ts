import { palette } from "@/theme"

/** 상승=빨강 / 하락=파랑 (한국 주식 컨벤션) */
export const rateColor = (value: number) => (value >= 0 ? palette.red[400] : palette.blue[400])

export const signed = (value: number) => (value >= 0 ? "+" : "")
