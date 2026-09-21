import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { StyleSheet, Text, View, type ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Screen } from "@/components/layout";
import { BounceIn, FadeUp, Float, Gradient, PressableScale, Pulse, GlowOrb } from "@/components/ui";
import { alpha, palette } from "@/theme";
import type {
  AnyQuestion,
  AssessmentMode,
  TheoryQuestion,
  ChartQuestion,
  TheoryOption,
  ChartOption,
  AbilityScores,
  PersonalityScores,
  PersonalityType,
  MoneyScores,
  HabitCounts,
} from "../types";
import {
  FEEDBACK_AUTO_ADVANCE_MS,
  RESULT_DELAY_MS,
  LABELS,
  POINTS_PER_SELECTION,
  QUICK_QUESTION_IDS,
  ASSESSMENT_MODE_CONFIG,
} from "../config";
import questionsData from "@/data/analysis-questions.json";
import { localStore } from "@/lib/storage";
import { playClickSound } from "@/lib/sound";
import QuestionHeader from "./QuestionHeader";
import TheoryCard from "./TheoryCard";
import ChartCard from "./ChartCard";
import ResultScreen from "./ResultScreen";
import { ParticleBurst, ScorePop, ScreenFlash, FeedbackTimer, ComboBurst, LevelUpRing } from "./GameEffects";

const INTRO_ITEMS = [
  { emoji: "🎭", text: "실제로 겪을 법한 장면에서 솔직하게 골라봐!", delay: 0 },
  { emoji: "💰", text: "꽁돈이 생길 때, 급한 돈이 필요할 때도 점검해!", delay: 100 },
  { emoji: "📈", text: "실전 차트를 보면서 네 반응을 체크해!", delay: 200 },
  { emoji: "🎯", text: "정답은 없어! 나를 아는 게 목표야", delay: 300 },
];

function isChartQuestion(q: AnyQuestion): q is ChartQuestion {
  return "title" in q;
}

const ALL_QUESTIONS: AnyQuestion[] = [
  ...questionsData.theory,
  ...questionsData.chart,
] as AnyQuestion[];

const INITIAL_ABILITIES: AbilityScores = {
  riskTolerance: 0,
  analysis: 0,
  emotionControl: 0,
  coping: 0,
  infoJudgment: 0,
  moneyManagement: 0,
};

const INITIAL_MONEY: MoneyScores = { separated: 0, wallet: 0, allin: 0, leverage: 0 };

const INITIAL_HABITS: HabitCounts = {
  chase: 0,
  panicSell: 0,
  earlyProfit: 0,
  averagingDown: 0,
  tailFollow: 0,
  blindWait: 0,
  breakeven: 0,
  overtrade: 0,
};

const INITIAL_PERSONALITY: PersonalityScores = {
  analyst: 0,
  challenger: 0,
  conservative: 0,
  emotional: 0,
  systematic: 0,
};

type Phase = "intro" | "quiz" | "result";

export default function AnalysisContent() {
  const searchParams = useLocalSearchParams<{ mode?: string; view?: string }>();
  const mode: AssessmentMode = searchParams.mode === "quick" ? "quick" : "detailed";
  const isReportView = searchParams.view === "report";
  const scrollRef = useRef<ScrollView>(null);
  const modeConfig = ASSESSMENT_MODE_CONFIG[mode];

  const allQuestions = useMemo(() => {
    if (mode === "quick") {
      return ALL_QUESTIONS.filter((q) => QUICK_QUESTION_IDS.includes(q.id));
    }
    return ALL_QUESTIONS;
  }, [mode]);

  const theoryCount = useMemo(
    () => allQuestions.filter((q) => !isChartQuestion(q)).length,
    [allQuestions]
  );

  const [phase, setPhase] = useState<Phase>("intro");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<PersonalityType | null>(null);
  const [feedbackInsight, setFeedbackInsight] = useState("");
  const [abilities, setAbilities] = useState<AbilityScores>(INITIAL_ABILITIES);
  const [personalityScores, setPersonalityScores] = useState<PersonalityScores>(INITIAL_PERSONALITY);
  const [moneyScores, setMoneyScores] = useState<MoneyScores>(INITIAL_MONEY);
  const [habitCounts, setHabitCounts] = useState<HabitCounts>(INITIAL_HABITS);
  const [showResult, setShowResult] = useState(false);
  const [chartTrigger, setChartTrigger] = useState(0);

  const [particleTrigger, setParticleTrigger] = useState(0);
  const [showScorePop, setShowScorePop] = useState(false);
  const [canAdvance, setCanAdvance] = useState(false);

  const [combo, setCombo] = useState(0);
  const [comboTrigger, setComboTrigger] = useState(0);
  const [lastType, setLastType] = useState<PersonalityType | null>(null);
  const [level, setLevel] = useState(1);
  const [levelUpTrigger, setLevelUpTrigger] = useState(0);

  const currentQ = allQuestions[currentIdx];
  const total = allQuestions.length;
  const isChart = currentQ ? isChartQuestion(currentQ) : false;

  // 웹의 document click → playClickSound 는 각 버튼의 onPress 에서 직접 호출한다.

  // ?view=report: localStorage에서 기존 결과 로드해 곧바로 리포트 표시
  useEffect(() => {
    if (!isReportView) return;
    try {
      const raw = localStore.getItem("compete_dna_result");
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved?.personalityScores) setPersonalityScores(saved.personalityScores);
      if (saved?.abilities) setAbilities({ ...INITIAL_ABILITIES, ...saved.abilities });
      if (saved?.moneyScores) setMoneyScores({ ...INITIAL_MONEY, ...saved.moneyScores });
      if (saved?.habitCounts) setHabitCounts({ ...INITIAL_HABITS, ...saved.habitCounts });
      setPhase("result");
      setShowResult(true);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReportView]);

  useEffect(() => {
    setChartTrigger((t) => t + 1);
    setSelected(null);
    setShowFeedback(false);
    setFeedbackType(null);
    setFeedbackInsight("");
    setShowScorePop(false);
    setCanAdvance(false);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [currentIdx]);

  const advanceToNext = useCallback(() => {
    const next = currentIdx + 1;
    if (next >= total) {
      setPhase("result");
      setTimeout(() => setShowResult(true), RESULT_DELAY_MS);
    } else {
      setCurrentIdx(next);
    }
  }, [currentIdx, total]);

  const handleSelect = useCallback(
    (index: number, option: TheoryOption | ChartOption) => {
      if (showFeedback) return;
      setSelected(index);
      setShowFeedback(true);
      setFeedbackType(option.personalityType);
      setFeedbackInsight(option.insight);

      setParticleTrigger((t) => t + 1);
      setShowScorePop(true);
      setTimeout(() => setShowScorePop(false), 2000);

      setPersonalityScores((prev) => ({
        ...prev,
        [option.personalityType]: prev[option.personalityType] + POINTS_PER_SELECTION,
      }));

      setAbilities((prev) => {
        const next = { ...prev };
        for (const [k, v] of Object.entries(option.abilities)) {
          const key = k as keyof AbilityScores;
          next[key] = (next[key] ?? 0) + (v ?? 0);
        }
        return next;
      });

      const { moneyTag, habitTag } = option;
      if (moneyTag) setMoneyScores((prev) => ({ ...prev, [moneyTag]: prev[moneyTag] + 1 }));
      if (habitTag) setHabitCounts((prev) => ({ ...prev, [habitTag]: prev[habitTag] + 1 }));

      setCombo((prev) => {
        const nextCombo = lastType === option.personalityType ? prev + 1 : 1;
        if (nextCombo >= 2) setComboTrigger((t) => t + 1);
        return nextCombo;
      });
      setLastType(option.personalityType);

      const answeredCount = currentIdx + 1;
      const newLevel = Math.floor(answeredCount / 3) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        setLevelUpTrigger((t) => t + 1);
      }

      setCanAdvance(true);
    },
    [showFeedback, lastType, currentIdx, level]
  );

  useEffect(() => {
    if (!canAdvance) return;
    const t = setTimeout(advanceToNext, FEEDBACK_AUTO_ADVANCE_MS);
    return () => clearTimeout(t);
  }, [canAdvance, advanceToNext]);

  const handleSkipFeedback = useCallback(() => {
    if (canAdvance) {
      setCanAdvance(false);
      advanceToNext();
    }
  }, [canAdvance, advanceToNext]);

  if (phase === "intro") {
    return (
      <Screen bg="#000000" contentStyle={styles.introContent}>
        <GlowOrb color={palette.indigo[600]} size={520} opacity={0.28} style={{ top: 0, alignSelf: "center" }} />

        <FadeUp style={styles.introBody}>
          <Float>
            <Text style={styles.introEmoji}>🎮</Text>
          </Float>

          <View style={styles.introTitleBox}>
            <Text style={styles.introTitle}>{LABELS.pageTitle}</Text>
            <Text style={styles.introSubtitle}>{modeConfig.subtitle}</Text>
            {mode === "quick" && (
              <View style={[styles.modeBadge, { backgroundColor: alpha(palette.emerald[500], 0.1), borderColor: alpha(palette.emerald[500], 0.3) }]}>
                <Text style={[styles.modeBadgeText, { color: palette.emerald[400] }]}>⚡ 간략 측정</Text>
              </View>
            )}
            {mode === "detailed" && (
              <View style={[styles.modeBadge, { backgroundColor: alpha(palette.purple[500], 0.1), borderColor: alpha(palette.purple[500], 0.3) }]}>
                <Text style={[styles.modeBadgeText, { color: palette.purple[400] }]}>🔬 세부 측정</Text>
              </View>
            )}
          </View>

          <View style={styles.introList}>
            {INTRO_ITEMS.map(({ emoji, text, delay }) => (
              <FadeUp key={text} delay={delay} distance={20} duration={400} style={styles.introItem}>
                <Text style={styles.introItemEmoji}>{emoji}</Text>
                <Text style={styles.introItemText}>{text}</Text>
              </FadeUp>
            ))}
          </View>

          <PressableScale
            scaleTo={0.98}
            onPress={() => {
              playClickSound();
              setPhase("quiz");
            }}
            style={styles.fullWidth}
          >
            <Gradient dir="r" colors={[palette.indigo[600], palette.purple[600]]} style={styles.startBtn}>
              <Text style={styles.startBtnText}>{LABELS.startCta}</Text>
            </Gradient>
          </PressableScale>

          <Text style={styles.introNote}>답변은 저장되지 않아. 편하게 골라!</Text>
        </FadeUp>
      </Screen>
    );
  }

  if (phase === "result") {
    return (
      <Screen bg="#000000">
        <GlowOrb color={palette.purple[600]} size={560} opacity={0.22} style={{ top: -120, alignSelf: "center" }} />
        <View style={styles.resultBody}>
          {showResult ? (
            <ResultScreen
              personalityScores={personalityScores}
              abilities={abilities}
              moneyScores={moneyScores}
              habitCounts={habitCounts}
              totalQuestions={total}
              mode={mode}
            />
          ) : (
            <View style={styles.analyzing}>
              <BounceIn>
                <Text style={styles.analyzingEmoji}>🔮</Text>
              </BounceIn>
              <Pulse>
                <Text style={styles.analyzingText}>너의 성향을 분석하는 중...</Text>
              </Pulse>
            </View>
          )}
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      bg="#000000"
      scrollRef={scrollRef}
      fixed={
        <>
          <ScreenFlash personalityType={feedbackType} trigger={particleTrigger} />
          <ParticleBurst personalityType={feedbackType} trigger={particleTrigger} />
          <ScorePop show={showScorePop} personalityType={feedbackType} />
          <ComboBurst combo={combo} trigger={comboTrigger} personalityType={feedbackType} />
          <LevelUpRing trigger={levelUpTrigger} />
        </>
      }
    >
      <View style={styles.quizBody}>
        <QuestionHeader
          current={currentIdx + 1}
          total={total}
          score={Object.values(personalityScores).reduce((a, b) => a + b, 0)}
          isChart={isChart}
          combo={combo}
          level={level}
          leadingType={
            (Object.entries(personalityScores).reduce(
              (best, [k, v]) => (v > best[1] ? [k, v] : best),
              ["", 0] as [string, number]
            )[0] || null) as PersonalityType | null
          }
        />

        {currentIdx === theoryCount && theoryCount > 0 && (
          <FadeUp style={styles.sectionDivider}>
            <Gradient dir="r" colors={["rgba(16,185,129,0)", "rgba(16,185,129,0.3)", "rgba(16,185,129,0)"]} style={styles.dividerLine} />
            <Text style={styles.dividerText}>📈 실전 차트 구간!</Text>
            <Gradient dir="r" colors={["rgba(16,185,129,0)", "rgba(16,185,129,0.3)", "rgba(16,185,129,0)"]} style={styles.dividerLine} />
          </FadeUp>
        )}

        {mode === "detailed" && !isChart && !!(currentQ as TheoryQuestion).scenarioGroup && (
          <FadeUp key={`scenario-${currentQ.id}`} style={styles.scenarioWrap}>
            <Gradient
              dir="r"
              colors={[alpha(palette.red[500], 0.1), alpha(palette.orange[500], 0.1)]}
              style={styles.scenarioBox}
            >
              <Text style={styles.scenarioIcon}>📖</Text>
              <Text style={styles.scenarioStep}>
                시나리오 {(currentQ as TheoryQuestion).scenarioStep}/{(currentQ as TheoryQuestion).scenarioTotal}
              </Text>
              <Text style={styles.scenarioSep}>|</Text>
              <Text numberOfLines={1} style={styles.scenarioTitle}>{(currentQ as TheoryQuestion).scenarioTitle}</Text>
            </Gradient>
          </FadeUp>
        )}

        {isChart ? (
          <ChartCard
            question={currentQ as ChartQuestion}
            selected={selected}
            showFeedback={showFeedback}
            feedbackType={feedbackType}
            feedbackInsight={feedbackInsight}
            trigger={chartTrigger}
            onSelect={(i, opt) => handleSelect(i, opt as ChartOption)}
          />
        ) : (
          <TheoryCard
            question={currentQ as TheoryQuestion}
            selected={selected}
            showFeedback={showFeedback}
            feedbackType={feedbackType}
            feedbackInsight={feedbackInsight}
            chartTrigger={chartTrigger}
            onSelect={(i, opt) => handleSelect(i, opt as TheoryOption)}
          />
        )}

        <FeedbackTimer
          show={showFeedback && canAdvance}
          durationMs={FEEDBACK_AUTO_ADVANCE_MS}
          personalityType={feedbackType}
          onSkip={handleSkipFeedback}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fullWidth: { width: "100%" },

  // intro
  introContent: { alignItems: "center", justifyContent: "center", paddingHorizontal: 20, paddingVertical: 48 },
  introGlow: {
    position: "absolute",
    top: "10%",
    alignSelf: "center",
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: alpha(palette.indigo[600], 0.08),
    boxShadow: `0 0 80px 40px ${alpha(palette.indigo[600], 0.08)}`,
  },
  introBody: { width: "100%", maxWidth: 384, alignItems: "center", gap: 24 },
  introEmoji: { fontSize: 72, color: "#ffffff" },
  introTitleBox: { alignItems: "center" },
  introTitle: { fontSize: 24, fontWeight: "900", color: "#ffffff", marginBottom: 8, textAlign: "center" },
  introSubtitle: { color: alpha("#ffffff", 0.45), fontSize: 14, textAlign: "center" },
  modeBadge: { marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9999, borderWidth: 1 },
  modeBadgeText: { fontSize: 11, fontWeight: "700" },
  introList: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: alpha("#ffffff", 0.04),
    borderWidth: 1,
    borderColor: alpha("#ffffff", 0.08),
    padding: 16,
    gap: 16,
  },
  introItem: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  introItemEmoji: { fontSize: 20, color: "#ffffff" },
  introItemText: { flex: 1, color: alpha("#ffffff", 0.65), fontSize: 14, lineHeight: 23 },
  startBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    boxShadow: "0 0 32px rgba(99,102,241,0.45)",
  },
  startBtnText: { color: "#ffffff", fontWeight: "900", fontSize: 16 },
  introNote: { color: alpha("#ffffff", 0.2), fontSize: 12, textAlign: "center" },

  // result
  resultGlow: {
    position: "absolute",
    top: 0,
    alignSelf: "center",
    width: 288,
    height: 288,
    borderRadius: 144,
    backgroundColor: alpha(palette.purple[600], 0.06),
    boxShadow: `0 0 80px 40px ${alpha(palette.purple[600], 0.06)}`,
  },
  resultBody: { flex: 1, width: "100%", maxWidth: 384, alignSelf: "center", paddingTop: 16 },
  analyzing: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  analyzingEmoji: { fontSize: 60, color: "#ffffff" },
  analyzingText: { color: alpha("#ffffff", 0.5), fontSize: 14 },

  // quiz
  quizBody: { width: "100%", maxWidth: 384, alignSelf: "center" },
  sectionDivider: { marginHorizontal: 16, marginVertical: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12, color: alpha(palette.emerald[400], 0.7), fontWeight: "700", paddingHorizontal: 12 },
  scenarioWrap: { marginHorizontal: 16, marginBottom: 8 },
  scenarioBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: alpha(palette.red[500], 0.2),
  },
  scenarioIcon: { fontSize: 14, color: "#ffffff" },
  scenarioStep: { fontSize: 12, fontWeight: "700", color: palette.red[300] },
  scenarioSep: { fontSize: 12, color: alpha("#ffffff", 0.4) },
  scenarioTitle: { flexShrink: 1, fontSize: 12, color: alpha("#ffffff", 0.5) },
});
