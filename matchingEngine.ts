import { Item, MatchResult } from '../types';
import { CAMPUS_LOCATIONS } from '../data/campusLocations';

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'in', 'on', 'at', 'near', 'by', 'of', 'for', 'with', 'and', 'or',
  'to', 'from', 'my', 'is', 'it', 'was', 'i', 'lost', 'found', 'please', 'help',
  'someone', 'item', 'campus', 'yesterday', 'today', 'around', 'about', 'some'
]);

const HIGH_VALUE_TERMS = new Set([
  // Brands
  'apple', 'sony', 'airpods', 'macbook', 'iphone', 'ipad', 'samsung', 'galaxy',
  'dell', 'lenovo', 'hp', 'asus', 'bose', 'anker', 'jbl', 'hydro', 'flask',
  'stanley', 'yeti', 'patagonia', 'nike', 'adidas', 'north', 'face', 'fossil',
  // Item descriptors
  'earphones', 'headphones', 'earbuds', 'charger', 'cable', 'wallet', 'keys',
  'keychain', 'card', 'id', 'student', 'pass', 'glasses', 'sunglasses', 'backpack',
  'tote', 'jacket', 'hoodie', 'sweater', 'water', 'bottle', 'flask', 'tumbler',
  'ring', 'watch', 'necklace', 'calculator', 'pencil', 'notebook', 'airtag',
  // Colors
  'black', 'white', 'gray', 'grey', 'silver', 'blue', 'navy', 'red', 'pink',
  'green', 'sage', 'purple', 'yellow', 'gold', 'brown', 'matte', 'clear'
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 1 && !STOP_WORDS.has(token));
}

function calculateDistance(
  coord1: { x: number; y: number },
  coord2: { x: number; y: number }
): number {
  const dx = coord1.x - coord2.x;
  const dy = coord1.y - coord2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function computeItemMatch(targetItem: Item, candidateItem: Item): MatchResult | null {
  // Opposing types check (e.g. lost searches found, found searches lost)
  // or allow comparing if user explicitly tests. For standard matching, types should differ.
  if (targetItem.id === candidateItem.id) return null;

  // 1. Category Score (Max 35)
  const categoryMatch = targetItem.category === candidateItem.category;
  let categoryScore = 0;
  if (categoryMatch) {
    categoryScore = 35;
  } else if (
    (targetItem.category === 'electronics' && candidateItem.category === 'other') ||
    (targetItem.category === 'keys_wallets' && candidateItem.category === 'id_cards')
  ) {
    categoryScore = 15; // Partial related category
  }

  // 2. Text Similarity & Keywords Score (Max 35)
  const targetTokens = tokenize(`${targetItem.title} ${targetItem.description}`);
  const candidateTokens = tokenize(`${candidateItem.title} ${candidateItem.description}`);

  const targetSet = new Set(targetTokens);
  const commonKeywords: string[] = [];
  let weightedMatches = 0;

  for (const token of candidateTokens) {
    if (targetSet.has(token) && !commonKeywords.includes(token)) {
      commonKeywords.push(token);
      if (HIGH_VALUE_TERMS.has(token)) {
        weightedMatches += 2.5;
      } else {
        weightedMatches += 1;
      }
    }
  }

  // Calculate text score based on weighted matches and keyword overlap
  const textScore = Math.min(35, Math.round(weightedMatches * 7));

  // 3. Location Score (Max 20)
  let locationScore = 0;
  if (targetItem.buildingId === candidateItem.buildingId) {
    locationScore = 20;
  } else {
    // Proximity on campus map
    const loc1 = CAMPUS_LOCATIONS[targetItem.buildingId]?.coords || targetItem.coordinates;
    const loc2 = CAMPUS_LOCATIONS[candidateItem.buildingId]?.coords || candidateItem.coordinates;
    const dist = calculateDistance(loc1, loc2);
    if (dist < 20) {
      locationScore = 14;
    } else if (dist < 40) {
      locationScore = 8;
    }
  }

  // Check if specific sub-location matches in text (e.g. "2nd floor", "silent area", "desk")
  const targetLocTokens = tokenize(targetItem.locationDetails);
  const candidateLocTokens = tokenize(candidateItem.locationDetails);
  const sharedLoc = targetLocTokens.filter(t => candidateLocTokens.includes(t));
  if (sharedLoc.length > 0 && locationScore < 20) {
    locationScore = Math.min(20, locationScore + 5);
  }

  // 4. Date Proximity Score (Max 10)
  let dateScore = 0;
  try {
    const tDate = new Date(targetItem.date).getTime();
    const cDate = new Date(candidateItem.date).getTime();
    const daysDiff = Math.abs(tDate - cDate) / (1000 * 60 * 60 * 24);

    if (daysDiff <= 1) {
      dateScore = 10;
    } else if (daysDiff <= 3) {
      dateScore = 8;
    } else if (daysDiff <= 7) {
      dateScore = 5;
    } else if (daysDiff <= 14) {
      dateScore = 2;
    }
  } catch {
    dateScore = 0;
  }

  const rawTotal = categoryScore + textScore + locationScore + dateScore;
  const score = Math.min(99, Math.max(0, rawTotal));

  // Build human friendly reason
  const reasons: string[] = [];
  if (categoryMatch) reasons.push('Identical category');
  if (commonKeywords.length > 0) {
    reasons.push(`${commonKeywords.length} shared keyword${commonKeywords.length > 1 ? 's' : ''} (${commonKeywords.slice(0, 3).map(k => `"${k}"`).join(', ')})`);
  }
  if (locationScore >= 18) {
    reasons.push(`Same campus zone (${CAMPUS_LOCATIONS[targetItem.buildingId]?.shortName || 'building'})`);
  } else if (locationScore >= 8) {
    reasons.push('Nearby campus location');
  }
  if (dateScore >= 8) {
    reasons.push('Reported within 1-3 days of each other');
  }

  const reason = reasons.length > 0 ? reasons.join(' • ') : 'Partial attribute match';

  return {
    targetItem,
    candidateItem,
    score,
    breakdown: {
      categoryMatch,
      categoryScore,
      textScore,
      locationScore,
      dateScore,
      commonKeywords
    },
    reason
  };
}

export function findMatchesForItem(targetItem: Item, allItems: Item[], minScore = 38): MatchResult[] {
  const oppositeType = targetItem.type === 'lost' ? 'found' : 'lost';

  return allItems
    .filter(item => item.id !== targetItem.id && item.type === oppositeType && item.status !== 'expired')
    .map(candidate => computeItemMatch(targetItem, candidate))
    .filter((res): res is MatchResult => res !== null && res.score >= minScore)
    .sort((a, b) => b.score - a.score);
}
