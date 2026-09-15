export interface Level {
  id: number;
  name: string;
  stars: number; // 0 for locked / not played yet
  isLocked: boolean;
  isBoss: boolean;
  recommendedPower: number;
  loot: string;
  objectiveTarget?: number;
  objectiveType?: GemType;
}

export interface GameNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  icon: string;
  rewardType: 'coins' | 'diamonds';
  rewardValue: number;
}

export type DifficultyMode = 'easy' | 'medium' | 'hard' | 'extreme';

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
  easyMode: boolean;
  difficultyMode?: DifficultyMode;
  highContrast: boolean;
  screenReaderEnabled: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  currentPlayingLevelId: number | null;
  boostersCount: {
    hammer: number;
    shuffle: number;
    rainbow: number;
    hint: number;
    undo: number;
  };
  achievements: Achievement[];
  lastClaimedDaily: string | null; // Date format: YYYY-MM-DD
  activeLevelSession?: ActiveLevelSession | null;
}

export interface ActiveLevelSession {
  levelId: number;
  difficultyMode: DifficultyMode;
  board: BoardGem[][];
  score: number;
  movesLeft: number;
  gemsCollected: number;
  elapsedSeconds: number;
  objectiveTarget: number;
  objectiveType: GemType;
  selectedGemId?: string | null;
  savedAt: number;
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
