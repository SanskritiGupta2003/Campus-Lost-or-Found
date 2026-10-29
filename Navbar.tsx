import React from 'react';
import {
  Search,
  PlusCircle,
  Bell,
  MessageSquare,
  MapPin,
  Heart,
  Grid,
  Filter,
  User,
  Sparkles,
  Compass
} from 'lucide-react';
import { getCurrentUser } from '../utils/storage';

interface NavbarProps {
  activeTab: 'board' | 'map' | 'stories';
  setActiveTab: (tab: 'board' | 'map' | 'stories') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenPostModal: () => void;
  onOpenAlertsModal: () => void;
  onOpenMessagesDrawer: () => void;
  showMyPostsOnly: boolean;
  setShowMyPostsOnly: (val: boolean) => void;
  unreadCount?: number;
  alertsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onOpenPostModal,
  onOpenAlertsModal,
  onOpenMessagesDrawer,
  showMyPostsOnly,
  setShowMyPostsOnly,
  unreadCount = 1,
  alertsCount = 2
}) => {
  const currentUser = getCurrentUser();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setActiveTab('board');
                setShowMyPostsOnly(false);
              }}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Compass className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                    Find<span className="text-blue-600">It</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-md uppercase tracking-wider">
                    Campus
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 hidden sm:block font-medium">
                  Westlake University Lost & Found
                </span>
              </div>
            </button>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60 text-xs font-bold text-slate-600">
            <button
              onClick={() => setActiveTab('board')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'board'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Item Board
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Campus Map
            </button>

            <button
              onClick={() => setActiveTab('stories')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'stories'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              Reunited Hall
            </button>
          </nav>

          {/* Right Action Icons & Post Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* My Posts Filter Toggle */}
            <button
              onClick={() => {
                setShowMyPostsOnly(!showMyPostsOnly);
                if (activeTab !== 'board') setActiveTab('board');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                showMyPostsOnly
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title="Filter to items posted by your current campus session"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{showMyPostsOnly ? 'Showing My Posts' : 'My Posts'}</span>
            </button>

            {/* Match Alerts Bell */}
            <button
              onClick={onOpenAlertsModal}
              className="relative p-2.5 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 rounded-xl text-slate-600 transition-colors cursor-pointer"
              title="Match Alerts & Subscriptions"
            >
              <Bell className="w-4 h-4" />
              {alertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {alertsCount}
                </span>
              )}
            </button>

            {/* Messages Inbox */}
            <button
              onClick={onOpenMessagesDrawer}
              className="relative p-2.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-xl text-slate-600 transition-colors cursor-pointer"
              title="Messages & Handover Chats"
            >
              <MessageSquare className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Primary Action: Post an Item */}
            <button
              onClick={onOpenPostModal}
              className="px-4 sm:px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Item</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('board')}
            className={`py-1 px-3 rounded-lg flex items-center gap-1.5 ${
              activeTab === 'board' ? 'bg-blue-50 text-blue-700 font-extrabold' : ''
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            Board
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`py-1 px-3 rounded-lg flex items-center gap-1.5 ${
              activeTab === 'map' ? 'bg-blue-50 text-blue-700 font-extrabold' : ''
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Campus Map
          </button>
          <button
            onClick={() => setActiveTab('stories')}
            className={`py-1 px-3 rounded-lg flex items-center gap-1.5 ${
              activeTab === 'stories' ? 'bg-emerald-50 text-emerald-700 font-extrabold' : ''
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            Reunited
          </button>
        </div>
      </div>
    </header>
  );
};
