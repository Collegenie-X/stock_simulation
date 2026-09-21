import { useEffect, useState } from "react"

/**
 * 차트가 한 점씩 그려졌다가, 잠깐 멈춘 뒤 처음부터 다시 그려지는 반복 카운터
 * @returns 지금 보여줄 점 개수 (start ~ total)
 */
export function useReveal(total: number, stepMs = 120, holdMs = 2000, start = 2) {
  const [k, setK] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setK((c) => c + 1), stepMs)
    return () => clearInterval(id)
  }, [stepMs])

  const cycle = total - start + Math.ceil(holdMs / stepMs)
  return Math.min(total, start + (k % cycle))
}

/** 턴 단위 값 사이를 sub 칸으로 나눠 부드럽게 (선형 보간) */
export function densify(values: number[], sub = 4) {
  const out: number[] = []
  for (let i = 0; i < values.length - 1; i++) {
    for (let s = 0; s < sub; s++) out.push(values[i] + ((values[i + 1] - values[i]) * s) / sub)
  }
  out.push(values[values.length - 1])
  return out
}
