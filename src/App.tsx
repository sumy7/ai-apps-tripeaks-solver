import React, { useState, useCallback } from 'react';
import { Card, Suit, Rank, HistoryStep } from './types';
import {
  initializeGame,
  cloneCards,
  exportGameState,
  importGameState,
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

  // Store original labels for reset functionality
  const [originalLabels, setOriginalLabels] = useState<
    Map<string, { suit: Suit; rank: Rank }>
  >(new Map());

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
    setOriginalLabels(new Map());
    setMessage('新游戏开始！右键点击卡牌标注花色和点数');
  }, []);

  const handleCardLabelChange = useCallback(
    (cardId: string, suit: Suit, rank: Rank) => {
      // Update the card label
      setPyramid((prev) =>
        prev.map((card) =>
          card.id === cardId ? { ...card, suit, rank } : card
        )
      );

      setStock((prev) =>
        prev.map((card) =>
          card.id === cardId ? { ...card, suit, rank } : card
        )
      );

      // Store the label for reset
      setOriginalLabels((prev) => {
        const newMap = new Map(prev);
        if (suit === null && rank === null) {
          newMap.delete(cardId);
        } else {
          newMap.set(cardId, { suit, rank });
        }
        return newMap;
      });

      setMessage('');
    },
    []
  );

  const handleSolve = useCallback(() => {
    setMessage('开始求解...');
    const result = solveGame(pyramid, stock, waste);

    setHistory(result.history);
    setCurrentStepIndex(result.history.length - 1);

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
    // Reset board to initial positions but keep labels
    const { pyramid: newPyramid, stock: newStock } = initializeGame();

    // Reapply the labels
    const pyramidWithLabels = newPyramid.map((card) => {
      const label = originalLabels.get(card.id);
      return label ? { ...card, suit: label.suit, rank: label.rank } : card;
    });

    const stockWithLabels = newStock.map((card) => {
      const label = originalLabels.get(card.id);
      return label ? { ...card, suit: label.suit, rank: label.rank } : card;
    });

    setPyramid(pyramidWithLabels);
    setStock(stockWithLabels);
    setWaste(null);
    setHistory([]);
    setCurrentStepIndex(-1);
    setMessage('棋盘已重置，标注信息保留');
  }, [originalLabels]);

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

      // Update original labels
      const newLabels = new Map<string, { suit: Suit; rank: Rank }>();
      [...imported.pyramid, ...imported.stock].forEach((card) => {
        if (card.suit !== null && card.rank !== null) {
          newLabels.set(card.id, { suit: card.suit, rank: card.rank });
        }
      });
      setOriginalLabels(newLabels);

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
        setMessage(`查看步骤 ${index}: ${step.description}`);
      }
    },
    [history]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center text-white mb-2">
          TriPeaks 求解器
        </h1>
        <p className="text-center text-gray-400 mb-6">
          右键点击卡牌标注花色和点数 | 点击"求解"自动求解游戏
        </p>

        {message && (
          <div
            className={`max-w-4xl mx-auto mb-4 p-3 rounded-lg text-center ${
              message.startsWith('✓')
                ? 'bg-green-900 text-green-200'
                : message.startsWith('✗')
                ? 'bg-red-900 text-red-200'
                : 'bg-blue-900 text-blue-200'
            }`}
          >
            {message}
          </div>
        )}

        <Controls
          onNewGame={handleNewGame}
          onSolve={handleSolve}
          onReset={handleReset}
          onExport={handleExport}
          onImport={handleImport}
        />

        <Board
          pyramid={pyramid}
          stock={stock}
          waste={waste}
          onCardLabelChange={handleCardLabelChange}
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
