import React from 'react';
import { Item, MatchResult } from '../types';
import { CAMPUS_LOCATIONS } from '../data/campusLocations';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Calendar,
  X,
  CheckCircle,
  HelpCircle,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

interface MatchDrawerProps {
  targetItem: Item;
  matches: MatchResult[];
  onClose: () => void;
  onSelectCandidate: (candidate: Item) => void;
  onOpenClaim: (candidate: Item) => void;
  onOpenContact: (candidate: Item) => void;
}

export const MatchDrawer: React.FC<MatchDrawerProps> = ({
  targetItem,
  matches,
  onClose,
  onSelectCandidate,
  onOpenClaim,
  onOpenContact
}) => {
  const isLost = targetItem.type === 'lost';
  const oppositeType = isLost ? 'Found' : 'Lost';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-700 via-blue-700 to-indigo-800 text-white shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/10 rounded-lg text-amber-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold">Smart Match Suggestions</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-blue-100 leading-relaxed">
            Comparing your {targetItem.type} item against active {oppositeType.toLowerCase()} reports across campus using keyword similarity, category, location, and dates.
          </p>
        </div>

        {/* Target Item Anchor Strip */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3 shrink-0">
          <img
            src={targetItem.imageUrl}
            alt={targetItem.title}
            className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
            onError={e => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80';
            }}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  isLost ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                Target {targetItem.type}
              </span>
              <span className="text-xs text-slate-400">
                {CAMPUS_LOCATIONS[targetItem.buildingId]?.shortName || targetItem.locationDetails}
              </span>
            </div>
            <h4 className="font-semibold text-slate-900 text-sm truncate mt-0.5">
              {targetItem.title}
            </h4>
            <p className="text-[11px] text-slate-500 line-clamp-1">{targetItem.description}</p>
          </div>
        </div>

        {/* Matches List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {matches.length} Potential Match{matches.length === 1 ? '' : 'es'} Found
            </span>
            <span className="text-[11px] text-blue-600 font-medium">Sorted by match score</span>
          </div>

          {matches.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
              <div className="w-12 h-12 mx-auto bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-700 text-sm">No High Confidence Matches Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                No matching {oppositeType.toLowerCase()} items have been reported yet with matching keywords or locations. You'll be alerted if a match appears!
              </p>
            </div>
          ) : (
            matches.map(({ candidateItem, score, breakdown, reason }) => {
              const scoreColor =
                score >= 80
                  ? 'bg-emerald-500 text-white'
                  : score >= 60
                  ? 'bg-blue-600 text-white'
                  : 'bg-amber-500 text-white';

              return (
                <div
                  key={candidateItem.id}
                  className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-blue-400 hover:shadow-md transition-all space-y-3"
                >
                  {/* Top Match Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1 ${scoreColor}`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {score}% Match
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                        {candidateItem.type.toUpperCase()}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {candidateItem.date}
                    </span>
                  </div>

                  {/* Item Details */}
                  <div className="flex gap-3.5">
                    <img
                      src={candidateItem.imageUrl}
                      alt={candidateItem.title}
                      className="w-18 h-18 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                      onError={e => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors line-clamp-1">
                        {candidateItem.title}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                        {candidateItem.description}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate">
                          {CAMPUS_LOCATIONS[candidateItem.buildingId]?.shortName ||
                            candidateItem.locationDetails}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Why it matches tags */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
                    <div className="font-semibold text-slate-700 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                      Match Breakdown:
                    </div>
                    <p className="text-slate-500 italic pl-4">{reason}</p>
                    {breakdown.commonKeywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 pl-4 pt-1">
                        {breakdown.commonKeywords.map(keyword => (
                          <span
                            key={keyword}
                            className="bg-blue-100/70 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                          >
                            #{keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1 gap-2">
                    <button
                      onClick={() => onSelectCandidate(candidateItem)}
                      className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      Inspect Full Post
                    </button>

                    <div className="flex items-center gap-2">
                      {candidateItem.type === 'found' && candidateItem.secretQuestion ? (
                        <button
                          onClick={() => onOpenClaim(candidateItem)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" /> Answer Question
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenContact(candidateItem)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Message Poster
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
