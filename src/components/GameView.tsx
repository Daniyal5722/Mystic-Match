import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Zap,
  ArrowLeft,
  Star,
  Pause,
  Play,
  Clock,
  RotateCcw,
  LogOut,
  AlertTriangle,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { GameState, GemType, BoardGem, ActiveLevelSession, BoosterType } from '../types';
import { ConfirmationModal } from './ConfirmationModal';

interface GameViewProps {
  gameState: GameState;
  setTab: (tab: 'home' | 'map' | 'game' | 'settings') => void;
  triggerHaptic: (type?: 'swap' | 'match' | 'win' | 'lose' | 'click' | 'booster') => void;
  triggerPushNotification: (title: string, msg: string) => void;
  onGameEnd: (won: boolean, score: number, perfectRun?: boolean) => void;
  onUpdateBoosters: (boosters: GameState['boostersCount']) => void;
  onSetLevelInProgress?: (inProgress: boolean) => void;
  onOpenShop?: () => void;
  onMatchMade?: (count: number) => void;
}

const BOARD_SIZE = 8;
const ALL_GEM_TYPES: GemType[] = ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'prism'];
const ACTIVE_LEVEL_STORAGE_KEY = 'mystic_match_active_level_v1';

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

interface MoveSnapshot {
  board: BoardGem[][];
  score: number;
  movesLeft: number;
  gemsCollected: number;
}

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
      for (const p of particles) {
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
  onSetLevelInProgress,
  onOpenShop,
  onMatchMade,
}) => {
  const currentLevelId = gameState.currentPlayingLevelId || 1;
  const levelData = useMemo(() => gameState.levels.find(l => l.id === currentLevelId), [gameState.levels, currentLevelId]);
  
  // Dynamically configure target and moves based on difficulty mode
  const currentDifficulty = gameState.difficultyMode || (gameState.easyMode ? 'easy' : 'medium');
  const rawTarget = levelData?.objectiveTarget || 25;

  const { startingMoves, objectiveTarget } = useMemo(() => {
    switch (currentDifficulty) {
      case 'easy':
        return {
          startingMoves: 60,
          objectiveTarget: Math.max(8, Math.round(rawTarget * 0.5)),
        };
      case 'hard':
        return {
          startingMoves: 35,
          objectiveTarget: Math.max(20, Math.round(rawTarget * 1.0)),
        };
      case 'extreme':
        return {
          startingMoves: 25,
          objectiveTarget: Math.max(26, Math.round(rawTarget * 1.3)),
        };
      case 'medium':
      default:
        return {
          startingMoves: 45,
          objectiveTarget: Math.max(14, Math.round(rawTarget * 0.75)),
        };
    }
  }, [currentDifficulty, rawTarget]);

  const objectiveType = levelData?.objectiveType || 'sapphire';

  // CRITICAL FIX FOR LEVEL AUDIT / SOLVABILITY:
  // Ensure the board generator pool ALWAYS includes the objectiveType so target gems spawn in every level (1-50)!
  const levelGemPool = useMemo<GemType[]>(() => {
    const others = ALL_GEM_TYPES.filter(t => t !== objectiveType);
    return [objectiveType, ...others.slice(0, 4)];
  }, [objectiveType]);

  const getRandomGemType = useCallback((): GemType => {
    return levelGemPool[Math.floor(Math.random() * levelGemPool.length)];
  }, [levelGemPool]);
  
  const [board, setBoard] = useState<BoardGem[][]>([]);
  const [selectedGem, setSelectedGem] = useState<BoardGem | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [movesLeft, setMovesLeft] = useState<number>(startingMoves);
  const [gemsCollected, setGemsCollected] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const scoreRef = useRef(0);
  const movesLeftRef = useRef(startingMoves);
  const gemsCollectedRef = useRef(0);
  const elapsedSecondsRef = useRef(0);

  const [gameResult, setGameResult] = useState<'won' | 'lost' | null>(null);
  const [comboText, setComboText] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [particleBursts, setParticleBursts] = useState<{ id: string, x: number, y: number, color: string }[]>([]);

  // Confirmation Modals State
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState<boolean>(false);
  const [isRestartConfirmOpen, setIsRestartConfirmOpen] = useState<boolean>(false);
  const [leaveTargetTab, setLeaveTargetTab] = useState<'home' | 'map' | 'settings'>('map');

  // Power Boosters State
  const [boosterActive, setBoosterActive] = useState<BoosterType | null>(null);
  const [hintPair, setHintPair] = useState<{ g1: { row: number; col: number }; g2: { row: number; col: number } } | null>(null);
  const [lastMoveSnapshot, setLastMoveSnapshot] = useState<MoveSnapshot | null>(null);
  const usedBoosterInLevelRef = useRef<boolean>(false);

  const boostersCount = gameState.boostersCount;

  // Track the active session key loaded so tab switching doesn't reset it
  const loadedSessionKeyRef = useRef<string | null>(null);

  // Helper to format time
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const findAndMarkMatches = useCallback((currentBoard: BoardGem[][], mark: boolean = true): { row: number; col: number }[] => {
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
  }, []);

  const checkPossibleMoves = useCallback((currentBoard: BoardGem[][]) => {
    // Check horizontal swaps
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE - 1; c++) {
        const type1 = currentBoard[r][c].type;
        const type2 = currentBoard[r][c + 1].type;
        currentBoard[r][c].type = type2;
        currentBoard[r][c + 1].type = type1;
        const matches = findAndMarkMatches(currentBoard, false);
        currentBoard[r][c].type = type1;
        currentBoard[r][c + 1].type = type2;
        if (matches.length > 0) return true;
      }
    }
    // Check vertical swaps
    for (let r = 0; r < BOARD_SIZE - 1; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const type1 = currentBoard[r][c].type;
        const type2 = currentBoard[r + 1][c].type;
        currentBoard[r][c].type = type2;
        currentBoard[r + 1][c].type = type1;
        const matches = findAndMarkMatches(currentBoard, false);
        currentBoard[r][c].type = type1;
        currentBoard[r + 1][c].type = type2;
        if (matches.length > 0) return true;
      }
    }
    return false;
  }, [findAndMarkMatches]);

  // Hint Search Helper
  const findHintMovePair = useCallback((currentBoard: BoardGem[][]): { g1: { row: number; col: number }; g2: { row: number; col: number } } | null => {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        // Swap horizontal
        if (c < BOARD_SIZE - 1) {
          const testBoard = currentBoard.map(row => row.map(g => ({ ...g })));
          const temp = testBoard[r][c].type;
          testBoard[r][c].type = testBoard[r][c + 1].type;
          testBoard[r][c + 1].type = temp;
          if (findAndMarkMatches(testBoard, false).length > 0) {
            return { g1: { row: r, col: c }, g2: { row: r, col: c + 1 } };
          }
        }
        // Swap vertical
        if (r < BOARD_SIZE - 1) {
          const testBoard = currentBoard.map(row => row.map(g => ({ ...g })));
          const temp = testBoard[r][c].type;
          testBoard[r][c].type = testBoard[r + 1][c].type;
          testBoard[r + 1][c].type = temp;
          if (findAndMarkMatches(testBoard, false).length > 0) {
            return { g1: { row: r, col: c }, g2: { row: r + 1, col: c } };
          }
        }
      }
    }
    return null;
  }, [findAndMarkMatches]);

  // Safe Session Persistence Functions
  const saveCurrentSession = useCallback((
    customBoard?: BoardGem[][],
    customScore?: number,
    customMoves?: number,
    customCollected?: number,
    customSeconds?: number,
  ) => {
    if (gameResult) return;
    const currentBoard = customBoard || board;
    if (!currentBoard || currentBoard.length !== BOARD_SIZE) return;

    const session: ActiveLevelSession = {
      levelId: currentLevelId,
      difficultyMode: currentDifficulty,
      board: currentBoard,
      score: customScore !== undefined ? customScore : scoreRef.current,
      movesLeft: customMoves !== undefined ? customMoves : movesLeftRef.current,
      gemsCollected: customCollected !== undefined ? customCollected : gemsCollectedRef.current,
      elapsedSeconds: customSeconds !== undefined ? customSeconds : elapsedSecondsRef.current,
      objectiveTarget,
      objectiveType,
      savedAt: Date.now(),
    };

    try {
      localStorage.setItem(ACTIVE_LEVEL_STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.error('Failed to save active level session:', e);
    }
  }, [board, currentDifficulty, currentLevelId, gameResult, objectiveTarget, objectiveType]);

  const clearCurrentSession = useCallback(() => {
    try {
      localStorage.removeItem(ACTIVE_LEVEL_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear active session:', e);
    }
  }, []);

  // Proactive backgrounding persistence
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !gameResult && board.length === BOARD_SIZE) {
        saveCurrentSession();
      }
    };
    const handleBeforeUnload = () => {
      if (!gameResult && board.length === BOARD_SIZE) {
        saveCurrentSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [board, gameResult, saveCurrentSession]);

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
    setMovesLeft(startingMoves);
    setGemsCollected(0);
    setElapsedSeconds(0);
    scoreRef.current = 0;
    movesLeftRef.current = startingMoves;
    gemsCollectedRef.current = 0;
    elapsedSecondsRef.current = 0;
    setGameResult(null);
    setComboText(null);
    setIsPaused(false);
    setHintPair(null);
    setLastMoveSnapshot(null);
    usedBoosterInLevelRef.current = false;
    onSetLevelInProgress?.(true);

    // Save newly initialized level state immediately
    const session: ActiveLevelSession = {
      levelId: currentLevelId,
      difficultyMode: currentDifficulty,
      board: newBoard,
      score: 0,
      movesLeft: startingMoves,
      gemsCollected: 0,
      elapsedSeconds: 0,
      objectiveTarget,
      objectiveType,
      savedAt: Date.now(),
    };
    try {
      localStorage.setItem(ACTIVE_LEVEL_STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      // safe fallback
    }
  }, [checkPossibleMoves, findAndMarkMatches, getRandomGemType, startingMoves, currentLevelId, currentDifficulty, objectiveTarget, objectiveType, onSetLevelInProgress]);

  // Load from saved session or initialize a fresh board
  useEffect(() => {
    const currentSessionKey = `${currentLevelId}-${currentDifficulty}`;
    if (loadedSessionKeyRef.current === currentSessionKey && board.length === BOARD_SIZE) {
      return;
    }

    let restored = false;
    try {
      const cached = localStorage.getItem(ACTIVE_LEVEL_STORAGE_KEY);
      if (cached) {
        const session = JSON.parse(cached) as ActiveLevelSession;
        if (
          session &&
          session.levelId === currentLevelId &&
          session.difficultyMode === currentDifficulty &&
          Array.isArray(session.board) &&
          session.board.length === BOARD_SIZE &&
          session.movesLeft > 0 &&
          session.gemsCollected < objectiveTarget
        ) {
          setBoard(session.board);
          setSelectedGem(null);
          setScore(session.score);
          setMovesLeft(session.movesLeft);
          setGemsCollected(session.gemsCollected);
          setElapsedSeconds(session.elapsedSeconds || 0);

          scoreRef.current = session.score;
          movesLeftRef.current = session.movesLeft;
          gemsCollectedRef.current = session.gemsCollected;
          elapsedSecondsRef.current = session.elapsedSeconds || 0;

          setGameResult(null);
          setComboText(null);
          setIsPaused(false);
          onSetLevelInProgress?.(true);
          restored = true;
        }
      }
    } catch (e) {
      console.error('Failed to parse cached level session:', e);
      clearCurrentSession();
    }

    if (!restored) {
      initBoard();
    }

    loadedSessionKeyRef.current = currentSessionKey;
  }, [currentLevelId, currentDifficulty, initBoard, objectiveTarget, onSetLevelInProgress, clearCurrentSession, board.length]);

  // Clean Level Timer: Pauses when paused, confirmation dialogs open, or level ended
  useEffect(() => {
    if (isPaused || gameResult || isLeaveConfirmOpen || isRestartConfirmOpen) {
      return;
    }

    const intervalId = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        elapsedSecondsRef.current = next;
        return next;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isPaused, gameResult, isLeaveConfirmOpen, isRestartConfirmOpen]);

  // Touch Swipe Gesture State (Supports natural swipe gestures in all 4 directions without page scroll)
  const touchStartRef = useRef<{ x: number; y: number; gem: BoardGem } | null>(null);

  const handleTouchStart = (e: React.TouchEvent, gem: BoardGem) => {
    if (isProcessing || gameResult || isPaused || isLeaveConfirmOpen || isRestartConfirmOpen) return;
    if (e.touches.length > 0) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        gem,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Strictly prevent the webpage from scrolling or moving during game board gestures
    if (e.cancelable) {
      e.preventDefault();
    }
    if (!touchStartRef.current || isProcessing || gameResult || isPaused || isLeaveConfirmOpen || isRestartConfirmOpen) {
      return;
    }

    const touch = e.touches[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const distance = Math.hypot(deltaX, deltaY);

    // Swipe distance threshold (22px) for snappy, responsive mobile gem swapping
    if (distance >= 22) {
      const originGem = touchStartRef.current.gem;
      touchStartRef.current = null; // consume gesture so it only fires once

      if (boosterActive === 'hammer') {
        triggerHammerSmash(originGem);
        return;
      }

      let targetRow = originGem.row;
      let targetCol = originGem.col;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        targetCol += deltaX > 0 ? 1 : -1;
      } else {
        targetRow += deltaY > 0 ? 1 : -1;
      }

      if (targetRow >= 0 && targetRow < BOARD_SIZE && targetCol >= 0 && targetCol < BOARD_SIZE) {
        const targetGem = board[targetRow]?.[targetCol];
        if (targetGem) {
          if (hintPair) setHintPair(null);
          setSelectedGem(null);
          swapGems(originGem, targetGem);
        }
      }
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  const handleGemClick = (gem: BoardGem) => {
    if (isProcessing || gameResult || isPaused || isLeaveConfirmOpen || isRestartConfirmOpen) return;

    // Clear hint glow on user action
    if (hintPair) setHintPair(null);

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
    
    // Swap
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
      // Record undo snapshot BEFORE finalizing state changes
      setLastMoveSnapshot({
        board: board.map(row => row.map(g => ({ ...g }))),
        score: scoreRef.current,
        movesLeft: movesLeftRef.current,
        gemsCollected: gemsCollectedRef.current,
      });

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
    onMatchMade?.(1);

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
            const gem = nextBoard[r][c];
            nextBoard[emptyRow][c] = gem;
            gem.row = emptyRow;
            nextBoard[r][c] = { ...gem, isMatched: true }; 
          }
          emptyRow--;
        }
      }
      
      // Generate new gems using levelGemPool (always contains objectiveType)
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
          clearCurrentSession();
          onSetLevelInProgress?.(false);
          const perfect = !usedBoosterInLevelRef.current;
          onGameEnd(true, scoreRef.current, perfect);
          triggerPushNotification('Stage Clear!', `You collected ${objectiveTarget} ${objectiveType}s! Score: ${scoreRef.current}`);
        } else if (movesLeftRef.current <= 0) {
          setGameResult('lost');
          triggerHaptic('lose');
          clearCurrentSession();
          onSetLevelInProgress?.(false);
          onGameEnd(false, scoreRef.current, false);
          triggerPushNotification('Game Over', 'You ran out of moves! Try again.');
        } else {
          // Safe game-state checkpoint save
          saveCurrentSession(finalBoard);

          if (!checkPossibleMoves(finalBoard)) {
            // Automatic safe reshuffle when no moves are possible
            triggerHaptic('booster');
            setComboText('SHUFFLING...');
            setTimeout(() => {
              setComboText(null);
              shuffleBoard();
            }, 800);
          }
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
    saveCurrentSession(nextBoard);
  };

  // FULL BOOSTER ENGINE (Hint, Shuffle, Undo, Hammer, Rainbow/Magic Match)
  const activateBooster = (type: BoosterType) => {
    if (isProcessing || gameResult || isPaused || isLeaveConfirmOpen || isRestartConfirmOpen) return;
    triggerHaptic('click');

    // 1. HAMMER
    if (type === 'hammer') {
      if (boostersCount.hammer <= 0) {
        onOpenShop?.();
        return;
      }
      setBoosterActive(boosterActive === 'hammer' ? null : 'hammer');
      return;
    }

    // 2. SHUFFLE
    if (type === 'shuffle') {
      if (boostersCount.shuffle <= 0) {
        onOpenShop?.();
        return;
      }
      usedBoosterInLevelRef.current = true;
      onUpdateBoosters({ ...boostersCount, shuffle: boostersCount.shuffle - 1 });
      triggerHaptic('booster');
      shuffleBoard();
      setComboText('SHUFFLED!');
      setTimeout(() => setComboText(null), 700);
      return;
    }

    // 3. HINT
    if (type === 'hint') {
      if (boostersCount.hint <= 0) {
        onOpenShop?.();
        return;
      }
      const pair = findHintMovePair(board);
      if (pair) {
        usedBoosterInLevelRef.current = true;
        onUpdateBoosters({ ...boostersCount, hint: boostersCount.hint - 1 });
        triggerHaptic('booster');
        setHintPair(pair);
        setComboText('HINT: SWAP HIGHLIGHTED TILES!');
        setTimeout(() => setComboText(null), 2000);
        setTimeout(() => setHintPair(null), 5000);
      } else {
        shuffleBoard();
      }
      return;
    }

    // 4. UNDO
    if (type === 'undo') {
      if (boostersCount.undo <= 0) {
        onOpenShop?.();
        return;
      }
      if (!lastMoveSnapshot) {
        setComboText('NO PREVIOUS MOVE');
        setTimeout(() => setComboText(null), 900);
        return;
      }
      usedBoosterInLevelRef.current = true;
      onUpdateBoosters({ ...boostersCount, undo: boostersCount.undo - 1 });
      triggerHaptic('booster');

      setBoard(lastMoveSnapshot.board);
      setScore(lastMoveSnapshot.score);
      setMovesLeft(lastMoveSnapshot.movesLeft);
      setGemsCollected(lastMoveSnapshot.gemsCollected);

      scoreRef.current = lastMoveSnapshot.score;
      movesLeftRef.current = lastMoveSnapshot.movesLeft;
      gemsCollectedRef.current = lastMoveSnapshot.gemsCollected;

      saveCurrentSession(lastMoveSnapshot.board, lastMoveSnapshot.score, lastMoveSnapshot.movesLeft, lastMoveSnapshot.gemsCollected);
      setLastMoveSnapshot(null);
      setComboText('MOVE UNDONE!');
      setTimeout(() => setComboText(null), 1000);
      return;
    }

    // 5. RAINBOW / MAGIC MATCH
    if (type === 'rainbow') {
      if (boostersCount.rainbow <= 0) {
        onOpenShop?.();
        return;
      }
      usedBoosterInLevelRef.current = true;
      onUpdateBoosters({ ...boostersCount, rainbow: boostersCount.rainbow - 1 });
      triggerHaptic('booster');

      const nextBoard = board.map(row => row.map(g => ({ ...g })));
      for (let i = 0; i < 4; i++) {
        const targetR = Math.floor(Math.random() * BOARD_SIZE);
        const targetC = Math.floor(Math.random() * BOARD_SIZE);
        nextBoard[targetR][targetC].type = objectiveType;
      }
      setBoard(nextBoard);
      setComboText('RAINBOW SURGE!');
      setTimeout(() => {
        setComboText(null);
        const matches = findAndMarkMatches(nextBoard);
        if (matches.length > 0) {
          setIsProcessing(true);
          processMatches(nextBoard, matches);
        } else {
          saveCurrentSession(nextBoard);
        }
      }, 700);
      return;
    }
  };

  const triggerHammerSmash = (gem: BoardGem) => {
    setBoosterActive(null);
    usedBoosterInLevelRef.current = true;
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

  // Safe exit confirmation handling (never silently discard in-progress level)
  const handleRequestLeave = (target: 'home' | 'map' | 'settings') => {
    triggerHaptic('click');
    if (!gameResult) {
      setLeaveTargetTab(target);
      setIsLeaveConfirmOpen(true);
    } else {
      setTab(target);
    }
  };

  const handleConfirmLeave = () => {
    triggerHaptic('click');
    saveCurrentSession();
    setIsLeaveConfirmOpen(false);
    onSetLevelInProgress?.(false);
    setTab(leaveTargetTab);
  };

  const handleCancelLeave = () => {
    triggerHaptic('click');
    setIsLeaveConfirmOpen(false);
  };

  // Safe restart confirmation handling
  const handleConfirmRestart = () => {
    triggerHaptic('click');
    clearCurrentSession();
    setIsRestartConfirmOpen(false);
    setIsPaused(false);
    initBoard();
  };

  const handleCancelRestart = () => {
    triggerHaptic('click');
    setIsRestartConfirmOpen(false);
  };

  const objectiveStyle = GEM_STYLES[objectiveType];

  return (
    <div
      id="game-view"
      className="game-view-container flex flex-col w-full h-full justify-between select-none relative z-10 text-white max-w-full min-w-0 overscroll-none touch-none"
      style={{ width: '100%', maxWidth: '100%' }}
    >
      {/* Unified In-Game Header: Back to Map, Stage Title, Currency, and Pause */}
      <div
        className="flex items-center justify-between mb-1 sm:mb-1.5 shrink-0 gap-1 w-full max-w-full"
        style={{ width: '100%', maxWidth: '100%' }}
      >
        <button
          type="button"
          onClick={() => handleRequestLeave('map')}
          className="flex items-center gap-1 font-headline font-bold text-[11px] sm:text-xs uppercase text-cyan-300 hover:text-white transition-colors cursor-pointer bg-[#121d4a] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-indigo-400/40 shadow-[0_2px_10px_rgba(34,211,238,0.2)] min-h-[36px] shrink-0"
          title="Return to Realm Map"
        >
          <ArrowLeft size={14} /> Map
        </button>

        <div className="flex items-center gap-1 min-w-0 px-1 truncate flex-1 justify-center">
          <h2 className="font-headline font-black text-xs sm:text-sm uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-cyan-300 shadow-sm truncate">
            Stage {currentLevelId}: {levelData?.name || 'Arena'}
          </h2>
          {currentDifficulty !== 'medium' && (
            <span className={`px-1 py-0.2 rounded text-[7.5px] font-headline font-black uppercase tracking-wider border shrink-0 ${
              currentDifficulty === 'easy' ? 'text-emerald-300 border-emerald-400/50 bg-emerald-950/50' :
              currentDifficulty === 'hard' ? 'text-amber-300 border-amber-400/50 bg-amber-950/50' :
              'text-rose-300 border-rose-400/50 bg-rose-950/50'
            }`}>
              {currentDifficulty}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="hidden xs:flex items-center gap-1 bg-[#121d4a] px-2 py-1 rounded-lg border border-amber-400/40 text-amber-300 font-headline font-black text-[10px]">
            <span>🪙</span>
            <span>{gameState.coins.toLocaleString()}</span>
          </div>
          <button
            type="button"
            onClick={() => { triggerHaptic('click'); setIsPaused(true); }}
            className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 border border-cyan-300 flex items-center justify-center text-white cursor-pointer shadow-[0_2px_10px_rgba(34,211,238,0.3)] hover:scale-105 active:scale-95 transition-all shrink-0 min-h-[32px] min-w-[32px]"
            title="Pause Game"
            aria-label="Pause Game"
          >
            <Pause size={13} className="fill-current" />
          </button>
        </div>
      </div>

      {/* High-Efficiency Unified In-Game HUD: Target Objective + Moves Left + Score + Time */}
      <div
        className="grid w-full max-w-full gap-1 sm:gap-1.5 mb-1 shrink-0 min-w-0"
        style={{
          width: '100%',
          maxWidth: '100%',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        }}
      >
        {/* 1. Target Objective */}
        <div
          className={`p-1 sm:p-1.5 rounded-xl flex items-center gap-1 sm:gap-1.5 border ${objectiveType === 'ruby' ? 'border-rose-400/60 bg-rose-950/30' : 'border-cyan-400/60 bg-cyan-950/30'} min-w-0 w-full max-w-full shadow-sm`}
          style={{ width: '100%', maxWidth: '100%' }}
        >
          <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center text-xs border ${objectiveStyle.border} bg-gradient-to-b ${objectiveStyle.bg} shrink-0`}>
            {objectiveStyle.icon}
          </div>
          <div className="min-w-0">
            <p className="text-[6.5px] uppercase font-headline font-bold text-indigo-300 leading-none truncate">Target</p>
            <p className="text-[11px] sm:text-xs font-headline font-black text-white leading-none mt-0.5 truncate">
              <span className="text-cyan-300">{gemsCollected}</span><span className="text-indigo-400/60">/{objectiveTarget}</span>
            </p>
          </div>
        </div>

        {/* 2. Moves Left */}
        <div
          className="bg-gradient-to-b from-[#0c244c] to-[#081733] p-1 sm:p-1.5 border border-cyan-400/60 rounded-xl flex flex-col justify-center min-w-0 w-full max-w-full shadow-sm"
          style={{ width: '100%', maxWidth: '100%' }}
        >
          <div className="flex items-center justify-between">
            <p className="text-[6.5px] uppercase font-headline font-bold text-cyan-300/80 leading-none">Moves</p>
            <Zap size={9} className="text-cyan-400 shrink-0" />
          </div>
          <h3 className={`text-xs sm:text-sm font-headline font-black leading-none mt-0.5 truncate ${movesLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-cyan-300'}`}>
            {movesLeft}
          </h3>
        </div>

        {/* 3. Score */}
        <div
          className="bg-gradient-to-b from-[#2a1e0b] to-[#1a1306] p-1 sm:p-1.5 border border-amber-400/60 rounded-xl flex flex-col justify-center min-w-0 w-full max-w-full shadow-sm"
          style={{ width: '100%', maxWidth: '100%' }}
        >
          <div className="flex items-center justify-between">
            <p className="text-[6.5px] uppercase font-headline font-bold text-amber-300/80 leading-none">Score</p>
            <Trophy size={9} className="text-amber-400 shrink-0" />
          </div>
          <h3 className="text-xs sm:text-sm font-headline font-black text-amber-300 leading-none mt-0.5 truncate">
            {score.toLocaleString()}
          </h3>
        </div>

        {/* 4. Time */}
        <div
          className="bg-gradient-to-b from-[#211145] to-[#130b2c] p-1 sm:p-1.5 border border-purple-400/60 rounded-xl flex flex-col justify-center min-w-0 w-full max-w-full shadow-sm"
          style={{ width: '100%', maxWidth: '100%' }}
        >
          <div className="flex items-center justify-between">
            <p className="text-[6.5px] uppercase font-headline font-bold text-purple-300/80 leading-none">Time</p>
            <Clock size={9} className="text-purple-400 shrink-0" />
          </div>
          <h3 className="text-xs sm:text-sm font-headline font-black text-purple-300 leading-none mt-0.5 truncate font-mono">
            {formatTime(elapsedSeconds)}
          </h3>
        </div>
      </div>

      {/* Main 8x8 Board (Touch-locked, fluid grid units, clamp scaled for 320px-430px viewports) */}
      <div
        id="game-board-container"
        className="game-board-container relative w-full max-w-full aspect-square mx-auto bg-gradient-to-b from-[#141f4d] via-[#111942] to-[#0c1333] border-2 border-indigo-400/60 rounded-2xl shadow-[0_8px_30px_rgba(59,130,246,0.3)] p-1 sm:p-1.5 flex items-center justify-center overflow-hidden shrink-0 touch-none select-none overscroll-none"
        style={{
          width: '100%',
          maxWidth: 'min(100%, clamp(240px, 100%, 46dvh))',
        }}
      >
        <div
          id="game-board-grid"
          className="grid gap-0.5 sm:gap-1 touch-none select-none max-w-full max-h-full"
          style={{
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            maxHeight: '100%',
            gridTemplateColumns: 'repeat(8, minmax(0, 1fr))',
            gridTemplateRows: 'repeat(8, minmax(0, 1fr))',
          }}
        >
          {board.map((row, rIdx) => row.map((gem, cIdx) => {
            const style = GEM_STYLES[gem.type] || GEM_STYLES.sapphire;
            const isSelected = selectedGem?.id === gem.id;
            const isHinted = hintPair && (
              (hintPair.g1.row === rIdx && hintPair.g1.col === cIdx) ||
              (hintPair.g2.row === rIdx && hintPair.g2.col === cIdx)
            );

            return (
              <div
                key={gem.id}
                onClick={() => handleGemClick(gem)}
                onTouchStart={(e) => handleTouchStart(e, gem)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                className="relative aspect-square flex items-center justify-center touch-none select-none min-w-0 min-h-0"
                style={{
                  width: '100%',
                  height: '100%',
                  maxWidth: '100%',
                  maxHeight: '100%',
                }}
              >
                <AnimatePresence>
                  {!gem.isMatched && (
                    <motion.div
                      layout
                      initial={gem.isNew ? { scale: 0.1, y: -20, opacity: 0 } : false}
                      animate={{ scale: isSelected ? 0.85 : 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25, mass: 0.8 }}
                      className={`rounded-md sm:rounded-lg bg-gradient-to-b ${style.bg} ${style.shadow} cursor-pointer relative flex items-center justify-center border ${style.border} overflow-hidden ${
                        isSelected ? 'ring-2 ring-white z-10' : ''
                      } ${isHinted ? 'ring-2 ring-amber-400 animate-pulse scale-105 z-10' : ''}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        maxWidth: '100%',
                        maxHeight: '100%',
                      }}
                    >
                      <div className="absolute top-0.5 left-0.5 sm:left-1 w-2/3 h-1/3 bg-white/40 rounded-full blur-[1px] transform -rotate-12 pointer-events-none" />
                      <span className="text-sm sm:text-xl select-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)] leading-none">{style.icon}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }))}
        </div>

        {/* Particle bursts for matches */}
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
              width: '28px',
              height: '28px',
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
              className="absolute pointer-events-none z-30 font-headline font-black text-sm sm:text-base text-amber-300 bg-[#0e163b]/95 px-3.5 py-1.5 rounded-xl border-2 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.7)] uppercase tracking-wider max-w-[90%]"
            >
              {comboText}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dynamic hint banner */}
      <div className="text-center my-1 shrink-0 px-1 w-full max-w-full" style={{ width: '100%', maxWidth: '100%' }}>
        <p className="text-[8px] sm:text-[9px] font-headline uppercase tracking-widest text-cyan-300 font-bold leading-none animate-pulse truncate w-full max-w-full">
          {boosterActive === 'hammer'
            ? '⚡ HAMMER ACTIVE — Tap any crystal to smash it!'
            : hintPair
            ? '💡 HINT ACTIVE — Swap the highlighted crystals!'
            : 'Tap adjacent crystals to form combos!'}
        </p>
      </div>

      {/* Complete Power Boosters Suite: Hint, Shuffle, Undo, Hammer, Rainbow & Shop link */}
      <div className="shrink-0 mt-auto pt-0.5 pb-1 w-full max-w-full" style={{ width: '100%', maxWidth: '100%' }}>
        <div className="flex items-center justify-between mb-1 px-1 w-full max-w-full" style={{ width: '100%', maxWidth: '100%' }}>
          <p className="text-[8px] sm:text-[9px] font-headline font-bold uppercase tracking-wider text-violet-300">Power Boosters</p>
          {onOpenShop && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('click');
                setIsPaused(true);
                onOpenShop();
              }}
              className="text-[8px] sm:text-[9px] text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 cursor-pointer shrink-0"
            >
              <ShoppingBag size={11} /> + Emporium
            </button>
          )}
        </div>
        <div
          className="grid gap-1 w-full max-w-full"
          style={{
            width: '100%',
            maxWidth: '100%',
            gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
          }}
        >
          {/* 1. Hint */}
          <button
            type="button"
            onClick={() => activateBooster('hint')}
            disabled={isProcessing || isPaused}
            className="flex flex-col items-center justify-center p-1 rounded-xl bg-[#121c47] border border-indigo-400/40 hover:border-amber-400 transition-all cursor-pointer disabled:opacity-50 active:scale-95 min-h-[46px] min-w-0"
            style={{ width: '100%', maxWidth: '100%' }}
            title="Hint: Highlights a guaranteed match"
          >
            <div className="w-5 h-5 rounded-lg bg-yellow-500/20 border border-yellow-400/50 flex items-center justify-center mb-0.5 text-xs">💡</div>
            <span className="font-headline font-bold text-[7px] sm:text-[8px] uppercase text-white leading-none">Hint</span>
            <span className="text-[6.5px] sm:text-[7.5px] text-amber-300 font-bold mt-0.5">{boostersCount.hint}</span>
          </button>

          {/* 2. Shuffle */}
          <button
            type="button"
            onClick={() => activateBooster('shuffle')}
            disabled={isProcessing || isPaused}
            className="flex flex-col items-center justify-center p-1 rounded-xl bg-[#121c47] border border-indigo-400/40 hover:border-purple-400 transition-all cursor-pointer disabled:opacity-50 active:scale-95 min-h-[46px] min-w-0"
            style={{ width: '100%', maxWidth: '100%' }}
            title="Shuffle: Rearranges all board tiles"
          >
            <div className="w-5 h-5 rounded-lg bg-purple-500/20 border border-purple-400/50 flex items-center justify-center mb-0.5 text-xs">🔄</div>
            <span className="font-headline font-bold text-[7px] sm:text-[8px] uppercase text-white leading-none">Shuffle</span>
            <span className="text-[6.5px] sm:text-[7.5px] text-purple-300 font-bold mt-0.5">{boostersCount.shuffle}</span>
          </button>

          {/* 3. Undo */}
          <button
            type="button"
            onClick={() => activateBooster('undo')}
            disabled={isProcessing || isPaused || !lastMoveSnapshot}
            className={`flex flex-col items-center justify-center p-1 rounded-xl bg-[#121c47] border transition-all cursor-pointer active:scale-95 min-h-[46px] min-w-0 ${
              lastMoveSnapshot ? 'border-cyan-400/60 hover:border-cyan-300' : 'border-indigo-400/20 opacity-40'
            }`}
            style={{ width: '100%', maxWidth: '100%' }}
            title="Undo: Reverses your most recent move"
          >
            <div className="w-5 h-5 rounded-lg bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center mb-0.5 text-xs">⏪</div>
            <span className="font-headline font-bold text-[7px] sm:text-[8px] uppercase text-white leading-none">Undo</span>
            <span className="text-[6.5px] sm:text-[7.5px] text-cyan-300 font-bold mt-0.5">{boostersCount.undo}</span>
          </button>

          {/* 4. Hammer */}
          <button
            type="button"
            onClick={() => activateBooster('hammer')}
            disabled={isProcessing || isPaused}
            className={`flex flex-col items-center justify-center p-1 rounded-xl bg-[#121c47] border transition-all cursor-pointer min-h-[46px] min-w-0 ${
              boosterActive === 'hammer' ? 'border-cyan-400 bg-cyan-950/50 shadow-[0_0_12px_rgba(34,211,238,0.4)] scale-105' : 'border-indigo-400/40 hover:border-amber-400'
            } disabled:opacity-50`}
            style={{ width: '100%', maxWidth: '100%' }}
            title="Hammer: Smashes one selected tile"
          >
            <div className="w-5 h-5 rounded-lg bg-amber-500/20 border border-amber-400/50 flex items-center justify-center mb-0.5 text-xs">🔨</div>
            <span className="font-headline font-bold text-[7px] sm:text-[8px] uppercase text-white leading-none">Hammer</span>
            <span className="text-[6.5px] sm:text-[7.5px] text-amber-300 font-bold mt-0.5">{boostersCount.hammer}</span>
          </button>

          {/* 5. Rainbow / Magic Match */}
          <button
            type="button"
            onClick={() => activateBooster('rainbow')}
            disabled={isProcessing || isPaused}
            className="flex flex-col items-center justify-center p-1 rounded-xl bg-[#121c47] border border-indigo-400/40 hover:border-pink-400 transition-all cursor-pointer disabled:opacity-50 active:scale-95 min-h-[46px] min-w-0"
            style={{ width: '100%', maxWidth: '100%' }}
            title="Magic Match: Transforms 4 tiles to the objective gem"
          >
            <div className="w-5 h-5 rounded-lg bg-pink-500/20 border border-pink-400/50 flex items-center justify-center mb-0.5 text-xs">🌈</div>
            <span className="font-headline font-bold text-[7px] sm:text-[8px] uppercase text-white leading-none">Magic</span>
            <span className="text-[6.5px] sm:text-[7.5px] text-pink-300 font-bold mt-0.5">{boostersCount.rainbow}</span>
          </button>
        </div>
      </div>

      <WinParticleCanvas active={gameResult === 'won'} />

      {/* Proper Pause Menu Modal */}
      <AnimatePresence>
        {isPaused && !gameResult && !isLeaveConfirmOpen && !isRestartConfirmOpen && (
          <div
            className="fixed inset-0 z-50 bg-[#070c24]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 touch-manipulation"
            style={{ width: '100%', maxWidth: '100%' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pause-modal-title"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-b from-[#18265e] via-[#141f4d] to-[#0f173b] border-2 border-indigo-400/80 p-5 sm:p-6 text-center rounded-2xl shadow-[0_12px_45px_rgba(30,58,138,0.5)] max-h-[90dvh] overflow-y-auto w-full max-w-full"
              style={{ width: '100%', maxWidth: 'min(100%, 340px)' }}
            >
              <h3 id="pause-modal-title" className="text-xl sm:text-2xl font-headline font-black uppercase mb-1 text-white">
                Game Paused
              </h3>
              <p className="text-xs text-indigo-300 mb-5">Take a breath, adventurer.</p>

              <div className="flex flex-col gap-2.5 sm:gap-3 w-full max-w-full">
                {/* 1. Resume */}
                <button
                  type="button"
                  onClick={() => { triggerHaptic('click'); setIsPaused(false); }}
                  className="w-full py-3 sm:py-3.5 px-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 rounded-xl font-headline text-xs sm:text-sm font-black uppercase tracking-wider shadow-[0_4px_18px_rgba(34,211,238,0.4)] hover:brightness-110 active:scale-[0.98] cursor-pointer flex justify-center items-center gap-2 min-h-[44px]"
                >
                  <Play size={16} className="fill-current" /> Resume
                </button>

                {/* 2. Restart Level (with confirmation) */}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('click');
                    setIsRestartConfirmOpen(true);
                  }}
                  className="w-full py-2.5 sm:py-3 px-4 bg-[#11193b] border border-indigo-400/50 rounded-xl font-headline text-xs font-bold uppercase tracking-wider hover:bg-indigo-900 text-white cursor-pointer min-h-[44px] flex justify-center items-center gap-2 active:scale-[0.98]"
                >
                  <RotateCcw size={14} /> Restart Level
                </button>

                {/* 3. Quit Level (with confirmation) */}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('click');
                    setLeaveTargetTab('map');
                    setIsLeaveConfirmOpen(true);
                  }}
                  className="w-full py-2.5 sm:py-3 px-4 bg-[#11193b] border border-rose-500/50 rounded-xl font-headline text-xs font-bold uppercase tracking-wider hover:bg-rose-950/60 text-rose-300 cursor-pointer min-h-[44px] flex justify-center items-center gap-2 active:scale-[0.98]"
                >
                  <LogOut size={14} /> Quit Level
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal: Leave Game? */}
      <ConfirmationModal
        isOpen={isLeaveConfirmOpen}
        title="Leave Game?"
        message="Your current level is still in progress. Do you want to leave the game?"
        confirmLabel="Quit Game"
        cancelLabel="Continue Playing"
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
        isDestructive={true}
        icon={<LogOut className="text-rose-400" size={24} />}
      />

      {/* Confirmation Modal: Restart Level? */}
      <ConfirmationModal
        isOpen={isRestartConfirmOpen}
        title="Restart this level?"
        message="Your current progress in this level will be lost."
        confirmLabel="Restart Level"
        cancelLabel="Keep Playing"
        onConfirm={handleConfirmRestart}
        onCancel={handleCancelRestart}
        isDestructive={true}
        icon={<AlertTriangle className="text-amber-300" size={24} />}
      />

      {/* Win/Loss Modal */}
      <AnimatePresence>
        {gameResult && (
          <div
            className="fixed inset-0 z-50 bg-[#070c24]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 touch-manipulation"
            style={{ width: '100%', maxWidth: '100%' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="game-result-title"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              className={`bg-gradient-to-b from-[#18265e] to-[#0f173b] border-2 p-5 sm:p-6 text-center relative rounded-2xl max-h-[90dvh] overflow-y-auto w-full max-w-full ${gameResult === 'won' ? 'border-amber-400/80 shadow-[0_10px_40px_rgba(251,191,36,0.35)]' : 'border-rose-500/80 shadow-[0_10px_40px_rgba(244,63,94,0.35)]'}`}
              style={{ width: '100%', maxWidth: 'min(100%, 380px)' }}
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#0c1433] mx-auto mb-3 sm:mb-4 border-2 border-indigo-400/40 flex items-center justify-center text-3xl sm:text-4xl shadow-lg">
                {gameResult === 'won' ? '🏆' : '💀'}
              </div>
              <h3 id="game-result-title" className="text-xl sm:text-2xl font-headline font-black uppercase mb-1 text-white">
                {gameResult === 'won' ? 'Quest Complete!' : 'Out of Moves!'}
              </h3>
              {gameResult === 'won' && (
                <div className="flex justify-center gap-2 sm:gap-3 my-3 sm:my-4">
                  {[1, 2, 3].map((starIdx) => (
                    <Star key={starIdx} size={30} className="text-amber-400 fill-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,1)] animate-bounce" style={{ animationDelay: `${starIdx * 0.15}s` }} />
                  ))}
                </div>
              )}
              <p className="text-xs font-semibold text-violet-200 mb-2 px-1 leading-relaxed">
                {gameResult === 'won'
                  ? `Spectacular! You gathered all ${objectiveTarget} ${objectiveType}s in ${formatTime(elapsedSeconds)} with a score of ${score.toLocaleString()}!`
                  : `You gathered ${gemsCollected}/${objectiveTarget} ${objectiveType}s in ${formatTime(elapsedSeconds)}. Swap tiles carefully to clear the mission next time!`}
              </p>

              {/* Bonus badges */}
              {gameResult === 'won' && !usedBoosterInLevelRef.current && (
                <div className="inline-flex items-center gap-1 bg-amber-400/20 border border-amber-400/60 px-2.5 py-1 rounded-lg text-amber-300 font-headline font-bold text-[10px] mb-3">
                  <Sparkles size={12} /> Perfect Run! (+Bonus Coins)
                </div>
              )}

              <div className="flex flex-col gap-2 mt-2 w-full max-w-full">
                {gameResult === 'won' && (
                  <button
                    type="button"
                    onClick={() => { triggerHaptic('click'); setTab('map'); }}
                    className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 rounded-xl font-headline text-xs sm:text-sm font-black uppercase tracking-wider shadow-[0_4px_15px_rgba(251,191,36,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer min-h-[44px]"
                  >
                    Next Level
                  </button>
                )}
                {gameResult === 'lost' && (
                  <button
                    type="button"
                    onClick={() => { triggerHaptic('click'); clearCurrentSession(); initBoard(); }}
                    className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-rose-400 to-red-500 text-white rounded-xl font-headline text-xs sm:text-sm font-black uppercase tracking-wider shadow-[0_4px_15px_rgba(244,63,94,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer min-h-[44px]"
                  >
                    Try Again
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { triggerHaptic('click'); clearCurrentSession(); initBoard(); }}
                  className="w-full py-2.5 sm:py-3 bg-[#11193b] border border-indigo-400/50 rounded-xl font-headline text-xs font-bold uppercase tracking-wider hover:bg-indigo-900 text-white cursor-pointer transition-all min-h-[44px]"
                >
                  Replay
                </button>
                <div className="flex gap-2 w-full mt-0.5">
                  <button
                    type="button"
                    onClick={() => { triggerHaptic('click'); setTab('map'); }}
                    className="flex-1 py-2 sm:py-2.5 bg-[#11193b] border border-indigo-500/40 rounded-xl font-headline text-xs font-bold uppercase tracking-wider hover:bg-indigo-950 text-violet-300 cursor-pointer transition-all min-h-[40px]"
                  >
                    Levels
                  </button>
                  <button
                    type="button"
                    onClick={() => { triggerHaptic('click'); setTab('home'); }}
                    className="flex-1 py-2 sm:py-2.5 bg-[#11193b] border border-indigo-500/40 rounded-xl font-headline text-xs font-bold uppercase tracking-wider hover:bg-indigo-950 text-violet-300 cursor-pointer transition-all min-h-[40px]"
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
