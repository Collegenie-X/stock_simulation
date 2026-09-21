import { PatternPreview } from "./PatternPreview"
import { ComparePreview } from "./ComparePreview"
import { KnowMePreview } from "./KnowMePreview"
import { StrategyGamePreview } from "./StrategyGamePreview"
import { SimulationPreview } from "./SimulationPreview"

// data.json slides 순서와 1:1 — 버릇 찾기 → 비교 → 나 알기 → 전략 8턴 게임 → 실전 시뮬레이션
const PREVIEWS = [PatternPreview, ComparePreview, KnowMePreview, StrategyGamePreview, SimulationPreview]

export function SlidePreview({ idx }: { idx: number; trigger: number }) {
  const Preview = PREVIEWS[idx] ?? SimulationPreview
  return <Preview />
}
