import React from 'react';
import { ItemType, ItemCategory, CampusBuildingId } from '../types';
import { CAMPUS_LOCATIONS, CATEGORY_INFO } from '../data/campusLocations';
import { Search, Filter, RotateCcw, Calendar, MapPin, Tag, SlidersHorizontal } from 'lucide-react';

export interface FilterState {
  type: 'all' | 'lost' | 'found';
  category: ItemCategory | 'all';
  buildingId: CampusBuildingId | 'all';
  dateRange: 'all' | 'today' | 'week' | 'month';
  sortBy: 'newest' | 'oldest' | 'expiring';
}

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalActiveCount: number;
  lostCount: number;
  foundCount: number;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
  totalActiveCount,
  lostCount,
  foundCount,
  onResetFilters
}) => {
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    filters.category !== 'all' ||
    filters.buildingId !== 'all' ||
    filters.dateRange !== 'all' ||
    filters.sortBy !== 'newest';

  return (
    <div className="space-y-4 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs">
      {/* Search Input & Primary Type Tabs */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search items by keywords (e.g. Sony headphones, Hydro Flask, keys, wallet)..."
            className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Lost / Found / All Segmented Tabs */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80 shrink-0 self-start lg:self-auto">
          <button
            onClick={() => setFilters(prev => ({ ...prev, type: 'all' }))}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filters.type === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Items ({totalActiveCount})
          </button>
          <button
            onClick={() => setFilters(prev => ({ ...prev, type: 'lost' }))}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filters.type === 'lost'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            Lost ({lostCount})
          </button>
          <button
            onClick={() => setFilters(prev => ({ ...prev, type: 'found' }))}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filters.type === 'found'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Found ({foundCount})
          </button>
        </div>
      </div>

      {/* Secondary Filter Dropdowns & Sorting */}
      <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 text-xs">
        {/* Category Filter */}
        <div className="flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filters.category}
            onChange={e => setFilters(prev => ({ ...prev, category: e.target.value as any }))}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
          >
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_INFO).map(([catKey, info]) => (
              <option key={catKey} value={catKey}>
                {info.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location Building Filter */}
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filters.buildingId}
            onChange={e => setFilters(prev => ({ ...prev, buildingId: e.target.value as any }))}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
          >
            <option value="all">Any Campus Location</option>
            {Object.values(CAMPUS_LOCATIONS).map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.shortName}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filters.dateRange}
            onChange={e => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
          >
            <option value="all">All Dates</option>
            <option value="today">Today / Last 24 Hours</option>
            <option value="week">Past 7 Days</option>
            <option value="month">Past 30 Days</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-1.5 ml-auto">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filters.sortBy}
            onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="expiring">Expiring Soonest</option>
          </select>
        </div>

        {/* Reset button if filters active */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1 cursor-pointer font-semibold"
            title="Reset all filters"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
};
