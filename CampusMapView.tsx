import React, { useState, useMemo } from 'react';
import { Item, CampusBuildingId } from '../types';
import { CAMPUS_LOCATIONS } from '../data/campusLocations';
import {
  MapPin,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Navigation,
  Compass,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Eye
} from 'lucide-react';

interface CampusMapViewProps {
  items: Item[];
  selectedItem?: Item | null;
  onSelectItem: (item: Item) => void;
  // If in picker mode for posting
  isPickerMode?: boolean;
  pickerCoords?: { x: number; y: number };
  onPickCoords?: (coords: { x: number; y: number }, buildingId: CampusBuildingId) => void;
}

export const CampusMapView: React.FC<CampusMapViewProps> = ({
  items,
  selectedItem,
  onSelectItem,
  isPickerMode = false,
  pickerCoords,
  onPickCoords
}) => {
  const [filterType, setFilterType] = useState<'all' | 'lost' | 'found'>('all');
  const [activeBuildingFilter, setActiveBuildingFilter] = useState<CampusBuildingId | 'all'>('all');
  const [hoveredPin, setHoveredPin] = useState<Item | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [previewItem, setPreviewItem] = useState<Item | null>(selectedItem || null);

  // Sync selectedItem from props
  React.useEffect(() => {
    if (selectedItem) {
      setPreviewItem(selectedItem);
    }
  }, [selectedItem]);

  // Filter items for map
  const visibleItems = useMemo(() => {
    return items.filter(item => {
      if (filterType !== 'all' && item.type !== filterType) return false;
      if (activeBuildingFilter !== 'all' && item.buildingId !== activeBuildingFilter) return false;
      return true;
    });
  }, [items, filterType, activeBuildingFilter]);

  // Find nearest building to coordinates
  const findNearestBuilding = (x: number, y: number): CampusBuildingId => {
    let nearest: CampusBuildingId = 'library';
    let minDistance = Infinity;

    (Object.keys(CAMPUS_LOCATIONS) as CampusBuildingId[]).forEach(id => {
      const b = CAMPUS_LOCATIONS[id];
      const dist = Math.hypot(b.coords.x - x, b.coords.y - y);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = id;
      }
    });

    return nearest;
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPickerMode || !onPickCoords) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const clampedX = Math.max(5, Math.min(95, x));
    const clampedY = Math.max(5, Math.min(95, y));
    const nearest = findNearestBuilding(clampedX, clampedY);

    onPickCoords({ x: clampedX, y: clampedY }, nearest);
  };

  return (
    <div className="relative w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl select-none">
      {/* Top Map Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Filter tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-lg pointer-events-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterType === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Pins ({items.length})
          </button>
          <button
            onClick={() => setFilterType('lost')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              filterType === 'lost'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            Lost ({items.filter(i => i.type === 'lost').length})
          </button>
          <button
            onClick={() => setFilterType('found')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              filterType === 'found'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Found ({items.filter(i => i.type === 'found').length})
          </button>
        </div>

        {/* Right: Building Jump Filter & Zoom */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <select
            value={activeBuildingFilter}
            onChange={e => setActiveBuildingFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs font-medium bg-slate-900/90 backdrop-blur-md text-slate-200 border border-slate-700/80 rounded-xl shadow-lg outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Entire Campus</option>
            {Object.values(CAMPUS_LOCATIONS).map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.shortName}
              </option>
            ))}
          </select>

          <div className="flex items-center bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-lg p-1 text-slate-300">
            <button
              onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.15))}
              className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.85, prev - 0.15))}
              className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setZoomLevel(1);
                setActiveBuildingFilter('all');
              }}
              className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Reset View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Picker Mode Instruction Banner */}
      {isPickerMode && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-indigo-600/95 backdrop-blur-md text-white text-xs font-semibold rounded-full shadow-xl flex items-center gap-2 animate-bounce">
          <Navigation className="w-3.5 h-3.5" />
          Click anywhere on the map to place your pin!
        </div>
      )}

      {/* Main Map Container */}
      <div
        onClick={handleMapClick}
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center center',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className={`relative w-full aspect-[16/10] min-h-[460px] md:min-h-[520px] overflow-hidden ${
          isPickerMode ? 'cursor-crosshair' : 'cursor-default'
        }`}
      >
        {/* SVG Campus Illustration */}
        <svg
          viewBox="0 0 1000 650"
          className="absolute inset-0 w-full h-full object-cover"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Campus Grounds Gradients */}
            <radialGradient id="lawnGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e3a2f" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0f1f1a" stopOpacity="0.4" />
            </radialGradient>
            <pattern id="campusGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.25" />
            </pattern>
          </defs>

          {/* Base Campus Terrain */}
          <rect width="1000" height="650" fill="#090d16" />
          <rect width="1000" height="650" fill="url(#campusGrid)" />

          {/* Green lawns & Parks */}
          {/* North Quad Green */}
          <path
            d="M 180 80 Q 280 60 380 90 Q 420 200 320 240 Q 190 230 180 80 Z"
            fill="url(#lawnGlow)"
            stroke="#166534"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.8"
          />
          {/* Central Memorial Lawn */}
          <circle cx="380" cy="312" r="95" fill="url(#lawnGlow)" stroke="#166534" strokeWidth="1.5" opacity="0.9" />
          {/* South East Commons Green */}
          <path
            d="M 680 380 Q 820 370 850 490 Q 750 560 660 520 Z"
            fill="url(#lawnGlow)"
            stroke="#166534"
            strokeWidth="1.5"
            opacity="0.75"
          />

          {/* Pedestrian Pathways & Walkways */}
          <g stroke="#475569" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.35">
            {/* Main Spine (East-West diagonal) */}
            <path d="M 120 480 Q 380 312 480 247 T 740 208" />
            <path d="M 280 143 L 380 312 L 550 377 L 760 442" />
            <path d="M 480 247 L 550 377 L 260 468" />
            <path d="M 380 312 L 800 312" />
          </g>

          <g stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6">
            <path d="M 120 480 Q 380 312 480 247 T 740 208" />
            <path d="M 280 143 L 380 312 L 550 377 L 760 442" />
            <path d="M 480 247 L 550 377 L 260 468" />
            <path d="M 380 312 L 800 312" />
          </g>

          {/* Central Fountain Feature */}
          <circle cx="380" cy="312" r="22" fill="#0284c7" stroke="#38bdf8" strokeWidth="3" opacity="0.7" />
          <circle cx="380" cy="312" r="10" fill="#7dd3fc" opacity="0.9" />

          {/* Stylized Campus Buildings */}
          {/* 1. Central Library (48%, 38% -> 480, 247) */}
          <g className="transition-transform duration-200 hover:scale-105 origin-[480px_247px]">
            <rect x="420" y="205" width="120" height="85" rx="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="2.5" />
            <rect x="445" y="225" width="70" height="45" rx="4" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" />
            <text x="480" y="250" fill="#93c5fd" fontSize="12" fontWeight="700" textAnchor="middle">LIBRARY</text>
            <text x="480" y="265" fill="#64748b" fontSize="9" textAnchor="middle">W.E.B. Du Bois</text>
          </g>

          {/* 2. Student Union (55%, 58% -> 550, 377) */}
          <g className="transition-transform duration-200 hover:scale-105 origin-[550px_377px]">
            <polygon points="500,340 600,340 615,415 485,415" fill="#1e293b" stroke="#8b5cf6" strokeWidth="2.5" />
            <text x="550" y="380" fill="#c4b5fd" fontSize="12" fontWeight="700" textAnchor="middle">STUDENT UNION</text>
            <text x="550" y="395" fill="#64748b" fontSize="9" textAnchor="middle">Dining & Services</text>
          </g>

          {/* 3. Science & Eng Complex (74%, 32% -> 740, 208) */}
          <g className="transition-transform duration-200 hover:scale-105 origin-[740px_208px]">
            <rect x="680" y="165" width="120" height="85" rx="6" fill="#1e293b" stroke="#06b6d4" strokeWidth="2.5" />
            <path d="M 680 195 L 800 195" stroke="#334155" strokeWidth="1" />
            <text x="740" y="210" fill="#67e8f9" fontSize="12" fontWeight="700" textAnchor="middle">SCIENCE QUAD</text>
            <text x="740" y="225" fill="#64748b" fontSize="9" textAnchor="middle">Eng & Tech Labs</text>
          </g>

          {/* 4. Rec Center (26%, 72% -> 260, 468) */}
          <g className="transition-transform duration-200 hover:scale-105 origin-[260px_468px]">
            <rect x="200" y="425" width="120" height="85" rx="8" fill="#1e293b" stroke="#f59e0b" strokeWidth="2.5" />
            {/* Basketball court markings miniature */}
            <circle cx="260" cy="467" r="16" fill="none" stroke="#b45309" strokeWidth="1" />
            <text x="260" y="465" fill="#fcd34d" fontSize="12" fontWeight="700" textAnchor="middle">REC CENTER</text>
            <text x="260" y="480" fill="#64748b" fontSize="9" textAnchor="middle">Arena & Courts</text>
          </g>

          {/* 5. North Dorms (28%, 22% -> 280, 143) */}
          <g className="transition-transform duration-200 hover:scale-105 origin-[280px_143px]">
            <rect x="220" y="105" width="120" height="75" rx="6" fill="#1e293b" stroke="#10b981" strokeWidth="2.5" />
            <text x="280" y="145" fill="#6ee7b7" fontSize="12" fontWeight="700" textAnchor="middle">NORTH DORMS</text>
            <text x="280" y="160" fill="#64748b" fontSize="9" textAnchor="middle">Residential Quad</text>
          </g>

          {/* 6. Westlake Dining Commons (76%, 68% -> 760, 442) */}
          <g className="transition-transform duration-200 hover:scale-105 origin-[760px_442px]">
            <rect x="700" y="400" width="120" height="85" rx="8" fill="#1e293b" stroke="#ec4899" strokeWidth="2.5" />
            <text x="760" y="445" fill="#f472b6" fontSize="12" fontWeight="700" textAnchor="middle">DINING COMMONS</text>
            <text x="760" y="460" fill="#64748b" fontSize="9" textAnchor="middle">Westlake Hall</text>
          </g>

          {/* 7. Fine Arts Pavilion (80%, 48% -> 800, 312) */}
          <g className="transition-transform duration-200 hover:scale-105 origin-[800px_312px]">
            <polygon points="760,280 840,280 855,345 745,345" fill="#1e293b" stroke="#a855f7" strokeWidth="2.5" />
            <text x="800" y="315" fill="#d8b4fe" fontSize="11" fontWeight="700" textAnchor="middle">ARTS PAVILION</text>
            <text x="800" y="330" fill="#64748b" fontSize="9" textAnchor="middle">Theater & Studios</text>
          </g>

          {/* Oak Quad label */}
          <text x="380" y="348" fill="#4ade80" fontSize="11" fontWeight="700" textAnchor="middle">
            OAK MEMORIAL QUAD
          </text>
        </svg>

        {/* Decorative Compass Rose */}
        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 rounded-lg text-slate-400 text-[11px] font-mono pointer-events-none">
          <Compass className="w-3.5 h-3.5 text-blue-400 animate-spin-slow" />
          <span>WESTLAKE CAMPUS</span>
        </div>

        {/* Picker Mode Placement Pin */}
        {isPickerMode && pickerCoords && (
          <div
            style={{ left: `${pickerCoords.x}%`, top: `${pickerCoords.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-full z-40 transition-all duration-150 pointer-events-none"
          >
            <div className="relative flex flex-col items-center">
              <span className="px-2.5 py-1 bg-indigo-600 text-white text-[11px] font-bold rounded-md shadow-lg whitespace-nowrap mb-1 flex items-center gap-1 border border-indigo-400 animate-pulse">
                <MapPin className="w-3 h-3" /> Selected Spot
              </span>
              <div className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-white shadow-xl flex items-center justify-center text-white">
                <MapPin className="w-5 h-5 fill-white" />
              </div>
              <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-ping mt-1" />
            </div>
          </div>
        )}

        {/* Placed Item Pins */}
        {!isPickerMode &&
          visibleItems.map(item => {
            const isSelected = previewItem?.id === item.id;
            const isLost = item.type === 'lost';
            const isClaimed = item.status === 'claimed';

            const pinBg = isClaimed
              ? 'bg-purple-600 border-purple-300'
              : isLost
              ? 'bg-rose-500 border-rose-200'
              : 'bg-emerald-500 border-emerald-200';

            return (
              <div
                key={item.id}
                style={{
                  left: `${item.coordinates.x}%`,
                  top: `${item.coordinates.y}%`
                }}
                className={`absolute -translate-x-1/2 -translate-y-full z-30 transition-transform ${
                  isSelected ? 'scale-125 z-40' : 'hover:scale-115'
                }`}
                onMouseEnter={() => setHoveredPin(item)}
                onMouseLeave={() => setHoveredPin(null)}
                onClick={e => {
                  e.stopPropagation();
                  setPreviewItem(item);
                  onSelectItem(item);
                }}
              >
                {/* Ping wave animation for selected or recent items */}
                {isSelected && (
                  <div
                    className={`absolute inset-0 rounded-full animate-ping opacity-75 ${
                      isLost ? 'bg-rose-400' : 'bg-emerald-400'
                    }`}
                  />
                )}

                <button
                  type="button"
                  className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 text-white shadow-lg cursor-pointer ${pinBg}`}
                  title={`${item.title} (${item.type.toUpperCase()})`}
                >
                  {isClaimed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <MapPin className="w-4 h-4 fill-white/30" />
                  )}
                </button>

                {/* Subtle pin tail triangle */}
                <div
                  className={`w-0 h-0 mx-auto border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] ${
                    isClaimed
                      ? 'border-t-purple-600'
                      : isLost
                      ? 'border-t-rose-500'
                      : 'border-t-emerald-500'
                  }`}
                />
              </div>
            );
          })}
      </div>

      {/* Floating Pin Preview Card */}
      {previewItem && !isPickerMode && (
        <div className="absolute bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-40 p-4 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl text-white transition-all animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start gap-3">
            <img
              src={previewItem.imageUrl}
              alt={previewItem.title}
              className="w-20 h-20 rounded-xl object-cover border border-slate-700 shrink-0 bg-slate-800"
              onError={e => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80';
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    previewItem.status === 'claimed'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : previewItem.type === 'lost'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {previewItem.status === 'claimed' ? 'Reunited' : previewItem.type}
                </span>
                <span className="text-xs text-slate-400 truncate">
                  {CAMPUS_LOCATIONS[previewItem.buildingId]?.shortName || previewItem.buildingId}
                </span>
              </div>
              <h4 className="font-semibold text-sm text-slate-100 truncate mb-1">
                {previewItem.title}
              </h4>
              <p className="text-xs text-slate-300 line-clamp-1 mb-2">
                {previewItem.locationDetails}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectItem(previewItem)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> View Item Details
                </button>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 hidden lg:flex items-center gap-3 px-3 py-1.5 bg-slate-900/85 backdrop-blur-sm border border-slate-800 rounded-xl text-[11px] text-slate-300 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Lost Items</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Found Items</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          <span>Claimed / Reunited</span>
        </div>
      </div>
    </div>
  );
};
