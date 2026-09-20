import { useState } from "react"
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native"
import { AlertTriangle, CheckCircle2, Lightbulb, TrendingUp, X } from "lucide-react-native"
import { Button, CenterModal, Gradient, PressableScale } from "@/components/ui"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"

/**
 * 힌트 모달 컴포넌트
 * README의 AI 힌트 시스템 구현
 */

interface HintData {
  stockName: string
  currentPrice: number
  volume: number
  volumeChange: number
  supportLevel: number
  resistanceLevel: number
  rsi: number
  pattern: string
  confidence: number
}

export function HintModal({
  isOpen,
  onClose,
  hintLevel = 1,
  stockData,
  onUsePoints,
}: {
  isOpen: boolean
  onClose: () => void
  hintLevel: 1 | 2
  stockData: HintData
  onUsePoints: (points: number) => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const { height } = useWindowDimensions()

  if (!isOpen) return null

  const handleUseHint = () => {
    const cost = hintLevel === 1 ? 300 : 500
    setIsLoading(true)
    setTimeout(() => {
      onUsePoints(cost)
      setIsLoading(false)
    }, 500)
  }

  return (
    <CenterModal visible={isOpen} onClose={onClose} backdropColor="rgba(0,0,0,0.8)" style={[styles.modal, { maxHeight: height * 0.9 }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.titleRow}>
              <Lightbulb size={24} color={palette.yellow[500]} />
              <Text style={styles.title}>{hintLevel === 1 ? "💡 AI 간단 힌트" : "💡💡 AI 심층 분석"}</Text>
            </View>
            <PressableScale onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={palette.gray[400]} />
            </PressableScale>
          </View>
          <Text style={styles.subtitle}>{hintLevel === 1 ? "빠른 조언과 추천 전략" : "10단계 분석 + 기대값 계산"}</Text>
        </View>

        {/* 내용 */}
        <View style={styles.body}>
          {/* 종목 정보 */}
          <View style={styles.stockCard}>
            <Text style={[styles.subtitle, { marginBottom: 4 }]}>분석 종목</Text>
            <Text style={styles.stockName}>{stockData.stockName}</Text>
            <Text style={styles.stockPrice}>{formatNumber(stockData.currentPrice)}원</Text>
          </View>

          {hintLevel === 1 ? (
            // 1단계: 간단 힌트
            <View style={{ gap: 16 }}>
              <View style={[styles.box16, { backgroundColor: alpha(palette.blue[500], 0.1), borderColor: alpha(palette.blue[500], 0.3) }]}>
                <View style={styles.startRow}>
                  <Text style={styles.robot}>🤖</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.adviceTitle}>AI 조언</Text>
                    <Text style={styles.adviceText}>
                      거래량이 평소보다 {stockData.volumeChange}% 증가했어요.{"\n"}
                      {stockData.pattern} 신호입니다.{"\n"}
                      하지만 지지선({formatNumber(stockData.supportLevel)}원)까지 조정이 올 가능성도 40% 있습니다.
                    </Text>
                  </View>
                </View>
              </View>

              <View style={{ gap: 8 }}>
                <View style={styles.labelRow}>
                  <CheckCircle2 size={16} color={palette.green[500]} />
                  <Text style={styles.label}>추천 전략</Text>
                </View>
                <View style={styles.strategyBox}>
                  <View style={styles.between}>
                    <Text style={styles.adviceText}>• 1차 매수: 50%</Text>
                    <Text style={styles.hintSmall}>(현재가)</Text>
                  </View>
                  <View style={styles.between}>
                    <Text style={styles.adviceText}>• 2차 매수: 30%</Text>
                    <Text style={styles.hintSmall}>({formatNumber(stockData.supportLevel)}원 도달 시)</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            // 2단계: 상세 분석
            <View style={{ gap: 16 }}>
              <View style={{ gap: 8 }}>
                <View style={styles.labelRow}>
                  <TrendingUp size={16} color={palette.blue[500]} />
                  <Text style={styles.label}>📊 10단계 분석 과정</Text>
                </View>
                <View style={styles.analysisBox}>
                  <AnalysisItem step={1} label="현재 패턴" value={`${stockData.pattern} (${stockData.confidence}%)`} />
                  <AnalysisItem step={2} label="지지선" value={`${formatNumber(stockData.supportLevel)}원 (⭐⭐⭐⭐⭐)`} />
                  <AnalysisItem step={3} label="저항선" value={`${formatNumber(stockData.resistanceLevel)}원`} />
                  <AnalysisItem step={4} label="거래량" value={`+${stockData.volumeChange}% (강한 매수세)`} />
                  <AnalysisItem step={5} label="RSI" value={`${stockData.rsi} (중립, 과매수 아님)`} />
                  <AnalysisItem step={6} label="MACD" value="골든크로스 형성" />
                  <AnalysisItem step={7} label="이동평균" value="5일선 > 20일선 (상승)" />
                  <AnalysisItem step={8} label="볼린저밴드" value="중심선 돌파" />
                  <AnalysisItem step={9} label="뉴스" value="호재 없음 (기술적 상승)" />
                  <AnalysisItem step={10} label="AI 확신도" value={`${stockData.confidence}%`} isLast />
                </View>
              </View>

              {/* 시나리오 분석 */}
              <View style={{ gap: 12 }}>
                <Text style={styles.label}>🎯 최적 전략</Text>

                <View style={[styles.box12, { backgroundColor: alpha(palette.green[500], 0.1), borderColor: alpha(palette.green[500], 0.3) }]}>
                  <Text style={[styles.scenarioTitle, { color: palette.green[400] }]}>시나리오 A (60% 확률)</Text>
                  <Text style={styles.scenarioText}>
                    {formatNumber(stockData.currentPrice)}원 → {formatNumber(stockData.resistanceLevel)}원 (+
                    {(((stockData.resistanceLevel - stockData.currentPrice) / stockData.currentPrice) * 100).toFixed(1)}
                    %)
                  </Text>
                  <Text style={styles.scenarioSub}>→ 전략: 즉시 50% 매수</Text>
                </View>

                <View style={[styles.box12, { backgroundColor: alpha(palette.blue[500], 0.1), borderColor: alpha(palette.blue[500], 0.3) }]}>
                  <Text style={[styles.scenarioTitle, { color: palette.blue[400] }]}>시나리오 B (40% 확률)</Text>
                  <Text style={styles.scenarioText}>
                    {formatNumber(stockData.currentPrice)}원 → {formatNumber(stockData.supportLevel)}원 →{" "}
                    {formatNumber(stockData.resistanceLevel + 1000)}원
                  </Text>
                  <Text style={styles.scenarioSub}>→ 전략: 1차 30%, 2차 조정 시 40%</Text>
                </View>
              </View>

              {/* 기대값 */}
              <Gradient
                dir="r"
                colors={[alpha(palette.yellow[500], 0.1), alpha(palette.orange[500], 0.1)]}
                style={[styles.box12, { padding: 16, borderColor: alpha(palette.yellow[500], 0.3) }]}
              >
                <Text style={[styles.scenarioTitle, { color: palette.yellow[400], marginBottom: 8 }]}>💰 기대값 계산</Text>
                <Text style={[styles.scenarioText, { marginBottom: 8 }]}>(60% × +4.2%) + (40% × +5.9%) = +4.9%</Text>
                <Text style={{ fontSize: 14, fontWeight: "700", color: palette.green[400] }}>→ 플러스 기대값! 진입 권장</Text>
              </Gradient>

              {/* 리스크 */}
              <View style={[styles.box12, styles.riskRow]}>
                <AlertTriangle size={20} color={palette.red[500]} style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: palette.red[400] }}>⚠️ 리스크</Text>
                  <Text style={[styles.scenarioText, { marginTop: 4 }]}>손절: {formatNumber(stockData.supportLevel)}원 이탈 시 -5%</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* 하단 버튼 */}
        <View style={styles.footer}>
          <View style={[styles.between, { marginBottom: 16 }]}>
            <Text style={styles.subtitle}>사용 비용</Text>
            <Text style={styles.cost}>{hintLevel === 1 ? "300" : "500"} 포인트</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Button onPress={onClose} variant="outline" style={styles.cancelBtn} textStyle={{ color: "#ffffff" }}>
              취소
            </Button>
            <Button onPress={handleUseHint} disabled={isLoading} style={styles.useBtn} textStyle={{ color: "#ffffff" }}>
              {isLoading ? "적용 중..." : "전략 사용하기"}
            </Button>
          </View>
        </View>
      </ScrollView>
    </CenterModal>
  )
}

function AnalysisItem({
  step,
  label,
  value,
  isLast = false,
}: {
  step: number
  label: string
  value: string
  isLast?: boolean
}) {
  return (
    <View style={[styles.analysisItem, !isLast && { borderBottomWidth: 1, borderBottomColor: alpha(palette.gray[700], 0.3) }]}>
      <Text style={styles.step}>{step}.</Text>
      <Text style={styles.analysisLabel}>{label}:</Text>
      <Text style={styles.analysisValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  modal: { maxWidth: 448, backgroundColor: "#1E1E1E", borderRadius: 24, borderWidth: 1, borderColor: palette.gray[800] },
  header: { padding: 24, borderBottomWidth: 1, borderBottomColor: palette.gray[800] },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  title: { fontSize: 24, fontWeight: "700", color: "#ffffff", flexShrink: 1 },
  subtitle: { fontSize: 14, color: palette.gray[400] },
  closeBtn: { padding: 8, borderRadius: 9999 },
  body: { padding: 24, gap: 24 },
  stockCard: { backgroundColor: alpha(palette.gray[800], 0.5), borderRadius: 16, padding: 16 },
  stockName: { fontSize: 20, fontWeight: "700", color: "#ffffff" },
  stockPrice: { fontSize: 24, fontWeight: "700", color: "#ffffff", marginTop: 8 },
  box16: { padding: 16, borderWidth: 1, borderRadius: 16 },
  box12: { padding: 12, borderWidth: 1, borderRadius: 12 },
  startRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  robot: { fontSize: 24, color: "#ffffff" },
  adviceTitle: { fontSize: 16, fontWeight: "700", color: palette.blue[400], marginBottom: 8 },
  adviceText: { fontSize: 14, lineHeight: 20, color: palette.gray[300] },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontSize: 14, fontWeight: "700", color: palette.gray[300] },
  strategyBox: { backgroundColor: alpha(palette.gray[800], 0.5), borderRadius: 12, padding: 12, gap: 8 },
  between: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  hintSmall: { fontSize: 12, color: palette.gray[500] },
  analysisBox: { backgroundColor: alpha(palette.gray[800], 0.5), borderRadius: 12, padding: 16, gap: 8 },
  analysisItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 4 },
  step: { fontSize: 12, fontWeight: "700", color: palette.gray[500], width: 20 },
  analysisLabel: { fontSize: 12, color: palette.gray[400], flex: 1 },
  analysisValue: { fontSize: 12, fontWeight: "500", color: palette.gray[200], flexShrink: 1, textAlign: "right" },
  scenarioTitle: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  scenarioText: { fontSize: 12, color: palette.gray[300] },
  scenarioSub: { fontSize: 12, color: palette.gray[400], marginTop: 4 },
  riskRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: alpha(palette.red[500], 0.1), borderColor: alpha(palette.red[500], 0.3) },
  footer: { padding: 24, borderTopWidth: 1, borderTopColor: palette.gray[800] },
  cost: { fontSize: 18, fontWeight: "700", color: palette.yellow[500] },
  cancelBtn: { flex: 1, height: 48, backgroundColor: palette.gray[800], borderColor: palette.gray[700] },
  useBtn: { flex: 1, height: 48, backgroundColor: palette.blue[600] },
})
