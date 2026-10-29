import React from 'react';
import { Item, MatchResult } from '../types';
import { CAMPUS_LOCATIONS, CATEGORY_INFO } from '../data/campusLocations';
import {
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  Eye,
  CheckCircle2,
  Flag,
  MoreVertical,
  Edit,
  Navigation
} from 'lucide-react';

interface ItemCardProps {
  item: Item;
  topMatch?: MatchResult | null;
  onViewDetails: (item: Item) => void;
  onContact: (item: Item) => void;
  onClaim: (item: Item) => void;
  onViewMatches: (item: Item) => void;
  onShowOnMap: (item: Item) => void;
  onManage: (item: Item) => void;
  onReportSpam: (item: Item) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  topMatch,
  onViewDetails,
  onContact,
  onClaim,
  onViewMatches,
  onShowOnMap,
  onManage,
  onReportSpam
}) => {
  const isLost = item.type === 'lost';
  const isClaimed = item.status === 'claimed';
  const isExpired = item.status === 'expired';

  // Calculate days remaining
  const daysLeft = item.expiresAt
    ? Math.max(0, Math.ceil((item.expiresAt - Date.now()) / (1000 * 60 * 60 * 24)))
    : 30;

  const building = CAMPUS_LOCATIONS[item.buildingId];
  const categoryInfo = CATEGORY_INFO[item.category] || CATEGORY_INFO['other'];

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 overflow-hidden flex flex-col justify-between relative">
      {/* Flagged warning if item has reports */}
      {item.isFlagged && (
        <div className="bg-amber-500 text-white text-[10px] font-bold py-1 px-3 flex items-center justify-between">
          <span>⚠️ Under Community Review ({item.reportCount} reports)</span>
        </div>
      )}

      {/* Top Media Banner */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 cursor-pointer" onClick={() => onViewDetails(item)}>
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          {/* Lost / Found badge */}
          <span
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg shadow-md uppercase tracking-wider ${
              isClaimed
                ? 'bg-purple-600 text-white'
                : isLost
                ? 'bg-rose-500 text-white'
                : 'bg-emerald-500 text-white'
            }`}
          >
            {isClaimed ? 'Reunited' : item.type}
          </span>

          {/* Expiry Pill */}
          <span
            className={`px-2 py-0.5 text-[10px] font-semibold rounded-md shadow-sm backdrop-blur-md flex items-center gap-1 ${
              isExpired
                ? 'bg-rose-900/80 text-rose-200'
                : daysLeft <= 3
                ? 'bg-amber-500/90 text-white animate-pulse'
                : 'bg-slate-900/60 text-slate-200'
            }`}
          >
            <Clock className="w-3 h-3" />
            {isExpired ? 'Expired' : `${daysLeft}d left`}
          </span>
        </div>

        {/* Bottom image overlay: Category + Show on Map shortcut */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
          <span className="px-2 py-0.5 bg-slate-900/70 backdrop-blur-md rounded-md text-[11px] font-medium text-slate-200">
            {categoryInfo.label}
          </span>

          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onShowOnMap(item);
            }}
            className="p-1.5 bg-slate-900/70 hover:bg-blue-600 backdrop-blur-md text-white rounded-lg transition-colors flex items-center gap-1 text-[11px] font-medium pointer-events-auto"
            title="View on Campus Map"
          >
            <Navigation className="w-3 h-3" />
            <span>Map</span>
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 truncate">
              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
              {item.date}
            </span>
            <span className="text-slate-400">By {item.posterName}</span>
          </div>

          <h3
            onClick={() => onViewDetails(item)}
            className="font-bold text-sm text-slate-900 hover:text-blue-600 transition-colors line-clamp-1 cursor-pointer"
          >
            {item.title}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          <div className="flex items-center gap-1 text-xs text-slate-600 pt-0.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="font-medium text-slate-700 truncate">
              {building?.shortName || item.buildingId}:
            </span>
            <span className="text-slate-500 truncate">{item.locationDetails}</span>
          </div>
        </div>

        {/* Match Suggestion Tag or Secret Question indicator */}
        <div className="space-y-2 pt-1">
          {topMatch && topMatch.score >= 55 && !isClaimed && (
            <button
              onClick={() => onViewMatches(item)}
              className="w-full text-left p-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl flex items-center justify-between transition-colors hover:border-blue-300 group/match cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 truncate">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                <span>{topMatch.score}% Match Found:</span>
                <span className="font-normal text-slate-700 truncate">
                  {topMatch.candidateItem.title}
                </span>
              </div>
              <span className="text-[10px] text-blue-600 font-bold shrink-0 ml-1">
                View →
              </span>
            </button>
          )}

          {item.type === 'found' && item.secretQuestion && !isClaimed && (
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Owner Verification Question Enabled</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-1">
              {item.type === 'found' && item.secretQuestion && !isClaimed ? (
                <button
                  onClick={() => onClaim(item)}
                  className="flex-1 py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Claim Item
                </button>
              ) : !isClaimed ? (
                <button
                  onClick={() => onContact(item)}
                  className="flex-1 py-1.5 px-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Contact
                </button>
              ) : (
                <span className="text-xs font-bold text-purple-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                </span>
              )}

              <button
                onClick={() => onViewDetails(item)}
                className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                title="View Full Item"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Poster manage & flag actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onManage(item)}
                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Manage / Edit / Renew"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onReportSpam(item)}
                className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Report post"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
