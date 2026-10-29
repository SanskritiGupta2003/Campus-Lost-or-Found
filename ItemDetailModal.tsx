import React from 'react';
import { Item, MatchResult } from '../types';
import { CAMPUS_LOCATIONS, CATEGORY_INFO } from '../data/campusLocations';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  Share2,
  Flag,
  Edit,
  CheckCircle2,
  Building2,
  Lock,
  ArrowRight
} from 'lucide-react';

interface ItemDetailModalProps {
  item: Item;
  matches: MatchResult[];
  onClose: () => void;
  onContact: (item: Item) => void;
  onClaim: (item: Item) => void;
  onViewMatches: (item: Item) => void;
  onShowOnMap: (item: Item) => void;
  onManage: (item: Item) => void;
  onReportSpam: (item: Item) => void;
  onSelectCandidate: (candidate: Item) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  matches,
  onClose,
  onContact,
  onClaim,
  onViewMatches,
  onShowOnMap,
  onManage,
  onReportSpam,
  onSelectCandidate
}) => {
  const isLost = item.type === 'lost';
  const isClaimed = item.status === 'claimed';
  const isExpired = item.status === 'expired';

  const building = CAMPUS_LOCATIONS[item.buildingId];
  const categoryInfo = CATEGORY_INFO[item.category] || CATEGORY_INFO['other'];

  // Expiry calculation
  const totalDays = 30;
  const daysLeft = item.expiresAt
    ? Math.max(0, Math.ceil((item.expiresAt - Date.now()) / (1000 * 60 * 60 * 24)))
    : 30;
  const expiryPercent = Math.min(100, Math.max(5, (daysLeft / totalDays) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                isClaimed
                  ? 'bg-purple-100 text-purple-700'
                  : isLost
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {isClaimed ? 'Reunited Item' : `${item.type} Item`}
            </span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {categoryInfo.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onManage(item)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1.5"
              title="Poster settings"
            >
              <Edit className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Manage Post</span>
            </button>
            <button
              onClick={() => onReportSpam(item)}
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
              title="Flag or Report"
            >
              <Flag className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main Visual & Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image */}
            <div className="relative aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={e => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80';
                }}
              />
              {isClaimed && (
                <div className="absolute inset-0 bg-purple-900/40 backdrop-blur-xs flex items-center justify-center">
                  <div className="px-4 py-2 bg-purple-600 text-white font-bold rounded-2xl shadow-xl flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> Successfully Reunited
                  </div>
                </div>
              )}
            </div>

            {/* Info details */}
            <div className="flex flex-col justify-between space-y-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  {item.title}
                </h1>

                <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    {item.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Reported {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                  <div className="flex items-start gap-2 text-xs">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">{building?.name}</span>
                      <p className="text-slate-600 mt-0.5">{item.locationDetails}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onShowOnMap(item);
                      onClose();
                    }}
                    className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 mt-2"
                  >
                    <Building2 className="w-3.5 h-3.5" /> Locate on Campus Map
                  </button>
                </div>
              </div>

              {/* Expiry countdown indicator */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    Auto-Expiry Timeline:
                  </span>
                  <span className={daysLeft <= 3 ? 'text-amber-600 font-bold' : 'text-slate-700'}>
                    {isExpired ? 'Expired' : `${daysLeft} of 30 days remaining`}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${expiryPercent}%` }}
                    className={`h-full transition-all duration-500 ${
                      daysLeft <= 3 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Posts auto-archive after 30 days unless renewed by the poster.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                {item.type === 'found' && item.secretQuestion && !isClaimed ? (
                  <button
                    onClick={() => {
                      onClaim(item);
                      onClose();
                    }}
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Answer Secret Question to Claim
                  </button>
                ) : !isClaimed ? (
                  <button
                    onClick={() => {
                      onContact(item);
                      onClose();
                    }}
                    className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message Poster Securely
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {/* Full Description & Secret Question Details */}
          <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Full Item Description</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {item.description}
            </p>

            {item.secretQuestion && (
              <div className="mt-4 p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Finder Security Challenge Active
                </div>
                <p className="text-xs text-emerald-800">
                  "{item.secretQuestion}"
                </p>
                <p className="text-[11px] text-emerald-600">
                  Click 'Answer Secret Question to Claim' above to submit your proof of ownership.
                </p>
              </div>
            )}

            {item.claimedStory && (
              <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                <div className="font-bold text-purple-900 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  Resolution Story:
                </div>
                <p className="text-xs text-purple-800 italic">
                  "{item.claimedStory}"
                </p>
              </div>
            )}
          </div>

          {/* Safe Campus Drop-off Spot */}
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-3">
            <Building2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900">
              <span className="font-bold block">Recommended Safe Handover Location:</span>
              <p className="text-blue-700 mt-0.5">
                {building?.safeDropoffSpot || 'Central Library Front Circulation Desk'}.
                Always meet in staffed campus public spaces.
              </p>
            </div>
          </div>

          {/* Match Suggestions Module inside Item Detail */}
          {matches.length > 0 && !isClaimed && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Potential Campus Matches ({matches.length})
                  </h3>
                </div>
                <button
                  onClick={() => {
                    onViewMatches(item);
                    onClose();
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  Side-by-side View <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {matches.slice(0, 2).map(({ candidateItem, score, reason }) => (
                  <div
                    key={candidateItem.id}
                    onClick={() => {
                      onSelectCandidate(candidateItem);
                    }}
                    className="p-3 bg-slate-50 border border-slate-200 hover:border-blue-400 rounded-xl transition-all cursor-pointer flex gap-3 group"
                  >
                    <img
                      src={candidateItem.imageUrl}
                      alt={candidateItem.title}
                      className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[10px] font-bold">
                          {score}% Match
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-slate-500">
                          {candidateItem.type}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 truncate mt-1 group-hover:text-blue-600">
                        {candidateItem.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
