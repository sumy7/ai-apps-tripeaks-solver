import { Card, CardPosition, Suit, Rank, ExportData } from './types';

// TriPeaks pyramid layout positions (28 cards in 4 rows)
// Row 0: 3 cards (peaks)
// Row 1: 6 cards
// Row 2: 9 cards
// Row 3: 10 cards (base)
export const PYRAMID_LAYOUT: CardPosition[] = [
  // Row 0 - 3 peaks
  { row: 0, col: 0 },
  { row: 0, col: 6 },
  { row: 0, col: 12 },
  // Row 1 - 6 cards
  { row: 1, col: -1 },
  { row: 1, col: 1 },
  { row: 1, col: 5 },
  { row: 1, col: 7 },
  { row: 1, col: 11 },
  { row: 1, col: 13 },
  // Row 2 - 9 cards
  { row: 2, col: -2 },
  { row: 2, col: 0 },
  { row: 2, col: 2 },
  { row: 2, col: 4 },
  { row: 2, col: 6 },
  { row: 2, col: 8 },
  { row: 2, col: 10 },
  { row: 2, col: 12 },
  { row: 2, col: 14 },
  // Row 3 - 10 cards (base)
  { row: 3, col: -3 },
  { row: 3, col: -1 },
  { row: 3, col: 1 },
  { row: 3, col: 3 },
  { row: 3, col: 5 },
  { row: 3, col: 7 },
  { row: 3, col: 9 },
  { row: 3, col: 11 },
  { row: 3, col: 13 },
  { row: 3, col: 15 },
];

// Initialize a new game with random cards
export const initializeGame = (): { pyramid: Card[]; stock: Card[] } => {
  // Create a full deck
  const suits: Array<'hearts' | 'diamonds' | 'clubs' | 'spades'> = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  
  const deck: Array<{ suit: Suit; rank: Rank }> = [];
  suits.forEach(suit => {
    ranks.forEach(rank => {
      deck.push({ suit, rank });
    });
  });
  
  // Shuffle the deck using Fisher-Yates algorithm
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  
  // Deal cards to pyramid (28 cards)
  const pyramid: Card[] = PYRAMID_LAYOUT.map((pos, index) => ({
    id: `pyramid-${index}`,
    suit: deck[index].suit,
    rank: deck[index].rank,
    position: pos,
    removed: false,
    blocked: true,
  }));

  // Deal remaining cards to stock (24 cards)
  const stock: Card[] = deck.slice(28).map((cardData, index) => ({
    id: `stock-${index}`,
    suit: cardData.suit,
    rank: cardData.rank,
    position: { row: -1, col: -1 },
    removed: false,
    blocked: false,
  }));

  // Update blocked status for pyramid cards
  updateBlockedStatus(pyramid);

  return { pyramid, stock };
};

// Update blocked status for all pyramid cards
export const updateBlockedStatus = (pyramid: Card[]): void => {
  pyramid.forEach((card) => {
    if (card.removed) {
      card.blocked = false;
      return;
    }

    // Check if this card is blocked by cards in the row below
    const blockingCards = pyramid.filter((c) => {
      if (c.removed) return false;
      
      // A card is blocked by cards in the row below that overlap
      if (c.position.row === card.position.row + 1) {
        const colDiff = Math.abs(c.position.col - card.position.col);
        return colDiff <= 1;
      }
      return false;
    });

    card.blocked = blockingCards.length > 0;
  });
};

// Check if a card can be played on the waste pile
export const canPlayCard = (card: Card, wasteCard: Card | null): boolean => {
  if (!wasteCard || card.rank === null || wasteCard.rank === null) {
    return false;
  }

  const diff = Math.abs(card.rank - wasteCard.rank);
  // Cards are adjacent if they differ by 1, or if they are K and A
  return diff === 1 || diff === 12;
};

// Get rank display string
export const getRankDisplay = (rank: Rank): string => {
  if (rank === null) return '?';
  if (rank === 1) return 'A';
  if (rank === 11) return 'J';
  if (rank === 12) return 'Q';
  if (rank === 13) return 'K';
  return rank.toString();
};

// Get suit symbol
export const getSuitSymbol = (suit: Suit): string => {
  if (suit === null) return '';
  const symbols: Record<string, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  };
  return symbols[suit] || '';
};

// Get suit color
export const getSuitColor = (suit: Suit): string => {
  if (suit === 'hearts' || suit === 'diamonds') return 'text-red-600';
  if (suit === 'clubs' || suit === 'spades') return 'text-black';
  return 'text-gray-600';
};

// Deep clone cards array
export const cloneCards = (cards: Card[]): Card[] => {
  return cards.map((card) => ({ ...card, position: { ...card.position } }));
};

// Export game state to JSON
export const exportGameState = (pyramid: Card[], stock: Card[]): string => {
  const exportData: ExportData = {
    pyramid: pyramid.map((card) => ({
      id: card.id,
      suit: card.suit,
      rank: card.rank,
      position: { ...card.position },
    })),
    stock: stock.map((card) => ({
      id: card.id,
      suit: card.suit,
      rank: card.rank,
    })),
  };
  return JSON.stringify(exportData, null, 2);
};

// Import game state from JSON
export const importGameState = (
  jsonString: string
): { pyramid: Card[]; stock: Card[] } | null => {
  try {
    const data: ExportData = JSON.parse(jsonString);

    const pyramid: Card[] = data.pyramid.map((cardData) => ({
      id: cardData.id,
      suit: cardData.suit,
      rank: cardData.rank,
      position: cardData.position,
      removed: false,
      blocked: true,
    }));

    const stock: Card[] = data.stock.map((cardData) => ({
      id: cardData.id,
      suit: cardData.suit,
      rank: cardData.rank,
      position: { row: -1, col: -1 },
      removed: false,
      blocked: false,
    }));

    updateBlockedStatus(pyramid);

    return { pyramid, stock };
  } catch (error) {
    console.error('Failed to import game state:', error);
    return null;
  }
};
