export type ItemType = 'lost' | 'found';

export type ItemCategory =
  | 'electronics'
  | 'id_cards'
  | 'keys_wallets'
  | 'bags'
  | 'clothing'
  | 'study_gear'
  | 'bottles'
  | 'jewelry'
  | 'other';

export type CampusBuildingId =
  | 'library'
  | 'student_union'
  | 'science_quad'
  | 'rec_center'
  | 'oak_quad'
  | 'dining_hall'
  | 'dorm_north'
  | 'arts_center';

export interface CampusLocation {
  id: CampusBuildingId;
  name: string;
  shortName: string;
  coords: { x: number; y: number }; // percentage 0-100 on map
  description: string;
  safeDropoffSpot: string;
}

export interface ClaimRequest {
  id: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone?: string;
  answerText: string;
  createdAt: number;
  status: 'pending' | 'approved' | 'rejected';
  responseNote?: string;
}

export interface MessageThread {
  id: string;
  itemId: string;
  itemTitle: string;
  senderName: string;
  senderEmail: string;
  recipientEmail: string;
  messages: Array<{
    id: string;
    sender: 'user' | 'poster';
    text: string;
    timestamp: number;
    suggestedMeetingSpot?: string;
  }>;
  createdAt: number;
  unread: boolean;
}

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  description: string;
  category: ItemCategory;
  buildingId: CampusBuildingId;
  locationDetails: string;
  coordinates: { x: number; y: number };
  date: string; // YYYY-MM-DD
  createdAt: number;
  expiresAt: number; // 30-day auto expiry
  imageUrl: string;
  additionalImages?: string[];
  posterName: string;
  posterEmail: string;
  posterPhone?: string;
  posterPin: string; // 4-digit code for poster to manage their item
  status: 'active' | 'claimed' | 'expired';
  claimedAt?: number;
  claimedStory?: string;
  secretQuestion?: string; // Finder verification challenge question
  secretAnswer?: string; // Correct answer or expected keywords
  claimRequests?: ClaimRequest[];
  reportCount?: number;
  isFlagged?: boolean;
  flagReasons?: string[];
  viewsCount?: number;
}

export interface MatchResult {
  targetItem: Item;
  candidateItem: Item;
  score: number; // 0 to 100
  breakdown: {
    categoryMatch: boolean;
    categoryScore: number;
    textScore: number;
    locationScore: number;
    dateScore: number;
    commonKeywords: string[];
  };
  reason: string;
}

export interface MatchAlert {
  id: string;
  userId: string;
  keyword: string;
  category?: ItemCategory | 'all';
  type: ItemType;
  createdAt: number;
  active: boolean;
  matchCount?: number;
}
