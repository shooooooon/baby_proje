import { Text, View, Pressable, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useApp, useTranslation } from "@/lib/app-context";
import { usePremium } from "@/lib/premium-context";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";

export default function UpgradeScreen() {
  const router = useRouter();
  const { parent } = useApp();
  const { isPremium, upgradeToPremium, restorePurchase } = usePremium();
  const t = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const getParentColors = () => {
    if (parent === "papa") {
      return {
        bg: "#E3F2FD",
        primary: "#90CAF9",
        surface: "#BBDEFB",
        border: "#64B5F6",
        accent: "#1976D2",
      };
    }
    return {
      bg: "#FCE4EC",
      primary: "#F48FB1",
      surface: "#F8BBD9",
      border: "#F06292",
      accent: "#C2185B",
    };
  };

  const colors = getParentColors();

  const handleUpgrade = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsLoading(true);

    try {
      // デモ用：実際のアプリではここでApp Store/Google Play課金処理を行う
      await upgradeToPremium();
      
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      // 少し待ってから戻る
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      console.error("Upgrade error:", error);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsRestoring(true);

    try {
      const restored = await restorePurchase();
      if (restored) {
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        setTimeout(() => {
          router.back();
        }, 1000);
      }
    } catch (error) {
      console.error("Restore error:", error);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  // 既にプレミアムの場合
  if (isPremium) {
    return (
      <ScreenContainer containerClassName={`bg-[${colors.bg}]`} edges={["top", "left", "right"]}>
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.backButtonPressed,
              ]}
            >
              <Text style={styles.backButtonText}>← {t.backToMain}</Text>
            </Pressable>
          </View>

          <View style={styles.premiumContent}>
            <Animated.View entering={FadeIn.duration(400)} style={styles.successContainer}>
              <Text style={styles.successIcon}>🎉</Text>
              <Text style={styles.successTitle}>{t.alreadyPremium}</Text>
              <Text style={styles.successText}>{t.thankYou}</Text>
              <View style={[styles.premiumCard, { backgroundColor: colors.surface, borderColor: colors.accent }]}>
                <Text style={styles.premiumCardIcon}>⭐</Text>
                <Text style={[styles.premiumCardTitle, { color: colors.accent }]}>Premium Member</Text>
                <Text style={styles.premiumCardText}>{t.premiumUnlimited}</Text>
              </View>
            </Animated.View>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer containerClassName={`bg-[${colors.bg}]`} edges={["top", "left", "right"]}>
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        {/* ヘッダー */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
          >
            <Text style={styles.backButtonText}>← {t.backToMain}</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* タイトル */}
          <Animated.View entering={FadeInUp.duration(400)} style={styles.titleContainer}>
            <Text style={styles.titleIcon}>✨</Text>
            <Text style={styles.title}>{t.upgradeToPremium}</Text>
            <Text style={styles.subtitle}>{t.premiumBenefits}</Text>
          </Animated.View>

          {/* 特典リスト */}
          <Animated.View 
            entering={FadeInUp.delay(100).duration(400)} 
            style={[styles.benefitsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>💬</Text>
              <View style={styles.benefitTextContainer}>
                <Text style={styles.benefitTitle}>{t.chatMode}</Text>
                <Text style={styles.benefitDesc}>{t.chatModeDesc}</Text>
              </View>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>♾️</Text>
              <View style={styles.benefitTextContainer}>
                <Text style={styles.benefitTitle}>{t.premiumUnlimited}</Text>
                <Text style={styles.benefitDesc}>{t.premiumBenefits}</Text>
              </View>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🌙</Text>
              <View style={styles.benefitTextContainer}>
                <Text style={styles.benefitTitle}>{t.lullaby} & {t.storyTime}</Text>
                <Text style={styles.benefitDesc}>{t.lullabyDesc}</Text>
              </View>
            </View>
          </Animated.View>

          {/* 価格オプション */}
          <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.pricingContainer}>
            {/* 買い切りプラン */}
            <Pressable
              onPress={handleUpgrade}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.pricingCard,
                styles.pricingCardFeatured,
                { backgroundColor: colors.accent, borderColor: colors.accent },
                pressed && styles.pricingCardPressed,
              ]}
            >
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>おすすめ</Text>
              </View>
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="large" />
              ) : (
                <>
                  <Text style={styles.pricingTitle}>{t.premiumPriceOneTime}</Text>
                  <Text style={styles.pricingSubtitle}>買い切り・永久利用</Text>
                </>
              )}
            </Pressable>
          </Animated.View>

          {/* 購入復元 */}
          <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.restoreContainer}>
            <Pressable
              onPress={handleRestore}
              disabled={isRestoring}
              style={({ pressed }) => [
                styles.restoreButton,
                pressed && styles.restoreButtonPressed,
              ]}
            >
              {isRestoring ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <Text style={[styles.restoreText, { color: colors.primary }]}>
                  {t.restorePurchase}
                </Text>
              )}
            </Pressable>
          </Animated.View>

          {/* 注意書き */}
          <Animated.View entering={FadeInUp.delay(400).duration(400)} style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerText}>
              ※ デモ版のため、実際の課金処理は行われません。
              {"\n"}ボタンを押すとプレミアム機能が有効になります。
            </Text>
          </Animated.View>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backButtonPressed: {
    opacity: 0.6,
  },
  backButtonText: {
    fontSize: 16,
    color: "#687076",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    alignItems: "center",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  titleIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#11181C",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#687076",
    textAlign: "center",
  },
  benefitsCard: {
    width: "100%",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  benefitIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#11181C",
    marginBottom: 4,
  },
  benefitDesc: {
    fontSize: 14,
    color: "#687076",
    lineHeight: 20,
  },
  pricingContainer: {
    width: "100%",
    marginBottom: 24,
  },
  pricingCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: "center",
    marginBottom: 12,
  },
  pricingCardFeatured: {
    position: "relative",
    overflow: "visible",
  },
  pricingCardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  featuredBadge: {
    position: "absolute",
    top: -12,
    backgroundColor: "#FFD700",
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#11181C",
  },
  pricingTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 8,
  },
  pricingSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  restoreContainer: {
    marginBottom: 24,
  },
  restoreButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  restoreButtonPressed: {
    opacity: 0.6,
  },
  restoreText: {
    fontSize: 16,
    fontWeight: "500",
  },
  disclaimerContainer: {
    paddingHorizontal: 16,
  },
  disclaimerText: {
    fontSize: 12,
    color: "#9BA1A6",
    textAlign: "center",
    lineHeight: 18,
  },
  premiumContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  successContainer: {
    alignItems: "center",
  },
  successIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#11181C",
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: "#687076",
    marginBottom: 32,
  },
  premiumCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: "center",
    minWidth: 200,
  },
  premiumCardIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  premiumCardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  premiumCardText: {
    fontSize: 14,
    color: "#687076",
  },
});
