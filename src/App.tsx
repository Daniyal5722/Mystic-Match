import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Home, Map as MapIcon, Settings as SettingsIcon, WifiOff, Play, LogOut } from 'lucide-react';
import { GameState, Level } from './types';
import { INITIAL_LEVELS } from './data';
import { PlayerSetupOverlay } from './components/PlayerSetupOverlay';
import { OnboardingOverlay } from './components/OnboardingOverlay';
import { PlayerProfileModal } from './components/PlayerProfileModal';
import { HomeView } from './components/HomeView';
import { MapView } from './components/MapView';
import { GameView } from './components/GameView';
import { SettingsView } from './components/SettingsView';
import { NotificationToast } from './components/NotificationToast';
import { ConfirmationModal } from './components/ConfirmationModal';

import { playSound } from './audio';

const LOCAL_STORAGE_KEY = 'mystic_match_data_v1';
const ACTIVE_LEVEL_STORAGE_KEY = 'mystic_match_active_level_v1';

export default function App() {
  // Global Game State
  const [gameState, setGameState] = useState<GameState>(() => {
    const defaultState: GameState = {
      name: '',
      coins: 0,
      diamonds: 0,
      gemsCount: 0,
      score: 0,
      level: 1, // Start at level 1 instead of 0 for correct progression
      xp: 0,
      xpMax: 1000,
      wins: 0,
      losses: 0,
      gamesPlayed: 0,
      activeTab: 'home',
      levels: INITIAL_LEVELS.map((lvl) => ({
        ...lvl,
        stars: 0,
        isLocked: lvl.id !== 1, // Unlock stage 1 only
      })),
      notifications: [],
      notificationsEnabled: true,
      offline: false,
      syncPending: false,
      onboardingCompleted: true,
      darkMode: false,
      easyMode: false,
      difficultyMode: 'medium',
      highContrast: false,
      screenReaderEnabled: false,
      soundEnabled: true,
      hapticsEnabled: true,
      currentPlayingLevelId: 1,
      boostersCount: {
        hammer: 15,
        shuffle: 15,
        rainbow: 15,
        hint: 15,
        undo: 15,
      },
      achievements: [
        { id: 'first_match', title: 'First Match', description: 'Make your first crystal match!', isUnlocked: false, icon: '✨', rewardType: 'coins', rewardValue: 100 },
        { id: 'first_win', title: 'First Victory', description: 'Successfully clear your first puzzle stage!', isUnlocked: false, icon: '🏆', rewardType: 'diamonds', rewardValue: 10 },
        { id: 'combo_master', title: 'Combo Master', description: 'Form a Combo x4 or higher!', isUnlocked: false, icon: '💥', rewardType: 'coins', rewardValue: 250 },
        { id: 'perfect_score', title: 'High Scorer', description: 'Reach 5,000 points in a single level!', isUnlocked: false, icon: '👑', rewardType: 'diamonds', rewardValue: 20 },
        { id: 'level_10', title: 'Saga Initiate', description: 'Reach Player Level 10!', isUnlocked: false, icon: '🔮', rewardType: 'coins', rewardValue: 500 },
        { id: 'booster_expert', title: 'Booster Expert', description: 'Use a power booster in a game!', isUnlocked: false, icon: '⚡', rewardType: 'coins', rewardValue: 150 }
      ],
      lastClaimedDaily: null,
    };

    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        const syncedDiamonds = parsed.diamonds ?? parsed.gemsCount ?? 0;
        const resolvedDifficulty = parsed.difficultyMode || (parsed.easyMode ? 'easy' : 'medium');
        return {
          ...defaultState,
          ...parsed,
          difficultyMode: resolvedDifficulty,
          easyMode: resolvedDifficulty === 'easy',
          boostersCount: {
            ...defaultState.boostersCount,
            ...(parsed.boostersCount || {}),
          },
          achievements: parsed.achievements?.length ? parsed.achievements : defaultState.achievements,
          lastClaimedDaily: parsed.lastClaimedDaily ?? null,
          diamonds: syncedDiamonds,
          gemsCount: syncedDiamonds,
        };
      }
    } catch (e) {
      console.error('Failed to load cached local storage profile:', e);
    }
    return defaultState;
  });

  // Player Profile Modal state
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Push Notification Toast
  const [activeNotification, setActiveNotification] = useState<{ title: string; message: string } | null>(null);

  // Screen Reader log transcription
  const [screenReaderText, setScreenReaderText] = useState<string>('Welcome to Mystic Match!');

  // Haptic feedback & Web Audio click
  const triggerHapticFeedback = (type: 'swap' | 'match' | 'win' | 'lose' | 'click' | 'booster' = 'click') => {
    if (gameState.hapticsEnabled && 'vibrate' in navigator) {
      try {
        navigator.vibrate(type === 'win' ? [50, 50, 50] : 15);
      } catch (err) {
        // Safe catch for environment compatibility
      }
    }

    playSound(type, gameState.soundEnabled);
  };

  // Push notification controller
  const triggerPushNotification = (title: string, message: string) => {
    if (!gameState.notificationsEnabled) return;

    triggerHapticFeedback();
    setActiveNotification({ title, message });
    speakAccessibility(`Notification: ${title}. ${message}`);
  };

  // Screen reader synthesizer utility
  const speakAccessibility = (text: string) => {
    setScreenReaderText(text);
    if (gameState.screenReaderEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Track if a level is currently active and in progress
  const [isLevelInProgress, setIsLevelInProgress] = useState<boolean>(false);
  const [pendingNavigation, setPendingNavigation] = useState<'home' | 'map' | 'settings' | 'profile' | null>(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState<boolean>(false);

  // Sync state to local storage on any modifications
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(gameState));
    } catch (e) {
      console.error('Failed to save state to local storage:', e);
    }
  }, [gameState]);

  // Handle Tab changes with screen reader readouts
  const setTab = (tab: 'home' | 'map' | 'game' | 'settings') => {
    triggerHapticFeedback();
    setGameState((prev) => ({ ...prev, activeTab: tab }));

    const descriptions = {
      home: 'Switched to Home. View player profile, live events, and daily quests.',
      map: 'Switched to Realm Map. Journey across archipelago stages.',
      game: 'Switched to Puzzle Arena. Match crystals and clear combos.',
      settings: 'Switched to Settings and Configuration.',
    };
    speakAccessibility(descriptions[tab]);
  };

  // Intercept destructive navigation while playing a level
  const handleNavigation = (target: 'home' | 'map' | 'settings' | 'profile') => {
    triggerHapticFeedback();
    if (gameState.activeTab === 'game' && isLevelInProgress) {
      setPendingNavigation(target);
      setIsLeaveModalOpen(true);
      return;
    }
    if (target === 'profile') {
      setIsProfileOpen(true);
    } else {
      setTab(target);
    }
  };

  const handleConfirmLeaveGame = () => {
    triggerHapticFeedback();
    setIsLeaveModalOpen(false);
    setIsLevelInProgress(false);
    if (pendingNavigation === 'profile') {
      setIsProfileOpen(true);
    } else if (pendingNavigation) {
      setTab(pendingNavigation);
    }
    setPendingNavigation(null);
  };

  const handleCancelLeaveGame = () => {
    triggerHapticFeedback();
    setIsLeaveModalOpen(false);
    setPendingNavigation(null);
  };

  // Intercept Android / browser back button when inside an active game
  useEffect(() => {
    if (gameState.activeTab === 'game' && isLevelInProgress) {
      window.history.pushState({ inGame: true }, '');

      const handlePopState = () => {
        window.history.pushState({ inGame: true }, '');
        setPendingNavigation('map');
        setIsLeaveModalOpen(true);
      };

      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [gameState.activeTab, isLevelInProgress]);

  // Trigger Simulated Automatic offline progress synchronization
  const triggerAutomaticSync = () => {
    if (gameState.offline) return;

    triggerHapticFeedback();
    triggerPushNotification(
      'Synchronization Complete',
      'Local player records and stage stars are synchronized.'
    );

    setGameState((prev) => ({
      ...prev,
      syncPending: false,
    }));
  };

  // Reset progress logic
  const resetGameProgress = () => {
    triggerHapticFeedback();
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    try {
      localStorage.removeItem(ACTIVE_LEVEL_STORAGE_KEY);
    } catch (e) {
      // safe fallback
    }
    setIsLevelInProgress(false);
    setGameState({
      name: '',
      coins: 0,
      diamonds: 0,
      gemsCount: 0,
      score: 0,
      level: 1,
      xp: 0,
      xpMax: 1000,
      wins: 0,
      losses: 0,
      gamesPlayed: 0,
      activeTab: 'home',
      levels: INITIAL_LEVELS.map((lvl) => ({
        ...lvl,
        stars: 0,
        isLocked: lvl.id !== 1,
      })),
      notifications: [],
      notificationsEnabled: true,
      offline: false,
      syncPending: false,
      onboardingCompleted: true,
      darkMode: false,
      easyMode: false,
      highContrast: false,
      screenReaderEnabled: false,
      soundEnabled: true,
      hapticsEnabled: true,
      currentPlayingLevelId: 1,
      boostersCount: {
        hammer: 15,
        shuffle: 15,
        rainbow: 15,
        hint: 15,
        undo: 15,
      },
      achievements: [
        { id: 'first_match', title: 'First Match', description: 'Make your first crystal match!', isUnlocked: false, icon: '✨', rewardType: 'coins', rewardValue: 100 },
        { id: 'first_win', title: 'First Victory', description: 'Successfully clear your first puzzle stage!', isUnlocked: false, icon: '🏆', rewardType: 'diamonds', rewardValue: 10 },
        { id: 'combo_master', title: 'Combo Master', description: 'Form a Combo x4 or higher!', isUnlocked: false, icon: '💥', rewardType: 'coins', rewardValue: 250 },
        { id: 'perfect_score', title: 'High Scorer', description: 'Reach 5,000 points in a single level!', isUnlocked: false, icon: '👑', rewardType: 'diamonds', rewardValue: 20 },
        { id: 'level_10', title: 'Saga Initiate', description: 'Reach Player Level 10!', isUnlocked: false, icon: '🔮', rewardType: 'coins', rewardValue: 500 },
        { id: 'booster_expert', title: 'Booster Expert', description: 'Use a power booster in a game!', isUnlocked: false, icon: '⚡', rewardType: 'coins', rewardValue: 150 }
      ],
      lastClaimedDaily: null,
    });
    triggerPushNotification('Progress Reset', 'Your career records have been reset.');
  };

  return (
    <div
      id="main-viewport-container"
      className="min-h-screen font-body text-white bg-gradient-to-b from-[#101b44] via-[#0d163a] to-[#09102c] flex items-center justify-center p-0 md:p-4 relative overflow-hidden"
    >
      {/* Dynamic atmospheric celestial glow effects */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

      {/* New Player Account Setup Overlay */}
      {!gameState.name && (
        <PlayerSetupOverlay
          onContinue={(playerName) => {
            triggerHapticFeedback();
            setGameState((prev) => ({
              ...prev,
              name: playerName,
              coins: 0,
              diamonds: 0,
              gemsCount: 0,
              score: 0,
              level: 1,
              xp: 0,
              xpMax: 1000,
              wins: 0,
              losses: 0,
              gamesPlayed: 0,
              onboardingCompleted: true,
              levels: INITIAL_LEVELS.map((lvl) => ({
                ...lvl,
                stars: 0,
                isLocked: lvl.id !== 1,
              })),
            }));
            triggerPushNotification('Profile Created!', `Welcome, ${playerName}! Your matching saga begins.`);
          }}
          triggerHaptic={triggerHapticFeedback}
        />
      )}

      {/* Player Career Profile Modal */}
      <PlayerProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        gameState={gameState}
        onUpdateName={(newName) => {
          setGameState((prev) => ({ ...prev, name: newName }));
          triggerPushNotification('Name Updated', `Profile name updated to: ${newName}`);
        }}
        triggerHaptic={triggerHapticFeedback}
      />

      {/* Push Notification slide down */}
      <AnimatePresence>
        {activeNotification && (
          <NotificationToast
            title={activeNotification.title}
            message={activeNotification.message}
            onClose={() => setActiveNotification(null)}
          />
        )}
      </AnimatePresence>

      {/* Primary Mobile-first Responsive Container */}
      <div className="w-full max-w-md mx-auto h-[100dvh] md:h-[94vh] md:max-h-[890px] bg-gradient-to-b from-[#111c47] via-[#131f4e] to-[#0e163b] border-x md:border-2 border-indigo-500/50 relative flex flex-col overflow-hidden select-none shadow-[0_0_50px_rgba(59,130,246,0.3)] md:rounded-3xl">
        {/* Responsive Header (Natural flex child, centered and contained) */}
        <header className="shrink-0 w-full z-30 bg-[#111a44]/95 backdrop-blur-md border-b-2 border-indigo-500/40 pt-safe">
          <div className="h-14 sm:h-16 px-2.5 sm:px-4 flex items-center justify-between gap-1">
            <div
              onClick={() => handleNavigation('home')}
              className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group min-w-0"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm sm:text-lg shadow-[0_0_12px_rgba(34,211,238,0.5)] border border-cyan-300 shrink-0">
                🔮
              </div>
              <span className="font-headline font-black uppercase tracking-wider text-xs sm:text-sm text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-cyan-300 group-hover:brightness-110 transition-all truncate">
                Mystic Match
              </span>
            </div>

            {/* Top stats badges & Profile button */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Coins Counter */}
              <div className="flex items-center gap-1 bg-[#172559] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl border border-amber-400/50 font-headline font-black text-[10px] sm:text-xs text-amber-300 shadow-sm">
                <span>🪙</span>
                <span>{gameState.coins.toLocaleString()}</span>
              </div>

              {/* Diamonds Counter */}
              <div className="flex items-center gap-1 bg-[#172559] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl border border-cyan-400/50 font-headline font-black text-[10px] sm:text-xs text-cyan-300 shadow-sm">
                <span>💎</span>
                <span>{gameState.diamonds.toLocaleString()}</span>
              </div>

              {/* Profile Button */}
              <button
                onClick={() => handleNavigation('profile')}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white border border-cyan-300 flex items-center justify-center font-headline font-bold text-xs shadow-[0_0_12px_rgba(34,211,238,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                title="Player Profile"
              >
                <User size={14} />
              </button>
            </div>
          </div>
        </header>

        {/* Floating Offline connection state indicator */}
        {gameState.offline && (
          <div className="mx-3 sm:mx-4 mt-2 bg-amber-950/70 border border-amber-400/50 rounded-xl p-2 flex items-center justify-between gap-2 shadow-md shrink-0">
            <span className="text-[10px] font-headline font-black text-amber-300 uppercase flex items-center gap-1 truncate">
              <WifiOff size={12} className="shrink-0" /> Offline Mode Active
            </span>
            <span className="text-[9px] font-bold text-amber-200 shrink-0">Saved Locally</span>
          </div>
        )}

        {/* Interactive Scrollable Active Tab Viewport */}
        <main className="flex-1 min-h-0 w-full p-2.5 sm:p-4 overflow-y-auto overflow-x-hidden relative flex flex-col justify-start">
          <AnimatePresence mode="wait">
            <motion.div
              key={gameState.activeTab}
              initial={{ opacity: 0, scale: 0.98, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -5 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full"
            >
              {gameState.activeTab === 'home' && (
                <HomeView
                  gameState={gameState}
                  setTab={setTab}
                  triggerHaptic={triggerHapticFeedback}
                  triggerPushNotification={triggerPushNotification}
                  onOpenProfile={() => setIsProfileOpen(true)}
                  onClaimDailyReward={() => {
                    const today = new Date().toISOString().split('T')[0];
                    if (gameState.lastClaimedDaily === today) {
                      triggerPushNotification('Already Claimed', 'You have already claimed today\'s Mystic Treasure chest!');
                      return;
                    }
                    triggerHapticFeedback();
                    setGameState((prev) => ({
                      ...prev,
                      coins: prev.coins + 500,
                      diamonds: prev.diamonds + 10,
                      gemsCount: prev.gemsCount + 10,
                      lastClaimedDaily: today,
                    }));
                    triggerPushNotification('Treasure Claimed!', '🪙 +500 Coins and 💎 +10 Diamonds added to your magical stash.');
                  }}
                />
              )}
              {gameState.activeTab === 'map' && (
                <MapView
                  levels={gameState.levels}
                  gameState={gameState}
                  setTab={setTab}
                  setSelectedLevelId={(id) => setGameState((p) => ({ ...p, currentPlayingLevelId: id }))}
                  triggerHaptic={triggerHapticFeedback}
                  triggerPushNotification={triggerPushNotification}
                />
              )}
              {gameState.activeTab === 'game' && (
                <GameView
                  gameState={gameState}
                  setTab={setTab}
                  triggerHaptic={triggerHapticFeedback}
                  triggerPushNotification={triggerPushNotification}
                  onSetLevelInProgress={setIsLevelInProgress}
                  onUpdateBoosters={(newBoosters) => {
                    setGameState((prev) => ({
                      ...prev,
                      boostersCount: newBoosters,
                    }));
                  }}
                  onGameEnd={(won, matchScore) => {
                    setGameState((prev) => {
                      const newGamesPlayed = prev.gamesPlayed + 1;
                      const newWins = won ? prev.wins + 1 : prev.wins;
                      const newLosses = won ? prev.losses : prev.losses + 1;

                      const addedCoins = won ? 250 : 0;
                      const addedDiamonds = won ? 15 : 0;

                      let newXp = prev.xp + (won ? 150 : 30);
                      let newLevel = prev.level;
                      let newXpMax = prev.xpMax;

                      while (newXp >= newXpMax) {
                        newXp -= newXpMax;
                        newLevel += 1;
                        newXpMax = Math.floor((newXpMax * 1.25) / 100) * 100;
                      }

                      let updatedLevels = [...prev.levels];
                      if (won && prev.currentPlayingLevelId) {
                        updatedLevels = prev.levels.map((lvl) => {
                          if (lvl.id === prev.currentPlayingLevelId) {
                            return { ...lvl, stars: Math.max(lvl.stars, 3) };
                          }
                          if (prev.currentPlayingLevelId < prev.levels.length && lvl.id === prev.currentPlayingLevelId + 1) {
                            return { ...lvl, isLocked: false };
                          }
                          return lvl;
                        });
                      }

                      // Dynamic achievements checking and rewards unlocking
                      let currentAchievements = [...prev.achievements];
                      let bonusCoins = 0;
                      let bonusDiamonds = 0;

                      if (won) {
                        const firstWinAch = currentAchievements.find(a => a.id === 'first_win');
                        if (firstWinAch && !firstWinAch.isUnlocked) {
                          currentAchievements = currentAchievements.map(a => a.id === 'first_win' ? { ...a, isUnlocked: true, unlockedAt: new Date().toISOString() } : a);
                          bonusDiamonds += firstWinAch.rewardValue;
                          triggerPushNotification('Achievement Unlocked!', `🏆 ${firstWinAch.title}: ${firstWinAch.description}`);
                        }
                      }

                      if (matchScore >= 5000) {
                        const scoreAch = currentAchievements.find(a => a.id === 'perfect_score');
                        if (scoreAch && !scoreAch.isUnlocked) {
                          currentAchievements = currentAchievements.map(a => a.id === 'perfect_score' ? { ...a, isUnlocked: true, unlockedAt: new Date().toISOString() } : a);
                          bonusDiamonds += scoreAch.rewardValue;
                          triggerPushNotification('Achievement Unlocked!', `🏆 ${scoreAch.title}: ${scoreAch.description}`);
                        }
                      }

                      if (newLevel >= 10) {
                        const levelAch = currentAchievements.find(a => a.id === 'level_10');
                        if (levelAch && !levelAch.isUnlocked) {
                          currentAchievements = currentAchievements.map(a => a.id === 'level_10' ? { ...a, isUnlocked: true, unlockedAt: new Date().toISOString() } : a);
                          bonusCoins += levelAch.rewardValue;
                          triggerPushNotification('Achievement Unlocked!', `🏆 ${levelAch.title}: ${levelAch.description}`);
                        }
                      }

                      return {
                        ...prev,
                        coins: prev.coins + addedCoins + bonusCoins,
                        diamonds: prev.diamonds + addedDiamonds + bonusDiamonds,
                        gemsCount: prev.gemsCount + addedDiamonds + bonusDiamonds,
                        score: prev.score + matchScore,
                        wins: newWins,
                        losses: newLosses,
                        gamesPlayed: newGamesPlayed,
                        xp: newXp,
                        xpMax: newXpMax,
                        level: newLevel,
                        levels: updatedLevels,
                        achievements: currentAchievements,
                      };
                    });
                  }}
                />
              )}
              {gameState.activeTab === 'settings' && (
                <SettingsView
                  gameState={gameState}
                  setGameState={setGameState}
                  triggerHaptic={triggerHapticFeedback}
                  triggerPushNotification={triggerPushNotification}
                  triggerSync={triggerAutomaticSync}
                  resetGameProgress={resetGameProgress}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Universal Sticky Bottom Navigation Bar (4-slot Grid: HOME, MAP, PLAY, CONFIG) */}
        <nav className="shrink-0 w-full z-30 bg-[#111a44]/95 backdrop-blur-md border-t-2 border-indigo-500/40 pb-safe">
          <div className="grid grid-cols-4 items-center h-14 sm:h-16 px-1.5 sm:px-2">
            {/* Tab: Home */}
            <button
              id="home-tab"
              type="button"
              onClick={() => handleNavigation('home')}
              className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 h-11 sm:h-12 rounded-xl transition-all cursor-pointer ${
                gameState.activeTab === 'home'
                  ? 'bg-gradient-to-b from-[#223577] to-[#172559] text-amber-300 font-black border-2 border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.3)] -translate-y-0.5'
                  : 'text-violet-300/80 hover:text-cyan-300 hover:bg-[#162354]/50'
              }`}
            >
              <Home size={17} />
              <span className="text-[8px] sm:text-[9px] uppercase font-headline font-bold tracking-wider leading-none">Home</span>
            </button>

            {/* Tab: Map */}
            <button
              id="map-tab"
              type="button"
              onClick={() => handleNavigation('map')}
              className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 h-11 sm:h-12 rounded-xl transition-all cursor-pointer ${
                gameState.activeTab === 'map'
                  ? 'bg-gradient-to-b from-[#223577] to-[#172559] text-amber-300 font-black border-2 border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.3)] -translate-y-0.5'
                  : 'text-violet-300/80 hover:text-cyan-300 hover:bg-[#162354]/50'
              }`}
            >
              <MapIcon size={17} />
              <span className="text-[8px] sm:text-[9px] uppercase font-headline font-bold tracking-wider leading-none">Map</span>
            </button>

            {/* Tab: Puzzle Grid (Play) */}
            <button
              id="game-board"
              type="button"
              onClick={() => {
                if (gameState.activeTab !== 'game') {
                  setTab('game');
                }
              }}
              className={`flex flex-col p-1.5 min-w-[56px] items-center justify-center gap-0.5 sm:gap-1 h-11 sm:h-12 rounded-xl transition-all cursor-pointer ${
                gameState.activeTab === 'game'
                  ? 'bg-gradient-to-b from-[#223577] to-[#172559] text-amber-300 font-black border-2 border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.3)] -translate-y-0.5'
                  : 'text-violet-300/80 hover:text-cyan-300 hover:bg-[#162354]/50 hover:scale-105 active:scale-95 animate-glow-pulse'
              }`}
            >
              <Play size={17} className="fill-current" />
              <span className="text-[8px] sm:text-[9px] uppercase font-headline font-bold tracking-wider leading-none">Play</span>
            </button>

            {/* Tab: Settings (Config) */}
            <button
              id="settings-tab"
              type="button"
              onClick={() => handleNavigation('settings')}
              className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 h-11 sm:h-12 rounded-xl transition-all cursor-pointer ${
                gameState.activeTab === 'settings'
                  ? 'bg-gradient-to-b from-[#223577] to-[#172559] text-amber-300 font-black border-2 border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.3)] -translate-y-0.5'
                  : 'text-violet-300/80 hover:text-cyan-300 hover:bg-[#162354]/50'
              }`}
            >
              <SettingsIcon size={17} />
              <span className="text-[8px] sm:text-[9px] uppercase font-headline font-bold tracking-wider leading-none">Config</span>
            </button>
          </div>
        </nav>

        {/* Global Navigation Guard Confirmation Modal */}
        <ConfirmationModal
          isOpen={isLeaveModalOpen}
          title="Leave Game?"
          message="Your current level is still in progress. Do you want to leave the game?"
          confirmLabel="Quit Game"
          cancelLabel="Continue Playing"
          onConfirm={handleConfirmLeaveGame}
          onCancel={handleCancelLeaveGame}
          isDestructive={true}
          icon={<LogOut className="text-rose-400" size={24} />}
        />
      </div>
    </div>
  );
}
