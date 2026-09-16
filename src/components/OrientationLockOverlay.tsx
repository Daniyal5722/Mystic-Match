import React, { useEffect, useState } from 'react';
import { RotateCcw, Smartphone } from 'lucide-react';

interface OrientationLockOverlayProps {
  onUnlockAttempt?: () => void;
}

export const OrientationLockOverlay: React.FC<OrientationLockOverlayProps> = ({ onUnlockAttempt }) => {
  const [canLockScreen, setCanLockScreen] = useState(false);
  const [isAttemptingLock, setIsAttemptingLock] = useState(false);

  useEffect(() => {
    // Check if Screen Orientation API lock method is available
    if (typeof window !== 'undefined' && 'screen' in window && 'orientation' in window.screen) {
      const orientation = window.screen.orientation as any;
      if (typeof orientation.lock === 'function') {
        setCanLockScreen(true);
      }
    }
  }, []);

  const handleForcePortraitClick = async () => {
    setIsAttemptingLock(true);
    try {
      if (typeof window !== 'undefined' && 'screen' in window && 'orientation' in window.screen) {
        const orientation = window.screen.orientation as any;
        if (typeof orientation.lock === 'function') {
          // Some browsers require fullscreen before orientation lock
          if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
            try {
              await document.documentElement.requestFullscreen();
            } catch {
              // Fullscreen might be blocked in iframes, proceed with lock attempt
            }
          }
          await orientation.lock('portrait');
        }
      }
    } catch (err) {
      console.warn('Screen orientation lock triggered with notification:', err);
    } finally {
      setIsAttemptingLock(false);
      if (onUnlockAttempt) onUnlockAttempt();
    }
  };

  return (
    <div
      id="orientation-lock-layer"
      className="orientation-lock-overlay"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="orientation-title"
      aria-describedby="orientation-desc"
    >
      <div className="orientation-card">
        {/* Animated Rotating Phone Device Graphic */}
        <div className="orientation-icon-container">
          <div className="orientation-phone-anim">
            <Smartphone className="w-16 h-16 sm:w-20 sm:h-20 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.7)]" />
          </div>
          <div className="orientation-rotation-arrow">
            <RotateCcw className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)] animate-spin-slow" />
          </div>
        </div>

        {/* Informative Guidance Content */}
        <div className="flex flex-col items-center text-center gap-1.5 sm:gap-2 max-w-sm">
          <span className="font-headline font-bold text-[10px] sm:text-[11px] uppercase tracking-widest text-cyan-300 bg-indigo-950/90 px-3 py-1 rounded-full border border-cyan-400/40">
            Portrait Mode Required
          </span>

          <h2
            id="orientation-title"
            className="font-headline font-black text-xl sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-cyan-300 uppercase tracking-tight"
          >
            Please Rotate Your Device
          </h2>

          <p
            id="orientation-desc"
            className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed font-body"
          >
            Mystic Match is optimized strictly for portrait play to ensure an authentic arcade experience and prevent layout clipping.
          </p>
        </div>

        {/* Action Button for Direct Screen Orientation Lock / Fullscreen Attempt */}
        {canLockScreen && (
          <button
            type="button"
            onClick={handleForcePortraitClick}
            disabled={isAttemptingLock}
            className="mt-1 sm:mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-headline font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(34,211,238,0.4)] border border-cyan-300/40 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4 animate-spin-once" />
            <span>{isAttemptingLock ? 'Locking Portrait...' : 'Lock to Portrait'}</span>
          </button>
        )}

        <div className="text-[10px] text-violet-300/70 tracking-wide font-headline uppercase">
          Tip: Disable orientation lock in device quick settings if needed
        </div>
      </div>
    </div>
  );
};
