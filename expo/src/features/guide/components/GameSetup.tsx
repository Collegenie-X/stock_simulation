import { ScrollView, StyleSheet, Text, View } from "react-native"
import { Check, Clock, Coins } from "lucide-react-native"
import { Screen } from "@/components/layout"
import { Gradient, PressableScale } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { AMOUNTS, DURATIONS } from "../config"

interface Props {
  duration: number
  initialCash: number
  onDurationChange: (value: number) => void
  onInitialCashChange: (value: number) => void
  onConfirm: () => void
}

/** 게임 설정 화면 */
export function GameSetup({ duration, initialCash, onDurationChange, onInitialCashChange, onConfirm }: Props) {
  return (
    <Screen bg="#191919" scroll={false}>
      <View style={styles.screen}>
      <ScrollView style={styles.flex1} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>게임 설정</Text>
        <Text style={styles.lead}>나에게 맞는 난이도를 선택하세요</Text>

        <View style={{ gap: 32 }}>
          {/* Duration Selection */}
          <View>
            <View style={styles.sectionHead}>
              <Clock size={20} color={palette.blue[400]} />
              <Text style={styles.h2}>기간 선택</Text>
            </View>
            <View style={styles.grid}>
              {DURATIONS.map((opt) => {
                const selected = duration === opt.value
                return (
                  <PressableScale
                    key={opt.value}
                    onPress={() => onDurationChange(opt.value)}
                    style={[styles.durationCard, selected ? styles.durationSelected : styles.cardIdle]}
                  >
                    <Text style={styles.durationLabel}>{opt.label}</Text>
                    <Text style={styles.durationTime}>평균 {opt.time} 소요</Text>
                    {selected && (
                      <View style={styles.check}>
                        <Check size={12} color="#ffffff" />
                      </View>
                    )}
                  </PressableScale>
                )
              })}
            </View>
          </View>

          {/* Amount Selection */}
          <View>
            <View style={styles.sectionHead}>
              <Coins size={20} color={palette.yellow[400]} />
              <Text style={styles.h2}>투자 금액</Text>
            </View>
            <View style={[styles.grid, { gap: 8 }]}>
              {AMOUNTS.map((opt) => {
                const selected = initialCash === opt.value
                return (
                  <PressableScale
                    key={opt.value}
                    onPress={() => onInitialCashChange(opt.value)}
                    style={[styles.amountCard, selected ? styles.amountSelected : styles.cardIdle]}
                  >
                    <Text style={[styles.amountText, { color: selected ? palette.yellow[400] : palette.gray[400] }]}>{opt.label}</Text>
                  </PressableScale>
                )
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PressableScale onPress={onConfirm} scaleTo={0.98} style={styles.ctaWrap}>
          <Gradient dir="r" colors={[palette.blue[600], palette.cyan[600]]} style={styles.cta}>
            <Text style={styles.ctaText}>설정 완료하고 시작하기</Text>
          </Gradient>
        </PressableScale>
      </View>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24 },
  flex1: { flex: 1 },
  scroll: { paddingBottom: 8 },
  h1: { fontSize: 24, fontWeight: "700", color: "#ffffff", marginBottom: 8 },
  lead: { fontSize: 16, color: palette.gray[400], marginBottom: 32 },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  h2: { fontSize: 18, fontWeight: "700", color: "#ffffff" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  cardIdle: { backgroundColor: "#252525", borderColor: "transparent" },
  durationCard: { flexBasis: "47%", flexGrow: 1, padding: 16, borderRadius: 16, borderWidth: 2, overflow: "hidden" },
  durationSelected: { backgroundColor: alpha(palette.blue[500], 0.2), borderColor: palette.blue[500] },
  durationLabel: { fontSize: 18, fontWeight: "700", color: "#ffffff", marginBottom: 4 },
  durationTime: { fontSize: 14, color: palette.gray[400] },
  check: { position: "absolute", top: 12, right: 12, backgroundColor: palette.blue[500], borderRadius: 9999, padding: 4 },
  amountCard: { width: "31.5%", padding: 12, borderRadius: 12, borderWidth: 2, alignItems: "center" },
  amountSelected: { backgroundColor: alpha(palette.yellow[500], 0.2), borderColor: palette.yellow[500] },
  amountText: { fontSize: 14, fontWeight: "500", textAlign: "center" },
  footer: { marginTop: 32 },
  ctaWrap: { borderRadius: 16, overflow: "hidden", boxShadow: "0 10px 15px rgba(30,58,138,0.2)" },
  cta: { height: 56, alignItems: "center", justifyContent: "center" },
  ctaText: { color: "#ffffff", fontWeight: "700", fontSize: 18 },
})
