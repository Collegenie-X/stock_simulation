import { Pressable, StyleSheet, Text, View } from "react-native"
import { alpha, palette } from "@/theme"
import { formatNumber } from "@/lib/format"

export interface CompanyProfile {
  stockId: string
  name: string
  ticker: string
  sector: string
  subSector: string
  exchange: string
  emoji: string
  description: string
  businessModel: string
  investmentThesis: string
  initialInvestmentNote: string
  keyStrengths: string[]
  riskFactors: string[]
  targetPrice: number
  riskLevel: "낮음" | "중간" | "높음"
  analystRating: string
  dividendYield: number
  per: string
  pbr: string
}

interface CompanyCardProps {
  profile: CompanyProfile
  currentPrice?: number
  myQty?: number
  myAvgPrice?: number
  totalProfit?: number
  totalProfitRate?: number
  isExpanded?: boolean
  onToggle?: () => void
}

const RISK_COLORS: Record<CompanyProfile["riskLevel"], { color: string; bg: string }> = {
  낮음: { color: palette.emerald[400], bg: alpha(palette.emerald[500], 0.1) },
  중간: { color: palette.yellow[400], bg: alpha(palette.yellow[500], 0.1) },
  높음: { color: palette.red[400], bg: alpha(palette.red[500], 0.1) },
}

const RATING_COLORS: Record<string, { color: string; bg: string }> = {
  매수: { color: palette.red[400], bg: alpha(palette.red[500], 0.1) },
  중립: { color: palette.yellow[400], bg: alpha(palette.yellow[500], 0.1) },
  보유: { color: palette.blue[400], bg: alpha(palette.blue[500], 0.1) },
  매도: { color: palette.gray[400], bg: alpha(palette.gray[500], 0.1) },
}

const DEFAULT_BADGE = { color: palette.gray[400], bg: alpha(palette.gray[500], 0.1) }

export const CompanyCard = ({
  profile,
  currentPrice,
  myQty = 0,
  myAvgPrice = 0,
  totalProfit = 0,
  totalProfitRate = 0,
  isExpanded = false,
  onToggle,
}: CompanyCardProps) => {
  const hasPosition = myQty > 0
  const isProfit = totalProfit >= 0
  const risk = RISK_COLORS[profile.riskLevel] ?? DEFAULT_BADGE
  const rating = RATING_COLORS[profile.analystRating] ?? DEFAULT_BADGE
  const profitColor = isProfit ? palette.red[400] : palette.blue[400]

  return (
    <Pressable style={styles.card} onPress={onToggle}>
      {/* 헤더 행 */}
      <View style={styles.header}>
        {/* 이모지 아이콘 */}
        <View style={styles.emojiWrap}>
          <Text style={styles.emoji}>{profile.emoji}</Text>
        </View>

        {/* 기업 기본 정보 */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{profile.name}</Text>
            <Text style={styles.ticker}>{profile.ticker}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.ticker} numberOfLines={1}>{profile.subSector}</Text>
            <Text style={styles.dot}>·</Text>
            <View style={[styles.badge, { backgroundColor: risk.bg }]}>
              <Text style={[styles.badgeText, { color: risk.color }]}>{profile.riskLevel}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: rating.bg }]}>
              <Text style={[styles.badgeText, { color: rating.color }]}>{profile.analystRating}</Text>
            </View>
          </View>
        </View>

        {/* 보유 시 수익 정보 */}
        {hasPosition ? (
          <View style={styles.right}>
            <Text style={[styles.profit, { color: profitColor }]}>
              {isProfit ? "+" : ""}{formatNumber(totalProfit)}원
            </Text>
            <Text style={[styles.profitRate, { color: alpha(profitColor, 0.7) }]}>
              {isProfit ? "+" : ""}{totalProfitRate.toFixed(1)}%
            </Text>
          </View>
        ) : (
          <View style={styles.right}>
            <Text style={styles.ticker}>목표가</Text>
            <Text style={styles.target}>{formatNumber(profile.targetPrice)}원</Text>
          </View>
        )}
      </View>

      {/* 초기 투자 메모 */}
      <View style={styles.note}>
        <Text style={[styles.ticker, { marginBottom: 4 }]}>📌 초기 투자 근거</Text>
        <Text style={styles.body}>{profile.initialInvestmentNote}</Text>
      </View>

      {/* 확장 시 상세 정보 */}
      {isExpanded && (
        <View style={styles.expanded}>
          {/* 투자 핵심 논거 */}
          <View>
            <Text style={styles.sectionTitle}>💡 투자 테마</Text>
            <Text style={styles.body}>{profile.investmentThesis}</Text>
          </View>

          {/* 사업 모델 */}
          <View>
            <Text style={styles.sectionTitle}>🏢 사업 모델</Text>
            <Text style={styles.body}>{profile.businessModel}</Text>
          </View>

          {/* 투자 지표 */}
          <View style={styles.metricRow}>
            <View style={styles.metric}>
              <Text style={[styles.ticker, { marginBottom: 4 }]}>PER</Text>
              <Text style={styles.metricValue}>{profile.per}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={[styles.ticker, { marginBottom: 4 }]}>PBR</Text>
              <Text style={styles.metricValue}>{profile.pbr}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={[styles.ticker, { marginBottom: 4 }]}>배당률</Text>
              <Text style={styles.metricValue}>
                {profile.dividendYield > 0 ? `${profile.dividendYield}%` : "-"}
              </Text>
            </View>
          </View>

          {/* 강점 & 리스크 */}
          <View style={styles.metricRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: palette.emerald[400] }]}>✅ 강점</Text>
              <View style={{ gap: 4 }}>
                {profile.keyStrengths.map((s, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <Text style={[styles.bullet, { color: palette.emerald[500] }]}>·</Text>
                    <Text style={styles.bulletText}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: palette.red[400] }]}>⚠️ 리스크</Text>
              <View style={{ gap: 4 }}>
                {profile.riskFactors.map((r, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <Text style={[styles.bullet, { color: palette.red[500] }]}>·</Text>
                    <Text style={styles.bulletText}>{r}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* 보유 정보 */}
          {hasPosition && (
            <View style={styles.position}>
              <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>📊 내 보유 현황</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.ticker}>보유 수량</Text>
                  <Text style={styles.metricValue}>{myQty}주</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.ticker}>평균 단가</Text>
                  <Text style={styles.metricValue}>{formatNumber(myAvgPrice)}원</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.ticker}>현재가</Text>
                  <Text style={styles.metricValue}>
                    {currentPrice ? formatNumber(currentPrice) : "-"}원
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#252525", borderRadius: 16, overflow: "hidden", marginBottom: 12, marginHorizontal: 20 },
  header: { padding: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  emojiWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: palette.gray[700], alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 20, color: "#ffffff" },
  info: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { fontSize: 14, fontWeight: "700", color: "#ffffff", flexShrink: 1 },
  ticker: { fontSize: 12, color: palette.gray[500] },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2, flexWrap: "wrap" },
  dot: { fontSize: 12, color: palette.gray[700] },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999 },
  badgeText: { fontSize: 12 },
  right: { alignItems: "flex-end", flexShrink: 0 },
  profit: { fontSize: 14, fontWeight: "700" },
  profitRate: { fontSize: 12 },
  target: { fontSize: 14, fontWeight: "600", color: palette.gray[300] },
  note: { paddingHorizontal: 16, paddingBottom: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: alpha(palette.gray[700], 0.5) },
  body: { fontSize: 12, lineHeight: 19, color: palette.gray[300] },
  expanded: { borderTopWidth: 1, borderTopColor: alpha(palette.gray[700], 0.5), padding: 16, gap: 16 },
  sectionTitle: { fontSize: 12, fontWeight: "600", color: palette.gray[400], marginBottom: 6 },
  metricRow: { flexDirection: "row", gap: 12 },
  metric: { flex: 1, backgroundColor: alpha(palette.gray[800], 0.6), borderRadius: 12, padding: 12, alignItems: "center" },
  metricValue: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  bulletRow: { flexDirection: "row", gap: 4 },
  bullet: { fontSize: 12 },
  bulletText: { flex: 1, fontSize: 12, color: palette.gray[400] },
  position: { backgroundColor: alpha(palette.gray[800], 0.6), borderRadius: 12, padding: 12 },
})
