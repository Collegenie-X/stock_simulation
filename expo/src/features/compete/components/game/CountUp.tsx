/** 숫자가 0 → 목표값으로 올라가는 텍스트 */
import { useEffect, useState } from "react"
import { Text, type StyleProp, type TextStyle } from "react-native"

interface CountUpProps {
  value: number
  decimals?: number
  duration?: number
  delay?: number
  prefix?: string
  suffix?: string
  format?: (n: number) => string
  style?: StyleProp<TextStyle>
}

export function CountUp({ value, decimals = 0, duration = 900, delay = 0, prefix = "", suffix = "", format, style }: CountUpProps) {
  const [n, setN] = useState(0)

  useEffect(() => {
    let raf = 0
    let start = 0
    const tick = (t: number) => {
      if (!start) start = t
      const p = Math.min(1, (t - start) / duration)
      setN(value * (1 - Math.pow(1 - p, 3))) // easeOutCubic
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    const timer = setTimeout(() => (raf = requestAnimationFrame(tick)), delay)
    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(raf)
    }
  }, [value, duration, delay])

  const text = format ? format(n) : n.toFixed(decimals)
  return (
    <Text style={style}>
      {prefix}
      {text}
      {suffix}
    </Text>
  )
}
