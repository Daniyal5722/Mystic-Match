const fs = require('fs');
let code = fs.readFileSync('src/components/GameView.tsx', 'utf8');

code = code.replace(
  "import React, { useState, useEffect, useCallback, useMemo } from 'react';",
  "import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';"
);

code = code.replace(
  "  const [movesLeft, setMovesLeft] = useState<number>(25);\n  const [gemsCollected, setGemsCollected] = useState<number>(0);",
  "  const [movesLeft, setMovesLeft] = useState<number>(25);\n  const [gemsCollected, setGemsCollected] = useState<number>(0);\n  const scoreRef = useRef(0);\n  const movesLeftRef = useRef(25);\n  const gemsCollectedRef = useRef(0);\n"
);

// update initBoard
code = code.replace(
  "    setScore(0);\n    setMovesLeft(25);\n    setGemsCollected(0);",
  "    setScore(0);\n    setMovesLeft(25);\n    setGemsCollected(0);\n    scoreRef.current = 0;\n    movesLeftRef.current = 25;\n    gemsCollectedRef.current = 0;"
);

// update handleGemClick
code = code.replace(
  "      const nextMoves = movesLeft - 1;\n      setMovesLeft(nextMoves);\n      processMatches(newBoard, matches, nextMoves);",
  "      const nextMoves = movesLeft - 1;\n      setMovesLeft(nextMoves);\n      movesLeftRef.current = nextMoves;\n      processMatches(newBoard, matches);"
);

// update processMatches
code = code.replace(
  "  const processMatches = (currentBoard: BoardGem[][], matched: { row: number; col: number }[], remainingMoves?: number) => {",
  "  const processMatches = (currentBoard: BoardGem[][], matched: { row: number; col: number }[]) => {"
);

code = code.replace(
  "    const matchScore = matched.length * 50;\n    const nextScore = score + matchScore;\n    const nextGemsCount = gemsCollected + targetGemsFound;\n\n    setScore(nextScore);\n    setGemsCollected(nextGemsCount);\n\n    if (nextGemsCount >= objectiveTarget) {\n      setGameResult('won');\n      triggerHaptic('win');\n      onGameEnd(true, nextScore);\n      triggerPushNotification('Stage Clear!', `You collected ${objectiveTarget} ${objectiveType}s! Score: ${nextScore}`);\n    } else if (remainingMoves !== undefined && remainingMoves <= 0) {\n      setGameResult('lost');\n      triggerHaptic('lose');\n      onGameEnd(false, nextScore);\n      triggerPushNotification('Game Over', 'You ran out of moves! Try again.');\n    }",
  "    const matchScore = matched.length * 50;\n    scoreRef.current += matchScore;\n    gemsCollectedRef.current += targetGemsFound;\n\n    setScore(scoreRef.current);\n    setGemsCollected(gemsCollectedRef.current);"
);

// update applyGravityAndFill
code = code.replace(
  "      } else {\n        // Clear isNew flags\n        const finalBoard = nextBoard.map(row => row.map(g => ({ ...g, isNew: false })));\n        setBoard(finalBoard);\n        setIsProcessing(false);\n        \n        // Shuffle check\n        if (!checkPossibleMoves(finalBoard)) {\n          triggerHaptic('booster');\n          setComboText('SHUFFLING...');\n          setTimeout(() => {\n            setComboText(null);\n            shuffleBoard();\n          }, 800);\n        }\n      }",
  "      } else {\n        // Clear isNew flags\n        const finalBoard = nextBoard.map(row => row.map(g => ({ ...g, isNew: false })));\n        setBoard(finalBoard);\n        setIsProcessing(false);\n        \n        if (gemsCollectedRef.current >= objectiveTarget) {\n          setGameResult('won');\n          triggerHaptic('win');\n          onGameEnd(true, scoreRef.current);\n          triggerPushNotification('Stage Clear!', `You collected ${objectiveTarget} ${objectiveType}s! Score: ${scoreRef.current}`);\n        } else if (movesLeftRef.current <= 0) {\n          setGameResult('lost');\n          triggerHaptic('lose');\n          onGameEnd(false, scoreRef.current);\n          triggerPushNotification('Game Over', 'You ran out of moves! Try again.');\n        } else if (!checkPossibleMoves(finalBoard)) {\n          // Shuffle check\n          triggerHaptic('booster');\n          setComboText('SHUFFLING...');\n          setTimeout(() => {\n            setComboText(null);\n            shuffleBoard();\n          }, 800);\n        }\n      }"
);

// update triggerHammerSmash
code = code.replace(
  "      if (gem.type === objectiveType) setGemsCollected(s => s + 1);\n      setScore(s => s + 100);\n      applyGravityAndFill(nextBoard);",
  "      if (gem.type === objectiveType) gemsCollectedRef.current += 1;\n      scoreRef.current += 100;\n      setGemsCollected(gemsCollectedRef.current);\n      setScore(scoreRef.current);\n      applyGravityAndFill(nextBoard);"
);

fs.writeFileSync('src/components/GameView.tsx', code);
