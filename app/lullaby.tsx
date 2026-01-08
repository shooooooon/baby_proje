import { Text, View, Pressable, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useApp, useTranslation, type Language, type Parent } from "@/lib/app-context";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { trpc } from "@/lib/trpc";

export default function LullabyScreen() {
  const router = useRouter();
  const { parent, language, babyName } = useApp();
  const t = useTranslation();
  const [lullaby, setLullaby] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const aiMutation = trpc.ai.chat.useMutation();

  const getParentColors = () => {
    if (parent === "papa") {
      return {
        bg: "#E3F2FD",
        primary: "#90CAF9",
        surface: "#BBDEFB",
        border: "#64B5F6",
      };
    }
    return {
      bg: "#FCE4EC",
      primary: "#F48FB1",
      surface: "#F8BBD9",
      border: "#F06292",
    };
  };

  const colors = getParentColors();

  const handleRequestLullaby = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsLoading(true);

    const prompt = buildLullabyPrompt(parent as Parent, language as Language, babyName);

    try {
      const response = await aiMutation.mutateAsync({
        messages: [{ role: "user", content: prompt }],
      });
      setLullaby(response.content);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Lullaby error:", error);
      setLullaby(getFallbackLullaby(parent as Parent, language as Language));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

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
          <Text style={styles.headerTitle}>🌙 {t.lullaby}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* コンテンツ */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* 親のアバター */}
          <Animated.View entering={FadeIn.duration(400)} style={styles.avatarContainer}>
            <Text style={styles.avatar}>{parent === "papa" ? "👨" : "👩"}</Text>
            <Text style={[styles.avatarLabel, { color: colors.primary }]}>
              {parent === "papa" ? t.papa : t.mama}
            </Text>
          </Animated.View>

          {/* 子守唄表示エリア */}
          {lullaby ? (
            <Animated.View
              entering={FadeInUp.duration(400)}
              style={[styles.lullabyContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={styles.lullabyIcon}>🎵</Text>
              <Text style={styles.lullabyText}>{lullaby}</Text>
              <Text style={styles.lullabyIcon}>🎵</Text>
            </Animated.View>
          ) : (
            <View style={[styles.emptyContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={styles.emptyIcon}>🌟</Text>
              <Text style={styles.emptyText}>{t.lullabyDesc}</Text>
            </View>
          )}

          {/* リクエストボタン */}
          <Pressable
            onPress={handleRequestLullaby}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.requestButton,
              { backgroundColor: colors.primary, opacity: isLoading ? 0.6 : 1 },
              pressed && styles.requestButtonPressed,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.requestButtonText}>
                {lullaby ? t.newLullaby : t.listenToLullaby}
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

function buildLullabyPrompt(parent: Parent, language: Language, babyName?: string | null): string {
  const parentName = parent === "papa" 
    ? (language === "ja" ? "パパ" : "Papa") 
    : (language === "ja" ? "ママ" : "Mama");

  // 名前の使用頻度を自然にするための指示
  const nameInstruction = babyName
    ? (language === "ja" 
        ? `赤ちゃんの名前は「${babyName}」です。子守唄の中で名前を一度だけ優しく呼んであげてください。`
        : `The baby's name is "${babyName}". Gently include their name once in the lullaby.`)
    : "";

  if (language === "ja") {
    return `あなたは${parentName}です。赤ちゃんに優しい子守唄を歌ってあげてください。

${nameInstruction}

以下のフォーマットで回答してください：
1. まず*優しく抱っこして*のようなアクション描写
2. 次に短い子守唄（4-6行程度）
3. 最後に優しい言葉かけ

子守唄は日本の伝統的なものでも、オリジナルでも構いません。
全体で100語以内で、温かく眠りを誘う雰囲気で書いてください。`;
  }

  return `You are ${parentName}. Please sing a gentle lullaby to the baby.

${nameInstruction}

Format your response as:
1. First, an action description like *gently rocks you*
2. Then a short lullaby (4-6 lines)
3. Finally, some soothing words

The lullaby can be traditional or original.
Keep it under 100 words, warm and sleep-inducing.`;
}

function getFallbackLullaby(parent: Parent, language: Language): string {
  const lullabies: Record<Parent, Record<Language, string>> = {
    papa: {
      en: `*gently rocks you in his arms*

Hush little baby, don't you cry,
Papa's gonna sing you a lullaby.
Stars are shining up so high,
Watching over you tonight.

*softly hums*

Close your eyes, my little one...
Papa's here, you're safe and warm.`,
      ja: `*優しく抱っこしてゆらゆら*

ねんねんころりよ おころりよ
パパがそばにいるからね
お星さまがキラキラ光る
今夜も優しく見守ってる

*そっと背中をトントン*

おやすみ、パパの宝物...
大好きだよ。`,
    },
    mama: {
      en: `*holds you close to her heart*

Sleep, my baby, sleep so tight,
Mommy's love will hold you right.
Dream of flowers, dream of stars,
You're the sweetest thing by far.

*gently strokes your hair*

Shh... Mommy's here, my precious one.
Sweet dreams, my love.`,
      ja: `*胸に抱きしめて*

ねんねんころりよ おころりよ
ママのそばでおやすみなさい
お花畑で夢を見て
キラキラお星さまと遊んでね

*優しく頭をなでて*

しー... ママがいるからね。
おやすみ、大好きよ。`,
    },
  };

  return lullabies[parent][language];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#11181C",
  },
  placeholder: {
    width: 80,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    alignItems: "center",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatar: {
    fontSize: 80,
    marginBottom: 8,
  },
  avatarLabel: {
    fontSize: 24,
    fontWeight: "bold",
  },
  lullabyContainer: {
    width: "100%",
    padding: 24,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: "center",
    marginBottom: 24,
  },
  lullabyIcon: {
    fontSize: 32,
    marginVertical: 8,
  },
  lullabyText: {
    fontSize: 18,
    lineHeight: 28,
    color: "#11181C",
    textAlign: "center",
  },
  emptyContainer: {
    width: "100%",
    padding: 32,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#687076",
    textAlign: "center",
  },
  requestButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    minWidth: 200,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  requestButtonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  requestButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
});
