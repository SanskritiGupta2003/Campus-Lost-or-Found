import React from 'react';
import { Item } from '../types';
import { CAMPUS_LOCATIONS } from '../data/campusLocations';
import {
  Heart,
  Sparkles,
  Calendar,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Award,
  ArrowRight
} from 'lucide-react';

interface SuccessStoriesProps {
  claimedItems: Item[];
  onSelectItem: (item: Item) => void;
  onPostClick: () => void;
}

export const SuccessStories: React.FC<SuccessStoriesProps> = ({
  claimedItems,
  onSelectItem,
  onPostClick
}) => {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white mb-3">
            <Heart className="w-3.5 h-3.5 fill-rose-300 text-rose-300" />
            Campus Reunion Hall of Fame
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            When Lost Items Find Their Way Home
          </h2>
          <p className="mt-2 text-sm text-emerald-100 leading-relaxed">
            Every semester, hundreds of laptops, earbuds, IDs, and treasured keepsakes are returned safely by honest students and faculty.
          </p>

          <div className="flex flex-wrap items-center gap-6 mt-6 pt-4 border-t border-white/20">
            <div>
              <div className="text-2xl font-black">94.2%</div>
              <div className="text-xs text-emerald-100">Verification Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-black">&lt; 24 hrs</div>
              <div className="text-xs text-emerald-100">Average Reunited Time</div>
            </div>
            <div>
              <div className="text-2xl font-black">{claimedItems.length + 140}+</div>
              <div className="text-xs text-emerald-100">Total Items Returned</div>
            </div>
          </div>
        </div>

        {/* Decorative sparkles */}
        <div className="absolute right-6 -bottom-6 opacity-20 pointer-events-none">
          <Award className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* Grid of Success Stories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {claimedItems.map(item => {
          const building = CAMPUS_LOCATIONS[item.buildingId];

          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
            >
              {/* Image banner with Reunited ribbon */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={e => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />

                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 bg-emerald-600/95 backdrop-blur-md text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1 border border-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Reunited
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {building?.shortName || item.buildingId}
                  </span>
                  <h3 className="font-bold text-base text-white truncate drop-shadow-sm">
                    {item.title}
                  </h3>
                </div>
              </div>

              {/* Story Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-slate-700 leading-relaxed italic">
                    "{item.claimedStory || 'Owner was verified and item safely collected from campus desk!'}"
                  </div>

                  {item.secretQuestion && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Verified via secret owner question</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {item.claimedAt
                      ? new Date(item.claimedAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric'
                        })
                      : 'Recently Reunited'}
                  </span>

                  <span className="font-semibold text-emerald-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Read Story <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
