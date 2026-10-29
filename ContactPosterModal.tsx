import React, { useState } from 'react';
import { Item } from '../types';
import { sendMessage, getCurrentUser } from '../utils/storage';
import { SAFE_MEETING_SPOTS } from '../data/campusLocations';
import {
  Mail,
  Shield,
  Send,
  X,
  MapPin,
  CheckCircle2,
  Lock,
  MessageSquare
} from 'lucide-react';

interface ContactPosterModalProps {
  item: Item;
  onClose: () => void;
  onMessageSent?: () => void;
}

export const ContactPosterModal: React.FC<ContactPosterModalProps> = ({
  item,
  onClose,
  onMessageSent
}) => {
  const currentUser = getCurrentUser();
  const [senderName, setSenderName] = useState(currentUser.name);
  const [senderEmail, setSenderEmail] = useState(currentUser.email);
  const [messageText, setMessageText] = useState(
    item.type === 'found'
      ? `Hi ${item.posterName}, I believe this found item is mine. Could we coordinate a safe handover on campus?`
      : `Hi ${item.posterName}, I think I may have found your item or have information about it!`
  );
  const [selectedMeetingSpot, setSelectedMeetingSpot] = useState(SAFE_MEETING_SPOTS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !senderEmail.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      sendMessage(
        item.id,
        item.title,
        item.posterEmail,
        senderName.trim(),
        senderEmail.trim(),
        messageText.trim(),
        selectedMeetingSpot
      );
      setIsSubmitting(false);
      setSentSuccess(true);
      if (onMessageSent) onMessageSent();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1.5 text-blue-200 text-xs font-semibold uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            Protected Campus Contact
          </div>
          <h2 className="text-xl font-bold text-white">Message the Poster</h2>
          <p className="text-xs text-blue-100 mt-1">
            Personal phone numbers and private addresses remain concealed. Your inquiry is relayed securely through FindIt.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Target item badge */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
              onError={e => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80';
              }}
            />
            <div className="min-w-0 flex-1">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  item.type === 'lost'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {item.type} Item
              </span>
              <h4 className="font-semibold text-slate-900 text-xs truncate mt-0.5">{item.title}</h4>
              <p className="text-[11px] text-slate-500 truncate">
                Poster: {item.posterName} (via protected relay)
              </p>
            </div>
          </div>

          {!sentSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={e => setSenderName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Campus Email
                  </label>
                  <input
                    type="email"
                    required
                    value={senderEmail}
                    onChange={e => setSenderEmail(e.target.value)}
                    placeholder="e.g. arivera@campus.edu"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Recommended Safe Campus Handover Spots */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  Suggest Safe Campus Meeting Spot
                </label>
                <select
                  value={selectedMeetingSpot}
                  onChange={e => setSelectedMeetingSpot(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {SAFE_MEETING_SPOTS.map(spot => (
                    <option key={spot} value={spot}>
                      {spot}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  We recommend public, staffed locations such as security or service desks.
                </p>
              </div>

              {/* Message Content */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message to Poster
                </label>
                <textarea
                  required
                  rows={4}
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Describe your item or ask when they are free to meet..."
                />
              </div>

              {/* Campus Safety Notice */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-[11px] text-amber-800">
                <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Safety First:</strong> Never share sensitive passwords or credit card numbers. Never meet in secluded off-campus areas.
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
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Send Protected Message
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Message Dispatched!</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                  Your message was sent to <strong>{item.posterName}</strong>. A copy has been saved to your campus message inbox.
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs text-slate-600">
                <div className="font-semibold text-slate-800 mb-1">Proposed Location:</div>
                <div className="text-blue-700 font-medium">{selectedMeetingSpot}</div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Return to Board
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
