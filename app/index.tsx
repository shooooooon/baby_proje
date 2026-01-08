import { Text, View, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { useEffect } from "react";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Image } from "expo-image";

export default function LanguageSelectScreen() {
  const router = useRouter();
  const { language, parent, setLanguage, isLoading } = useApp();

  // 既に設定済みの場合は適切な画面にリダイレクト
  useEffect(() => {
    if (!isLoading) {
      if (language && parent) {
        router.replace("/main" as never);
      } else if (language) {
        router.replace("/parent-select" as never);
      }
    }
  }, [language, parent, isLoading, router]);

  const handleLanguageSelect = async (lang: "en" | "ja") => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await setLanguage(lang);
    router.push("/parent-select" as never);
  };

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-foreground text-lg">Loading...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer containerClassName="bg-[#F5F5F5]">
      <View className="flex-1 items-center justify-center px-6">
        {/* ロゴとタイトル */}
        <Animated.View 
          entering={FadeIn.duration(500)} 
          className="items-center mb-12"
        >
          <View className="w-32 h-32 rounded-3xl overflow-hidden mb-6 shadow-lg">
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.logo}
              contentFit="cover"
            />
          </View>
          <Text className="text-3xl font-bold text-foreground text-center">
            The Baby Is Me
          </Text>
          <Text className="text-xl text-muted mt-1">
            赤僕
          </Text>
        </Animated.View>

        {/* 言語選択ボタン */}
        <Animated.View 
          entering={FadeInDown.delay(200).duration(400)}
          className="w-full max-w-xs gap-4"
        >
          <Text className="text-center text-muted mb-4 text-base">
            Select Language / 言語を選択
          </Text>
          
          <Pressable
            accessibilityLabel="English"
            accessibilityHint="Select English as your language"
            accessibilityRole="button"
            onPress={() => handleLanguageSelect("en")}
            style={({ pressed }) => [
              styles.button,
              styles.buttonEnglish,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>🇺🇸 English</Text>
          </Pressable>

          <Pressable
            accessibilityLabel="日本語"
            accessibilityHint="日本語を選択します"
            accessibilityRole="button"
            onPress={() => handleLanguageSelect("ja")}
            style={({ pressed }) => [
              styles.button,
              styles.buttonJapanese,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>🇯🇵 日本語</Text>
          </Pressable>
        </Animated.View>

        {/* フッター */}
        <Animated.View 
          entering={FadeIn.delay(400).duration(400)}
          className="absolute bottom-8"
        >
          <Text className="text-muted text-sm text-center">
            A soothing experience for your inner child
          </Text>
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: "100%",
    height: "100%",
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonEnglish: {
    backgroundColor: "#90CAF9",
  },
  buttonJapanese: {
    backgroundColor: "#F48FB1",
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
});
