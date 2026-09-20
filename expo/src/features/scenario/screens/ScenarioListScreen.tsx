import { StyleSheet, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { Screen } from "@/components/layout"
import { PressableScale } from "@/components/ui"
import { listScenarios } from "@/lib/scenario/loader"
import { alpha, palette } from "@/theme"

export default function ScenarioListScreen() {
  const router = useRouter()
  const index = listScenarios()

  return (
    <Screen bg="#000000" contentStyle={{ padding: 20 }}>
      <Text style={styles.h1}>🎬 시나리오</Text>
      <Text style={styles.lead}>실제 사건으로 만들어진 한 판. 차트 감각을 키우세요.</Text>

      {/* 플레이 가능 */}
      <View style={{ gap: 12 }}>
        {index.scenarios
          .filter((s) => s.available !== false)
          .map((s) => (
            <PressableScale key={s.id} scaleTo={0.98} onPress={() => router.push(`/scenario/${s.id}`)} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.era, { marginBottom: 4 }]}>{s.era}</Text>
                  <Text style={styles.title}>{s.title}</Text>
                  <Text style={{ fontSize: 12, color: palette.gray[400] }}>{s.subtitle}</Text>
                </View>
                <Text style={{ fontSize: 24, marginLeft: 12, color: "#ffffff" }}>{s.thumbnail}</Text>
              </View>
              <Text style={[styles.era, { marginTop: 8 }]}>{s.period}</Text>

              <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>소요</Text>
                  <Text style={styles.statValue}>~{s.estimatedPlayTimeMin}분</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>종목</Text>
                  <Text style={styles.statValue}>{s.stockCount}종</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>블랙스완</Text>
                  <Text style={styles.statValue}>{s.blackswanCount}회</Text>
                </View>
              </View>

              {s.highlights && (
                <View style={styles.highlights}>
                  {s.highlights.map((h, i) => (
                    <Text key={i} style={{ fontSize: 11, color: palette.gray[400] }}>
                      • {h}
                    </Text>
                  ))}
                </View>
              )}
            </PressableScale>
          ))}
      </View>

      {/* Coming Soon */}
      {index.comingSoon && index.comingSoon.length > 0 && (
        <View style={{ marginTop: 32 }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: palette.gray[500], marginBottom: 12 }}>🔒 곧 공개</Text>
          <View style={{ gap: 8 }}>
            {index.comingSoon.map((s) => (
              <View key={s.id} style={styles.soon}>
                <Text style={[styles.era, { marginBottom: 4 }]}>{s.era}</Text>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#ffffff" }}>{s.title}</Text>
                <Text style={{ fontSize: 11, color: palette.gray[500], marginTop: 4 }}>{s.period}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  h1: { fontSize: 24, fontWeight: "700", color: "#ffffff", marginBottom: 8 },
  lead: { fontSize: 14, color: palette.gray[400], marginBottom: 24 },
  card: { backgroundColor: palette.gray[900], borderWidth: 1, borderColor: palette.gray[800], borderRadius: 16, padding: 20 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 },
  era: { fontSize: 12, color: palette.gray[500] },
  title: { fontSize: 18, fontWeight: "700", color: "#ffffff", marginBottom: 4 },
  stat: { flex: 1, backgroundColor: alpha("#000000", 0.4), borderRadius: 8, padding: 8, alignItems: "center" },
  statLabel: { fontSize: 10, color: palette.gray[500] },
  statValue: { fontSize: 12, fontWeight: "700", color: "#ffffff" },
  highlights: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: alpha(palette.gray[800], 0.5), gap: 4 },
  soon: { backgroundColor: alpha(palette.gray[900], 0.5), borderWidth: 1, borderColor: palette.gray[800], borderRadius: 12, padding: 16, opacity: 0.6 },
})
