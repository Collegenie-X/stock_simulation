import { StyleSheet, Text, View } from "react-native"
import { useRouter, type Href } from "expo-router"
import { FlaskConical, Waves } from "lucide-react-native"
import { PressableScale } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { gradeStyle } from "../../utils/gradeStyles"
import { ScoreBar } from "./ScoreBar"
import { StarRow } from "./StarRow"
import type { PracticeRecord } from "./types"

export function PracticeCard({ item, type }: { item: PracticeRecord; type: "stock" | "wave" }) {
  const router = useRouter()
  const grade = gradeStyle(item.grade)
  const isHighScore = item.totalScore / item.maxScore >= 0.85

  return (
    <PressableScale
      scaleTo={0.98}
      onPress={() => router.push(`/compete/result/${type}/${item.id}` as Href)}
      style={[
        styles.card,
        type === "stock"
          ? { backgroundColor: "#110e1e", borderColor: alpha(palette.purple[500], 0.2) }
          : { backgroundColor: "#0e1319", borderColor: alpha(palette.cyan[500], 0.2) },
      ]}
    >
      <View style={styles.top}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={styles.metaRow}>
            {item.isExperiment && (
              <View style={styles.expBadge}>
                <FlaskConical size={10} color={palette.purple[300]} />
                <Text style={styles.expText}>실험</Text>
              </View>
            )}
            <Text style={styles.gray12}>{item.date.slice(5)}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ fontSize: 18, color: "#ffffff" }}>{item.patternEmoji}</Text>
            {!!item.stockEmoji && <Text style={{ fontSize: 16, color: "#ffffff" }}>{item.stockEmoji}</Text>}
            <Text numberOfLines={1} style={styles.name}>
              {item.patternName}
            </Text>
          </View>
          {!!item.stockName && (
            <Text style={[styles.gray12, { marginTop: 2 }]}>
              {item.stockName} · {item.rounds}라운드
            </Text>
          )}
        </View>
        <View style={{ alignItems: "flex-end", flexShrink: 0 }}>
          <View style={styles.gradeRow}>
            <View style={[styles.gradeBox, { backgroundColor: grade.bg, borderColor: grade.border }]}>
              <Text style={{ fontSize: 12, fontWeight: "900", color: grade.text }}>{item.grade}</Text>
            </View>
            <StarRow count={item.stars} />
          </View>
          <Text style={styles.total}>
            {item.totalScore}
            <Text style={{ color: palette.gray[600], fontSize: 12 }}>/{item.maxScore}</Text>
          </Text>
        </View>
      </View>

      {/* Score bar */}
      <View style={{ marginVertical: 5 }}>
        <ScoreBar score={item.totalScore} max={item.maxScore} />
      </View>

      {/* Round mini badges */}
      <View style={styles.roundRow}>
        {item.roundResults.map((r) => {
          const g = gradeStyle(r.grade)
          return (
            <View key={r.round} style={[styles.roundCell, { backgroundColor: g.bg, borderColor: g.border }]}>
              <Text style={[styles.roundText, { color: g.text }]}>{r.emoji}</Text>
              <Text style={[styles.roundText, { color: g.text }]}>{r.score}점</Text>
            </View>
          )
        })}
      </View>

      {/* 파도 정확도 (wave only) */}
      {item.wave3Accuracy !== undefined && (
        <View style={styles.waveRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Waves size={12} color={palette.cyan[400]} />
            <Text style={{ fontSize: 12, color: palette.cyan[400], fontWeight: "700" }}>3파 {item.wave3Accuracy}%</Text>
          </View>
          {item.correctionAccuracy !== undefined && <Text style={styles.gray12}>조정 {item.correctionAccuracy}%</Text>}
        </View>
      )}

      <Text style={[styles.highlight, { color: isHighScore ? alpha(palette.yellow[300], 0.7) : palette.gray[400] }]}>{item.highlight}</Text>
    </PressableScale>
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, borderWidth: 1, overflow: "hidden" },
  top: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, gap: 8 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" },
  expBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: alpha(palette.purple[500], 0.2),
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: alpha(palette.purple[500], 0.3),
  },
  expText: { fontSize: 10, fontWeight: "700", color: palette.purple[300] },
  gray12: { fontSize: 12, color: palette.gray[400] },
  name: { fontSize: 14, fontWeight: "700", color: "#ffffff", flexShrink: 1 },
  gradeRow: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "flex-end", marginBottom: 4 },
  gradeBox: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
  total: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  roundRow: { flexDirection: "row", gap: 6, marginVertical: 5 },
  roundCell: { flex: 1, alignItems: "center", paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  roundText: { fontSize: 10, fontWeight: "900" },
  waveRow: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 5 },
  highlight: { fontSize: 12, marginTop: 5, fontWeight: "600" },
})
