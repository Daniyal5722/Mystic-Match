import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Target, Check, Award, Sparkles } from 'lucide-react';
import { GameState, Mission } from '../types';

interface MissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onClaimMission: (mission: Mission) => void;
  triggerHaptic: (type?: any) => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  isOpen,
  onClose,
  gameState,
  onClaimMission,
  triggerHaptic,
}) => {
  

  const missions = gameState.missions || [];

  return (
    <AnimatePresence>
      {isOpen && (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-[#070c24]/85 backdrop-blur-md select-none touch-manipulation"
        role="dialog"
        aria-modal="true"
        aria-labelledby="missions-modal-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            triggerHaptic('click');
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-full max-w-sm bg-gradient-to-b from-[#18265e] via-[#141f4d] to-[#0f173b] border-2 border-indigo-400/70 p-4 sm:p-5 shadow-[0_12px_45px_rgba(59,130,246,0.35)] rounded-2xl text-white max-h-[90dvh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-indigo-400/30 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 flex items-center justify-center font-black shadow-md">
                <Target size={18} />
              </div>
              <div>
                <h3 id="missions-modal-title" className="text-base sm:text-lg font-headline font-black uppercase text-white leading-none">
                  Adventurer Quests
                </h3>
                <p className="text-[9px] text-indigo-300 mt-0.5">Earn Coins &amp; Power Boosters</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('click');
                onClose();
              }}
              className="w-7 h-7 rounded-full bg-indigo-950/80 border border-indigo-400/40 text-violet-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              title="Close Quests"
            >
              <X size={16} />
            </button>
          </div>

          {/* Mission Cards */}
          <div className="flex-1 overflow-y-auto allow-scroll py-3 space-y-2.5 pr-0.5">
            {missions.map((mission) => {
              const progressPct = Math.min(100, Math.round((mission.current / mission.target) * 100));
              const canClaim = mission.completed && !mission.claimed;

              return (
                <div
                  key={mission.id}
                  className={`p-3 rounded-xl border transition-all ${
                    mission.claimed
                      ? 'bg-[#0e1633] border-emerald-500/30 opacity-75'
                      : canClaim
                      ? 'bg-gradient-to-r from-[#241b4a] to-[#171f47] border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.25)]'
                      : 'bg-[#11193b] border-indigo-400/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <h4 className="font-headline font-black text-xs sm:text-sm text-white leading-tight">
                        {mission.title}
                      </h4>
                      <p className="text-[9px] text-indigo-300 leading-snug mt-0.5">
                        {mission.description}
                      </p>
                    </div>

                    {/* Reward badge */}
                    <div className="flex items-center gap-1 shrink-0 bg-[#0c1433] px-2 py-0.5 rounded-lg border border-amber-400/40 text-[9px] font-headline font-black text-amber-300">
                      <span>🪙 +{mission.rewardCoins}</span>
                      {mission.rewardBooster && (
                        <span>+1 {mission.rewardBooster.type === 'hint' ? '💡' : mission.rewardBooster.type === 'shuffle' ? '🔄' : mission.rewardBooster.type === 'undo' ? '⏪' : mission.rewardBooster.type === 'hammer' ? '🔨' : '🌈'}</span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[#0a1029] h-2 rounded-full overflow-hidden border border-indigo-500/30 my-2">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-headline font-bold text-cyan-300">
                      Progress: {Math.min(mission.current, mission.target)} / {mission.target}
                    </span>

                    {mission.claimed ? (
                      <span className="text-[9px] font-headline font-bold text-emerald-400 flex items-center gap-1">
                        <Check size={12} /> Claimed
                      </span>
                    ) : canClaim ? (
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('win');
                          onClaimMission(mission);
                        }}
                        className="px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 rounded-lg font-headline font-black text-[10px] uppercase tracking-wider hover:brightness-110 shadow-md cursor-pointer active:scale-95"
                      >
                        Claim Reward
                      </button>
                    ) : (
                      <span className="text-[9px] font-headline text-indigo-300">In Progress</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="pt-2 border-t border-indigo-400/20 text-center shrink-0">
            <p className="text-[9px] text-indigo-300">
              ⚔️ Complete adventures to unlock ongoing coin and booster bounties.
            </p>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
