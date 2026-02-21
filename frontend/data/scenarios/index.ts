/**
 * 시나리오 통합 인덱스
 * 각 분야별 시나리오 파일을 import하여 통합 제공
 */

import semiconductorData from './semiconductor.json';
import platformData from './platform.json';
import bioData from './bio.json';
import evMobilityData from './ev-mobility.json';
import aiPlatformData from './ai-platform.json';
import aiSemiconductorData from './ai-semiconductor.json';
import utilitiesData from './utilities.json';
import themeData from './theme.json';
import materialsData from './materials.json';
import financeData from './finance.json';
import defenseData from './defense.json';
import securitiesData from './securities.json';
import partsMaterialsData from './parts-materials.json';

import type { LegendaryScenario } from '../legendary-scenarios';

// 모든 시나리오를 하나의 배열로 통합
export const allScenarios: LegendaryScenario[] = [
  ...semiconductorData.scenarios,
  ...platformData.scenarios,
  ...bioData.scenarios,
  ...evMobilityData.scenarios,
  ...aiPlatformData.scenarios,
  ...aiSemiconductorData.scenarios,
  ...utilitiesData.scenarios,
  ...themeData.scenarios,
  ...materialsData.scenarios,
  ...financeData.scenarios,
  ...defenseData.scenarios,
  ...securitiesData.scenarios,
  ...partsMaterialsData.scenarios,
] as LegendaryScenario[];

// 분야별 시나리오 맵
export const scenariosByCategory = {
  반도체: semiconductorData.scenarios,
  플랫폼: platformData.scenarios,
  바이오: bioData.scenarios,
  'EV/모빌리티': evMobilityData.scenarios,
  'AI 플랫폼': aiPlatformData.scenarios,
  'AI 반도체': aiSemiconductorData.scenarios,
  '유틸리티/규제': utilitiesData.scenarios,
  테마주: themeData.scenarios,
  원자재: materialsData.scenarios,
  금융: financeData.scenarios,
  방산: defenseData.scenarios,
  증권: securitiesData.scenarios,
  소부장: partsMaterialsData.scenarios,
};

// ID로 시나리오 찾기
export function getScenarioById(id: string): LegendaryScenario | undefined {
  return allScenarios.find((s) => s.id === id);
}

// 난이도별 시나리오 필터링
export function getScenariosByDifficulty(difficulty: number): LegendaryScenario[] {
  return allScenarios.filter((s) => s.difficulty === difficulty);
}

// 카테고리별 시나리오 개수
export const scenarioCounts = {
  total: allScenarios.length,
  byCategory: Object.entries(scenariosByCategory).reduce((acc, [key, scenarios]) => {
    acc[key] = scenarios.length;
    return acc;
  }, {} as Record<string, number>),
};

export default allScenarios;
