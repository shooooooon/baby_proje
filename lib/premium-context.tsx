import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// プレミアムプランの型定義
export type PremiumPlan = 'free' | 'premium';

interface PremiumState {
  plan: PremiumPlan;
  isLoading: boolean;
  purchaseDate: string | null;
}

interface PremiumContextType extends PremiumState {
  upgradeToPremium: () => Promise<void>;
  restorePurchase: () => Promise<boolean>;
  isPremium: boolean;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PREMIUM_PLAN: 'premium_plan',
  PURCHASE_DATE: 'premium_purchase_date',
};

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PremiumState>({
    plan: 'free',
    isLoading: true,
    purchaseDate: null,
  });

  // 初期化時にプレミアム状態を読み込む
  useEffect(() => {
    loadPremiumStatus();
  }, []);

  const loadPremiumStatus = async () => {
    try {
      const [plan, purchaseDate] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PREMIUM_PLAN),
        AsyncStorage.getItem(STORAGE_KEYS.PURCHASE_DATE),
      ]);
      setState({
        plan: (plan as PremiumPlan) || 'free',
        purchaseDate: purchaseDate,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load premium status:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // プレミアムにアップグレード（デモ用：実際の課金処理はここに実装）
  const upgradeToPremium = async () => {
    try {
      const purchaseDate = new Date().toISOString();
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.PREMIUM_PLAN, 'premium'),
        AsyncStorage.setItem(STORAGE_KEYS.PURCHASE_DATE, purchaseDate),
      ]);
      setState({
        plan: 'premium',
        purchaseDate: purchaseDate,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to upgrade to premium:', error);
      throw error;
    }
  };

  // 購入の復元（デモ用）
  const restorePurchase = async (): Promise<boolean> => {
    try {
      const plan = await AsyncStorage.getItem(STORAGE_KEYS.PREMIUM_PLAN);
      if (plan === 'premium') {
        const purchaseDate = await AsyncStorage.getItem(STORAGE_KEYS.PURCHASE_DATE);
        setState({
          plan: 'premium',
          purchaseDate: purchaseDate,
          isLoading: false,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to restore purchase:', error);
      return false;
    }
  };

  const isPremium = state.plan === 'premium';

  return (
    <PremiumContext.Provider
      value={{
        ...state,
        upgradeToPremium,
        restorePurchase,
        isPremium,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
}
