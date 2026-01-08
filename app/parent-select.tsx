import { Text, View, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useApp, useTranslation } from "@/lib/app-context";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import Animated, { FadeIn, FadeInLeft, FadeInRight } from "react-native-reanimated";

export default function ParentSelectScreen() {
  const router = useRouter();
  const { setParent } = useApp();
  const t = useTranslation();

  const handleParentSelect = async (parent: "papa" | "mama") => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await setParent(parent);
    router.push("/main" as never);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ScreenContainer containerClassName="bg-[#F5F5F5]">
      <View className="flex-1 px-6 pt-4">
        {/* 戻るボタン */}
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
        >
          <Text style={styles.backButtonText}>← {t.changeLanguage}</Text>
        </Pressable>

        {/* タイトル */}
        <Animated.View 
          entering={FadeIn.duration(400)}
          className="items-center mt-8 mb-12"
        >
          <Text className="text-2xl font-bold text-foreground text-center">
            {t.selectParent}
          </Text>
        </Animated.View>

        {/* 保護者選択カード */}
        <View className="flex-1 justify-center gap-6">
          {/* パパカード */}
          <Animated.View entering={FadeInLeft.delay(100).duration(400)}>
            <Pressable
              onPress={() => handleParentSelect("papa")}
              style={({ pressed }) => [
                styles.card,
                styles.papaCard,
                pressed && styles.cardPressed,
              ]}
            >
              <Text style={styles.emoji}>👨</Text>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{t.papa}</Text>
                <Text style={styles.cardDesc}>{t.papaDesc}</Text>
              </View>
            </Pressable>
          </Animated.View>

          {/* ママカード */}
          <Animated.View entering={FadeInRight.delay(200).duration(400)}>
            <Pressable
              onPress={() => handleParentSelect("mama")}
              style={({ pressed }) => [
                styles.card,
                styles.mamaCard,
                pressed && styles.cardPressed,
              ]}
            >
              <Text style={styles.emoji}>👩</Text>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{t.mama}</Text>
                <Text style={styles.cardDesc}>{t.mamaDesc}</Text>
              </View>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignSelf: "flex-start",
  },
  backButtonPressed: {
    opacity: 0.6,
  },
  backButtonText: {
    fontSize: 16,
    color: "#687076",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  papaCard: {
    backgroundColor: "#E3F2FD",
    borderWidth: 2,
    borderColor: "#90CAF9",
  },
  mamaCard: {
    backgroundColor: "#FCE4EC",
    borderWidth: 2,
    borderColor: "#F48FB1",
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  emoji: {
    fontSize: 56,
    marginRight: 20,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#11181C",
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 16,
    color: "#687076",
  },
});
