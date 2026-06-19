// types.ts

export type AppState = 'UPLOAD' | 'SWIPE' | 'COMPLETE';

export type Category = 'PERSONAL' | 'TOOL' | 'SKIP';

// Represent raw data items to be kept completely untouched
export type RawChatData = any;

// Display data for UI
export type ChatDisplayData = {
  id: string; // Used internally as a unique identifier for React keys
  originalIndex: number; // Pointer back to the original full array element
  title: string;
  dateStr: string;
  firstQuery: string;
  fullConversation: { role: string; text: string }[];
};

export type SwipeAction = {
  chatId: string;
  category: Category;
  originalIndex: number;
};
