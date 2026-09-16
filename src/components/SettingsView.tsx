import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Moon,
  Sun,
  Accessibility,
  Wifi,
  WifiOff,
  Bell,
  Volume2,
  User,
  Check,
  Sparkles
} from 'lucide-react';
import { GameState } from '../types';

interface SettingsViewProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  triggerHaptic: () => void;
  triggerPushNotification: (title: string, msg: string) => void;
  triggerSync: () => void;
  resetGameProgress: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  gameState,
  setGameState,
  triggerHaptic,
  triggerPushNotification,
  triggerSync,
  resetGameProgress,
}) => {
  const [newName, setNewName] = useState(gameState.name);
  const [nameError, setNameError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleNameChange = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic();
    const trimmed = newName.trim();
    if (!trimmed) {
      setNameError('Name cannot be empty!');
      return;
    }
    if (trimmed.length < 2) {
      setNameError('Name must be at least 2 characters!');
      return;
    }
    if (trimmed.length > 15) {
      setNameError('Name must be 15 characters or less!');
      return;
    }
    setGameState((prev) => ({ ...prev, name: trimmed }));
    setNameError('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
    triggerPushNotification('Name Updated', `Identity updated to: ${trimmed}`);
  };

  const toggleDarkMode = () => {
    triggerHaptic();
    setGameState((prev) => {
      const nextMode = !prev.darkMode;
      if (nextMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { ...prev, darkMode: nextMode };
    });
    triggerPushNotification('System Theme Changed', 'Dark mode is now updated.');
  };

  const currentDifficulty = gameState.difficultyMode || (gameState.easyMode ? 'easy' : 'medium');

  const setDifficulty = (mode: 'easy' | 'medium' | 'hard' | 'extreme') => {
    triggerHaptic();
    setGameState((prev) => ({
      ...prev,
      difficultyMode: mode,
      easyMode: mode === 'easy',
    }));

    const descriptions = {
      easy: '60 moves & lowered targets for relaxed play 🌟',
      medium: '45 moves & standard targets for balanced play 🔮',
      hard: '35 moves & +30% targets for skilled players ⚡',
      extreme: '25 moves & +60% targets for true masters 🔥',
    };

    triggerPushNotification(
      `Difficulty: ${mode.toUpperCase()}`,
      descriptions[mode]
    );
  };

  const toggleHighContrast = () => {
    triggerHaptic();
    setGameState((prev) => ({ ...prev, highContrast: !prev.highContrast }));
  };

  const toggleScreenReader = () => {
    triggerHaptic();
    setGameState((prev) => {
      const nextReader = !prev.screenReaderEnabled;
      if (nextReader && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Screen reader active in Mystic Match.');
        window.speechSynthesis.speak(utterance);
      }
      return { ...prev, screenReaderEnabled: nextReader };
    });
  };

  const toggleOffline = () => {
    triggerHaptic();
    setGameState((prev) => {
      const nextOffline = !prev.offline;
      if (!nextOffline) {
        return { ...prev, offline: false, syncPending: true };
      }
      return { ...prev, offline: true };
    });

    if (gameState.offline) {
      setTimeout(() => {
        triggerSync();
      }, 1000);
    } else {
      triggerPushNotification('Offline Mode Active', 'Offline mode simulated. Progress stored in local storage.');
    }
  };

  return (
    
      <div className="flex flex-col w-full select-none relative z-10 pb-6 text-white gap-y-4 sm:gap-y-6 flex-1 overflow-y-auto">
      <h3 className="font-headline font-bold uppercase text-xs text-violet-300 mb-3 tracking-wider">
        Game Configuration & Preferences
      </h3>

      {/* Network & Local Storage Synchronization Module */}
      
      <div className="bg-[#142054] border border-indigo-400/50 rounded-2xl p-4 mb-4 shadow-[0_4px_20px_rgba(59,130,246,0.2)]">
        
      <div className="flex items-center justify-between mb-2">
          
      <div className="flex items-center gap-2">
            {gameState.offline ? (
              <WifiOff className="text-amber-400" size={18} />
            ) : (
              <Wifi className="text-cyan-400" size={18} />
            )}
            <h4 className="font-headline font-black text-xs uppercase text-white">
              Offline Storage Mode
            </h4>
          </div>
          <button
            onClick={toggleOffline}
            className={`px-3 py-1 text-[10px] font-headline font-bold rounded-lg uppercase transition-all ${
              gameState.offline ? 'bg-amber-400 text-black' : 'bg-cyan-400 text-slate-950'
            }`}
          >
            {gameState.offline ? 'Simulate Offline' : 'Online'}
          </button>
        </div>
        <p className="text-xs font-semibold text-violet-200 leading-relaxed mb-3">
          {gameState.offline
            ? 'Crystals and matching levels are stored inside local storage. Turn online to simulate cloud synchronization.'
            : 'Automatic browser local storage persistence is active. All scores and levels are safely preserved.'}
        </p>

        {gameState.syncPending && (
          
      <div className="bg-[#0e173b] border border-cyan-400/40 rounded-xl p-2 flex items-center justify-between gap-2">
            <span className="text-[10px] font-headline font-bold text-cyan-300 flex items-center gap-1.5 animate-pulse">
              🔄 Sync queue waiting...
            </span>
            <button
              onClick={triggerSync}
              className="px-2.5 py-1 bg-cyan-400 text-slate-950 rounded-lg font-headline text-[9px] font-bold uppercase hover:bg-cyan-300"
            >
              Force Sync
            </button>
          </div>
        )}
      </div>

      {/* Player Profile Identity Module */}
      
      <div className="bg-[#142054] border border-indigo-400/50 rounded-2xl p-4 mb-4 shadow-[0_4px_20px_rgba(59,130,246,0.2)]">
        <h4 className="font-headline font-black text-xs uppercase text-white mb-2 leading-none flex items-center gap-1.5">
          <User size={14} className="text-cyan-400" />
          Change Player Name
        </h4>
        <form onSubmit={handleNameChange} className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              if (nameError) setNameError('');
            }}
            maxLength={15}
            placeholder="New player name..."
            className="flex-1 bg-[#0c1433] border-2 border-indigo-400/50 rounded-xl text-xs font-headline font-bold px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-cyan-400 text-slate-950 rounded-xl font-headline text-[10px] font-black uppercase hover:bg-cyan-300 cursor-pointer transition-all shrink-0 flex items-center gap-1"
          >
            {savedSuccess ? <Check size={14} /> : 'Save'}
          </button>
        </form>
        {nameError && (
          <p className="text-rose-400 text-[10px] font-bold mt-2 bg-rose-500/10 border border-rose-500/30 rounded-lg p-1.5">
            ⚠️ {nameError}
          </p>
        )}
      </div>

      {/* System Preference Toggles */}
      
      <div className="grid grid-cols-1 gap-3 mb-4">
        {/* Dark Mode */}
        
      <div className="bg-[#142054] border border-indigo-400/40 rounded-xl p-3 flex items-center justify-between">
          
      <div className="flex items-center gap-2.5">
            {gameState.darkMode ? <Moon size={16} className="text-cyan-400" /> : <Sun size={16} className="text-amber-400" />}
            
      <div>
              <h5 className="font-headline font-bold text-xs uppercase leading-none">Night Mode</h5>
              <p className="text-[10px] text-violet-300 mt-0.5">Reduced eye strain in low-light environments</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={gameState.darkMode}
            onChange={toggleDarkMode}
            className="w-5 h-5 accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Difficulty Mode Selection Module (Easy, Medium, Hard, Extreme) */}
        
      <div className="bg-[#142054] border border-indigo-400/50 rounded-2xl p-3 sm:p-4 shadow-[0_4px_20px_rgba(59,130,246,0.2)]">
          
      <div className="flex items-center justify-between mb-2">
            
      <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400 animate-pulse shrink-0" />
              
      <div>
                <h4 className="font-headline font-black text-xs uppercase text-white leading-none">
                  Game Difficulty Mode
                </h4>
                <p className="text-[10px] text-violet-300 mt-0.5">
                  Adjusts moves allowance and objective thresholds
                </p>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-headline font-black uppercase tracking-wider ${
              currentDifficulty === 'easy' ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/50' :
              currentDifficulty === 'medium' ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/50' :
              currentDifficulty === 'hard' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50' :
              'bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse'
            }`}>
              {currentDifficulty}
            </span>
          </div>

          
      <div className="grid grid-cols-2 gap-2 mt-3">
            {/* Easy */}
            <button
              type="button"
              onClick={() => setDifficulty('easy')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[64px] ${
                currentDifficulty === 'easy'
                  ? 'bg-gradient-to-b from-emerald-950/80 to-emerald-900/60 border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.3)] ring-1 ring-emerald-400'
                  : 'bg-[#0e173b]/80 border-indigo-500/30 hover:border-emerald-400/50 hover:bg-[#121c47]'
              }`}
            >
              
      <div className="flex items-center justify-between">
                <span className="font-headline font-black text-xs uppercase text-emerald-300">
                  Easy
                </span>
                <span className="text-[10px]">🌱</span>
              </div>
              
      <div className="text-[9px] text-emerald-200/80 mt-1">
                <span className="font-bold text-white">60 moves</span> • lowered targets
              </div>
            </button>

            {/* Medium */}
            <button
              type="button"
              onClick={() => setDifficulty('medium')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[64px] ${
                currentDifficulty === 'medium'
                  ? 'bg-gradient-to-b from-cyan-950/80 to-blue-900/60 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.3)] ring-1 ring-cyan-400'
                  : 'bg-[#0e173b]/80 border-indigo-500/30 hover:border-cyan-400/50 hover:bg-[#121c47]'
              }`}
            >
              
      <div className="flex items-center justify-between">
                <span className="font-headline font-black text-xs uppercase text-cyan-300">
                  Medium
                </span>
                <span className="text-[10px]">⚖️</span>
              </div>
              
      <div className="text-[9px] text-cyan-200/80 mt-1">
                <span className="font-bold text-white">45 moves</span> • standard balance
              </div>
            </button>

            {/* Hard */}
            <button
              type="button"
              onClick={() => setDifficulty('hard')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[64px] ${
                currentDifficulty === 'hard'
                  ? 'bg-gradient-to-b from-amber-950/80 to-orange-950/60 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)] ring-1 ring-amber-400'
                  : 'bg-[#0e173b]/80 border-indigo-500/30 hover:border-amber-400/50 hover:bg-[#121c47]'
              }`}
            >
              
      <div className="flex items-center justify-between">
                <span className="font-headline font-black text-xs uppercase text-amber-300">
                  Hard
                </span>
                <span className="text-[10px]">⚡</span>
              </div>
              
      <div className="text-[9px] text-amber-200/80 mt-1">
                <span className="font-bold text-white">35 moves</span> • +30% targets
              </div>
            </button>

            {/* Extreme */}
            <button
              type="button"
              onClick={() => setDifficulty('extreme')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[64px] ${
                currentDifficulty === 'extreme'
                  ? 'bg-gradient-to-b from-rose-950/80 to-red-950/60 border-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.3)] ring-1 ring-rose-400'
                  : 'bg-[#0e173b]/80 border-indigo-500/30 hover:border-rose-400/50 hover:bg-[#121c47]'
              }`}
            >
              
      <div className="flex items-center justify-between">
                <span className="font-headline font-black text-xs uppercase text-rose-300">
                  Extreme
                </span>
                <span className="text-[10px]">🔥</span>
              </div>
              
      <div className="text-[9px] text-rose-200/80 mt-1">
                <span className="font-bold text-white">25 moves</span> • +60% targets
              </div>
            </button>
          </div>
        </div>

        {/* High Contrast */}
        
      <div className="bg-[#142054] border border-indigo-400/40 rounded-xl p-3 flex items-center justify-between">
          
      <div className="flex items-center gap-2.5">
            <Accessibility size={16} className="text-amber-400" />
            
      <div>
              <h5 className="font-headline font-bold text-xs uppercase leading-none">High Contrast Mode</h5>
              <p className="text-[10px] text-violet-300 mt-0.5">Increases text sizing and border glows</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={gameState.highContrast}
            onChange={toggleHighContrast}
            className="w-5 h-5 accent-amber-400 cursor-pointer"
          />
        </div>

        {/* Screen Reader Support */}
        
      <div className="bg-[#142054] border border-indigo-400/40 rounded-xl p-3 flex items-center justify-between">
          
      <div className="flex items-center gap-2.5">
            <Volume2 size={16} className="text-emerald-400" />
            
      <div>
              <h5 className="font-headline font-bold text-xs uppercase leading-none">Speech Screen Reader</h5>
              <p className="text-[10px] text-violet-300 mt-0.5">Speaks navigation changes and game alerts</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={gameState.screenReaderEnabled}
            onChange={toggleScreenReader}
            className="w-5 h-5 accent-emerald-400 cursor-pointer"
          />
        </div>

        {/* Push Notifications Test Controls */}
        
      <div className="bg-[#142054] border border-indigo-400/40 rounded-xl p-3">
          
      <div className="flex items-center justify-between mb-2">
            
      <div className="flex items-center gap-2.5">
              <Bell size={16} className="text-cyan-400" />
              
      <div>
                <h5 className="font-headline font-bold text-xs uppercase leading-none">In-App Notifications</h5>
                <p className="text-[10px] text-violet-300 mt-0.5">Alerts for quests, syncs, and energy</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={gameState.notificationsEnabled}
              onChange={() => {
                triggerHaptic();
                setGameState((p) => ({ ...p, notificationsEnabled: !p.notificationsEnabled }));
              }}
              className="w-5 h-5 accent-cyan-400 cursor-pointer"
            />
          </div>

          {gameState.notificationsEnabled && (
            
      <div className="mt-2.5 flex gap-2">
              <button
                onClick={() =>
                  triggerPushNotification(
                    '🌋 Raid Alert',
                    'A legendary chest surfaced in the volcano peaks! Open for 15 minutes.'
                  )
                }
                className="flex-1 py-1.5 bg-[#0e173b] border border-indigo-400/40 text-cyan-300 rounded-lg font-headline text-[9px] font-bold uppercase text-center hover:bg-indigo-900"
              >
                Trigger Raid Alert
              </button>
              <button
                onClick={() =>
                  triggerPushNotification(
                    '⚡ Energy Refilled',
                    'Your matching action energy is fully recharged to 100%!'
                  )
                }
                className="flex-1 py-1.5 bg-[#0e173b] border border-indigo-400/40 text-cyan-300 rounded-lg font-headline text-[9px] font-bold uppercase text-center hover:bg-indigo-900"
              >
                Trigger Energy Alert
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reset Progress Section */}
      
      <div className="bg-[#142054] border border-rose-500/40 rounded-2xl p-4 flex items-center justify-between shadow-[0_4px_20px_rgba(244,63,94,0.15)]">
        
      <div>
          <h5 className="font-headline font-bold text-xs uppercase leading-none text-rose-400">Reset Career</h5>
          <p className="text-[10px] text-violet-300 mt-0.5">Clear all saved progress and reset player account</p>
        </div>
        <button
          onClick={() => {
            if (window.confirm('Are you absolutely sure you want to reset your match-3 progress? All data will be wiped.')) {
              resetGameProgress();
            }
          }}
          className="px-3.5 py-2 bg-rose-600 text-white font-headline text-[10px] font-black uppercase rounded-xl hover:bg-rose-500 transition-colors cursor-pointer"
        >
          Reset All
        </button>
      </div>
    </div>
  );
};
