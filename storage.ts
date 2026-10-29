import { Item, MessageThread, MatchAlert, ClaimRequest } from '../types';
import { SEED_ITEMS } from '../data/seedItems';

const STORAGE_KEYS = {
  ITEMS: 'findit_campus_items_v2',
  MESSAGES: 'findit_campus_messages_v2',
  ALERTS: 'findit_campus_alerts_v2',
  USER_PIN: 'findit_user_pin',
  USER_INFO: 'findit_current_user_profile'
};

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  pin: string;
}

export function getCurrentUser(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_INFO);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  const defaultUser: UserProfile = {
    name: 'Alex Rivera',
    email: 'arivera@campus.edu',
    phone: '555-018-4421',
    pin: '1234'
  };
  saveCurrentUser(defaultUser);
  return defaultUser;
}

export function saveCurrentUser(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export function getStoredItems(): Item[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ITEMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(SEED_ITEMS));
      return SEED_ITEMS;
    }
    const items: Item[] = JSON.parse(raw);
    const now = Date.now();
    // Auto update expired status
    const updated = items.map(item => {
      if (item.status === 'active' && item.expiresAt && item.expiresAt < now) {
        return { ...item, status: 'expired' as const };
      }
      return item;
    });
    return updated;
  } catch (err) {
    console.error('Error loading items from localStorage', err);
    return SEED_ITEMS;
  }
}

export function saveItems(items: Item[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  } catch (err) {
    console.error('Error saving items to localStorage', err);
  }
}

export function resetToSeedData(): Item[] {
  try {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(SEED_ITEMS));
  } catch (err) {
    console.error('Reset failed', err);
  }
  return SEED_ITEMS;
}

export function addItem(newItem: Omit<Item, 'id' | 'createdAt' | 'status' | 'expiresAt' | 'viewsCount'> & Partial<Item>): Item {
  const items = getStoredItems();
  const now = Date.now();
  const item: Item = {
    id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    status: 'active',
    createdAt: now,
    expiresAt: now + (30 * 24 * 60 * 60 * 1000), // 30 days
    viewsCount: 1,
    ...newItem
  } as Item;

  const nextItems = [item, ...items];
  saveItems(nextItems);
  return item;
}

export function updateItem(updated: Item): Item[] {
  const items = getStoredItems();
  const nextItems = items.map(i => i.id === updated.id ? updated : i);
  saveItems(nextItems);
  return nextItems;
}

export function deleteItem(id: string): Item[] {
  const items = getStoredItems();
  const nextItems = items.filter(i => i.id !== id);
  saveItems(nextItems);
  return nextItems;
}

export function renewItem(id: string): Item | null {
  const items = getStoredItems();
  const target = items.find(i => i.id === id);
  if (!target) return null;
  const now = Date.now();
  const renewed: Item = {
    ...target,
    expiresAt: now + (30 * 24 * 60 * 60 * 1000),
    status: target.status === 'expired' ? 'active' : target.status
  };
  const nextItems = items.map(i => i.id === id ? renewed : i);
  saveItems(nextItems);
  return renewed;
}

export function markAsClaimed(id: string, story?: string): Item | null {
  const items = getStoredItems();
  const target = items.find(i => i.id === id);
  if (!target) return null;
  const claimed: Item = {
    ...target,
    status: 'claimed',
    claimedAt: Date.now(),
    claimedStory: story || 'Successfully claimed and returned to rightful owner!'
  };
  const nextItems = items.map(i => i.id === id ? claimed : i);
  saveItems(nextItems);
  return claimed;
}

export function reportItemSpam(id: string, reason: string): Item | null {
  const items = getStoredItems();
  const target = items.find(i => i.id === id);
  if (!target) return null;
  const flags = target.flagReasons || [];
  const updated: Item = {
    ...target,
    reportCount: (target.reportCount || 0) + 1,
    isFlagged: (target.reportCount || 0) + 1 >= 2,
    flagReasons: [...flags, reason]
  };
  const nextItems = items.map(i => i.id === id ? updated : i);
  saveItems(nextItems);
  return updated;
}

export function incrementViewCount(id: string): void {
  const items = getStoredItems();
  const target = items.find(i => i.id === id);
  if (target) {
    target.viewsCount = (target.viewsCount || 0) + 1;
    saveItems(items);
  }
}

// Secret Question Claim Requests
export function submitClaimRequest(
  itemId: string,
  claimantName: string,
  claimantEmail: string,
  answerText: string
): { item: Item; isInstantMatch: boolean } | null {
  const items = getStoredItems();
  const target = items.find(i => i.id === itemId);
  if (!target) return null;

  const newRequest: ClaimRequest = {
    id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    claimantName,
    claimantEmail,
    answerText,
    createdAt: Date.now(),
    status: 'pending'
  };

  // Check if answer is a close match to secretAnswer
  let isInstantMatch = false;
  if (target.secretAnswer) {
    const cleanSecret = target.secretAnswer.toLowerCase().trim();
    const cleanAnswer = answerText.toLowerCase().trim();
    if (
      cleanAnswer === cleanSecret ||
      cleanAnswer.includes(cleanSecret) ||
      cleanSecret.split(' ').every(word => word.length > 2 && cleanAnswer.includes(word))
    ) {
      isInstantMatch = true;
      newRequest.status = 'approved';
    }
  }

  const existingRequests = target.claimRequests || [];
  const updatedItem: Item = {
    ...target,
    claimRequests: [newRequest, ...existingRequests]
  };

  const nextItems = items.map(i => i.id === itemId ? updatedItem : i);
  saveItems(nextItems);
  return { item: updatedItem, isInstantMatch };
}

// Messaging Storage
export function getStoredMessages(): MessageThread[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (!raw) {
      // Seed with sample initial inquiry
      const sampleThreads: MessageThread[] = [
        {
          id: 'thread-sample-1',
          itemId: 'item-2',
          itemTitle: 'Black Sony Wireless Over-Ear Headphones in Case',
          senderName: 'Devon Vance',
          senderEmail: 'dvance@campus.edu',
          recipientEmail: 'erostova@campus.edu',
          messages: [
            {
              id: 'm1',
              sender: 'user',
              text: 'Hi Elena! I think these might be my headphones! I left them on the 2nd floor silent study table on Tuesday afternoon.',
              timestamp: Date.now() - 3600000,
              suggestedMeetingSpot: 'Central Library 1st Floor Security Desk'
            },
            {
              id: 'm2',
              sender: 'poster',
              text: 'Hey Devon! They are safe at the front desk. Could you verify the little keychain charm on the zipper case?',
              timestamp: Date.now() - 1800000
            }
          ],
          createdAt: Date.now() - 3600000,
          unread: true
        }
      ];
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(sampleThreads));
      return sampleThreads;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveMessages(threads: MessageThread[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(threads));
  } catch (err) {
    console.error('Error saving messages', err);
  }
}

export function sendMessage(
  itemId: string,
  itemTitle: string,
  recipientEmail: string,
  senderName: string,
  senderEmail: string,
  text: string,
  suggestedMeetingSpot?: string
): MessageThread {
  const threads = getStoredMessages();
  let thread = threads.find(t => t.itemId === itemId && t.senderEmail === senderEmail);

  if (!thread) {
    thread = {
      id: `thread-${Date.now()}`,
      itemId,
      itemTitle,
      senderName,
      senderEmail,
      recipientEmail,
      messages: [],
      createdAt: Date.now(),
      unread: false
    };
    threads.unshift(thread);
  }

  thread.messages.push({
    id: `msg-${Date.now()}`,
    sender: 'user',
    text,
    timestamp: Date.now(),
    suggestedMeetingSpot
  });
  thread.unread = false;

  saveMessages(threads);
  return thread;
}

// Alerts Storage
export function getStoredAlerts(): MatchAlert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ALERTS);
    if (!raw) {
      const defaultAlerts: MatchAlert[] = [
        {
          id: 'alert-1',
          userId: 'user-default',
          keyword: 'Sony Headphones',
          category: 'electronics',
          type: 'lost',
          createdAt: Date.now() - 86400000,
          active: true,
          matchCount: 1
        },
        {
          id: 'alert-2',
          userId: 'user-default',
          keyword: 'Hydro Flask',
          category: 'bottles',
          type: 'lost',
          createdAt: Date.now() - 43200000,
          active: true,
          matchCount: 1
        }
      ];
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(defaultAlerts));
      return defaultAlerts;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveAlerts(alerts: MatchAlert[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  } catch (err) {
    console.error('Error saving alerts', err);
  }
}

export function addAlert(keyword: string, type: 'lost' | 'found', category?: any): MatchAlert {
  const alerts = getStoredAlerts();
  const newAlert: MatchAlert = {
    id: `alert-${Date.now()}`,
    userId: 'user-default',
    keyword,
    category: category || 'all',
    type,
    createdAt: Date.now(),
    active: true,
    matchCount: 0
  };
  alerts.unshift(newAlert);
  saveAlerts(alerts);
  return newAlert;
}

export function removeAlert(id: string): MatchAlert[] {
  const alerts = getStoredAlerts().filter(a => a.id !== id);
  saveAlerts(alerts);
  return alerts;
}
