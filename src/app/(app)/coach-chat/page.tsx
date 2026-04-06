'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CoachChat from '@/components/CoachChat';
import axios from '@/lib/api/axios';
import { MessageSquare, Plus, Trash2, Menu, X } from 'lucide-react';
import clsx from 'clsx';

export default function CoachChatPage() {
  const DEFAULT_GREETING = {
    sender: 'coach',
    text: 'Chào bạn! Mình là Lemon. Báo cáo Tình trạng Sức khỏe của bạn hôm nay nhé!'
  };

  const [messages, setMessages] = useState<any[]>([DEFAULT_GREETING]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const [sessions, setSessions] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Fetch Session History
  const fetchSessions = async () => {
    try {
      setLoadingHistory(true);
      const res = await axios.get('/coach/sessions');
      setSessions(res.data.data);
    } catch (err) {
      console.error("Failed to load sessions", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const loadSession = async (id: string) => {
    try {
      const res = await axios.get(`/coach/sessions/${id}`);
      const sessionData = res.data.data;
      
      const loadedMessages = sessionData.messages.map((m: any) => ({
         sender: m.role === 'assistant' ? 'coach' : 'user',
         text: m.content
      }));

      setMessages(loadedMessages);
      setSessionId(sessionData.id);
      setIsSidebarOpen(false); // Close sidebar on mobile
    } catch (e) {
      console.error('Failed to load specific session');
    }
  };

  const deleteSession = async (id: string, e: any) => {
    e.stopPropagation();
    if (!confirm('Bạn chắc chắn muốn xoá cuộc trò chuyện này?')) return;
    try {
      await axios.delete(`/coach/sessions/${id}`);
      setSessions(prev => prev.filter(s => s.id !== id));
      if (sessionId === id) startNewChat();
    } catch (err) {
      alert("Xoá thất bại");
    }
  };

  const startNewChat = () => {
    setSessionId(null);
    setMessages([DEFAULT_GREETING]);
    setIsSidebarOpen(false);
  };

  const handleSendMessage = async (text: string) => {
    // 1. Add user msg
    setMessages(prev => [...prev, { sender: 'user', text }]);
    // 2. Mock thinking
    setMessages(prev => [...prev, { sender: 'coach', text: '...', isTyping: true }]);

    try {
      // Create message array for the API (assuming full history sent for stateless logic)
      const chatHistory = messages.filter(m => !m.isTyping).map(m => ({
        role: m.sender === 'coach' ? 'assistant' : 'user',
        content: m.text
      }));
      chatHistory.push({ role: 'user', content: text });

      const { data } = await axios.post('/coach/chat', { messages: chatHistory, sessionId });
      const reply = data.data; // Expected { reply: "...", actions_today: [], warning: false }
      
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
        fetchSessions(); // Refresh sidebar with new chat
      }

      setMessages(prev => {
        const base = prev.slice(0, -1);
        return [...base, { sender: 'coach', text: reply.reply }];
      });
    } catch (e: any) {
      setMessages(prev => {
        const base = prev.slice(0, -1);
        return [...base, { sender: 'coach', text: `Lỗi: ${e.response?.data?.error || e.message}` }];
      });
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] w-full max-w-6xl mx-auto overflow-hidden rounded-3xl bg-slate-50 border border-slate-200/60 shadow-sm relative">
      
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden absolute top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-md text-slate-600"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* History Sidebar */}
      <div className={clsx(
        "absolute md:relative z-40 bg-slate-50 md:bg-transparent h-full w-72 flex-shrink-0 border-r border-slate-200/60 flex flex-col transition-transform duration-300",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-4 border-b border-slate-200/60 pt-16 md:pt-4">
          <button 
            onClick={startNewChat}
            className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 justify-center transition-colors shadow-sm"
          >
            <Plus size={18} /> Chat mới
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-hide">
          <p className="text-xs font-bold text-slate-400 px-2 py-2 tracking-wider uppercase">Lịch sử của bạn</p>
          
          {loadingHistory ? (
             <div className="text-center text-slate-400 text-sm mt-4">Đang tải...</div>
          ) : sessions.length === 0 ? (
             <div className="text-center text-slate-400 text-sm mt-4">Chưa có dữ liệu</div>
          ) : (
            sessions.map(session => (
              <div 
                key={session.id}
                onClick={() => loadSession(session.id)}
                className={clsx(
                  "group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors border",
                  sessionId === session.id 
                    ? "bg-white border-teal-200 shadow-sm" 
                    : "border-transparent hover:bg-slate-200/50"
                )}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <MessageSquare size={16} className={sessionId === session.id ? "text-teal-500" : "text-slate-400"} />
                  <span className={clsx(
                    "text-sm truncate pr-2 font-medium",
                    sessionId === session.id ? "text-teal-800" : "text-slate-600"
                  )}>
                    {session.title?.substring(0, 26) + (session.title?.length > 26 ? '...' : '')} 
                  </span>
                </div>
                <button 
                  onClick={(e) => deleteSession(session.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 min-w-0 bg-white relative">
        <CoachChat messages={messages} onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
