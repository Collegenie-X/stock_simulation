import { useEffect, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import Svg, { Defs, G, LinearGradient, Path, Stop, Text as SvgText } from "react-native-svg"
import { Gradient, PressableScale, Pulse, SlideIn } from "@/components/ui"
import { alpha, palette } from "@/theme"
import { DrawPath } from "./DrawPath"
import { PulseCircle } from "./PulseCircle"

const NEWS_FEED = [
  { icon: "🚨", tag: "긴급", tagColor: palette.red[400], bg: alpha(palette.red[500], 0.15), border: alpha(palette.red[500], 0.3), title: "테슬라 실적 쇼크, 예상치 30% 하회" },
  { icon: "⚡", tag: "속보", tagColor: palette.yellow[400], bg: alpha(palette.yellow[500], 0.15), border: alpha(palette.yellow[500], 0.3), title: "엔비디아 신규 AI칩 발표 — 시간외 +8%" },
  { icon: "📉", tag: "경고", tagColor: palette.orange[400], bg: alpha(palette.orange[500], 0.15), border: alpha(palette.orange[500], 0.3), title: "SK하이닉스, HBM 공급 차질 우려" },
]

const LINE = "M0,30 L40,28 L70,32 L100,38 L130,35 L150,40 L165,55 L180,68 L200,62 L230,58 L260,52 L300,48"

export function EventScenarioPreview({ trigger }: { trigger: number }) {
  const W = 300, H = 80
  const [newsIdx, setNewsIdx] = useState(0)
  const [countdown, setCountdown] = useState(15)

  useEffect(() => {
    setNewsIdx(0)
    setCountdown(15)
    const newsTimer = setInterval(() => setNewsIdx((i) => (i + 1) % NEWS_FEED.length), 2400)
    const cdTimer = setInterval(() => setCountdown((c) => (c <= 1 ? 15 : c - 1)), 1000)
    return () => {
      clearInterval(newsTimer)
      clearInterval(cdTimer)
    }
  }, [trigger])

  const news = NEWS_FEED[newsIdx]

  return (
    <Gradient dir="b" colors={["#0a0a0a", "#050505"]} style={styles.root}>
      {/* 충격 차트 */}
      <View style={styles.chart}>
        <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="es-fill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#ef4444" stopOpacity={0.4} />
              <Stop offset="1" stopColor="#ef4444" stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path d={`${LINE} L300,80 L0,80 Z`} fill="url(#es-fill)" />
          <DrawPath d={LINE} fill="none" stroke="#ef4444" strokeWidth={2} strokeLinecap="round" length={500} duration={1000} />
          {/* 폭락 화살표 */}
          <G transform="translate(170,50)">
            <PulseCircle r={[10, 18]} opacity={[0.2, 0.2]} fill="#ef4444" duration={1400} />
            <SvgText textAnchor="middle" y={4} fontSize={14} fill="#ffffff">
              ⚠️
            </SvgText>
          </G>
        </Svg>

        {/* 카운트다운 배지 */}
        <View style={styles.countdown}>
          <Pulse>
            <View style={styles.countdownDot} />
          </Pulse>
          <Text style={styles.countdownText}>{countdown}s</Text>
        </View>

        {/* 가격 변동 */}
        <View style={styles.priceBox}>
          <Text style={styles.priceLabel}>실시간</Text>
          <Text style={styles.priceValue}>-7.42%</Text>
        </View>
      </View>

      {/* 뉴스 카드 */}
      <View style={styles.newsWrap}>
        <SlideIn key={newsIdx} from={12} duration={350} style={[styles.news, { backgroundColor: news.bg, borderColor: news.border }]}>
          <View style={styles.newsHead}>
            <Text style={styles.newsIcon}>{news.icon}</Text>
            <Text style={[styles.newsTag, { color: news.tagColor }]}>{news.tag}</Text>
            <Text style={styles.newsTime}>방금 전</Text>
          </View>
          <Text style={styles.newsTitle}>{news.title}</Text>
        </SlideIn>
      </View>

      {/* 선택지 */}
      <View style={styles.choices}>
        <PressableScale scaleTo={0.95} style={[styles.choice, { backgroundColor: alpha(palette.red[500], 0.2), borderColor: alpha(palette.red[500], 0.3) }]}>
          <Text style={styles.choiceEmoji}>💥</Text>
          <Text style={[styles.choiceText, { color: palette.red[400] }]}>즉시 매도</Text>
        </PressableScale>
        <PressableScale scaleTo={0.95} style={[styles.choice, { backgroundColor: alpha(palette.yellow[500], 0.2), borderColor: alpha(palette.yellow[500], 0.3) }]}>
          <Text style={styles.choiceEmoji}>✂️</Text>
          <Text style={[styles.choiceText, { color: palette.yellow[400] }]}>일부 매도</Text>
        </PressableScale>
        <PressableScale scaleTo={0.95} style={[styles.choice, { backgroundColor: alpha(palette.blue[500], 0.2), borderColor: alpha(palette.blue[500], 0.3) }]}>
          <Text style={styles.choiceEmoji}>💎</Text>
          <Text style={[styles.choiceText, { color: palette.blue[400] }]}>홀딩</Text>
        </PressableScale>
      </View>
    </Gradient>
  )
}

const styles = StyleSheet.create({
  root: { borderRadius: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05), overflow: "hidden" },
  chart: { height: 80 },
  countdown: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.85)",
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: alpha("#ffffff", 0.1),
  },
  countdownDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: palette.red[400] },
  countdownText: { fontSize: 9, fontWeight: "900", color: "#ffffff", fontVariant: ["tabular-nums"] },
  priceBox: { position: "absolute", top: 8, left: 8 },
  priceLabel: { fontSize: 8, color: palette.gray[500] },
  priceValue: { fontSize: 11, fontWeight: "900", color: palette.red[400] },
  newsWrap: { paddingHorizontal: 12, paddingTop: 8 },
  news: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8 },
  newsHead: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  newsIcon: { fontSize: 12, color: "#ffffff" },
  newsTag: { fontSize: 9, fontWeight: "900" },
  newsTime: { marginLeft: "auto", fontSize: 8, color: palette.gray[500] },
  newsTitle: { fontSize: 10, lineHeight: 14, color: palette.gray[200], fontWeight: "700" },
  choices: { flexDirection: "row", gap: 6, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 12 },
  choice: { flex: 1, height: 36, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  choiceEmoji: { fontSize: 9, color: "#ffffff" },
  choiceText: { fontSize: 9, fontWeight: "900" },
})
