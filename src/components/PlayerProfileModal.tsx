import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Award, Swords, Shield, Sparkles, Edit3, Check } from 'lucide-react';
import { GameState } from '../types';

interface PlayerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onUpdateName: (name: string) => void;
  triggerHaptic: () => void;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  isOpen,
  onClose,
  gameState,
  onUpdateName,
  triggerHaptic,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(gameState.name);
  const [error, setError] = useState('');

  

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic();
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setError('Name cannot be blank');
      return;
    }
    if (trimmed.length < 2) {
      setError('Min 2 characters');
      return;
    }
    if (trimmed.length > 15) {
      setError('Max 15 characters');
      return;
    }
    onUpdateName(trimmed);
    setIsEditing(false);
    setError('');
  };

  const winRate = gameState.gamesPlayed > 0 
    ? Math.round((gameState.wins / gameState.gamesPlayed) * 100) 
    : 0;

  return (
    <AnimatePresence>
      {isOpen && (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-[#090e24]/85 backdrop-blur-md select-none touch-manipulation"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            triggerHaptic();
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-xs sm:max-w-sm bg-gradient-to-b from-[#19255a] via-[#141f4d] to-[#0f173b] border-2 border-indigo-400/60 p-4 sm:p-5 shadow-[0_10px_35px_rgba(59,130,246,0.35)] rounded-2xl text-white select-none max-h-[90dvh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={() => {
              triggerHaptic();
              onClose();
            }}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-indigo-950/80 border border-indigo-400/40 text-violet-300 hover:text-white hover:bg-indigo-900 flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Profile Header Avatar & Identity */}
          <div className="flex flex-col items-center text-center mt-2 mb-4">
            <div className="relative">
              <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 border-2 border-cyan-300 p-0.5 shadow-[0_0_20px_rgba(34,211,238,0.4)] flex items-center justify-center text-3xl font-headline font-black text-white">
                {gameState.name ? gameState.name.slice(0, 2).toUpperCase() : 'P1'}
              </div>
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-black font-headline text-[10px] px-2 py-0.5 rounded-full font-black border border-amber-200 shadow-md">
                LVL {gameState.level}
              </span>
            </div>

            {/* Editable Name */}
            {isEditing ? (
              <form onSubmit={handleSaveName} className="mt-3 flex items-center gap-2 w-full max-w-[240px]">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => {
                    setNameInput(e.target.value);
                    if (error) setError('');
                  }}
                  maxLength={15}
                  autoFocus
                  className="flex-1 bg-[#0c1433] border-2 border-cyan-400 rounded-lg px-2.5 py-1 text-sm font-headline font-bold text-white text-center focus:outline-none"
                />
                <button
                  type="submit"
                  className="p-1.5 bg-cyan-400 text-black rounded-lg hover:bg-cyan-300 font-bold transition-all"
                >
                  <Check size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-bold transition-all"
                >
                  <X size={16} />
                </button>
              </form>
            ) : (
              <div className="mt-2.5 flex items-center justify-center gap-2">
                <h2 className="font-headline text-xl font-extrabold uppercase text-white tracking-wide">
                  {gameState.name || 'Anonymous Mage'}
                </h2>
                <button
                  onClick={() => {
                    triggerHaptic();
                    setIsEditing(true);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 p-1"
                  title="Change Name"
                >
                  <Edit3 size={14} />
                </button>
              </div>
            )}
            {error && <p className="text-rose-400 text-xs font-semibold mt-1">{error}</p>}
            
            <p className="text-xs text-cyan-300 font-semibold mt-0.5">
              {gameState.level === 0 ? 'Novice Crystal Seeker' : `Realm Master • Rank ${gameState.level}`}
            </p>
          </div>

          {/* XP Progress Bar */}
          <div className="bg-[#0e163b] border border-indigo-500/30 rounded-xl p-3 mb-4">
            <div className="flex justify-between items-center text-[10px] font-headline font-bold uppercase tracking-wider text-violet-300 mb-1.5">
              <span className="flex items-center gap-1">
                <Sparkles size={12} className="text-amber-400" /> XP Progress
              </span>
              <span className="text-amber-300">{gameState.xp} / {gameState.xpMax}</span>
            </div>
            <div className="w-full h-3 bg-[#182352] rounded-full overflow-hidden p-0.5 border border-indigo-400/30">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.7)] transition-all duration-300"
                style={{ width: `${Math.min(100, (gameState.xp / gameState.xpMax) * 100)}%` }}
              />
            </div>
          </div>

          {/* Career Stats Grid (Required Section 8) */}
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            {/* COINS */}
            <div className="bg-[#121c47] border border-indigo-500/40 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-headline font-bold uppercase text-amber-300 block">COINS</span>
                <span className="font-headline font-black text-lg text-white">🪙 {gameState.coins}</span>
              </div>
            </div>

            {/* DIAMONDS */}
            <div className="bg-[#121c47] border border-indigo-500/40 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-headline font-bold uppercase text-cyan-300 block">DIAMONDS</span>
                <span className="font-headline font-black text-lg text-white">💎 {gameState.diamonds}</span>
              </div>
            </div>

            {/* SCORE */}
            <div className="bg-[#121c47] border border-indigo-500/40 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-headline font-bold uppercase text-violet-300 block">TOTAL SCORE</span>
                <span className="font-headline font-black text-lg text-amber-400">{gameState.score}</span>
              </div>
              <Trophy size={18} className="text-amber-400" />
            </div>

            {/* LEVEL */}
            <div className="bg-[#121c47] border border-indigo-500/40 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-headline font-bold uppercase text-violet-300 block">PLAYER LEVEL</span>
                <span className="font-headline font-black text-lg text-cyan-400">{gameState.level}</span>
              </div>
              <Award size={18} className="text-cyan-400" />
            </div>

            {/* WINS */}
            <div className="bg-[#121c47] border border-indigo-500/40 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-headline font-bold uppercase text-emerald-400 block">WINS</span>
                <span className="font-headline font-black text-lg text-emerald-400">{gameState.wins}</span>
              </div>
              <Swords size={18} className="text-emerald-400" />
            </div>

            {/* LOSSES */}
            <div className="bg-[#121c47] border border-indigo-500/40 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-headline font-bold uppercase text-rose-400 block">LOSSES</span>
                <span className="font-headline font-black text-lg text-rose-400">{gameState.losses}</span>
              </div>
              <Shield size={18} className="text-rose-400" />
            </div>
          </div>

          {/* Games Played & Win Rate */}
          <div className="bg-[#0e163b] border border-indigo-500/30 rounded-xl p-3 flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-headline font-bold uppercase text-violet-300 block">GAMES PLAYED</span>
              <span className="font-headline font-black text-xl text-white">{gameState.gamesPlayed}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-headline font-bold uppercase text-violet-300 block">VICTORY RATE</span>
              <span className="font-headline font-black text-base text-cyan-300">{winRate}%</span>
            </div>
          </div>

          {/* Achievements Section */}
          <div className="border-t border-indigo-500/30 pt-3 text-left">
            <h3 className="font-headline font-bold uppercase text-xs text-violet-300 mb-2 flex justify-between">
              <span>Achievements</span>
              <span className="text-cyan-300">
                {gameState.achievements.filter(a => a.isUnlocked).length} / {gameState.achievements.length}
              </span>
            </h3>
            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
              {gameState.achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all ${
                    ach.isUnlocked
                      ? 'bg-[#18265a] border-cyan-500/40'
                      : 'bg-[#0f173b]/50 border-indigo-950 opacity-60'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${
                    ach.isUnlocked ? 'bg-cyan-500/20 text-cyan-300' : 'bg-indigo-950/50 text-violet-300/40'
                  }`}>
                    {ach.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-headline text-xs font-bold leading-tight truncate ${ach.isUnlocked ? 'text-white' : 'text-violet-300/60'}`}>
                      {ach.title}
                    </h4>
                    <p className="text-[10px] text-violet-300/70 leading-normal truncate">
                      {ach.description}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end shrink-0">
                    <span className={`text-[10px] font-headline font-black ${ach.isUnlocked ? 'text-amber-400' : 'text-violet-300/40'}`}>
                      {ach.rewardType === 'coins' ? '🪙' : '💎'} {ach.rewardValue}
                    </span>
                    {ach.isUnlocked ? (
                      <span className="text-[8px] font-bold text-cyan-300 uppercase mt-0.5">Unlocked</span>
                    ) : (
                      <span className="text-[8px] font-bold text-violet-300/30 uppercase mt-0.5">Locked</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
