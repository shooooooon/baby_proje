import { Text, View, Pressable, StyleSheet, TextInput, KeyboardAvoidingView, Platform as RNPlatform } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useApp, useTranslation } from "@/lib/app-context";
import { useState, useMemo } from "react";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { getParentColors } from "@/lib/theme-utils";

export default function NameInputScreen() {
  const router = useRouter();
  const { parent, setBabyName } = useApp();
  const t = useTranslation();
  const [name, setName] = useState("");

  // パフォーマンス最適化: useMemoでメモ化
  const colors = useMemo(() => getParentColors(parent), [parent]);

  const handleContinue = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (name.trim()) {
      await setBabyName(name.trim());
    }
    
    router.replace("/main" as never);
  };

  const handleSkip = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    router.replace("/main" as never);
  };

  return (
    <ScreenContainer containerClassName={`bg-[${colors.bg}]`} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: colors.bg }]}
        behavior={RNPlatform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          {/* タイトル */}
          <Animated.View entering={FadeInUp.duration(400)} style={styles.titleContainer}>
            <Text style={styles.emoji}>👶</Text>
            <Text style={styles.title}>{t.enterYourName}</Text>
            <Text style={styles.subtitle}>
              {parent === "papa" ? t.papa : t.mama}があなたの名前を呼んであやしてくれるよ
            </Text>
          </Animated.View>

          {/* 名前入力 */}
          <Animated.View 
            entering={FadeInUp.delay(100).duration(400)} 
            style={styles.inputContainer}
          >
            <TextInput
              style={[
                styles.textInput,
                { 
                  backgroundColor: colors.surface, 
                  borderColor: colors.border,
                }
              ]}
              value={name}
              onChangeText={setName}
              placeholder={t.nameInputPlaceholder}
              placeholderTextColor="#9BA1A6"
              maxLength={20}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
          </Animated.View>

          {/* ボタン */}
          <Animated.View 
            entering={FadeInUp.delay(200).duration(400)} 
            style={styles.buttonContainer}
          >
            <Pressable
              onPress={handleContinue}
              style={({ pressed }) => [
                styles.continueButton,
                { backgroundColor: colors.primary },
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.continueButtonText}>{t.nameContinue}</Text>
            </Pressable>

            <Pressable
              onPress={handleSkip}
              style={({ pressed }) => [
                styles.skipButton,
                pressed && styles.skipButtonPressed,
              ]}
            >
              <Text style={[styles.skipButtonText, { color: colors.primary }]}>
                {t.nameSkip}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#11181C",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#687076",
    textAlign: "center",
    lineHeight: 24,
  },
  inputContainer: {
    width: "100%",
    maxWidth: 320,
    marginBottom: 32,
  },
  textInput: {
    width: "100%",
    height: 56,
    paddingHorizontal: 20,
    borderRadius: 28,
    borderWidth: 2,
    fontSize: 18,
    textAlign: "center",
    color: "#11181C",
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 320,
    gap: 16,
  },
  continueButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  skipButton: {
    width: "100%",
    paddingVertical: 12,
    alignItems: "center",
  },
  skipButtonPressed: {
    opacity: 0.6,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
