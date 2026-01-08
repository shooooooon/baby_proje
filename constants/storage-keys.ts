/**
 * AsyncStorageで使用するキーの一元管理
 */
export const STORAGE_KEYS = {
  // アプリ設定
  LANGUAGE: "app_language",
  PARENT: "app_parent",
  BABY_NAME: "app_baby_name",
  
  // プレミアム機能
  PREMIUM_PLAN: "premium_plan",
  PURCHASE_DATE: "premium_purchase_date",
  
  // チャット機能
  CHAT_MESSAGES: "chat_messages_today",
  CHAT_DATE: "chat_date",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
