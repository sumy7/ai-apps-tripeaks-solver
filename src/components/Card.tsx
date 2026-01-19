import React from 'react';
import { Card as CardType } from '../types';
import { getRankDisplay, getSuitSymbol, getSuitColor } from '../gameUtils';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  isPlayable?: boolean;
}

const Card: React.FC<CardProps> = ({ card, onClick, isPlayable = false }) => {
  if (card.removed) {
    return (
      <div className="w-16 h-24 rounded-lg border-2 border-dashed border-gray-600 bg-gray-800 opacity-30" />
    );
  }

  const isLabeled = card.suit !== null && card.rank !== null;
  const suitColor = getSuitColor(card.suit);

  return (
    <div
      className={`w-16 h-24 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
        card.blocked
          ? 'bg-gray-700 border-gray-600'
          : 'bg-white border-gray-300 shadow-md'
      } ${
        isPlayable
          ? 'cursor-pointer hover:shadow-xl hover:scale-105 ring-2 ring-green-500'
          : card.blocked
          ? ''
          : 'cursor-pointer hover:shadow-lg'
      }`}
      onClick={onClick}
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
  );
};

export default Card;
