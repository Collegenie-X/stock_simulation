/**
 * 모달/바텀시트 — 웹의 `fixed inset-0` 오버레이 + `.modal-content` 를 대체
 *   <BottomSheet visible onClose>…</BottomSheet>   아래에서 올라오는 시트
 *   <CenterModal visible onClose>…</CenterModal>   화면 중앙 다이얼로그
 */
import React from "react"
import { Modal, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { colors, layout, radius } from "@/theme"

interface SheetProps {
  visible: boolean
  onClose?: () => void
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
  /** 배경 터치로 닫기 (기본 true) */
  dismissable?: boolean
  backdropColor?: string
}

export function BottomSheet({ visible, onClose, children, style, dismissable = true, backdropColor = "rgba(0,0,0,0.7)", maxHeight = "90%", showHandle = true }: SheetProps & { maxHeight?: ViewStyle["maxHeight"]; showHandle?: boolean }) {
  const insets = useSafeAreaInsets()
  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={[styles.fill, { justifyContent: "flex-end", backgroundColor: backdropColor }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={dismissable ? onClose : undefined} />
        <View style={[styles.sheet, { maxHeight, paddingBottom: insets.bottom + 16 }, style]}>
          {showHandle && <View style={styles.handle} />}
          {children}
        </View>
      </View>
    </Modal>
  )
}

export function CenterModal({ visible, onClose, children, style, dismissable = true, backdropColor = "rgba(0,0,0,0.75)" }: SheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={[styles.fill, { justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: backdropColor }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={dismissable ? onClose : undefined} />
        <View style={[styles.dialog, style]}>{children}</View>
      </View>
    </Modal>
  )
}

/** 전체 화면 오버레이 (리포트/결과 화면 등) */
export function FullScreenModal({ visible, onClose, children, style }: SheetProps) {
  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={[styles.fill, { backgroundColor: colors.background }, style]}>{children}</View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  sheet: {
    width: "100%",
    maxWidth: layout.maxWidth,
    alignSelf: "center",
    backgroundColor: colors.card,
    borderTopLeftRadius: radius["3xl"],
    borderTopRightRadius: radius["3xl"],
    paddingTop: 8,
  },
  handle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.2)", marginBottom: 8 },
  dialog: { width: "100%", maxWidth: 400, backgroundColor: colors.card, borderRadius: radius["2xl"], overflow: "hidden" },
})
