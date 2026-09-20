import { View } from "react-native"
import { MobileHeader, MobileNav, Screen } from "@/components/layout"
import historyData from "@/data/compete-history.json"
import { palette } from "@/theme"
import { COMPETE_LABELS } from "../config"
import { HeroSection } from "../components/HeroSection"
import { MyPatternSection } from "../components/MyPatternSection"
import { HistorySection } from "../components/HistorySection"
import { GapAnalysisSection } from "../components/GapAnalysisSection"
import { Expandable } from "../components/game/Expandable"
import { RaceTrack } from "../components/game/RaceTrack"
import { DnaSummary } from "../components/game/DnaSummary"
import { HistorySummary } from "../components/game/HistorySummary"

/**
 * 도전 화면 — 핵심만 먼저 보여주고(캐릭터 · 그래프 · 게이지), 상세는 펼쳐서 확인
 */
export default function CompeteScreen() {
  const { myProfile, stockPreferences, wavePatternStats, simulations, stockPractice, wavePractice, rankTrend, gapAnalysis } = historyData
  const best = rankTrend.reduce((b, r) => (r.rank < b.rank ? r : b), rankTrend[0])

  return (
    <Screen
      bg="#141420"
      withNav
      withHeader
      fixed={
        <>
          <MobileHeader title={COMPETE_LABELS.pageTitle} showSettings />
          <MobileNav />
        </>
      }
    >
      <View style={{ paddingTop: 8, paddingHorizontal: 20, paddingBottom: 16 }}>
        {/* 1. 나의 도전자 카드 — 캐릭터 · 순위 · 게이지 · 순위 추이 */}
        <HeroSection profile={myProfile} rankTrend={rankTrend} />

        {/* 2. 수익률 레이스 (갭 분석) */}
        <Expandable
          kicker="PROFIT RACE"
          title="이번 주 수익률 레이스"
          accent={palette.orange[400]}
          openLabel="갭 분석"
          summary={
            <RaceTrack
              racers={[
                { key: "best", emoji: "👑", name: gapAnalysis.bestPlayer.nickname, value: gapAnalysis.bestPlayer.profitRate, color: palette.yellow[400] },
                { key: "ai", emoji: gapAnalysis.similarAI.emoji, name: `${gapAnalysis.similarAI.name} AI`, value: gapAnalysis.similarAI.profitRate, color: palette.cyan[400] },
                { key: "me", emoji: "🏄", name: "나", value: gapAnalysis.me.profitRate, color: palette.red[400], isMe: true },
              ]}
            />
          }
        >
          <GapAnalysisSection gapAnalysis={gapAnalysis as any} embedded />
        </Expandable>

        {/* 3. 나의 투자 DNA */}
        <Expandable
          kicker="MY DNA"
          title="나의 투자 DNA"
          accent={palette.purple[400]}
          summary={<DnaSummary investmentStyle={myProfile.investmentStyle} wavePatternType={myProfile.wavePatternType} wavePatternStats={wavePatternStats} />}
        >
          <MyPatternSection
            investmentStyle={myProfile.investmentStyle}
            wavePatternType={myProfile.wavePatternType}
            wavePatternStats={wavePatternStats}
            stockPreferences={stockPreferences}
            embedded
          />
        </Expandable>

        {/* 4. 나의 역대 기록 */}
        <Expandable
          kicker="HISTORY"
          title="나의 역대 기록"
          accent={palette.yellow[400]}
          openLabel="기록 보기"
          summary={
            <HistorySummary
              simulationCount={simulations.length}
              stockCount={stockPractice.length}
              waveCount={wavePractice.length}
              bestRank={best.rank}
              bestProfit={best.profitRate}
            />
          }
        >
          <HistorySection simulations={simulations as any} stockPractice={stockPractice as any} wavePractice={wavePractice as any} rankTrend={rankTrend} embedded />
        </Expandable>
      </View>
    </Screen>
  )
}
