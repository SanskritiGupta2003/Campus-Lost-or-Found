import React, { useState } from 'react';
import { Item } from '../types';
import { submitClaimRequest } from '../utils/storage';
import { fireReunionConfetti, fireSuccessBurst } from '../utils/confetti';
import { CAMPUS_LOCATIONS } from '../data/campusLocations';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Lock,
  Unlock,
  Building2,
  Mail,
  User,
  X,
  Sparkles
} from 'lucide-react';

interface ClaimVerificationModalProps {
  item: Item;
  onClose: () => void;
  onClaimSuccess: (updatedItem: Item) => void;
}

export const ClaimVerificationModal: React.FC<ClaimVerificationModalProps> = ({
  item,
  onClose,
  onClaimSuccess
}) => {
  const [claimantName, setClaimantName] = useState('');
  const [claimantEmail, setClaimantEmail] = useState('');
  const [claimantPhone, setClaimantPhone] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultState, setResultState] = useState<'idle' | 'verified' | 'pending' | 'incorrect'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimantName.trim() || !claimantEmail.trim() || !answerText.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const result = submitClaimRequest(
        item.id,
        claimantName.trim(),
        claimantEmail.trim(),
        answerText.trim()
      );

      setIsSubmitting(false);

      if (result) {
        if (result.isInstantMatch) {
          setResultState('verified');
          fireReunionConfetti();
          onClaimSuccess(result.item);
        } else {
          setResultState('pending');
          fireSuccessBurst();
          onClaimSuccess(result.item);
        }
      }
    }, 600);
  };

  const building = CAMPUS_LOCATIONS[item.buildingId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1.5 text-emerald-200 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Finder's Claim Verification
          </div>
          <h2 className="text-xl font-bold text-white">Prove Ownership to Claim</h2>
          <p className="text-xs text-emerald-100 mt-1">
            The finder set a security question to make sure this item goes to its true owner.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Item summary banner */}
          <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
              onError={e => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80';
              }}
            />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                Found Item
              </span>
              <h4 className="font-semibold text-slate-800 text-sm truncate mt-1">{item.title}</h4>
              <p className="text-xs text-slate-500 truncate">
                Found at: {building?.name || item.locationDetails}
              </p>
            </div>
          </div>

          {resultState === 'idle' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Question Box */}
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-amber-200 text-amber-800 rounded-lg shrink-0 mt-0.5">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-amber-900 uppercase tracking-wide block">
                      Finder's Challenge Question:
                    </label>
                    <p className="text-sm font-semibold text-slate-900 mt-1">
                      "{item.secretQuestion || 'Please describe any identifying stickers, unique scratches, or serial numbers.'}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Answer Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Answer <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={answerText}
                  onChange={e => setAnswerText(e.target.value)}
                  placeholder="e.g. It has a blue holographic NASA sticker on the top right, and my initials MK are scratched near the hinge..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Provide specific details that only the genuine owner would know.
                </p>
              </div>

              {/* Claimant Contact info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={claimantName}
                      onChange={e => setClaimantName(e.target.value)}
                      placeholder="e.g. Maya Lin"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Campus Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={claimantEmail}
                      onChange={e => setClaimantEmail(e.target.value)}
                      placeholder="e.g. mlin@campus.edu"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Safe Drop-off Note */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5 text-xs text-blue-800">
                <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Recommended Safe Handover:</strong> {building?.safeDropoffSpot || 'Campus Library Front Desk or Campus Police Lobby'}.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    'Verifying...'
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" /> Submit Claim Verification
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Instant Verification Success */}
          {resultState === 'verified' && (
            <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <Unlock className="w-8 h-8" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> Verification Match Confirmed!
                </span>
                <h3 className="text-lg font-bold text-slate-900">Your Answer Matched!</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                  Congratulations! Your answer matched the finder's security question. You have been verified as the rightful owner.
                </p>
              </div>

              {/* Reveal Poster Contact safely */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-left text-xs text-slate-700 space-y-2">
                <div className="font-semibold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Finder's Verified Contact Information:
                </div>
                <p>
                  <strong>Finder Name:</strong> {item.posterName}
                </p>
                <p>
                  <strong>Campus Email:</strong>{' '}
                  <a
                    href={`mailto:${item.posterEmail}`}
                    className="text-emerald-700 underline font-medium"
                  >
                    {item.posterEmail}
                  </a>
                </p>
                {item.posterPhone && (
                  <p>
                    <strong>Phone / SMS:</strong> {item.posterPhone}
                  </p>
                )}
                <p className="text-slate-500 pt-1 text-[11px]">
                  Safe pickup recommended at: <strong>{building?.safeDropoffSpot || 'Library Front Desk'}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Done
              </button>
            </div>
          )}

          {/* Pending Finder Review */}
          {resultState === 'pending' && (
            <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Claim Submitted to Finder</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                  Your answer has been sent to <strong>{item.posterName}</strong>. You'll receive a confirmation at{' '}
                  <strong>{claimantEmail}</strong> once they approve the pickup.
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs text-slate-600">
                <p className="font-medium text-slate-800 mb-1">Your Submitted Description:</p>
                <p className="italic bg-white p-2.5 rounded-lg border border-slate-100">
                  "{answerText}"
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
