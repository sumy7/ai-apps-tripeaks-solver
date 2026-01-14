import React from 'react';
import { Card as CardType, Suit, Rank } from '../types';
import Card from './Card';
import { getRankDisplay, getSuitSymbol, getSuitColor } from '../gameUtils';

interface BoardProps {
  pyramid: CardType[];
  stock: CardType[];
  waste: CardType | null;
  onCardLabelChange: (cardId: string, suit: Suit, rank: Rank) => void;
  disabled?: boolean;
}

const Board: React.FC<BoardProps> = ({
  pyramid,
  stock,
  waste,
  onCardLabelChange,
  disabled = false,
}) => {
  // Group pyramid cards by row
  const pyramidByRow: CardType[][] = [[], [], [], []];
  pyramid.forEach((card) => {
    pyramidByRow[card.position.row].push(card);
  });

  // Sort cards in each row by column
  pyramidByRow.forEach((row) => {
    row.sort((a, b) => a.position.col - b.position.col);
  });

  return (
    <div className="flex flex-col items-center gap-8 p-8">
      {/* Pyramid */}
      <div className="flex flex-col items-center gap-2">
        {pyramidByRow.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex gap-2"
            style={{
              marginLeft: `${(3 - rowIndex) * 32}px`,
            }}
          >
            {row.map((card) => (
              <Card
                key={card.id}
                card={card}
                onLabelChange={(suit, rank) =>
                  onCardLabelChange(card.id, suit, rank)
                }
                disabled={disabled}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Stock and Waste */}
      <div className="flex gap-8 items-center">
        {/* Stock */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-sm text-gray-400">库存 ({stock.length})</div>
          <div className="relative">
            {stock.length > 0 ? (
              <div className="w-16 h-24 rounded-lg bg-blue-600 border-2 border-blue-700 flex items-center justify-center">
                <div className="text-white font-bold">{stock.length}</div>
              </div>
            ) : (
              <div className="w-16 h-24 rounded-lg border-2 border-dashed border-gray-600 bg-gray-800" />
            )}
          </div>
        </div>

        {/* Waste */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-sm text-gray-400">弃牌堆</div>
          {waste ? (
            <div className="w-16 h-24 rounded-lg border-2 bg-white border-gray-300 shadow-md flex flex-col items-center justify-center">
              {waste.suit && waste.rank ? (
                <>
                  <div className={`text-2xl font-bold ${getSuitColor(waste.suit)}`}>
                    {getRankDisplay(waste.rank)}
                  </div>
                  <div className={`text-3xl ${getSuitColor(waste.suit)}`}>
                    {getSuitSymbol(waste.suit)}
                  </div>
                </>
              ) : (
                <div className="text-4xl text-gray-500">?</div>
              )}
            </div>
          ) : (
            <div className="w-16 h-24 rounded-lg border-2 border-dashed border-gray-600 bg-gray-800" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Board;
