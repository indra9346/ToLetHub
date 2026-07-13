export interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  isDemoMode?: boolean;
  listings?: ChatListingCard[];
  suggestions?: string[];
  filters?: any;
}

export interface ChatListingCard {
  id: string;
  title: string;
  rent: number;
  locality: string;
  propertyType: 'PG' | 'Room' | 'House';
  images?: string[];
  availableFrom?: string;
}

export interface ChatResponse {
  success: boolean;
  isDemoMode?: boolean;
  text: string;
  filters?: any;
  listings?: ChatListingCard[];
  suggestions?: string[];
}
