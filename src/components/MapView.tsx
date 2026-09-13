import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ShieldAlert, Award, Play, AlertCircle, Sparkles, X, Lock } from 'lucide-react';
import { Level, GameState } from '../types';

interface MapViewProps {
  levels: Level[];
  gameState: GameState;
  setTab: (tab: 'home' | 'map' | 'game' | 'settings') => void;
  setSelectedLevelId: (id: number) => void;
  triggerHaptic: () => void;
  triggerPushNotification: (title: string, msg: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  levels,
  gameState,
  setTab,
  setSelectedLevelId,
  triggerHaptic,
  triggerPushNotification,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [showBossModal, setShowBossModal] = useState(false);

  const openLevelDetails = (level: Level) => {
    triggerHaptic();
    if (level.isLocked) {
      triggerPushNotification('Stage Locked!', `You must clear previous stages to unlock Stage ${level.id}.`);
      return;
    }
    if (level.isBoss) {
      setShowBossModal(true);
    } else {
      setSelectedLevel(level);
    }
  };

  const launchLevel = (levelId: number) => {
    setSelectedLevelId(levelId);
    triggerHaptic();
    setSelectedLevel(null);
    setTab('game');
  };

  // Levels for display (Stage 1 to 9, then Boss Stage 10)
  const displayLevels = levels.filter((lvl) => lvl.id <= 6 || lvl.isBoss);

  // Calculate dynamic progress
  const completedLevels = levels.filter((lvl) => lvl.stars > 0).length;
  const totalLevels = levels.length;
  const progressPercentage = totalLevels > 0 ? (completedLevels / totalLevels) * 100 : 0;

  return (
    <div className="flex flex-col w-full select-none relative z-10 pb-6 text-white">
      {/* Top Banner Context */}
      <div className="mb-4 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-headline font-bold text-[10px] uppercase tracking-widest text-cyan-300 bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-cyan-400/40 leading-none">
              World 01 • Celestial Archipelago
            </span>
            <h1 className="font-headline font-black text-2xl tracking-tight text-white mt-1.5 leading-none uppercase">
              THE FLOATING REALM
            </h1>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase font-headline font-bold text-violet-300 leading-none">
              Progress
            </span>
            <span className="font-headline font-black text-base mt-0.5 text-cyan-300 leading-none">
              {completedLevels} / {totalLevels}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-[#0c1433] border border-indigo-400/40 p-0.5 relative overflow-hidden rounded-full mt-1">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.7)] transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Main Scrollable Level Map Container */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full h-[540px] bg-gradient-to-b from-[#162357] via-[#121c47] to-[#0e163b] border-2 border-indigo-400/50 rounded-2xl shadow-[0_4px_25px_rgba(59,130,246,0.25)] overflow-y-scroll p-4 flex flex-col items-center select-none"
      >
        {/* Atmospheric Celestial Light Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-1/4 left-1/4 w-60 h-60 rounded-full bg-blue-600/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-60 h-60 rounded-full bg-purple-600/25 blur-3xl" />
        </div>

        {/* Winding Path SVG Layer */}
        <svg className="absolute top-0 left-0 w-full h-[1400px] pointer-events-none z-0">
          <path
            d="M 180 50 Q 280 150, 190 280 T 80 520 T 220 740 T 110 960 T 170 1150 T 140 1350"
            fill="none"
            stroke="#6366f1"
            strokeDasharray="8 6"
            strokeWidth="4"
            className="opacity-70"
          />
        </svg>

        {/* Map Nodes Container */}
        <div className="relative z-10 w-full flex flex-col items-center py-4">
          {displayLevels
            .slice()
            .reverse()
            .map((lvl) => {
              const offsetClass = lvl.isBoss
                ? 'translate-x-0 pt-4'
                : lvl.id % 2 === 0
                ? 'translate-x-12 sm:translate-x-18'
                : '-translate-x-12 sm:-translate-x-18';

              if (lvl.isBoss) {
                return (
                  <div
                    key={lvl.id}
                    className={`flex flex-col items-center ${offsetClass} cursor-pointer group pb-8`}
                    onClick={() => openLevelDetails(lvl)}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5 bg-rose-950/90 text-rose-300 px-2.5 py-0.5 font-headline font-bold text-[9px] uppercase rounded-full border border-rose-500/60 shadow-md">
                      <ShieldAlert size={11} className="text-rose-400" /> Boss Node
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.96 }}
                      className="w-20 h-20 bg-gradient-to-br from-rose-600 via-purple-700 to-indigo-800 text-white font-headline font-black text-xl rounded-2xl flex flex-col items-center justify-center border-2 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.5)] relative"
                    >
                      <span className="text-2xl">🐉</span>
                      <span className="leading-none mt-0.5">{lvl.id}</span>
                    </motion.div>
                    <span className="font-headline font-bold text-[10px] mt-1.5 bg-[#0f173b] px-2 py-0.5 rounded-md border border-rose-500/40 uppercase text-rose-300">
                      Aether Dragon
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={lvl.id}
                  className={`flex flex-col items-center ${offsetClass} mb-14 cursor-pointer group`}
                  onClick={() => openLevelDetails(lvl)}
                >
                  {/* Star Display */}
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map((sIndex) => (
                      <Star
                        key={sIndex}
                        size={13}
                        className={`${
                          sIndex <= lvl.stars
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]'
                            : 'text-indigo-900 fill-indigo-950/60'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Level Number Card */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-14 h-14 font-headline font-black text-lg rounded-2xl flex items-center justify-center border-2 shadow-lg transition-all ${
                      lvl.isLocked
                        ? 'bg-[#0f183b] text-violet-400/50 border-indigo-900/60'
                        : lvl.stars > 0
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-700 text-white border-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                        : 'bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 border-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                    }`}
                  >
                    {lvl.isLocked ? (
                      <Lock size={18} className="text-violet-400/60" />
                    ) : (
                      <span>{lvl.id < 10 ? `0${lvl.id}` : lvl.id}</span>
                    )}
                  </motion.div>

                  {/* Name Tag */}
                  <span className="font-headline font-bold text-[10px] mt-1.5 bg-[#0f173b]/90 px-2.5 py-0.5 rounded-full border border-indigo-400/40 text-violet-200 whitespace-nowrap group-hover:text-cyan-300 transition-colors">
                    {lvl.name}
                  </span>
                </div>
              );
            })}
        </div>
      </motion.div>

      {/* Map Legend */}
      <div className="mt-3 flex items-center justify-between px-2 text-[11px] font-headline font-bold text-violet-300">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-500 border border-cyan-300" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-rose-600 border border-rose-400" />
          <span>Boss Node</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#0f183b] border border-indigo-800" />
          <span>Locked</span>
        </div>
      </div>

      {/* Level Details Modal */}
      <AnimatePresence>
        {selectedLevel && (
          <div className="fixed inset-0 z-50 bg-[#090f2b]/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="bg-gradient-to-b from-[#18265e] via-[#141f4d] to-[#0f173b] border-2 border-indigo-400/60 rounded-2xl shadow-[0_10px_35px_rgba(59,130,246,0.35)] w-full max-w-sm p-6 relative flex flex-col gap-4 text-left"
            >
              <button
                className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-indigo-950/80 border border-indigo-400/40 text-violet-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                onClick={() => setSelectedLevel(null)}
              >
                <X size={16} />
              </button>

              <div>
                <span className="font-headline font-bold text-[10px] uppercase tracking-widest text-cyan-300">
                  Stage Details
                </span>
                <h2 className="font-headline font-black text-2xl text-white leading-tight mt-0.5">
                  Stage {selectedLevel.id}: {selectedLevel.name}
                </h2>
              </div>

              {/* Star Progress */}
              <div className="flex justify-center gap-3 py-3 bg-[#0d1538] border border-indigo-500/40 rounded-xl">
                {[1, 2, 3].map((sIndex) => (
                  <Star
                    key={sIndex}
                    size={30}
                    className={`${
                      sIndex <= selectedLevel.stars
                        ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                        : 'text-indigo-950 fill-indigo-950/60'
                    }`}
                  />
                ))}
              </div>

              {/* Battle Stats */}
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-indigo-500/30">
                  <span className="font-bold text-violet-300">Objective</span>
                  <span className="font-headline font-black text-white uppercase flex items-center gap-1">
                    {selectedLevel.objectiveTarget} {selectedLevel.objectiveType}s
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-indigo-500/30">
                  <span className="font-bold text-violet-300">Recommended Power</span>
                  <span className="font-headline font-black text-white">
                    {selectedLevel.recommendedPower.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-indigo-500/30">
                  <span className="font-bold text-violet-300">Potential Rewards</span>
                  <span className="font-headline font-black text-cyan-300 flex items-center gap-1">
                    <Award size={13} className="text-amber-400" />
                    {selectedLevel.loot}
                  </span>
                </div>
              </div>

              {/* Launch Action */}
              <button
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-headline font-black text-sm uppercase tracking-wider rounded-xl shadow-[0_4px_20px_rgba(251,191,36,0.4)] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 mt-1"
                onClick={() => launchLevel(selectedLevel.id)}
              >
                <Play size={16} className="fill-current" />
                Launch Stage
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Boss Preview Modal */}
      <AnimatePresence>
        {showBossModal && (
          <div className="fixed inset-0 z-50 bg-[#090f2b]/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="bg-gradient-to-b from-[#18265e] via-[#141f4d] to-[#0f173b] border-2 border-rose-500/70 rounded-2xl shadow-[0_10px_35px_rgba(244,63,94,0.35)] w-full max-w-sm p-6 relative flex flex-col gap-4 text-left"
            >
              <button
                className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-indigo-950/80 border border-indigo-400/40 text-violet-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                onClick={() => setShowBossModal(false)}
              >
                <X size={16} />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-3xl">🐉</span>
                <div>
                  <span className="font-headline font-bold text-[10px] uppercase tracking-widest text-rose-400">
                    Ultimate Challenge
                  </span>
                  <h2 className="font-headline font-black text-xl text-white leading-tight mt-0.5">
                    Stage 10: Aether Dragon
                  </h2>
                </div>
              </div>

              <div className="w-full h-32 bg-gradient-to-tr from-rose-950 to-indigo-950 border border-rose-500/50 rounded-xl flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
                <span className="text-5xl animate-bounce">🐲</span>
                <span className="text-[10px] font-headline font-bold uppercase tracking-wider text-rose-300 mt-2 bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-500/50">
                  Guardian of the Realm
                </span>
              </div>

              <p className="text-xs text-violet-200 font-medium leading-relaxed">
                Defeat the Ancient Dragon of Celestial Archipelago to harvest legendary Sunstone crystals and claim royal treasures!
              </p>

              <div className="flex justify-between py-2.5 px-3 bg-[#0d1538] border border-indigo-500/40 rounded-xl">
                <span className="font-headline font-bold text-[10px] uppercase text-violet-300">Boss Power</span>
                <span className="font-headline font-black text-xs text-rose-400">100,000 / 100,000</span>
              </div>

              <button
                className="w-full py-3 bg-[#11193b] text-violet-400 font-headline font-black text-xs uppercase tracking-wider rounded-xl border border-indigo-500/30 opacity-60 cursor-not-allowed text-center"
                disabled
              >
                Locked (Clear Stages 1-9 First)
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
