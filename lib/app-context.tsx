import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 型定義
export type Language = 'en' | 'ja';
export type Parent = 'papa' | 'mama';

interface AppState {
  language: Language | null;
  parent: Parent | null;
  isLoading: boolean;
}

interface AppContextType extends AppState {
  setLanguage: (lang: Language) => Promise<void>;
  setParent: (parent: Parent) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  LANGUAGE: 'app_language',
  PARENT: 'app_parent',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    language: null,
    parent: null,
    isLoading: true,
  });

  // 初期化時に保存された設定を読み込む
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [language, parent] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
        AsyncStorage.getItem(STORAGE_KEYS.PARENT),
      ]);
      setState({
        language: language as Language | null,
        parent: parent as Parent | null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
      setState(prev => ({ ...prev, language: lang }));
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  };

  const setParent = async (parent: Parent) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PARENT, parent);
      setState(prev => ({ ...prev, parent }));
    } catch (error) {
      console.error('Failed to save parent:', error);
    }
  };

  const resetSettings = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.LANGUAGE),
        AsyncStorage.removeItem(STORAGE_KEYS.PARENT),
      ]);
      setState({
        language: null,
        parent: null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        setLanguage,
        setParent,
        resetSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// 翻訳ヘルパー
export const translations = {
  en: {
    selectLanguage: 'Select Language',
    english: 'English',
    japanese: '日本語',
    selectParent: 'Who will take care of you?',
    papa: 'Papa',
    mama: 'Mama',
    papaDesc: 'Gentle, playful, and devoted',
    mamaDesc: 'Warm, intuitive, and soothing',
    actions: {
      cry: { emoji: '😭', text: 'Waaah', action: 'crying' },
      laugh: { emoji: '😊', text: 'Giggle', action: 'giggling happily' },
      sleepy: { emoji: '😴', text: 'Sleepy...', action: 'feeling sleepy' },
      hungry: { emoji: '🍼', text: 'Hungry', action: 'feeling hungry' },
      play: { emoji: '🎵', text: 'Play!', action: 'wanting to play' },
      hold: { emoji: '🤗', text: 'Hold me', action: 'wanting to be held' },
    },
    settings: 'Settings',
    changeParent: 'Change Parent',
    changeLanguage: 'Change Language',
    specialModes: 'Special Modes',
    lullaby: 'Lullaby',
    lullabyDesc: 'Listen to a soothing lullaby',
    storyTime: 'Story Time',
    storyTimeDesc: 'Listen to a bedtime story',
    backToMain: 'Back',
    listenToLullaby: 'Sing me a lullaby',
    tellMeStory: 'Tell me a story',
    newLullaby: 'Another lullaby',
    newStory: 'Another story',
  },
  ja: {
    selectLanguage: '言語を選択',
    english: 'English',
    japanese: '日本語',
    selectParent: '誰にあやしてもらう？',
    papa: 'パパ',
    mama: 'ママ',
    papaDesc: '優しくて穏やか、一生懸命',
    mamaDesc: '温かくて包容力がある',
    actions: {
      cry: { emoji: '😭', text: 'ふえーん', action: '泣いている' },
      laugh: { emoji: '😊', text: 'あははっ', action: '嬉しそうに笑っている' },
      sleepy: { emoji: '😴', text: 'ねむい...', action: '眠そうにしている' },
      hungry: { emoji: '🍼', text: 'おなかすいた', action: 'お腹が空いている' },
      play: { emoji: '🎵', text: 'あそぼ!', action: '遊びたがっている' },
      hold: { emoji: '🤗', text: 'だっこ', action: '抱っこしてほしがっている' },
    },
    settings: '設定',
    changeParent: '保護者を変更',
    changeLanguage: '言語を変更',
    specialModes: '特別モード',
    lullaby: '子守唄',
    lullabyDesc: '優しい子守唄を聴く',
    storyTime: '絵本',
    storyTimeDesc: 'おやすみのお話を聴く',
    backToMain: '戻る',
    listenToLullaby: '子守唄を歌って',
    tellMeStory: 'お話して',
    newLullaby: 'もう一曲',
    newStory: 'もう一つ',
  },
} as const;

export function useTranslation() {
  const { language } = useApp();
  return translations[language || 'en'];
}
