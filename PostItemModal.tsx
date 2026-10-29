import React, { useState, useMemo } from 'react';
import { Item, ItemType, ItemCategory, CampusBuildingId } from '../types';
import { CAMPUS_LOCATIONS, CATEGORY_INFO } from '../data/campusLocations';
import { SAMPLE_PRESET_IMAGES } from '../data/seedItems';
import { addItem, getCurrentUser } from '../utils/storage';
import { findMatchesForItem } from '../utils/matchingEngine';
import { CampusMapView } from './CampusMapView';
import { fireSuccessBurst } from '../utils/confetti';
import {
  PlusCircle,
  Camera,
  Upload,
  MapPin,
  Calendar,
  Lock,
  Sparkles,
  HelpCircle,
  X,
  CheckCircle2,
  Navigation,
  Image as ImageIcon,
  ShieldCheck
} from 'lucide-react';

interface PostItemModalProps {
  existingItems: Item[];
  initialType?: ItemType;
  onClose: () => void;
  onItemCreated: (newItem: Item) => void;
}

export const PostItemModal: React.FC<PostItemModalProps> = ({
  existingItems,
  initialType = 'lost',
  onClose,
  onItemCreated
}) => {
  const currentUser = getCurrentUser();

  const [type, setType] = useState<ItemType>(initialType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ItemCategory>('electronics');
  const [buildingId, setBuildingId] = useState<CampusBuildingId>('library');
  const [locationDetails, setLocationDetails] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [coordinates, setCoordinates] = useState<{ x: number; y: number }>(
    CAMPUS_LOCATIONS['library'].coords
  );

  // Photo handling: custom upload or presets
  const [imageSource, setImageSource] = useState<'preset' | 'upload' | 'url'>('preset');
  const [selectedPreset, setSelectedPreset] = useState<string>(
    SAMPLE_PRESET_IMAGES['electronics'][0]
  );
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [uploadedBase64, setUploadedBase64] = useState<string>('');

  // Finder Secret Question (Optional for 'found', can also be added for 'lost' if desired)
  const [enableSecretQuestion, setEnableSecretQuestion] = useState(false);
  const [secretQuestion, setSecretQuestion] = useState('');
  const [secretAnswer, setSecretAnswer] = useState('');

  // Poster Credentials
  const [posterName, setPosterName] = useState(currentUser.name);
  const [posterEmail, setPosterEmail] = useState(currentUser.email);
  const [posterPhone, setPosterPhone] = useState(currentUser.phone || '');
  const [posterPin, setPosterPin] = useState(currentUser.pin || '1234');

  // Interactive Map Pin Placement Mode
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Live Smart Match Preview
  const liveItemDraft: Item = useMemo(() => {
    return {
      id: 'draft',
      type,
      title: title || 'Draft',
      description: description || '',
      category,
      buildingId,
      locationDetails,
      coordinates,
      date,
      createdAt: Date.now(),
      expiresAt: Date.now() + 30 * 86400000,
      imageUrl: '',
      posterName,
      posterEmail,
      posterPin,
      status: 'active'
    };
  }, [type, title, description, category, buildingId, locationDetails, coordinates, date, posterName, posterEmail, posterPin]);

  const liveMatches = useMemo(() => {
    if (!title.trim() || title.trim().length < 3) return [];
    return findMatchesForItem(liveItemDraft, existingItems, 45).slice(0, 3);
  }, [liveItemDraft, existingItems, title]);

  // Handle image presets on category change
  const currentCategoryPresets = SAMPLE_PRESET_IMAGES[category] || SAMPLE_PRESET_IMAGES['other'];

  const handleCategoryChange = (newCat: ItemCategory) => {
    setCategory(newCat);
    if (SAMPLE_PRESET_IMAGES[newCat] && SAMPLE_PRESET_IMAGES[newCat].length > 0) {
      setSelectedPreset(SAMPLE_PRESET_IMAGES[newCat][0]);
    }
  };

  const handleBuildingChange = (bId: CampusBuildingId) => {
    setBuildingId(bId);
    setCoordinates(CAMPUS_LOCATIONS[bId].coords);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedBase64(reader.result as string);
        setImageSource('upload');
      };
      reader.readAsDataURL(file);
    }
  };

  const finalImageUrl =
    imageSource === 'upload' && uploadedBase64
      ? uploadedBase64
      : imageSource === 'url' && customImageUrl
      ? customImageUrl
      : selectedPreset || currentCategoryPresets[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const created = addItem({
      type,
      title: title.trim(),
      description: description.trim(),
      category,
      buildingId,
      locationDetails: locationDetails.trim() || CAMPUS_LOCATIONS[buildingId].name,
      coordinates,
      date,
      imageUrl: finalImageUrl,
      posterName: posterName.trim() || 'Campus Member',
      posterEmail: posterEmail.trim() || 'student@campus.edu',
      posterPhone: posterPhone.trim() || undefined,
      posterPin: posterPin.trim() || '1234',
      secretQuestion: enableSecretQuestion && secretQuestion.trim() ? secretQuestion.trim() : undefined,
      secretAnswer: enableSecretQuestion && secretAnswer.trim() ? secretAnswer.trim() : undefined
    });

    fireSuccessBurst();
    onItemCreated(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div
          className={`p-6 text-white shrink-0 transition-colors ${
            type === 'lost'
              ? 'bg-gradient-to-r from-rose-600 via-rose-700 to-pink-700'
              : 'bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800'
          }`}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider opacity-80 block">
                Campus Lost & Found Desk
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {type === 'lost' ? 'Report a Lost Item' : 'Report a Found Item'}
              </h2>
            </div>

            {/* Lost / Found Switcher */}
            <div className="flex items-center p-1 bg-black/20 backdrop-blur-md rounded-2xl border border-white/20">
              <button
                type="button"
                onClick={() => setType('lost')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  type === 'lost'
                    ? 'bg-white text-rose-700 shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                I Lost Something
              </button>
              <button
                type="button"
                onClick={() => setType('found')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  type === 'found'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                I Found Something
              </button>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Live Match Alert while typing! */}
          {liveMatches.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs mb-2">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                <span>
                  Instant Match Detector: Found {liveMatches.length} similar active {type === 'lost' ? 'found' : 'lost'} post{liveMatches.length > 1 ? 's' : ''}!
                </span>
              </div>
              <div className="space-y-1.5">
                {liveMatches.map(({ candidateItem, score }) => (
                  <div
                    key={candidateItem.id}
                    className="p-2 bg-white rounded-xl border border-indigo-100 flex items-center justify-between text-xs shadow-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-md text-[10px] font-bold shrink-0">
                        {score}% Match
                      </span>
                      <span className="font-semibold text-slate-800 truncate">
                        {candidateItem.title}
                      </span>
                      <span className="text-slate-400 text-[11px] truncate">
                        ({CAMPUS_LOCATIONS[candidateItem.buildingId]?.shortName})
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-indigo-600 shrink-0 ml-2">
                      Check board
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Item Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Item Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={
                  type === 'lost'
                    ? 'e.g. Sony WH-1000XM4 Headphones (Black)'
                    : 'e.g. Set of Car Keys with Subaru Fob'
                }
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={e => handleCategoryChange(e.target.value as ItemCategory)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {Object.entries(CATEGORY_INFO).map(([catKey, info]) => (
                  <option key={catKey} value={catKey}>
                    {info.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Description & Distinguishing Features <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Include details like brand, color, stickers, scratches, case, or contents to help identify the item..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Location & Interactive Map Pin */}
          <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                Campus Location & Building
              </label>
              <button
                type="button"
                onClick={() => setShowMapPicker(!showMapPicker)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                {showMapPicker ? 'Hide Interactive Map' : 'Pick Pin on Campus Map'}
              </button>
            </div>

            {/* Interactive Map Picker Component */}
            {showMapPicker && (
              <div className="pt-2 animate-in fade-in">
                <CampusMapView
                  items={existingItems}
                  isPickerMode={true}
                  pickerCoords={coordinates}
                  onPickCoords={(coords, bId) => {
                    setCoordinates(coords);
                    setBuildingId(bId);
                  }}
                  onSelectItem={() => {}}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Primary Campus Zone
                </label>
                <select
                  value={buildingId}
                  onChange={e => handleBuildingChange(e.target.value as CampusBuildingId)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {Object.values(CAMPUS_LOCATIONS).map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Specific Spot (Floor, Room, Desk, Benches)
                </label>
                <input
                  type="text"
                  value={locationDetails}
                  onChange={e => setLocationDetails(e.target.value)}
                  placeholder="e.g. 2nd Floor Silent Room, Table 14"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Date {type === 'lost' ? 'Lost' : 'Found'}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full sm:w-48 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Photo Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Item Photo
            </label>

            {/* Photo Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
              <button
                type="button"
                onClick={() => setImageSource('preset')}
                className={`px-3 py-1 font-semibold rounded-lg transition-colors cursor-pointer ${
                  imageSource === 'preset'
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Curated Presets ({currentCategoryPresets.length})
              </button>
              <button
                type="button"
                onClick={() => setImageSource('upload')}
                className={`px-3 py-1 font-semibold rounded-lg transition-colors cursor-pointer ${
                  imageSource === 'upload'
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Upload File / Photo
              </button>
              <button
                type="button"
                onClick={() => setImageSource('url')}
                className={`px-3 py-1 font-semibold rounded-lg transition-colors cursor-pointer ${
                  imageSource === 'url'
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Image URL
              </button>
            </div>

            {/* Presets grid */}
            {imageSource === 'preset' && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                {currentCategoryPresets.map((presetUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPreset(presetUrl)}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                      selectedPreset === presetUrl
                        ? 'border-blue-600 ring-2 ring-blue-500/30 scale-95'
                        : 'border-slate-200 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={presetUrl} alt="Preset" className="w-full h-full object-cover" />
                    {selectedPreset === presetUrl && (
                      <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center text-white">
                        <CheckCircle2 className="w-5 h-5 fill-blue-600 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Upload form */}
            {imageSource === 'upload' && (
              <div className="p-4 border-2 border-dashed border-slate-300 rounded-2xl text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="item-photo-upload"
                />
                <label
                  htmlFor="item-photo-upload"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <div className="p-3 bg-white rounded-full shadow-sm text-blue-600">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">
                    Click to choose a photo or snap a picture
                  </span>
                  <span className="text-[11px] text-slate-400">PNG, JPG, WebP up to 5MB</span>
                </label>
                {uploadedBase64 && (
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <img
                      src={uploadedBase64}
                      alt="Uploaded preview"
                      className="w-16 h-16 rounded-lg object-cover border"
                    />
                    <span className="text-xs text-emerald-600 font-semibold">Photo Attached!</span>
                  </div>
                )}
              </div>
            )}

            {/* URL input */}
            {imageSource === 'url' && (
              <div>
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={e => setCustomImageUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            )}
          </div>

          {/* Finder Claim Verification Challenge (Secret Question) */}
          {type === 'found' && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5 cursor-pointer">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Set Secret Verification Question
                </label>
                <input
                  type="checkbox"
                  checked={enableSecretQuestion}
                  onChange={e => setEnableSecretQuestion(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-emerald-700">
                Recommended! Only the true owner will know the answer (e.g. keychain color, sticker on laptop, engraving, or lock screen wallpaper).
              </p>

              {enableSecretQuestion && (
                <div className="space-y-3 pt-1 animate-in fade-in">
                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                      Your Challenge Question
                    </label>
                    <input
                      type="text"
                      value={secretQuestion}
                      onChange={e => setSecretQuestion(e.target.value)}
                      placeholder="e.g. What sticker is placed on the lower right corner?"
                      className="w-full px-3 py-2 text-xs bg-white border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                      Expected Answer or Key Words (Kept secret from public)
                    </label>
                    <input
                      type="text"
                      value={secretAnswer}
                      onChange={e => setSecretAnswer(e.target.value)}
                      placeholder="e.g. Pikachu yellow sticker"
                      className="w-full px-3 py-2 text-xs bg-white border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Poster Contact Details & Management PIN */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-slate-600" />
              Poster Identity & Management Passcode
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={posterName}
                  onChange={e => setPosterName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Campus Email
                </label>
                <input
                  type="email"
                  required
                  value={posterEmail}
                  onChange={e => setPosterEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  4-Digit Management PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={posterPin}
                  onChange={e => setPosterPin(e.target.value)}
                  placeholder="1234"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono tracking-widest text-center"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              Your 4-digit PIN allows you to mark this item claimed, renew expiry, or edit it later.
            </p>
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer ${
                type === 'lost'
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-200'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-200'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Publish {type === 'lost' ? 'Lost Item Report' : 'Found Item Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
