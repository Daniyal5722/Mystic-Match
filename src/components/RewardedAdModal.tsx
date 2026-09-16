import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Film, Sparkles, CheckCircle2 } from 'lucide-react';
import { BoosterType } from '../types';

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardGranted: (boosterType: BoosterType) => void;
  triggerHaptic: (type?: any) => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  isOpen,
  onClose,
  onRewardGranted,
  triggerHaptic,
}) => {
  const [countdown, setCountdown] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [awardedBooster, setAwardedBooster] = useState<BoosterType>('hammer');

  useEffect(() => {
    if (isOpen) {
      setCountdown(3);
      setIsPlaying(false);
      setCompleted(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isPlaying || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          const boosters: BoosterType[] = ['hint', 'shuffle', 'undo', 'hammer', 'rainbow'];
          const picked = boosters[Math.floor(Math.random() * boosters.length)];
          setAwardedBooster(picked);
          setCompleted(true);
          setIsPlaying(false);
          triggerHaptic('win');
          onRewardGranted(picked);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, countdown, onRewardGranted, triggerHaptic]);

  

  return (
    <AnimatePresence>
      {isOpen && (
      

        <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070c24]/90 backdrop-blur-md select-none touch-manipulation"
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gradient-to-b from-[#19275e] via-[#141f4d] to-[#0f173b] border-2 border-indigo-400/80 p-5 max-w-xs w-full text-center rounded-2xl shadow-[0_12px_45px_rgba(59,130,246,0.4)] relative"
        >
          <button
            type="button"
            onClick={() => {
              triggerHaptic('click');
              onClose();
            }}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-indigo-950 border border-indigo-400/40 text-violet-300 hover:text-white flex items-center justify-center"
          >
            <X size={15} />
          </button>

          

        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 border border-cyan-300 flex items-center justify-center mx-auto mb-3 text-white shadow-md">
            <Film size={24} />
          </div>

          <h3 className="text-base font-headline font-black uppercase text-white mb-1">
            Mystic Reel Broadcast
          </h3>
          <p className="text-xs text-indigo-300 mb-4">
            Watch a short mystical simulation to receive a free booster!
          </p>

          {completed ? (
            

        <div className="bg-[#0b1433] p-3 rounded-xl border border-emerald-400/50 mb-4">
              

        <div className="flex items-center justify-center gap-1 text-emerald-400 mb-1 font-headline font-bold text-xs">
                <CheckCircle2 size={16} /> Reward Granted!
              </div>
              <p className="text-xs text-white font-headline font-black">
                +1 {awardedBooster.toUpperCase()} Booster
              </p>
            </div>
          ) : isPlaying ? (
            

        <div className="bg-[#0b1433] p-4 rounded-xl border border-indigo-400/50 mb-4">
              

        <div className="text-2xl font-headline font-black text-amber-300 mb-1 animate-pulse">
                {countdown}s
              </div>
              <p className="text-[10px] text-cyan-300 font-headline uppercase tracking-wider">
                Gathering magical energies...
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('click');
                setIsPlaying(true);
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 rounded-xl font-headline text-xs font-black uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 cursor-pointer mb-2"
            >
              Watch Simulation (3s)
            </button>
          )}

          {completed && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('click');
                onClose();
              }}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 rounded-xl font-headline text-xs font-black uppercase tracking-wider shadow cursor-pointer"
            >
              Collect &amp; Return
            </button>
          )}
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
