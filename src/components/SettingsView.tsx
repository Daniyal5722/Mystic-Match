import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Moon,
  Sun,
  Accessibility,
  Wifi,
  WifiOff,
  Bell,
  RefreshCw,
  Trash2,
  Volume2,
  VolumeX,
  Volume,
  BookOpen,
  User,
  Check
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
    <div className="flex flex-col w-full select-none relative z-10 pb-6 text-white">
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
