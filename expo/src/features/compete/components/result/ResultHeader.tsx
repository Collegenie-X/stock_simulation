import { Pressable, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ArrowLeft, Share2 } from "lucide-react-native"
import { alpha, layout, palette } from "@/theme"

interface ResultHeaderProps {
  title: string
  onBack: () => void
  /** 우측 공유 아이콘 표시 (웹과 동일하게 동작 없음) */
  showShare?: boolean
}

/** 결과 화면 공통 상단바 (웹 `fixed top-0 bg-black/90 backdrop-blur-lg`) */
export function ResultHeader({ title, onBack, showShare }: ResultHeaderProps) {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        <Pressable onPress={onBack} style={styles.iconBtn} accessibilityLabel="뒤로가기" hitSlop={8}>
          <ArrowLeft size={16} color={palette.gray[300]} />
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        {showShare ? (
          <Pressable style={styles.iconBtn} accessibilityLabel="공유">
            <Share2 size={16} color={palette.gray[300]} />
          </Pressable>
        ) : (
          <View style={{ width: 32 }} />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 40, backgroundColor: "rgba(0,0,0,0.96)", borderBottomWidth: 1, borderBottomColor: alpha("#ffffff", 0.05) },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: layout.headerHeight, paddingHorizontal: 16 },
  iconBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: alpha("#ffffff", 0.1), alignItems: "center", justifyContent: "center" },
  title: { fontSize: 14, fontWeight: "900", color: "#ffffff" },
})
