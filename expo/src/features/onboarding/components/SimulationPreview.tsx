import { StyleSheet, Text, View } from "react-native"
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from "react-native-svg"
import { FadeUp, Gradient, Pop, Pulse, WaveLogo } from "@/components/ui"
import { Sparkline, monotonePath } from "@/components/charts"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"
import onboardingData from "../data.json"
import { PulseCircle } from "./PulseCircle"
import { densify, useReveal } from "./useReveal"

const sim = onboardingData.simulation
const SUB = 3
const W = 300, H = 96

const VALUES = densify(sim.main.path, SUB)
const PTS = VALUES.map((v, i) => ({ x: 8 + (i * (W - 40)) / (VALUES.length - 1), y: H - 8 - (v / 100) * (H - 22) }))
const DIP_I = sim.dipIndex * SUB
const ROWS = sim.rows.map((r) => ({ ...r, values: densify(r.spark, SUB) }))

// 한국식 색: 오르면 빨강, 내리면 파랑 (실제 게임 화면과 동일)
const upDown = (v: number) => (v >= 0 ? palette.red[400] : palette.blue[400])
const pct = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`

/** 슬라이드 5 — 실제 "실전 시뮬레이션" 화면을 본뜬 미리보기: 배운 대로 버텨서 버릇을 고친다 */
export function SimulationPreview() {
  const n = useReveal(PTS.length, 120, 3000)
  const shown = PTS.slice(0, n)
  const d = monotonePath(shown)
  const tip = shown[shown.length - 1]
  const passedDip = n > DIP_I

  // 나: 떨어져도 버팀 / 예전의 나: 바닥에서 다 팔아버림
  const ret = (VALUES[n - 1] / VALUES[0] - 1) * 20
  const oldRet = (VALUES[Math.min(n - 1, DIP_I)] / VALUES[0] - 1) * 20
  const asset = Math.round((sim.startCash * (1 + ret / 100)) / 1000) * 1000
  const day = Math.min(sim.main.path.length, Math.ceil(n / SUB))
  const face = ret >= 3 ? "😆" : ret >= 0 ? "😊" : passedDip ? "😤" : "😨"
  const { habit } = sim
  const maxCount = Math.max(...habit.progress)

  return (
    <View style={styles.root}>
      {/* 상단: 총자산 (실제 게임 헤더) */}
      <View style={styles.top}>
        <Text style={styles.face}>{face}</Text>
        <Text style={styles.asset}>{formatNumber(asset)}</Text>
        <Text style={styles.won}>원</Text>
        <Text style={[styles.assetPct, { color: upDown(ret) }]}>{pct(ret)}</Text>
        <View style={{ flex: 1 }} />
        <WaveLogo size={22} />
        <Text style={styles.day}>D{day}</Text>
      </View>

      {/* 비교 알약: 예전의 나 vs 지금의 나 */}
      <View style={styles.pills}>
        <View style={styles.pill}>
          <Text style={styles.pillEmoji}>🤖</Text>
          <Text style={styles.pillLabel}>{passedDip ? "예전의 나 🛑" : "예전의 나"}</Text>
          <Text style={[styles.pillValue, { color: upDown(oldRet) }]}>{pct(oldRet)}</Text>
        </View>
        <View style={[styles.pill, passedDip && styles.pillOn]}>
          <Text style={styles.pillEmoji}>🏄</Text>
          <Text style={styles.pillLabel}>지금의 나</Text>
          <Text style={[styles.pillValue, { color: upDown(ret) }]}>{pct(ret)}</Text>
        </View>
      </View>

      {/* 메인 차트 */}
      <View style={styles.chartCard}>
        <View style={styles.stockHead}>
          <Gradient dir="br" colors={[palette.blue[400], palette.blue[700]]} style={styles.logo}>
            <Text style={styles.logoText}>{sim.main.logo}</Text>
          </Gradient>
          <Text style={styles.stockName}>{sim.main.name}</Text>
          <Text style={styles.stockSub}>실제 주가로 만든 파도 🌊</Text>
        </View>
        <View style={{ height: H }}>
          <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
            <Defs>
              <LinearGradient id="sm-fill" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#f87171" stopOpacity={0.3} />
                <Stop offset="1" stopColor="#f87171" stopOpacity={0} />
              </LinearGradient>
            </Defs>
            {[0.3, 0.55, 0.8].map((p) => (
              <Line key={p} x1={0} y1={H * p} x2={W} y2={H * p} stroke="#ffffff" strokeOpacity={0.04} strokeDasharray="2 4" />
            ))}
            <Path d={`${d} L ${tip.x},${H} L ${PTS[0].x},${H} Z`} fill="url(#sm-fill)" />
            <Path d={d} fill="none" stroke="#f87171" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />

            {/* 예전엔 여기서 팔았다 → 이번엔 버텼다 */}
            {passedDip && (
              <G transform={`translate(${PTS[DIP_I].x},${PTS[DIP_I].y})`}>
                <PulseCircle r={[6, 14]} opacity={[0.4, 0]} fill="#22c55e" duration={1400} />
                <Circle r={4.5} fill="#22c55e" stroke="#0a0a0a" strokeWidth={1.5} />
                <Rect x={-44} y={9} width={88} height={16} rx={6} fill="#052e16" stroke="#22c55e" strokeOpacity={0.5} />
                <SvgText y={20.5} textAnchor="middle" fontSize={8.5} fontWeight="900" fill="#86efac">
                  ✋ 이번엔 안 팔았다!
                </SvgText>
              </G>
            )}
            <Circle cx={tip.x} cy={tip.y} r={3.5} fill="#f87171" stroke="#ffffff" strokeWidth={1} />
            <SvgText x={tip.x + 12} y={tip.y + 2} textAnchor="middle" fontSize={15}>
              🏄
            </SvgText>
          </Svg>
        </View>
      </View>

      {/* 종목 목록 (실제 게임의 종목 행) */}
      {ROWS.map((r) => {
        const v = r.values[n - 1]
        const change = (v / r.values[0] - 1) * 10
        return (
          <View key={r.name} style={styles.row}>
            <Sparkline values={r.values.slice(0, Math.max(2, n))} color={upDown(change)} width={54} height={22} strokeWidth={1.6} />
            <Text style={styles.rowName}>{r.name}</Text>
            <Text style={[styles.rowPrice, { color: upDown(change) }]}>{formatNumber(Math.round((r.base * (1 + change / 100)) / 10) * 10)}원</Text>
            <Text style={[styles.rowPct, { color: upDown(change) }]}>
              {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(1)}%
            </Text>
          </View>
        )
      })}

      {/* 결과: 판을 거듭할수록 버릇이 줄어든다 */}
      <View style={styles.habit}>
        <View style={{ flex: 1 }}>
          <Text style={styles.habitLabel}>할수록 줄어드는 버릇</Text>
          <Text style={styles.habitName}>
            {habit.emoji} {habit.name}
          </Text>
          <Pop key={String(passedDip)}>
            <Text style={styles.habitDelta}>
              {habit.progress[0]}번 → {habit.progress[habit.progress.length - 1]}번 🎉
            </Text>
          </Pop>
        </View>
        <View style={styles.bars}>
          {habit.progress.map((c, i) => {
            const last = i === habit.progress.length - 1
            const bar = (
              <Gradient
                dir="b"
                colors={last ? [palette.green[400], palette.emerald[600]] : [alpha(palette.red[400], 0.9 - i * 0.12), alpha(palette.red[500], 0.35)]}
                style={[styles.bar, { height: 6 + (c / maxCount) * 30 }]}
              />
            )
            return (
              <FadeUp key={i} delay={500 + i * 120} distance={10} style={styles.barCell}>
                {last ? <Pulse duration={1200}>{bar}</Pulse> : bar}
                <Text style={styles.barRound}>{i + 1}판</Text>
              </FadeUp>
            )
          })}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { borderRadius: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.08), backgroundColor: "#0b0f14", overflow: "hidden", paddingBottom: 10 },
  top: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingTop: 10 },
  face: { fontSize: 15, color: "#ffffff" },
  asset: { fontSize: 18, fontWeight: "900", color: "#ffffff", fontVariant: ["tabular-nums"] },
  won: { fontSize: 10, color: palette.gray[400] },
  assetPct: { fontSize: 11, fontWeight: "900", marginLeft: 2, fontVariant: ["tabular-nums"] },
  day: { fontSize: 9, fontWeight: "900", color: palette.gray[500], marginLeft: 3, fontVariant: ["tabular-nums"] },
  pills: { flexDirection: "row", gap: 6, paddingHorizontal: 12, marginTop: 7 },
  pill: {
    flex: 1,
    height: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: alpha("#ffffff", 0.08),
    backgroundColor: alpha("#ffffff", 0.04),
  },
  pillOn: { borderColor: alpha(palette.green[500], 0.5), backgroundColor: alpha(palette.green[500], 0.1) },
  pillEmoji: { fontSize: 12, color: "#ffffff" },
  pillLabel: { flex: 1, fontSize: 8.5, fontWeight: "700", color: palette.gray[400] },
  pillValue: { fontSize: 11, fontWeight: "900", fontVariant: ["tabular-nums"] },
  chartCard: { marginHorizontal: 12, marginTop: 7, borderRadius: 12, borderWidth: 1, borderColor: alpha("#ffffff", 0.06), backgroundColor: "#0a0a0a", paddingHorizontal: 4, paddingTop: 6 },
  stockHead: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 6 },
  logo: { width: 18, height: 18, borderRadius: 5, alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: 8, fontWeight: "900", color: "#ffffff" },
  stockName: { fontSize: 11, fontWeight: "900", color: "#ffffff" },
  stockSub: { flex: 1, textAlign: "right", fontSize: 8, color: palette.cyan[300] },
  row: { flexDirection: "row", alignItems: "center", gap: 8, height: 26, marginHorizontal: 12, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: alpha("#ffffff", 0.05) },
  rowName: { flex: 1, fontSize: 10, fontWeight: "900", color: "#ffffff" },
  rowPrice: { fontSize: 10, fontWeight: "900", fontVariant: ["tabular-nums"] },
  rowPct: { width: 44, textAlign: "right", fontSize: 8.5, fontWeight: "700", fontVariant: ["tabular-nums"] },
  habit: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    marginHorizontal: 12,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: alpha(palette.cyan[500], 0.25),
    backgroundColor: alpha(palette.cyan[500], 0.07),
  },
  habitLabel: { fontSize: 8, color: palette.gray[400] },
  habitName: { fontSize: 10, fontWeight: "900", color: "#ffffff", marginTop: 2 },
  habitDelta: { fontSize: 13, fontWeight: "900", color: palette.green[400], marginTop: 2, fontVariant: ["tabular-nums"] },
  bars: { flexDirection: "row", alignItems: "flex-end", gap: 4, width: 120 },
  barCell: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  bar: { width: 18, borderRadius: 4 },
  barRound: { fontSize: 7, color: palette.gray[500], marginTop: 2 },
})
