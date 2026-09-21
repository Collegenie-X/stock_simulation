import { useEffect, useRef, useState } from "react"
import { storage } from "@/lib/storage"
import { getLifeCharacter, settleSeason, type SeasonOutcome } from "../config"

interface UseSeasonSettlementArgs {
  /** 최종 결과 화면이 떴을 때 true */
  finished: boolean
  isLifeSeason: boolean
  scenarioId: string
  totalValue: number
  initialValue: number
  days: number
}

/**
 * 계절 정산 — 한 판이 끝나는 순간 딱 한 번, 결과를 캐릭터의 삶에 반영한다.
 * 캐릭터의 돈으로 시작한 판(lifeSeason)만 반영하고, 연습 판은 건드리지 않는다.
 */
export function useSeasonSettlement({ finished, isLifeSeason, scenarioId, totalValue, initialValue, days }: UseSeasonSettlementArgs) {
  const [outcome, setOutcome] = useState<SeasonOutcome | null>(null)
  const settled = useRef(false)

  useEffect(() => {
    if (!finished || !isLifeSeason || settled.current) return
    const life = storage.getLife()
    const character = getLifeCharacter(life?.characterId)
    // 시작 금액이 캐릭터의 돈과 다르면 다른 경로로 들어온 판이다
    if (!life || !character || life.assets !== initialValue) return

    settled.current = true
    const result = settleSeason(life, character, {
      totalValue,
      initialValue,
      days,
      trades: storage.getTradeHistory(scenarioId),
    })
    storage.setLife(result.life)
    // 같은 판이 다시 정산되지 않도록 표시를 내린다
    storage.setGameSettings({ lifeSeason: false })
    setOutcome(result.outcome)
  }, [finished, isLifeSeason, scenarioId, totalValue, initialValue, days])

  return outcome
}
