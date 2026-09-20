import { StyleSheet, Text, View } from "react-native"
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from "react-native-svg"
import { Screen } from "@/components/layout"
import { Gradient, PressableScale } from "@/components/ui"
import type { GameScenario } from "@/data/game-scenarios/types"
import type { GameState } from "@/lib/scenario/engine"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"

// ============================================================
// 종료 화면
// ============================================================
export function FinishedScreen({ scenario, state, onRestart, onHome }: { scenario: GameScenario; state: GameState; onRestart: () => void; onHome: () => void }) {
  const r = state.result!
  const stars = { S: 5, A: 4, B: 3, C: 2, D: 1, F: 0 }[r.grade] || 0

  return (
    <Screen bg="#000000" contentStyle={{ padding: 20, justifyContent: "center" }}>
      <Gradient dir="br" colors={[alpha(palette.purple[900], 0.4), alpha(palette.blue[900], 0.4)]} style={styles.card}>
        {/* 웹의 bg-clip-text 그라데이션 글자 → SVG 텍스트 그라데이션 */}
        <Svg width={120} height={84} style={{ marginBottom: 8 }}>
          <Defs>
            <LinearGradient id="gradeGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={palette.yellow[300]} />
              <Stop offset="1" stopColor={palette.orange[400]} />
            </LinearGradient>
          </Defs>
          <SvgText x={60} y={68} textAnchor="middle" fontSize={72} fontWeight="900" fill="url(#gradeGrad)">
            {r.grade}
          </SvgText>
        </Svg>
        <Text style={{ fontSize: 24, marginBottom: 16, color: "#ffffff" }}>
          {"⭐".repeat(stars)}
          {"☆".repeat(5 - stars)}
        </Text>

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 24, alignSelf: "stretch" }}>
          <View style={styles.stat}>
            <Text style={styles.label}>수익률</Text>
            <Text style={{ fontSize: 20, fontWeight: "700", color: r.profitRate >= 0 ? palette.red[400] : palette.blue[400] }}>
              {r.profitRate >= 0 ? "+" : ""}
              {(r.profitRate * 100).toFixed(1)}%
            </Text>
            <Text style={[styles.label, { marginTop: 4 }]}>{formatNumber(r.finalAssetKrw)}원</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.label}>감각 점수</Text>
            <Text style={{ fontSize: 20, fontWeight: "700", color: palette.purple[400] }}>{r.senseScore}</Text>
            <Text style={[styles.label, { marginTop: 4 }]}>결정 {state.decisions.length}회</Text>
          </View>
        </View>

        {r.badges.length > 0 && (
          <View style={[styles.stat, { flex: 0, alignSelf: "stretch", marginBottom: 16 }]}>
            <Text style={[styles.label, { marginBottom: 8 }]}>획득 배지</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
              {r.badges.map((b) => (
                <View key={b} style={styles.badge}>
                  <Text style={{ fontSize: 11, color: palette.yellow[300] }}>{b}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Text style={{ fontSize: 12, color: palette.gray[400], marginBottom: 4 }}>실전 모델: {scenario.title}</Text>
      </Gradient>

      <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
        <PressableScale onPress={onRestart} style={[styles.btn, { backgroundColor: palette.purple[500] }]}>
          <Text style={styles.btnText}>한 판 더</Text>
        </PressableScale>
        <PressableScale onPress={onHome} style={[styles.btn, { backgroundColor: palette.gray[800] }]}>
          <Text style={styles.btnText}>시나리오 목록</Text>
        </PressableScale>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: alpha(palette.purple[500], 0.4), borderRadius: 24, padding: 24, alignItems: "center", overflow: "hidden" },
  stat: { flex: 1, backgroundColor: alpha("#000000", 0.4), borderRadius: 12, padding: 12, alignItems: "center" },
  label: { fontSize: 10, color: palette.gray[500] },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999, backgroundColor: alpha(palette.yellow[500], 0.2) },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  btnText: { color: "#ffffff", fontWeight: "700", fontSize: 16 },
})
