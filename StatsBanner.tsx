import React from 'react';
import { Sparkles, ShieldCheck, MapPin, Clock, Search, HelpCircle } from 'lucide-react';

interface StatsBannerProps {
  onPostLost: () => void;
  onPostFound: () => void;
  onOpenMap: () => void;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  onPostLost,
  onPostFound,
  onOpenMap
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
      {/* Background glow effects */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-xs font-bold text-blue-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Official Westlake Campus Lost & Found
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Lost Something on Campus? <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
              We help reunite it with you safely.
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Post in 60 seconds with photos, browse campus pins, get automatic match suggestions, and verify ownership with secret challenge questions.
          </p>
        </div>

        {/* Action cards / buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <button
            onClick={onPostLost}
            className="px-5 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-rose-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>I Lost an Item</span>
          </button>

          <button
            onClick={onPostFound}
            className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>I Found an Item</span>
          </button>

          <button
            onClick={onOpenMap}
            className="px-4 py-3.5 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-blue-400" />
            <span>Campus Map</span>
          </button>
        </div>
      </div>

      {/* Feature highlight badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Smart Match Engine</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Secret Question Verification</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400 shrink-0" />
          <span>30-Day Auto Expiry</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
          <span>Campus Zones & Safe Desks</span>
        </div>
      </div>
    </div>
  );
};
