import React, { useState } from 'react';
import { Card as CardType, Suit, Rank } from '../types';
import { getRankDisplay, getSuitSymbol, getSuitColor } from '../gameUtils';

interface CardProps {
  card: CardType;
  onLabelChange?: (suit: Suit, rank: Rank) => void;
  disabled?: boolean;
}

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

const Card: React.FC<CardProps> = ({ card, onLabelChange, disabled = false }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const handleRightClick = (e: React.MouseEvent) => {
    if (disabled || card.removed) return;
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setShowMenu(true);
  };

  const handleLabelSelect = (suit: Suit, rank: Rank) => {
    if (onLabelChange) {
      onLabelChange(suit, rank);
    }
    setShowMenu(false);
  };

  const handleClearLabel = () => {
    if (onLabelChange) {
      onLabelChange(null, null);
    }
    setShowMenu(false);
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClick = () => setShowMenu(false);
    if (showMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showMenu]);

  if (card.removed) {
    return (
      <div className="w-16 h-24 rounded-lg border-2 border-dashed border-gray-600 bg-gray-800 opacity-30" />
    );
  }

  const isLabeled = card.suit !== null && card.rank !== null;
  const suitColor = getSuitColor(card.suit);

  return (
    <>
      <div
        className={`w-16 h-24 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
          card.blocked
            ? 'bg-gray-700 border-gray-600'
            : 'bg-white border-gray-300 shadow-md hover:shadow-lg'
        } ${disabled ? 'opacity-50' : ''}`}
        onContextMenu={handleRightClick}
      >
        {isLabeled ? (
          <>
            <div className={`text-2xl font-bold ${suitColor}`}>
              {getRankDisplay(card.rank)}
            </div>
            <div className={`text-3xl ${suitColor}`}>
              {getSuitSymbol(card.suit)}
            </div>
          </>
        ) : (
          <div className="text-4xl text-gray-500">?</div>
        )}
      </div>

      {/* Context menu */}
      {showMenu && (
        <div
          className="fixed bg-white rounded-lg shadow-xl border border-gray-300 p-2 z-50 max-h-96 overflow-y-auto"
          style={{ left: menuPosition.x, top: menuPosition.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-2">
            <button
              onClick={handleClearLabel}
              className="w-full px-3 py-1 text-sm text-left hover:bg-gray-100 rounded text-gray-700"
            >
              清除标注
            </button>
          </div>
          <div className="border-t border-gray-200 pt-2">
            {SUITS.map((suit) => (
              <div key={suit} className="mb-2">
                <div className={`text-sm font-semibold px-2 ${getSuitColor(suit)}`}>
                  {getSuitSymbol(suit)} {suit}
                </div>
                <div className="grid grid-cols-7 gap-1 mt-1">
                  {RANKS.map((rank) => (
                    <button
                      key={`${suit}-${rank}`}
                      onClick={() => handleLabelSelect(suit, rank)}
                      className={`px-2 py-1 text-xs rounded hover:bg-gray-100 ${getSuitColor(
                        suit
                      )}`}
                    >
                      {getRankDisplay(rank)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Card;
