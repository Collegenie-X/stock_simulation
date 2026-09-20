/**
 * Screen — 모든 페이지의 최상위 컨테이너
 * 웹의 `min-h-screen bg-[#..] pt-safe-top pb-24` + `.mobile-container(max-w-md)` 를 대체합니다.
 */
import React from "react"
import { ScrollView, StyleSheet, View, type ScrollViewProps, type StyleProp, type ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { colors, layout } from "@/theme"

interface ScreenProps {
  children?: React.ReactNode
  /** 배경색 (기본: colors.background) */
  bg?: string
  /** true 면 ScrollView 로 감쌉니다 (기본 true) */
  scroll?: boolean
  /** 하단 탭바(MobileNav) 높이만큼 여백 확보 */
  withNav?: boolean
  /** 상단 고정 헤더(MobileHeader) 높이만큼 여백 확보 */
  withHeader?: boolean
  /** 상/하단 safe area 패딩 적용 여부 */
  safeTop?: boolean
  safeBottom?: boolean
  style?: StyleProp<ViewStyle>
  contentStyle?: StyleProp<ViewStyle>
  /** 스크롤 영역 밖에 고정되는 요소 (헤더, 탭바, 하단 CTA, 모달 등) */
  fixed?: React.ReactNode
  scrollProps?: ScrollViewProps
  scrollRef?: React.Ref<ScrollView>
}

export function Screen({ children, bg = colors.background, scroll = true, withNav, withHeader, safeTop = true, safeBottom = true, style, contentStyle, fixed, scrollProps, scrollRef }: ScreenProps) {
  const insets = useSafeAreaInsets()
  const paddingTop = (safeTop ? insets.top : 0) + (withHeader ? layout.headerHeight : 0)
  const paddingBottom = (safeBottom ? insets.bottom : 0) + (withNav ? layout.navHeight + 16 : 0)

  return (
    <View style={[styles.root, { backgroundColor: bg }, style]}>
      <View style={styles.container}>
        {scroll ? (
          <ScrollView
            ref={scrollRef}
            style={styles.fill}
            contentContainerStyle={[{ paddingTop, paddingBottom, flexGrow: 1 }, contentStyle]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            {...scrollProps}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.fill, { paddingTop, paddingBottom }, contentStyle]}>{children}</View>
        )}
        {fixed}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  // 태블릿/웹에서는 웹 버전과 동일하게 가운데 448px 폭으로 고정
  container: { flex: 1, width: "100%", maxWidth: layout.maxWidth, alignSelf: "center" },
  fill: { flex: 1 },
})
