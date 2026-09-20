/**
 * 클릭 피드백 — 웹에서는 WebAudio 효과음이었고, 앱에서는 햅틱으로 대체합니다.
 * (웹과 동일한 함수명을 유지하여 화면 코드 호환)
 */
import * as Haptics from "expo-haptics"
import { Platform } from "react-native"

export function playClickSound() {
  if (Platform.OS === "web") return
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
}

export function playSuccessFeedback() {
  if (Platform.OS === "web") return
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
}

export function playErrorFeedback() {
  if (Platform.OS === "web") return
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {})
}
