import React, { useState, useCallback } from 'react';
import { Card, HistoryStep } from './types';
import {
  initializeGame,
  cloneCards,
  exportGameState,
  importGameState,
  canPlayCard,
  updateBlockedStatus,
  getRankDisplay,
} from './gameUtils';
import { solveGame } from './solver';
import Board from './components/Board';
import Controls from './components/Controls';
import History from './components/History';

function App() {
  const [pyramid, setPyramid] = useState<Card[]>([]);
  const [stock, setStock] = useState<Card[]>([]);
  const [waste, setWaste] = useState<Card | null>(null);
  const [history, setHistory] = useState<HistoryStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [message, setMessage] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(true); // true = playing mode, false = viewing solution

  // Store original game state for reset functionality
  const [initialGameState, setInitialGameState] = useState<{
    pyramid: Card[];
    stock: Card[];
  } | null>(null);

  // Initialize game on mount
  React.useEffect(() => {
    handleNewGame();
  }, []);

  const handleNewGame = useCallback(() => {
    const { pyramid: newPyramid, stock: newStock } = initializeGame();
    setPyramid(newPyramid);
    setStock(newStock);
    setWaste(null);
    setHistory([]);
    setCurrentStepIndex(-1);
    setInitialGameState({ pyramid: cloneCards(newPyramid), stock: [...newStock] });
    setIsPlaying(true);
    setMessage('新游戏开始！点击卡牌移动到弃牌堆，或点击库存翻牌');
  }, []);

  const handleCardClick = useCallback(
    (cardId: string) => {
      if (!isPlaying) {
        setMessage('当前正在查看求解步骤，无法手动移动卡牌');
        return;
      }

      // Find the card in pyramid
      const cardIndex = pyramid.findIndex((c) => c.id === cardId);
      if (cardIndex === -1) return;

      const card = pyramid[cardIndex];

      // Check if card is playable (not removed and not blocked)
      if (card.removed || card.blocked) {
        setMessage('该卡牌被其他卡牌覆盖，无法移动');
        return;
      }

      // Check if card can be played on waste
      if (!waste) {
        setMessage('请先从库存翻出一张卡牌');
        return;
      }

      if (!canPlayCard(card, waste)) {
        setMessage(`无法移动：${getRankDisplay(card.rank)} 与 ${getRankDisplay(waste.rank)} 不相邻`);
        return;
      }

      // Play the card
      const newPyramid = [...pyramid];
      newPyramid[cardIndex] = { ...card, removed: true };
      updateBlockedStatus(newPyramid);

      setPyramid(newPyramid);
      setWaste({ ...card });
      setMessage('');

      // Check if game is won
      const remainingCards = newPyramid.filter((c) => !c.removed);
      if (remainingCards.length === 0) {
        setMessage('🎉 恭喜！你赢了！所有卡牌已移除');
        setIsPlaying(false);
      }
    },
    [pyramid, waste, isPlaying]
  );

  const handleStockClick = useCallback(() => {
    if (!isPlaying) {
      setMessage('当前正在查看求解步骤，无法翻牌');
      return;
    }

    if (stock.length === 0) {
      setMessage('库存已空');
      return;
    }

    const drawnCard = stock[0];
    const newStock = stock.slice(1);
    setStock(newStock);
    setWaste({ ...drawnCard });
    setMessage('');

    // Check if game is lost after drawing the last card
    if (newStock.length === 0) {
      setTimeout(() => {
        const playableCards = pyramid.filter((c) => !c.removed && !c.blocked);
        const canPlay = playableCards.some((c) => canPlayCard(c, drawnCard));
        if (!canPlay) {
          const remaining = pyramid.filter((c) => !c.removed);
          if (remaining.length > 0) {
            setMessage(`😞 游戏失败，剩余 ${remaining.length} 张卡牌`);
            setIsPlaying(false);
          }
        }
      }, 100);
    }
  }, [stock, pyramid, isPlaying]);

  const handleSolve = useCallback(() => {
    setMessage('开始求解...');
    const result = solveGame(pyramid, stock, waste);

    setHistory(result.history);
    setCurrentStepIndex(result.history.length - 1);
    setIsPlaying(false);

    if (result.success) {
      setMessage('✓ 求解成功！所有金字塔卡牌已移除');
    } else {
      setMessage(`✗ ${result.reason || '求解失败'}`);
    }

    // Apply the final state
    if (result.history.length > 0) {
      const finalStep = result.history[result.history.length - 1];
      setPyramid(cloneCards(finalStep.gameState.pyramid));
      setStock([...finalStep.gameState.stock]);
      setWaste(
        finalStep.gameState.waste ? { ...finalStep.gameState.waste } : null
      );
    }
  }, [pyramid, stock, waste]);

  const handleReset = useCallback(() => {
    if (!initialGameState) return;

    // Reset to initial game state
    setPyramid(cloneCards(initialGameState.pyramid));
    setStock([...initialGameState.stock]);
    setWaste(null);
    setHistory([]);
    setCurrentStepIndex(-1);
    setIsPlaying(true);
    setMessage('游戏已重置到初始状态');
  }, [initialGameState]);

  const handleContinueSolve = useCallback(() => {
    // Continue solving from current state
    setMessage('从当前状态继续求解...');
    const result = solveGame(pyramid, stock, waste);

    setHistory(result.history);
    setCurrentStepIndex(result.history.length - 1);
    setIsPlaying(false);

    if (result.success) {
      setMessage('✓ 求解成功！所有金字塔卡牌已移除');
    } else {
      setMessage(`✗ ${result.reason || '求解失败'}`);
    }

    // Apply the final state
    if (result.history.length > 0) {
      const finalStep = result.history[result.history.length - 1];
      setPyramid(cloneCards(finalStep.gameState.pyramid));
      setStock([...finalStep.gameState.stock]);
      setWaste(
        finalStep.gameState.waste ? { ...finalStep.gameState.waste } : null
      );
    }
  }, [pyramid, stock, waste]);

  const handleExport = useCallback(() => {
    const exportData = exportGameState(pyramid, stock);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tripeaks-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMessage('游戏状态已导出');
  }, [pyramid, stock]);

  const handleImport = useCallback((jsonString: string) => {
    const imported = importGameState(jsonString);
    if (imported) {
      setPyramid(imported.pyramid);
      setStock(imported.stock);
      setWaste(null);
      setHistory([]);
      setCurrentStepIndex(-1);
      setInitialGameState({ pyramid: cloneCards(imported.pyramid), stock: [...imported.stock] });
      setIsPlaying(true);
      setMessage('游戏状态已导入');
    } else {
      setMessage('✗ 导入失败，请检查文件格式');
    }
  }, []);

  const handleStepClick = useCallback(
    (index: number) => {
      if (index >= 0 && index < history.length) {
        const step = history[index];
        setPyramid(cloneCards(step.gameState.pyramid));
        setStock([...step.gameState.stock]);
        setWaste(step.gameState.waste ? { ...step.gameState.waste } : null);
        setCurrentStepIndex(index);
        setIsPlaying(false);
        setMessage(`查看步骤 ${index}: ${step.description}`);
      }
    },
    [history]
  );

  const handleResume = useCallback(() => {
    setIsPlaying(true);
    setMessage('继续游戏');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center text-white mb-2">
          TriPeaks 游戏
        </h1>
        <p className="text-center text-gray-400 mb-6">
          点击卡牌移动到弃牌堆 | 点击库存翻牌 | 点击"求解"查看解法
        </p>

        {message && (
          <div
            className={`max-w-4xl mx-auto mb-4 p-3 rounded-lg text-center ${
              message.startsWith('✓') || message.includes('🎉')
                ? 'bg-green-900 text-green-200'
                : message.startsWith('✗') || message.includes('😞')
                ? 'bg-red-900 text-red-200'
                : 'bg-blue-900 text-blue-200'
            }`}
          >
            {message}
          </div>
        )}

        <Controls
          onNewGame={handleNewGame}
          onSolve={isPlaying ? handleSolve : handleContinueSolve}
          onReset={handleReset}
          onExport={handleExport}
          onImport={handleImport}
          isPlaying={isPlaying}
          onResume={handleResume}
        />

        <Board
          pyramid={pyramid}
          stock={stock}
          waste={waste}
          onCardClick={handleCardClick}
          onStockClick={handleStockClick}
          isPlaying={isPlaying}
        />

        <History
          history={history}
          currentStepIndex={currentStepIndex}
          onStepClick={handleStepClick}
        />
      </div>
    </div>
  );
}

export default App;
