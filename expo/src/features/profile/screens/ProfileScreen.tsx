/**
 * MY 페이지 (웹 app/profile/page.tsx 포팅)
 */
import { View } from "react-native"
import { Screen, MobileHeader, MobileNav } from "@/components/layout"
import { INVESTMENT_STYLES } from "@/features/compete/config"
import competeHistory from "@/data/compete-history.json"
import { ProfileHero } from "../components/ProfileHero"
import { ActivityCountSection } from "../components/ActivityCountSection"
import { PersonalInfoSection } from "../components/PersonalInfoSection"
import { ACHIEVEMENTS } from "../config"

export default function ProfileScreen() {
  const { myProfile, simulations, stockPractice, wavePractice } = competeHistory as any

  const styleInfo = INVESTMENT_STYLES[myProfile.investmentStyle] ?? INVESTMENT_STYLES.aggressive
  const unlockedCount = ACHIEVEMENTS.filter((a) => a.unlocked).length

  return (
    <Screen
      bg="#191919"
      withHeader
      withNav
      fixed={
        <>
          <MobileHeader title="MY" showSettings />
          <MobileNav />
        </>
      }
    >
      <View style={{ paddingTop: 8, paddingHorizontal: 20, paddingBottom: 16 }}>
        {/* 프로필 */}
        <ProfileHero
          nickname={myProfile.nickname}
          level={myProfile.level}
          exp={800}
          badges={[...myProfile.badges]}
          styleEmoji={styleInfo.emoji}
          styleLabel={styleInfo.label}
        />

        {/* 활동 횟수 현황 */}
        <ActivityCountSection
          counts={{
            simulations: simulations.length,
            stockPractice: stockPractice.length,
            wavePractice: wavePractice.length,
            learnChapters: 5,
            totalTrades: myProfile.totalTrades,
            achievements: unlockedCount,
          }}
        />

        {/* 개인 정보 */}
        <PersonalInfoSection
          userId={myProfile.userId}
          email={myProfile.email}
          phone={myProfile.phone}
          joinDate={myProfile.joinDate}
          lastLogin={myProfile.lastLogin}
        />
      </View>
    </Screen>
  )
}
