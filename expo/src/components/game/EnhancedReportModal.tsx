import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native"
import { AlertTriangle, Award, CheckCircle2, Target, TrendingUp, X } from "lucide-react-native"
import { Button, CenterModal, PressableScale } from "@/components/ui"
import { SeriesChart } from "@/components/charts"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"

/**
 * 강화된 보고서 모달 (중간/최종)
 * README의 보고서 시스템 구현
 */

interface ReportData {
  type: "weekly" | "final"
  weekNumber?: number
  totalDays: number
  currentDay: number
  initialCash: number
  currentAssets: number
  profitRate: number
  aiRankings: Array<{
    name: string
    profitRate: number
    winRate: number
    avgTradeTime: number
    mdd: number
  }>
  userStats: {
    profitRate: number
    winRate: number
    avgTradeTime: number
    mdd: number
    totalTrades: number
    wins: number
    losses: number
  }
  waveSkills: {
    lowPointCapture: number
    highPointSell: number
    waveAvoidance: number
    thirdWaveRecognition: number
  }
  chartData: Array<{ turn: number; value: number }>
}

export function EnhancedReportModal({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean
  onClose: () => void
  data: ReportData
}) {
  const { height } = useWindowDimensions()

  if (!isOpen) return null

  const isWeekly = data.type === "weekly"
  const isProfit = data.profitRate >= 0
  const mainColor = isProfit ? palette.red[500] : palette.blue[500]

  return (
    <CenterModal visible={isOpen} onClose={onClose} backdropColor="rgba(0,0,0,0.8)" style={[styles.modal, { maxHeight: height * 0.9 }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{isWeekly ? `📊 ${data.weekNumber}주차 중간 리포트` : "🏁 최종 리포트"}</Text>
              <Text style={styles.subtitle}>
                {isWeekly
                  ? `${data.currentDay}일 / ${data.totalDays}일 (${Math.floor((data.currentDay / data.totalDays) * 100)}% 완료)`
                  : "게임 완료 분석 결과"}
              </Text>
            </View>
            <PressableScale onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={palette.gray[400]} />
            </PressableScale>
          </View>
        </View>

        {/* 내용 */}
        <View style={styles.body}>
          {/* 주요 성과 */}
          <View style={styles.grid}>
            <View style={styles.statCard}>
              <View style={styles.statLabelRow}>
                <TrendingUp size={16} color={palette.blue[400]} />
                <Text style={styles.statLabel}>수익률</Text>
              </View>
              <Text style={[styles.statValue, { color: mainColor }]}>
                {isProfit ? "+" : ""}
                {data.profitRate.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statLabelRow}>
                <Award size={16} color={palette.yellow[400]} />
                <Text style={styles.statLabel}>순수익</Text>
              </View>
              <Text style={[styles.statValue, { color: mainColor }]} numberOfLines={1} adjustsFontSizeToFit>
                {isProfit ? "+" : ""}
                {formatNumber(data.currentAssets - data.initialCash)}원
              </Text>
            </View>
          </View>

          {/* 차트 */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <TrendingUp size={16} color={palette.gray[300]} />
              <Text style={styles.sectionTitle}>자산 흐름도</Text>
            </View>
            <SeriesChart
              data={data.chartData}
              height={192}
              xKey="turn"
              series={[{ key: "value", type: "area", color: isProfit ? "#ef4444" : "#3b82f6", strokeWidth: 3, fillOpacity: 0.3, curve: "monotone" }]}
            />
          </View>

          {/* AI 비교 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>🏆 나 vs AI 비교</Text>
            <View style={[styles.tr, styles.thead]}>
              <Text style={[styles.th, styles.colName]}>이름</Text>
              <Text style={[styles.th, styles.col]}>수익률</Text>
              <Text style={[styles.th, styles.col]}>승률</Text>
              <Text style={[styles.th, styles.col]}>평균거래</Text>
              <Text style={[styles.th, styles.col]}>MDD</Text>
            </View>
            <View style={[styles.tr, styles.userRow]}>
              <Text style={[styles.td, styles.colName, { fontWeight: "700", color: palette.blue[400] }]}>나</Text>
              <Text style={[styles.td, styles.col, { fontWeight: "700", color: palette.blue[400] }]}>
                {data.userStats.profitRate >= 0 ? "+" : ""}
                {data.userStats.profitRate.toFixed(1)}%
              </Text>
              <Text style={[styles.td, styles.col, { color: palette.gray[300] }]}>{data.userStats.winRate}%</Text>
              <Text style={[styles.td, styles.col, { color: palette.gray[300] }]}>{data.userStats.avgTradeTime}분</Text>
              <Text style={[styles.td, styles.col, { color: palette.gray[300] }]}>{data.userStats.mdd.toFixed(1)}%</Text>
            </View>
            {data.aiRankings.map((ai, idx) => (
              <View key={idx} style={[styles.tr, idx < data.aiRankings.length - 1 && styles.trBorder]}>
                <Text numberOfLines={1} style={[styles.td, styles.colName, { color: palette.gray[300] }]}>
                  {ai.name}
                </Text>
                <Text style={[styles.td, styles.col, { color: palette.gray[300] }]}>
                  {ai.profitRate >= 0 ? "+" : ""}
                  {ai.profitRate.toFixed(1)}%
                </Text>
                <Text style={[styles.td, styles.col, { color: palette.gray[400] }]}>{ai.winRate}%</Text>
                <Text style={[styles.td, styles.col, { color: palette.gray[400] }]}>{ai.avgTradeTime}분</Text>
                <Text style={[styles.td, styles.col, { color: palette.gray[400] }]}>{ai.mdd.toFixed(1)}%</Text>
              </View>
            ))}
          </View>

          {/* 분석 */}
          <View style={{ gap: 16 }}>
            <View style={[styles.notice, { backgroundColor: alpha(palette.green[500], 0.1), borderColor: alpha(palette.green[500], 0.3) }]}>
              <CheckCircle2 size={20} color={palette.green[500]} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.noticeTitle, { color: palette.green[400] }]}>✅ 잘한 점</Text>
                <View style={{ gap: 4 }}>
                  <Text style={styles.noticeText}>• 수익률이 안정왕 김철수 초과</Text>
                  <Text style={styles.noticeText}>• MDD 관리 우수 ({data.userStats.mdd.toFixed(1)}%)</Text>
                  <Text style={styles.noticeText}>• 승률 {data.userStats.winRate}% (평균 이상)</Text>
                </View>
              </View>
            </View>

            <View style={[styles.notice, { backgroundColor: alpha(palette.orange[500], 0.1), borderColor: alpha(palette.orange[500], 0.3) }]}>
              <AlertTriangle size={20} color={palette.orange[500]} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.noticeTitle, { color: palette.orange[400] }]}>⚠️ 개선점</Text>
                <View style={{ gap: 4 }}>
                  <Text style={styles.noticeText}>• 투자 비중 45% → 55% 권장</Text>
                  <Text style={styles.noticeText}>• 3파 상승 포착률 박영희보다 낮음</Text>
                  <Text style={styles.noticeText}>• 의사결정 시간 단축 필요</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 파도 감각 평가 */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Target size={16} color={palette.gray[300]} />
              <Text style={styles.sectionTitle}>🌊 파도 감각 평가</Text>
            </View>
            <View style={{ gap: 12 }}>
              <WaveSkillBar label="저점 포착" score={data.waveSkills.lowPointCapture} />
              <WaveSkillBar label="고점 매도" score={data.waveSkills.highPointSell} />
              <WaveSkillBar label="B파 회피" score={data.waveSkills.waveAvoidance} />
              <WaveSkillBar label="3파 인식" score={data.waveSkills.thirdWaveRecognition} />
            </View>
          </View>

          {/* 거래 통계 */}
          {!isWeekly && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>📈 거래 내역 분석</Text>
              <View style={{ gap: 8 }}>
                <View style={styles.kv}>
                  <Text style={styles.kvLabel}>총 거래</Text>
                  <Text style={[styles.kvValue, { color: "#ffffff" }]}>
                    {data.userStats.totalTrades}회 ({data.userStats.wins}승 {data.userStats.losses}패)
                  </Text>
                </View>
                <View style={styles.kv}>
                  <Text style={styles.kvLabel}>최고 수익</Text>
                  <Text style={[styles.kvValue, { color: palette.red[500] }]}>삼성전자 +18.2% (+182,000원)</Text>
                </View>
                <View style={styles.kv}>
                  <Text style={styles.kvLabel}>최대 손실</Text>
                  <Text style={[styles.kvValue, { color: palette.blue[500] }]}>에코프로 -8.5% (-85,000원)</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* 하단 버튼 */}
        <View style={styles.footer}>
          <Button onPress={onClose} style={styles.cta} textStyle={styles.ctaText}>
            {isWeekly ? "다음 주차 시작하기" : "홈으로 돌아가기"}
          </Button>
        </View>
      </ScrollView>
    </CenterModal>
  )
}

function WaveSkillBar({ label, score }: { label: string; score: number }) {
  const stars = Math.round(score / 20) // 100점 만점 -> 5점 만점
  const grade = score >= 90 ? "S급" : score >= 80 ? "A급" : score >= 70 ? "B급" : score >= 60 ? "C급" : "D급"
  const color = score >= 80 ? palette.yellow[500] : score >= 60 ? palette.blue[500] : palette.gray[500]

  return (
    <View>
      <View style={[styles.kv, { marginBottom: 4 }]}>
        <Text style={styles.statLabel}>{label}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={styles.statLabel}>{score}점</Text>
          <Text style={{ fontSize: 12, fontWeight: "700", color }}>({grade})</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        {[...Array(5)].map((_, i) => (
          <View key={i} style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: i < stars ? palette.yellow[500] : palette.gray[700] }} />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  modal: { maxWidth: 672, backgroundColor: "#1E1E1E", borderRadius: 24, borderWidth: 1, borderColor: palette.gray[800] },
  header: { padding: 24, borderBottomWidth: 1, borderBottomColor: palette.gray[800] },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  title: { fontSize: 24, fontWeight: "700", color: "#ffffff" },
  subtitle: { fontSize: 14, color: palette.gray[400], marginTop: 4 },
  closeBtn: { padding: 8, borderRadius: 9999 },
  body: { padding: 24, gap: 24 },
  grid: { flexDirection: "row", gap: 16 },
  statCard: { flex: 1, backgroundColor: alpha(palette.gray[800], 0.5), borderRadius: 16, padding: 16 },
  statLabelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  statLabel: { fontSize: 12, color: palette.gray[400] },
  statValue: { fontSize: 24, fontWeight: "700" },
  section: { backgroundColor: alpha(palette.gray[800], 0.3), borderRadius: 16, padding: 16 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: palette.gray[300] },
  tr: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  thead: { borderBottomWidth: 1, borderBottomColor: palette.gray[700] },
  trBorder: { borderBottomWidth: 1, borderBottomColor: palette.gray[800] },
  userRow: { backgroundColor: alpha(palette.blue[500], 0.1), borderWidth: 1, borderColor: alpha(palette.blue[500], 0.3) },
  th: { fontSize: 12, fontWeight: "700", color: palette.gray[500] },
  td: { fontSize: 12 },
  colName: { flex: 1.6, textAlign: "left" },
  col: { flex: 1, textAlign: "right" },
  notice: { flexDirection: "row", alignItems: "flex-start", gap: 12, borderWidth: 1, borderRadius: 16, padding: 16 },
  noticeTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  noticeText: { fontSize: 14, color: palette.gray[300] },
  kv: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  kvLabel: { fontSize: 14, color: palette.gray[400] },
  kvValue: { fontSize: 14, fontWeight: "700", flexShrink: 1, textAlign: "right" },
  footer: { padding: 24, borderTopWidth: 1, borderTopColor: palette.gray[800] },
  cta: { width: "100%", height: 56, backgroundColor: palette.blue[600], borderRadius: 16 },
  ctaText: { color: "#ffffff", fontWeight: "700", fontSize: 18 },
})
