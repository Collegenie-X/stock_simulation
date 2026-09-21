import { StyleSheet, Text, View } from "react-native"
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from "react-native-svg"
import { Gradient, Heartbeat, Pop, Pulse } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { monotonePath } from "@/components/charts"
import onboardingData from "../data.json"
import { PulseCircle } from "./PulseCircle"
import { densify, useReveal } from "./useReveal"

const game = onboardingData.strategyGame
const SUB = 4
const TURNS = game.turns.length - 1 // 8턴
const W = 300, H = 120

const VALUES = densify(game.turns, SUB)
const PTS = VALUES.map((v, i) => ({ x: 8 + (i * (W - 56)) / (VALUES.length - 1), y: H - 12 - ((v - 35) / 58) * (H - 34) }))
const BUY_I = game.buyTurn * SUB
const SELL_I = game.sellTurn * SUB

/** 슬라이드 4 — 실제 "전략 8턴 게임" 화면을 본뜬 미리보기: 힌트대로 사고, 기다리고, 판다 */
export function StrategyGamePreview() {
  const n = useReveal(PTS.length, 130, 3000)
  const turn = Math.max(1, Math.min(TURNS, Math.ceil((n - 1) / SUB)))
  const shown = PTS.slice(0, n)
  const d = monotonePath(shown)
  const tip = shown[shown.length - 1]
  const bought = n > BUY_I
  const sold = n >= PTS.length
  const hint = sold ? game.doneHint : (game.hints.find((h) => turn <= h.until) ?? game.doneHint)
  const score = sold ? 320 : bought ? 120 : 0
  const price = Math.round(VALUES[n - 1] * 1000)
  // 지금 눌러야 할 버튼 (게임이 가르쳐 주는 행동)
  const act = turn === game.buyTurn && !bought ? "buy" : turn === game.sellTurn && !sold ? "sell" : sold ? "none" : "hold"

  return (
    <View style={styles.root}>
      {/* 게임 헤더 */}
      <View style={styles.header}>
        <View style={styles.close}>
          <Text style={styles.closeText}>✕</Text>
        </View>
        <Text style={styles.headerEmoji}>{game.emoji}</Text>
        <Text style={styles.headerTitle}>
          {game.name} · 턴 {turn}/{TURNS}
        </Text>
        <View style={{ flex: 1 }} />
        <Pop key={score} style={styles.scorePill}>
          <Text style={styles.scoreText}>{score}점</Text>
        </Pop>
      </View>

      {/* 턴 진행바 */}
      <View style={styles.progress}>
        {Array.from({ length: TURNS }).map((_, i) => {
          const bar = <View style={[styles.progressBar, { backgroundColor: i + 1 < turn ? palette.indigo[500] : i + 1 === turn ? palette.yellow[400] : "#1a1a1a" }]} />
          return i + 1 === turn ? (
            <Pulse key={i} duration={900} style={{ flex: 1 }}>
              {bar}
            </Pulse>
          ) : (
            <View key={i} style={{ flex: 1 }}>
              {bar}
            </View>
          )
        })}
      </View>

      {/* 차트 */}
      <View style={styles.chartCard}>
        <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
          <Defs>
            <LinearGradient id="sg-fill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#f87171" stopOpacity={0.3} />
              <Stop offset="1" stopColor="#f87171" stopOpacity={0} />
            </LinearGradient>
          </Defs>
          {[0.3, 0.55, 0.8].map((p) => (
            <Line key={p} x1={0} y1={H * p} x2={W} y2={H * p} stroke="#ffffff" strokeOpacity={0.04} strokeDasharray="2 4" />
          ))}
          {/* 쌍바닥 표시 */}
          {n > BUY_I - 2 && (
            <G>
              <Line x1={PTS[2 * SUB].x - 10} y1={PTS[2 * SUB].y + 7} x2={PTS[BUY_I].x + 10} y2={PTS[BUY_I].y + 7} stroke="#facc15" strokeWidth={1.2} strokeDasharray="4 3" />
              <SvgText x={(PTS[2 * SUB].x + PTS[BUY_I].x) / 2} y={PTS[BUY_I].y + 19} textAnchor="middle" fontSize={8.5} fontWeight="900" fill="#facc15">
                바닥 두 번 ✌️
              </SvgText>
            </G>
          )}
          <Path d={`${d} L ${tip.x},${H} L ${PTS[0].x},${H} Z`} fill="url(#sg-fill)" />
          <Path d={d} fill="none" stroke="#f87171" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />

          {bought && (
            <G transform={`translate(${PTS[BUY_I].x},${PTS[BUY_I].y})`}>
              <PulseCircle r={[6, 14]} opacity={[0.4, 0]} fill="#ef4444" duration={1400} />
              <Circle r={4.5} fill="#ef4444" stroke="#0a0a0a" strokeWidth={1.5} />
              <SvgText y={-9} textAnchor="middle" fontSize={9} fontWeight="900" fill="#fca5a5">
                🛒 샀다!
              </SvgText>
            </G>
          )}
          {sold && (
            <G transform={`translate(${PTS[SELL_I].x},${PTS[SELL_I].y})`}>
              <Circle r={4.5} fill="#3b82f6" stroke="#0a0a0a" strokeWidth={1.5} />
              <SvgText x={-8} y={-8} textAnchor="end" fontSize={9} fontWeight="900" fill="#93c5fd">
                💸 팔았다! +38%
              </SvgText>
            </G>
          )}

          {/* 현재가 꼬리표 */}
          {!sold && <Circle cx={tip.x} cy={tip.y} r={3.5} fill="#f87171" stroke="#ffffff" strokeWidth={1} />}
          <G transform={`translate(${tip.x + 8},${tip.y - 8})`}>
            <Rect width={40} height={16} rx={5} fill="#ef4444" />
            <SvgText x={20} y={11.5} textAnchor="middle" fontSize={8.5} fontWeight="900" fill="#ffffff">
              {price.toLocaleString()}
            </SvgText>
          </G>
        </Svg>
      </View>

      {/* 힌트 — 게임이 전략을 알려준다 */}
      <Pop key={hint.text} style={[styles.hint, sold && styles.hintDone]}>
        <Text style={styles.hintEmoji}>{hint.emoji}</Text>
        <Text style={[styles.hintText, sold && { color: palette.green[200] }]}>{hint.text}</Text>
      </Pop>

      {/* 액션 버튼 (실제 게임과 같은 3버튼) */}
      <View style={styles.actions}>
        <ActionButton on={act === "buy"} label="🛒 살래" color={palette.red[400]} bg={palette.red[500]} />
        <ActionButton on={act === "sell"} label="💸 팔래" color={palette.blue[400]} bg={palette.blue[500]} />
        <ActionButton on={act === "hold"} label="⏸️ 기다릴게" color={palette.gray[300]} bg={palette.gray[500]} />
      </View>
    </View>
  )
}

function ActionButton({ on, label, color, bg }: { on: boolean; label: string; color: string; bg: string }) {
  const button = (
    <Gradient dir="b" colors={[alpha(bg, on ? 0.45 : 0.14), alpha(bg, on ? 0.25 : 0.08)]} style={[styles.action, { borderColor: alpha(bg, on ? 0.9 : 0.2) }]}>
      <Text style={[styles.actionText, { color: on ? "#ffffff" : color, opacity: on ? 1 : 0.6 }]}>{label}</Text>
      {on && <Text style={styles.tap}>👆</Text>}
    </Gradient>
  )
  return on ? (
    <Heartbeat duration={800} scaleTo={1.06} style={{ flex: 1 }}>
      {button}
    </Heartbeat>
  ) : (
    <View style={{ flex: 1 }}>{button}</View>
  )
}

const styles = StyleSheet.create({
  root: { borderRadius: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.08), backgroundColor: "#000000", overflow: "hidden", paddingBottom: 12 },
  header: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingTop: 10, paddingBottom: 8 },
  close: { width: 20, height: 20, borderRadius: 10, backgroundColor: alpha("#ffffff", 0.08), alignItems: "center", justifyContent: "center" },
  closeText: { fontSize: 9, color: palette.gray[400] },
  headerEmoji: { fontSize: 14, color: "#ffffff" },
  headerTitle: { fontSize: 11, fontWeight: "900", color: "#ffffff", fontVariant: ["tabular-nums"] },
  scorePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999, backgroundColor: alpha(palette.yellow[500], 0.15), borderWidth: 1, borderColor: alpha(palette.yellow[500], 0.3) },
  scoreText: { fontSize: 10, fontWeight: "900", color: palette.yellow[400], fontVariant: ["tabular-nums"] },
  progress: { flexDirection: "row", gap: 3, paddingHorizontal: 10, marginBottom: 8 },
  progressBar: { height: 4, borderRadius: 2 },
  chartCard: { height: 128, marginHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: alpha("#ffffff", 0.06), backgroundColor: "#0a0a0a", paddingHorizontal: 4, paddingTop: 4 },
  hint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 10,
    marginTop: 8,
    minHeight: 30,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: alpha(palette.yellow[500], 0.25),
    backgroundColor: alpha(palette.yellow[500], 0.08),
  },
  hintDone: { borderColor: alpha(palette.green[500], 0.35), backgroundColor: alpha(palette.green[500], 0.12) },
  hintEmoji: { fontSize: 14, color: "#ffffff" },
  hintText: { flex: 1, fontSize: 10, lineHeight: 14, fontWeight: "700", color: palette.yellow[100] },
  actions: { flexDirection: "row", gap: 6, paddingHorizontal: 10, marginTop: 8 },
  action: { height: 38, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  actionText: { fontSize: 11, fontWeight: "900" },
  tap: { position: "absolute", right: 2, bottom: -6, fontSize: 15 },
})
