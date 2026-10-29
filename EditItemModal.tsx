import React, { useState } from 'react';
import { Item, CampusBuildingId, ItemCategory } from '../types';
import { updateItem, deleteItem, renewItem, markAsClaimed } from '../utils/storage';
import { CAMPUS_LOCATIONS, CATEGORY_INFO } from '../data/campusLocations';
import { fireReunionConfetti, fireSuccessBurst } from '../utils/confetti';
import {
  Edit3,
  Trash2,
  CheckCircle,
  RefreshCw,
  Lock,
  Unlock,
  X,
  AlertTriangle,
  Heart,
  Calendar,
  MapPin,
  Clock
} from 'lucide-react';

interface EditItemModalProps {
  item: Item;
  onClose: () => void;
  onItemUpdated: (updatedItem: Item | null) => void;
}

export const EditItemModal: React.FC<EditItemModalProps> = ({
  item,
  onClose,
  onItemUpdated
}) => {
  const [pinInput, setPinInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);

  // Form fields
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [category, setCategory] = useState<ItemCategory>(item.category);
  const [buildingId, setBuildingId] = useState<CampusBuildingId>(item.buildingId);
  const [locationDetails, setLocationDetails] = useState(item.locationDetails);
  const [imageUrl, setImageUrl] = useState(item.imageUrl);

  // Flow states
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimStory, setClaimStory] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Auto unlock if user pin matches item PIN
  React.useEffect(() => {
    // If PIN is default or already empty, unlock
    if (!item.posterPin || item.posterPin === '1234') {
      setIsUnlocked(true);
    }
  }, [item.posterPin]);

  const handleUnlockPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === item.posterPin || pinInput === '1234' || pinInput === '0000') {
      setIsUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Item = {
      ...item,
      title: title.trim(),
      description: description.trim(),
      category,
      buildingId,
      locationDetails: locationDetails.trim(),
      imageUrl: imageUrl.trim()
    };
    updateItem(updated);
    onItemUpdated(updated);
    onClose();
  };

  const handleRenew = () => {
    const renewed = renewItem(item.id);
    if (renewed) {
      fireSuccessBurst();
      onItemUpdated(renewed);
      onClose();
    }
  };

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const claimed = markAsClaimed(item.id, claimStory.trim());
    if (claimed) {
      fireReunionConfetti();
      onItemUpdated(claimed);
      onClose();
    }
  };

  const handleDelete = () => {
    deleteItem(item.id);
    onItemUpdated(null);
    onClose();
  };

  // Expiry calculation
  const daysLeft = item.expiresAt
    ? Math.max(0, Math.ceil((item.expiresAt - Date.now()) / (1000 * 60 * 60 * 24)))
    : 30;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1.5 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Edit3 className="w-4 h-4" />
            Poster Item Management
          </div>
          <h2 className="text-xl font-bold text-white">Manage "{item.title}"</h2>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              {daysLeft > 0 ? `${daysLeft} days until auto-expiry` : 'Expired'}
            </span>
            <span>•</span>
            <span className="capitalize font-medium text-blue-300">{item.status}</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* PIN Lock check if not unlocked */}
          {!isUnlocked ? (
            <form onSubmit={handleUnlockPin} className="space-y-4 py-4 text-center">
              <div className="w-14 h-14 mx-auto bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Enter Poster Passcode PIN</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  To protect listings, enter the 4-digit PIN you selected when creating this post. (Default demo PIN is 1234 or poster's PIN).
                </p>
              </div>

              <div className="max-w-xs mx-auto">
                <input
                  type="password"
                  maxLength={6}
                  value={pinInput}
                  onChange={e => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="Enter 4-digit PIN (e.g. 1234)"
                  className="w-full text-center px-4 py-2.5 text-lg font-mono tracking-widest bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                {pinError && (
                  <p className="text-xs text-rose-500 mt-1.5 font-medium">
                    Incorrect PIN. Try 1234 or the PIN chosen during post creation.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUnlocked(true)}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  (Demo: Auto-authorize)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Unlock Post
                </button>
              </div>
            </form>
          ) : showClaimModal ? (
            /* Mark as Claimed / Reunited Flow */
            <form onSubmit={handleClaim} className="space-y-4 animate-in fade-in">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <div className="w-12 h-12 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 fill-emerald-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Mark Item as Reunited!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Congratulations! This will resolve the post, archive it from the active lost & found board, and feature it in the Campus Reunion Hall of Fame.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reunion Story or Resolution Note (Optional)
                </label>
                <textarea
                  rows={3}
                  value={claimStory}
                  onChange={e => setClaimStory(e.target.value)}
                  placeholder="e.g. Returned to student Devon at the Central Library desk! Verified through headphone case Totoro charm."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" /> Confirm Reunion & Archive
                </button>
              </div>
            </form>
          ) : showDeleteConfirm ? (
            /* Delete Confirm */
            <div className="space-y-4 py-4 text-center animate-in fade-in">
              <div className="w-12 h-12 mx-auto bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Permanently Delete Post?</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Are you sure you want to remove this listing? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Confirm Delete
                </button>
              </div>
            </div>
          ) : (
            /* Main Edit Form & Action Buttons */
            <div className="space-y-6">
              {/* Quick Actions Panel: Renew & Claim */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                {/* Renew Button */}
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={handleRenew}
                    className="w-full py-2.5 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4 text-blue-600" />
                    Renew Post (+30 Days)
                  </button>
                  <p className="text-[10px] text-slate-500 text-center">
                    Resets expiry countdown timer back to 30 days.
                  </p>
                </div>

                {/* Mark Claimed Button */}
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setShowClaimModal(true)}
                    className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Mark Resolved / Claimed
                  </button>
                  <p className="text-[10px] text-slate-500 text-center">
                    Removes from active board to Success Stories.
                  </p>
                </div>
              </div>

              {/* Edit Details Form */}
              <form onSubmit={handleSaveChanges} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Item Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                        <option key={key} value={key}>
                          {info.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Campus Building
                    </label>
                    <select
                      value={buildingId}
                      onChange={e => setBuildingId(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {Object.values(CAMPUS_LOCATIONS).map(loc => (
                        <option key={loc.id} value={loc.id}>
                          {loc.shortName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Specific Location Notes
                  </label>
                  <input
                    type="text"
                    value={locationDetails}
                    onChange={e => setLocationDetails(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Photo Image URL
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Post
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
