import { Text, View, Pressable, StyleSheet, ScrollView, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform as RNPlatform } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useApp, useTranslation, type Language, type Parent } from "@/lib/app-context";
import { usePremium } from "@/lib/premium-context";
import { useState, useRef, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { trpc } from "@/lib/trpc";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const FREE_DAILY_LIMIT = 3;
const STORAGE_KEY_MESSAGES = "chat_messages_today";
const STORAGE_KEY_DATE = "chat_date";

export default function ChatScreen() {
  const router = useRouter();
  const { parent, language, babyName } = useApp();
  const { isPremium } = usePremium();
  const t = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messagesUsedToday, setMessagesUsedToday] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const aiMutation = trpc.ai.chat.useMutation();

  // 今日のメッセージ使用数を読み込む
  useEffect(() => {
    loadMessageCount();
  }, []);

  const loadMessageCount = async () => {
    try {
      const storedDate = await AsyncStorage.getItem(STORAGE_KEY_DATE);
      const today = new Date().toDateString();
      
      if (storedDate === today) {
        const count = await AsyncStorage.getItem(STORAGE_KEY_MESSAGES);
        setMessagesUsedToday(parseInt(count || "0", 10));
      } else {
        // 新しい日なのでリセット
        await AsyncStorage.setItem(STORAGE_KEY_DATE, today);
        await AsyncStorage.setItem(STORAGE_KEY_MESSAGES, "0");
        setMessagesUsedToday(0);
      }
    } catch (error) {
      console.error("Failed to load message count:", error);
    }
  };

  const incrementMessageCount = async () => {
    try {
      const newCount = messagesUsedToday + 1;
      await AsyncStorage.setItem(STORAGE_KEY_MESSAGES, newCount.toString());
      setMessagesUsedToday(newCount);
    } catch (error) {
      console.error("Failed to save message count:", error);
    }
  };

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

  const canSendMessage = isPremium || messagesUsedToday < FREE_DAILY_LIMIT;
  const remainingMessages = FREE_DAILY_LIMIT - messagesUsedToday;

  const handleSend = async () => {
    if (!inputText.trim() || isLoading || !canSendMessage) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputText.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    // 無料ユーザーの場合はカウントを増やす
    if (!isPremium) {
      await incrementMessageCount();
    }

    try {
      const systemPrompt = buildSystemPrompt(parent as Parent, language as Language, babyName);
      const conversationHistory = [
        { role: "system" as const, content: systemPrompt },
        ...messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user" as const, content: userMessage.content },
      ];

      const response = await aiMutation.mutateAsync({
        messages: conversationHistory,
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getFallbackResponse(parent as Parent, language as Language),
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleUpgrade = () => {
    router.push("/upgrade" as never);
  };

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // 初期挨拶
  useEffect(() => {
    const greeting = getGreeting(parent as Parent, language as Language);
    setMessages([
      {
        id: "greeting",
        role: "assistant",
        content: greeting,
      },
    ]);
  }, [parent, language]);

  return (
    <ScreenContainer containerClassName={`bg-[${colors.bg}]`} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: colors.bg }]}
        behavior={RNPlatform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
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
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>💬 {t.chatMode}</Text>
            {isPremium && (
              <View style={[styles.premiumBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.premiumBadgeText}>⭐ Premium</Text>
              </View>
            )}
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* メッセージ制限表示（無料ユーザーのみ） */}
        {!isPremium && (
          <View style={[styles.limitBanner, { backgroundColor: colors.surface }]}>
            <Text style={styles.limitText}>
              {canSendMessage 
                ? `${remainingMessages} ${t.messagesRemaining}`
                : t.noMessagesLeft
              }
            </Text>
            <Pressable onPress={handleUpgrade}>
              <Text style={[styles.upgradeLink, { color: colors.primary }]}>
                {t.upgradeForMore}
              </Text>
            </Pressable>
          </View>
        )}

        {/* メッセージエリア */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message, index) => (
            <Animated.View
              key={message.id}
              entering={FadeInUp.delay(index * 30).duration(200)}
              style={[
                styles.messageBubble,
                message.role === "user"
                  ? [styles.userBubble, { backgroundColor: colors.primary }]
                  : [styles.assistantBubble, { backgroundColor: colors.surface, borderColor: colors.border }],
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.role === "user" ? styles.userText : styles.assistantText,
                ]}
              >
                {message.content}
              </Text>
            </Animated.View>
          ))}
          {isLoading && (
            <View style={[styles.messageBubble, styles.assistantBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}
        </ScrollView>

        {/* 入力エリア */}
        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.bg, borderColor: colors.border }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder={t.chatPlaceholder}
            placeholderTextColor="#9BA1A6"
            multiline
            maxLength={500}
            editable={canSendMessage}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <Pressable
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading || !canSendMessage}
            style={({ pressed }) => [
              styles.sendButton,
              { backgroundColor: colors.primary },
              (!inputText.trim() || isLoading || !canSendMessage) && styles.sendButtonDisabled,
              pressed && styles.sendButtonPressed,
            ]}
          >
            <Text style={styles.sendButtonText}>{t.send}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

function buildSystemPrompt(parent: Parent, language: Language, babyName?: string | null): string {
  const parentName = parent === "papa" 
    ? (language === "ja" ? "パパ" : "Papa") 
    : (language === "ja" ? "ママ" : "Mama");

  const parentDesc = parent === "papa"
    ? (language === "ja" ? "優しく穏やかで、少し不器用だが一生懸命な父親" : "A gentle, playful, slightly clumsy but devoted father")
    : (language === "ja" ? "温かく包容力があり、直感的に赤ちゃんの気持ちを察する母親" : "A warm, intuitive, soothing mother");

  // 名前の使用頻度を自然にするための指示
  const nameInstruction = babyName
    ? (language === "ja" 
        ? `赤ちゃんの名前は「${babyName}」です。名前を呼ぶのは最初の一回だけ、または特に愛情を込めたい時だけにしてください。毎回名前を呼ぶのは不自然なので、「赤ちゃん」「ぼく」「きみ」などの代名詞も使ってください。`
        : `The baby's name is "${babyName}". Only use their name once at the beginning or when expressing special affection. Using the name every time sounds unnatural, so also use pronouns like "you", "sweetie", "little one", etc.`)
    : (language === "ja"
        ? `赤ちゃんを「赤ちゃん」「ぼく」「きみ」などと呼んでください。`
        : `Call the baby "sweetie", "little one", "you", etc.`);

  if (language === "ja") {
    return `あなたは${parentName}です。${parentDesc}として、赤ちゃん（ユーザー）と自由に会話してください。

${nameInstruction}

ルール：
- 常に${parentName}として振る舞ってください
- 赤ちゃん言葉で優しく話しかけてください
- *優しく抱きしめて* のようなアクション描写を含めてください
- 安全で愛情深い環境を維持してください
- 50-100語程度で応答してください`;
  }

  return `You are ${parentName}, ${parentDesc}. Have a free conversation with the baby (user).

${nameInstruction}

Rules:
- Always stay in character as ${parentName}
- Use soft, affectionate baby-talk
- Include action descriptions like *gently hugs you*
- Maintain a safe, loving environment
- Respond in 50-100 words`;
}

function getGreeting(parent: Parent, language: Language): string {
  const greetings: Record<Parent, Record<Language, string>> = {
    papa: {
      en: "*sits down with you*\n\nHey there, little one! Papa's here to chat with you.\nWhat's on your mind today? Tell me anything!",
      ja: "*隣に座って*\n\nやあ、パパだよ！\n今日は何でもお話ししようね。\n何か聞きたいことある？",
    },
    mama: {
      en: "*cuddles you close*\n\nHello, my sweet baby! Mommy's here to talk with you.\nWhat would you like to chat about?",
      ja: "*優しく抱きしめて*\n\nこんにちは、かわいい赤ちゃん！\nママとおしゃべりしようね。\n何でも話してね。",
    },
  };

  return greetings[parent][language];
}

function getFallbackResponse(parent: Parent, language: Language): string {
  const responses: Record<Parent, Record<Language, string>> = {
    papa: {
      en: "*smiles warmly*\n\nI'm listening, little one. Papa's always here for you.\nTell me more!",
      ja: "*にっこり笑って*\n\nうんうん、パパは聞いてるよ。\nもっと教えて！",
    },
    mama: {
      en: "*nods gently*\n\nMommy's listening, sweetie. I'm always here for you.\nGo on, tell me more.",
      ja: "*優しくうなずいて*\n\nママは聞いてるよ。\nもっとお話しして。",
    },
  };

  return responses[parent][language];
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
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#11181C",
  },
  premiumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  placeholder: {
    width: 80,
  },
  limitBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  limitText: {
    fontSize: 14,
    color: "#687076",
  },
  upgradeLink: {
    fontSize: 14,
    fontWeight: "600",
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageBubble: {
    maxWidth: "85%",
    padding: 14,
    borderRadius: 18,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: "#ffffff",
  },
  assistantText: {
    color: "#11181C",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    gap: 10,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    fontSize: 16,
    color: "#11181C",
  },
  sendButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});
