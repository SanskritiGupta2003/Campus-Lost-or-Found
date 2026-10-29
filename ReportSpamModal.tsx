import React, { useState } from 'react';
import { Item } from '../types';
import { reportItemSpam } from '../utils/storage';
import { Flag, AlertTriangle, CheckCircle, X, ShieldAlert } from 'lucide-react';

interface ReportSpamModalProps {
  item: Item;
  onClose: () => void;
  onReportSuccess: (updatedItem: Item) => void;
}

const REPORT_REASONS = [
  'Spam, advertising, or commercial solicitation',
  'Fake post / troll submission',
  'Item has already been returned or resolved',
  'Inappropriate or offensive photo/content',
  'Duplicate listing',
  'Other violation of campus guidelines'
];

export const ReportSpamModal: React.FC<ReportSpamModalProps> = ({
  item,
  onClose,
  onReportSuccess
}) => {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const fullReason = additionalDetails.trim()
        ? `${selectedReason}: ${additionalDetails.trim()}`
        : selectedReason;

      const updated = reportItemSpam(item.id, fullReason);
      setIsSubmitting(false);
      setIsDone(true);
      if (updated) {
        onReportSuccess(updated);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-amber-700 p-5 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1 text-rose-200 text-xs font-semibold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            Community Moderation
          </div>
          <h2 className="text-lg font-bold text-white">Report Post</h2>
          <p className="text-xs text-rose-100 mt-1">
            Help keep FindIt trusted and clean for all campus students and faculty.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {!isDone ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Select Reason for Flagging
                </label>
                <div className="space-y-2">
                  {REPORT_REASONS.map(reason => (
                    <label
                      key={reason}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                        selectedReason === reason
                          ? 'border-rose-500 bg-rose-50/50 text-slate-900 font-medium'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        checked={selectedReason === reason}
                        onChange={() => setSelectedReason(reason)}
                        className="mt-0.5 text-rose-600 focus:ring-rose-500"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional Details (Optional)
                </label>
                <textarea
                  rows={2}
                  value={additionalDetails}
                  onChange={e => setAdditionalDetails(e.target.value)}
                  placeholder="Provide any context that helps campus moderators..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none"
                />
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
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 mx-auto bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Thank You for Your Report</h3>
              <p className="text-xs text-slate-600">
                This item has been flagged. Our campus moderation filter has recorded the incident.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors mt-2"
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
