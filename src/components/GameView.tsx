import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Zap,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Flame,
  Award,
  Star,
  X,
  Volume2
} from 'lucide-react';
import { GameState } from '../types';

interface GameViewProps {
  gameState: GameState;
  setTab: (tab: 'home' | 'map' | 'game' | 'settings') => void;
  triggerHaptic: () => void;
  triggerPushNotification: (title: string, msg: string) => void;
  onGameEnd: (won: boolean, score: number) => void;
}

type GemType = 'ruby' | 'sapphire' | 'emerald' | 'topaz' | 'amethyst' | 'prism';

interface BoardGem {
  id: string;
  type: GemType;
  row: number;
  col: number;
  isMatched?: boolean;
  isNew?: boolean;
}

const BOARD_SIZE = 8;
const GEM_TYPES: GemType[] = ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst'];

const GEM_STYLES: Record<
  GemType,
  { bg: string; icon: string; text: string; shadow: string; glow: string; border: string }
> = {
  ruby: {
    bg: 'from-rose-500 via-red-500 to-rose-700',
    icon: '❤️',
    text: 'text-white',
    shadow: 'shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),0_4px_12px_rgba(244,63,94,0.6)]',
    glow: 'drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]',
    border: 'border-rose-300/70',
  },
  sapphire: {
    bg: 'from-sky-400 via-blue-500 to-indigo-600',
    icon: '💎',
    text: 'text-white',
    shadow: 'shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),0_4px_12px_rgba(59,130,246,0.6)]',
    glow: 'drop-shadow-[0_0_8px_rgba(59,130,246,0.9)]',
    border: 'border-sky-200/80',
  },
  emerald: {
    bg: 'from-emerald-300 via-emerald-500 to-teal-700',
    icon: '🟢',
    text: 'text-white',
    shadow: 'shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),0_4px_12px_rgba(16,185,129,0.6)]',
    glow: 'drop-shadow-[0_0_8px_rgba(16,185,129,0.9)]',
    border: 'border-emerald-200/80',
  },
  topaz: {
    bg: 'from-amber-300 via-yellow-400 to-amber-600',
    icon: '⭐',
    text: 'text-white',
    shadow: 'shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_4px_12px_rgba(245,158,11,0.6)]',
    glow: 'drop-shadow-[0_0_8px_rgba(245,158,11,0.9)]',
    border: 'border-yellow-100/90',
  },
  amethyst: {
    bg: 'from-purple-400 via-violet-600 to-indigo-800',
    icon: '🔺',
    text: 'text-white',
    shadow: 'shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),0_4px_12px_rgba(168,85,247,0.6)]',
    glow: 'drop-shadow-[0_0_8px_rgba(168,85,247,0.9)]',
    border: 'border-purple-200/80',
  },
  prism: {
    bg: 'from-pink-400 via-cyan-400 to-amber-300',
    icon: '✨',
    text: 'text-white',
    shadow: 'shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_4px_16px_rgba(236,72,153,0.7)]',
    glow: 'drop-shadow-[0_0_12px_rgba(236,72,153,1)]',
    border: 'border-pink-100/90',
  },
};

const getRandomGemType = (): GemType => {
  return GEM_TYPES[Math.floor(Math.random() * GEM_TYPES.length)];
};

const WinParticleCanvas: React.FC<{ active: boolean }> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const colors = ['#fbbf24', '#f59e0b', '#8b5cf6', '#a855f7', '#38bdf8', '#22d3ee', '#ec4899', '#ffffff'];
    const particles = Array.from({ length: 80 }, () => ({
      x: width / 2 + (Math.random() - 0.5) * 80,
      y: height / 2 + (Math.random() - 0.5) * 80,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.7) * 16,
      size: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      decay: Math.random() * 0.012 + 0.006,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      shape: Math.random() > 0.5 ? 'circle' : 'star',
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      let aliveCount = 0;

      for (let p of particles) {
        if (p.alpha <= 0) continue;
        aliveCount++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // Gravity
        p.vx *= 0.98;
        p.alpha -= p.decay;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;

        if (p.shape === 'star') {
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            ctx.lineTo(Math.cos(((18 + i * 72) * Math.PI) / 180) * p.size, -Math.sin(((18 + i * 72) * Math.PI) / 180) * p.size);
            ctx.lineTo(Math.cos(((54 + i * 72) * Math.PI) / 180) * (p.size / 2), -Math.sin(((54 + i * 72) * Math.PI) / 180) * (p.size / 2));
          }
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      if (aliveCount > 0) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[110] w-full h-full"
    />
  );
};

export const GameView: React.FC<GameViewProps> = ({
  gameState,
  setTab,
  triggerHaptic,
  triggerPushNotification,
  onGameEnd,
}) => {
  const [board, setBoard] = useState<BoardGem[][]>([]);
  const [selectedGem, setSelectedGem] = useState<BoardGem | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [movesLeft, setMovesLeft] = useState<number>(25);
  const [sapphiresCollected, setSapphiresCollected] = useState<number>(0);
  const [gameResult, setGameResult] = useState<'won' | 'lost' | null>(null);
  const [comboText, setComboText] = useState<string | null>(null);

  // Power Boosters State
  const [boosterActive, setBoosterActive] = useState<'hammer' | 'shuffle' | 'rainbow' | null>(null);
  const [boostersCount, setBoostersCount] = useState({
    hammer: 3,
    shuffle: 2,
    rainbow: 1,
  });

  const currentLevelId = gameState.currentPlayingLevelId || 1;

  // Initialize Board without initial matches
  const initBoard = useCallback(() => {
    let newBoard: BoardGem[][] = [];
    let hasMatches = true;

    while (hasMatches) {
      newBoard = [];
      for (let r = 0; r < BOARD_SIZE; r++) {
        const row: BoardGem[] = [];
        for (let c = 0; c < BOARD_SIZE; c++) {
          row.push({
            id: `${r}-${c}-${Math.random().toString(36).substring(2, 6)}`,
            type: getRandomGemType(),
            row: r,
            col: c,
          });
        }
        newBoard.push(row);
      }

      const initialMatches = findAndMarkMatches(newBoard);
      if (initialMatches.length === 0) {
        hasMatches = false;
      }
    }

    setBoard(newBoard);
    setSelectedGem(null);
    setScore(0);
    setMovesLeft(25);
    setSapphiresCollected(0);
    setGameResult(null);
    setComboText(null);
  }, []);

  useEffect(() => {
    initBoard();
  }, [initBoard]);

  const findAndMarkMatches = (currentBoard: BoardGem[][]): { row: number; col: number }[] => {
    const matchedCoords: Set<string> = new Set();

    // Horizontal check
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE - 2; c++) {
        const type = currentBoard[r][c].type;
        if (
          type &&
          currentBoard[r][c + 1].type === type &&
          currentBoard[r][c + 2].type === type
        ) {
          matchedCoords.add(`${r},${c}`);
          matchedCoords.add(`${r},${c + 1}`);
          matchedCoords.add(`${r},${c + 2}`);
        }
      }
    }

    // Vertical check
    for (let c = 0; c < BOARD_SIZE; c++) {
      for (let r = 0; r < BOARD_SIZE - 2; r++) {
        const type = currentBoard[r][c].type;
        if (
          type &&
          currentBoard[r + 1][c].type === type &&
          currentBoard[r + 2][c].type === type
        ) {
          matchedCoords.add(`${r},${c}`);
          matchedCoords.add(`${r + 1},${c}`);
          matchedCoords.add(`${r + 2},${c}`);
        }
      }
    }

    return Array.from(matchedCoords).map((coord) => {
      const [r, c] = coord.split(',').map(Number);
      return { row: r, col: c };
    });
  };

  const handleGemClick = (gem: BoardGem) => {
    if (isProcessing || gameResult) return;

    // Handle Active Hammer Booster
    if (boosterActive === 'hammer') {
      triggerHammerSmash(gem);
      return;
    }

    triggerHaptic();

    if (!selectedGem) {
      setSelectedGem(gem);
      return;
    }

    if (selectedGem.id === gem.id) {
      setSelectedGem(null);
      return;
    }

    // Check Adjacency
    const isAdjacent =
      (Math.abs(selectedGem.row - gem.row) === 1 && selectedGem.col === gem.col) ||
      (Math.abs(selectedGem.col - gem.col) === 1 && selectedGem.row === gem.row);

    if (isAdjacent) {
      swapGems(selectedGem, gem);
    } else {
      setSelectedGem(gem);
    }
  };

  const swapGems = (gem1: BoardGem, gem2: BoardGem) => {
    setIsProcessing(true);
    triggerHaptic();

    const newBoard = board.map((row) => row.map((g) => ({ ...g })));
    const tempType = newBoard[gem1.row][gem1.col].type;
    newBoard[gem1.row][gem1.col].type = newBoard[gem2.row][gem2.col].type;
    newBoard[gem2.row][gem2.col].type = tempType;

    const matches = findAndMarkMatches(newBoard);

    if (matches.length > 0) {
      setBoard(newBoard);
      setSelectedGem(null);
      const nextMoves = movesLeft - 1;
      setMovesLeft(nextMoves);

      processMatches(newBoard, matches, nextMoves);
    } else {
      // Revert swap
      setBoard(newBoard);
      setTimeout(() => {
        const revertBoard = board.map((row) => row.map((g) => ({ ...g })));
        setBoard(revertBoard);
        setSelectedGem(null);
        setIsProcessing(false);
      }, 250);
    }
  };

  const processMatches = (
    currentBoard: BoardGem[][],
    matched: { row: number; col: number }[],
    remainingMoves?: number
  ) => {
    let sapphiresFound = 0;
    const nextBoard = currentBoard.map((row) => row.map((g) => ({ ...g })));

    matched.forEach(({ row, col }) => {
      if (nextBoard[row][col].type === 'sapphire') {
        sapphiresFound++;
      }
      nextBoard[row][col].isMatched = true;
    });

    const matchScore = matched.length * 50;
    const nextScore = score + matchScore;
    const nextSapphiresCount = sapphiresCollected + sapphiresFound;

    setScore(nextScore);
    setSapphiresCollected(nextSapphiresCount);

    // Check Win Condition (Objective: 40 sapphires)
    if (nextSapphiresCount >= 40) {
      setGameResult('won');
      onGameEnd(true, nextScore);
      triggerPushNotification('Stage Clear!', `You collected 40 sapphires! Score: ${nextScore}`);
    } else if (remainingMoves !== undefined && remainingMoves <= 0) {
      setGameResult('lost');
      onGameEnd(false, nextScore);
      triggerPushNotification('Game Over', 'You ran out of moves! Try again.');
    }

    // Display match combo banner
    if (matched.length >= 5) {
      setComboText('FANTASY BURST!');
    } else if (matched.length === 4) {
      setComboText('SUPER COMBO!');
    } else {
      setComboText('MATCH!');
    }

    setBoard(nextBoard);

    setTimeout(() => {
      setComboText(null);
      applyGravityAndFill(nextBoard);
    }, 380);
  };

  const applyGravityAndFill = (currentBoard: BoardGem[][]) => {
    const nextBoard = currentBoard.map((row) => row.map((g) => ({ ...g })));

    // Gravity pull down
    for (let c = 0; c < BOARD_SIZE; c++) {
      let emptyRow = BOARD_SIZE - 1;
      for (let r = BOARD_SIZE - 1; r >= 0; r--) {
        if (!nextBoard[r][c].isMatched) {
          nextBoard[emptyRow][c].type = nextBoard[r][c].type;
          nextBoard[emptyRow][c].isMatched = false;
          emptyRow--;
        }
      }
      // Fill from top with random gems
      for (let r = emptyRow; r >= 0; r--) {
        nextBoard[r][c].type = getRandomGemType();
        nextBoard[r][c].isMatched = false;
        nextBoard[r][c].isNew = true;
      }
    }

    setBoard(nextBoard);

    setTimeout(() => {
      const cascadeMatches = findAndMarkMatches(nextBoard);
      if (cascadeMatches.length > 0) {
        triggerHaptic();
        processMatches(nextBoard, cascadeMatches);
      } else {
        setIsProcessing(false);
      }
    }, 280);
  };

  const activateBooster = (type: 'hammer' | 'shuffle' | 'rainbow') => {
    triggerHaptic();

    if (type === 'hammer') {
      if (boostersCount.hammer <= 0) return;
      setBoosterActive(boosterActive === 'hammer' ? null : 'hammer');
    }

    if (type === 'shuffle') {
      if (boostersCount.shuffle <= 0 || isProcessing) return;
      setBoostersCount((prev) => ({ ...prev, shuffle: prev.shuffle - 1 }));

      const nextBoard = board.map((row) =>
        row.map((g) => ({
          ...g,
          type: getRandomGemType(),
          isNew: true,
        }))
      );
      setBoard(nextBoard);
      setComboText('SHUFFLED!');
      setTimeout(() => setComboText(null), 700);
    }

    if (type === 'rainbow') {
      if (boostersCount.rainbow <= 0 || isProcessing) return;
      setBoostersCount((prev) => ({ ...prev, rainbow: prev.rainbow - 1 }));

      // Turn 4 random gems into sapphires
      const nextBoard = board.map((row) => row.map((g) => ({ ...g })));
      for (let i = 0; i < 4; i++) {
        const r = Math.floor(Math.random() * BOARD_SIZE);
        const c = Math.floor(Math.random() * BOARD_SIZE);
        nextBoard[r][c].type = 'sapphire';
      }
      setBoard(nextBoard);
      setComboText('RAINBOW SURGE!');
      setTimeout(() => setComboText(null), 700);
    }
  };

  const triggerHammerSmash = (gem: BoardGem) => {
    setBoosterActive(null);
    setBoostersCount((prev) => ({ ...prev, hammer: prev.hammer - 1 }));
    triggerHaptic();

    const nextBoard = board.map((row) => row.map((g) => ({ ...g })));
    nextBoard[gem.row][gem.col].isMatched = true;

    setComboText('SMASH!');
    setBoard(nextBoard);

    setTimeout(() => {
      setComboText(null);
      if (gem.type === 'sapphire') {
        setSapphiresCollected((s) => s + 1);
      }
      setScore((s) => s + 100);
      applyGravityAndFill(nextBoard);
    }, 380);
  };

  return (
    <div className="flex flex-col w-full select-none relative z-10 pb-6 text-white">
      {/* Header back navigation */}
      <div className="flex items-center justify-between mb-3.5">
        <button
          onClick={() => {
            triggerHaptic();
            setTab('map');
          }}
          className="flex items-center gap-1.5 font-headline font-bold text-xs uppercase text-cyan-300 hover:text-white transition-colors cursor-pointer bg-[#121d4a] px-3 py-1.5 rounded-lg border border-indigo-400/40"
        >
          <ArrowLeft size={15} /> Map
        </button>

        <h2 className="font-headline font-black text-sm uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-cyan-300">
          Stage {currentLevelId}: Arena
        </h2>

        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 border border-cyan-300 flex items-center justify-center text-white text-[10px] font-headline font-bold uppercase shadow-sm">
          {gameState.name ? gameState.name.slice(0, 2).toUpperCase() : 'P1'}
        </div>
      </div>

      {/* Top Objective and Stats Row */}
      <div className="flex flex-col gap-2.5 mb-4">
        {/* Objective Banner */}
        <div className="card-glowing-cyan p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-cyan-950/80 rounded-lg flex items-center justify-center font-headline font-black text-xl border border-cyan-400 text-white shadow-sm">
              💎
            </div>
            <div>
              <p className="text-[9px] font-headline uppercase tracking-wider text-cyan-300/80 leading-none">
                Mission Objective
              </p>
              <p className="text-xs font-headline font-black text-cyan-200 leading-none mt-1">
                Collect 40 Sapphires
              </p>
            </div>
          </div>
          <div className="bg-[#0b1b3b] text-cyan-300 px-3 py-1 rounded-lg font-headline font-black text-sm border border-cyan-400/60 shadow-inner">
            <span>{sapphiresCollected}</span>/40
          </div>
        </div>

        {/* Stats Metrics (Score & Moves Left) */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-gradient-to-b from-[#2a1e0b] to-[#1a1306] p-2.5 border-2 border-amber-400/60 rounded-xl flex items-center justify-between shadow-[0_2px_12px_rgba(251,191,36,0.2)]">
            <div>
              <p className="text-[9px] font-headline uppercase tracking-wider text-amber-300/80 leading-none">
                Score
              </p>
              <h2 className="text-xl font-headline font-black text-amber-300 leading-none mt-1">
                {score.toLocaleString()}
              </h2>
            </div>
            <Trophy size={20} className="text-amber-400" />
          </div>

          <div className="bg-gradient-to-b from-[#0c244c] to-[#081733] p-2.5 border-2 border-cyan-400/60 rounded-xl flex items-center justify-between shadow-[0_2px_12px_rgba(34,211,238,0.2)]">
            <div>
              <p className="text-[9px] font-headline uppercase tracking-wider text-cyan-300/80 leading-none">
                Moves Left
              </p>
              <h2
                className={`text-xl font-headline font-black leading-none mt-1 ${
                  movesLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-cyan-300'
                }`}
              >
                {movesLeft}
              </h2>
            </div>
            <Zap size={20} className="text-cyan-400" />
          </div>
        </div>
      </div>

      {/* Main 8x8 Board Layer */}
      <div className="relative w-full aspect-square bg-gradient-to-b from-[#141f4d] via-[#111942] to-[#0c1333] border-2 border-indigo-400/60 rounded-2xl shadow-[0_8px_30px_rgba(59,130,246,0.3)] p-2 flex items-center justify-center overflow-hidden">
        {/* Dynamic Game grid */}
        <div id="game-board" className="grid grid-cols-8 grid-rows-8 w-full h-full gap-1">
          {board.map((row) =>
            row.map((gem) => {
              const style = GEM_STYLES[gem.type] || GEM_STYLES.ruby;
              const isSelected = selectedGem?.id === gem.id;

              return (
                <div
                  key={gem.id}
                  onClick={() => handleGemClick(gem)}
                  className="relative w-full h-full aspect-square flex items-center justify-center"
                >
                  <AnimatePresence>
                    {!gem.isMatched && (
                      <motion.div
                        layout
                        initial={gem.isNew ? { scale: 0.2, opacity: 0 } : false}
                        animate={{ scale: isSelected ? 0.9 : 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className={`w-full h-full rounded-xl bg-gradient-to-b ${style.bg} ${style.shadow} cursor-pointer relative flex items-center justify-center border ${style.border} overflow-hidden ${
                          isSelected ? 'ring-3 ring-cyan-300 z-10 scale-95' : ''
                        }`}
                      >
                        {/* Shimmer/Gloss effect */}
                        <div className="absolute top-0.5 left-1 w-2/3 h-1/3 bg-white/35 rounded-full blur-[1px] transform -rotate-12 pointer-events-none" />

                        {/* Gem Icon */}
                        <span className="text-base sm:text-lg select-none drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.5)]">
                          {style.icon}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

        {/* Splash text overlay for matches */}
        <AnimatePresence>
          {comboText && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 10 }}
              animate={{ scale: 1.1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -10 }}
              className="absolute pointer-events-none z-30 font-headline font-black text-xl text-amber-300 bg-[#0e163b]/95 px-4 py-1.5 rounded-xl border-2 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.6)] uppercase"
            >
              {comboText}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Helper text prompt */}
      <div className="text-center my-2.5">
        <p className="text-[10px] font-headline uppercase tracking-widest text-cyan-300 font-bold leading-none">
          {boosterActive === 'hammer'
            ? '⚡ HAMMER ACTIVE — Tap any crystal to smash it!'
            : 'Tap adjacent crystals to form combos!'}
        </p>
      </div>

      {/* Boosters Row */}
      <div className="mt-1">
        <p className="text-[10px] font-headline font-bold uppercase tracking-wider mb-2 text-violet-300">
          Power Boosters
        </p>
        <div className="grid grid-cols-3 gap-2.5">
          {/* Hammer */}
          <button
            onClick={() => activateBooster('hammer')}
            disabled={boostersCount.hammer <= 0 || isProcessing}
            className={`flex flex-col items-center justify-center p-2 rounded-xl bg-[#121c47] border-2 transition-all cursor-pointer ${
              boosterActive === 'hammer'
                ? 'border-cyan-400 bg-cyan-950/50 shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                : 'border-indigo-400/40 hover:border-indigo-300'
            } disabled:opacity-50`}
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/50 flex items-center justify-center mb-1 text-lg">
              🔨
            </div>
            <span className="font-headline font-bold text-[10px] uppercase text-white">Hammer</span>
            <span className="text-[9px] text-amber-300 font-bold">{boostersCount.hammer} Left</span>
          </button>

          {/* Shuffle */}
          <button
            onClick={() => activateBooster('shuffle')}
            disabled={boostersCount.shuffle <= 0 || isProcessing}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#121c47] border-2 border-indigo-400/40 hover:border-indigo-300 transition-all cursor-pointer disabled:opacity-50"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-400/50 flex items-center justify-center mb-1 text-lg">
              🔄
            </div>
            <span className="font-headline font-bold text-[10px] uppercase text-white">Shuffle</span>
            <span className="text-[9px] text-purple-300 font-bold">{boostersCount.shuffle} Left</span>
          </button>

          {/* Rainbow */}
          <button
            onClick={() => activateBooster('rainbow')}
            disabled={boostersCount.rainbow <= 0 || isProcessing}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#121c47] border-2 border-indigo-400/40 hover:border-indigo-300 transition-all cursor-pointer disabled:opacity-50"
          >
            <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-400/50 flex items-center justify-center mb-1 text-lg">
              🌈
            </div>
            <span className="font-headline font-bold text-[10px] uppercase text-white">Rainbow</span>
            <span className="text-[9px] text-pink-300 font-bold">{boostersCount.rainbow} Left</span>
          </button>
        </div>
      </div>

      {/* Screen-wide Particle Confetti Overlay */}
      <WinParticleCanvas active={gameResult === 'won'} />

      {/* Win/Loss Modal */}
      <AnimatePresence>
        {gameResult && (
          <div className="fixed inset-0 z-50 bg-[#090f2b]/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className={`bg-gradient-to-b from-[#18265e] via-[#141f4d] to-[#0f173b] border-2 p-6 max-w-sm w-full text-center relative rounded-2xl ${
                gameResult === 'won'
                  ? 'border-amber-400/80 shadow-[0_10px_35px_rgba(251,191,36,0.35)]'
                  : 'border-rose-400/80 shadow-[0_10px_35px_rgba(244,63,94,0.35)]'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-[#0c1433] mx-auto mb-3.5 border-2 border-indigo-400/40 flex items-center justify-center text-3xl font-bold shadow-md">
                {gameResult === 'won' ? '🏆' : '💀'}
              </div>

              <h3 className="text-2xl font-headline font-black uppercase mb-1.5 text-white">
                {gameResult === 'won' ? 'Quest Complete!' : 'Out of Moves!'}
              </h3>

              {/* Star Rating Reveal for Win */}
              {gameResult === 'won' && (
                <div className="flex justify-center gap-3 my-5">
                  {[1, 2, 3].map((starIdx) => (
                    <Star
                      key={starIdx}
                      size={40}
                      className="text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)] animate-bounce"
                    />
                  ))}
                </div>
              )}

              <p className="text-xs font-semibold text-violet-200 mb-5 px-2 leading-relaxed">
                {gameResult === 'won'
                  ? `Spectacular! You gathered all 40 sapphires with a final score of ${score.toLocaleString()} and earned +250 Coins & 15 Diamonds!`
                  : `You gathered ${sapphiresCollected}/40 sapphires. Swap tiles carefully to clear the mission next time!`}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    triggerHaptic();
                    setTab('map');
                  }}
                  className="flex-1 py-3 bg-[#0d1538] border border-indigo-400/40 rounded-xl font-headline text-xs font-bold uppercase tracking-wider hover:bg-indigo-950 text-violet-200 cursor-pointer transition-all"
                >
                  Exit Map
                </button>
                <button
                  onClick={initBoard}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 rounded-xl font-headline text-xs font-black uppercase tracking-wider shadow-[0_2px_12px_rgba(251,191,36,0.4)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Play Again
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
