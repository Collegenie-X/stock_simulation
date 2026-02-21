'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MobileHeader } from '@/components/mobile-header';
import {
  LEGENDARY_SCENARIOS,
  DIFFICULTY_CONFIG,
  INVESTOR_DNA_MAP,
  getPersonalityFromCharacter,
  getMatchedAI,
  getAIPersonality,
  type LegendaryScenario,
  type InvestorPersonality,
} from '@/data/legendary-scenarios';
import { getScenarioStockType } from '@/data/scenario-stock-types';
import { storage } from '@/lib/storage';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  Play,
  Swords,
  Zap,
  Shield,
  Clock,
  Target,
  Sparkles,
  BarChart3,
  GraduationCap,
} from 'lucide-react';
import { StrategyCard } from './components/StrategyCard';
import { ScenarioPriceChart } from './components/ScenarioPriceChart';

// ── 공통 섹션 헤더 (접기/펼치기) ──────────────────────────────────
function CollapsibleSection({
  title,
  icon,
  iconColor = 'text-gray-400',
  children,
  defaultOpen = false,
  badge,
}: {
  title: string;
  icon: React.ReactNode;
  iconColor?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="mt-5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 text-left mb-3"
      >
        <span className={iconColor}>{icon}</span>
        <h3 className="text-sm font-bold text-white flex-1">{title}</h3>
        {badge && (
          <span className="text-[10px] bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">{badge}</span>
        )}
        <ChevronDown className={cn('w-4 h-4 text-gray-500 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && children}
    </section>
  );
}

// ── 히어로 ────────────────────────────────────────────────────────
function HeroSection({ scenario, diffConfig }: { scenario: LegendaryScenario; diffConfig: any }) {
  const [open, setOpen] = useState(false);
  const stockType = getScenarioStockType(scenario.id);

  return (
    <section className={cn('mt-4 rounded-2xl text-white overflow-hidden bg-gradient-to-br', scenario.gradientFrom, scenario.gradientTo)}>
      <button className="w-full p-4 text-left" onClick={() => setOpen(!open)}>
        <div className="flex items-start gap-3">
          <div className="text-3xl shrink-0">{scenario.emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/20 border border-white/30">
                #{scenario.order} {scenario.category}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/20 border border-white/30">
                {diffConfig.label} {'⭐'.repeat(scenario.difficulty)}
              </span>
            </div>
            <h2 className="text-lg font-bold leading-tight">{scenario.title}</h2>
            <p className="text-xs opacity-70 mt-0.5">{scenario.subtitle}</p>
            {stockType && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-md border', stockType.stockTypeBg, stockType.stockTypeColor, stockType.stockTypeBorder)}>
                  {stockType.stockTypeEmoji} {stockType.stockType}
                </span>
              </div>
            )}
          </div>
          <ChevronDown className={cn('w-4 h-4 opacity-60 shrink-0 mt-1 transition-transform duration-200', open && 'rotate-180')} />
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-white/10 space-y-3">
          <p className="text-sm opacity-90 leading-relaxed mt-3">{scenario.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {scenario.tags.map((tag) => (
              <span key={tag} className="text-[10px] bg-white/15 rounded-full px-2 py-0.5">#{tag}</span>
            ))}
          </div>
          {/* 통계 인라인 */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="bg-white/10 rounded-xl p-2 text-center">
              <p className="text-base font-bold">{scenario.stats.avgClearRate}%</p>
              <p className="text-[9px] opacity-60 mt-0.5">평균 클리어율</p>
            </div>
            <div className="bg-white/10 rounded-xl p-2 text-center">
              <p className="text-base font-bold">{scenario.stats.avgSurvivalRate}%</p>
              <p className="text-[9px] opacity-60 mt-0.5">생존율</p>
            </div>
            <div className="bg-white/10 rounded-xl p-2 text-center">
              <p className="text-[10px] font-bold leading-tight">{scenario.stats.bestStrategy}</p>
              <p className="text-[9px] opacity-60 mt-0.5">최고 전략</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ── 유사 종목 섹션 ────────────────────────────────────────────────
function SimilarStocksSection({ scenarioId }: { scenarioId: string }) {
  const stockType = getScenarioStockType(scenarioId);
  if (!stockType) return null;

  return (
    <section className="mt-4">
      <div className={cn('rounded-2xl border p-4', stockType.stockTypeBg, stockType.stockTypeBorder)}>
        {/* 종목 유형 헤더 */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{stockType.stockTypeEmoji}</span>
          <div className="flex-1">
            <p className={cn('text-sm font-bold', stockType.stockTypeColor)}>{stockType.stockType}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">"{stockType.tagline}"</p>
          </div>
        </div>

        {/* 특성 포인트 */}
        <div className="space-y-1.5 mb-3">
          {stockType.characteristics.map((c, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <span className={cn('text-[10px] shrink-0 mt-0.5', stockType.stockTypeColor)}>✦</span>
              <span className="text-[10px] text-gray-300 leading-snug">{c}</span>
            </div>
          ))}
        </div>

        {/* 왜 움직이나 */}
        <div className="bg-black/20 rounded-xl p-2.5 mb-3">
          <p className="text-[10px] text-gray-400 leading-relaxed">{stockType.whyItMoves}</p>
        </div>

        {/* 유사 종목 */}
        <div>
          <p className="text-[10px] font-bold text-gray-500 mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-yellow-400" /> 같은 특성을 가진 주식들
          </p>
          <div className="grid grid-cols-3 gap-2">
            {stockType.similarStocks.map((s) => (
              <div key={s.name} className="bg-white/5 border border-white/8 rounded-xl p-2.5 text-center">
                <div className="text-xl mb-1">{s.emoji}</div>
                <p className="text-[10px] font-bold text-white">{s.name}</p>
                <p className="text-[9px] text-gray-500 mt-0.5 leading-snug">{s.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── 사고 대처 능력 (핵심) ──────────────────────────────────────────
function CrisisResponseSection({
  scenario,
  userPersonality,
}: {
  scenario: LegendaryScenario;
  userPersonality: InvestorPersonality;
}) {
  const myDNA = INVESTOR_DNA_MAP[userPersonality];
  const matchedAI = getMatchedAI(scenario.aiStrategies, userPersonality);

  const parseRate = (s: string) => parseFloat(s.replace('%', '').replace('+', ''));
  const sorted = [...scenario.aiStrategies].sort((a, b) => parseRate(b.returnRate) - parseRate(a.returnRate));
  const maxAbs = Math.max(...scenario.aiStrategies.map((ai) => Math.abs(parseRate(ai.returnRate))), 1);

  return (
    <section className="mt-5">
      <div className="flex items-center gap-2 mb-3">
        <Swords className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-bold text-white">사고 대처 능력 분석</h3>
      </div>

      {/* AI 수익률 비교 바차트 */}
      <div className="bg-[#252525] rounded-2xl p-4 border border-white/5 mb-3">
        <p className="text-[10px] font-bold text-gray-500 mb-3 flex items-center gap-1">
          <BarChart3 className="w-3 h-3" /> 성향별 최종 수익률
        </p>
        <div className="space-y-3">
          {sorted.map((ai) => {
            const rate = parseRate(ai.returnRate);
            const isPositive = rate >= 0;
            const barWidth = Math.min(Math.abs(rate) / maxAbs * 100, 100);
            const isMyType = getAIPersonality(ai.type) === userPersonality;
            return (
              <div key={ai.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{ai.emoji}</span>
                    <span className="text-xs text-white">{ai.type}</span>
                    {isMyType && <span className="text-[8px] font-bold bg-cyan-500 text-white px-1.5 py-0.5 rounded-full">나의 성향</span>}
                  </div>
                  <span className={cn('text-sm font-bold', isPositive ? 'text-green-400' : 'text-red-400')}>
                    {ai.returnRate}
                  </span>
                </div>
                <div className="h-2.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full', isPositive ? 'bg-gradient-to-r from-green-600 to-green-400' : 'bg-gradient-to-r from-red-600 to-red-400', isMyType && 'ring-1 ring-cyan-400/50')}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {/* 인사이트 */}
        <div className="mt-3 pt-3 border-t border-white/5 bg-yellow-500/8 rounded-xl p-2.5 -mx-0.5">
          <p className="text-[10px] text-yellow-300 leading-relaxed">
            💡 {sorted[0].type}({sorted[0].returnRate})이 가장 높은 수익. 성향에 따라 결과가 크게 달라져요!
          </p>
        </div>
      </div>

      {/* 나 vs AI 매칭 */}
      {matchedAI && (
        <div className="bg-[#1a1a2e] rounded-2xl p-4 border border-cyan-500/20">
          <p className="text-[10px] font-bold text-cyan-400 mb-3">
            {myDNA.label} 성향 AI의 대처법
          </p>
          <div className="flex items-center gap-3 mb-3">
            <div className="text-center">
              <div className="w-10 h-10 bg-cyan-500/20 border border-cyan-400/40 rounded-full flex items-center justify-center text-xl mx-auto mb-1">👤</div>
              <p className="text-[9px] text-gray-400">나</p>
            </div>
            <Swords className="w-4 h-4 text-yellow-400 mx-1" />
            <div className="text-center">
              <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-xl mx-auto mb-1 bg-gradient-to-br', myDNA.bgGradient)}>
                {matchedAI.emoji}
              </div>
              <p className="text-[9px] text-gray-400">{matchedAI.name}</p>
            </div>
            <div className="flex-1 bg-white/5 rounded-xl p-2 ml-1">
              <div className="space-y-1">
                {matchedAI.actions.slice(0, 3).map((action, i) => (
                  <p key={i} className="text-[9px] text-gray-300 leading-snug">• {action}</p>
                ))}
                {matchedAI.actions.length > 3 && (
                  <p className="text-[9px] text-gray-500">+{matchedAI.actions.length - 3}개 더...</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2">
            <p className="text-[10px] text-gray-400">{matchedAI.result}</p>
            <span className={cn('text-sm font-bold', matchedAI.returnRate.startsWith('+') ? 'text-green-400' : 'text-red-400')}>
              {matchedAI.returnRate}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

// ── 이벤트 타임라인 ────────────────────────────────────────────────
function EventTimelineSection({ scenario }: { scenario: LegendaryScenario }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? scenario.events : scenario.events.slice(0, 3);

  return (
    <section className="mt-5">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 text-left mb-3">
        <Clock className="w-4 h-4 text-yellow-400" />
        <h3 className="text-sm font-bold text-white flex-1">10턴 이벤트 타임라인</h3>
        <span className="text-[10px] bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">{scenario.events.length}턴</span>
        <ChevronDown className={cn('w-4 h-4 text-gray-500 transition-transform duration-200', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="space-y-2">
          {visible.map((ev) => (
            <div
              key={ev.turn}
              className={cn(
                'flex items-start gap-3 p-3 rounded-xl border',
                ev.sentiment === 'shock' ? 'bg-red-500/10 border-red-500/20' :
                ev.sentiment === 'negative' ? 'bg-orange-500/5 border-orange-500/10' :
                ev.sentiment === 'positive' ? 'bg-green-500/5 border-green-500/10' :
                'bg-[#252525] border-white/5'
              )}
            >
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                ev.sentiment === 'shock' ? 'bg-red-500/30 text-red-300' :
                ev.sentiment === 'negative' ? 'bg-orange-500/20 text-orange-300' :
                ev.sentiment === 'positive' ? 'bg-green-500/20 text-green-300' :
                'bg-gray-600 text-gray-300'
              )}>
                {ev.turn}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-xs font-bold text-white leading-snug">{ev.title}</p>
                  <span className={cn('text-xs font-bold shrink-0 ml-2', ev.priceChange.startsWith('+') ? 'text-green-400' : 'text-red-400')}>
                    {ev.priceChange}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 leading-snug line-clamp-2">{ev.description}</p>
              </div>
            </div>
          ))}

          {scenario.events.length > 3 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full py-2 text-xs text-gray-400 flex items-center justify-center gap-1 hover:text-white transition-colors"
            >
              {expanded ? '접기 ▲' : `나머지 ${scenario.events.length - 3}턴 더 보기 ▼`}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

// ── 다른 성향에서 배우기 ────────────────────────────────────────────
function LearnFromOthers({
  scenario,
  userPersonality,
}: {
  scenario: LegendaryScenario;
  userPersonality: InvestorPersonality;
}) {
  const [open, setOpen] = useState(false);
  const myDNA = INVESTOR_DNA_MAP[userPersonality];
  const others = scenario.aiStrategies.filter(
    (ai) => getAIPersonality(ai.type) !== userPersonality
  );

  const bgColors: Record<string, string> = {
    green: 'bg-green-500/10 border-green-500/20',
    red: 'bg-red-500/10 border-red-500/20',
    blue: 'bg-blue-500/10 border-blue-500/20',
  };

  const LEARN_TEXT: Record<string, string> = {
    aggressive: '과감한 진입 타이밍과 빠른 판단력을 참고하세요',
    conservative: '손절 기준의 철저함과 인내심을 배우세요',
    balanced: '유연한 전환과 분산 투자의 지혜를 참고하세요',
  };

  return (
    <section className="mt-5">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 text-left mb-3">
        <GraduationCap className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-bold text-white flex-1">다른 성향에서 배우기</h3>
        <span className="text-[10px] bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">{others.length}가지</span>
        <ChevronDown className={cn('w-4 h-4 text-gray-500 transition-transform duration-200', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="space-y-2">
          {others.map((ai) => {
            const personality = getAIPersonality(ai.type);
            return (
              <div key={ai.name} className={cn('rounded-xl border p-3', bgColors[ai.color as keyof typeof bgColors] || 'bg-white/5 border-white/10')}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{ai.emoji}</span>
                    <div>
                      <p className="text-xs font-bold text-white">{ai.name}</p>
                      <p className="text-[9px] text-gray-500">{ai.type}</p>
                    </div>
                  </div>
                  <span className={cn('text-sm font-bold', ai.returnRate.startsWith('+') ? 'text-green-400' : 'text-red-400')}>
                    {ai.returnRate}
                  </span>
                </div>
                <div className="bg-white/5 rounded-lg p-2 space-y-1 mb-2">
                  {ai.actions.map((action, i) => (
                    <p key={i} className="text-[9px] text-gray-300">• {action}</p>
                  ))}
                </div>
                <div className="bg-white/5 rounded-lg px-2.5 py-1.5">
                  <p className="text-[9px] text-gray-500 mb-0.5">{myDNA.label} 성향인 내가 배울 점</p>
                  <p className="text-[10px] font-bold text-white">{LEARN_TEXT[personality] || LEARN_TEXT.balanced}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ── 메인 페이지 ────────────────────────────────────────────────────
export default function ScenarioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [scenario, setScenario] = useState<LegendaryScenario | null>(null);
  const [userPersonality, setUserPersonality] = useState<InvestorPersonality>('balanced');

  useEffect(() => {
    const found = LEGENDARY_SCENARIOS.find((s) => s.id === params.id);
    setScenario(found || null);
    const character = storage.getCharacter();
    if (character) setUserPersonality(getPersonalityFromCharacter(character.type));
  }, [params.id]);

  if (!scenario) {
    return (
      <div className="min-h-screen bg-[#191919] flex items-center justify-center">
        <div className="animate-pulse text-4xl">🎮</div>
      </div>
    );
  }

  const diffConfig = DIFFICULTY_CONFIG[scenario.difficulty as keyof typeof DIFFICULTY_CONFIG];

  return (
    <div className="min-h-screen bg-[#191919] pb-28">
      <MobileHeader title={scenario.title} showBack showSettings />

      <main className="pt-16 px-5 max-w-md mx-auto">
        {/* 1. 히어로 (접기/펼치기) */}
        <HeroSection scenario={scenario} diffConfig={diffConfig} />

        {/* 2. 같은 특성의 주식들 (항상 표시) */}
        <SimilarStocksSection scenarioId={scenario.id} />

        {/* 3. 대표 가격 차트 + 교훈/팁 */}
        <section className="mt-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">10턴 가격 흐름</h3>
          </div>
          <ScenarioPriceChart scenario={scenario} />

          {/* 교훈 + 팁 인라인 */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-[#252525] rounded-xl p-3 border border-yellow-500/20">
              <div className="flex items-start gap-1.5">
                <Zap className="w-3.5 h-3.5 text-yellow-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-yellow-400 mb-1">핵심 교훈</p>
                  <p className="text-[10px] text-gray-300 leading-snug">{scenario.keyLesson}</p>
                </div>
              </div>
            </div>
            <div className="bg-[#252525] rounded-xl p-3 border border-blue-500/20">
              <div className="flex items-start gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-blue-400 mb-1">생존 팁</p>
                  <p className="text-[10px] text-gray-300 leading-snug">{scenario.survivalTip}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. 사고 대처 능력 분석 */}
        <CrisisResponseSection scenario={scenario} userPersonality={userPersonality} />

        {/* 5. 10턴 이벤트 (접기/펼치기) */}
        <EventTimelineSection scenario={scenario} />

        {/* 6. 대처 전략 (기존 아코디언 카드) */}
        <CollapsibleSection
          title={`대처 전략 ${scenario.strategies.length}가지`}
          icon={<Target className="w-4 h-4" />}
          iconColor="text-green-400"
          badge={`${scenario.strategies.length}개`}
        >
          <div className="space-y-2">
            {scenario.strategies.map((strategy) => (
              <StrategyCard key={strategy.id} strategy={strategy} />
            ))}
          </div>
        </CollapsibleSection>

        {/* 7. 다른 성향에서 배우기 */}
        <LearnFromOthers scenario={scenario} userPersonality={userPersonality} />

        {/* 8. 핵심 메시지 */}
        <section className="mt-5 mb-2">
          <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl p-4">
            <p className="text-xs font-bold text-cyan-400 mb-2">💡 이것만 기억하세요!</p>
            <div className="space-y-1">
              <p className="text-xs text-gray-300">• 주식은 <span className="text-white font-bold">예상 못한 일</span>이 꼭 생겨요</p>
              <p className="text-xs text-gray-300">• <span className="text-white font-bold">나의 성격</span>에 맞는 방법을 찾는 게 중요해요</p>
              <p className="text-xs text-gray-300">• 여러 가지 대처법을 알면 <span className="text-white font-bold">더 잘 대응</span>할 수 있어요</p>
            </div>
          </div>
        </section>
      </main>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#191919] via-[#191919] to-transparent">
        <div className="max-w-md mx-auto flex gap-3">
          <button
            onClick={() => router.back()}
            className="flex-1 h-12 rounded-xl bg-[#252525] border border-white/10 text-white text-sm font-bold hover:bg-[#333] transition-colors"
          >
            목록으로
          </button>
          <button
            onClick={() => router.push(`/learn/scenarios/${scenario.id}/play`)}
            className={cn(
              'flex-[2] h-12 rounded-xl font-bold text-white flex items-center justify-center gap-2 bg-gradient-to-r',
              scenario.gradientFrom, scenario.gradientTo, 'hover:opacity-90 transition-opacity'
            )}
          >
            <Play className="w-4 h-4" />
            시나리오 플레이
          </button>
        </div>
      </div>
    </div>
  );
}
