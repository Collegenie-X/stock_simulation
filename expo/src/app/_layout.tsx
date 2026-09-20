/**
 * 루트 레이아웃 (웹 app/layout.tsx 대응)
 * - 로컬 저장소(localStore) 를 먼저 hydrate 한 뒤 화면을 렌더링합니다.
 * - 모든 화면은 헤더 없는 Stack 으로 구성하고, 하단 탭은 <MobileNav/> 컴포넌트가 담당합니다.
 */
import { useEffect, useState } from "react"
import { View } from "react-native"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { localStore } from "@/lib/storage"
import { colors } from "@/theme"

SplashScreen.preventAutoHideAsync().catch(() => {})

export default function RootLayout() {
  const [ready, setReady] = useState(localStore.isHydrated)

  useEffect(() => {
    localStore.hydrate().finally(() => {
      setReady(true)
      SplashScreen.hideAsync().catch(() => {})
    })
  }, [])

  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.background }} />

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="index" options={{ animation: "none" }} />
          <Stack.Screen name="home/index" options={{ animation: "none" }} />
          <Stack.Screen name="learn/index" options={{ animation: "none" }} />
          <Stack.Screen name="compete/index" options={{ animation: "none" }} />
          <Stack.Screen name="profile/index" options={{ animation: "none" }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
