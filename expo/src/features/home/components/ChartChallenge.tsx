import { useMemo, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import Svg, { ClipPath, Defs, G, Line, Path, Rect, Text as SvgText } from "react-native-svg"
import { Sparkles, TrendingDown, TrendingUp } from "lucide-react-native"
import { FadeIn, Gradient, PressableScale } from "@/components/ui"
import { alpha, palette } from "@/theme"

function generateChallengeData(): number[] {
  const data: number[] = [50]
  for (let i = 1; i < 30; i++) {
    const prev = data[i - 1]
    const change = (Math.random() - 0.48) * 5
    data.push(Math.max(10, Math.min(90, prev + change)))
  }
  return data
}

function toPath(data: number[], w: number, h: number): string {
  if (data.length < 2) return ""
  const stepX = w / (data.length - 1)
  let d = `M 0 ${h - (data[0] / 100) * h}`
  for (let i = 1; i < data.length; i++) {
    const x = i * stepX
    const y = h - (data[i] / 100) * h
    const px = (i - 1) * stepX
    const py = h - (data[i - 1] / 100) * h
    d += ` C ${px + stepX * 0.4} ${py}, ${x - stepX * 0.4} ${y}, ${x} ${y}`
  }
  return d
}

interface ChartChallengeProps {
  onStartQuickGame: () => void
}

export default function ChartChallenge({ onStartQuickGame }: ChartChallengeProps) {
  const [guess, setGuess] = useState<"up" | "down" | null>(null)
  const [revealed, setRevealed] = useState(false)
  const chartData = useMemo(() => generateChallengeData(), [])

  const visibleData = chartData.slice(0, 20)
  const actualDirection = chartData[chartData.length - 1] > chartData[19] ? "up" : "down"

  const W = 280
  const H = 80
  const splitX = (W * 19) / 29

  const visiblePath = toPath(visibleData, splitX, H)
  const fullPath = toPath(chartData, W, H)

  const handleGuess = (direction: "up" | "down") => {
    setGuess(direction)
    setTimeout(() => setRevealed(true), 300)
  }

  const isCorrect = guess === actualDirection

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <View style={styles.head}>
          <View style={styles.headLeft}>
            <View style={styles.iconBox}>
              <Sparkles size={16} color={palette.yellow[400]} />
            </View>
            <View>
              <Text style={styles.title}>차트 퀴즈</Text>
              <Text style={styles.subtitle}>다음 흐름을 맞춰보세요!</Text>
            </View>
          </View>
          {revealed && (
            <View style={[styles.result, { backgroundColor: alpha(isCorrect ? palette.emerald[500] : palette.red[500], 0.2) }]}>
              <Text style={[styles.resultText, { color: isCorrect ? palette.emerald[400] : palette.red[400] }]}>
                {isCorrect ? "정답!" : "아쉬워요"}
              </Text>
            </View>
          )}
        </View>

        <View>
          <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height={80} preserveAspectRatio="none">
            <Defs>
              <ClipPath id="hidden-clip">
                <Rect x={splitX} y={0} width={W - splitX} height={H} />
              </ClipPath>
            </Defs>

            <Path d={visiblePath} fill="none" stroke="#F04452" strokeWidth={2} strokeLinecap="round" />

            {revealed && (
              <G clipPath="url(#hidden-clip)">
                <Path d={fullPath} fill="none" stroke={actualDirection === "up" ? "#F04452" : "#3182F6"} strokeWidth={2} strokeLinecap="round" />
              </G>
            )}

            {!revealed && (
              <>
                <Line x1={splitX} y1={0} x2={splitX} y2={H} stroke="white" strokeWidth={1} strokeDasharray="3 3" opacity={0.3} />
                <SvgText x={splitX + 8} y={14} fill="white" fontSize={10} opacity={0.5}>
                  ?
                </SvgText>
              </>
            )}
          </Svg>
        </View>

        {!guess ? (
          <View style={styles.buttons}>
            <PressableScale
              onPress={() => handleGuess("up")}
              scaleTo={0.95}
              style={[styles.guessBtn, { backgroundColor: alpha(palette.red[500], 0.1), borderColor: alpha(palette.red[500], 0.2) }]}
            >
              <TrendingUp size={16} color={palette.red[400]} />
              <Text style={[styles.guessText, { color: palette.red[400] }]}>상승</Text>
            </PressableScale>
            <PressableScale
              onPress={() => handleGuess("down")}
              scaleTo={0.95}
              style={[styles.guessBtn, { backgroundColor: alpha(palette.blue[500], 0.1), borderColor: alpha(palette.blue[500], 0.2) }]}
            >
              <TrendingDown size={16} color={palette.blue[400]} />
              <Text style={[styles.guessText, { color: palette.blue[400] }]}>하락</Text>
            </PressableScale>
          </View>
        ) : (
          <FadeIn>
            <PressableScale onPress={onStartQuickGame} scaleTo={0.95} style={styles.ctaWrap}>
              <Gradient dir="r" colors={[alpha(palette.orange[500], 0.2), alpha(palette.red[500], 0.2)]} style={styles.cta}>
                <Text style={styles.ctaText}>실전에서 도전하기 →</Text>
              </Gradient>
            </PressableScale>
          </FadeIn>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { marginHorizontal: 20 },
  card: { backgroundColor: "#1e1e2e", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05), overflow: "hidden" },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  headLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBox: { width: 28, height: 28, borderRadius: 8, backgroundColor: alpha(palette.yellow[500], 0.2), alignItems: "center", justifyContent: "center" },
  title: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  subtitle: { fontSize: 10, color: palette.gray[500] },
  result: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999 },
  resultText: { fontSize: 12, fontWeight: "700" },
  buttons: { flexDirection: "row", gap: 8, marginTop: 12 },
  guessBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  guessText: { fontWeight: "700", fontSize: 14 },
  ctaWrap: { marginTop: 12, borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: alpha(palette.orange[500], 0.3) },
  cta: { paddingVertical: 10, alignItems: "center", justifyContent: "center" },
  ctaText: { color: palette.orange[400], fontWeight: "700", fontSize: 14 },
})
