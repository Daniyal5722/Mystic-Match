import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ShieldAlert, Award, Play, X, Lock } from 'lucide-react';
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
  const [selectedBossLevel, setSelectedBossLevel] = useState<Level | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Programmatically position each node in a scrollable, beautiful winding vertical road
  const mapNodes = useMemo(() => {
    return levels.map((lvl) => {
      const i = lvl.id;
      // Arrange levels so Stage 1 is at the bottom, and Stage 50 is at the top
      // Spacing: 140px per stage
      const y = (levels.length - i) * 140 + 80;
      // Beautiful winding sine curve representing floating islands in the celestial sky
      const x = 160 + Math.sin(i * 1.1) * 75;
      return {
        ...lvl,
        x,
        y,
      };
    });
  }, [levels]);

  // Create smooth curved lines (SVG quadratic curves) between map nodes
  const pathD = useMemo(() => {
    if (mapNodes.length === 0) return '';
    // Sort ascending by level ID to draw path from bottom (Stage 1) up to top (Stage 50)
    const sorted = [...mapNodes].sort((a, b) => a.id - b.id);
    let d = `M ${sorted[0].x} ${sorted[0].y}`;
    for (let idx = 1; idx < sorted.length; idx++) {
      const prevNode = sorted[idx - 1];
      const currNode = sorted[idx];
      const cpY = (prevNode.y + currNode.y) / 2;
      // Control point offset creates a lovely curved wavy path
      const cpX = (prevNode.x + currNode.x) / 2 + (prevNode.id % 2 === 0 ? 20 : -20);
      d += ` Q ${cpX} ${cpY}, ${currNode.x} ${currNode.y}`;
    }
    return d;
  }, [mapNodes]);

  // Scroll to active (unlocked but unplayed) level or the highest unlocked level on mount
  useEffect(() => {
    if (containerRef.current) {
      const activeLvl = levels.find((l) => !l.isLocked && l.stars === 0) || levels[0];
      if (activeLvl) {
        // Calculate corresponding y coordinate
        const activeY = (levels.length - activeLvl.id) * 140 + 80;
        // Center the active node in the 540px high viewport
        containerRef.current.scrollTop = activeY - 240;
      }
    }
  }, [levels]);

  const openLevelDetails = (level: Level) => {
    triggerHaptic();
    if (level.isLocked) {
      triggerPushNotification('Stage Locked!', `You must clear previous stages to unlock Stage ${level.id}.`);
      return;
    }
    if (level.isBoss) {
      setSelectedBossLevel(level);
    } else {
      setSelectedLevel(level);
    }
  };

  const launchLevel = (levelId: number) => {
    setSelectedLevelId(levelId);
    triggerHaptic();
    setSelectedLevel(null);
    setSelectedBossLevel(null);
    setTab('game');
  };

  // Calculate dynamic progress
  const completedLevels = levels.filter((lvl) => lvl.stars > 0).length;
  const totalLevels = levels.length;
  const progressPercentage = totalLevels > 0 ? (completedLevels / totalLevels) * 100 : 0;

  // Total height of winding path SVG matching our node coordinate system
  const canvasHeight = levels.length * 140 + 100;

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
      <div
        ref={containerRef}
        className="relative w-full h-[540px] bg-gradient-to-b from-[#162357] via-[#121c47] to-[#0e163b] border-2 border-indigo-400/50 rounded-2xl shadow-[0_4px_25px_rgba(59,130,246,0.25)] overflow-y-scroll p-4 select-none scroll-smooth"
      >
        {/* Dynamic scroll indicator on map */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-[9px] font-headline font-bold uppercase tracking-widest text-cyan-400 bg-indigo-950/85 border border-cyan-400/40 px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5 animate-pulse">
          <span>👑 Celestial Spire</span>
        </div>

        <div className="relative w-full" style={{ height: `${canvasHeight}px` }}>
          {/* Atmospheric Celestial Light Orbs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-1/4 left-1/4 w-60 h-60 rounded-full bg-blue-600/10 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-60 h-60 rounded-full bg-purple-600/15 blur-3xl" />
            <div className="absolute top-2/3 left-1/3 w-72 h-72 rounded-full bg-cyan-600/10 blur-3xl" />
          </div>

          {/* Winding Path SVG Layer */}
          <svg
            className="absolute top-0 left-0 w-full pointer-events-none z-0"
            style={{ height: `${canvasHeight}px` }}
          >
            <path
              d={pathD}
              fill="none"
              stroke="#6366f1"
              strokeDasharray="8 6"
              strokeWidth="4"
              className="opacity-60"
            />
          </svg>

          {/* Map Nodes Container */}
          <div className="relative z-10 w-full h-full">
            {mapNodes.map((lvl) => {
              const nodeClass = lvl.isBoss ? 'w-18 h-18 text-2xl' : 'w-13 h-13 text-base';
              
              return (
                <div
                  key={lvl.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group"
                  style={{ left: `${lvl.x}px`, top: `${lvl.y}px` }}
                  onClick={() => openLevelDetails(lvl)}
                >
                  {/* Star Display (only for normal nodes or completed boss nodes) */}
                  {!lvl.isBoss && (
                    <div className="flex gap-0.5 mb-1">
                      {[1, 2, 3].map((sIndex) => (
                        <Star
                          key={sIndex}
                          size={11}
                          className={`${
                            sIndex <= lvl.stars
                              ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]'
                              : 'text-indigo-900 fill-indigo-950/60'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Boss Indicator Header */}
                  {lvl.isBoss && (
                    <div className="flex items-center gap-1 mb-1.5 bg-rose-950/95 text-rose-300 px-2 py-0.5 font-headline font-bold text-[8px] uppercase rounded-full border border-rose-500/50 shadow-md">
                      <ShieldAlert size={9} /> Boss
                    </div>
                  )}

                  {/* Level Number Card */}
                  <motion.div
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.94 }}
                    className={`font-headline font-black rounded-2xl flex items-center justify-center border-2 shadow-lg transition-all ${nodeClass} ${
                      lvl.isLocked
                        ? 'bg-[#0f183b] text-violet-400/50 border-indigo-900/60'
                        : lvl.isBoss
                        ? 'bg-gradient-to-br from-rose-600 via-purple-700 to-indigo-800 text-white border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.45)]'
                        : lvl.stars > 0
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-700 text-white border-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.35)]'
                        : 'bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 border-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                    }`}
                  >
                    {lvl.isLocked ? (
                      <Lock size={lvl.isBoss ? 20 : 16} className="text-violet-400/60" />
                    ) : lvl.isBoss ? (
                      <span>🐉</span>
                    ) : (
                      <span>{lvl.id < 10 ? `0${lvl.id}` : lvl.id}</span>
                    )}
                  </motion.div>

                  {/* Name Tag */}
                  <span className={`font-headline font-bold text-[9px] mt-1.5 px-2 py-0.5 rounded-full border whitespace-nowrap group-hover:text-cyan-300 transition-colors ${
                    lvl.isBoss 
                      ? 'bg-rose-950/90 border-rose-500/40 text-rose-200' 
                      : 'bg-[#0f173b]/90 border-indigo-400/40 text-violet-200'
                  }`}>
                    {lvl.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Map Legend */}
      <div className="mt-3 flex items-center justify-between px-2 text-[11px] font-headline font-bold text-violet-300">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-500 border border-cyan-300" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-rose-600 border border-rose-400" />
          <span>Boss Stage</span>
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

      {/* Dynamic Boss Challenge Preview Modal */}
      <AnimatePresence>
        {selectedBossLevel && (
          <div className="fixed inset-0 z-50 bg-[#090f2b]/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="bg-gradient-to-b from-[#18265e] via-[#141f4d] to-[#0f173b] border-2 border-rose-500/75 rounded-2xl shadow-[0_10px_35px_rgba(244,63,94,0.35)] w-full max-w-sm p-6 relative flex flex-col gap-4 text-left"
            >
              <button
                className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-indigo-950/80 border border-indigo-400/40 text-violet-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                onClick={() => setSelectedBossLevel(null)}
              >
                <X size={16} />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-3xl">🐉</span>
                <div>
                  <span className="font-headline font-bold text-[10px] uppercase tracking-widest text-rose-400">
                    Boss Battle Challenge
                  </span>
                  <h2 className="font-headline font-black text-xl text-white leading-tight mt-0.5">
                    Stage {selectedBossLevel.id}: {selectedBossLevel.name}
                  </h2>
                </div>
              </div>

              <div className="w-full h-32 bg-gradient-to-tr from-rose-950 to-indigo-950 border border-rose-500/50 rounded-xl flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
                <span className="text-5xl animate-bounce">🐲</span>
                <span className="text-[10px] font-headline font-bold uppercase tracking-wider text-rose-300 mt-2 bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-500/50">
                  Guardian of floating crystals
                </span>
              </div>

              <p className="text-xs text-violet-200 font-medium leading-relaxed">
                Clear all match objectives in this Boss Stage to collect double experience, epic dragon aether fragments, and gold rewards!
              </p>

              <div className="flex flex-col gap-2 text-xs py-1.5 px-3 bg-[#0d1538] border border-indigo-500/40 rounded-xl">
                <div className="flex justify-between border-b border-indigo-500/25 pb-1">
                  <span className="font-headline font-bold text-[10px] uppercase text-violet-300">Objective Target</span>
                  <span className="font-headline font-black text-xs text-rose-400">
                    Match {selectedBossLevel.objectiveTarget} {selectedBossLevel.objectiveType}s
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="font-headline font-bold text-[10px] uppercase text-violet-300">Potential Rewards</span>
                  <span className="font-headline font-black text-xs text-amber-400">
                    💎 {selectedBossLevel.loot}
                  </span>
                </div>
              </div>

              <button
                className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-purple-700 to-indigo-800 hover:from-rose-500 hover:to-indigo-700 text-white font-headline font-black text-sm uppercase tracking-wider rounded-xl shadow-[0_4px_20px_rgba(244,63,94,0.4)] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 mt-1"
                onClick={() => launchLevel(selectedBossLevel.id)}
              >
                <Play size={16} className="fill-current" />
                Launch Boss Battle
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
