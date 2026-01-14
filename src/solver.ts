import { Card, HistoryStep } from './types';
import { canPlayCard, cloneCards, updateBlockedStatus } from './gameUtils';

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

    // Check if any playable card has unknown rank
    const unknownCard = playableCards.find((card) => card.rank === null);
    if (unknownCard) {
      history.push({
        description: `遇到未标注的卡牌 (位置: 行${unknownCard.position.row}, 列${unknownCard.position.col})`,
        gameState: {
          pyramid: cloneCards(currentPyramid),
          stock: [...currentStock],
          waste: currentWaste ? { ...currentWaste } : null,
        },
      });
      return {
        success: false,
        history,
        reason: '遇到未标注的可移动卡牌，求解停止',
      };
    }

    // Try to play a card from the pyramid
    let cardPlayed = false;
    for (const card of playableCards) {
      if (currentWaste && canPlayCard(card, currentWaste)) {
        // Play this card
        const cardIndex = currentPyramid.findIndex((c) => c.id === card.id);
        currentPyramid[cardIndex].removed = true;
        currentWaste = { ...card };

        history.push({
          description: `从金字塔移除卡牌 ${card.id}`,
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

      // Check if the drawn card is labeled
      if (drawnCard.rank === null) {
        history.push({
          description: `遇到未标注的库存卡牌`,
          gameState: {
            pyramid: cloneCards(currentPyramid),
            stock: [...currentStock],
            waste: currentWaste ? { ...currentWaste } : null,
          },
        });
        return {
          success: false,
          history,
          reason: '遇到未标注的库存卡牌，求解停止',
        };
      }

      currentStock = currentStock.slice(1);
      currentWaste = { ...drawnCard };

      history.push({
        description: `从库存翻出卡牌 ${drawnCard.id}`,
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
