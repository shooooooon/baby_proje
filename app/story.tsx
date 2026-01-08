import { Text, View, Pressable, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useApp, useTranslation, type Language, type Parent } from "@/lib/app-context";
import { useState, useMemo } from "react";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { trpc } from "@/lib/trpc";
import { getParentColors } from "@/lib/theme-utils";

export default function StoryScreen() {
  const router = useRouter();
  const { parent, language, babyName } = useApp();
  const t = useTranslation();
  const [story, setStory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const aiMutation = trpc.ai.chat.useMutation();

  // パフォーマンス最適化: useMemoでメモ化
  const colors = useMemo(() => getParentColors(parent), [parent]);

  const handleRequestStory = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsLoading(true);

    const prompt = buildStoryPrompt(parent as Parent, language as Language, babyName);

    try {
      const response = await aiMutation.mutateAsync({
        messages: [{ role: "user", content: prompt }],
      });
      setStory(response.content);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Story error:", error);
      setStory(getFallbackStory(parent as Parent, language as Language));
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
          <Text style={styles.headerTitle}>📚 {t.storyTime}</Text>
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

          {/* 絵本表示エリア */}
          {story ? (
            <Animated.View
              entering={FadeInUp.duration(400)}
              style={[styles.storyContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={styles.storyIcon}>📖</Text>
              <Text style={styles.storyText}>{story}</Text>
              <Text style={styles.storyEndIcon}>✨</Text>
            </Animated.View>
          ) : (
            <View style={[styles.emptyContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={styles.emptyIcon}>📚</Text>
              <Text style={styles.emptyText}>{t.storyTimeDesc}</Text>
            </View>
          )}

          {/* リクエストボタン */}
          <Pressable
            onPress={handleRequestStory}
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
                {story ? t.newStory : t.tellMeStory}
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

function buildStoryPrompt(parent: Parent, language: Language, babyName?: string | null): string {
  const parentName = parent === "papa" 
    ? (language === "ja" ? "パパ" : "Papa") 
    : (language === "ja" ? "ママ" : "Mama");

  // 名前の使用頻度を自然にするための指示
  const nameInstruction = babyName
    ? (language === "ja" 
        ? `赤ちゃんの名前は「${babyName}」です。お話の最後に名前を呼んで「おやすみなさい」と言ってあげてください。`
        : `The baby's name is "${babyName}". At the end, say goodnight using their name.`)
    : "";

  if (language === "ja") {
    return `あなたは${parentName}です。赤ちゃんに短くて優しい絵本のお話を読み聞かせてあげてください。

${nameInstruction}

以下のフォーマットで回答してください：
1. まず*絵本を開いて*のようなアクション描写
2. 次に短いお話（5-8文程度）
3. 最後に「おしまい」と優しい言葉かけ

お話は動物や自然をテーマにした、温かく優しいものにしてください。
全体で150語以内で、眠りを誘う穏やかな雰囲気で書いてください。`;
  }

  return `You are ${parentName}. Please read a short, gentle bedtime story to the baby.

${nameInstruction}

Format your response as:
1. First, an action description like *opens the storybook*
2. Then a short story (5-8 sentences)
3. Finally, "The End" and some soothing words

The story should be about animals or nature, warm and gentle.
Keep it under 150 words, calm and sleep-inducing.`;
}

function getFallbackStory(parent: Parent, language: Language): string {
  const stories: Record<Parent, Record<Language, string>> = {
    papa: {
      en: `*opens the storybook and settles you in his lap*

Once upon a time, there was a little bunny named Fluffy.
Fluffy loved to hop around the meadow all day.
One evening, as the sun set, Fluffy felt very sleepy.
He found a cozy spot under a big oak tree.
The stars came out to watch over him.
And Fluffy closed his eyes, dreaming of tomorrow's adventures.

The End.

*closes the book gently*

Just like Fluffy, it's time for you to rest now.
Sweet dreams, my little one.`,
      ja: `*絵本を開いて膝の上に座らせて*

むかしむかし、ふわふわという名前の小さなうさぎがいました。
ふわふわは毎日、野原をぴょんぴょん跳ねるのが大好きでした。
ある夕方、お日さまが沈むころ、ふわふわはとても眠くなりました。
大きな木の下に、ふかふかの場所を見つけました。
お星さまたちが、ふわふわを見守ってくれました。
そしてふわふわは目を閉じて、明日の冒険の夢を見ました。

おしまい。

*そっと絵本を閉じて*

ふわふわみたいに、君もおやすみの時間だよ。
いい夢見てね。`,
    },
    mama: {
      en: `*cuddles you close and opens the picture book*

In a garden full of flowers, there lived a tiny butterfly.
Her wings were painted with all the colors of the rainbow.
Every day, she danced from flower to flower.
When night came, the moon smiled down at her.
The flowers whispered, "Goodnight, little butterfly."
She folded her wings and fell asleep on a soft petal.

The End.

*kisses your forehead*

Now it's time for my little butterfly to sleep too.
Mommy loves you so much.`,
      ja: `*ぎゅっと抱きしめて絵本を開いて*

お花がいっぱいのお庭に、小さなちょうちょが住んでいました。
ちょうちょの羽は、虹のようにきれいな色でした。
毎日、お花からお花へ、ひらひら踊っていました。
夜になると、お月さまがにっこり笑いかけてくれました。
お花たちが「おやすみ、ちょうちょさん」とささやきました。
ちょうちょは羽を閉じて、やわらかい花びらの上で眠りました。

おしまい。

*おでこにキスして*

ママの小さなちょうちょさんも、おやすみの時間よ。
大好きよ。`,
    },
  };

  return stories[parent][language];
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
  storyContainer: {
    width: "100%",
    padding: 24,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: "center",
    marginBottom: 24,
  },
  storyIcon: {
    fontSize: 32,
    marginBottom: 16,
  },
  storyEndIcon: {
    fontSize: 32,
    marginTop: 16,
  },
  storyText: {
    fontSize: 16,
    lineHeight: 26,
    color: "#11181C",
    textAlign: "left",
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
