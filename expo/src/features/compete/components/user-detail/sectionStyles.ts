import { StyleSheet } from "react-native"
import { palette } from "@/theme"

/** 웹 `bg-white rounded-3xl p-6 shadow-xl` 공통 카드 */
export const sectionStyles = StyleSheet.create({
  card: { marginTop: 24, backgroundColor: "#ffffff", borderRadius: 24, padding: 24, boxShadow: "0 20px 25px rgba(0,0,0,0.1)" },
  title: { fontSize: 18, fontWeight: "700", color: palette.gray[900] },
  subtitle: { fontSize: 14, color: palette.gray[500], marginBottom: 16 },
})
