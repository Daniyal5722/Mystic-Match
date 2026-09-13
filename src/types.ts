export interface Level {
  id: number;
  name: string;
  stars: number; // 0 for locked / not played yet
  isLocked: boolean;
  isBoss: boolean;
  recommendedPower: number;
  loot: string;
}

export interface GameNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface GameState {
  name: string;
  coins: number;
  diamonds: number;
  gemsCount: number; // For compatibility
  score: number;
  level: number;
  xp: number;
  xpMax: number;
  wins: number;
  losses: number;
  gamesPlayed: number;
  activeTab: 'home' | 'map' | 'game' | 'settings';
  levels: Level[];
  notifications: GameNotification[];
  notificationsEnabled: boolean;
  offline: boolean;
  syncPending: boolean;
  onboardingCompleted: boolean;
  darkMode: boolean;
  highContrast: boolean;
  screenReaderEnabled: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  currentPlayingLevelId: number | null;
}

export type GemType = 'ruby' | 'sapphire' | 'emerald' | 'topaz' | 'amethyst' | 'prism';

export interface BoardGem {
  id: string;
  type: GemType;
  row: number;
  col: number;
  isMatched: boolean;
  isNew: boolean;
}
