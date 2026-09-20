/**
 * 시뮬레이션 상세 (웹 app/profile/simulation/[id]/page.tsx 포팅)
 */
import type { ReactNode } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ArrowLeft, BarChart3, Calendar, Target, TrendingUp } from "lucide-react-native"
import { Screen, MobileNav } from "@/components/layout"
import { Button, Gradient } from "@/components/ui"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"
import competeHistory from "@/data/compete-history.json"
import { PROFILE_LABELS } from "../config"
import type { Simulation } from "../types"
import { DailyReturnBar } from "../components/DailyReturnBar"
import { TradeRow } from "../components/TradeRow"

const L = PROFILE_LABELS.simulationDetail

function StatCard({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statHead}>
        {icon}
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      {children}
    </View>
  )
}

export default function SimulationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const handleBack = () => {
    if (router.canGoBack()) router.back()
    else router.replace("/profile")
  }

  const sim = (competeHistory.simulations as unknown as Simulation[]).find((s) => s.id === id)

  if (!sim) {
    return (
      <Screen bg="#191919" scroll={false} contentStyle={styles.notFound}>
        <Text style={styles.notFoundText}>시뮬레이션을 찾을 수 없습니다.</Text>
        <Button variant="ghost" onPress={handleBack} textStyle={{ color: palette.blue[400] }}>
          돌아가기
        </Button>
      </Screen>
    )
  }

  const isProfit = sim.result === "profit"
  const accent = isProfit ? palette.red : palette.blue

  const header = (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <View style={styles.headerRow}>
        <Pressable onPress={handleBack} style={styles.backBtn} accessibilityLabel="뒤로가기" hitSlop={8}>
          <ArrowLeft size={20} color={palette.gray[400]} />
        </Pressable>
        <Text numberOfLines={1} style={styles.headerTitle}>
          {L.pageTitle}
        </Text>
        <View style={[styles.weekBadge, { backgroundColor: alpha(accent[500], 0.2) }]}>
          <Text style={[styles.weekBadgeText, { color: accent[400] }]}>{sim.weekLabel}</Text>
        </View>
      </View>
    </View>
  )

  return (
    <Screen
      bg="#191919"
      withHeader
      withNav
      fixed={
        <>
          {header}
          <MobileNav />
        </>
      }
    >
      <View style={styles.main}>
        {/* 결과 헤더 카드 */}
        <Gradient
          dir="br"
          colors={
            isProfit
              ? [alpha(palette.red[900], 0.5), alpha(palette.orange[900], 0.3)]
              : [alpha(palette.blue[900], 0.5), alpha(palette.indigo[900], 0.3)]
          }
          style={[styles.resultCard, { borderColor: alpha(accent[500], 0.2) }]}
        >
          <Text style={styles.resultArrow}>{isProfit ? "↑" : "↓"}</Text>
          <View>
            <Text style={styles.scenarioName}>{sim.scenarioName}</Text>
            <Text style={[styles.profitRate, { color: accent[400] }]}>
              {isProfit ? "+" : ""}
              {sim.profitRate}%
            </Text>
            <Text style={styles.profitDesc}>
              {formatNumber(sim.profitAmount)}원 수익 · 최종 {formatNumber(sim.finalAssets)}원
            </Text>

            {/* 하이라이트 */}
            <View style={styles.highlight}>
              <Text style={styles.highlightIcon}>✨</Text>
              <Text style={styles.highlightText}>{sim.highlight}</Text>
            </View>
          </View>
        </Gradient>

        {/* 핵심 수치 */}
        <View style={styles.statGrid}>
          <View style={styles.statRow}>
            <StatCard icon={<Target size={16} color={palette.cyan[400]} />} label={L.waveAccuracyLabel}>
              <Text style={[styles.statValue, { color: palette.cyan[400] }]}>{sim.waveAccuracy}%</Text>
            </StatCard>
            <StatCard icon={<BarChart3 size={16} color={palette.yellow[400]} />} label={L.rankLabel}>
              <Text style={[styles.statValue, { color: "#ffffff" }]}>
                {sim.rank}위<Text style={styles.statSub}> / {formatNumber(sim.totalUsers)}명</Text>
              </Text>
            </StatCard>
          </View>
          <View style={styles.statRow}>
            <StatCard icon={<TrendingUp size={16} color={palette.green[400]} />} label="수익일 / 손실일">
              <Text style={styles.statValueSm}>
                <Text style={{ color: palette.red[400] }}>{sim.winDays}일</Text>
                <Text style={{ color: palette.gray[500] }}> / </Text>
                <Text style={{ color: palette.blue[400] }}>{sim.loseDays}일</Text>
              </Text>
            </StatCard>
            <StatCard icon={<Calendar size={16} color={palette.purple[400]} />} label="상위 퍼센타일">
              <Text style={[styles.statValue, { color: palette.purple[400] }]}>상위 {(100 - sim.percentile).toFixed(1)}%</Text>
            </StatCard>
          </View>
        </View>

        {/* 종목 */}
        <View style={styles.section}>
          <Text style={styles.stocksTitle}>거래 종목</Text>
          <View style={styles.stocks}>
            {sim.stocks.map((s) => (
              <View key={s} style={styles.stockChip}>
                <Text style={styles.stockChipText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 일별 수익률 차트 */}
        <View style={styles.section}>
          <DailyReturnBar returns={sim.dailyReturns} />
        </View>

        {/* 거래 내역 */}
        <View style={styles.section}>
          <Text style={styles.tradesTitle}>{L.tradesTitle}</Text>
          <View style={styles.tradesCard}>
            {sim.trades.map((trade, i) => (
              <TradeRow key={i} trade={trade} last={i === sim.trades.length - 1} />
            ))}
          </View>
        </View>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  notFound: { alignItems: "center", justifyContent: "center", gap: 16 },
  notFoundText: { fontSize: 14, color: palette.gray[400] },

  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: "rgba(25,25,25,0.96)",
    borderBottomWidth: 1,
    borderBottomColor: alpha("#ffffff", 0.05),
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, height: 56 },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: "700", color: "#ffffff" },
  weekBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999 },
  weekBadgeText: { fontSize: 12, fontWeight: "600" },

  main: { paddingTop: 8, paddingHorizontal: 20, paddingBottom: 16 },
  section: { marginTop: 16 },

  resultCard: {
    marginTop: 16,
    borderRadius: 24,
    padding: 24,
    overflow: "hidden",
    borderWidth: 1,
    boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
  },
  resultArrow: { position: "absolute", top: 0, right: 0, fontSize: 96, lineHeight: 96, fontWeight: "700", color: "#ffffff", opacity: 0.05 },
  scenarioName: { fontSize: 14, color: palette.gray[400], marginBottom: 4 },
  profitRate: { fontSize: 36, fontWeight: "700", marginBottom: 4 },
  profitDesc: { fontSize: 14, color: palette.gray[300], marginBottom: 16 },
  highlight: { backgroundColor: alpha("#ffffff", 0.1), borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "flex-start", gap: 8 },
  highlightIcon: { fontSize: 18, color: "#ffffff" },
  highlightText: { flex: 1, fontSize: 14, fontWeight: "500", color: "#ffffff" },

  statGrid: { marginTop: 16, gap: 12 },
  statRow: { flexDirection: "row", gap: 12 },
  statCard: { flex: 1, backgroundColor: "#252525", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05) },
  statHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  statLabel: { fontSize: 12, color: palette.gray[400] },
  statValue: { fontSize: 24, fontWeight: "700" },
  statValueSm: { fontSize: 18, fontWeight: "700", color: "#ffffff" },
  statSub: { fontSize: 12, fontWeight: "400", color: palette.gray[500] },

  stocksTitle: { fontSize: 12, color: palette.gray[500], marginBottom: 8, paddingHorizontal: 4 },
  stocks: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  stockChip: { backgroundColor: "#252525", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: alpha("#ffffff", 0.05) },
  stockChipText: { fontSize: 14, fontWeight: "600", color: "#ffffff" },

  tradesTitle: { fontSize: 14, fontWeight: "600", color: palette.gray[400], marginBottom: 8 },
  tradesCard: { backgroundColor: "#252525", borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05) },
})
