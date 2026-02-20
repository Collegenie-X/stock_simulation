import scenarioData from './legendary-scenarios.json'

export type InvestorPersonality = "conservative" | "aggressive" | "balanced"

export interface AIStrategy {
  name: string
  type: "안정형" | "공격형" | "균형형"
  personality?: InvestorPersonality
  emoji: string
  color: string
  motto?: string
  actions: string[]
  result: string
  returnRate: string
  insight?: string
}

export interface SolutionStrategy {
  id: string
  title: string
  emoji: string
  description: string
  steps: string[]
  risk: "낮음" | "보통" | "높음"
  expectedReturn: string
  difficulty: number
}

export interface ScenarioEvent {
  turn: number
  title: string
  description: string
  priceChange: string
  sentiment: "positive" | "negative" | "neutral" | "shock"
}

export interface StockInfo {
  name: string
  code: string
  sector: string
  initialPrice: number
}

export interface LegendaryScenario {
  id: string
  order: number
  title: string
  subtitle: string
  emoji: string
  category: string
  difficulty: number
  difficultyLabel: string
  gradientFrom: string
  gradientTo: string
  description: string
  keyLesson: string
  survivalTip: string
  tags: string[]
  stock: StockInfo
  events: ScenarioEvent[]
  strategies: SolutionStrategy[]
  aiStrategies: AIStrategy[]
  stats: {
    avgClearRate: number
    avgSurvivalRate: number
    bestStrategy: string
  }
}

export const LEGENDARY_SCENARIOS: LegendaryScenario[] = scenarioData.scenarios as LegendaryScenario[]

export const INVESTOR_DNA_MAP: Record<InvestorPersonality, {
  label: string
  emoji: string
  color: string
  bgGradient: string
  borderColor: string
  description: string
  traits: string[]
  matchedCharacter: string
}> = scenarioData.investorDNAMap as Record<InvestorPersonality, {
  label: string
  emoji: string
  color: string
  bgGradient: string
  borderColor: string
  description: string
  traits: string[]
  matchedCharacter: string
}>

export const DIFFICULTY_CONFIG = scenarioData.difficultyConfig as {
  [key: number]: { label: string; color: string; bgColor: string; borderColor: string }
}

export const CATEGORY_COLORS: Record<string, string> = scenarioData.categoryColors

export const LEARNING_PROCESS_STEPS = scenarioData.learningProcessSteps as readonly {
  step: number
  emoji: string
  title: string
  description: string
}[]

const AI_TYPE_TO_PERSONALITY: Record<string, InvestorPersonality> = {
  "안정형": "conservative",
  "공격형": "aggressive",
  "균형형": "balanced",
}

export function getAIPersonality(aiType: string): InvestorPersonality {
  return AI_TYPE_TO_PERSONALITY[aiType] || "balanced"
}

export function getMatchedAI(
  aiStrategies: AIStrategy[],
  userPersonality: InvestorPersonality
): AIStrategy | undefined {
  return aiStrategies.find(ai => getAIPersonality(ai.type) === userPersonality)
}

export function getOtherAIs(
  aiStrategies: AIStrategy[],
  userPersonality: InvestorPersonality
): AIStrategy[] {
  return aiStrategies.filter(ai => getAIPersonality(ai.type) !== userPersonality)
}

export function getPersonalityFromCharacter(
  characterType: string | null | undefined
): InvestorPersonality {
  if (!characterType) return "balanced"
  const map: Record<string, InvestorPersonality> = {
    conservative: "conservative",
    balanced: "balanced",
    aggressive: "aggressive",
  }
  return map[characterType] || "balanced"
}
