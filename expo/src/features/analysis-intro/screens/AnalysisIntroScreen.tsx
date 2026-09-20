import { useState, useCallback, useEffect, useRef } from "react"
import { Animated, Easing, StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Gradient } from "@/components/ui"
import { alpha, palette } from "@/theme"
import ChartBackground from "../components/ChartBackground"
import SceneHero from "../components/SceneHero"
import SceneAbilities from "../components/SceneAbilities"
import SceneLaunch from "../components/SceneLaunch"

type Scene = "hero" | "abilities" | "launch"

const SCENES: Scene[] = ["hero", "abilities", "launch"]

/** 진행 점 — `transition-all duration-500` (너비/색 전환) */
function ProgressDot({ state }: { state: "active" | "done" | "todo" }) {
  const w = useRef(new Animated.Value(state === "active" ? 32 : 16)).current
  useEffect(() => {
    const anim = Animated.timing(w, {
      toValue: state === "active" ? 32 : 16,
      duration: 500,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    })
    anim.start()
    return () => anim.stop()
  }, [state, w])
  const backgroundColor =
    state === "active" ? palette.blue[400] : state === "done" ? alpha(palette.blue[400], 0.4) : alpha("#ffffff", 0.1)
  return <Animated.View style={{ height: 4, borderRadius: 9999, width: w, backgroundColor }} />
}

export default function AnalysisIntroScreen() {
  const insets = useSafeAreaInsets()
  const [scene, setScene] = useState<Scene>("hero")

  const nextScene = useCallback(() => {
    setScene((prev) => {
      const idx = SCENES.indexOf(prev)
      return idx < SCENES.length - 1 ? SCENES[idx + 1] : prev
    })
  }, [])

  return (
    <View style={styles.root}>
      {/* Animated chart background */}
      <ChartBackground />

      {/* Dark overlay */}
      <Gradient
        pointerEvents="none"
        dir="b"
        colors={["rgba(10,10,15,0.6)", "rgba(10,10,15,0.4)", "rgba(10,10,15,0.8)"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Scenes */}
      <View style={styles.container}>
        <SceneHero visible={scene === "hero"} onComplete={nextScene} />
        <SceneAbilities visible={scene === "abilities"} onComplete={nextScene} />
        <SceneLaunch visible={scene === "launch"} />
      </View>

      {/* Scene progress dots */}
      <View pointerEvents="none" style={[styles.dots, { top: insets.top + 32 }]}>
        {SCENES.map((s, i) => (
          <ProgressDot key={s} state={scene === s ? "active" : SCENES.indexOf(scene) > i ? "done" : "todo"} />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0a0a0f", overflow: "hidden" },
  container: { flex: 1, width: "100%", maxWidth: 448, alignSelf: "center" },
  dots: { position: "absolute", left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 8, zIndex: 20 },
})
