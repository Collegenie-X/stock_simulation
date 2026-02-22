"use client"

import { useState, useCallback } from "react"
import ChartBackground from "./components/ChartBackground"
import SceneHero from "./components/SceneHero"
import SceneAbilities from "./components/SceneAbilities"
import SceneLaunch from "./components/SceneLaunch"

type Scene = "hero" | "abilities" | "launch"

const SCENES: Scene[] = ["hero", "abilities", "launch"]

export default function AnalysisIntroPage() {
  const [scene, setScene] = useState<Scene>("hero")

  const nextScene = useCallback(() => {
    setScene(prev => {
      const idx = SCENES.indexOf(prev)
      return idx < SCENES.length - 1 ? SCENES[idx + 1] : prev
    })
  }, [])

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] overflow-hidden">
      {/* Animated chart background */}
      <ChartBackground />

      {/* Dark overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0a0a0f]/60 via-[#0a0a0f]/40 to-[#0a0a0f]/80 pointer-events-none z-[1]" />

      {/* Scene progress dots */}
      <div className="fixed top-8 left-0 right-0 z-20 flex justify-center gap-2">
        {SCENES.map((s, i) => (
          <div
            key={s}
            className={`h-1 rounded-full transition-all duration-500 ${
              scene === s
                ? "w-8 bg-blue-400"
                : SCENES.indexOf(scene) > i
                  ? "w-4 bg-blue-400/40"
                  : "w-4 bg-white/10"
            }`}
          />
        ))}
      </div>

      {/* Scenes */}
      <SceneHero visible={scene === "hero"} onComplete={nextScene} />
      <SceneAbilities visible={scene === "abilities"} onComplete={nextScene} />
      <SceneLaunch visible={scene === "launch"} />
    </div>
  )
}
