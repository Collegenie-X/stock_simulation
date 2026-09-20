import { useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { RefreshCw, Sparkles } from "lucide-react-native"
import { Gradient, PressableScale } from "@/components/ui"
import { formatNumber } from "@/lib/format"
import { localStore } from "@/lib/storage"
import { alpha, palette } from "@/theme"
import { COMPETE_LABELS, INVESTMENT_STYLES, WAVE_PATTERN_TYPES } from "../config"
import { WaveStatBar } from "./pattern/WaveStatBar"

interface StockPreference {
  ticker: string
  name: string
  tradeCount: number
  avgReturn: number
  favoriteReason: string
  category: string
  emoji: string
  totalProfit: number
}

interface WavePatternStats {
  wave1Capture: number
  wave3Focus: number
  wave5Exit: number
  correctionHandling: number
  avgHoldDays: number
  avgBuyTiming: string
  avgSellTiming: string
  bestWave: string
  weakPoint: string
}

interface DnaResult {
  investmentStyle: string
  wavePatternType: string
  wavePatternStats: WavePatternStats
  challengerScore: number
  primaryPersonality: string
  updatedAt: string
}

interface MyPatternSectionProps {
  investmentStyle: string
  wavePatternType: string
  wavePatternStats: WavePatternStats
  stockPreferences: StockPreference[]
  /** Expandable 안에 들어갈 때: 자체 제목을 숨김 (다시 테스트 버튼은 유지) */
  embedded?: boolean
}

const L = COMPETE_LABELS.pattern

const PERSONALITY_LABEL: Record<string, string> = {
  challenger: "도전가형 ⚡",
  analyst: "분석가형 📊",
  conservative: "안정추구형 🛡️",
  emotional: "감성투자형 🎭",
  systematic: "침착형 🧘",
}

export function MyPatternSection({ investmentStyle, wavePatternType, wavePatternStats, stockPreferences, embedded }: MyPatternSectionProps) {
  const router = useRouter()
  // localStore 는 동기 API 이므로 첫 렌더부터 최신 분석 결과를 반영 (기본값 → 실제값 깜빡임 방지)
  const [dnaResult] = useState<DnaResult | null>(() => localStore.getJSON<DnaResult>("compete_dna_result"))

  // 최신 분석 결과가 있으면 우선 적용
  const activeStyle = dnaResult?.investmentStyle ?? investmentStyle
  const activeWaveType = dnaResult?.wavePatternType ?? wavePatternType
  const activeWaveStats = dnaResult?.wavePatternStats ?? wavePatternStats

  const styleInfo = INVESTMENT_STYLES[activeStyle] ?? INVESTMENT_STYLES.aggressive
  const waveInfo = WAVE_PATTERN_TYPES[activeWaveType] ?? WAVE_PATTERN_TYPES.wave3Focus

  const isUpdated = !!dnaResult
  // 웹: toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  const updatedDate = (() => {
    if (!dnaResult?.updatedAt) return null
    const d = new Date(dnaResult.updatedAt)
    if (isNaN(d.getTime())) return null
    return `${d.getMonth() + 1}월 ${d.getDate()}일`
  })()

  return (
    <View style={{ marginTop: embedded ? 12 : 24 }}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.kicker, embedded && { display: "none" }]}>▸ MY DNA</Text>
          <View style={[styles.titleRow, embedded && { display: "none" }]}>
            <Text style={styles.title}>{L.title}</Text>
            {isUpdated && (
              <View style={styles.updatedBadge}>
                <Sparkles size={10} color={palette.green[300]} />
                <Text style={styles.updatedBadgeText}>최신 반영</Text>
              </View>
            )}
          </View>
          {isUpdated ? (
            <Text style={[styles.subtitle, { color: alpha(palette.green[400], 0.8) }]}>
              {PERSONALITY_LABEL[dnaResult!.primaryPersonality] ?? ""} · {updatedDate} 업데이트
            </Text>
          ) : (
            <Text style={styles.subtitle}>{L.subtitle}</Text>
          )}
        </View>
        <PressableScale scaleTo={0.95} onPress={() => router.push("/analysis?mode=detailed&returnTo=compete")} style={styles.retestBtn}>
          <RefreshCw size={14} color={palette.gray[300]} />
          <Text style={styles.retestText}>다시 테스트</Text>
        </PressableScale>
      </View>

      {/* 스타일 카드 */}
      <View style={styles.cardRow}>
        {/* 투자 성향 */}
        <Gradient dir="br" colors={[styleInfo.gradientFrom, styleInfo.gradientTo]} style={styles.styleCard}>
          <Text style={[styles.bgEmoji, { fontSize: 60, top: -8, right: -8 }]}>{styleInfo.emoji}</Text>
          <Text style={[styles.cardLabel, { color: alpha("#ffffff", 0.7) }]}>{L.investmentStyle}</Text>
          <Text style={styles.cardTitle}>{styleInfo.label}</Text>
          <Text style={[styles.cardDesc, { color: alpha("#ffffff", 0.7) }]}>{styleInfo.desc}</Text>
          <Text style={styles.cardEmoji}>{styleInfo.emoji}</Text>
        </Gradient>

        {/* 파도 패턴 */}
        <View style={[styles.styleCard, styles.waveCard]}>
          <Text style={[styles.bgEmoji, { fontSize: 48, top: -4, right: -4 }]}>{waveInfo.emoji}</Text>
          <Text style={[styles.cardLabel, { color: palette.gray[400] }]}>{L.wavePattern}</Text>
          <Text style={styles.cardTitle}>{waveInfo.label}</Text>
          <Text style={[styles.cardDesc, { color: palette.gray[400] }]}>{waveInfo.desc}</Text>
          <Text style={styles.cardEmoji}>{waveInfo.emoji}</Text>
        </View>
      </View>

      {/* 파도 패턴 분석 */}
      <View style={[styles.panel, { marginBottom: 12 }]}>
        <View style={styles.waveGrid}>
          <View style={styles.waveCell}>
            <Text style={styles.waveLabel}>{L.waveStats.wave1}</Text>
            <WaveStatBar label="" value={activeWaveStats.wave1Capture} color="text-cyan-400" />
          </View>
          <View style={styles.waveCell}>
            <Text style={styles.waveLabel}>{L.waveStats.wave3}</Text>
            <WaveStatBar label="" value={activeWaveStats.wave3Focus} color="text-blue-400" />
          </View>
          <View style={styles.waveCell}>
            <Text style={styles.waveLabel}>{L.waveStats.wave5}</Text>
            <WaveStatBar label="" value={activeWaveStats.wave5Exit} color="text-purple-400" />
          </View>
          <View style={styles.waveCell}>
            <Text style={styles.waveLabel}>{L.waveStats.correction}</Text>
            <WaveStatBar label="" value={activeWaveStats.correctionHandling} color="text-yellow-400" />
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCell}>
            <Text style={styles.gray12}>{L.avgHoldDays}</Text>
            <Text style={[styles.summaryValue, { color: "#ffffff" }]}>
              {activeWaveStats.avgHoldDays}
              {L.days}
            </Text>
          </View>
          <View style={styles.summaryCell}>
            <Text style={styles.gray12}>{L.bestWave}</Text>
            <Text style={[styles.summaryValue, { color: palette.cyan[400] }]}>{activeWaveStats.bestWave}</Text>
          </View>
          <View style={styles.summaryCell}>
            <Text style={styles.gray12}>{L.weakPoint}</Text>
            <Text style={[styles.summaryValue, { color: palette.orange[400], lineHeight: 18, textAlign: "center" }]}>{activeWaveStats.weakPoint}</Text>
          </View>
        </View>
      </View>

      {/* 관심 종목 TOP 5 */}
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{L.favoriteStocks}</Text>
        <View style={{ gap: 10 }}>
          {stockPreferences.map((stock, idx) => (
            <View key={stock.ticker} style={styles.stockRow}>
              <Text style={styles.stockIdx}>{idx + 1}</Text>
              <Text style={styles.stockEmoji}>{stock.emoji}</Text>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text numberOfLines={1} style={styles.stockName}>
                    {stock.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: palette.gray[500], flexShrink: 0 }}>
                    {stock.tradeCount}
                    {L.tradeCount}
                  </Text>
                </View>
                <Text numberOfLines={1} style={styles.gray12}>
                  {stock.favoriteReason}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end", flexShrink: 0 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: stock.avgReturn >= 0 ? palette.red[400] : palette.blue[400] }}>
                  {stock.avgReturn >= 0 ? "+" : ""}
                  {stock.avgReturn}%
                </Text>
                <Text style={{ fontSize: 12, color: stock.totalProfit >= 0 ? palette.gray[400] : palette.gray[500] }}>
                  {stock.totalProfit >= 0 ? "+" : ""}
                  {formatNumber(stock.totalProfit)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 8 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  kicker: { fontSize: 10, fontWeight: "900", letterSpacing: 2, color: palette.cyan[400], marginBottom: 2 },
  title: { fontSize: 18, fontWeight: "900", color: "#ffffff", letterSpacing: -0.4 },
  subtitle: { fontSize: 14, color: palette.gray[400] },
  updatedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: alpha(palette.green[500], 0.2),
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: alpha(palette.green[500], 0.3),
  },
  updatedBadgeText: { fontSize: 10, fontWeight: "700", color: palette.green[300] },
  retestBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: alpha("#ffffff", 0.05),
    borderWidth: 1,
    borderColor: alpha("#ffffff", 0.1),
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  retestText: { fontSize: 12, fontWeight: "700", color: palette.gray[300] },
  cardRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  styleCard: { flex: 1, borderRadius: 16, padding: 16, overflow: "hidden" },
  waveCard: { backgroundColor: "#252525", borderWidth: 1, borderColor: alpha("#ffffff", 0.05) },
  bgEmoji: { position: "absolute", opacity: 0.1, color: "#ffffff" },
  cardLabel: { fontSize: 12, marginBottom: 4 },
  cardTitle: { fontSize: 20, fontWeight: "900", color: "#ffffff" },
  cardDesc: { fontSize: 12, marginTop: 4 },
  cardEmoji: { fontSize: 30, marginTop: 8, color: "#ffffff" },
  panel: { backgroundColor: "#252525", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05) },
  waveGrid: { flexDirection: "row", flexWrap: "wrap", columnGap: 16, rowGap: 16, marginBottom: 16 },
  waveCell: { flexBasis: "45%", flexGrow: 1 },
  waveLabel: { fontSize: 12, color: palette.gray[400], marginBottom: 2 },
  summaryRow: { flexDirection: "row", gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: alpha("#ffffff", 0.05) },
  summaryCell: { flex: 1, alignItems: "center" },
  summaryValue: { fontSize: 14, fontWeight: "700" },
  gray12: { fontSize: 12, color: palette.gray[400] },
  panelTitle: { fontSize: 14, fontWeight: "700", color: "#ffffff", marginBottom: 12 },
  stockRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 5 },
  stockIdx: { fontSize: 12, color: palette.gray[500], width: 16 },
  stockEmoji: { fontSize: 20, width: 28, color: "#ffffff" },
  stockName: { fontSize: 14, fontWeight: "700", color: "#ffffff", flexShrink: 1 },
})
