import { useState, type ReactNode } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { AlertTriangle, Eye, EyeOff, LogOut } from "lucide-react-native"
import { alpha, palette } from "@/theme"
import { PROFILE_LABELS } from "../config"

const L = PROFILE_LABELS.personalInfo

interface PersonalInfoProps {
  userId: string
  email: string
  phone: string
  joinDate: string
  lastLogin: string
}

interface InfoRowProps {
  label: string
  value: ReactNode
  onEdit?: () => void
  last?: boolean
}

function EditButton({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.editBtn}>
      <Text style={styles.editBtnText}>{L.editBtn}</Text>
    </Pressable>
  )
}

function InfoRow({ label, value, onEdit, last }: InfoRowProps) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
      {!!onEdit && <EditButton onPress={onEdit} />}
    </View>
  )
}

/**
 * 웹: email.replace(/(?<=.{2}).(?=[^@]*@)/g, '*')
 * (@ 앞 부분에서 앞 2글자를 제외한 나머지를 * 로 마스킹) — lookbehind 없이 동일 동작 구현
 */
function maskEmail(email: string): string {
  const at = email.lastIndexOf("@")
  if (at < 0) return email
  return email
    .split("")
    .map((ch, i) => (i >= 2 && i < at ? "*" : ch))
    .join("")
}

export function PersonalInfoSection({ userId, email, phone, joinDate, lastLogin }: PersonalInfoProps) {
  const [showPw, setShowPw] = useState(false)

  const maskedEmail = maskEmail(email)

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{L.title}</Text>

      <View style={styles.card}>
        <InfoRow label={L.userId} value={userId} />

        {/* 비밀번호 행 — 표시/숨김 토글 */}
        <View style={[styles.row, styles.rowBorder]}>
          <Text style={styles.rowLabel}>{L.password}</Text>
          <Text style={[styles.rowValue, { letterSpacing: 1.4 }]}>{showPw ? "********" : L.passwordMask}</Text>
          <View style={styles.pwActions}>
            <Pressable onPress={() => setShowPw((v) => !v)} style={{ padding: 4 }} hitSlop={8}>
              {showPw ? <EyeOff size={16} color={palette.gray[500]} /> : <Eye size={16} color={palette.gray[500]} />}
            </Pressable>
            <EditButton />
          </View>
        </View>

        <InfoRow label={L.email} value={maskedEmail} onEdit={() => {}} />
        <InfoRow label={L.phone} value={phone} onEdit={() => {}} />
        <InfoRow label={L.joinDate} value={joinDate} />
        <InfoRow label={L.lastLogin} value={lastLogin} last />
      </View>

      {/* 로그아웃 */}
      <Pressable style={styles.logout}>
        {({ pressed }) => (
          <>
            <LogOut size={16} color={pressed ? palette.red[400] : palette.gray[500]} />
            <Text style={[styles.logoutText, { color: pressed ? palette.red[400] : palette.gray[500] }]}>{PROFILE_LABELS.logout}</Text>
          </>
        )}
      </Pressable>

      {/* 회원 탈퇴 */}
      <View style={styles.withdraw}>
        <Pressable style={styles.withdrawBtn}>
          {({ pressed }) => (
            <>
              <AlertTriangle size={12} color={pressed ? palette.red[500] : palette.gray[600]} />
              <Text style={[styles.withdrawText, { color: pressed ? palette.red[500] : palette.gray[600] }]}>{L.withdrawBtn}</Text>
            </>
          )}
        </Pressable>
        <Text style={styles.withdrawDesc}>{L.withdrawDesc}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  section: { marginTop: 20 },
  title: { fontSize: 12, fontWeight: "500", color: palette.gray[500], marginBottom: 12, paddingHorizontal: 2 },
  card: { backgroundColor: "#252525", borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: alpha("#ffffff", 0.05) },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: alpha("#ffffff", 0.05) },
  rowLabel: { fontSize: 14, color: palette.gray[400], width: 96, flexShrink: 0 },
  rowValue: { fontSize: 14, color: "#ffffff", flex: 1, textAlign: "right", marginRight: 8 },
  editBtn: { flexShrink: 0, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: alpha(palette.blue[500], 0.1), borderRadius: 8 },
  editBtnText: { fontSize: 12, color: palette.blue[400] },
  pwActions: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 0 },
  logout: { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12, paddingVertical: 12 },
  logoutText: { fontSize: 14 },
  withdraw: { marginTop: 4, marginBottom: 8, alignItems: "center", gap: 4 },
  withdrawBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  withdrawText: { fontSize: 12 },
  withdrawDesc: { fontSize: 12, color: palette.gray[700] },
})
