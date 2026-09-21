import { useEffect, useState } from "react"
import { Text, type StyleProp, type TextStyle } from "react-native"

interface CountUpProps {
  value: number
  /** 시작 신호 — true 가 되는 순간 0 에서부터 센다 */
  start?: boolean
  duration?: number
  format: (v: number) => string
  style?: StyleProp<TextStyle>
}

/** 숫자가 0 에서 목표까지 드르륵 올라간다 (결과 발표 느낌) */
export function CountUp({ value, start = true, duration = 900, format, style }: CountUpProps) {
  const [shown, setShown] = useState(0)

  useEffect(() => {
    if (!start) { setShown(0); return }
    const t0 = Date.now()
    let raf = 0
    const tick = () => {
      const p = Math.min(1, (Date.now() - t0) / duration)
      setShown(value * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, start, duration])

  return <Text style={style}>{format(shown)}</Text>
}
