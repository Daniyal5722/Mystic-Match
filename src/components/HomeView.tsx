import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Play,
  Zap,
  Map,
  Trophy,
  Swords,
  Shield,
  ChevronRight,
  ShoppingBag,
  Calendar,
  Target,
  Film,
  Flame
} from 'lucide-react';
import { GameState } from '../types';

interface HomeViewProps {
  gameState: GameState;
  setTab: (tab: 'home' | 'map' | 'game' | 'settings') => void;
  triggerHaptic: (type?: any) => void;
  triggerPushNotification: (title: string, msg: string) => void;
  onOpenProfile: () => void;
  onOpenShop: () => void;
  onOpenDailyLogin: () => void;
  onOpenMissions: () => void;
  onOpenRewardedAd: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  gameState,
  setTab,
  triggerHaptic,
  triggerPushNotification,
  onOpenProfile,
  onOpenShop,
  onOpenDailyLogin,
  onOpenMissions,
  onOpenRewardedAd,
}) => {
  const goToMap = () => {
    triggerHaptic('click');
    setTab('map');
  };

  const today = new Date().toISOString().split('T')[0];
  const isClaimedToday = gameState.lastClaimedDaily === today;
  const unclaimedMissionsCount = (gameState.missions || []).filter(m => m.completed && !m.claimed).length;

  return (
    <div className="flex flex-col w-full relative z-10 select-none pb-6 text-white gap-y-6">
      {/* Subtle fantasy background crystal particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-6 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-60" />
        <div className="absolute top-28 right-8 w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse opacity-70" />
        <div className="absolute bottom-32 left-12 w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-70" />
        <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-blue-400 rounded-full animate-bounce opacity-40" />
      </div>

      {/* Mystic Match Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center text-center relative w-full"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#172559]/80 border border-cyan-400/40 rounded-full text-cyan-300 text-[10px] font-bold uppercase tracking-widest mb-1 shadow-[0_0_12px_rgba(34,211,238,0.25)]">
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
          triggerHaptic('click');
          onOpenProfile();
        }}
        className="card-glowing-purple p-3.5 rounded-2xl relative cursor-pointer hover:border-purple-400 transition-all group flex flex-col w-full"
      >
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 border-2 border-cyan-300 flex items-center justify-center font-headline font-black text-base text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                {gameState.name ? gameState.name.slice(0, 2).toUpperCase() : 'P1'}
              </div>
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-black font-headline text-[8px] px-1.5 py-0.2 rounded-full font-black border border-amber-200">
                LVL {gameState.level}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="font-headline text-sm sm:text-base font-extrabold tracking-tight text-white uppercase group-hover:text-cyan-300 transition-colors truncate">
                  {gameState.name || 'Crystal Mage'}
                </h2>
                <ChevronRight size={14} className="text-violet-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </div>
              <p className="text-[11px] font-semibold text-cyan-300 truncate">
                {gameState.level === 0 ? 'Novice Seeker' : `Master of Realm • Rank ${gameState.level}`}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end max-w-[110px] w-full shrink-0">
            <div className="flex justify-between w-full text-[8px] uppercase font-headline font-bold text-violet-300">
              <span>XP</span>
              <span className="text-amber-300">{gameState.xp}/{gameState.xpMax}</span>
            </div>
            <div className="w-full h-2 bg-[#0e163b] border border-indigo-400/40 mt-1 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.6)] transition-all duration-300" 
                style={{ width: `${Math.min(100, (gameState.xp / gameState.xpMax) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Player Career Statistics Sub-grid with Win Streak */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-4 gap-2 w-full min-w-0"
      >
        <div className="bg-gradient-to-b from-[#18265b] to-[#121c45] p-2 sm:p-2.5 rounded-xl border border-indigo-500/40 shadow-sm flex flex-col justify-between min-w-0">
          <span className="text-[8px] uppercase font-headline font-bold text-amber-300 flex items-center gap-1 truncate">
            <Trophy size={10} className="text-amber-400 shrink-0" /> Score
          </span>
          <span className="font-headline font-black text-xs sm:text-sm text-amber-300 mt-0.5 truncate">{gameState.score}</span>
        </div>

        <div className="bg-gradient-to-b from-[#18265b] to-[#121c45] p-2 sm:p-2.5 rounded-xl border border-indigo-500/40 shadow-sm flex flex-col justify-between min-w-0">
          <span className="text-[8px] uppercase font-headline font-bold text-emerald-300 flex items-center gap-1 truncate">
            <Swords size={10} className="text-emerald-400 shrink-0" /> Wins
          </span>
          <span className="font-headline font-black text-xs sm:text-sm text-emerald-400 mt-0.5 truncate">{gameState.wins}</span>
        </div>

        <div className="bg-gradient-to-b from-[#18265b] to-[#121c45] p-2 sm:p-2.5 rounded-xl border border-indigo-500/40 shadow-sm flex flex-col justify-between min-w-0">
          <span className="text-[8px] uppercase font-headline font-bold text-orange-300 flex items-center gap-1 truncate">
            <Flame size={10} className="text-orange-400 shrink-0" /> Streak
          </span>
          <span className="font-headline font-black text-xs sm:text-sm text-orange-400 mt-0.5 truncate">{gameState.winStreak || 0}</span>
        </div>

        <div className="bg-gradient-to-b from-[#18265b] to-[#121c45] p-2 sm:p-2.5 rounded-xl border border-indigo-500/40 shadow-sm flex flex-col justify-between min-w-0">
          <span className="text-[8px] uppercase font-headline font-bold text-cyan-300 flex items-center gap-1 truncate">
            <Play size={10} className="text-cyan-400 shrink-0" /> Matches
          </span>
          <span className="font-headline font-black text-xs sm:text-sm text-cyan-300 mt-0.5 truncate">{gameState.totalMatchesMade || 0}</span>
        </div>
      </motion.div>

      {/* 2-Column Economy Hub: Booster Shop & 7-Day Login */}
      <div className="grid grid-cols-2 gap-2.5 w-full">
        {/* Booster Shop Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => {
            triggerHaptic('click');
            onOpenShop();
          }}
          className="bg-gradient-to-br from-[#1a1c4e] to-[#111638] border-2 border-amber-400/60 p-3 rounded-2xl flex flex-col justify-between cursor-pointer hover:border-amber-300 transition-all shadow-md group active:scale-[0.98]"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/50 flex items-center justify-center font-bold">
              <ShoppingBag size={16} />
            </div>
            <span className="text-[8px] font-headline font-black uppercase bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/40">
              Shop
            </span>
          </div>
          <div>
            <h4 className="font-headline font-black text-xs sm:text-sm text-white group-hover:text-amber-300 transition-colors uppercase leading-none">
              Booster Emporium
            </h4>
            <p className="text-[9px] text-indigo-300 mt-1 leading-snug">
              Buy Hint, Undo, Hammer, Shuffle &amp; Bundles!
            </p>
          </div>
        </motion.div>

        {/* 7-Day Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => {
            triggerHaptic('click');
            onOpenDailyLogin();
          }}
          className="bg-gradient-to-br from-[#162150] to-[#0f173b] border-2 border-indigo-400/60 p-3 rounded-2xl flex flex-col justify-between cursor-pointer hover:border-cyan-300 transition-all shadow-md group active:scale-[0.98]"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-cyan-300 border border-indigo-400/50 flex items-center justify-center font-bold">
              <Calendar size={16} />
            </div>
            <span className={`text-[8px] font-headline font-black uppercase px-1.5 py-0.5 rounded border ${
              isClaimedToday ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' : 'bg-amber-400 text-slate-950 border-amber-300 animate-pulse'
            }`}>
              {isClaimedToday ? 'Day Claimed' : 'Gift Ready!'}
            </span>
          </div>
          <div>
            <h4 className="font-headline font-black text-xs sm:text-sm text-white group-hover:text-cyan-300 transition-colors uppercase leading-none">
              Daily Calendar
            </h4>
            <p className="text-[9px] text-indigo-300 mt-1 leading-snug">
              Day {gameState.dailyLoginDay || 1}/7 • Free boosters &amp; coins!
            </p>
          </div>
        </motion.div>
      </div>

      {/* Missions and Rewarded Ad Banner Row */}
      <div className="grid grid-cols-2 gap-2.5 w-full">
        {/* Quests / Missions */}
        <div
          onClick={() => {
            triggerHaptic('click');
            onOpenMissions();
          }}
          className="bg-[#121c47] border border-indigo-400/40 hover:border-indigo-300 p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
              <Target size={14} />
            </div>
            <div className="min-w-0">
              <p className="font-headline font-black text-[11px] text-white leading-none uppercase truncate">
                Quests &amp; Bounties
              </p>
              <p className="text-[8px] text-indigo-300 mt-0.5 truncate">
                {unclaimedMissionsCount > 0 ? `${unclaimedMissionsCount} Ready to Claim!` : '5 Active Missions'}
              </p>
            </div>
          </div>
          {unclaimedMissionsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0 ml-1" />
          )}
        </div>

        {/* Mystic Reel (Optional Rewarded simulation) */}
        <div
          onClick={() => {
            triggerHaptic('click');
            onOpenRewardedAd();
          }}
          className="bg-[#121c47] border border-purple-400/40 hover:border-purple-300 p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
              <Film size={14} />
            </div>
            <div className="min-w-0">
              <p className="font-headline font-black text-[11px] text-white leading-none uppercase truncate">
                Mystic Reel
              </p>
              <p className="text-[8px] text-purple-200 mt-0.5 truncate">
                +1 Free Booster (3s)
              </p>
            </div>
          </div>
          <span className="text-[8px] font-headline font-bold text-amber-300 shrink-0 ml-1">FREE</span>
        </div>
      </div>

      {/* Live Event Play Action Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#142054] border border-indigo-400/50 shadow-md p-3.5 rounded-2xl text-center relative overflow-hidden flex flex-col w-full items-center"
      >
        <div className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 border border-amber-400/50 px-2.5 py-0.5 rounded-full font-headline text-[9px] font-bold uppercase tracking-wider mb-1.5">
          <Zap size={10} className="fill-current text-amber-400" />
          Live Event Active
        </div>
        <h3 className="font-headline text-xl font-black uppercase text-amber-300 tracking-tight leading-none mb-1">
          Crystal Frenzy
        </h3>
        <p className="text-[11px] text-amber-100/90 font-medium max-w-xs mx-auto mb-2.5">
          Stage {gameState.currentPlayingLevelId || 1}: Clear match-3 objectives to claim stars!
        </p>

        <button
          onClick={goToMap}
          className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 py-2.5 px-4 rounded-xl font-headline font-black text-sm uppercase tracking-wider shadow-[0_4px_20px_rgba(251,191,36,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Map size={16} className="text-slate-950" />
          EXPLORE REALM MAP
        </button>
      </motion.div>

      {/* Quick Access to Map */}
      <div
        onClick={() => {
          triggerHaptic('click');
          setTab('map');
        }}
        className="card-glowing-blue p-3 rounded-xl flex items-center justify-between hover:border-blue-400 transition-all cursor-pointer group w-full"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center shrink-0">
            <Map size={16} className="text-cyan-400" />
          </div>
          <div className="min-w-0">
            <h4 className="font-headline font-bold text-xs uppercase text-white mb-0.5 group-hover:text-cyan-300 transition-colors truncate">
              Realm Map: 50 Stages
            </h4>
            <p className="text-[9px] text-violet-200 font-medium truncate">
              Journey across archipelago islands &amp; conquer bosses.
            </p>
          </div>
        </div>
        <ChevronRight size={16} className="text-cyan-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
      </div>
    </div>
  );
};
