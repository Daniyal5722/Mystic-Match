import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Home, Map as MapIcon, Settings as SettingsIcon, WifiOff, Play, LogOut } from 'lucide-react';
import { GameState, BoosterType, BoosterShopItem, DailyLoginReward, Mission } from './types';
import { INITIAL_LEVELS, DEFAULT_MISSIONS } from './data';
import { PlayerSetupOverlay } from './components/PlayerSetupOverlay';
import { PlayerProfileModal } from './components/PlayerProfileModal';
import { HomeView } from './components/HomeView';
import { MapView } from './components/MapView';
import { GameView } from './components/GameView';
import { SettingsView } from './components/SettingsView';
import { NotificationToast } from './components/NotificationToast';
import { ConfirmationModal } from './components/ConfirmationModal';
import { BoosterShopModal } from './components/BoosterShopModal';
import { DailyLoginModal } from './components/DailyLoginModal';
import { MissionsModal } from './components/MissionsModal';
import { RewardedAdModal } from './components/RewardedAdModal';

import { playSound } from './audio';

const LOCAL_STORAGE_KEY = 'mystic_match_data_v1';
const ACTIVE_LEVEL_STORAGE_KEY = 'mystic_match_active_level_v1';

export default function App() {
  // Global Game State
  const [gameState, setGameState] = useState<GameState>(() => {
    const defaultState: GameState = {
      name: '',
      coins: 500, // Generous starting balance so players can try the Emporium immediately
      diamonds: 20,
      gemsCount: 20,
      score: 0,
      level: 1,
      xp: 0,
      xpMax: 1000,
      wins: 0,
      losses: 0,
      gamesPlayed: 0,
      winStreak: 0,
      totalMatchesMade: 0,
      levelsWithoutBoosters: 0,
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
        hammer: 3,
        shuffle: 3,
        rainbow: 3,
        hint: 3,
        undo: 3,
      },
      missions: DEFAULT_MISSIONS,
      dailyLoginDay: 1,
      lastDailyLoginDate: null,
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
        const syncedDiamonds = parsed.diamonds ?? parsed.gemsCount ?? 20;
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
          missions: parsed.missions?.length ? parsed.missions : defaultState.missions,
          dailyLoginDay: parsed.dailyLoginDay || 1,
          lastDailyLoginDate: parsed.lastDailyLoginDate ?? null,
          winStreak: parsed.winStreak || 0,
          totalMatchesMade: parsed.totalMatchesMade || 0,
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

  // Modal States
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isDailyLoginOpen, setIsDailyLoginOpen] = useState(false);
  const [isMissionsOpen, setIsMissionsOpen] = useState(false);
  const [isRewardedAdOpen, setIsRewardedAdOpen] = useState(false);
  const [levelUpPopup, setLevelUpPopup] = useState<{ level: number } | null>(null);

  // Track if a level is currently active and in progress
  const [isLevelInProgress, setIsLevelInProgress] = useState<boolean>(false);
  const [pendingNavigation, setPendingNavigation] = useState<'home' | 'map' | 'settings' | 'profile' | null>(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState<boolean>(false);

  // Check if any modal is currently active to prevent background scrolling
  const isAnyModalOpen = isShopOpen || isDailyLoginOpen || isMissionsOpen || isProfileOpen || isRewardedAdOpen || isLeaveModalOpen || Boolean(levelUpPopup);

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
  const handleNavigation = (target: 'home' | 'map' | 'settings' | 'profile', force: boolean = false) => {
    triggerHapticFeedback();
    if (!force && gameState.activeTab === 'game' && isLevelInProgress) {
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

  // Strictly prevent any vertical/horizontal webpage scrolling or bounce during active gameplay
  useEffect(() => {
    if (gameState.activeTab === 'game') {
      const handleTouchMove = (e: TouchEvent) => {
        const target = e.target as HTMLElement | null;
        // Allow scrolling inside explicit scrollable dialogs/modals
        if (target && target.closest('.allow-scroll')) {
          return;
        }
        if (e.cancelable) {
          e.preventDefault();
        }
      };

      const originalOverflow = document.body.style.overflow;
      const originalOverscroll = document.body.style.overscrollBehavior;

      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';

      window.addEventListener('touchmove', handleTouchMove, { passive: false });

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.overscrollBehavior = originalOverscroll;
        window.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [gameState.activeTab]);

  // Economy: Booster Shop Purchase Handler
  const handleBuyBoosterItem = (item: BoosterShopItem) => {
    setGameState((prev) => {
      const nextCoins = prev.coins - (item.coinCost || 0);
      const nextDiamonds = prev.diamonds - (item.diamondCost || 0);
      const updatedBoosters = { ...prev.boostersCount };

      if (item.type === 'mega_bundle') {
        updatedBoosters.hammer += 2;
        updatedBoosters.shuffle += 2;
        updatedBoosters.hint += 2;
        updatedBoosters.undo += 2;
        updatedBoosters.rainbow += 2;
      } else {
        const bType = item.type as BoosterType;
        updatedBoosters[bType] = (updatedBoosters[bType] || 0) + item.quantity;
      }

      return {
        ...prev,
        coins: nextCoins,
        diamonds: nextDiamonds,
        gemsCount: nextDiamonds,
        boostersCount: updatedBoosters,
      };
    });
    triggerPushNotification('Emporium Purchase', `Acquired ${item.name}! Added to your inventory.`);
  };

  // Economy: Daily Login Claim Handler
  const handleClaimDailyLogin = (reward: DailyLoginReward) => {
    const today = new Date().toISOString().split('T')[0];
    setGameState((prev) => {
      const updatedBoosters = { ...prev.boostersCount };
      if (reward.boosters) {
        Object.entries(reward.boosters).forEach(([key, val]) => {
          const bKey = key as BoosterType;
          if (val) updatedBoosters[bKey] = (updatedBoosters[bKey] || 0) + val;
        });
      }

      // Update daily login mission
      const updatedMissions = (prev.missions || []).map((m) => {
        if (m.type === 'daily_login') {
          return { ...m, current: 1, progress: 1, completed: true } as any;
        }
        return m;
      });

      return {
        ...prev,
        coins: prev.coins + reward.coins,
        diamonds: prev.diamonds + (reward.diamonds || 0),
        gemsCount: prev.gemsCount + (reward.diamonds || 0),
        boostersCount: updatedBoosters,
        dailyLoginDay: (reward.day % 7) + 1,
        lastClaimedDaily: today,
        lastDailyLoginDate: today,
        missions: updatedMissions,
      };
    });
    triggerPushNotification('Daily Calendar Claimed!', `Received +${reward.coins} Coins!`);
  };

  // Economy: Missions / Bounties Claim Handler
  const handleClaimMission = (mission: Mission) => {
    setGameState((prev) => {
      const targetMission = prev.missions.find((m) => m.id === mission.id);
      if (!targetMission || !targetMission.completed || targetMission.claimed) return prev;

      const updatedBoosters = { ...prev.boostersCount };
      if (mission.rewardBooster) {
        const bType = mission.rewardBooster.type;
        updatedBoosters[bType] = (updatedBoosters[bType] || 0) + mission.rewardBooster.count;
      }

      const updatedMissions = prev.missions.map((m) => {
        if (m.id === mission.id) return { ...m, claimed: true };
        return m;
      });

      return {
        ...prev,
        coins: prev.coins + mission.rewardCoins,
        diamonds: prev.diamonds + (mission.rewardDiamonds || 0),
        gemsCount: prev.gemsCount + (mission.rewardDiamonds || 0),
        boostersCount: updatedBoosters,
        missions: updatedMissions,
      };
    });
    triggerPushNotification('Bounty Collected!', 'Reward deposited directly into your balance.');
  };

  // Economy: Rewarded Ad Simulation Grant
  const handleRewardedAdGrant = (boosterType: BoosterType) => {
    setGameState((prev) => {
      const updatedBoosters = { ...prev.boostersCount };
      updatedBoosters[boosterType] = (updatedBoosters[boosterType] || 0) + 1;
      return {
        ...prev,
        coins: prev.coins + 50,
        boostersCount: updatedBoosters,
      };
    });
    triggerPushNotification('Mystic Broadcast Reward', `+1 ${boosterType.toUpperCase()} booster & +50 coins claimed!`);
  };

  // Mission Tracking: Match made
  const handleMatchMade = (count: number) => {
    setGameState((prev) => {
      const nextTotal = (prev.totalMatchesMade || 0) + count;
      const updatedMissions = (prev.missions || []).map((m) => {
        if (m.type === 'match_gems') {
          const nextCur = Math.min(m.target, m.current + count);
          return { ...m, current: nextCur, completed: nextCur >= m.target };
        }
        return m;
      });

      return {
        ...prev,
        totalMatchesMade: nextTotal,
        missions: updatedMissions,
      };
    });
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
      coins: 500,
      diamonds: 20,
      gemsCount: 20,
      score: 0,
      level: 1,
      xp: 0,
      xpMax: 1000,
      wins: 0,
      losses: 0,
      gamesPlayed: 0,
      winStreak: 0,
      totalMatchesMade: 0,
      levelsWithoutBoosters: 0,
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
      difficultyMode: 'medium',
      highContrast: false,
      screenReaderEnabled: false,
      soundEnabled: true,
      hapticsEnabled: true,
      currentPlayingLevelId: 1,
      boostersCount: {
        hammer: 3,
        shuffle: 3,
        rainbow: 3,
        hint: 3,
        undo: 3,
      },
      missions: DEFAULT_MISSIONS,
      dailyLoginDay: 1,
      lastDailyLoginDate: null,
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
      className="fixed inset-0 w-full h-full h-[100dvh] font-body text-white bg-gradient-to-b from-[#101b44] via-[#0d163a] to-[#09102c] flex items-center justify-center p-0 md:p-4 overflow-hidden select-none"
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
              coins: 500,
              diamonds: 20,
              gemsCount: 20,
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

      {/* Booster Shop Modal */}
      {isShopOpen && (
        <BoosterShopModal
          isOpen={isShopOpen}
          onClose={() => setIsShopOpen(false)}
          gameState={gameState}
          onPurchase={handleBuyBoosterItem}
          triggerHaptic={triggerHapticFeedback}
        />
      )}

      {/* 7-Day Login Modal */}
      <DailyLoginModal
        isOpen={isDailyLoginOpen}
        onClose={() => setIsDailyLoginOpen(false)}
        gameState={gameState}
        onClaimDay={handleClaimDailyLogin}
        triggerHaptic={triggerHapticFeedback}
      />

      {/* Missions / Bounties Modal */}
      <MissionsModal
        isOpen={isMissionsOpen}
        onClose={() => setIsMissionsOpen(false)}
        gameState={gameState}
        onClaimMission={handleClaimMission}
        triggerHaptic={triggerHapticFeedback}
      />

      {/* Rewarded Ad Modal */}
      <RewardedAdModal
        isOpen={isRewardedAdOpen}
        onClose={() => setIsRewardedAdOpen(false)}
        onRewardGranted={handleRewardedAdGrant}
        triggerHaptic={triggerHapticFeedback}
      />

      {/* Level Up Celebration Modal */}
      <AnimatePresence>
        {levelUpPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none touch-manipulation"
            onClick={() => setLevelUpPopup(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="relative w-full max-w-sm bg-gradient-to-b from-[#1e2961] via-[#15204c] to-[#0d1333] border-2 border-amber-400 rounded-2xl p-6 text-center shadow-[0_0_50px_rgba(251,191,36,0.6)] animate-glow-flare"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Confetti burst elements */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-cyan-400 to-purple-500 rounded-full blur-xl opacity-60 animate-ping" />
              </div>

              <div className="text-4xl mb-2 animate-bounce">🎉</div>
              <h2 className="font-headline font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-cyan-300 uppercase tracking-wider mb-1">
                Level Up!
              </h2>
              <p className="text-violet-300 text-xs mb-4">
                You have crossed the XP threshold and advanced your arcane rank!
              </p>

              <div className="my-6 inline-flex items-center justify-center gap-3 bg-[#10193d] border-2 border-cyan-400/80 px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                <span className="text-xs uppercase text-cyan-300 font-bold">New Rank:</span>
                <span className="font-headline font-black text-2xl text-amber-300">LVL {levelUpPopup.level}</span>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback('win');
                    setLevelUpPopup(null);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#0c1333] font-headline font-black rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.5)] transition-all cursor-pointer active:scale-95"
                >
                  Continue Journey ⚡
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
      <div className="w-full h-[100dvh] md:[@media(min-height:600px)]:max-w-md md:[@media(min-height:600px)]:mx-auto md:[@media(min-height:600px)]:h-[94vh] md:[@media(min-height:600px)]:max-h-[890px] md:[@media(min-height:600px)]:rounded-3xl md:[@media(min-height:600px)]:border-2 border-0 border-indigo-500/50 relative flex flex-col overflow-hidden select-none shadow-[0_0_50px_rgba(59,130,246,0.3)]">
        {/* Responsive Header (Hidden during active gameplay to maximize board canvas and avoid duplicate headers) */}
        {gameState.activeTab !== 'game' && (
          <header className="shrink-0 w-full z-30 bg-[#111a44]/95 backdrop-blur-md border-b-2 border-indigo-500/40 pt-safe">
            <div className="h-14 sm:h-16 px-1.5 sm:px-3 flex items-center justify-between flex-nowrap gap-1">
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
                {/* Coins Counter (Clickable to open Shop) */}
                <button
                  type="button"
                  onClick={() => { triggerHapticFeedback('click'); setIsShopOpen(true); }}
                  className="flex items-center gap-1 bg-[#172559] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl border border-amber-400/50 font-headline font-black text-[10px] sm:text-xs text-amber-300 shadow-sm hover:border-amber-300 cursor-pointer"
                  title="Open Booster Emporium"
                >
                  <span>🪙</span>
                  <span>{gameState.coins.toLocaleString()}</span>
                  <span className="text-[9px] text-amber-400 font-bold ml-0.5">+</span>
                </button>

                {/* Diamonds Counter */}
                <div className="flex items-center gap-1 bg-[#172559] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl border border-cyan-400/50 font-headline font-black text-[10px] sm:text-xs text-cyan-300 shadow-sm">
                  <span>💎</span>
                  <span>{gameState.diamonds.toLocaleString()}</span>
                </div>

                {/* Profile Button */}
                <button
                  type="button"
                  onClick={() => handleNavigation('profile')}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white border border-cyan-300 flex items-center justify-center font-headline font-bold text-xs shadow-[0_0_12px_rgba(34,211,238,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                  title="Player Profile"
                >
                  <User size={14} />
                </button>
              </div>
            </div>
          </header>
        )}

        {/* Floating Offline connection state indicator */}
        {gameState.offline && gameState.activeTab !== 'game' && (
          <div className="mx-3 sm:mx-4 mt-2 bg-amber-950/70 border border-amber-400/50 rounded-xl p-2 flex items-center justify-between gap-2 shadow-md shrink-0">
            <span className="text-[10px] font-headline font-black text-amber-300 uppercase flex items-center gap-1 truncate">
              <WifiOff size={12} className="shrink-0" /> Offline Mode Active
            </span>
            <span className="text-[9px] font-bold text-amber-200 shrink-0">Saved Locally</span>
          </div>
        )}

        {/* Interactive Viewport (Strictly locked & fixed during gameplay, scrollable on Map/Home/Settings) */}
        <main
          className={`flex-1 min-h-0 w-full max-w-full relative flex flex-col select-none ${
            gameState.activeTab === 'game'
              ? 'p-0 overflow-hidden overscroll-none touch-none h-full justify-between'
              : gameState.activeTab === 'map'
              ? 'p-2 sm:p-3 overflow-hidden overscroll-none h-full justify-start'
              : isAnyModalOpen
              ? 'p-2.5 sm:p-4 overflow-hidden justify-start'
              : 'p-2.5 sm:p-4 overflow-y-auto overflow-x-hidden overscroll-contain justify-start'
          }`}
          style={{ width: '100%', maxWidth: '100%' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={gameState.activeTab}
              initial={{ opacity: 0, scale: 0.98, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -5 }}
              transition={{ duration: 0.15 }}
              className={`w-full max-w-full min-w-0 flex flex-col flex-1 ${
                gameState.activeTab === 'game'
                  ? 'h-full overflow-hidden touch-none'
                  : 'min-h-full'
              }`}
              style={{ width: '100%', maxWidth: '100%' }}
            >
              {gameState.activeTab === 'home' && (
                <HomeView
                  gameState={gameState}
                  setTab={setTab}
                  triggerHaptic={triggerHapticFeedback}
                  triggerPushNotification={triggerPushNotification}
                  onOpenProfile={() => setIsProfileOpen(true)}
                  onOpenShop={() => setIsShopOpen(true)}
                  onOpenDailyLogin={() => setIsDailyLoginOpen(true)}
                  onOpenMissions={() => setIsMissionsOpen(true)}
                  onOpenRewardedAd={() => setIsRewardedAdOpen(true)}
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
                  onOpenShop={() => setIsShopOpen(true)}
                  onMatchMade={handleMatchMade}
                  onUpdateBoosters={(newBoosters) => {
                    setGameState((prev) => ({
                      ...prev,
                      boostersCount: newBoosters,
                    }));
                  }}
                  onGameEnd={(won, matchScore, perfectRun) => {
                    setGameState((prev) => {
                      const newGamesPlayed = prev.gamesPlayed + 1;
                      const newWins = won ? prev.wins + 1 : prev.wins;
                      const newLosses = won ? prev.losses : prev.losses + 1;
                      const newWinStreak = won ? (prev.winStreak || 0) + 1 : 0;

                      const baseCoins = won ? 250 : 0;
                      const baseDiamonds = won ? 15 : 0;
                      const streakCoins = won && newWinStreak >= 3 ? 100 : 0;
                      const perfectCoins = won && perfectRun ? 150 : 0;

                      let newXp = prev.xp + (won ? 150 : 30);
                      let newLevel = prev.level;
                      let newXpMax = prev.xpMax;

                      while (newXp >= newXpMax) {
                        newXp -= newXpMax;
                        newLevel += 1;
                        newXpMax = Math.floor((newXpMax * 1.25) / 100) * 100;
                      }

                      if (newLevel > prev.level) {
                        setLevelUpPopup({ level: newLevel });
                        triggerPushNotification('Level Up!', `⭐ You reached Rank ${newLevel}! Amazing mastery!`);
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

                      // Update missions: clear_levels, perfect_level, reach_score
                      const updatedMissions = (prev.missions || []).map((m) => {
                        if (won && m.type === 'clear_levels') {
                          const p = Math.min(m.target, m.current + 1);
                          return { ...m, current: p, completed: p >= m.target };
                        }
                        if (won && perfectRun && m.type === 'perfect_level') {
                          const p = Math.min(m.target, m.current + 1);
                          return { ...m, current: p, completed: p >= m.target };
                        }
                        if (matchScore >= 5000 && m.type === 'reach_score') {
                          const p = Math.min(m.target, m.current + 1);
                          return { ...m, current: p, completed: p >= m.target };
                        }
                        return m;
                      });

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

                      const totalCoinsAdded = baseCoins + streakCoins + perfectCoins + bonusCoins;
                      const totalDiamondsAdded = baseDiamonds + bonusDiamonds;

                      return {
                        ...prev,
                        coins: prev.coins + totalCoinsAdded,
                        diamonds: prev.diamonds + totalDiamondsAdded,
                        gemsCount: prev.gemsCount + totalDiamondsAdded,
                        score: prev.score + matchScore,
                        wins: newWins,
                        losses: newLosses,
                        gamesPlayed: newGamesPlayed,
                        winStreak: newWinStreak,
                        xp: newXp,
                        xpMax: newXpMax,
                        level: newLevel,
                        levels: updatedLevels,
                        missions: updatedMissions,
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
                  triggerSync={() => {
                    triggerHapticFeedback();
                    triggerPushNotification('Data Synced', 'All player data successfully synchronized.');
                  }}
                  resetGameProgress={resetGameProgress}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Universal Sticky Bottom Navigation Bar (Hidden during active gameplay to maximize puzzle canvas and eliminate overlaps) */}
        {gameState.activeTab !== 'game' && (
          <nav className="shrink-0 w-full z-30 bg-[#111a44]/95 backdrop-blur-md border-t-2 border-indigo-500/40 pb-safe">
            <div className="flex items-center justify-between w-full gap-2 sm:gap-4 h-14 sm:h-16 px-2 sm:px-4">
              {/* Tab: Home */}
              <button
                id="home-tab"
                type="button"
                onClick={() => handleNavigation('home')}
                className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 sm:gap-1 min-h-12 h-12 rounded-xl transition-all cursor-pointer ${
                  gameState.activeTab === 'home'
                    ? 'bg-gradient-to-b from-[#223577] to-[#172559] text-amber-300 font-black border-2 border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.3)] -translate-y-0.5'
                    : 'text-violet-300/80 hover:text-cyan-300 hover:bg-[#162354]/50'
                }`}
              >
                <Home size={18} />
                <span className="text-[8.5px] sm:text-[9.5px] uppercase font-headline font-bold tracking-wider leading-none">Home</span>
              </button>

              {/* Tab: Map (Primary Gateway to all levels) */}
              <button
                id="map-tab"
                type="button"
                onClick={() => handleNavigation('map')}
                className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 sm:gap-1 min-h-12 h-12 rounded-xl transition-all cursor-pointer ${
                  gameState.activeTab === 'map'
                    ? 'bg-gradient-to-b from-[#223577] to-[#172559] text-amber-300 font-black border-2 border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.3)] -translate-y-0.5'
                    : 'text-violet-300/80 hover:text-cyan-300 hover:bg-[#162354]/50'
                }`}
              >
                <MapIcon size={18} />
                <span className="text-[8.5px] sm:text-[9.5px] uppercase font-headline font-bold tracking-wider leading-none">Stages</span>
              </button>

              {/* Tab: Settings (Config) */}
              <button
                id="settings-tab"
                type="button"
                onClick={() => handleNavigation('settings')}
                className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 sm:gap-1 min-h-12 h-12 rounded-xl transition-all cursor-pointer ${
                  gameState.activeTab === 'settings'
                    ? 'bg-gradient-to-b from-[#223577] to-[#172559] text-amber-300 font-black border-2 border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.3)] -translate-y-0.5'
                    : 'text-violet-300/80 hover:text-cyan-300 hover:bg-[#162354]/50'
                }`}
              >
                <SettingsIcon size={18} />
                <span className="text-[8.5px] sm:text-[9.5px] uppercase font-headline font-bold tracking-wider leading-none">Config</span>
              </button>
            </div>
          </nav>
        )}

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
