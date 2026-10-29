import React, { useState } from 'react';
import { MessageThread } from '../types';
import { getStoredMessages, saveMessages, getCurrentUser } from '../utils/storage';
import {
  MessageSquare,
  Send,
  X,
  User,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface MessagesDrawerProps {
  onClose: () => void;
  onOpenItem?: (itemId: string) => void;
}

export const MessagesDrawer: React.FC<MessagesDrawerProps> = ({ onClose, onOpenItem }) => {
  const [threads, setThreads] = useState<MessageThread[]>(getStoredMessages());
  const [activeThreadId, setActiveThreadId] = useState<string>(threads[0]?.id || '');
  const [replyText, setReplyText] = useState('');
  const currentUser = getCurrentUser();

  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeThread) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user' as const,
      text: replyText.trim(),
      timestamp: Date.now()
    };

    const updated = threads.map(t => {
      if (t.id === activeThread.id) {
        return {
          ...t,
          messages: [...t.messages, newMsg],
          unread: false
        };
      }
      return t;
    });

    setThreads(updated);
    saveMessages(updated);
    setReplyText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white shrink-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold">Campus Message Center</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Private inquiries and item recovery chats without sharing personal numbers.
          </p>
        </div>

        {/* Content area: Sidebar + Chat Thread */}
        <div className="flex-1 flex overflow-hidden">
          {/* Threads list */}
          <div className="w-1/3 border-r border-slate-200 bg-slate-50 flex flex-col overflow-y-auto">
            <div className="p-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              Conversations ({threads.length})
            </div>
            {threads.length === 0 ? (
              <div className="p-4 text-xs text-slate-400 text-center">No active chats</div>
            ) : (
              threads.map(thread => {
                const isSelected = thread.id === activeThread?.id;
                const lastMsg = thread.messages[thread.messages.length - 1];

                return (
                  <button
                    key={thread.id}
                    onClick={() => setActiveThreadId(thread.id)}
                    className={`p-3 text-left border-b border-slate-200/80 transition-colors w-full cursor-pointer ${
                      isSelected
                        ? 'bg-white border-l-4 border-l-blue-600 shadow-xs'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-semibold text-xs text-slate-900 truncate">
                      {thread.itemTitle}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {thread.senderName}
                    </div>
                    {lastMsg && (
                      <div className="text-[10px] text-slate-400 truncate mt-1">
                        {lastMsg.text}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Active Chat Conversation */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            {activeThread ? (
              <>
                {/* Thread top bar */}
                <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 shrink-0">
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 truncate">
                      {activeThread.itemTitle}
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      With {activeThread.recipientEmail} & {activeThread.senderName}
                    </p>
                  </div>
                  {onOpenItem && (
                    <button
                      onClick={() => onOpenItem(activeThread.itemId)}
                      className="px-2.5 py-1 text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded-lg transition-colors shrink-0"
                    >
                      View Post
                    </button>
                  )}
                </div>

                {/* Messages stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                  {activeThread.messages.map(msg => {
                    const isSelf = msg.sender === 'user';

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs ${
                            isSelf
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                          }`}
                        >
                          <p className="leading-relaxed">{msg.text}</p>
                          {msg.suggestedMeetingSpot && (
                            <div
                              className={`mt-2 pt-2 border-t text-[11px] flex items-center gap-1.5 ${
                                isSelf
                                  ? 'border-blue-500/50 text-blue-100'
                                  : 'border-slate-100 text-blue-700 font-medium'
                              }`}
                            >
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span>Meeting Spot: {msg.suggestedMeetingSpot}</span>
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Input area */}
                <form
                  onSubmit={handleSendReply}
                  className="p-3 border-t border-slate-200 bg-white flex items-center gap-2 shrink-0"
                >
                  <input
                    type="text"
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type safe reply..."
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
                Select a message to view conversation
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
