import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native"
import { Clock, Eye, Shield, Target, X, Zap } from "lucide-react-native"
import aiCompetitorsData from "@/data/ai-competitors.json"
import { Button, CenterModal, Gradient, PressableScale } from "@/components/ui"
import { formatNumber } from "@/lib/format"
import { alpha, palette } from "@/theme"

/**
 * 특수 아이템 상점 모달
 * README의 특수 아이템 시스템 구현
 */
export function ItemsShopModal({
  isOpen,
  onClose,
  userPoints,
  onPurchase,
}: {
  isOpen: boolean
  onClose: () => void
  userPoints: number
  onPurchase: (itemId: string, cost: number) => void
}) {
  const { height } = useWindowDimensions()

  if (!isOpen) return null

  const items = aiCompetitorsData.items

  const getItemIcon = (emoji: string) => {
    switch (emoji) {
      case "⏰":
        return Clock
      case "🔮":
        return Eye
      case "🎯":
        return Target
      case "🛡️":
        return Shield
      case "🔥":
        return Zap
      default:
        return Target
    }
  }

  return (
    <CenterModal visible={isOpen} onClose={onClose} backdropColor="rgba(0,0,0,0.8)" style={[styles.modal, { maxHeight: height * 0.9 }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>🎁 아이템 상점</Text>
              <Text style={styles.subtitle}>게임에 도움이 되는 특수 아이템</Text>
            </View>
            <PressableScale onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={palette.gray[400]} />
            </PressableScale>
          </View>
        </View>

        {/* 보유 포인트 */}
        <Gradient dir="r" colors={[alpha(palette.yellow[500], 0.1), alpha(palette.orange[500], 0.1)]} style={styles.points}>
          <Text style={styles.pointsLabel}>보유 포인트</Text>
          <Text style={styles.pointsValue}>{formatNumber(userPoints)}P</Text>
        </Gradient>

        {/* 아이템 목록 */}
        <View style={styles.list}>
          {items.map((item) => {
            const Icon = getItemIcon(item.emoji)
            const canAfford = userPoints >= item.cost

            return (
              <View key={item.id} style={[styles.item, canAfford ? styles.itemOn : styles.itemOff]}>
                {/* 아이콘 */}
                <View style={[styles.iconBox, { backgroundColor: canAfford ? alpha(palette.blue[500], 0.1) : alpha(palette.gray[800], 0.5) }]}>
                  <Icon size={24} color={canAfford ? palette.blue[400] : palette.gray[600]} />
                </View>

                {/* 정보 */}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={styles.itemTop}>
                    <View style={styles.itemNameRow}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemEmoji}>{item.emoji}</Text>
                    </View>
                    <View style={{ alignItems: "flex-end", flexShrink: 0 }}>
                      <Text style={styles.itemCost}>{item.cost}P</Text>
                      <Text style={styles.itemUses}>{item.uses}회</Text>
                    </View>
                  </View>
                  <Text style={styles.itemDesc}>{item.description}</Text>

                  {/* 구매 버튼 */}
                  {canAfford ? (
                    <Button
                      onPress={() => {
                        onPurchase(item.id, item.cost)
                      }}
                      size="sm"
                      style={styles.buyBtn}
                      textStyle={styles.buyText}
                    >
                      구매하기
                    </Button>
                  ) : (
                    <Text style={styles.lack}>포인트 부족 ({formatNumber(item.cost - userPoints)}P 필요)</Text>
                  )}
                </View>
              </View>
            )
          })}
        </View>

        {/* 하단 정보 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💡 포인트는 거래 성공 시 자동으로 적립됩니다{"\n"}
            광고 시청으로 무료 포인트를 획득할 수 있습니다
          </Text>
        </View>
      </ScrollView>
    </CenterModal>
  )
}

/**
 * 보유 아이템 표시 컴포넌트
 */
export function OwnedItemsBadge({ itemCount }: { itemCount: number }) {
  if (itemCount === 0) return null

  return (
    <View style={styles.badge}>
      <Text style={{ fontSize: 14, color: "#ffffff" }}>🎁</Text>
      <Text style={{ fontSize: 14, fontWeight: "700", color: palette.purple[400] }}>{itemCount}개</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  modal: { maxWidth: 448, backgroundColor: "#1E1E1E", borderRadius: 24, borderWidth: 1, borderColor: palette.gray[800] },
  header: { padding: 24, borderBottomWidth: 1, borderBottomColor: palette.gray[800] },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  title: { fontSize: 24, fontWeight: "700", color: "#ffffff" },
  subtitle: { fontSize: 14, color: palette.gray[400], marginTop: 4 },
  closeBtn: { padding: 8, borderRadius: 9999 },
  points: { padding: 16, borderBottomWidth: 1, borderBottomColor: palette.gray[800], flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pointsLabel: { fontSize: 14, color: palette.gray[400] },
  pointsValue: { fontSize: 24, fontWeight: "700", color: palette.yellow[500] },
  list: { padding: 24, gap: 12 },
  item: { flexDirection: "row", alignItems: "flex-start", gap: 16, padding: 16, borderRadius: 16, borderWidth: 1 },
  itemOn: { backgroundColor: alpha(palette.gray[800], 0.5), borderColor: palette.gray[700] },
  itemOff: { backgroundColor: alpha(palette.gray[900], 0.5), borderColor: palette.gray[800], opacity: 0.6 },
  iconBox: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  itemTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4 },
  itemNameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 },
  itemName: { fontSize: 16, fontWeight: "700", color: "#ffffff", flexShrink: 1 },
  itemEmoji: { fontSize: 20, color: "#ffffff" },
  itemCost: { fontSize: 14, fontWeight: "700", color: palette.yellow[500] },
  itemUses: { fontSize: 12, color: palette.gray[500] },
  itemDesc: { fontSize: 14, color: palette.gray[400], marginBottom: 12 },
  buyBtn: { width: "100%", height: 36, backgroundColor: palette.blue[600] },
  buyText: { color: "#ffffff", fontSize: 14, fontWeight: "700" },
  lack: { fontSize: 12, color: palette.red[400], textAlign: "center", paddingVertical: 8 },
  footer: { padding: 24, borderTopWidth: 1, borderTopColor: palette.gray[800], backgroundColor: alpha(palette.gray[900], 0.5) },
  footerText: { fontSize: 12, lineHeight: 18, color: palette.gray[400], textAlign: "center" },
  badge: {
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: alpha(palette.purple[500], 0.1),
    borderWidth: 1,
    borderColor: alpha(palette.purple[500], 0.3),
    borderRadius: 9999,
  },
})
