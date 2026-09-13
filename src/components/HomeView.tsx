import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Play, Award, Zap, Flame, Map, Trophy, Gem, Coins, Swords, Shield, ChevronRight } from 'lucide-react';
import { GameState } from '../types';

interface HomeViewProps {
  gameState: GameState;
  setTab: (tab: 'home' | 'map' | 'game' | 'settings') => void;
  triggerHaptic: () => void;
  triggerPushNotification: (title: string, msg: string) => void;
  onOpenProfile: () => void;
  onClaimDailyReward: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  gameState,
  setTab,
  triggerHaptic,
  triggerPushNotification,
  onOpenProfile,
  onClaimDailyReward,
}) => {
  const [matchingStatus, setMatchingStatus] = useState<'idle' | 'searching' | 'found'>('idle');

  const startQuickMatch = () => {
    triggerHaptic();
    setMatchingStatus('searching');
    setTimeout(() => {
      setMatchingStatus('found');
      setTimeout(() => {
        setMatchingStatus('idle');
        setTab('game');
      }, 700);
    }, 1200);
  };

  const today = new Date().toISOString().split('T')[0];
  const isClaimedToday = gameState.lastClaimedDaily === today;

  return (
    <div className="flex flex-col w-full relative z-10 select-none pb-6 text-white">
      {/* Subtle fantasy background crystal particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-6 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-60" />
        <div className="absolute top-28 right-8 w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse opacity-70" />
        <div className="absolute bottom-32 left-12 w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-70" />
        <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-blue-400 rounded-full animate-bounce opacity-40" />
      </div>

      {/* Prominent Mystic Match Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 text-center relative"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#172559]/80 border border-cyan-400/40 rounded-full text-cyan-300 text-[10px] font-bold uppercase tracking-widest mb-1.5 shadow-[0_0_12px_rgba(34,211,238,0.25)]">
          <Sparkles size={11} className="text-amber-300 animate-spin-slow" />
          Celestial Puzzle Realm
        </div>
        <h1 className="font-headline font-black text-2xl uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-cyan-300 drop-shadow-[0_2px_8px_rgba(251,191,36,0.4)]">
          MYSTIC MATCH
        </h1>
      </motion.div>

      {/* Player Profile & XP Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => {
          triggerHaptic();
          onOpenProfile();
        }}
        className="card-glowing-purple p-4 mb-4 rounded-2xl relative cursor-pointer hover:border-purple-400 transition-all group"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-13 h-13 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 border-2 border-cyan-300 flex items-center justify-center font-headline font-black text-lg text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                {gameState.name ? gameState.name.slice(0, 2).toUpperCase() : 'P1'}
              </div>
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-black font-headline text-[9px] px-1.5 py-0.5 rounded-full font-black border border-amber-200">
                LVL {gameState.level}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-headline text-base font-extrabold tracking-tight text-white uppercase group-hover:text-cyan-300 transition-colors">
                  {gameState.name || 'Crystal Mage'}
                </h2>
                <ChevronRight size={14} className="text-violet-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs font-semibold text-cyan-300">
                {gameState.level === 0 ? 'Novice Seeker' : `Master of Realm • Rank ${gameState.level}`}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end max-w-[120px] w-full">
            <div className="flex justify-between w-full text-[9px] uppercase font-headline font-bold text-violet-300">
              <span>XP</span>
              <span className="text-amber-300">{gameState.xp}/{gameState.xpMax}</span>
            </div>
            <div className="w-full h-2.5 bg-[#0e163b] border border-indigo-400/40 mt-1 p-0.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.6)] transition-all duration-300" 
                style={{ width: `${Math.min(100, (gameState.xp / gameState.xpMax) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Player Career Statistics Sub-grid (Colorful cards, no black rectangles) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4"
      >
        <div className="bg-gradient-to-b from-[#18265b] to-[#121c45] p-3 rounded-xl border border-indigo-500/40 shadow-sm flex flex-col justify-between">
          <span className="text-[9px] uppercase font-headline font-bold text-amber-300 flex items-center gap-1">
            <Trophy size={11} className="text-amber-400" /> Score
          </span>
          <span className="font-headline font-black text-base text-amber-300 mt-1">{gameState.score}</span>
        </div>

        <div className="bg-gradient-to-b from-[#18265b] to-[#121c45] p-3 rounded-xl border border-indigo-500/40 shadow-sm flex flex-col justify-between">
          <span className="text-[9px] uppercase font-headline font-bold text-emerald-300 flex items-center gap-1">
            <Swords size={11} className="text-emerald-400" /> Wins
          </span>
          <span className="font-headline font-black text-base text-emerald-400 mt-1">{gameState.wins}</span>
        </div>

        <div className="bg-gradient-to-b from-[#18265b] to-[#121c45] p-3 rounded-xl border border-indigo-500/40 shadow-sm flex flex-col justify-between">
          <span className="text-[9px] uppercase font-headline font-bold text-rose-300 flex items-center gap-1">
            <Shield size={11} className="text-rose-400" /> Losses
          </span>
          <span className="font-headline font-black text-base text-rose-400 mt-1">{gameState.losses}</span>
        </div>

        <div className="bg-gradient-to-b from-[#18265b] to-[#121c45] p-3 rounded-xl border border-indigo-500/40 shadow-sm flex flex-col justify-between">
          <span className="text-[9px] uppercase font-headline font-bold text-cyan-300 flex items-center gap-1">
            <Play size={11} className="text-cyan-400" /> Played
          </span>
          <span className="font-headline font-black text-base text-cyan-300 mt-1">{gameState.gamesPlayed}</span>
        </div>
      </motion.div>

      {/* Live Event Banner Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#142054] border border-indigo-400/50 shadow-md p-4 rounded-2xl mb-4 text-center relative overflow-hidden"
      >
        <div className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 border border-amber-400/50 px-2.5 py-0.5 rounded-full font-headline text-[9px] font-bold uppercase tracking-wider mb-2">
          <Zap size={10} className="fill-current text-amber-400" />
          Live Event Active
        </div>
        <h3 className="font-headline text-2xl font-black uppercase text-amber-300 tracking-tight leading-none mb-1">
          Crystal Frenzy
        </h3>
        <p className="text-xs text-amber-100/90 font-medium max-w-xs mx-auto mb-3">
          Double crystal energy drops across all match queues!
        </p>

        <button
          onClick={startQuickMatch}
          disabled={matchingStatus !== 'idle'}
          className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 py-3 px-5 rounded-xl font-headline font-black text-base uppercase tracking-wider shadow-[0_4px_20px_rgba(251,191,36,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-80"
        >
          {matchingStatus === 'idle' && (
            <>
              <Play size={16} className="fill-current" />
              PLAY NOW
            </>
          )}
          {matchingStatus === 'searching' && (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Entering Arena...
            </span>
          )}
          {matchingStatus === 'found' && (
            <span className="flex items-center gap-2">
              <Zap size={16} className="animate-bounce" />
              Arena Ready!
            </span>
          )}
        </button>
      </motion.div>

      {/* Daily Reward Chest Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="card-glowing-blue p-4 rounded-2xl mb-4 text-left relative overflow-hidden"
      >
        <div className="absolute -right-6 -bottom-6 text-7xl opacity-10 select-none">🎁</div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            <h3 className="font-headline font-bold uppercase text-xs text-white leading-none">
              Daily Celestial Chest
            </h3>
          </div>
          <span className={`text-[9px] font-headline font-bold px-2 py-0.5 rounded-md border ${
            isClaimedToday
              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
              : 'bg-amber-950 text-amber-300 border-amber-400/50'
          }`}>
            {isClaimedToday ? 'CLAIMED TODAY' : 'AVAILABLE'}
          </span>
        </div>
        <p className="text-xs text-blue-100/80 font-medium mb-3">
          Claim your daily magical chest to receive free mystical currency and power-ups!
        </p>
        <div className="flex justify-between items-center gap-2">
          <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
            🪙 +500 Coins & 💎 +10 Diamonds
          </span>
          <button
            onClick={() => {
              if (isClaimedToday) return;
              triggerHaptic();
              onClaimDailyReward();
            }}
            disabled={isClaimedToday}
            className={`font-headline text-[10px] font-black px-4 py-2 rounded-lg uppercase tracking-wider transition-all shadow-sm cursor-pointer ${
              isClaimedToday
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-[0_0_10px_rgba(251,191,36,0.5)] active:scale-[0.95]'
            }`}
          >
            {isClaimedToday ? 'Claimed' : 'Claim Chest'}
          </button>
        </div>
      </motion.div>

      {/* Daily Quest Banner Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card-glowing-cyan p-4 rounded-2xl mb-4"
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-cyan-400" />
            <h3 className="font-headline font-bold uppercase text-xs text-white leading-none">
              Daily Quest: Prism Collector
            </h3>
          </div>
          <span className="text-[9px] font-headline font-bold bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded-md border border-cyan-400/50">
            2/3 DONE
          </span>
        </div>
        <p className="text-xs text-cyan-100/80 font-medium mb-2.5">
          Collect 3 Legendary Shards from matching levels to claim bonus rewards.
        </p>
        <div className="w-full h-2 bg-[#0c1833] border border-cyan-500/40 rounded-full overflow-hidden mb-3">
          <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 w-2/3 shadow-[0_0_8px_#22d3ee]" />
        </div>
        <div className="flex justify-between items-center gap-2">
          <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
            🪙 +500 Coins & 💎 +10 Diamonds
          </span>
          <button
            onClick={() => {
              triggerHaptic();
              triggerPushNotification(
                'Quest Complete!',
                'You claimed +500 Coins & 10 Diamonds for your prism quest.'
              );
            }}
            className="bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-headline text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
          >
            Claim
          </button>
        </div>
      </motion.div>

      {/* Quick Access Grid (No flat black rectangles, rich navy & purple) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-2"
      >
        <h3 className="font-headline font-bold uppercase text-xs text-violet-300 mb-2.5 tracking-wider">
          Quick Access
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Realm Map Card */}
          <div
            onClick={() => {
              triggerHaptic();
              setTab('map');
            }}
            className="card-glowing-blue p-3.5 rounded-xl flex flex-col justify-between hover:border-blue-400 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center">
                <Map size={16} className="text-cyan-400" />
              </div>
              <span className="text-[9px] font-headline uppercase font-bold bg-blue-950 text-cyan-300 px-1.5 py-0.5 rounded border border-blue-400/50">
                Stages
              </span>
            </div>
            <div>
              <h4 className="font-headline font-bold text-xs uppercase text-white mb-0.5 group-hover:text-cyan-300 transition-colors">
                Realm Map
              </h4>
              <p className="text-[10px] text-violet-200 font-medium line-clamp-1">
                Explore floating islands & boss nodes.
              </p>
            </div>
          </div>

          {/* Puzzle Boosters Box Card */}
          <div
            onClick={() => {
              triggerHaptic();
              setTab('game');
            }}
            className="card-glowing-purple p-3.5 rounded-xl flex flex-col justify-between hover:border-purple-400 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center">
                <Zap size={16} className="text-purple-300" />
              </div>
              <span className="text-[9px] font-headline uppercase font-bold bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded border border-purple-400/50">
                Active
              </span>
            </div>
            <div>
              <h4 className="font-headline font-bold text-xs uppercase text-white mb-0.5 group-hover:text-purple-300 transition-colors">
                Puzzle Arena
              </h4>
              <p className="text-[10px] text-violet-200 font-medium line-clamp-1">
                Match crystals and clear combos.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
