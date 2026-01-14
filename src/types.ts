// Card suits
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades' | null;

// Card ranks (A=1, J=11, Q=12, K=13)
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | null;

// Card position in the layout
export interface CardPosition {
  row: number;
  col: number;
}

// Card state
export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  position: CardPosition;
  removed: boolean;
  blocked: boolean; // Whether the card is covered by other cards
}

// Game state
export interface GameState {
  pyramid: Card[]; // 28 cards in pyramid layout
  stock: Card[]; // Remaining cards in stock
  waste: Card[]; // Top card of waste pile
  history: HistoryStep[];
  currentStepIndex: number;
}

// History step for solver
export interface HistoryStep {
  description: string;
  gameState: {
    pyramid: Card[];
    stock: Card[];
    waste: Card | null;
  };
}

// Export data structure
export interface ExportData {
  pyramid: Array<{
    id: string;
    suit: Suit;
    rank: Rank;
    position: CardPosition;
  }>;
  stock: Array<{
    id: string;
    suit: Suit;
    rank: Rank;
  }>;
}
