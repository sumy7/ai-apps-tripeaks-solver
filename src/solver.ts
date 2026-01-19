import { Card, HistoryStep } from './types';
import { canPlayCard, cloneCards, updateBlockedStatus, getSuitSymbol, getRankDisplay } from './gameUtils';

interface SolverResult {
  success: boolean;
  history: HistoryStep[];
  reason?: string;
}

// Solve the TriPeaks game using a greedy approach
export const solveGame = (
  pyramid: Card[],
  stock: Card[],
  waste: Card | null
): SolverResult => {
  const history: HistoryStep[] = [];

  // Clone the initial state
  let currentPyramid = cloneCards(pyramid);
  let currentStock = [...stock];
  let currentWaste = waste ? { ...waste } : null;

  // Add initial state to history
  history.push({
    description: '初始状态',
    gameState: {
      pyramid: cloneCards(currentPyramid),
      stock: [...currentStock],
      waste: currentWaste ? { ...currentWaste } : null,
    },
  });

  let moveCount = 0;
  const maxMoves = 1000; // Prevent infinite loops

  while (moveCount < maxMoves) {
    moveCount++;

    // Update blocked status
    updateBlockedStatus(currentPyramid);

    // Find playable cards in pyramid
    const playableCards = currentPyramid.filter(
      (card) => !card.removed && !card.blocked
    );

    // Try to play a card from the pyramid
    let cardPlayed = false;
    for (const card of playableCards) {
      if (currentWaste && canPlayCard(card, currentWaste)) {
        // Play this card
        const cardIndex = currentPyramid.findIndex((c) => c.id === card.id);
        currentPyramid[cardIndex].removed = true;
        currentWaste = { ...card };

        history.push({
          description: `从金字塔移除 ${getSuitSymbol(card.suit)}${getRankDisplay(card.rank)}`,
          gameState: {
            pyramid: cloneCards(currentPyramid),
            stock: [...currentStock],
            waste: { ...currentWaste },
          },
        });

        cardPlayed = true;
        break;
      }
    }

    if (cardPlayed) {
      continue;
    }

    // No pyramid card can be played, try to draw from stock
    if (currentStock.length > 0) {
      const drawnCard = currentStock[0];
      currentStock = currentStock.slice(1);
      currentWaste = { ...drawnCard };

      history.push({
        description: `从库存翻出 ${getSuitSymbol(drawnCard.suit)}${getRankDisplay(drawnCard.rank)}`,
        gameState: {
          pyramid: cloneCards(currentPyramid),
          stock: [...currentStock],
          waste: { ...currentWaste },
        },
      });

      continue;
    }

    // No more moves possible
    const remainingCards = currentPyramid.filter((c) => !c.removed);
    if (remainingCards.length === 0) {
      history.push({
        description: '求解成功！所有金字塔卡牌已移除',
        gameState: {
          pyramid: cloneCards(currentPyramid),
          stock: [],
          waste: currentWaste ? { ...currentWaste } : null,
        },
      });
      return {
        success: true,
        history,
      };
    } else {
      history.push({
        description: `无法继续，剩余 ${remainingCards.length} 张卡牌`,
        gameState: {
          pyramid: cloneCards(currentPyramid),
          stock: [],
          waste: currentWaste ? { ...currentWaste } : null,
        },
      });
      return {
        success: false,
        history,
        reason: '无法继续移除卡牌',
      };
    }
  }

  return {
    success: false,
    history,
    reason: '超过最大移动次数',
  };
};
