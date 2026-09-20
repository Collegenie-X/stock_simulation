import { StyleSheet, Text, View } from "react-native"
import { Waves, Zap } from "lucide-react-native"
import { alpha, palette } from "@/theme"
import { WaveAccuracyBar } from "./WaveAccuracyBar"

interface WaveAccuracyAnalysisProps {
  wave3Accuracy?: number
  correctionAccuracy?: number
  /** 전체 점수율 (0~100) */
  pct: number
}

/** 파동 정확도 분석 (파도 연습 결과 전용) */
export function WaveAccuracyAnalysis({ wave3Accuracy, correctionAccuracy, pct }: WaveAccuracyAnalysisProps) {
  return (
    <View style={styles.panel}>
      <View style={styles.head}>
        <Waves size={20} color={palette.cyan[400]} />
        <Text style={styles.title}>파동 정확도 분석</Text>
      </View>
      <View style={{ gap: 12 }}>
        {wave3Accuracy !== undefined && <WaveAccuracyBar label="3파 집중도" value={wave3Accuracy} color="cyan" />}
        {correctionAccuracy !== undefined && <WaveAccuracyBar label="조정파 대응" value={correctionAccuracy} color="blue" />}
        <WaveAccuracyBar label="전체 점수율" value={Math.round(pct)} color="purple" />
      </View>

      <View style={styles.comment}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Zap size={16} color={palette.yellow[400]} />
          <Text style={{ fontSize: 12, fontWeight: "700", color: palette.yellow[400] }}>파동 분석 코멘트</Text>
        </View>
        <Text style={styles.commentText}>
          {wave3Accuracy !== undefined && wave3Accuracy >= 90
            ? "3파 포착 능력이 탁월합니다. 엘리엇 파동의 핵심을 정확히 이해하고 있어요."
            : wave3Accuracy !== undefined && wave3Accuracy >= 75
              ? "3파 감지는 좋지만 조정파 대응을 더 연습하면 수익이 크게 늘 거예요."
              : "파동 패턴을 꾸준히 연습하면 타이밍 정확도가 올라갑니다."}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  panel: { backgroundColor: "#0f0f0f", borderRadius: 16, borderWidth: 1, borderColor: alpha(palette.cyan[500], 0.2), padding: 16, marginBottom: 16 },
  head: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  title: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  comment: { marginTop: 16, backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 12, padding: 12 },
  commentText: { fontSize: 12, lineHeight: 20, color: palette.gray[300] },
})
