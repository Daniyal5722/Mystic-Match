import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Check, Gift, Sparkles } from 'lucide-react';
import { DAILY_LOGIN_REWARDS } from '../data';
import { GameState, DailyLoginReward } from '../types';

interface DailyLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onClaimDay: (reward: DailyLoginReward) => void;
  triggerHaptic: (type?: any) => void;
}

export const DailyLoginModal: React.FC<DailyLoginModalProps> = ({
  isOpen,
  onClose,
  gameState,
  onClaimDay,
  triggerHaptic,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const isClaimedToday = gameState.lastClaimedDaily === todayStr;
  const currentDayCycle = gameState.dailyLoginDay || 1; // 1 to 7

  const todayReward = DAILY_LOGIN_REWARDS.find((r) => r.day === currentDayCycle) || DAILY_LOGIN_REWARDS[0];

  const handleClaim = () => {
    if (isClaimedToday) return;
    triggerHaptic('win');
    onClaimDay(todayReward);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#070c24]/85 backdrop-blur-md select-none touch-manipulation"
        role="dialog"
        aria-modal="true"
        aria-labelledby="daily-login-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-full max-w-sm bg-gradient-to-b from-[#18265e] via-[#141f4d] to-[#0f173b] border-2 border-indigo-400/70 p-4 sm:p-5 shadow-[0_12px_45px_rgba(59,130,246,0.35)] rounded-2xl text-white max-h-[90dvh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-indigo-400/30 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black shadow-md border border-cyan-300">
                <Calendar size={18} />
              </div>
              <div>
                <h3 id="daily-login-title" className="text-base sm:text-lg font-headline font-black uppercase text-white leading-none">
                  Daily Login Calendar
                </h3>
                <p className="text-[9px] text-indigo-300 mt-0.5">7-Day Journey Cycle</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('click');
                onClose();
              }}
              className="w-7 h-7 rounded-full bg-indigo-950/80 border border-indigo-400/40 text-violet-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              title="Close Calendar"
            >
              <X size={16} />
            </button>
          </div>

          {/* 7 Days Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 my-3 overflow-y-auto pr-0.5">
            {DAILY_LOGIN_REWARDS.map((reward) => {
              const isPast = reward.day < currentDayCycle || (reward.day === currentDayCycle && isClaimedToday);
              const isToday = reward.day === currentDayCycle && !isClaimedToday;
              const isGrandDay = reward.day === 7;

              return (
                <div
                  key={reward.day}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-between text-center relative transition-all min-h-[84px] ${
                    isGrandDay ? 'col-span-3 sm:col-span-2' : ''
                  } ${
                    isToday
                      ? 'bg-gradient-to-b from-[#2a1e4d] to-[#1a153b] border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                      : isPast
                      ? 'bg-[#0e1633] border-emerald-500/40 opacity-80'
                      : 'bg-[#11193b] border-indigo-400/30'
                  }`}
                >
                  <div className="w-full flex items-center justify-between text-[8px] font-headline font-black uppercase">
                    <span className={isToday ? 'text-amber-300' : 'text-indigo-300'}>
                      Day {reward.day}
                    </span>
                    {isPast && (
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/40">
                        <Check size={10} />
                      </span>
                    )}
                  </div>

                  <div className="my-1 text-xl sm:text-2xl">
                    {reward.day === 1 && '🪙'}
                    {reward.day === 2 && '💡'}
                    {reward.day === 3 && '💰'}
                    {reward.day === 4 && '🔄'}
                    {reward.day === 5 && '👑'}
                    {reward.day === 6 && '🔨'}
                    {reward.day === 7 && '🌈'}
                  </div>

                  <span className="text-[8px] sm:text-[9px] font-headline font-bold text-slate-200 line-clamp-1 leading-tight">
                    {reward.rewardDescription}
                  </span>

                  {isToday && (
                    <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 font-headline font-black text-[7px] uppercase px-1.5 py-0.2 rounded-full shadow">
                      Today!
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Button */}
          <div className="pt-2 border-t border-indigo-400/20 shrink-0">
            {isClaimedToday ? (
              <div className="text-center py-2 bg-[#0c1433] rounded-xl border border-indigo-500/30">
                <p className="text-xs font-headline font-bold text-emerald-300 flex items-center justify-center gap-1.5">
                  <Check size={14} /> Today&apos;s Gift Claimed
                </p>
                <p className="text-[9px] text-indigo-300 mt-0.5">
                  Next reward unlocks tomorrow!
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleClaim}
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 rounded-xl font-headline text-xs sm:text-sm font-black uppercase tracking-wider shadow-[0_4px_18px_rgba(251,191,36,0.4)] hover:brightness-110 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Gift size={16} /> Claim Day {currentDayCycle} Reward
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
