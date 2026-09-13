import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Play } from 'lucide-react';

interface PlayerSetupOverlayProps {
  onContinue: (name: string) => void;
  triggerHaptic: () => void;
}

export const PlayerSetupOverlay: React.FC<PlayerSetupOverlayProps> = ({
  onContinue,
  triggerHaptic,
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter a player name!');
      return;
    }
    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters long!');
      return;
    }
    if (trimmedName.length > 15) {
      setError('Name must be 15 characters or less!');
      return;
    }

    onContinue(trimmedName);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-[#090f2b]/85 backdrop-blur-md">
      {/* Floating magical atmospheric nebulas */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 25 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 120 }}
        className="relative w-full max-w-sm bg-gradient-to-b from-[#18265e] via-[#141f4d] to-[#0f173b] border-2 border-cyan-400/70 p-7 shadow-[0_10px_40px_rgba(34,211,238,0.35)] text-center select-none rounded-2xl text-white overflow-hidden"
      >
        {/* Crystal Orb Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 border-2 border-cyan-300 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(59,130,246,0.6)] mb-3">
          🔮
        </div>

        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-950/80 border border-cyan-400/40 rounded-full text-cyan-300 text-[10px] font-bold uppercase tracking-widest mb-2">
            <Sparkles size={11} className="text-amber-400 animate-pulse" />
            Fantasy Match-3 Realm
          </div>
          <h1 className="font-headline font-black text-2xl uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-cyan-300 leading-tight mb-1">
            WELCOME TO MYSTIC MATCH
          </h1>
          <p className="text-xs text-violet-200 font-medium max-w-[260px] mx-auto leading-relaxed">
            Enter your player name to begin your journey across the crystal archipelagos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          <div>
            <label className="block text-[11px] font-headline font-bold uppercase tracking-wider text-cyan-300 mb-1.5">
              Enter your player name
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter Name..."
                maxLength={15}
                autoFocus
                className="w-full bg-[#0d1538] text-white border-2 border-indigo-400/50 rounded-xl font-headline font-bold text-sm px-4 py-3 shadow-inner focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all placeholder:text-violet-400/70"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-headline font-bold text-violet-400">
                {name.length}/15
              </span>
            </div>
            {error && (
              <p className="text-rose-400 text-xs font-semibold mt-1.5 flex items-center gap-1">
                ⚠️ {error}
              </p>
            )}
          </div>

          <div className="mt-1 flex flex-col gap-2.5">
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-headline font-black text-sm uppercase tracking-wider rounded-xl shadow-[0_4px_20px_rgba(251,191,36,0.4)] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Play size={16} className="fill-current" />
              START GAME
            </button>
            <p className="text-[10px] text-violet-300/80 font-medium text-center">
              ⚡ Instant setup. Account saved locally on this device.
            </p>
          </div>
        </form>

        {/* New player starting stats - Guaranteed All Zeros */}
        <div className="mt-5 pt-4 border-t border-indigo-500/30 flex justify-around text-center text-violet-200 text-xs">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-amber-300">Coins</span>
            <span className="font-headline font-black text-sm text-white">🪙 0</span>
          </div>
          <div className="w-[1px] bg-indigo-500/40 h-7 self-center" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-cyan-300">Diamonds</span>
            <span className="font-headline font-black text-sm text-white">💎 0</span>
          </div>
          <div className="w-[1px] bg-indigo-500/40 h-7 self-center" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-emerald-300">Level</span>
            <span className="font-headline font-black text-sm text-white">⭐ 0</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
