import { Text, View, Pressable, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useApp, useTranslation, type Language, type Parent } from "@/lib/app-context";
import { useState, useRef, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import Animated, { FadeIn, FadeInUp, SlideInDown } from "react-native-reanimated";
import { trpc } from "@/lib/trpc";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  action?: string;
}

export default function MainScreen() {
  const router = useRouter();
  const { parent, language, resetSettings } = useApp();
  const t = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // AI応答を取得するためのmutation
  const aiMutation = trpc.ai.chat.useMutation();

  const actions = [
    { key: "cry", ...t.actions.cry },
    { key: "laugh", ...t.actions.laugh },
    { key: "sleepy", ...t.actions.sleepy },
    { key: "hungry", ...t.actions.hungry },
    { key: "play", ...t.actions.play },
    { key: "hold", ...t.actions.hold },
  ];

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

  const handleAction = async (action: typeof actions[0]) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // ユーザーのアクションを追加
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: `${action.emoji} ${action.text}`,
      action: action.action,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // AI応答を取得
      const response = await aiMutation.mutateAsync({
        messages: [
          {
            role: "user",
            content: buildPrompt(action.action, parent as Parent, language as Language),
          },
        ],
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: response.content,
      };
      setMessages((prev) => [...prev, aiMessage]);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("AI response error:", error);
      // フォールバック応答
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: getFallbackResponse(action.key, parent as Parent, language as Language),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeParent = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await resetSettings();
    router.replace("/");
  };

  useEffect(() => {
    // 新しいメッセージが追加されたらスクロール
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // 初期挨拶メッセージ
  useEffect(() => {
    const greeting = getGreeting(parent as Parent, language as Language);
    setMessages([
      {
        id: "greeting",
        type: "ai",
        content: greeting,
      },
    ]);
  }, [parent, language]);

  return (
    <ScreenContainer containerClassName={`bg-[${colors.bg}]`} edges={["top", "left", "right"]}>
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        {/* ヘッダー */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerContent}>
            <Text style={styles.parentEmoji}>{parent === "papa" ? "👨" : "👩"}</Text>
            <Text style={styles.headerTitle}>
              {parent === "papa" ? t.papa : t.mama}
            </Text>
          </View>
          <Pressable
            onPress={() => setShowSettings(!showSettings)}
            style={({ pressed }) => [
              styles.settingsButton,
              pressed && styles.settingsButtonPressed,
            ]}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </Pressable>
        </View>

        {/* 設定メニュー */}
        {showSettings && (
          <Animated.View 
            entering={FadeIn.duration(200)}
            style={[styles.settingsMenu, { backgroundColor: colors.surface }]}
          >
            <Pressable
              onPress={handleChangeParent}
              style={({ pressed }) => [
                styles.settingsItem,
                pressed && styles.settingsItemPressed,
              ]}
            >
              <Text style={styles.settingsItemText}>{t.changeParent}</Text>
            </Pressable>
          </Animated.View>
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
              entering={FadeInUp.delay(index * 50).duration(300)}
              style={[
                styles.messageBubble,
                message.type === "user"
                  ? [styles.userBubble, { backgroundColor: colors.primary }]
                  : [styles.aiBubble, { backgroundColor: colors.surface, borderColor: colors.border }],
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.type === "user" ? styles.userText : styles.aiText,
                ]}
              >
                {message.content}
              </Text>
            </Animated.View>
          ))}
          {isLoading && (
            <View style={[styles.messageBubble, styles.aiBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}
        </ScrollView>

        {/* アクションボタン */}
        <Animated.View 
          entering={SlideInDown.duration(400)}
          style={[styles.actionsContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}
        >
          <View style={styles.actionsGrid}>
            {actions.map((action) => (
              <Pressable
                key={action.key}
                onPress={() => handleAction(action)}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: colors.primary, opacity: isLoading ? 0.5 : 1 },
                  pressed && styles.actionButtonPressed,
                ]}
              >
                <Text style={styles.actionEmoji}>{action.emoji}</Text>
                <Text style={styles.actionText}>{action.text}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}

// プロンプト生成
function buildPrompt(action: string, parent: Parent, language: Language): string {
  const parentName = parent === "papa" 
    ? (language === "ja" ? "パパ" : "Papa") 
    : (language === "ja" ? "ママ" : "Mama");
  
  const parentDesc = parent === "papa"
    ? (language === "ja" ? "優しく穏やかで、少し不器用だが一生懸命な父親" : "A gentle, playful, slightly clumsy but devoted father")
    : (language === "ja" ? "温かく包容力があり、直感的に赤ちゃんの気持ちを察する母親" : "A warm, intuitive, soothing mother");

  return `You are ${parentName}, ${parentDesc}. You are caring for a baby (the user).

The baby is ${action}.

Respond in ${language === "ja" ? "Japanese" : "English"} with 30-80 words.
Include actions in italics like *gently rocks you* or *優しく抱き上げて*.
Use soft, affectionate baby-talk.
Be repetitive and rhythmic (babies find this comforting).
Use onomatopoeia (e.g., "よしよし", "coochie-coo").
Never break character. Always maintain a safe, loving environment.`;
}

// フォールバック応答
function getFallbackResponse(actionKey: string, parent: Parent, language: Language): string {
  const responses: Record<string, Record<Parent, Record<Language, string>>> = {
    cry: {
      papa: {
        en: "*gently picks you up*\n\nThere, there... What's wrong, little one?\nPapa's here for you.\n*softly pats your back*\nIt's okay, it's okay...",
        ja: "*優しく抱き上げて*\n\nよしよし、どうしたんだい？\nパパがいるから大丈夫だよ。\n*背中をトントン*\n大丈夫、大丈夫...",
      },
      mama: {
        en: "*gently holds you close*\n\nOh sweetie, it's okay.\nMommy's got you.\n*rocks you softly*\nShh, shh... You're safe now.",
        ja: "*優しく抱きしめて*\n\nよしよーし、ママがいるからね。\n*ゆらゆら揺らしながら*\n大丈夫よ、大丈夫...",
      },
    },
    laugh: {
      papa: {
        en: "*lights up with joy*\n\nLook at that beautiful smile!\nAre you happy, little one?\n*playfully bounces you*\nDaddy loves seeing you so happy!",
        ja: "*嬉しそうに笑って*\n\nあははっ、いい笑顔だね！\nパパも嬉しいよ！\n*高い高い*\nもっと笑って！",
      },
      mama: {
        en: "*smiles warmly*\n\nOh, what a happy baby!\nYou're such a good baby!\n*gently tickles your tummy*\nMommy loves your giggles!",
        ja: "*にっこり笑って*\n\nあら、ご機嫌さんね！\nいい子いい子。\n*ほっぺをつんつん*\nかわいいね〜",
      },
    },
    sleepy: {
      papa: {
        en: "*cradles you gently*\n\nAre you sleepy, little one?\nLet Papa sing you a lullaby...\n*hums softly*\nClose your eyes... sweet dreams...",
        ja: "*優しく抱っこして*\n\n眠いのかな？\nパパが子守唄を歌ってあげるね。\n*ゆらゆら*\nねんねんころりよ...",
      },
      mama: {
        en: "*holds you close*\n\nOh, sleepy baby...\nMommy will sing you to sleep.\n*gently rocks you*\nHush little baby... sweet dreams...",
        ja: "*優しく抱きしめて*\n\nねむねむさんね...\nママが歌ってあげるね。\n*ゆらゆら*\nねんねんころりよ...",
      },
    },
    hungry: {
      papa: {
        en: "*prepares the bottle*\n\nOh, you're hungry!\nHere comes the milk!\n*gently feeds you*\nThere you go... good baby!",
        ja: "*ミルクを準備して*\n\nお腹空いたのかな？\nはい、ミルクだよ。\n*優しく飲ませて*\nいい子だね〜",
      },
      mama: {
        en: "*holds the bottle*\n\nHungry baby?\nMommy has your milk ready.\n*feeds you gently*\nThere, there... drink up, sweetie.",
        ja: "*ミルクを持って*\n\nお腹空いちゃったのね。\nはい、ミルクよ。\n*優しく飲ませて*\nいっぱい飲んでね。",
      },
    },
    play: {
      papa: {
        en: "*picks up a toy*\n\nWant to play?\nLet's play airplane! Whoooosh!\n*flies you around*\nWeeeee! Look at you fly!",
        ja: "*おもちゃを持って*\n\n遊びたいの？\nじゃあ飛行機ごっこしよう！\n*ブーンと飛ばして*\nびゅーん！高い高い！",
      },
      mama: {
        en: "*claps hands*\n\nPeek-a-boo!\n*covers face, then reveals*\nThere you are!\n*giggles*\nLet's play together, sweetie!",
        ja: "*手をたたいて*\n\nいないいない...\n*顔を隠して*\nばあ！\n*にっこり*\n一緒に遊ぼうね！",
      },
    },
    hold: {
      papa: {
        en: "*opens arms wide*\n\nCome here, little one.\n*holds you close to chest*\nPapa's got you.\nYou're safe and loved.",
        ja: "*両手を広げて*\n\nおいで、抱っこしてあげるよ。\n*ぎゅっと抱きしめて*\nパパがいるからね。\n大好きだよ。",
      },
      mama: {
        en: "*embraces you warmly*\n\nCome to Mommy.\n*holds you tight*\nI've got you, sweetie.\nMommy loves you so much.",
        ja: "*優しく抱きしめて*\n\nママのところにおいで。\n*ぎゅっと*\nママがいるからね。\n大好きよ。",
      },
    },
  };

  return responses[actionKey]?.[parent]?.[language] || responses.cry[parent][language];
}

// 初期挨拶
function getGreeting(parent: Parent, language: Language): string {
  const greetings: Record<Parent, Record<Language, string>> = {
    papa: {
      en: "*smiles warmly*\n\nHello there, little one!\nPapa's here to take care of you.\nWhat do you need?",
      ja: "*にっこり笑って*\n\nやあ、おはよう！\nパパがいるから安心してね。\nどうしたのかな？",
    },
    mama: {
      en: "*opens arms*\n\nHello, my sweet baby!\nMommy's here for you.\nWhat would you like to do?",
      ja: "*優しく微笑んで*\n\nこんにちは、かわいい赤ちゃん！\nママがいるからね。\n何がしたいのかな？",
    },
  };

  return greetings[parent][language];
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
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  parentEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#11181C",
  },
  settingsButton: {
    padding: 8,
  },
  settingsButtonPressed: {
    opacity: 0.6,
  },
  settingsIcon: {
    fontSize: 24,
  },
  settingsMenu: {
    position: "absolute",
    top: 60,
    right: 16,
    borderRadius: 12,
    padding: 8,
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  settingsItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  settingsItemPressed: {
    opacity: 0.7,
  },
  settingsItemText: {
    fontSize: 16,
    color: "#11181C",
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
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  userText: {
    color: "#ffffff",
  },
  aiText: {
    color: "#11181C",
  },
  actionsContainer: {
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  actionButton: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  actionEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
  },
});
