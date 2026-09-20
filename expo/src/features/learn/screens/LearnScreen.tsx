import React, { useEffect, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { useLocalSearchParams } from "expo-router"
import { MobileHeader, MobileNav, Screen } from "@/components/layout"
import { Pulse } from "@/components/ui"
import { storage } from "@/lib/storage"
import { getPersonalityFromCharacter, type InvestorPersonality } from "@/data/legendary-scenarios"
import { alpha, palette } from "@/theme"
import { InvestorDNAHero } from "../components/InvestorDNAHero"
import { LearningProcessSteps } from "../components/LearningProcessSteps"
import { ScenarioTab } from "../components/ScenarioTab"
import { PatternTab } from "../components/PatternTab"

type TabValue = "scenarios" | "patterns"

const TABS: { value: TabValue; label: string }[] = [
  { value: "scenarios", label: "시나리오" },
  { value: "patterns", label: "패턴" },
]

export default function LearnScreen() {
  const params = useLocalSearchParams<{ tab?: string }>()
  const initialTab: TabValue = params.tab === "patterns" ? "patterns" : "scenarios"
  const [tab, setTab] = useState<TabValue>(initialTab)
  const [progress, setProgress] = useState<any>(null)
  const [userPersonality, setUserPersonality] = useState<InvestorPersonality>("balanced")

  useEffect(() => {
    setProgress(storage.getProgress())
    const character = storage.getCharacter()
    if (character) {
      setUserPersonality(getPersonalityFromCharacter(character.type))
    }
  }, [])

  if (!progress) {
    return (
      <Screen bg="#191919" scroll={false} contentStyle={styles.loading}>
        <Pulse>
          <Text style={styles.loadingEmoji}>📚</Text>
        </Pulse>
      </Screen>
    )
  }

  return (
    <Screen
      bg="#191919"
      withNav
      withHeader
      contentStyle={styles.content}
      fixed={
        <>
          <MobileHeader title="연습" showSettings />
          <MobileNav />
        </>
      }
    >
      {/* 웹 pt-16(64) − 헤더(56) */}
      <View style={{ height: 8 }} />
      <InvestorDNAHero userPersonality={userPersonality} progress={progress} />

      <LearningProcessSteps />

      {/* 탭 네비게이션 */}
      <View style={styles.tabs}>
        <View style={styles.tabList}>
          {TABS.map((t) => {
            const active = tab === t.value
            return (
              <Pressable
                key={t.value}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                onPress={() => setTab(t.value)}
                style={[styles.tabTrigger, active && styles.tabTriggerActive]}
              >
                <Text style={[styles.tabText, { color: active ? "#ffffff" : palette.gray[400] }]}>{t.label}</Text>
              </Pressable>
            )
          })}
        </View>

        {tab === "scenarios" ? <ScenarioTab userPersonality={userPersonality} /> : <PatternTab />}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  loading: { alignItems: "center", justifyContent: "center" },
  loadingEmoji: { fontSize: 36, color: "#ffffff" },
  content: { paddingHorizontal: 20 },
  tabs: { marginTop: 24 },
  tabList: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#252525",
    borderWidth: 1,
    borderColor: alpha("#ffffff", 0.1),
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  tabTrigger: { flex: 1, height: 30, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  tabTriggerActive: { backgroundColor: "#333333" },
  tabText: { fontSize: 14, fontWeight: "500" },
})
