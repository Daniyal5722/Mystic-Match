import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Zap,
  ArrowLeft,
  Star,
  Pause,
  Play
} from 'lucide-react';
import { GameState, GemType, BoardGem, Level } from '../types';

interface GameViewProps {
  gameState: GameState;
  setTab: (tab: 'home' | 'map' | 'game' | 'settings') => void;
  triggerHaptic: (type?: 'swap' | 'match' | 'win' | 'lose' | 'click' | 'booster') => void;
  triggerPushNotification: (title: string, msg: string) => void;
  onGameEnd: (won: boolean, score: number) => void;
  onUpdateBoosters: (boosters: { hammer: number; shuffle: number; rainbow: number }) => void;
}

const BOARD_SIZE = 8;
const GEM_TYPES: GemType[] = ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst'];

const GEM_STYLES: Record<GemType, { bg: string; icon: string; text: string; shadow: string; glow: string; border: string; colorHex: string }> = {
  ruby: {
    bg: 'from-rose-500 via-red-500 to-rose-700',
    icon: '❤️',
    text: 'text-white',
    shadow: 'shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),0_4px_12px_rgba(244,63,94,0.6)]',
    glow: 'drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]',
    border: 'border-rose-300/70',
    colorHex: '#f43f5e'
  },
  sapphire: {
    bg: 'from-sky-400 via-blue-500 to-indigo-600',
    icon: '💎',
    text: 'text-white',
    shadow: 'shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),0_4px_12px_rgba(59,130,246,0.6)]',
    glow: 'drop-shadow-[0_0_8px_rgba(59,130,246,0.9)]',
    border: 'border-sky-200/80',
    colorHex: '#3b82f6'
  },
  emerald: {
    bg: 'from-emerald-300 via-emerald-500 to-teal-700',
    icon: '🟢',
    text: 'text-white',
    shadow: 'shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),0_4px_12px_rgba(16,185,129,0.6)]',
    glow: 'drop-shadow-[0_0_8px_rgba(16,185,129,0.9)]',
    border: 'border-emerald-200/80',
    colorHex: '#10b981'
  },
  topaz: {
    bg: 'from-amber-300 via-yellow-400 to-amber-600',
    icon: '⭐',
    text: 'text-white',
    shadow: 'shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_4px_12px_rgba(245,158,11,0.6)]',
    glow: 'drop-shadow-[0_0_8px_rgba(245,158,11,0.9)]',
    border: 'border-yellow-100/90',
    colorHex: '#f59e0b'
  },
  amethyst: {
    bg: 'from-purple-400 via-violet-600 to-indigo-800',
    icon: '🔺',
    text: 'text-white',
    shadow: 'shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),0_4px_12px_rgba(168,85,247,0.6)]',
    glow: 'drop-shadow-[0_0_8px_rgba(168,85,247,0.9)]',
    border: 'border-purple-200/80',
    colorHex: '#a855f7'
  },
  prism: {
    bg: 'from-pink-400 via-cyan-400 to-amber-300',
    icon: '✨',
    text: 'text-white',
    shadow: 'shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_4px_16px_rgba(236,72,153,0.7)]',
    glow: 'drop-shadow-[0_0_12px_rgba(236,72,153,1)]',
    border: 'border-pink-100/90',
    colorHex: '#ec4899'
  },
};

const getRandomGemType = (): GemType => GEM_TYPES[Math.floor(Math.random() * GEM_TYPES.length)];

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
    const particles = Array.from({ length: 120 }, () => ({
      x: width / 2 + (Math.random() - 0.5) * 80,
      y: height / 2 + (Math.random() - 0.5) * 80,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.7) * 22,
      size: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      decay: Math.random() * 0.012 + 0.005,
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
      if (aliveCount > 0) animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [active]);
  if (!active) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[110] w-full h-full" />;
};

export const GameView: React.FC<GameViewProps> = ({
  gameState,
  setTab,
  triggerHaptic,
  triggerPushNotification,
  onGameEnd,
  onUpdateBoosters,
}) => {
  const currentLevelId = gameState.currentPlayingLevelId || 1;
  const levelData = useMemo(() => gameState.levels.find(l => l.id === currentLevelId), [gameState.levels, currentLevelId]);
  
  // Dynamically reduce target requirements depending on Easy Mode
  const rawTarget = levelData?.objectiveTarget || 30;
  const isEasyMode = !!gameState.easyMode;
  const objectiveTarget = isEasyMode ? Math.min(rawTarget, 10) : Math.min(rawTarget, 20); 
  const objectiveType = levelData?.objectiveType || 'sapphire';

  const startingMoves = isEasyMode ? 60 : 45;
  
  const [board, setBoard] = useState<BoardGem[][]>([]);
  const [selectedGem, setSelectedGem] = useState<BoardGem | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [movesLeft, setMovesLeft] = useState<number>(startingMoves);
  const [gemsCollected, setGemsCollected] = useState<number>(0);
  const scoreRef = useRef(0);
  const movesLeftRef = useRef(startingMoves);
  const gemsCollectedRef = useRef(0);

  const [gameResult, setGameResult] = useState<'won' | 'lost' | null>(null);
  const [comboText, setComboText] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [particleBursts, setParticleBursts] = useState<{ id: string, x: number, y: number, color: string }[]>([]);

  // Power Boosters State (Linked to global persistent state)
  const [boosterActive, setBoosterActive] = useState<'hammer' | 'shuffle' | 'rainbow' | null>(null);
  const boostersCount = gameState.boostersCount;

  const checkPossibleMoves = useCallback((currentBoard: BoardGem[][]) => {
    // Check horizontal swaps
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE - 1; c++) {
        // Swap horizontal
        let type1 = currentBoard[r][c].type;
        let type2 = currentBoard[r][c + 1].type;
        currentBoard[r][c].type = type2;
        currentBoard[r][c + 1].type = type1;
        let matches = findAndMarkMatches(currentBoard, false);
        currentBoard[r][c].type = type1;
        currentBoard[r][c + 1].type = type2;
        if (matches.length > 0) return true;
      }
    }
    // Check vertical swaps
    for (let r = 0; r < BOARD_SIZE - 1; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        let type1 = currentBoard[r][c].type;
        let type2 = currentBoard[r + 1][c].type;
        currentBoard[r][c].type = type2;
        currentBoard[r + 1][c].type = type1;
        let matches = findAndMarkMatches(currentBoard, false);
        currentBoard[r][c].type = type1;
        currentBoard[r + 1][c].type = type2;
        if (matches.length > 0) return true;
      }
    }
    return false;
  }, []);

  const findAndMarkMatches = (currentBoard: BoardGem[][], mark: boolean = true): { row: number; col: number }[] => {
    const matchedCoords: Set<string> = new Set();
    // Horizontal
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE - 2; c++) {
        const type = currentBoard[r][c].type;
        if (type && currentBoard[r][c + 1].type === type && currentBoard[r][c + 2].type === type) {
          matchedCoords.add(`${r},${c}`);
          matchedCoords.add(`${r},${c + 1}`);
          matchedCoords.add(`${r},${c + 2}`);
        }
      }
    }
    // Vertical
    for (let c = 0; c < BOARD_SIZE; c++) {
      for (let r = 0; r < BOARD_SIZE - 2; r++) {
        const type = currentBoard[r][c].type;
        if (type && currentBoard[r + 1][c].type === type && currentBoard[r + 2][c].type === type) {
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

  const initBoard = useCallback(() => {
    let newBoard: BoardGem[][] = [];
    let hasMatches = true;
    let possibleMoves = false;

    while (hasMatches || !possibleMoves) {
      newBoard = [];
      for (let r = 0; r < BOARD_SIZE; r++) {
        const row: BoardGem[] = [];
        for (let c = 0; c < BOARD_SIZE; c++) {
          row.push({
            id: `${r}-${c}-${Math.random().toString(36).substring(2, 6)}`,
            type: getRandomGemType(),
            row: r,
            col: c,
            isMatched: false,
            isNew: false,
          });
        }
        newBoard.push(row);
      }
      const initialMatches = findAndMarkMatches(newBoard, false);
      hasMatches = initialMatches.length > 0;
      if (!hasMatches) {
        possibleMoves = checkPossibleMoves(newBoard);
      }
    }
    setBoard(newBoard);
    setSelectedGem(null);
    setScore(0);
    setMovesLeft(startingMoves); // Use dynamic starting moves count
    setGemsCollected(0);
    scoreRef.current = 0;
    movesLeftRef.current = startingMoves; // Use dynamic starting moves count
    gemsCollectedRef.current = 0;
    setGameResult(null);
    setComboText(null);
    setIsPaused(false);
  }, [checkPossibleMoves, startingMoves]);

  useEffect(() => { 
    initBoard(); 
  }, [initBoard, currentLevelId, startingMoves]);

  const handleGemClick = (gem: BoardGem) => {
    if (isProcessing || gameResult || isPaused) return;

    if (boosterActive === 'hammer') {
      triggerHammerSmash(gem);
      return;
    }

    triggerHaptic('click');

    if (!selectedGem) {
      setSelectedGem(gem);
      return;
    }

    if (selectedGem.id === gem.id) {
      setSelectedGem(null);
      return;
    }

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
    triggerHaptic('swap');

    const newBoard = board.map(row => row.map(g => ({ ...g })));
    
    // Swap object references for Framer Motion layout tracking
    const g1 = newBoard[gem1.row][gem1.col];
    const g2 = newBoard[gem2.row][gem2.col];
    
    newBoard[gem1.row][gem1.col] = g2;
    newBoard[gem2.row][gem2.col] = g1;
    
    g1.row = gem2.row;
    g1.col = gem2.col;
    g2.row = gem1.row;
    g2.col = gem1.col;

    const matches = findAndMarkMatches(newBoard);

    if (matches.length > 0) {
      setBoard(newBoard);
      setSelectedGem(null);
      const nextMoves = movesLeft - 1;
      setMovesLeft(nextMoves);
      movesLeftRef.current = nextMoves;
      processMatches(newBoard, matches);
    } else {
      setBoard(newBoard);
      setTimeout(() => {
        triggerHaptic('click'); // negative feedback
        const revertBoard = newBoard.map(row => row.map(g => ({ ...g })));
        
        // Revert swap
        const r1 = revertBoard[gem1.row][gem1.col];
        const r2 = revertBoard[gem2.row][gem2.col];
        revertBoard[gem1.row][gem1.col] = r2;
        revertBoard[gem2.row][gem2.col] = r1;
        
        r1.row = gem1.row;
        r1.col = gem1.col;
        r2.row = gem2.row;
        r2.col = gem2.col;

        setBoard(revertBoard);
        setSelectedGem(null);
        setIsProcessing(false);
      }, 300);
    }
  };

  const processMatches = (currentBoard: BoardGem[][], matched: { row: number; col: number }[]) => {
    let targetGemsFound = 0;
    const nextBoard = currentBoard.map(row => row.map(g => ({ ...g })));
    
    // Add particle bursts at the center of matches
    const burstColor = GEM_STYLES[nextBoard[matched[0].row][matched[0].col].type].colorHex;
    const centerX = matched.reduce((sum, m) => sum + m.col, 0) / matched.length;
    const centerY = matched.reduce((sum, m) => sum + m.row, 0) / matched.length;
    
    setParticleBursts(prev => [...prev, { id: Math.random().toString(), x: centerX, y: centerY, color: burstColor }]);
    setTimeout(() => {
      setParticleBursts(prev => prev.slice(1));
    }, 600);

    matched.forEach(({ row, col }) => {
      if (nextBoard[row][col].type === objectiveType) targetGemsFound++;
      nextBoard[row][col].isMatched = true;
    });

    triggerHaptic('match');

    const matchScore = matched.length * 50;
    scoreRef.current += matchScore;
    gemsCollectedRef.current += targetGemsFound;

    setScore(scoreRef.current);
    setGemsCollected(gemsCollectedRef.current);

    if (matched.length >= 5) setComboText('FANTASY BURST!');
    else if (matched.length === 4) setComboText('SUPER COMBO!');
    else setComboText('MATCH!');

    setBoard(nextBoard);

    setTimeout(() => {
      setComboText(null);
      applyGravityAndFill(nextBoard);
    }, 400);
  };

  const applyGravityAndFill = (currentBoard: BoardGem[][]) => {
    const nextBoard = currentBoard.map(row => row.map(g => ({ ...g })));
    
    for (let c = 0; c < BOARD_SIZE; c++) {
      let emptyRow = BOARD_SIZE - 1;
      
      // Pull gems down
      for (let r = BOARD_SIZE - 1; r >= 0; r--) {
        if (!nextBoard[r][c].isMatched) {
          if (emptyRow !== r) {
            // Swap reference
            const gem = nextBoard[r][c];
            nextBoard[emptyRow][c] = gem;
            gem.row = emptyRow;
            
            // Mark the old cell so it gets replaced
            nextBoard[r][c] = { ...gem, isMatched: true }; 
          }
          emptyRow--;
        }
      }
      
      // Generate new gems
      for (let r = emptyRow; r >= 0; r--) {
        nextBoard[r][c] = {
          id: `${r}-${c}-${Math.random().toString(36).substring(2, 6)}`,
          type: getRandomGemType(),
          row: r,
          col: c,
          isMatched: false,
          isNew: true,
        };
      }
    }
    
    setBoard(nextBoard);
    setTimeout(() => {
      const cascadeMatches = findAndMarkMatches(nextBoard);
      if (cascadeMatches.length > 0) {
        processMatches(nextBoard, cascadeMatches);
      } else {
        // Clear isNew flags
        const finalBoard = nextBoard.map(row => row.map(g => ({ ...g, isNew: false })));
        setBoard(finalBoard);
        setIsProcessing(false);
        
        if (gemsCollectedRef.current >= objectiveTarget) {
          setGameResult('won');
          triggerHaptic('win');
          onGameEnd(true, scoreRef.current);
          triggerPushNotification('Stage Clear!', `You collected ${objectiveTarget} ${objectiveType}s! Score: ${scoreRef.current}`);
        } else if (movesLeftRef.current <= 0) {
          setGameResult('lost');
          triggerHaptic('lose');
          onGameEnd(false, scoreRef.current);
          triggerPushNotification('Game Over', 'You ran out of moves! Try again.');
        } else if (!checkPossibleMoves(finalBoard)) {
          // Shuffle check
          triggerHaptic('booster');
          setComboText('SHUFFLING...');
          setTimeout(() => {
            setComboText(null);
            shuffleBoard();
          }, 800);
        }
      }
    }, 350);
  };

  const shuffleBoard = () => {
    let nextBoard = board.map(row => row.map(g => ({ ...g, type: getRandomGemType(), isNew: true })));
    while (!checkPossibleMoves(nextBoard)) {
      nextBoard = nextBoard.map(row => row.map(g => ({ ...g, type: getRandomGemType(), isNew: true })));
    }
    setBoard(nextBoard);
  };

  const activateBooster = (type: 'hammer' | 'shuffle' | 'rainbow') => {
    if (isProcessing || gameResult || isPaused) return;
    triggerHaptic('click');

    if (type === 'hammer') {
      if (boostersCount.hammer <= 0) return;
      setBoosterActive(boosterActive === 'hammer' ? null : 'hammer');
    }

    if (type === 'shuffle') {
      if (boostersCount.shuffle <= 0) return;
      onUpdateBoosters({ ...boostersCount, shuffle: boostersCount.shuffle - 1 });
      triggerHaptic('booster');
      shuffleBoard();
      setComboText('SHUFFLED!');
      setTimeout(() => setComboText(null), 700);
    }

    if (type === 'rainbow') {
      if (boostersCount.rainbow <= 0) return;
      onUpdateBoosters({ ...boostersCount, rainbow: boostersCount.rainbow - 1 });
      triggerHaptic('booster');
      const nextBoard = board.map(row => row.map(g => ({ ...g })));
      for (let i = 0; i < 4; i++) {
        nextBoard[Math.floor(Math.random() * BOARD_SIZE)][Math.floor(Math.random() * BOARD_SIZE)].type = objectiveType;
      }
      setBoard(nextBoard);
      setComboText('RAINBOW SURGE!');
      setTimeout(() => {
        setComboText(null);
        const matches = findAndMarkMatches(nextBoard);
        if (matches.length > 0) {
          setIsProcessing(true);
          processMatches(nextBoard, matches);
        }
      }, 700);
    }
  };

  const triggerHammerSmash = (gem: BoardGem) => {
    setBoosterActive(null);
    onUpdateBoosters({ ...boostersCount, hammer: boostersCount.hammer - 1 });
    triggerHaptic('booster');
    setIsProcessing(true);

    const nextBoard = board.map(row => row.map(g => ({ ...g })));
    nextBoard[gem.row][gem.col].isMatched = true;
    setComboText('SMASH!');
    setBoard(nextBoard);

    setTimeout(() => {
      setComboText(null);
      if (gem.type === objectiveType) gemsCollectedRef.current += 1;
      scoreRef.current += 100;
      setGemsCollected(gemsCollectedRef.current);
      setScore(scoreRef.current);
      applyGravityAndFill(nextBoard);
    }, 400);
  };

  const objectiveStyle = GEM_STYLES[objectiveType];

  return (
    <div className="flex flex-col w-full h-full select-none relative z-10 pb-6 text-white max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <button
          onClick={() => { triggerHaptic('click'); setTab('map'); }}
          className="flex items-center gap-1.5 font-headline font-bold text-xs uppercase text-cyan-300 hover:text-white transition-colors cursor-pointer bg-[#121d4a] px-3 py-1.5 rounded-lg border border-indigo-400/40 shadow-[0_2px_10px_rgba(34,211,238,0.2)]"
        >
          <ArrowLeft size={15} /> Map
        </button>
        <h2 className="font-headline font-black text-sm uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-cyan-300 shadow-sm">
          Stage {currentLevelId}: {levelData?.name || 'Arena'}
        </h2>
        <button
          onClick={() => { triggerHaptic('click'); setIsPaused(true); }}
          className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 border border-cyan-300 flex items-center justify-center text-white cursor-pointer shadow-[0_2px_10px_rgba(34,211,238,0.3)] hover:scale-105 active:scale-95 transition-all"
        >
          <Pause size={14} className="fill-current" />
        </button>
      </div>

      {/* Top Objective and Stats */}
      <div className="flex flex-col gap-2.5 mb-4">
        <div className={`card-glowing-${objectiveType === 'ruby' ? 'rose' : 'cyan'} bg-gradient-to-r from-[#121c47] to-[#101b44] p-3 rounded-xl flex items-center justify-between border-2 border-indigo-400/50 shadow-[0_4px_15px_rgba(0,0,0,0.3)]`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-headline font-black text-2xl border ${objectiveStyle.border} bg-gradient-to-b ${objectiveStyle.bg} shadow-md`}>
              {objectiveStyle.icon}
            </div>
            <div>
              <p className="text-[10px] font-headline uppercase tracking-wider text-indigo-300 leading-none mb-1">
                Mission Objective
              </p>
              <p className="text-sm font-headline font-black text-white leading-none">
                Collect {objectiveTarget} {objectiveType}s
              </p>
            </div>
          </div>
          <div className="bg-[#0b1b3b] text-white px-3 py-1.5 rounded-lg font-headline font-black text-sm border border-indigo-400/60 shadow-inner">
            <span className="text-cyan-300">{gemsCollected}</span><span className="text-indigo-400/60">/{objectiveTarget}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-gradient-to-b from-[#2a1e0b] to-[#1a1306] p-2.5 border-2 border-amber-400/60 rounded-xl flex items-center justify-between shadow-[0_2px_12px_rgba(251,191,36,0.2)]">
            <div>
              <p className="text-[9px] font-headline uppercase tracking-wider text-amber-300/80 leading-none">Score</p>
              <h2 className="text-lg font-headline font-black text-amber-300 leading-none mt-1">{score.toLocaleString()}</h2>
            </div>
            <Trophy size={18} className="text-amber-400" />
          </div>
          <div className="bg-gradient-to-b from-[#0c244c] to-[#081733] p-2.5 border-2 border-cyan-400/60 rounded-xl flex items-center justify-between shadow-[0_2px_12px_rgba(34,211,238,0.2)]">
            <div>
              <p className="text-[9px] font-headline uppercase tracking-wider text-cyan-300/80 leading-none">Moves</p>
              <h2 className={`text-lg font-headline font-black leading-none mt-1 ${movesLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-cyan-300'}`}>
                {movesLeft}
              </h2>
            </div>
            <Zap size={18} className="text-cyan-400" />
          </div>
        </div>
      </div>

      {/* Main 8x8 Board */}
      <div className="relative w-full aspect-square bg-gradient-to-b from-[#141f4d] via-[#111942] to-[#0c1333] border-2 border-indigo-400/60 rounded-2xl shadow-[0_8px_30px_rgba(59,130,246,0.3)] p-2 flex items-center justify-center overflow-hidden">
        <div id="game-board" className="grid grid-cols-8 grid-rows-8 w-full h-full gap-1">
          {board.map(row => row.map(gem => {
            const style = GEM_STYLES[gem.type];
            const isSelected = selectedGem?.id === gem.id;
            return (
              <div key={gem.id} onClick={() => handleGemClick(gem)} className="relative w-full h-full aspect-square flex items-center justify-center">
                <AnimatePresence>
                  {!gem.isMatched && (
                    <motion.div
                      layout
                      initial={gem.isNew ? { scale: 0.1, y: -20, opacity: 0 } : false}
                      animate={{ scale: isSelected ? 0.85 : 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25, mass: 0.8 }}
                      className={`w-full h-full rounded-lg bg-gradient-to-b ${style.bg} ${style.shadow} cursor-pointer relative flex items-center justify-center border ${style.border} overflow-hidden ${isSelected ? 'ring-2 ring-white z-10' : ''}`}
                    >
                      <div className="absolute top-0.5 left-1 w-2/3 h-1/3 bg-white/40 rounded-full blur-[1px] transform -rotate-12 pointer-events-none" />
                      <span className="text-xl sm:text-2xl select-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]">{style.icon}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }))}
        </div>

        {/* Small particle bursts for matches */}
        {particleBursts.map(burst => (
          <motion.div
            key={burst.id}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${(burst.x / 8) * 100 + 6}%`,
              top: `${(burst.y / 8) * 100 + 6}%`,
              width: '40px', height: '40px',
              backgroundColor: burst.color,
              boxShadow: `0 0 20px ${burst.color}`,
              transform: 'translate(-50%, -50%)',
              zIndex: 20
            }}
          />
        ))}

        <AnimatePresence>
          {comboText && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 15 }}
              animate={{ scale: 1.1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -15 }}
              transition={{ type: 'spring' }}
              className="absolute pointer-events-none z-30 font-headline font-black text-xl text-amber-300 bg-[#0e163b]/95 px-5 py-2 rounded-xl border-2 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.7)] uppercase tracking-wider"
            >
              {comboText}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="text-center my-2.5">
        <p className="text-[10px] font-headline uppercase tracking-widest text-cyan-300 font-bold leading-none animate-pulse">
          {boosterActive === 'hammer' ? '⚡ HAMMER ACTIVE — Tap any crystal to smash it!' : 'Tap adjacent crystals to form combos!'}
        </p>
      </div>

      {/* Boosters Row */}
      <div className="mt-auto pb-1">
        <p className="text-[10px] font-headline font-bold uppercase tracking-wider mb-2 text-violet-300">Power Boosters</p>
        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => activateBooster('hammer')}
            disabled={boostersCount.hammer <= 0 || isProcessing || isPaused}
            className={`flex flex-col items-center justify-center p-2 rounded-xl bg-[#121c47] border-2 transition-all cursor-pointer ${boosterActive === 'hammer' ? 'border-cyan-400 bg-cyan-950/50 shadow-[0_0_15px_rgba(34,211,238,0.4)] scale-105' : 'border-indigo-400/40 hover:border-indigo-300'} disabled:opacity-50`}
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/50 flex items-center justify-center mb-1 text-lg">🔨</div>
            <span className="font-headline font-bold text-[10px] uppercase text-white">Hammer</span>
            <span className="text-[9px] text-amber-300 font-bold">{boostersCount.hammer} Left</span>
          </button>
          <button
            onClick={() => activateBooster('shuffle')}
            disabled={boostersCount.shuffle <= 0 || isProcessing || isPaused}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#121c47] border-2 border-indigo-400/40 hover:border-indigo-300 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-400/50 flex items-center justify-center mb-1 text-lg">🔄</div>
            <span className="font-headline font-bold text-[10px] uppercase text-white">Shuffle</span>
            <span className="text-[9px] text-purple-300 font-bold">{boostersCount.shuffle} Left</span>
          </button>
          <button
            onClick={() => activateBooster('rainbow')}
            disabled={boostersCount.rainbow <= 0 || isProcessing || isPaused}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#121c47] border-2 border-indigo-400/40 hover:border-indigo-300 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-400/50 flex items-center justify-center mb-1 text-lg">🌈</div>
            <span className="font-headline font-bold text-[10px] uppercase text-white">Rainbow</span>
            <span className="text-[9px] text-pink-300 font-bold">{boostersCount.rainbow} Left</span>
          </button>
        </div>
      </div>

      <WinParticleCanvas active={gameResult === 'won'} />

      {/* Pause Modal */}
      <AnimatePresence>
        {isPaused && !gameResult && (
          <div className="fixed inset-0 z-50 bg-[#090f2b]/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-b from-[#18265e] to-[#0f173b] border-2 border-indigo-400/80 p-6 max-w-xs w-full text-center rounded-2xl shadow-[0_10px_40px_rgba(59,130,246,0.3)]"
            >
              <h3 className="text-2xl font-headline font-black uppercase mb-1.5 text-white">Paused</h3>
              <p className="text-xs text-indigo-300 mb-6">Take a breath, adventurer.</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { triggerHaptic('click'); setIsPaused(false); }}
                  className="w-full py-3.5 bg-cyan-400 text-slate-950 rounded-xl font-headline text-sm font-black uppercase tracking-wider shadow-[0_4px_15px_rgba(34,211,238,0.4)] hover:bg-cyan-300 cursor-pointer flex justify-center items-center gap-2"
                >
                  <Play size={18} className="fill-current" /> Resume Game
                </button>
                <button
                  onClick={() => { triggerHaptic('click'); initBoard(); setIsPaused(false); }}
                  className="w-full py-3 bg-[#11193b] border border-indigo-400/50 rounded-xl font-headline text-xs font-bold uppercase tracking-wider hover:bg-indigo-900 text-white cursor-pointer"
                >
                  Restart Stage
                </button>
                <button
                  onClick={() => { triggerHaptic('click'); setTab('map'); }}
                  className="w-full py-3 bg-[#11193b] border border-rose-500/40 rounded-xl font-headline text-xs font-bold uppercase tracking-wider hover:bg-rose-950 text-rose-300 cursor-pointer"
                >
                  Quit to Map
                </button>
                <button
                  onClick={() => { triggerHaptic('click'); setTab('home'); }}
                  className="w-full py-3 bg-[#11193b] border border-indigo-400/40 rounded-xl font-headline text-xs font-bold uppercase tracking-wider hover:bg-indigo-950 text-violet-300 cursor-pointer"
                >
                  Home
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Win/Loss Modal */}
      <AnimatePresence>
        {gameResult && (
          <div className="fixed inset-0 z-50 bg-[#090f2b]/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              className={`bg-gradient-to-b from-[#18265e] to-[#0f173b] border-2 p-6 max-w-sm w-full text-center relative rounded-2xl ${gameResult === 'won' ? 'border-amber-400/80 shadow-[0_10px_40px_rgba(251,191,36,0.35)]' : 'border-rose-500/80 shadow-[0_10px_40px_rgba(244,63,94,0.35)]'}`}
            >
              <div className="w-16 h-16 rounded-2xl bg-[#0c1433] mx-auto mb-4 border-2 border-indigo-400/40 flex items-center justify-center text-4xl shadow-lg">
                {gameResult === 'won' ? '🏆' : '💀'}
              </div>
              <h3 className="text-2xl font-headline font-black uppercase mb-1.5 text-white">
                {gameResult === 'won' ? 'Quest Complete!' : 'Out of Moves!'}
              </h3>
              {gameResult === 'won' && (
                <div className="flex justify-center gap-3 my-5">
                  {[1, 2, 3].map((starIdx) => (
                    <Star key={starIdx} size={42} className="text-amber-400 fill-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,1)] animate-bounce" style={{ animationDelay: `${starIdx * 0.15}s` }} />
                  ))}
                </div>
              )}
              <p className="text-xs font-semibold text-violet-200 mb-6 px-2 leading-relaxed">
                {gameResult === 'won'
                  ? `Spectacular! You gathered all ${objectiveTarget} ${objectiveType}s with a final score of ${score.toLocaleString()} and earned +250 Coins & 15 Diamonds!`
                  : `You gathered ${gemsCollected}/${objectiveTarget} ${objectiveType}s. Swap tiles carefully to clear the mission next time!`}
              </p>
              <div className="flex flex-col gap-2">
                {gameResult === 'won' && (
                  <button
                    onClick={() => { triggerHaptic('click'); setTab('map'); }}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 rounded-xl font-headline text-sm font-black uppercase tracking-wider shadow-[0_4px_15px_rgba(251,191,36,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    Next Level
                  </button>
                )}
                {gameResult === 'lost' && (
                  <button
                    onClick={() => { triggerHaptic('click'); initBoard(); }}
                    className="w-full py-3.5 bg-gradient-to-r from-rose-400 to-red-500 text-white rounded-xl font-headline text-sm font-black uppercase tracking-wider shadow-[0_4px_15px_rgba(244,63,94,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    Try Again
                  </button>
                )}
                <button
                  onClick={() => { triggerHaptic('click'); initBoard(); }}
                  className="w-full py-2.5 bg-[#11193b] border border-indigo-400/50 rounded-xl font-headline text-xs font-bold uppercase tracking-wider hover:bg-indigo-900 text-white cursor-pointer transition-all"
                >
                  Replay
                </button>
                <div className="flex gap-2 w-full mt-1">
                  <button
                    onClick={() => { triggerHaptic('click'); setTab('map'); }}
                    className="flex-1 py-2.5 bg-[#11193b] border border-indigo-500/40 rounded-xl font-headline text-xs font-bold uppercase tracking-wider hover:bg-indigo-950 text-violet-300 cursor-pointer transition-all"
                  >
                    Levels
                  </button>
                  <button
                    onClick={() => { triggerHaptic('click'); setTab('home'); }}
                    className="flex-1 py-2.5 bg-[#11193b] border border-indigo-500/40 rounded-xl font-headline text-xs font-bold uppercase tracking-wider hover:bg-indigo-950 text-violet-300 cursor-pointer transition-all"
                  >
                    Home
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
