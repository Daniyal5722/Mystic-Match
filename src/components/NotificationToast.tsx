import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Bell, X } from 'lucide-react';

interface NotificationToastProps {
  title: string;
  message: string;
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ title, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 inset-x-4 z-[90] flex justify-center pointer-events-none select-none">
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="w-full max-w-sm bg-primary border-3 border-primary-fixed text-white p-4 shadow-[4px_4px_0px_#ffcc00] flex items-start gap-3 pointer-events-auto"
      >
        <div className="w-8 h-8 rounded bg-primary-fixed-dim/20 flex items-center justify-center text-primary-fixed mt-0.5 border border-primary-fixed/40">
          <Bell size={16} className="text-primary-fixed animate-swing" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-headline font-black text-xs uppercase tracking-wider text-primary-fixed leading-tight">
            {title}
          </h4>
          <p className="text-[10px] text-white/95 leading-normal mt-0.5 font-medium">
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white hover:bg-white/10 rounded p-1 transition-colors"
        >
          <X size={14} />
        </button>
      </motion.div>
    </div>
  );
};
