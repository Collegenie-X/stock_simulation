import { ChartTrainingPreview } from "./ChartTrainingPreview"
import { EventScenarioPreview } from "./EventScenarioPreview"
import { RealDataPreview } from "./RealDataPreview"
import { AIBattlePreview } from "./AIBattlePreview"

export function SlidePreview({ idx, trigger }: { idx: number; trigger: number }) {
  if (idx === 0) return <ChartTrainingPreview trigger={trigger} />
  if (idx === 1) return <EventScenarioPreview trigger={trigger} />
  if (idx === 2) return <RealDataPreview trigger={trigger} />
  return <AIBattlePreview />
}
