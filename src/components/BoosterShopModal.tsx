import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, AlertCircle, ShoppingBag } from 'lucide-react';
import { BOOSTER_SHOP_ITEMS, ShopItem } from '../data';
import { GameState } from '../types';
import { ConfirmationModal } from './ConfirmationModal';

interface BoosterShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onPurchase: (item: ShopItem) => void;
  onGoToEarnCoins?: () => void;
  triggerHaptic: (type?: any) => void;
}

export const BoosterShopModal: React.FC<BoosterShopModalProps> = ({
  isOpen,
  onClose,
  gameState,
  onPurchase,
  onGoToEarnCoins,
  triggerHaptic,
}) => {
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isInsufficientOpen, setIsInsufficientOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  

  const handleInitiateBuy = (item: ShopItem) => {
    triggerHaptic('click');
    setSelectedItem(item);
    if (gameState.coins < item.costCoins) {
      setIsInsufficientOpen(true);
    } else {
      setIsConfirmOpen(true);
    }
  };

  const handleConfirmPurchase = () => {
    if (!selectedItem || isProcessing) return;
    if (gameState.coins < selectedItem.costCoins) {
      setIsConfirmOpen(false);
      setIsInsufficientOpen(true);
      return;
    }

    setIsProcessing(true);
    triggerHaptic('booster');
    onPurchase(selectedItem);
    setIsConfirmOpen(false);
    setIsProcessing(false);
  };

  return (
    <AnimatePresence>
      
      
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#070c24]/85 backdrop-blur-md select-none touch-manipulation"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shop-modal-title"
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
              
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-black shadow-md">
                <ShoppingBag size={18} />
              
</div>
              
      <div className="flex items-center gap-1.5 flex-wrap">
                <h3 id="shop-modal-title" className="text-base sm:text-lg font-headline font-black uppercase text-white leading-none">
                  Booster Emporium
                </h3>
                <p className="text-[9px] text-indigo-300 mt-0.5">Equip mystical artifacts</p>
              
</div>
            
</div>

            
      <div className="flex items-center gap-2">
              
      <div className="flex items-center gap-1 bg-[#0b1433] px-2.5 py-1 rounded-xl border border-amber-400/50 text-xs font-headline font-black text-amber-300 shadow-inner">
                <span>🪙</span>
                <span>{gameState.coins.toLocaleString()}</span>
              
</div>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('click');
                  onClose();
                }}
                className="w-7 h-7 rounded-full bg-indigo-950/80 border border-indigo-400/40 text-violet-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                title="Close Emporium"
              >
                <X size={16} />
              </button>
            
</div>
          
</div>

          {/* Shop Items List */}
          
      <div className="flex-1 overflow-y-auto allow-scroll py-3 space-y-2.5 pr-0.5">
            {BOOSTER_SHOP_ITEMS.map((item) => {
              const canAfford = gameState.coins >= item.costCoins;
              const isBundle = item.type === 'bundle';

              return (
                
      <div
                  key={item.id}
                  className={`p-2.5 sm:p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isBundle
                      ? 'bg-gradient-to-r from-[#24174d] via-[#1a1b4d] to-[#12224d] border-amber-400/60 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                      : 'bg-[#11193b] border-indigo-400/40 hover:border-indigo-300'
                  }`}
                >
                  
      <div className="flex items-center gap-2.5 min-w-0">
                    
      <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border ${
                        isBundle
                          ? 'bg-gradient-to-br from-amber-400 to-pink-500 border-amber-300 text-2xl shadow-md'
                          : 'bg-[#0b1330] border-indigo-400/40'
                      }`}
                    >
                      {item.icon}
                    
</div>
                    
      <div className="min-w-0">
                      
      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-headline font-black text-xs sm:text-sm text-white truncate leading-none">
                          {item.name}
                        </h4>
                        {isBundle && (
                          <span className="bg-amber-400 text-slate-950 text-[8px] font-black uppercase px-1.5 py-0.2 rounded font-headline leading-none">
                            Save 20%
                          </span>
                        )}
                  
                      
</div>

                      <p className="text-[9px] sm:text-[10px] text-indigo-300 line-clamp-2 mt-0.5 leading-snug">
                        {item.description}
                      </p>
                    
</div>

                  
</div>


                  <button
                    type="button"
                    onClick={() => handleInitiateBuy(item)}
                    className={`shrink-0 px-3 py-1.5 sm:py-2 rounded-xl font-headline font-black text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-md ${
                      canAfford
                        ? isBundle
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 hover:brightness-110 shadow-[0_2px_10px_rgba(251,191,36,0.3)]'
                          : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:brightness-110 shadow-[0_2px_10px_rgba(34,211,238,0.3)]'
                        : 'bg-indigo-950 text-indigo-400 border border-indigo-500/30'
                    }`}
                  >
                    <span>🪙</span>
                    <span>{item.costCoins}</span>
                  </button>
                
</div>
              );
            })}
          
</div>

          {/* Footer note */}
          
      <div className="pt-2 border-t border-indigo-400/20 text-center shrink-0">
            <p className="text-[9px] text-indigo-300">
              ⚡ Boosters never expire and persist across all play sessions.
            </p>
          
</div>
        </motion.div>
      
</div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        title="Buy Booster?"
        message={`You are about to spend ${selectedItem?.costCoins.toLocaleString()} coins for ${selectedItem?.name}.`}
        confirmLabel={`Buy for ${selectedItem?.costCoins} 🪙`}
        cancelLabel="Cancel"
        onConfirm={handleConfirmPurchase}
        onCancel={() => setIsConfirmOpen(false)}
        isDestructive={false}
        icon={<Sparkles className="text-amber-400" size={24} />}
      />

      {/* Insufficient Coins Modal */}
      {isInsufficientOpen && (
        
      <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070c24]/90 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-b from-[#241530] via-[#1a133b] to-[#120f2e] border-2 border-amber-400/80 p-5 max-w-xs w-full text-center rounded-2xl shadow-[0_10px_35px_rgba(251,191,36,0.3)]"
          >
            
      <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 mx-auto mb-3">
              <AlertCircle size={24} />
            
</div>
            <h4 className="text-base font-headline font-black uppercase text-amber-300 mb-1">
              Not Enough Coins!
            </h4>
            <p className="text-xs text-violet-200 mb-3 leading-relaxed">
              You currently have <span className="font-bold text-amber-300">{gameState.coins.toLocaleString()} 🪙</span>, but{' '}
              <span className="font-bold text-white">{selectedItem?.name}</span> costs{' '}
              <span className="font-bold text-amber-300">{selectedItem?.costCoins.toLocaleString()} 🪙</span>.
            </p>

            
      <div className="flex flex-col gap-2">
              {onGoToEarnCoins && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('click');
                    setIsInsufficientOpen(false);
                    onClose();
                    onGoToEarnCoins();
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 rounded-xl font-headline text-xs font-black uppercase tracking-wider shadow-md hover:brightness-110 cursor-pointer"
                >                  Earn Coins via Quests
                </button>
              )}
        
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('click');
                  setIsInsufficientOpen(false);
                }}
                className="w-full py-2 bg-[#12193d] border border-indigo-400/40 rounded-xl font-headline text-xs font-bold uppercase text-indigo-300 hover:text-white cursor-pointer"
              >
                Close
              </button>
            
</div>
          </motion.div>
        
</div>


      )}
    </AnimatePresence>
  );
};
