import { useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { Sword, Trophy, Waves } from "lucide-react-native"
import { alpha, palette } from "@/theme"
import { AccordionSection, type AccordionConfig } from "./history/AccordionSection"
import { PracticeCard } from "./history/PracticeCard"
import { RankTrendChart } from "./history/RankTrendChart"
import { SimulationCard } from "./history/SimulationCard"
import type { PracticeRecord, RankTrendItem, SimulationRecord } from "./history/types"

interface HistorySectionProps {
  simulations: SimulationRecord[]
  stockPractice: PracticeRecord[]
  wavePractice: PracticeRecord[]
  rankTrend: RankTrendItem[]
  /** Expandable 안에 들어갈 때: 자체 제목을 숨김 */
  embedded?: boolean
}

type SectionKey = "simulation" | "stock" | "wave"

export function HistorySection({ simulations, stockPractice, wavePractice, rankTrend, embedded }: HistorySectionProps) {
  const [openSection, setOpenSection] = useState<SectionKey | null>("simulation")

  const toggle = (key: SectionKey) => setOpenSection((prev) => (prev === key ? null : key))

  const simTop3 = simulations.slice(0, 3)
  const stockTop3 = stockPractice.slice(0, 3)
  const waveTop3 = wavePractice.slice(0, 3)

  const sections: AccordionConfig[] = [
    {
      key: "simulation",
      icon: <Trophy size={20} color={palette.yellow[400]} />,
      title: "실전 시뮬레이션",
      subtitle: "랭킹 적용",
      count: simTop3.length,
      accentColor: alpha(palette.yellow[500], 0.15),
      borderColor: alpha(palette.yellow[500], 0.2),
      badgeText: "🏆 랭킹",
      badge: { bg: alpha(palette.yellow[500], 0.2), text: palette.yellow[300], border: alpha(palette.yellow[500], 0.3) },
    },
    {
      key: "stock",
      icon: <Sword size={20} color={palette.purple[400]} />,
      title: "한종목 연습",
      subtitle: "점수 기반",
      count: stockTop3.length,
      accentColor: alpha(palette.purple[500], 0.15),
      borderColor: alpha(palette.purple[500], 0.2),
    },
    {
      key: "wave",
      icon: <Waves size={20} color={palette.cyan[400]} />,
      title: "파도 연습",
      subtitle: "파동 분석",
      count: waveTop3.length,
      accentColor: alpha(palette.cyan[500], 0.15),
      borderColor: alpha(palette.cyan[500], 0.2),
    },
  ]

  return (
    <View style={{ marginTop: embedded ? 12 : 24 }}>
      <View style={[{ marginBottom: 12 }, embedded && { display: "none" }]}>
        <Text style={styles.kicker}>▸ HISTORY</Text>
        <Text style={styles.title}>나의 역대 기록</Text>
        <Text style={styles.subtitle}>투자 패턴 히스토리 · 클릭하면 상세 결과 확인</Text>
      </View>

      {/* 순위 추이 차트 (실전만) */}
      <RankTrendChart data={rankTrend} />

      {/* 3섹션 아코디언 */}
      <View style={{ gap: 12 }}>
        {sections.map((sec) => (
          <AccordionSection key={sec.key} config={sec} open={openSection === sec.key} onToggle={() => toggle(sec.key)}>
            {sec.key === "simulation" && simTop3.map((item) => <SimulationCard key={item.id} item={item} />)}
            {sec.key === "stock" && stockTop3.map((item) => <PracticeCard key={item.id} item={item} type="stock" />)}
            {sec.key === "wave" && waveTop3.map((item) => <PracticeCard key={item.id} item={item} type="wave" />)}
          </AccordionSection>
        ))}
      </View>

      {/* 랭킹 적용 안내 */}
      <View style={styles.notice}>
        <Trophy size={16} color={palette.yellow[500]} style={{ marginTop: 2 }} />
        <Text style={styles.noticeText}>
          <Text style={{ color: palette.yellow[400], fontWeight: "700" }}>실전 시뮬레이션</Text>만 글로벌 랭킹에 반영됩니다. 한종목 연습과 파도 연습은 점수/패턴 분석 전용입니다.
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  kicker: { fontSize: 10, fontWeight: "900", letterSpacing: 2, color: palette.cyan[400], marginBottom: 2 },
  title: { fontSize: 18, fontWeight: "900", color: "#ffffff", letterSpacing: -0.4 },
  subtitle: { fontSize: 14, color: palette.gray[400] },
  notice: {
    marginTop: 12,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: alpha("#ffffff", 0.05),
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  noticeText: { flex: 1, fontSize: 12, lineHeight: 20, color: palette.gray[400] },
})
