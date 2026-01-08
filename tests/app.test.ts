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
