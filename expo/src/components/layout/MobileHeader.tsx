/**
 * 모바일 헤더 (웹 components/mobile-header.tsx 포팅)
 */
import React from "react"
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ArrowLeft, Bell, MoreHorizontal, Settings } from "lucide-react-native"
import { Button } from "@/components/ui/Button"
import { alpha, layout, palette } from "@/theme"

interface MobileHeaderProps {
  title?: string
  showBack?: boolean
  showSettings?: boolean
  showNotification?: boolean
  showMore?: boolean
  onBack?: () => void
  rightAction?: React.ReactNode
  transparent?: boolean
  style?: StyleProp<ViewStyle>
}

export function MobileHeader({ title, showBack = false, showSettings = false, showNotification = true, showMore = false, onBack, rightAction, transparent = false, style }: MobileHeaderProps) {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const handleBack = () => {
    if (onBack) onBack()
    else if (router.canGoBack()) router.back()
    else router.replace("/home")
  }

  return (
    <View style={[styles.header, { paddingTop: insets.top }, !transparent && styles.solid, style]}>
      <View style={styles.row}>
        <View style={styles.left}>
          {showBack ? (
            <Button variant="ghost" size="icon" onPress={handleBack} style={{ marginLeft: -8 }} accessibilityLabel="뒤로가기">
              <ArrowLeft size={24} color="#ffffff" />
            </Button>
          ) : (
            <Text style={{ fontSize: 24 }}>🌊</Text>
          )}
          <Text numberOfLines={1} style={[styles.title, showBack ? { fontSize: 18, color: "#ffffff" } : { fontSize: 20, color: palette.blue[400] }]}>
            {title || "파도를 타라"}
          </Text>
        </View>

        <View style={styles.right}>
          {rightAction}
          {showNotification && (
            <Button variant="ghost" size="icon" accessibilityLabel="알림">
              <Bell size={20} color={palette.gray[400]} />
              <View style={styles.badge} />
            </Button>
          )}
          {showSettings && (
            <Button variant="ghost" size="icon" accessibilityLabel="설정">
              <Settings size={20} color={palette.gray[400]} />
            </Button>
          )}
          {showMore && (
            <Button variant="ghost" size="icon" accessibilityLabel="더보기">
              <MoreHorizontal size={20} color={palette.gray[400]} />
            </Button>
          )}
        </View>
      </View>
    </View>
  )
}

export function TransparentHeader(props: MobileHeaderProps) {
  return <MobileHeader {...props} transparent />
}

const styles = StyleSheet.create({
  header: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 40 },
  solid: { backgroundColor: "#191919", borderBottomWidth: 1, borderBottomColor: alpha("#ffffff", 0.05) },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: layout.headerHeight, paddingHorizontal: 16 },
  left: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  right: { flexDirection: "row", alignItems: "center", gap: 4 },
  title: { fontWeight: "700", flexShrink: 1 },
  badge: { position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: palette.red[500] },
})
