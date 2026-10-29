import React, { useState } from 'react';
import { Item, MatchAlert } from '../types';
import { getStoredAlerts, addAlert, removeAlert } from '../utils/storage';
import { CATEGORY_INFO } from '../data/campusLocations';
import { Bell, Plus, Trash2, CheckCircle2, Sparkles, X, AlertCircle } from 'lucide-react';

interface MatchAlertsModalProps {
  items: Item[];
  onClose: () => void;
  onSelectItem: (item: Item) => void;
}

export const MatchAlertsModal: React.FC<MatchAlertsModalProps> = ({
  items,
  onClose,
  onSelectItem
}) => {
  const [alerts, setAlerts] = useState<MatchAlert[]>(getStoredAlerts());
  const [keyword, setKeyword] = useState('');
  const [type, setType] = useState<'lost' | 'found'>('lost');
  const [category, setCategory] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    const newAlert = addAlert(keyword.trim(), type, category);
    setAlerts(getStoredAlerts());
    setKeyword('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    const next = removeAlert(id);
    setAlerts(next);
  };

  // Find matching items for an alert
  const getMatchingItemsForAlert = (alert: MatchAlert): Item[] => {
    const kw = alert.keyword.toLowerCase();
    const oppositeType = alert.type === 'lost' ? 'found' : 'lost';

    return items.filter(item => {
      if (item.type !== oppositeType) return false;
      if (alert.category !== 'all' && item.category !== alert.category) return false;
      const combined = `${item.title} ${item.description}`.toLowerCase();
      return combined.includes(kw);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1 text-amber-100 text-xs font-semibold uppercase tracking-wider">
            <Bell className="w-4 h-4" />
            Automatic Notifications
          </div>
          <h2 className="text-xl font-bold text-white">Campus Match Alerts</h2>
          <p className="text-xs text-amber-100 mt-1">
            Subscribe to keywords. Whenever someone posts an item that matches your description, you'll get immediate match alerts.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Add alert trigger or form */}
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-3 px-4 border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-50 rounded-xl text-amber-900 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create New Item Alert
            </button>
          ) : (
            <form
              onSubmit={handleAddAlert}
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in"
            >
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                Set Alert Criteria
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alert Me When Someone Posts:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('lost')}
                    className={`py-2 text-xs font-bold rounded-lg border text-center transition-all ${
                      type === 'lost'
                        ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    I lost an item (Alert on Found)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('found')}
                    className={`py-2 text-xs font-bold rounded-lg border text-center transition-all ${
                      type === 'found'
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    I found an item (Alert on Lost)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keyword or Item Name
                </label>
                <input
                  type="text"
                  required
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  placeholder="e.g. Sony WH-1000XM4, Hydro Flask, Toyota Keys..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category Filter
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="all">Any Category</option>
                  {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Save Alert
                </button>
              </div>
            </form>
          )}

          {/* Active Alerts List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Your Active Alert Monitors ({alerts.length})
            </h4>

            {alerts.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No active alerts. Add one above to be notified of matches!
              </div>
            ) : (
              alerts.map(alert => {
                const matchedItems = getMatchingItemsForAlert(alert);

                return (
                  <div
                    key={alert.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1 bg-amber-100 text-amber-700 rounded-md">
                          <Bell className="w-3.5 h-3.5" />
                        </span>
                        <span className="font-bold text-sm text-slate-900">"{alert.keyword}"</span>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                          Looking for {alert.type === 'lost' ? 'Found' : 'Lost'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDelete(alert.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                        title="Remove Alert"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Matched items indicator */}
                    {matchedItems.length > 0 ? (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          {matchedItems.length} active match
                          {matchedItems.length > 1 ? 'es' : ''} currently on board!
                        </div>
                        <div className="space-y-1.5">
                          {matchedItems.map(item => (
                            <button
                              key={item.id}
                              onClick={() => {
                                onSelectItem(item);
                                onClose();
                              }}
                              className="w-full text-left p-1.5 bg-white rounded-md border border-emerald-100 hover:border-emerald-300 text-xs flex items-center justify-between transition-colors group cursor-pointer"
                            >
                              <span className="font-medium text-slate-800 truncate mr-2 group-hover:text-emerald-700">
                                {item.title}
                              </span>
                              <span className="text-[10px] text-slate-400 shrink-0">
                                View Post →
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-slate-400" /> Monitoring campus posts continuously...
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
