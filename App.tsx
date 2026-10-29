import React, { useState, useMemo, useEffect } from 'react';
import { Item, ItemType, MatchResult } from './types';
import {
  getStoredItems,
  saveItems,
  getCurrentUser,
  resetToSeedData,
  getStoredMessages,
  getStoredAlerts
} from './utils/storage';
import { findMatchesForItem } from './utils/matchingEngine';

// Components
import { Navbar } from './components/Navbar';
import { StatsBanner } from './components/StatsBanner';
import { FilterBar, FilterState } from './components/FilterBar';
import { ItemCard } from './components/ItemCard';
import { ItemDetailModal } from './components/ItemDetailModal';
import { PostItemModal } from './components/PostItemModal';
import { EditItemModal } from './components/EditItemModal';
import { ContactPosterModal } from './components/ContactPosterModal';
import { ClaimVerificationModal } from './components/ClaimVerificationModal';
import { MatchDrawer } from './components/MatchDrawer';
import { MatchAlertsModal } from './components/MatchAlertsModal';
import { MessagesDrawer } from './components/MessagesDrawer';
import { ReportSpamModal } from './components/ReportSpamModal';
import { CampusMapView } from './components/CampusMapView';
import { SuccessStories } from './components/SuccessStories';

import {
  Sparkles,
  Inbox,
  RotateCcw,
  PlusCircle,
  HelpCircle,
  ShieldCheck,
  Compass,
  Heart,
  Grid,
  MapPin,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [activeTab, setActiveTab] = useState<'board' | 'map' | 'stories'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMyPostsOnly, setShowMyPostsOnly] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    category: 'all',
    buildingId: 'all',
    dateRange: 'all',
    sortBy: 'newest'
  });

  // Modals & Drawers
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postModalInitialType, setPostModalInitialType] = useState<ItemType>('lost');
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isMessagesDrawerOpen, setIsMessagesDrawerOpen] = useState(false);

  const [detailItem, setDetailItem] = useState<Item | null>(null);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [contactItem, setContactItem] = useState<Item | null>(null);
  const [claimItem, setClaimItem] = useState<Item | null>(null);
  const [matchItem, setMatchItem] = useState<Item | null>(null);
  const [spamItem, setSpamItem] = useState<Item | null>(null);
  const [mapSelectedItem, setMapSelectedItem] = useState<Item | null>(null);

  // Toast / feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load items on mount
  useEffect(() => {
    const loaded = getStoredItems();
    setItems(loaded);
  }, []);

  const currentUser = getCurrentUser();

  // Active vs Claimed items
  const activeItems = useMemo(() => {
    return items.filter(i => i.status === 'active' || i.status === 'expired');
  }, [items]);

  const claimedItems = useMemo(() => {
    return items.filter(i => i.status === 'claimed');
  }, [items]);

  // Counts
  const lostCount = useMemo(() => activeItems.filter(i => i.type === 'lost').length, [activeItems]);
  const foundCount = useMemo(() => activeItems.filter(i => i.type === 'found').length, [activeItems]);

  // Precompute top matches for active items to display badges on cards
  const itemMatchesMap = useMemo(() => {
    const map = new Map<string, MatchResult[]>();
    activeItems.forEach(item => {
      const matches = findMatchesForItem(item, activeItems, 50);
      map.set(item.id, matches);
    });
    return map;
  }, [activeItems]);

  // Filtered items for Board View
  const filteredItems = useMemo(() => {
    return activeItems.filter(item => {
      // My Posts filter
      if (showMyPostsOnly) {
        const isMine =
          item.posterEmail.toLowerCase() === currentUser.email.toLowerCase() ||
          item.posterPin === currentUser.pin;
        if (!isMine) return false;
      }

      // Type filter
      if (filters.type !== 'all' && item.type !== filters.type) return false;

      // Category filter
      if (filters.category !== 'all' && item.category !== filters.category) return false;

      // Building location filter
      if (filters.buildingId !== 'all' && item.buildingId !== filters.buildingId) return false;

      // Date Range filter
      if (filters.dateRange !== 'all') {
        const itemDate = new Date(item.date).getTime();
        const now = Date.now();
        const daysAgo = (now - itemDate) / (1000 * 60 * 60 * 24);

        if (filters.dateRange === 'today' && daysAgo > 1.5) return false;
        if (filters.dateRange === 'week' && daysAgo > 7.5) return false;
        if (filters.dateRange === 'month' && daysAgo > 30.5) return false;
      }

      // Keyword search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const fullText = `${item.title} ${item.description} ${item.locationDetails} ${item.posterName}`.toLowerCase();
        if (!fullText.includes(q)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'newest') {
        return b.createdAt - a.createdAt;
      }
      if (filters.sortBy === 'oldest') {
        return a.createdAt - b.createdAt;
      }
      if (filters.sortBy === 'expiring') {
        return (a.expiresAt || 0) - (b.expiresAt || 0);
      }
      return 0;
    });
  }, [activeItems, showMyPostsOnly, filters, searchQuery, currentUser]);

  // Reset filters helper
  const handleResetFilters = () => {
    setSearchQuery('');
    setFilters({
      type: 'all',
      category: 'all',
      buildingId: 'all',
      dateRange: 'all',
      sortBy: 'newest'
    });
    setShowMyPostsOnly(false);
  };

  // Callback after creating item
  const handleItemCreated = (newItem: Item) => {
    setItems(getStoredItems());
    showToast(`🎉 "${newItem.title}" has been published to the campus board!`);
  };

  // Callback after updating or deleting item
  const handleItemUpdated = (updatedItem: Item | null) => {
    setItems(getStoredItems());
    if (updatedItem) {
      if (updatedItem.status === 'claimed') {
        showToast(`🎊 Item marked as Reunited! Added to the Hall of Fame.`);
      } else {
        showToast(`✅ Item details updated successfully!`);
      }
    } else {
      showToast(`🗑️ Post deleted successfully.`);
    }
  };

  const handleResetToSeed = () => {
    if (window.confirm('Reset all campus items, reports, and messages to initial demonstration data?')) {
      const seeded = resetToSeedData();
      setItems(seeded);
      showToast('🔄 Reset board to sample campus items!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-blue-500 selection:text-white">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-slate-900/95 backdrop-blur-md text-white font-semibold text-xs sm:text-sm rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenPostModal={() => {
          setPostModalInitialType('lost');
          setIsPostModalOpen(true);
        }}
        onOpenAlertsModal={() => setIsAlertsModalOpen(true)}
        onOpenMessagesDrawer={() => setIsMessagesDrawerOpen(true)}
        showMyPostsOnly={showMyPostsOnly}
        setShowMyPostsOnly={setShowMyPostsOnly}
        unreadCount={getStoredMessages().filter(t => t.unread).length}
        alertsCount={getStoredAlerts().length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* TAB 1: BOARD VIEW */}
        {activeTab === 'board' && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
            {/* Hero / Stats Banner */}
            <StatsBanner
              onPostLost={() => {
                setPostModalInitialType('lost');
                setIsPostModalOpen(true);
              }}
              onPostFound={() => {
                setPostModalInitialType('found');
                setIsPostModalOpen(true);
              }}
              onOpenMap={() => setActiveTab('map')}
            />

            {/* Search and Filters */}
            <FilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filters={filters}
              setFilters={setFilters}
              totalActiveCount={activeItems.length}
              lostCount={lostCount}
              foundCount={foundCount}
              onResetFilters={handleResetFilters}
            />

            {/* My Posts Notice */}
            {showMyPostsOnly && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between text-xs text-indigo-900">
                <span className="font-semibold">
                  📌 Showing only items posted by your campus profile ({currentUser.name} - {currentUser.email})
                </span>
                <button
                  onClick={() => setShowMyPostsOnly(false)}
                  className="font-bold underline text-indigo-700 hover:text-indigo-900"
                >
                  Show All Items
                </button>
              </div>
            )}

            {/* Items Grid */}
            {filteredItems.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="w-16 h-16 mx-auto bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
                  <Inbox className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="text-base font-bold text-slate-900">No Matching Campus Items</h3>
                  <p className="text-xs text-slate-500">
                    We couldn't find any items matching your active filter criteria. Try adjusting your search keywords, category, or location.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={() => {
                      setPostModalInitialType('lost');
                      setIsPostModalOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Post an Item Report
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredItems.map(item => {
                  const matches = itemMatchesMap.get(item.id) || [];
                  const topMatch = matches.length > 0 ? matches[0] : null;

                  return (
                    <ItemCard
                      key={item.id}
                      item={item}
                      topMatch={topMatch}
                      onViewDetails={it => setDetailItem(it)}
                      onContact={it => setContactItem(it)}
                      onClaim={it => setClaimItem(it)}
                      onViewMatches={it => setMatchItem(it)}
                      onShowOnMap={it => {
                        setMapSelectedItem(it);
                        setActiveTab('map');
                      }}
                      onManage={it => setEditItem(it)}
                      onReportSpam={it => setSpamItem(it)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INTERACTIVE CAMPUS MAP */}
        {activeTab === 'map' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Westlake Campus Lost & Found Map
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pins show exact locations where items were lost or found across campus buildings and quads.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setPostModalInitialType('lost');
                    setIsPostModalOpen(true);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                >
                  + Report Lost Item
                </button>
                <button
                  onClick={() => {
                    setPostModalInitialType('found');
                    setIsPostModalOpen(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                >
                  + Report Found Item
                </button>
              </div>
            </div>

            {/* Interactive Vector Map */}
            <CampusMapView
              items={activeItems}
              selectedItem={mapSelectedItem}
              onSelectItem={it => setDetailItem(it)}
            />
          </div>
        )}

        {/* TAB 3: SUCCESS STORIES */}
        {activeTab === 'stories' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <SuccessStories
              claimedItems={claimedItems}
              onSelectItem={it => setDetailItem(it)}
              onPostClick={() => {
                setPostModalInitialType('found');
                setIsPostModalOpen(true);
              }}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-slate-200/90 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Compass className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800 text-sm">FindIt: Campus Lost and Found</span>
            <span className="text-slate-400">| Westlake University Safety & Services</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-600 font-medium">
            <button
              onClick={() => setActiveTab('board')}
              className="hover:text-blue-600 transition-colors"
            >
              Lost & Found Board
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className="hover:text-blue-600 transition-colors"
            >
              Interactive Map
            </button>
            <button
              onClick={() => setActiveTab('stories')}
              className="hover:text-blue-600 transition-colors"
            >
              Reunited Hall of Fame
            </button>
            <button
              onClick={handleResetToSeed}
              className="text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors ml-2"
              title="Reset test data"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Demo Data
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}

      {/* 1. Item Detail Modal */}
      {detailItem && (
        <ItemDetailModal
          item={detailItem}
          matches={itemMatchesMap.get(detailItem.id) || []}
          onClose={() => setDetailItem(null)}
          onContact={it => setContactItem(it)}
          onClaim={it => setClaimItem(it)}
          onViewMatches={it => setMatchItem(it)}
          onShowOnMap={it => {
            setMapSelectedItem(it);
            setActiveTab('map');
          }}
          onManage={it => setEditItem(it)}
          onReportSpam={it => setSpamItem(it)}
          onSelectCandidate={candidate => setDetailItem(candidate)}
        />
      )}

      {/* 2. Post Item Modal */}
      {isPostModalOpen && (
        <PostItemModal
          existingItems={items}
          initialType={postModalInitialType}
          onClose={() => setIsPostModalOpen(false)}
          onItemCreated={handleItemCreated}
        />
      )}

      {/* 3. Edit Item Modal */}
      {editItem && (
        <EditItemModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onItemUpdated={handleItemUpdated}
        />
      )}

      {/* 4. Contact Poster Modal */}
      {contactItem && (
        <ContactPosterModal
          item={contactItem}
          onClose={() => setContactItem(null)}
          onMessageSent={() => {
            showToast('📨 Protected message sent to poster!');
          }}
        />
      )}

      {/* 5. Claim Verification Modal (Secret Question) */}
      {claimItem && (
        <ClaimVerificationModal
          item={claimItem}
          onClose={() => setClaimItem(null)}
          onClaimSuccess={updated => {
            setItems(getStoredItems());
            showToast('🎉 Claim response submitted!');
          }}
        />
      )}

      {/* 6. Smart Match Suggestions Drawer */}
      {matchItem && (
        <MatchDrawer
          targetItem={matchItem}
          matches={itemMatchesMap.get(matchItem.id) || []}
          onClose={() => setMatchItem(null)}
          onSelectCandidate={candidate => {
            setMatchItem(null);
            setDetailItem(candidate);
          }}
          onOpenClaim={candidate => {
            setMatchItem(null);
            setClaimItem(candidate);
          }}
          onOpenContact={candidate => {
            setMatchItem(null);
            setContactItem(candidate);
          }}
        />
      )}

      {/* 7. Match Alerts Modal */}
      {isAlertsModalOpen && (
        <MatchAlertsModal
          items={activeItems}
          onClose={() => setIsAlertsModalOpen(false)}
          onSelectItem={it => setDetailItem(it)}
        />
      )}

      {/* 8. Messages Drawer */}
      {isMessagesDrawerOpen && (
        <MessagesDrawer
          onClose={() => setIsMessagesDrawerOpen(false)}
          onOpenItem={itemId => {
            const it = items.find(i => i.id === itemId);
            if (it) {
              setIsMessagesDrawerOpen(false);
              setDetailItem(it);
            }
          }}
        />
      )}

      {/* 9. Report Spam Modal */}
      {spamItem && (
        <ReportSpamModal
          item={spamItem}
          onClose={() => setSpamItem(null)}
          onReportSuccess={updated => {
            setItems(getStoredItems());
            showToast('🛡️ Post reported for campus moderation.');
          }}
        />
      )}
    </div>
  );
}
