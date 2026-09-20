import { View } from "react-native"
import { alpha, palette } from "@/theme"
import { HowToPlayStep } from "./HowToPlayStep"
import { SlideHeading } from "./SlideHeading"

/** 슬라이드 2 — 게임 방법 */
export function HowToPlaySlide() {
  return (
    <View>
      <SlideHeading emoji="🎮" title="어떻게 게임하나요?" desc="실제 주식처럼 사고팔며 돈을 벌어보세요" />

      <View style={{ gap: 16 }}>
        <HowToPlayStep emoji="📈" iconBg={alpha(palette.blue[500], 0.2)} title="1. 주식 고르기" desc="50개 이상의 종목 중 마음에 드는 주식을 선택하세요" />
        <HowToPlayStep emoji="💰" iconBg={alpha(palette.green[500], 0.2)} title="2. 매수하기" desc="1,000만원으로 시작! 원하는 만큼 사세요" />
        <HowToPlayStep emoji="⏰" iconBg={alpha(palette.purple[500], 0.2)} title="3. 다음 날로 이동" desc="버튼을 누르면 하루가 지나고 주가가 변해요" />
        <HowToPlayStep emoji="🎯" iconBg={alpha(palette.red[500], 0.2)} title="4. 매도하기" desc="수익이 나면 팔아서 돈을 벌어보세요!" />
      </View>
    </View>
  )
}
