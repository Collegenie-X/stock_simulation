import { StyleSheet, Text, View } from "react-native"
import { Star, TrendingUp, Trophy, User, Waves } from "lucide-react-native"
import { Gradient } from "@/components/ui"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"
import type { TheoreticalMaxResult } from "../utils"

interface Props {
  rate: number
  total: number
  initTotal: number
  theoreticalMax: TheoreticalMaxResult
}

/** 파도 읽기 달성도 */
export function ResultWaveAchievement({ rate, total, initTotal, theoreticalMax }: Props) {
  const ratio = theoreticalMax.maxRate > 0 ? rate / theoreticalMax.maxRate : 0
  const tone =
    ratio >= 0.7
      ? { bg: alpha(palette.green[500], 0.2), text: palette.green[400], bar: [palette.green[600], palette.green[400]] }
      : ratio >= 0.4
        ? { bg: alpha(palette.yellow[500], 0.2), text: palette.yellow[400], bar: [palette.yellow[600], palette.yellow[400]] }
        : { bg: alpha(palette.red[500], 0.2), text: palette.red[400], bar: [palette.red[600], palette.red[400]] }

  return (
    <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
      <View style={styles.head}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Gradient dir="br" colors={[palette.yellow[500], palette.orange[600]]} style={styles.icon}>
            <Star size={16} color="#ffffff" />
          </Gradient>
          <Text style={styles.title}>파도 읽기 달성도</Text>
        </View>
        {theoreticalMax.maxRate > 0 && (
          <View style={[styles.badge, { backgroundColor: tone.bg }]}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: tone.text }}>{Math.max(0, ratio * 100).toFixed(0)}%</Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        {/* 달성도 게이지 */}
        {theoreticalMax.maxRate > 0 && (
          <View style={{ marginBottom: 16 }}>
            <View style={styles.track}>
              <Gradient dir="r" colors={tone.bar} style={{ height: "100%", borderRadius: 9999, width: `${Math.min(100, Math.max(0, ratio * 100))}%` }} />
              {/* 마일스톤 마커 */}
              <View style={[styles.marker, { left: "40%" }]} />
              <View style={[styles.marker, { left: "70%" }]} />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
              {["0%", "40%", "70%", "100%"].map((l) => (
                <Text key={l} style={{ fontSize: 8, color: palette.gray[600] }}>
                  {l}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* 비교 카드 */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
          <Gradient dir="br" colors={[alpha(palette.blue[500], 0.1), alpha(palette.cyan[500], 0.1)]} style={[styles.compare, { borderColor: alpha(palette.cyan[500], 0.2) }]}>
            <View style={styles.compareHead}>
              <User size={16} color={palette.cyan[400]} />
              <Text style={{ fontSize: 10, color: palette.cyan[300], fontWeight: "700" }}>내 결과</Text>
            </View>
            <Text style={{ fontSize: 24, fontWeight: "900", color: rate >= 0 ? palette.red[400] : palette.blue[400] }}>
              {rate >= 0 ? "+" : ""}
              {rate.toFixed(1)}%
            </Text>
            <Text style={{ fontSize: 10, color: palette.gray[500] }}>
              {rate >= 0 ? "+" : ""}
              {formatNumber(Math.round(total - initTotal))}원
            </Text>
          </Gradient>
          <Gradient dir="br" colors={[alpha(palette.yellow[500], 0.1), alpha(palette.orange[500], 0.1)]} style={[styles.compare, { borderColor: alpha(palette.yellow[500], 0.2) }]}>
            <View style={styles.compareHead}>
              <Trophy size={16} color={palette.yellow[400]} />
              <Text style={{ fontSize: 10, color: palette.yellow[300], fontWeight: "700" }}>완벽 전략</Text>
            </View>
            <Text style={{ fontSize: 24, fontWeight: "900", color: palette.yellow[400] }}>+{theoreticalMax.maxRate.toFixed(1)}%</Text>
            <Text style={{ fontSize: 10, color: palette.gray[500] }}>+{formatNumber(theoreticalMax.maxValue - initTotal)}원</Text>
          </Gradient>
        </View>

        {/* 갭 분석 */}
        <View style={styles.gap}>
          <View>
            <Text style={styles.tiny}>최대 수익과의 갭</Text>
            <Text style={{ fontSize: 18, fontWeight: "900", color: palette.orange[400] }}>-{(theoreticalMax.maxRate - rate).toFixed(1)}%p</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.tiny}>놓친 수익</Text>
            <Text style={{ fontSize: 18, fontWeight: "900", color: palette.gray[400] }}>-{formatNumber(theoreticalMax.maxValue - Math.round(total))}원</Text>
          </View>
        </View>

        {/* 파도 전환점 */}
        <View style={styles.turning}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 }}>
            <Waves size={12} color={palette.cyan[300]} />
            <Text style={{ fontSize: 10, fontWeight: "700", color: palette.cyan[300] }}>파도 전환점 분석</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View>
              <Text style={{ fontSize: 10, color: palette.gray[500] }}>최저점</Text>
              <Text style={{ fontSize: 10, color: "#ffffff", fontWeight: "700" }}>
                T{theoreticalMax.lowestTurn} · {formatNumber(theoreticalMax.lowestPrice)}원
              </Text>
            </View>
            <TrendingUp size={16} color={palette.green[400]} />
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontSize: 10, color: palette.gray[500] }}>최고점</Text>
              <Text style={{ fontSize: 10, color: "#ffffff", fontWeight: "700" }}>
                T{theoreticalMax.highestTurn} · {formatNumber(theoreticalMax.highestPrice)}원
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  icon: { width: 32, height: 32, borderRadius: 12, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  title: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999 },
  card: { backgroundColor: "#1a1a1a", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: alpha(palette.gray[800], 0.3) },
  track: { height: 16, backgroundColor: palette.gray[800], borderRadius: 9999, overflow: "hidden" },
  marker: { position: "absolute", top: 0, width: 2, height: "100%", backgroundColor: alpha("#ffffff", 0.2) },
  compare: { flex: 1, borderRadius: 12, padding: 12, borderWidth: 1, overflow: "hidden" },
  compareHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  gap: { backgroundColor: "#252525", borderRadius: 12, padding: 12, marginBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  tiny: { fontSize: 9, color: palette.gray[500], marginBottom: 4 },
  turning: { backgroundColor: alpha(palette.cyan[500], 0.08), borderWidth: 1, borderColor: alpha(palette.cyan[500], 0.2), borderRadius: 12, padding: 12 },
})
