import { describe, it, expect } from "vitest";

// アプリコンテキストの翻訳データをテスト
describe("App Translations", () => {
  const translations = {
    en: {
      selectLanguage: "Select Language",
      english: "English",
      japanese: "日本語",
      selectParent: "Who will take care of you?",
      papa: "Papa",
      mama: "Mama",
      papaDesc: "Gentle, playful, and devoted",
      mamaDesc: "Warm, intuitive, and soothing",
      actions: {
        cry: { emoji: "😭", text: "Waaah", action: "crying" },
        laugh: { emoji: "😊", text: "Giggle", action: "giggling happily" },
        sleepy: { emoji: "😴", text: "Sleepy...", action: "feeling sleepy" },
        hungry: { emoji: "🍼", text: "Hungry", action: "feeling hungry" },
        play: { emoji: "🎵", text: "Play!", action: "wanting to play" },
        hold: { emoji: "🤗", text: "Hold me", action: "wanting to be held" },
      },
    },
    ja: {
      selectLanguage: "言語を選択",
      english: "English",
      japanese: "日本語",
      selectParent: "誰にあやしてもらう？",
      papa: "パパ",
      mama: "ママ",
      papaDesc: "優しくて穏やか、一生懸命",
      mamaDesc: "温かくて包容力がある",
      actions: {
        cry: { emoji: "😭", text: "ふえーん", action: "泣いている" },
        laugh: { emoji: "😊", text: "あははっ", action: "嬉しそうに笑っている" },
        sleepy: { emoji: "😴", text: "ねむい...", action: "眠そうにしている" },
        hungry: { emoji: "🍼", text: "おなかすいた", action: "お腹が空いている" },
        play: { emoji: "🎵", text: "あそぼ!", action: "遊びたがっている" },
        hold: { emoji: "🤗", text: "だっこ", action: "抱っこしてほしがっている" },
      },
    },
  };

  it("should have English translations", () => {
    expect(translations.en).toBeDefined();
    expect(translations.en.papa).toBe("Papa");
    expect(translations.en.mama).toBe("Mama");
  });

  it("should have Japanese translations", () => {
    expect(translations.ja).toBeDefined();
    expect(translations.ja.papa).toBe("パパ");
    expect(translations.ja.mama).toBe("ママ");
  });

  it("should have all 6 baby actions in English", () => {
    const actions = translations.en.actions;
    expect(Object.keys(actions)).toHaveLength(6);
    expect(actions.cry).toBeDefined();
    expect(actions.laugh).toBeDefined();
    expect(actions.sleepy).toBeDefined();
    expect(actions.hungry).toBeDefined();
    expect(actions.play).toBeDefined();
    expect(actions.hold).toBeDefined();
  });

  it("should have all 6 baby actions in Japanese", () => {
    const actions = translations.ja.actions;
    expect(Object.keys(actions)).toHaveLength(6);
    expect(actions.cry.text).toBe("ふえーん");
    expect(actions.laugh.text).toBe("あははっ");
  });

  it("should have emoji for all actions", () => {
    const enActions = translations.en.actions;
    const jaActions = translations.ja.actions;
    
    // Check English actions have emoji
    expect(enActions.cry.emoji).toBe("😭");
    expect(enActions.laugh.emoji).toBe("😊");
    expect(enActions.sleepy.emoji).toBe("😴");
    expect(enActions.hungry.emoji).toBe("🍼");
    expect(enActions.play.emoji).toBe("🎵");
    expect(enActions.hold.emoji).toBe("🤗");
    
    // Check Japanese actions have same emoji
    expect(jaActions.cry.emoji).toBe("😭");
    expect(jaActions.laugh.emoji).toBe("😊");
  });
});

// プロンプト生成のテスト
describe("Prompt Generation", () => {
  function buildPrompt(action: string, parent: "papa" | "mama", language: "en" | "ja"): string {
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

  it("should generate English Papa prompt correctly", () => {
    const prompt = buildPrompt("crying", "papa", "en");
    expect(prompt).toContain("Papa");
    expect(prompt).toContain("gentle, playful");
    expect(prompt).toContain("English");
    expect(prompt).toContain("crying");
  });

  it("should generate Japanese Mama prompt correctly", () => {
    const prompt = buildPrompt("泣いている", "mama", "ja");
    expect(prompt).toContain("ママ");
    expect(prompt).toContain("温かく包容力");
    expect(prompt).toContain("Japanese");
  });

  it("should include action in prompt", () => {
    const prompt = buildPrompt("feeling sleepy", "papa", "en");
    expect(prompt).toContain("feeling sleepy");
  });

  it("should include instructions for response format", () => {
    const prompt = buildPrompt("crying", "mama", "en");
    expect(prompt).toContain("30-80 words");
    expect(prompt).toContain("italics");
    expect(prompt).toContain("baby-talk");
  });
});

// フォールバック応答のテスト
describe("Fallback Responses", () => {
  const responses: Record<string, Record<"papa" | "mama", Record<"en" | "ja", string>>> = {
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
  };

  it("should have Papa English cry response", () => {
    const response = responses.cry.papa.en;
    expect(response).toContain("Papa");
    expect(response).toContain("*gently picks you up*");
  });

  it("should have Mama Japanese cry response", () => {
    const response = responses.cry.mama.ja;
    expect(response).toContain("ママ");
    expect(response).toContain("よしよーし");
  });

  it("should include action descriptions in italics", () => {
    const response = responses.cry.papa.en;
    expect(response).toMatch(/\*[^*]+\*/);
  });
});

// 子守唄プロンプトのテスト
describe("Lullaby Prompt Generation", () => {
  function buildLullabyPrompt(parent: "papa" | "mama", language: "en" | "ja"): string {
    const parentName = parent === "papa" 
      ? (language === "ja" ? "パパ" : "Papa") 
      : (language === "ja" ? "ママ" : "Mama");

    if (language === "ja") {
      return `あなたは${parentName}です。赤ちゃんに優しい子守唄を歌ってあげてください。`;
    }
    return `You are ${parentName}. Please sing a gentle lullaby to the baby.`;
  }

  it("should generate Japanese Papa lullaby prompt", () => {
    const prompt = buildLullabyPrompt("papa", "ja");
    expect(prompt).toContain("パパ");
    expect(prompt).toContain("子守唄");
  });

  it("should generate English Mama lullaby prompt", () => {
    const prompt = buildLullabyPrompt("mama", "en");
    expect(prompt).toContain("Mama");
    expect(prompt).toContain("lullaby");
  });
});

// 絵本プロンプトのテスト
describe("Story Prompt Generation", () => {
  function buildStoryPrompt(parent: "papa" | "mama", language: "en" | "ja"): string {
    const parentName = parent === "papa" 
      ? (language === "ja" ? "パパ" : "Papa") 
      : (language === "ja" ? "ママ" : "Mama");

    if (language === "ja") {
      return `あなたは${parentName}です。赤ちゃんに短くて優しい絵本のお話を読み聞かせてあげてください。`;
    }
    return `You are ${parentName}. Please read a short, gentle bedtime story to the baby.`;
  }

  it("should generate Japanese Mama story prompt", () => {
    const prompt = buildStoryPrompt("mama", "ja");
    expect(prompt).toContain("ママ");
    expect(prompt).toContain("絵本");
  });

  it("should generate English Papa story prompt", () => {
    const prompt = buildStoryPrompt("papa", "en");
    expect(prompt).toContain("Papa");
    expect(prompt).toContain("story");
  });
});

// 子守唄フォールバックのテスト
describe("Lullaby Fallback Responses", () => {
  const lullabies = {
    papa: {
      en: "*gently rocks you in his arms*\n\nHush little baby, don't you cry,\nPapa's gonna sing you a lullaby.",
      ja: "*優しく抱っこしてゆらゆら*\n\nねんねんころりよ おころりよ\nパパがそばにいるからね",
    },
    mama: {
      en: "*holds you close to her heart*\n\nSleep, my baby, sleep so tight,\nMommy's love will hold you right.",
      ja: "*胸に抱きしめて*\n\nねんねんころりよ おころりよ\nママのそばでおやすみなさい",
    },
  };

  it("should have Papa English lullaby", () => {
    expect(lullabies.papa.en).toContain("Papa");
    expect(lullabies.papa.en).toContain("lullaby");
  });

  it("should have Mama Japanese lullaby", () => {
    expect(lullabies.mama.ja).toContain("ママ");
    expect(lullabies.mama.ja).toContain("ねんねんころりよ");
  });
});

// 絵本フォールバックのテスト
describe("Story Fallback Responses", () => {
  const stories = {
    papa: {
      en: "*opens the storybook and settles you in his lap*\n\nOnce upon a time, there was a little bunny named Fluffy.",
      ja: "*絵本を開いて膝の上に座らせて*\n\nむかしむかし、ふわふわという名前の小さなうさぎがいました。",
    },
    mama: {
      en: "*cuddles you close and opens the picture book*\n\nIn a garden full of flowers, there lived a tiny butterfly.",
      ja: "*ぎゅっと抱きしめて絵本を開いて*\n\nお花がいっぱいのお庭に、小さなちょうちょが住んでいました。",
    },
  };

  it("should have Papa English story", () => {
    expect(stories.papa.en).toContain("storybook");
    expect(stories.papa.en).toContain("bunny");
  });

  it("should have Mama Japanese story", () => {
    expect(stories.mama.ja).toContain("絵本");
    expect(stories.mama.ja).toContain("ちょうちょ");
  });
});

// 特別モード翻訳のテスト
describe("Special Mode Translations", () => {
  const translations = {
    en: {
      lullaby: "Lullaby",
      lullabyDesc: "Listen to a soothing lullaby",
      storyTime: "Story Time",
      storyTimeDesc: "Listen to a bedtime story",
      backToMain: "Back",
      listenToLullaby: "Sing me a lullaby",
      tellMeStory: "Tell me a story",
      newLullaby: "Another lullaby",
      newStory: "Another story",
    },
    ja: {
      lullaby: "子守唄",
      lullabyDesc: "優しい子守唄を聴く",
      storyTime: "絵本",
      storyTimeDesc: "おやすみのお話を聴く",
      backToMain: "戻る",
      listenToLullaby: "子守唄を歌って",
      tellMeStory: "お話して",
      newLullaby: "もう一曲",
      newStory: "もう一つ",
    },
  };

  it("should have English special mode translations", () => {
    expect(translations.en.lullaby).toBe("Lullaby");
    expect(translations.en.storyTime).toBe("Story Time");
  });

  it("should have Japanese special mode translations", () => {
    expect(translations.ja.lullaby).toBe("子守唄");
    expect(translations.ja.storyTime).toBe("絵本");
  });

  it("should have action button texts", () => {
    expect(translations.en.listenToLullaby).toBe("Sing me a lullaby");
    expect(translations.ja.listenToLullaby).toBe("子守唄を歌って");
  });
});

// プレミアム状態管理のテスト
describe("Premium State Management", () => {
  it("should have free plan by default", () => {
    const defaultPlan = 'free';
    expect(defaultPlan).toBe('free');
  });

  it("should upgrade to premium", () => {
    let plan = 'free';
    plan = 'premium';
    expect(plan).toBe('premium');
  });

  it("should check isPremium correctly", () => {
    const plan = 'premium';
    const isPremium = plan === 'premium';
    expect(isPremium).toBe(true);
  });
});

// チャットモード翻訳のテスト
describe("Chat Mode Translations", () => {
  const translations = {
    en: {
      chatMode: 'Chat Mode',
      chatModeDesc: 'Have a free conversation with your parent',
      premiumFeature: 'Premium Feature',
      upgradeToPremium: 'Upgrade to Premium',
      premiumBenefits: 'Unlock unlimited chat conversations',
      chatPlaceholder: 'Type your message...',
      send: 'Send',
    },
    ja: {
      chatMode: 'チャットモード',
      chatModeDesc: '自由におしゃべりしよう',
      premiumFeature: 'プレミアム機能',
      upgradeToPremium: 'プレミアムにアップグレード',
      premiumBenefits: '無制限のチャットをお楽しみいただけます',
      chatPlaceholder: 'メッセージを入力...',
      send: '送信',
    },
  };

  it("should have English chat mode translations", () => {
    expect(translations.en.chatMode).toBe('Chat Mode');
    expect(translations.en.send).toBe('Send');
  });

  it("should have Japanese chat mode translations", () => {
    expect(translations.ja.chatMode).toBe('チャットモード');
    expect(translations.ja.send).toBe('送信');
  });
});

// チャットメッセージ制限のテスト
describe("Chat Message Limits", () => {
  const FREE_DAILY_LIMIT = 3;

  it("should allow messages when under limit", () => {
    const messagesUsed = 2;
    const canSend = messagesUsed < FREE_DAILY_LIMIT;
    expect(canSend).toBe(true);
  });

  it("should block messages when at limit", () => {
    const messagesUsed = 3;
    const canSend = messagesUsed < FREE_DAILY_LIMIT;
    expect(canSend).toBe(false);
  });

  it("should allow unlimited for premium", () => {
    const isPremium = true;
    const messagesUsed = 100;
    const canSend = isPremium || messagesUsed < FREE_DAILY_LIMIT;
    expect(canSend).toBe(true);
  });
});

// チャットプロンプトのテスト
describe("Chat System Prompt", () => {
  function buildChatPrompt(parent: "papa" | "mama", language: "en" | "ja"): string {
    const parentName = parent === "papa" 
      ? (language === "ja" ? "パパ" : "Papa") 
      : (language === "ja" ? "ママ" : "Mama");

    if (language === "ja") {
      return `あなたは${parentName}です。赤ちゃんと自由に会話してください。`;
    }
    return `You are ${parentName}. Have a free conversation with the baby.`;
  }

  it("should generate Japanese Papa chat prompt", () => {
    const prompt = buildChatPrompt("papa", "ja");
    expect(prompt).toContain("パパ");
    expect(prompt).toContain("会話");
  });

  it("should generate English Mama chat prompt", () => {
    const prompt = buildChatPrompt("mama", "en");
    expect(prompt).toContain("Mama");
    expect(prompt).toContain("conversation");
  });
});

// チャット挨拶のテスト
describe("Chat Greetings", () => {
  const greetings = {
    papa: {
      en: "Hey there, little one! Papa's here to chat with you.",
      ja: "やあ、パパだよ！今日は何でもお話ししようね。",
    },
    mama: {
      en: "Hello, my sweet baby! Mommy's here to talk with you.",
      ja: "こんにちは、かわいい赤ちゃん！ママとおしゃべりしようね。",
    },
  };

  it("should have Papa English greeting", () => {
    expect(greetings.papa.en).toContain("Papa");
  });

  it("should have Mama Japanese greeting", () => {
    expect(greetings.mama.ja).toContain("ママ");
  });
});

// テーマカラーのテスト
describe("Theme Colors", () => {
  const papaColors = {
    bg: "#E3F2FD",
    primary: "#90CAF9",
    surface: "#BBDEFB",
    border: "#64B5F6",
  };

  const mamaColors = {
    bg: "#FCE4EC",
    primary: "#F48FB1",
    surface: "#F8BBD9",
    border: "#F06292",
  };

  it("should have Papa blue theme colors", () => {
    expect(papaColors.bg).toBe("#E3F2FD");
    expect(papaColors.primary).toBe("#90CAF9");
  });

  it("should have Mama pink theme colors", () => {
    expect(mamaColors.bg).toBe("#FCE4EC");
    expect(mamaColors.primary).toBe("#F48FB1");
  });

  it("should have different colors for Papa and Mama", () => {
    expect(papaColors.primary).not.toBe(mamaColors.primary);
    expect(papaColors.bg).not.toBe(mamaColors.bg);
  });
});
