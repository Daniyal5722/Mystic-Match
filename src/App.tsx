import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Gem, User, Home, Map as MapIcon, Settings as SettingsIcon, Wifi, WifiOff, Volume2, Sparkles } from 'lucide-react';
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

const LOCAL_STORAGE_KEY = 'mystic_match_data_v1';

export default function App() {
  // Global Game State
  const [gameState, setGameState] = useState<GameState>(() => {
    const defaultState: GameState = {
      name: '',
      coins: 0,
      diamonds: 0,
      gemsCount: 0,
      score: 0,
      level: 0,
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
      highContrast: false,
      screenReaderEnabled: false,
      soundEnabled: true,
      hapticsEnabled: true,
      currentPlayingLevelId: 1,
    };

    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Ensure diamonds and gemsCount stay in sync
        const syncedDiamonds = parsed.diamonds ?? parsed.gemsCount ?? 0;
        return {
          ...defaultState,
          ...parsed,
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
  const triggerHapticFeedback = () => {
    if (gameState.hapticsEnabled && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch (err) {
        // Safe catch for environment compatibility
      }
    }

    if (gameState.soundEnabled) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.1);

          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 0.12);
        }
      } catch (err) {
        // Safe catch
      }
    }
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
    setGameState({
      name: '',
      coins: 0,
      diamonds: 0,
      gemsCount: 0,
      score: 0,
      level: 0,
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
      highContrast: false,
      screenReaderEnabled: false,
      soundEnabled: true,
      hapticsEnabled: true,
      currentPlayingLevelId: 1,
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
              level: 0,
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
      <div className="w-full max-w-md mx-auto min-h-screen md:min-h-0 md:h-[94vh] md:max-h-[890px] bg-gradient-to-b from-[#111c47] via-[#131f4e] to-[#0e163b] border-x md:border-2 border-indigo-500/50 relative flex flex-col justify-between overflow-hidden pt-16 pb-19 select-none shadow-[0_0_50px_rgba(59,130,246,0.3)] md:rounded-3xl">
        {/* Fixed Header */}
        <header className="fixed top-0 max-w-md w-full z-40 bg-[#111a44]/95 backdrop-blur-md border-b-2 border-indigo-500/40 pt-safe">
          <div className="h-16 px-4 flex items-center justify-between">
            <div
              onClick={() => setTab('home')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg shadow-[0_0_12px_rgba(34,211,238,0.5)] border border-cyan-300">
                🔮
              </div>
              <span className="font-headline font-black uppercase tracking-wider text-sm text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-cyan-300 group-hover:brightness-110 transition-all">
                Mystic Match
              </span>
            </div>

            {/* Top stats badges & Profile button */}
            <div className="flex items-center gap-2">
              {/* Coins Counter */}
              <div className="flex items-center gap-1.5 bg-[#172559] px-2.5 py-1 rounded-xl border border-amber-400/50 font-headline font-black text-xs text-amber-300 shadow-sm">
                <span>🪙</span>
                <span>{gameState.coins.toLocaleString()}</span>
              </div>

              {/* Diamonds Counter */}
              <div className="flex items-center gap-1.5 bg-[#172559] px-2.5 py-1 rounded-xl border border-cyan-400/50 font-headline font-black text-xs text-cyan-300 shadow-sm">
                <span>💎</span>
                <span>{gameState.diamonds.toLocaleString()}</span>
              </div>

              {/* Profile Button */}
              <button
                onClick={() => {
                  triggerHapticFeedback();
                  setIsProfileOpen(true);
                }}
                className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white border border-cyan-300 flex items-center justify-center font-headline font-bold text-xs shadow-[0_0_12px_rgba(34,211,238,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Player Profile"
              >
                <User size={15} />
              </button>
            </div>
          </div>
        </header>

        {/* Accessibility Status Banner */}
        <div className="px-4 py-1 bg-[#142054]/80 border-b border-indigo-500/30 flex items-center gap-2 text-[10px] font-semibold text-cyan-200">
          <Volume2 size={12} className="shrink-0 text-cyan-400" />
          <span className="truncate italic">Status: {screenReaderText}</span>
        </div>

        {/* Floating Offline connection state indicator */}
        {gameState.offline && (
          <div className="mx-4 mt-2.5 bg-amber-950/70 border border-amber-400/50 rounded-xl p-2 flex items-center justify-between gap-2 shadow-md">
            <span className="text-[10px] font-headline font-black text-amber-300 uppercase flex items-center gap-1">
              <WifiOff size={12} /> Offline Mode Active
            </span>
            <span className="text-[9px] font-bold text-amber-200">Saved in LocalStorage</span>
          </div>
        )}

        {/* Interactive Scrollable Active Tab Viewport */}
        <main className="flex-1 p-4 overflow-y-auto relative flex flex-col justify-start">
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
                          if (prev.currentPlayingLevelId < 10 && lvl.id === prev.currentPlayingLevelId + 1) {
                            return { ...lvl, isLocked: false };
                          }
                          return lvl;
                        });
                      }

                      return {
                        ...prev,
                        coins: prev.coins + addedCoins,
                        diamonds: prev.diamonds + addedDiamonds,
                        gemsCount: prev.gemsCount + addedDiamonds,
                        score: prev.score + matchScore,
                        wins: newWins,
                        losses: newLosses,
                        gamesPlayed: newGamesPlayed,
                        xp: newXp,
                        xpMax: newXpMax,
                        level: newLevel,
                        levels: updatedLevels,
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
        <nav className="fixed bottom-0 max-w-md w-full z-40 bg-[#111a44]/95 backdrop-blur-md border-t-2 border-indigo-500/40 pb-safe">
          <div className="grid grid-cols-4 items-center h-16 px-2">
            {/* Tab: Home */}
            <button
              id="home-tab"
              onClick={() => setTab('home')}
              className={`flex flex-col items-center justify-center gap-1 h-12 rounded-xl transition-all cursor-pointer ${
                gameState.activeTab === 'home'
                  ? 'bg-gradient-to-b from-[#223577] to-[#172559] text-amber-300 font-black border-2 border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.3)] -translate-y-1'
                  : 'text-violet-300/80 hover:text-cyan-300 hover:bg-[#162354]/50'
              }`}
            >
              <Home size={18} />
              <span className="text-[9px] uppercase font-headline font-bold tracking-wider leading-none">Home</span>
            </button>

            {/* Tab: Map */}
            <button
              id="map-tab"
              onClick={() => setTab('map')}
              className={`flex flex-col items-center justify-center gap-1 h-12 rounded-xl transition-all cursor-pointer ${
                gameState.activeTab === 'map'
                  ? 'bg-gradient-to-b from-[#223577] to-[#172559] text-amber-300 font-black border-2 border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.3)] -translate-y-1'
                  : 'text-violet-300/80 hover:text-cyan-300 hover:bg-[#162354]/50'
              }`}
            >
              <MapIcon size={18} />
              <span className="text-[9px] uppercase font-headline font-bold tracking-wider leading-none">Map</span>
            </button>

            {/* Tab: Puzzle Grid (Play) */}
            <button
              id="game-board"
              onClick={() => setTab('game')}
              className={`flex flex-col items-center justify-center gap-1 h-12 rounded-xl transition-all cursor-pointer ${
                gameState.activeTab === 'game'
                  ? 'bg-gradient-to-b from-[#223577] to-[#172559] text-amber-300 font-black border-2 border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.3)] -translate-y-1'
                  : 'text-violet-300/80 hover:text-cyan-300 hover:bg-[#162354]/50'
              }`}
            >
              <span className="text-base select-none leading-none">🎮</span>
              <span className="text-[9px] uppercase font-headline font-bold tracking-wider leading-none">Play</span>
            </button>

            {/* Tab: Settings (Config) */}
            <button
              id="settings-tab"
              onClick={() => setTab('settings')}
              className={`flex flex-col items-center justify-center gap-1 h-12 rounded-xl transition-all cursor-pointer ${
                gameState.activeTab === 'settings'
                  ? 'bg-gradient-to-b from-[#223577] to-[#172559] text-amber-300 font-black border-2 border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.3)] -translate-y-1'
                  : 'text-violet-300/80 hover:text-cyan-300 hover:bg-[#162354]/50'
              }`}
            >
              <SettingsIcon size={18} />
              <span className="text-[9px] uppercase font-headline font-bold tracking-wider leading-none">Config</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
